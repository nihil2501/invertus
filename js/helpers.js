export const pipeline = (fns) => {
  return (memo) => {
    fns.forEach(fn => memo = fn(memo));
    return memo;
  }
};

export const normalizePayload = (propRenames) => {
  return (payload) => {
    const memo = {};
    for (const fromProp in payload) {
      const toProp = (
        fromProp in propRenames ?
          propRenames[fromProp] :
          fromProp
      );

      memo[toProp] = payload[fromProp];
    }

    return memo;
  };
};

export const validly = (callback) => {
  return ({ url, tabId }) => {
    const hostname = getHostname(url);
    if (hostname) {
      callback({ hostname, tabId });
    }
  };
};

const getHostname = (url) => {
  url = new URL(url);
  const urlInvalid = urlInvalidConditions.some((condition) => {
    return url[condition.property] === condition.value;
  });

  if (!urlInvalid) {
    return url.hostname;
  }
}

const urlInvalidConditions = [
  { property: "hostname", value: "ogs.google.com" },
  { property: "protocol", value: "chrome:" },
  { property: "protocol", value: "about:" },
];
