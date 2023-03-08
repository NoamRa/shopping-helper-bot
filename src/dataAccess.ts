type Entry = {
  item: string;
  quantity: number;
};

type DB = {
  list: Entry[];
};

export async function Dao(dbPath: string) {
  try {
    await Deno.readTextFile(dbPath);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "NotFound")
      await Deno.writeTextFile(dbPath, JSON.stringify({ list: [] }));
    else {
      throw err;
    }
  }

  async function readDB() {
    return JSON.parse(await Deno.readTextFile(dbPath));
  }

  async function writeDB(data: DB | string) {
    if (typeof data === "object") {
      data = JSON.stringify(data, null, 2);
    }
    await Deno.writeTextFile(dbPath, data);
  }

  function createEntry({ item, quantity = 1 }: Entry) {
    return { item, quantity };
  }

  return {
    list: async () => {
      const { list } = await readDB();
      console.log(list);
      if (list.length === 0) return "List is empty, nothing to buy! 🎉";

      return list
        .map((entry: Entry) => `${entry.quantity} ${entry.item}`)
        .join(" \n");
    },
    addEntry: async (item: Entry["item"], quantity: Entry["quantity"]) => {
      const entry = createEntry({ item, quantity });
      const data = await readDB();
      await writeDB({ list: [...data.list, entry] });
    },
  };
}
