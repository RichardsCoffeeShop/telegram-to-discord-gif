import { config } from "dotenv";

config();

import { Bot, Context } from "grammy";
import { WebhookClient } from "discord.js";
import { FileFlavor, hydrateFiles } from "@grammyjs/files";
import path from "path";
import { Converter } from "./converter";
import { unlink } from "fs/promises";
import { log, error } from "./logger";

type MyContext = FileFlavor<Context>;

const bot = new Bot<MyContext>(String(process.env.TELEGRAM_BOT_TOKEN));

bot.api.config.use(hydrateFiles(bot.token));

const filesPath: string = "./files";

bot.on([":video", ":animation", ":sticker", ":photo"], async (ctx) => {
  let filename: string | null = null;
  let filenameOutPut: string | null = null;

  try {
    await ctx.replyWithChatAction("typing");

    const file = await ctx.getFile();
    const extension = file.file_path?.split(".").pop();

    filename = getUUId() + "." + extension;

    filenameOutPut = getUUId() + ".gif";

    await file.download(path.resolve(getFilePath(filename)));

    const myConverter = new Converter(
      getFilePath(filename),
      getFilePath(filenameOutPut)
    );

    await myConverter.videoToGif();

    log(`Parsed file sent by ${ctx.from.username} (${ctx.from.id})`);

    await ctx.reply("✅ Done parsing file!");

    const client = new WebhookClient({ url: String(process.env.WEBHOOK) });

    await client.send({
      files: [
        {
          attachment: getFilePath(filenameOutPut),
          name: filenameOutPut,
        },
      ],
    });

    await ctx.reply(`✅ Sent file to Discord Webhook!`);
  } catch (e: any) {
    error("Error!", e);
    ctx.reply(
      `❌ Error: ${e.message || "unknown error. message developer please"}`
    );
  } finally {
    try {
      if (filenameOutPut) await unLinkFile(getFilePath(filenameOutPut));
      if (filename) await unLinkFile(getFilePath(filename));
    } catch (e) {
      error("Error while unlinking", e);
    }
  }
});

bot.start({
  drop_pending_updates: true,
  onStart: (u) => {
    log(`🟢 ${u.username} is Online`);
  },
});

function getFilePath(filename: string): string {
  return `${filesPath}/${filename}`;
}

async function unLinkFile(file: string) {
  try {
    await unlink(file);
  } catch (e) {
    throw e;
  }
}

function getUUId(): string {
  return Date.now().toString();
}
