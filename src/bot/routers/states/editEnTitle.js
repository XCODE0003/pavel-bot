import { bot } from "../../index.js";
import market from "../../../database/schemas/market.js";
import Database from "../../../database/index.js";
import states from "../../states.js";

export default {
    name: "editEnTitle",
    async exec(message, args) {
        const user = await Database.getUser(message.from.id);
        const state = states.get(message.from.id);
        
        if (!/^[a-zA-Z\s\d@"',.!?-]+$/.test(message.raw)) {
            return await bot.sendPhoto(message.from.id, 'cdn/settings.png', {
                caption: `*❌ Ошибка! Название должно быть на английском языке!*\n\n❔ Введите название объявления еще раз.`,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🔙 Назад', callback_data: 'lzt:announcement' }
                    ]]
                }
            });
        }

        await market.findOneAndUpdate(
            { token: user.lzt },
            { $set: { en: message.raw } }
        );

        return await bot.sendPhoto(message.from.id, 'cdn/settings.png', {
            caption: `*✅ Название на английском успешно обновлено!*`,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    { text: '🔙 Назад', callback_data: 'lzt:announcement' }
                ]]
            }
        });
    }
} 