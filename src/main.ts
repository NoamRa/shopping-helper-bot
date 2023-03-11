import { join, resolve } from "https://deno.land/std@0.179.0/path/mod.ts";

import { Telegraf, Context } from "https://dev.jspm.io/telegraf";
import { message } from "https://dev.jspm.io/telegraf/filters";
type TContext = typeof Context;

import { BOT_TOKEN } from "./config.ts";
import { Dao } from "./dataAccess.ts";
import { withAuth } from "./withAuth.ts";

(async function main() {
  const dao = await Dao(join(resolve(), "db.json"));

  const bot = new Telegraf(BOT_TOKEN);

  bot.start((ctx: TContext) =>
    ctx.reply(
      "Hi, I'm Shopping Helper bot. 👋🏼\nType /help for list of commands.",
    ),
  );

  bot.help((ctx: TContext) =>
    ctx.reply(
      [
        "/list all items to buy",
        "/add entry. eg: `/add tofu` or `/add 3 carrots`",
      ].join("\n"),
    ),
  );

  bot.command(
    "list",
    withAuth(async (ctx: TContext) => {
      const list = await dao.list();
      ctx.reply(list);
    }),
  );

  bot.command(
    "add",
    withAuth(async (ctx: TContext) => {
      const [_command, ...text] = ctx.message.text.split(" ");
      if (text.length === 0) {
        ctx.reply("/add entry. eg: `/add tofu` or `/add 3 carrots`");
        return;
      }

      let [quantity, ...rest] = text;

      let item;
      try {
        quantity = JSON.parse(quantity);
      } catch (_err: unknown) {
        // console.error(_err); // possible if text is `/add foo`
      }

      if (typeof quantity === "number") {
        item = rest.join(" ");
      } else {
        quantity = 1;
        item = text.join(" ");
      }
      if (item === "") {
        ctx.reply(`${quantity} of what?`);
        return;
      }

      await dao.addEntry(item, quantity);
      ctx.reply(`adding ${quantity} of ${item}`);
    }),
  );

  // bot.command("me", (ctx) =>
  //   ctx.reply(`you are ${JSON.stringify(ctx.message.from, null, 2)}`),
  // );

  bot.on(message("text"), async (ctx: TContext) => {
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
