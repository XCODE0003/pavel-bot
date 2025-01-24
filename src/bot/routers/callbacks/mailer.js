import { bot } from "../../index.js";
import states from "../../states.js";

export default {
    name: "mailer",
    async exec(query, [id, action]) {
        let message = '';
        if(action == 'allBots') {
            message = `📣 Рассылка по всем ботам
            
            ❔ Рассылка будет отправляться разово всем пользователям в ботах.
            
            ❕ Вы можете форматировать текст и вставлять ссылки. Так же это сообщение поддерживает медиафайлы.`;
        } else {
            message = 'Введите сообщение для рассылки';
        }

        await bot.editMessageCaption(query, `Введите сообщение для рассылки`, {
            parse_mode: 'Markdown',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: action == 'allBots' ? 'addsettings' : id? `bot:${id}` : 'admin'
                        }
                    ]
                ]
            }
        });

        states.set(query.from.id, {
            action: 'mailer',
            args: [id || null, action]
        })
    }
}