type EventListener<T extends Function> = {
  event: chrome.events.Event<T>;
  listener: T;
};

type GetEventListeners = () => EventListener<Function>[];

type PromotingMode = {
  getEventListeners: GetEventListeners;
  mode: Mode;
};

type Configuration = {
  requiredPermissions: chrome.permissions.Permissions;
  getEventListeners: GetEventListeners;
  promotingMode?: PromotingMode;
};

export default class Mode {
  protected readonly requiredPermissions!: chrome.permissions.Permissions;

  // This is a function returning a static array of objects because some
  // properties won't exist when called too early--before requisite
  // permissions granted.
  protected readonly getEventListeners!: GetEventListeners;

  // Signifies that this mode is a promoted version of another mode. It will
  // have more features and therefore in general will require more
  // permissions.
  //
  // The other mode is identified by the `mode` property.
  //
  // The `getEventListeners` property refers to features that belong to the
  // promoted mode but that should be included in the promoting mode in a
  // wrapped form whereby they request requisite permissions and carry out
  // their underlying behavior if granted.
  // Then, going forward, as a consequence of a reaction to permission change
  // events, the promoted behavior gets installed while the promoting
  // behavior is uninstalled.
  //
  // Be mindful that `promotingMode.mode.getEventListeners` and
  // `promotingMode.getEventListeners` are distinct concepts.
  protected readonly promotingMode?: PromotingMode;

  // Just for memoization.
  protected allEventListeners!: EventListener<Function>[];

  // Just for memoization.
  protected promotingEventListeners!: EventListener<Function>[];

  constructor(configuration: Configuration) {
    Object.assign(this, configuration);
  }

  reconcile(
    permissions: chrome.permissions.Permissions,
    // TODO: remove `initial` hack by more accurately modeling `Mode`. We'd want
    // to tie specific permissions to specific behaviors requiring them. For
    // now we can not be that accurate.
    initial: boolean
  ) {
    console.debug("reconciling permissions", permissions);

    const promotingModePermitted = this.#reconcilePromotingMode(
      permissions,
      initial
    );

    if (!promotingModePermitted) {
      return false;
    }

    const permitted = this.#permittedBy(permissions);
    console.debug("permitted", permitted);

    this.#expressMobility({ promoting: !permitted, initial });
    return permitted;
  }

  #reconcilePromotingMode(
    permissions: chrome.permissions.Permissions,
    initial: boolean
  ) {
    return (
      !this.promotingMode ||
      this.promotingMode.mode.reconcile(permissions, initial)
    );
  }

  #permittedBy(permissions: chrome.permissions.Permissions) {
    return (
      Mode.typePermittedBy(
        this.requiredPermissions.origins,
        permissions.origins
      ) &&
      Mode.typePermittedBy(
        this.requiredPermissions.permissions,
        permissions.permissions
      )
    );
  }

  #expressMobility({
    promoting,
    initial,
  }: {
    promoting: boolean;
    initial: boolean;
  }) {
    // TODO: remove this after tighter modeling. Right now it just avoids
    // invoking unpermitted APIs. And the only such things are during initial
    // setup for the full-mode feature set. (Namely web nav oncommitted before
    // granting web nav).
    if (!(initial && promoting)) {
      Mode.replaceEventListeners(this.#getAllEventListeners(), {
        withNothing: promoting,
      });
    }

    Mode.replaceEventListeners(this.#getPromotingEventListeners(), {
      withNothing: !promoting,
    });
  }

  #getAllEventListeners() {
    if (!this.allEventListeners) {
      this.allEventListeners = this.getEventListeners();

      if (this.promotingMode) {
        this.allEventListeners.push(...this.promotingMode.getEventListeners());
      }
    }

    return this.allEventListeners;
  }

  #getPromotingEventListeners() {
    if (!this.promotingEventListeners) {
      this.promotingEventListeners = [];

      if (this.promotingMode) {
        const eventListeners = this.promotingMode.getEventListeners();

        eventListeners.forEach(({ event, listener }) => {
          const promotingListener = this.#wrapPromotingListener(listener);

          this.promotingEventListeners.push({
            listener: promotingListener,
            event,
          });
        });
      }
    }

    return this.promotingEventListeners;
  }

  #wrapPromotingListener(listener: Function) {
    return async (...args: any[]) => {
      console.debug("requesting permissions", this.requiredPermissions);

      const granted = await chrome.permissions.request(
        this.requiredPermissions
      );

      if (granted) {
        // Probably acceptable edge case where we re-promote on persisted will
        // appear to 'silently' unpersist.
        listener(...args);
      }
    };
  }

  static replaceEventListeners<T extends Function>(
    eventListeners: EventListener<T>[],
    { withNothing }: { withNothing: boolean }
  ) {
    eventListeners.forEach(({ event, listener }) => {
      console.debug("remove listener", listener);
      event.removeListener(listener);

      if (!withNothing) {
        console.debug("add listener", listener);
        event.addListener(listener);
      }
    });
  }

  static typePermittedBy(required: string[] = [], provided: string[] = []) {
    return required.every((permission: string) => {
      return provided.includes(permission);
    });
  }
}
