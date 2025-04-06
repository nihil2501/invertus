export const getHostname = (url?: string) => {
  if (!url) return;

  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "http:" && protocol !== "https:") return;

    return hostname;
  } catch (e) {
    if (e instanceof TypeError) return;
    throw e;
  }
};

export const getHostnamePattern = (hostname: string) => {
  return `*://${hostname}/*`;
};
