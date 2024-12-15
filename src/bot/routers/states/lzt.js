import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import states from "../../states.js";
import template from "../../../database/schemas/market.js";
import user from "../../../database/schemas/user.js";
import axios from "axios";

const reply_markup = {
    inline_keyboard: [
        [
            {
                text: '🔙 Назад',
                callback_data: 'b:lzt'
            }
        ]
    ]
}

export default {
    name: "lzt",
    async exec(message, args) {
        if(!message.raw) return;
        if(!args[0]) {
            const response = await axios.get(`https://api.lzt.market/me`, {
                headers: {
                    authorization: `Bearer ${message.raw}`
                }
            })
                .catch(e => e.response)
                .then(r => r?.status || 401)

            if(response !== 200) return await bot.sendMessage(message.from.id, `*✖️ Неверный токен.*`, {
                parse_mode: 'Markdown',
                reply_markup
            });

            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите название объявления на русском.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[1]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите название объявления на английском.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[2]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите описание объявления.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[3]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите стоимость аккаунта.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(isNaN(+message.raw)) {
            return await bot.sendMessage(message.from.id, `*✖️ Введите стоимость аккаунта корректно.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[4]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите цену за Российский аккаунт.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[5]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите цену за Украинский аккаунт.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[6]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите цену за Белорусский аккаунт.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[7]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите цену за Польский аккаунт.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[8]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите цену за Казахский аккаунт.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[9]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите цену за Кыргызский аккаунт.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[10]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите цену за Азербайджанский аккаунт.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[11]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите цену за Индонезийский аккаунт.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[12]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите цену за Premium аккаунт. *`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[13]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите цену за аккаунт с 2FA. *`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[14]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите цену за аккаунт со спам-баном.*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        const [token, name, nameEn, bio, price, ru, ua, br, pl, kz, kg, az, _in, premium, pass] = args;
        await new template({ id: Date.now(), nameEn, bio, token, name, price, ru, ua, br, pl, kz, kg, az, in: _in, premium, pass, spam: message.raw }).save();
        await user.findOneAndUpdate({ id: message.from.id }, { $set: { lzt: token }})
        states.delete(message.from.id);
        return await bot.sendMessage(message.from.id, `*✅ LZT успешно настроен!*`, {
            parse_mode: 'Markdown',
            reply_markup
        });
    }
}