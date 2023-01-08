export default class Mode {
  constructor({ additionalRequiredPermissions, getEventListeners }) {
    // `additionalRequiredPermissions` in the sense that we're assuming that
    // once we're asking this question of this `Mode`, any other permission
    // requirements have already been determined to have been met.
    this.additionalRequiredPermissions = additionalRequiredPermissions;
    this.getEventListeners = getEventListeners;
  }

  ensureListenersAdded() {
    this.removeListeners();
    this.#modifyListeners("addListener");
  }

  removeListeners() {
    this.#modifyListeners("removeListener");
  }

  #modifyListeners(method) {
    for (const eventListener of this.getEventListeners()) {
      eventListener.event[method](
        eventListener.listener
      );
    }
  }

  permittedBy(permissions) {
    return (
      this.#typePermittedBy("origins", permissions) &&
        this.#typePermittedBy("permissions", permissions)
    );
  }

  #typePermittedBy(type, permissions) {
    return this.additionalRequiredPermissions[type].every((permission) => {
      return permissions[type].includes(permission);
    });
  }
}
