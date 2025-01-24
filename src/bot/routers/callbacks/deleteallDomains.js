import { bot } from "../../index.js";
import Bot from "../../../database/schemas/domain.js";

export default {
    name: "deletealld",
    async exec(query, [confirm]) {
        if (!(await Bot.find({ worker: query.from.id }))) {
            await bot.editMessageCaption(query, "✖️ *У вас нет доменов*", {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: 'domains'
                            }
                        ]
                    ]
                }
            });
        }

        if (confirm) {
            await Bot.deleteMany({ worker: query.from.id });

            await bot.editMessageCaption(query, "✅ *Все домены удалены*", {
                message_id: query.message.message_id,
                chat_id: query.message.chat.id,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: 'domains'
                            }
                        ]
                    ]
                }
            });

            return;
        }

        await bot.editMessageCaption(query, "<i>❔ Вы уверены что хотите удалить все домены?</i>", {
            parse_mode: "HTML",
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🗑️ Удалить",
                            callback_data: "deletealld:confirm"
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'domains'
                        }
                    ]
                ]
            }
        });
    }
}