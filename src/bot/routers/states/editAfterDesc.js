import { bot } from "../../index.js";
import market from "../../../database/schemas/market.js";
import Database from "../../../database/index.js";
import states from "../../states.js";

export default {
    name: "editAfterDesc",
    async exec(message, args) {
        const user = await Database.getUser(message.from.id);
        const state = states.get(message.from.id);

        await market.findOneAndUpdate(
            { token: user.lzt },
            { $set: { bio_after: message.raw } }
        );

        return await bot.sendPhoto(message.from.id, 'cdn/settings.png', {
            caption: `*✅ Описание ПОСЛЕ покупки успешно обновлено!*`,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    { text: '🔙 Назад', callback_data: 'lzt:announcement' }
                ]]
            }
        });
    }
} 