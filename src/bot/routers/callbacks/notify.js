import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import Database from "../../../database/index.js";
import user from "../../../database/schemas/user.js";
import TelegramBot from "node-telegram-bot-api";

export default {
    name: "notify",
    async exec(query) {
        if ((await Database.getUser(query.from.id)).notify) {
            let inline_keyboard = query.message.reply_markup.inline_keyboard;
            const b = new TelegramBot(config.notify_token);

            await b.sendMessage(query.from.id, `*✅ Отстук подключен!*\n\n_❔ Если хотите отключить нажмите на 👉🏻 /stop_`, {
                parse_mode: 'Markdown'
            }).catch(console.log);
            inline_keyboard[0][1] = {
                text: '🛎  Отстук',
                url: `https://t.me/${((await b.getMe())).username}`
            }
            await user.findOneAndUpdate({ id: query.from.id }, { $set: { notify: false } });
            return await bot.editMessageReplyMarkup({ inline_keyboard }, {
                message_id: query.message.message_id,
                chat_id: query.message.chat.id
            }).catch(console.log);
        }

        await bot.sendMessage(query.from.id, `*Для включения Отстука перейдите в бота @${((await new TelegramBot(config.notify_token, { polling: false }).getMe())).username} и нажмите кнопку /start*`, {
            parse_mode: 'Markdown'
        })
    }
}