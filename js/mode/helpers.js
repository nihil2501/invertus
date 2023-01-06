export const whenHostnameValid = (url, callback) => {
  url = new URL(url);
  for (const rule of urlInvalidRules) {
    if (url[rule.property] === rule.value) {
      return;
    }
  }

  callback(url.hostname);
};

const urlInvalidRules = [
  { property: "hostname", value: "ogs.google.com" },
  { property: "protocol", value: "chrome:" },
  { property: "protocol", value: "about:" },
];
