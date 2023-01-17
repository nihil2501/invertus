/// <reference types="chrome" />

declare namespace chrome.permissions {
    /**
     * Requests access to the specified permissions. These permissions must be defined in the optional_permissions field of the manifest. If there are any problems requesting the permissions, runtime.lastError will be set.
     * @return A Promise that resolves with a boolean indicating whether or not the user granted the specified permissions.
     */
    export function request(permissions: Permissions): Promise<boolean>;
}
