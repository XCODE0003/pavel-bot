import { bot } from "../../index.js";
import Database from "../../../database/index.js";
import config from '../../../../config.json' assert { type: 'json' };
import commission from "../../../database/schemas/commission.js";
import states from "../../states.js";

export default {
    name: "procent",
    async exec(query, [a, id]) {
        if(a) {
            await bot.editMessageText(`*Введите новое значение*`, {
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
                action: 'com',
                args: [id]
            })
        }
    }
}