export const Store = {
  refresh(v: string) {
    return update(OP.REFRESH, v);
  },

  remove(v: string) {
    return update(OP.REMOVE, v);
  },

  async get() {
    const valuesRaw = await getRaw();
    const values = valuesRaw.split(VALUE_DELIMITER);
    values.shift();
    return values;
  },
};

/*******************************************************************************
 *                                                                             *
 *                                   HELPERS                                   *
 *                                                                             *
 ******************************************************************************/

const update = async (op: Op, value: string) => {
  let valuesRaw = await getRaw();
  const valueRaw = `${VALUE_DELIMITER}${value}`;
  valuesRaw = valuesRaw.split(valueRaw).join("");

  if (OP.REFRESH === op) {
    valuesRaw = valueRaw + valuesRaw;

    if (valuesRaw.length > VALUES_LENGTH_MAX) {
      const end = valuesRaw.lastIndexOf(VALUE_DELIMITER, VALUES_LENGTH_MAX);
      valuesRaw = valuesRaw.slice(0, end);
    }
  }

  await setRaw(valuesRaw);
};

const getRaw = () => storage.getItem(KEY, { fallback: "" });
const setRaw = (values: string) => storage.setItem(KEY, values);

type Op = keyof typeof OP;
const OP = { REFRESH: "REFRESH", REMOVE: "REMOVE" } as const;

const KEY: StorageItemKey = "sync:hostnames";
const VALUES_LENGTH_MAX = 8_192 / 2; // Half; just to be safe.
const VALUE_DELIMITER = ",";
