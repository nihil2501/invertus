export const whenHostnameValid = (
  rawUrl: string | undefined,
  callback: (hostname: string) => Promise<void>,
) => {
  if (!rawUrl) return;
  const url = new URL(rawUrl);

  for (const { value, property } of URL_INVALID_RULES) {
    if (url[property] === value) return;
  }

  callback(url.hostname);
};

const URL_INVALID_RULES: Array<{
  property: "hostname" | "protocol";
  value: string;
}> = [
  { property: "hostname", value: "ogs.google.com" },
  { property: "protocol", value: "chrome:" },
  { property: "protocol", value: "about:" },
];
