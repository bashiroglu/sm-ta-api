const { Bot } = require("grammy");

const bot = new Bot(process.env.TG_BOT_TOKEN);
bot.command("start", (ctx) => {
  console.log(ctx.update.message.from);
  console.log(ctx.update.message.chat);
  ctx.reply("Welcome", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Login",
            web_app: {
              // TODO: add to env variable
              url: `https://sm-om-aspirans-dev-dev-branch.vercel.app?chatId=${ctx.update.message.chat.id}`,
            },
          },
        ],
      ],
    },
  });
});

module.exports = bot;
