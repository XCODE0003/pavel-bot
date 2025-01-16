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
        
        if (action === 'token') {
            try {
                const response = await axios.get('https://api.lzt.market/me', {
                    headers: {
                        'Authorization': `Bearer ${message.raw}`
                    }
                });

                if (response.status === 200) {
                    await user.findOneAndUpdate(
                        { id: message.from.id },
                        { $set: { lzt: message.raw } }
                    );

                    let obj = {};
                    obj[action] = message.raw;
                    await template.findOneAndUpdate({ token }, { $set: obj });

                    states.delete(message.from.id);

                    return await bot.sendPhoto(message.from.id, 'cdn/settings.png', {
                        caption: `*✅ Токен успешно изменен на новый!*`,
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [[
                                { text: '🔙 Назад', callback_data: 'lzt:settings' }
                            ]]
                        }
                    });
                }
            } catch (error) {
                return await bot.sendPhoto(message.from.id, 'cdn/settings.png', {
                    caption: `*❌ Токен LZT неверный! Попробуйте отправить еще раз!*\n\n❔ [Инструкция как настроить авто-залив LZT](https://teletype.in/@tonlog/auto-zaliv)`,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[
                            { text: '🔙 Назад', callback_data: 'lzt:settings' }
                        ]]
                    }
                });
            }
        } else {
            // Проверка на число для цен
            if (!/^\d+$/.test(message.raw)) {
                return await bot.sendPhoto(message.from.id, 'cdn/settings.png', {
                    caption: `*❌ Ошибка! Вводите стоимость аккаунта цифрами!*

❔ Повторите еще раз! Введите стоимость ниже.`,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[
                            { text: '🔙 Назад', callback_data: 'lzt' }
                        ]]
                    }
                });
            }

            let obj = {};
            obj[action] = parseInt(message.raw);
            await template.findOneAndUpdate({ token }, { $set: obj });

            states.delete(message.from.id);
            return await bot.sendPhoto(message.from.id, 'cdn/settings.png', {
                caption: `*✅ Значение успешно изменено!*`,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🔙 Назад', callback_data: 'lzt' }
                    ]]
                }
            });
        }
    }
}