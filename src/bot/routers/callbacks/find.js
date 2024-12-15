import { bot } from "../../index.js";
import states from "../../states.js";

export default {
    name: "find",
    async exec(query, [a]) {
        await bot.editMessageCaption(query, `*✒️ Введите имя пользователя или id*`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'admin'
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
        })

        return states.set(query.from.id, {
            action: 'find'
        })
    }
}