import { Context } from "https://dev.jspm.io/telegraf";
type TContext = typeof Context;

import { ALLOWED } from "./config.ts";

export function withAuth(fn: (...args: unknown[]) => void) {
  return function (...args: unknown[]) {
    const [ctx] = args;
    if (!isContext(ctx)) {
      throw new Error("withAuth must be called with context");
    }

    const user = ctx.update.message.from;
    if (!ALLOWED.includes(user.id)) {
      console.log({ reply: typeof ctx.reply, ALLOWED });
      ctx.reply(
        `I'm sorry, ${user.first_name}, I'm afraid I can't do that. 🛑`,
      );
      return;
    }

    return fn(...args);
  };
}

function isContext(ctx: TContext): ctx is TContext {
  return (
    ctx.constructor.name.includes("Context") &&
    ctx.update &&
    ctx.telegram.constructor.name.includes("Telegram")
  );
}
