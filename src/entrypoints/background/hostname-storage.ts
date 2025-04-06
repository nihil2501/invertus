export const refresh = (value: string) => {
  return operate(OPERATION.REFRESH, value);
};

export const remove = (value: string) => {
  return operate(OPERATION.REMOVE, value);
};

const OPERATION = {
  REFRESH: "REFRESH",
  REMOVE: "REMOVE",
} as const;

type Operation = keyof typeof OPERATION;

const KEY: `${StorageItemKey}-${typeof EXTENSION_ID}` = `sync:hostnames-${EXTENSION_ID}`;
const VALUE_DELIMITER = ",";

// https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync
const VALUES_LENGTH_MAX = 8_192;

const operate = async (operation: Operation, value: string) => {
  const valueDelimited = `${VALUE_DELIMITER}${value}`;

  let values = await storage.getItem(KEY, { fallback: "" });
  values = values.split(valueDelimited).join("");

  if (OPERATION.REFRESH === operation) {
    values = valueDelimited + values;
    if (values.length > VALUES_LENGTH_MAX) {
      const end = values.lastIndexOf(VALUE_DELIMITER, VALUES_LENGTH_MAX);
      values = values.slice(0, end);
    }
  }

  await storage.setItem(KEY, values);

  // TODO: Remove.
  console.debug({ values: await storage.getItem(KEY) });
};
