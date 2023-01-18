const urlInvalidRules = [
  { property: "hostname", value: "ogs.google.com" },
  { property: "protocol", value: "chrome:" },
  { property: "protocol", value: "about:" },
];

export const whenHostnameValid =
  (rawURL: string, callback: (hostname: string) => void) => {
    const url = new URL(rawURL);
    for (const rule of urlInvalidRules) {
      if (url[rule.property as keyof URL] === rule.value) {
        return;
      }
    }

    callback(url.hostname);
  };
