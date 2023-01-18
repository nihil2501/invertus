/// <reference types="chrome" />

declare namespace chrome.permissions {
  /**
   * Requests access to the specified permissions. These permissions must be defined in the optional_permissions field of the manifest. If there are any problems requesting the permissions, runtime.lastError will be set.
   * @return A Promise that resolves with a boolean indicating whether or not the user granted the specified permissions.
   */
  export function request(permissions: Permissions): Promise<boolean>;
  /**
   * Gets the extension's current set of permissions.
   * @return A Promise that resolves with the extension's active permissions.
   */
  export function getAll(): Promise<Permissions>;
}

// https://github.com/parcel-bundler/parcel/discussions/5194
declare module 'url:*' {
  export default string;
}