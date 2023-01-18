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
  protected promotingEventListeners!: EventListener<Function>[];

  constructor(configuration: Configuration) {
    Object.assign(this, configuration);
  }

  // TODO: remove `initial` hack by more accurately modeling `Mode`.
  reconcile(
    permissions: chrome.permissions.Permissions,
    initial: boolean
  ): boolean {
    console.debug("reconciling permissions", permissions);

    const promotingModePermitted = this.#reconcilePromotingMode(permissions, initial);
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
  ): boolean {
    return !this.promotingMode ||
      this.promotingMode.mode.reconcile(
        permissions,
        initial
      );
  }

  #permittedBy(permissions: chrome.permissions.Permissions): boolean {
    const typePermittedBy =
      (required: string[] = [], provided: string[] = []) => {
        return required.every((permission: string) => {
          return provided.includes(permission);
        });
      };


    return (
      typePermittedBy(
        this.requiredPermissions.origins,
        permissions.origins
      ) &&
      typePermittedBy(
        this.requiredPermissions.permissions,
        permissions.permissions
      )
    );
  }

  #expressMobility({ promoting, initial }: {
    promoting: boolean,
    initial: boolean
  }): void {
    // I think there will be some bug here, probably easy enough to rediscover.
    // Evidently why `initial` was passed.
    console.debug(initial);
    this.#replaceEventListeners(
      this.#getAllEventListeners(),
      { withNothing: promoting },
    );

    this.#replaceEventListeners(
      this.#getPromotingEventListeners(),
      { withNothing: !promoting },
    );
  }

  #replaceEventListeners<T extends Function>(
    eventListeners: EventListener<T>[],
    { withNothing }: { withNothing: boolean }
  ): void {
    for (const { event, listener } of eventListeners) {
      console.debug("remove listener", listener);
      event.removeListener(listener);

      if (!withNothing) {
        console.debug("add listener", listener);
        event.addListener(listener);
      }
    }
  }

  #getAllEventListeners(): EventListener<Function>[] {
    if (!this.allEventListeners) {
      this.allEventListeners = this.getEventListeners();

      if (this.promotingMode) {
        this.allEventListeners.push(
          ...this.promotingMode.getEventListeners()
        );
      }
    }

    return this.allEventListeners;
  }

  #getPromotingEventListeners(): EventListener<Function>[] {
    if (!this.promotingEventListeners) {
      this.promotingEventListeners = [];

      if (this.promotingMode) {
        const eventListeners = this.promotingMode.getEventListeners();

        for (let { event, listener } of eventListeners) {
          listener = this.#wrapPromotingListener(listener);

          this.promotingEventListeners.push({
            event: event,
            listener: listener,
          });
        }
      }
    }

    return this.promotingEventListeners;
  }

  #wrapPromotingListener(listener: Function): Function {
    return async (...args: any[]) => {
      console.debug("requesting permissions", this.requiredPermissions);

      const granted =
        await chrome.permissions.request(
          this.requiredPermissions,
        );

      if (granted) {
        // Would want to `update true`. Probably need to specify the behavior
        // on the promoting listener.
        // chrome.tabs.reload();

        listener(...args);
      }
    };    
  }
}
