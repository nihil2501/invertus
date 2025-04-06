export const refresh = (value: string) => {
  return operate(OPERATION.REFRESH, value);
};

export const remove = (value: string) => {
  return operate(OPERATION.REMOVE, value);
};

export const get = () => {
  return storage.getItem(KEY, { fallback: "" });
};

const set = (values: string) => {
  return storage.setItem(KEY, values);
};

const OPERATION = {
  REFRESH: "REFRESH",
  REMOVE: "REMOVE",
} as const;

type Operation = keyof typeof OPERATION;

const KEY: `${StorageItemKey}-${typeof EXTENSION_ID}` = `sync:hostnames-${EXTENSION_ID}`;

// https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync
const VALUES_LENGTH_MAX = 8_192;
const VALUE_DELIMITER = ",";

const operate = async (operation: Operation, value: string) => {
  let values = await get();
  const valueDelimited = `${VALUE_DELIMITER}${value}`;
  values = values.split(valueDelimited).join("");

  if (OPERATION.REFRESH === operation) {
    values = valueDelimited + values;

    if (values.length > VALUES_LENGTH_MAX) {
      const end = values.lastIndexOf(VALUE_DELIMITER, VALUES_LENGTH_MAX);
      values = values.slice(0, end);
    }
  }

  await set(values);
};
