import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import states from "../../states.js";
import template from "../../../database/schemas/market.js";
import user from "../../../database/schemas/user.js";

const priceNames = {
    ru: '🇷🇺 Россия',
    ua: '🇺🇦 Украина',
    kz: '🇰🇿 Казахстан',
    br: '🇧🇾 Беларусь',
    pl: '🇵🇱 Польша',
    kg: '🇰🇬 Кыргызстан',
    az: '🇦🇿 Азербайджан',
    in: '🇩 Индонезия',
    price: '🌍 Остальные страны',
    pass: '🔐 2FA',
    spam: '⚠️ Спам-блок',
    premium: '⭐️ Premium'
};

export default {
    name: "editlzt",
    async exec(query, [action]) {
        const u = await user.findOne({ id: query.from.id });
        const t = await template.findOne({ token: u.lzt });
        if(!t) return await bot.answerCallbackQuery(query.id, {
            text: "❌"
        });
        let message = '';
        if(action === 'token') {
            message = `*Значение сейчас:* \`${t[action]}\`

❔ Введите новый токен ниже.`;
        }else{
            message = `*${priceNames[action]} | Значение сейчас:* \`${t[action] || '0'} RUB\`

❔ Введите новую стоимость ниже.`;
        }

        states.set(query.from.id, { action: 'lztedit', args: [action, t.token] })
        await bot.editMessageCaption(query, message, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: `lzt`
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        })
    }
}