import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import states from "../../states.js";
import template from "../../../database/schemas/market.js";
import user from "../../../database/schemas/user.js";
import axios from 'axios';

export default {
    name: "lztedit",
    async exec(message, [action, token]) {
        if (!message.text) return;
        let obj = {};
        obj[action] = message.text;

        if (action === 'token') {
            const response = await axios.get(`https://api.lzt.market/me`, {
                headers: {
                    authorization: `Bearer ${message.raw}`
                }
            })
                .catch(e => e.response)
                .then(r => r?.status || 401)

            if (response !== 200) return await bot.sendMessage(message.from.id, `*✖️ Неверный токен.*`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: `b:lzt:settings`
                            }
                        ]
                    ]
                }
            });

            await user.findOneAndUpdate({ id: message.from.id }, { $set: { lzt: message.raw } })

        }

        const x = await template.findOneAndUpdate({ token }, { $set: obj });

        states.delete(message.from.id);
        await bot.sendMessage(message.from.id, `*✅ Параметр успешно изменен*`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: `b:lzt:settings`
                        }
                    ]
                ]
            },
            parse_mode: "Markdown"
        });
    }
}