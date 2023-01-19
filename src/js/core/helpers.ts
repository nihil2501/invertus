/* eslint-disable import/prefer-default-export */

const urlInvalidRules = [
  { property: 'hostname', value: 'ogs.google.com' },
  { property: 'protocol', value: 'chrome:' },
  { property: 'protocol', value: 'about:' },
];

export const whenHostnameValid =
  (rawURL: string, callback: (hostname: string) => void) => {
    const url = new URL(rawURL);
    const isInvalid =
      urlInvalidRules.some((rule) => {
        return url[rule.property as keyof URL] === rule.value;
      });

    if (!isInvalid) {
      callback(url.hostname);
    }
  };
