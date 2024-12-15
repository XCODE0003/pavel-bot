import {bot} from "../../index.js";
import Bot from "../../../database/schemas/bot.js";
import Log from "../../../database/schemas/log.js";
import TelegramBot from "node-telegram-bot-api";
import user from "../../../database/schemas/user.js";
import config from "../../../../config.json" assert {type: 'json'};

export default {
    name: "block",
    async exec(query, [id, x]) {
        let message;
        const blocked = x == 'true';
        if(query.from.id == +id) return await bot.answerCallbackQuery(query.id, {
            text: '❌ Нельзя заблокировать себя'
        });

        const t = await user.findOneAndUpdate({id}, {$set: {blocked}});
        if (!t) return await bot.answerCallbackQuery(query.id, {
            text: "❌ Пользователь не найден"
        });

        await bot.editMessageText(`*✅ Пользователь ${blocked ? `заблокирован` : 'разблокирован'}*`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'vmember:' + id
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        })

        if (blocked) {
            message = '*❗️Ваш аккаунт заблокирован!\nНапишите в поддержку для выяснения обстоятельств.*';
        } else {
            message = '*✅ Ваш аккаунт разблокирован!*';
        }
        await bot.sendMessage(t.id, message, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `🧑‍💻 Поддержка`,
                            url: config.owner
                        }
                    ]
                ]
            }
        })
    }
}