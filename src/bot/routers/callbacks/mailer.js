import { bot } from "../../index.js";
import states from "../../states.js";

export default {
    name: "mailer",
    async exec(query, [id]) {
        await bot.editMessageCaption(query, `Введите сообщение для рассылки`, {
            parse_mode: 'Markdown',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: id? `bot:${id}` : 'admin'
                        }
                    ]
                ]
            }
        });

        states.set(query.from.id, {
            action: 'mailer',
            args: [id || null]
        })
    }
}