import { bot } from "../../index.js";
import Bot from "../../../database/schemas/bot.js";

export default {
    name: "deleteall",
    async exec(query, [confirm]) {
        if (!(await Bot.findOne({ owner: query.from.id }))) {
            await bot.editMessageCaption(query, "✖️ *У вас нет ботов*", {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: 'bots'
                            }
                        ]
                    ]
                }
            });
        }

        if (confirm) {
            await Bot.deleteMany({ owner: query.from.id });

            await bot.editMessageCaption(query, "✅ *Все боты успешно удалены!*", {
                message_id: query.message.message_id,
                chat_id: query.message.chat.id,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: 'bots'
                            }
                        ]
                    ]
                }
            });

            return;
        }

        await bot.editMessageCaption(query, "<i>❔ *Вы точно хотите удалить всех ботов*</i>", {
            parse_mode: "HTML",
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🗑️ Удалить",
                            callback_data: "deleteall:confirm"
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'bots'
                        }
                    ]
                ]
            }
        });
    }
}