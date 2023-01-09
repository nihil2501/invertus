export default class Mode {
  constructor({ requiredPermissions, getEventListeners, inheritedMode }) {
    this.requiredPermissions = requiredPermissions;
    this.getEventListeners = getEventListeners;
    this.inheritedMode = inheritedMode;
  }

  reconcile(permissions) {
    const inheritedModeReconciled =
      this.inheritedMode === undefined ||
        this.inheritedMode.reconcile(permissions);

    if (!inheritedModeReconciled) { return false; }
    if (!this.#permittedBy(permissions)) { return false; }

    this.#ensureListenersAdded();    
    return true;
  }

  #ensureListenersAdded() {
    for (const eventListener of this.getEventListeners()) {
      eventListener.event.removeListener(
        eventListener.listener
      );

      eventListener.event.addListener(
        eventListener.listener
      );
    }
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
}
