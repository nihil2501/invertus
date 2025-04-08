export const Hostnames = {
  refresh(value: string) {
    return update(OPERATION.REFRESH, value);
  },

  remove(value: string) {
    return update(OPERATION.REMOVE, value);
  },

  async get() {
    const valuesRaw = await getRaw();
    const values = valuesRaw.split(VALUE_DELIMITER);
    values.shift();
    return values;
  },
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

const update = async (operation: Operation, value: string) => {
  let valuesRaw = await getRaw();
  const valueRaw = `${VALUE_DELIMITER}${value}`;
  valuesRaw = valuesRaw.split(valueRaw).join("");

  if (OPERATION.REFRESH === operation) {
    valuesRaw = valueRaw + valuesRaw;

    if (valuesRaw.length > VALUES_LENGTH_MAX) {
      const end = valuesRaw.lastIndexOf(VALUE_DELIMITER, VALUES_LENGTH_MAX);
      valuesRaw = valuesRaw.slice(0, end);
    }
  }

  await setRaw(valuesRaw);
};

const getRaw = () => {
  return storage.getItem(KEY, { fallback: "" });
};

const setRaw = (values: string) => {
  return storage.setItem(KEY, values);
};
