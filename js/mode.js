export default
  class Mode {
    constructor({
      requiredPermissions,
      getEventListeners,
      promotingMode,
    }) {
      this.requiredPermissions = requiredPermissions;

      // This is a function returning a static array of objects because some
      // properties won't exist when called too early--before requisite
      // permissions granted.
      this.getEventListeners = getEventListeners;

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
      this.promotingMode = promotingMode;
    }

    reconcile(permissions, initial) {
      this.initial = initial;
      console.debug("reconciling permissions", permissions);

      const promotingModePermitted = this.#reconcilePromotingMode(permissions);
      if (!promotingModePermitted) {
        return false;
      }

      const permitted = this.#permittedBy(permissions);
      console.debug("permitted", permitted);

      this.#expressMobility({ promoting: !permitted });
      return permitted;
    }

    #reconcilePromotingMode(permissions) {
      return !this.promotingMode ||
        this.promotingMode.mode.reconcile(
          permissions,
          this.initial
        );
    }

    #permittedBy(permissions) {
      const typePermittedBy =
        (type, permissions) => {
          return this.requiredPermissions[type].every((permission) => {
            return permissions[type].includes(permission);
          });
        };

      return (
        typePermittedBy("origins", permissions) &&
          typePermittedBy("permissions", permissions)
      );
    }

    #expressMobility({ promoting }) {
      this.#replaceEventListeners(
        this.initial && promoting ?
          this.promotingMode.getEventListeners() :
          this.#getAllEventListeners(),
        { withNothing: promoting },
      );

      this.#replaceEventListeners(
        this.#getPromotingEventListeners(),
        { withNothing: !promoting },
      );
    }

    #replaceEventListeners(eventListeners, { withNothing }) {
      for (const { event, listener } of eventListeners) {
        console.debug("remove listener", listener);
        event.removeListener(listener);

        if (!withNothing) {
          console.debug("add listener", listener);
          event.addListener(listener);
        }
      }
    }

    #getAllEventListeners() {
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

    #getPromotingEventListeners() {
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

    #wrapPromotingListener(listener) {
      return async (...args) => {
        console.debug("requesting permissions", this.requiredPermissions);

        const granted =
          await chrome.permissions.request(
            this.requiredPermissions,
          );

        if (granted) {
          // listener(...args);
          chrome.tabs.reload(); // would want to `update true`. probably need to
          // specify the behavior on the promoting listener.
        }
      };    
    }
  }
