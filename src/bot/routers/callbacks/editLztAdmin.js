import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import states from "../../states.js";
import template from "../../../database/schemas/market.js";
import dtemplate from "../../../database/schemas/domainTemplate.js";
import user from "../../../database/schemas/user.js";

export default {
    name: "editlzta",
    async exec(query, [action]) {
        const u = await user.findOne({ id: query.from.id });
        const t = await template.findOne({ token: u.admToken });
        if(!t) return await bot.answerCallbackQuery(query.id, {
            text: "❌"
        });

        states.set(query.from.id, { action: 'lztedita', args: [action, t.token] })
        await bot.editMessageCaption(query, `<b>Значение сейчас:</b>
${t[action]}

Введите новое значение:`, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: `lztadmin:settings`
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        })
    }
}