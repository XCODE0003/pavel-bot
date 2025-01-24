import { bot } from "../../index.js";
import config from "../../../../config.json" assert { type: "json" };
import states from "../../states.js";
import Bot from "../../../database/schemas/bot.js";
import axios from "axios";
import template from "../../../database/schemas/template.js";
import _ from "lodash";

const reply_markup = {
  inline_keyboard: [
    [
      {
        text: "🔙 Назад",
        callback_data: "b:bots",
      },
    ],
  ],
};

export default {
  name: "bot",
  async exec(message, args) {
    if (!message.text) return;
    const tokens = [...new Set(message.text.split("\n"))];
    for(const token of tokens) {
        await addBot(token, message);
    }

    states.delete(message.from.id);
  },
};

async function addBot(token, message) {
  const b = await axios
    .get(`https://api.telegram.org/bot${token}/getMe`)
    .catch(() => null);

  if (!b)
    return await bot.sendMessage(message.from.id, `*❌ Токен неверный! Попробуйте еще раз!*`, {
      parse_mode: "Markdown", 
      reply_markup,
    });

  if (await Bot.findOne({ token: token }))
    return await bot.sendMessage(
      message.from.id,
      `*❌ Этот токен уже используется, введите другой!*`,
      {
        parse_mode: "Markdown",
        reply_markup,
      }
    );

  const templates = await template.find({ owner: message.from.id });

  if(!templates.length) {
    return await bot.sendMessage(
      message.from.id,
      `*❌ Вы не можете добавить бота пока у Вас нет шаблона!*`,
      {
        parse_mode: "Markdown",
        reply_markup,
      }
    );
  }
  return await bot.sendMessage(
    message.from.id,
    `*📂Выберите шаблон для бота @${b?.data?.result?.username}*`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          ..._.chunk(
            templates.map((t) => ({
              text: t.name,
              callback_data: `x:${t.id}:${token.replaceAll(
                ":",
                "!"
              )}`.toString("utf-8"),
            }))
          ),
          reply_markup.inline_keyboard[0],
        ],
      },
    }
  );
  
}
