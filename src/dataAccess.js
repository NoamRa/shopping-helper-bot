import fs from "node:fs/promises";

export async function Dao(dbPath) {
  try {
    await fs.stat(dbPath);
  } catch (err) {
    if (err.message.includes("no such file or directory"))
      await fs.writeFile(dbPath, JSON.stringify({ list: [] }));
    else {
      throw err;
    }
  }

  async function readDB() {
    return JSON.parse(await fs.readFile(dbPath, { encoding: "utf-8" }));
  }

  async function writeDB(data) {
    if (typeof data === "object") {
      data = JSON.stringify(data, null, 2);
    }
    await fs.writeFile(dbPath, data, { encoding: "utf-8" });
  }

  function createEntry({ item, quantity = 1 }) {
    return { item, quantity };
  }

  return {
    list: async () => {
      const { list } = await readDB();
      console.log(list);
      if (list.length === 0) return "List is empty, nothing to buy! 🎉";

      return list.map((entry) => `${entry.quantity} ${entry.item}`).join(" \n");
    },
    addEntry: async (item, quantity) => {
      const entry = createEntry({ item, quantity });
      const data = await readDB();
      await writeDB({ list: [...data.list, entry] });
    },
  };
}
