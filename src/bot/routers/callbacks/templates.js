import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import template from "../../../database/schemas/template.js";
import states from "../../states.js";

export default {
    name: "templates",
    async exec(query) {
        await bot.editMessageCaption(query, `*📁 Выберите тип шаблонов*`, {
            parse_mode: 'Markdown',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `🤖 Боты`,
                            callback_data: `templatesb`
                        },
                        {
                            text: `🔗 Домены`,
                            callback_data: `templatess`  
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'start'
                        }
                    ]
                ]
            }
        }, 'cdn/templates.png');
    }
}