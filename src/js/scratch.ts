namespace Mode {
  type Event<T extends Function> = chrome.events.Event<T>;
  type Permissions = chrome.permissions.Permissions;

  type EventListener<T extends Function> = {
    event: Event<T>;
    listener: T
  }

  type GetEventListeners = () => EventListener<Function>[];

  type PromotingMode = {
    getEventListeners: GetEventListeners;
    mode: Mode;
  }

  export class Mode {
    protected readonly requiredPermissions: Permissions;
    protected readonly getEventListeners: GetEventListeners;
    protected readonly promotingMode: PromotingMode;
  }
}
