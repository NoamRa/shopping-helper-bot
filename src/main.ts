import path from "node:path";

import { Telegraf } from "npm:telegraf";
import { message } from "npm:telegraf/filters";

import { BOT_TOKEN } from "./config.ts";
import { Dao } from "./dataAccess.ts";
import { withAuth } from "./withAuth.ts";

(async function main() {
  const dao = await Dao(path.join(path.resolve(), "db.json"));

  let bot;
  try {
    bot = new Telegraf(BOT_TOKEN);
  } catch (error) {
    console.error(error);
  }

  bot.start((ctx) =>
    ctx.reply(
      "Hi, I'm Shopping Helper bot. 👋🏼\nType /help for list of commands.",
    ),
  );

  bot.help((ctx) =>
    ctx.reply(
      [
        "/list all items to buy",
        "/add entry. eg: `/add tofu` or `/add 3 carrots`",
      ].join("\n"),
    ),
  );

  bot.command(
    "list",
    withAuth(async (ctx) => {
      const list = await dao.list();
      ctx.reply(list);
    }),
  );

  bot.command(
    "add",
    withAuth(async (ctx) => {
      const [_command, ...text] = ctx.message.text.split(" ");
      if (text.length === 0)
        return ctx.reply("/add entry. eg: `/add tofu` or `/add 3 carrots`");

      let [quantity, ...rest] = text;

      let item;
      try {
        quantity = JSON.parse(quantity);
      } catch (err) {
        console.error(err);
      }

      if (typeof quantity === "number") {
        item = rest.join(" ");
      } else {
        quantity = 1;
        item = text.join(" ");
      }
      if (item === "") return ctx.reply(`${quantity} of what?`);

      await dao.addEntry(item, quantity);
      return ctx.reply(`adding ${quantity} of ${item}`);
    }),
  );

  // bot.command("me", (ctx) =>
  //   ctx.reply(`you are ${JSON.stringify(ctx.message.from, null, 2)}`),
  // );

  bot.on(message("text"), async (ctx) => {
    await ctx.reply(
      `Hello ${ctx.message.from.username}. I'm not sure what does '${ctx.message.text}' means...`,
    );
  });

  bot.launch();

  // Enable graceful stop
  Deno.addSignalListener("SIGINT", () => bot.stop("SIGINT"));
  Deno.build.os === "windows"
    ? Deno.addSignalListener("SIGBREAK", () => bot.stop("SIGBREAK"))
    : Deno.addSignalListener("SIGTERM", () => bot.stop("SIGTERM"));

  console.log("Shopping Helper Bot listening...");
})();