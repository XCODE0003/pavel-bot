import TelegramBot from "node-telegram-bot-api";
import config from "../../config.json" assert { type: 'json' };
import user from "../database/schemas/user.js";
import { bot as MainBot } from "../bot/index.js";

export default () => {
    const bot = new TelegramBot(config.notify_token, { polling: true });

    bot.on(`message`, async message => {
        if (message.text === '/start') {
            await user.findOneAndUpdate({ id: message.from.id }, { $set: { notify: true } });
            await bot.sendMessage(message.from.id, `*✅ Отстук успешно подключен\n\n💡 Если хотите отключить отстук впишите команду /stop*`, {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [[{
                        text: 'Вернуться в панель',
                        url: `https://t.me/${(await MainBot.getMe()).username}`
                    }]]
                }
            })
        }
        if (message.text === '/stop') {
            await user.findOneAndUpdate({ id: message.from.id }, { $set: { notify: false } });
            await bot.sendMessage(message.from.id, `*❌ Отстук выключен!
\n\n💡 Если хотите включить отстук впишите команду /start*`, {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [[{
                        text: 'Вернуться в панель',
                        url: `https://t.me/${(await MainBot.getMe()).username}`
                    }]]
                }
            })
        }

    });
}