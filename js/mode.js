export default
  class Mode {
    constructor({
      requiredPermissions,
      getEventListeners,
      promotingMode
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
      this.promotingMode = promotingMode;
    }

    reconcile(permissions) {
      if (!this.#reconcilePromotingMode(permissions)) {
        return false;
      }

      if (!this.#permittedBy(permissions)) {
        this.#replaceEventListeners(
          this.#getPromotingEventListeners(),
        );

        return false;
      }

      this.#replaceEventListeners(
        this.#getPromotingEventListeners(),
        { withNothing: true },
      );

      this.#replaceEventListeners(
        this.#getAllEventListeners(),
      );

      return true;
    }

    #reconcilePromotingMode(permissions) {
      return !this.promotingMode ||
        this.promotingMode.mode.reconcile(
          permissions
        );
    }

    #permittedBy(permissions) {
      return (
        this.#typePermittedBy("origins", permissions) &&
          this.#typePermittedBy("permissions", permissions)
      );
    }

    #typePermittedBy(type, permissions) {
      return this.requiredPermissions[type].every((permission) => {
        return permissions[type].includes(permission);
      });
    }

    #replaceEventListeners(eventListeners, options = {}) {
      const { withNothing = false } = options;

      for (const { event, listener } of eventListeners) {
        event.removeListener(listener);
        if (!withNothing) {
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
        const granted =
          await chrome.permissions.request(
            this.requiredPermissions,
          );

        if (granted) {
          listener(...args);
        }
      };    
    }
  }
