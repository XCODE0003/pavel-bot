import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import states from "../../states.js";
import template from "../../../database/schemas/market.js";
import user from "../../../database/schemas/user.js";
import axios from "axios";

const callbacks = {
    'token': true,
    'ru_title': true,
    'en_title': true,
    'before_description': true,
    'after_description': true,
    'ru_price': true,
    'ua_price': true,
    'by_price': true,
    'pl_price': true,
    'kz_price': true,
    'kg_price': true,
    'az_price': true,
    'id_price': true,
    '2fa_price': true,
    'spam_price': true,
    'premium_price': true
};

let lztModule;

bot.on('callback_query', async (query) => {
    console.log('Callback received:', query.data);
    
    if (callbacks[query.data]) {
        const state = states.get(query.message.chat.id);
        console.log('Current state before:', state);
        
        if (state && state.args.length > 0) {
            try {
                await bot.deleteMessage(query.message.chat.id, query.message.message_id);
                
                state.args.pop();
                const previousArg = state.args[state.args.length - 1];
                states.set(query.message.chat.id, state);
                
                console.log('State after pop:', state);
                console.log('Previous arg:', previousArg);

                const message = {
                    from: { id: query.message.chat.id },
                    raw: previousArg || '',
                    chat: query.message.chat
                };

                await bot.answerCallbackQuery(query.id);
                
                await lztModule.exec(message, state.args.slice(0, -1));
            } catch (error) {
                console.error('Error handling back:', error);
                await bot.answerCallbackQuery(query.id, { text: 'Произошла ошибка при возврате назад' });
            }
        }
    }
});

const lzt = {
    name: "lzt",
    async exec(message, args) {
        console.log('Exec called with message:', message);
        console.log('Exec called with args:', args);
        
        if (!message.raw && !args.length) return;

        // Проверка токена
        if (!args[0]) {
            const response = await axios.get(`https://api.lzt.market/me`, {
                headers: {
                    authorization: `Bearer ${message.raw}`
                }
            })
                .catch(e => e.response)
                .then(r => r?.status || 401)

            if (response !== 200) return await bot.sendMessage(message.from.id, `*❌ Токен LZT неверный! Попробуйте отправить еще раз!*

❔ [Инструкция как настроить авто-залив LZT](https://teletype.in/@tonlog/auto-zaliv)`, {
                parse_mode: 'Markdown',
                reply_markup
            });

            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*🇷🇺 Введите название объявления на русском языке.*

❔ Вы поможете нам если в начале объявления введете инициалы панели "TL" "TonLog" Спасибо!`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'token' }]]
                }
            })
        }

        // Проверка русского названия
        if (!args[1]) {
            if (!/^[а-яёА-ЯЁ\s\d@"',.!?-]+$/.test(message.raw)) {
                return await bot.sendMessage(message.from.id, `*❌ Ошибка! Название должно быть на русском языке!*

❔ Введите название объявления еще раз.`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'token' }]]
                    }
                });
            }
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*🇬🇧 Введите название объявления на английском языке.*

❔ [Воспользуйтесь переводчиком](https://translate.google.com/?hl=ru&sl=ru&tl=en&op=translate)`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'ru_title' }]]
                }
            })
        }

        if (!args[2]) {
            if (!/^[a-zA-Z\s\d@"',.!?-]+$/.test(message.raw)) {
                return bot.sendMessage(message.from.id, `*❌ Ошибка! Название должно быть на английском языке!*

❔ Введите название объявления еще раз.`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'b:ru_title' }]]
                    }
                });
            }
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*📔 Введите описание объявления ДО покупки.*

❔ Не забудьте отметить что аккаунт добыт с @TonLog либо @tonlogpanelbot. Нам будет очень приятно!`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔜 Пропустить', callback_data: 'skip_description' }],
                        [{ text: '🔙 Назад', callback_data: 'en_title' }]
                    ]
                }
            })
        }
        
        if (!args[3]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*📓 Введите описание объявления ПОСЛЕ покупки.*

❔ Не забудьте отметить что аккаунт добыт с @TonLog либо @tonlogpanelbot. Нам будет очень приятно!`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔜 Пропустить', callback_data: 'skip_after_description' }],
                        [{ text: '🔙 Назад', callback_data: 'before_description' }]
                    ]
                }
            })
        }

        if (!args[4]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*🇷🇺 Введите стоимость за Российский аккаунт.*

❔ [Рекомендуем сверить свои цены с рынком LZT](https://lzt.market/telegram/?origin[]=fishing&country[]=RU&password=no&spam=no&order_by=price_to_up)`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'after_description' }]]
                }
            })
        }

        if (!args[5]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*🇺🇦 Введите стоимость за Украинский аккаунт.*

❔ [Рекомендуем сверить свои цены с рынком LZT](https://lzt.market/telegram/?origin[]=fishing&country[]=UA&password=no&spam=no&order_by=price_to_up)`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'ru_price' }]]
                }
            })
        }

        if (!args[6]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*🇧🇾 Введите стоимость за Белорусский аккаунт.*

❔ [Рекомендуем сверить свои цены с рынком LZT](https://lzt.market/telegram/?origin[]=fishing&country[]=BY&password=no&spam=no&order_by=price_to_up)`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'ua_price' }]]
                }
            })
        }

        if (!args[7]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*🇵🇱 Введите стоимость за Польский аккаунт.*

❔ [Рекомендуем сверить свои цены с рынком LZT](https://lzt.market/telegram/?origin[]=fishing&country[]=PL&password=no&spam=no&order_by=price_to_up)`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'by_price' }]]
                }
            })
        }

        if (!args[8]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*🇰🇿 Введите стоимость за Казахстанский аккаунт.*

❔ [Рекомендуем сверить свои цены с рынком LZT](https://lzt.market/telegram/?origin[]=fishing&country[]=KZ&password=no&spam=no&order_by=price_to_up)`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'pl_price' }]]
                }
            })
        }

        if (!args[9]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*🇰🇬 Введите стоимость за Кыргызский аккаунт.*

❔ [Рекомендуем сверить свои цены с рынком LZT](https://lzt.market/telegram/?origin[]=fishing&country[]=KG&password=no&spam=no&order_by=price_to_up)`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'kz_price' }]]
                }
            })
        }

        if (!args[10]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*🇦🇿 Введите стоимость за Азербайджанский аккаунт.*

❔ [Рекомендуем сверить свои цены с рынком LZT](https://lzt.market/telegram/?origin[]=fishing&country[]=AZ&password=no&spam=no&order_by=price_to_up)`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'kg_price' }]]
                }
            })
        }

        if (!args[11]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*🇮🇩 Введите стоимость за Индонезийский аккаунт.*

❔ [Рекомендуем сверить свои цены с рынком LZT](https://lzt.market/telegram/?origin[]=fishing&country[]=ID&password=no&spam=no&order_by=price_to_up)`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'az_price' }]]
                }
            })
        }

        if (!args[12]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*🔐 Введите стоимость за аккаунты с паролем. (2FA)*

❔ [Рекомендуем сверить свои цены с рынком LZT](https://lzt.market/telegram/?origin[]=fishing&password=yes&spam=no&order_by=price_to_up)`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'id_price' }]]
                }
            })
        }

        if (!args[13]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*⚠️ Введите стоимость за аккаунты c спам блоком.*

❔ [Рекомендуем сверить свои цены с рынком LZT](https://lzt.market/telegram/?origin[]=fishing&password=no&spam=yes&order_by=price_to_up)`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: '2fa_price' }]]
                }
            })
        }

        if (!args[14]) {
            states.set(message.from.id, { action: "lzt", args: [...args, message.raw] })
            return await bot.sendMessage(message.from.id, `*⭐️ Введите стоимость за аккаунты с Premium подпиской.*

❔ [Рекомендуем сверить свои цены с рынком LZT](https://lzt.market/telegram/?origin[]=fishing&premium=yes&order_by=price_to_up)`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'spam_price' }]]
                }
            })
        }

        const priceSteps = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        if (priceSteps.includes(args.length)) {
            if (isNaN(+message.raw) || +message.raw < 0) {
                return bot.sendMessage(message.from.id, `*❌ Ошибка! Стоимость должна быть положительным числом!*

❔ Введите стоимость еще раз.`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: '🔙 Назад', callback_data: `b:price_${args.length - 1}` }]]
                    }
                });
            }
        }

        const [token, name, nameEn, bio, price_total, ru, ua, br, pl, kz, kg, az, _in, premium, pass] = args;
        const price = ru

        await new template({ id: Date.now(), nameEn, bio, token, name, price, ru, ua, br, pl, kz, kg, az, in: _in, premium, pass, spam: message.raw }).save();
        await user.findOneAndUpdate({ id: message.from.id }, { $set: { lzt: token } })
        states.delete(message.from.id);
        return await bot.sendMessage(message.from.id, `*✅ LZT успешно настроен! Ты молодец!*`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '⚙️ Настройки',
                            callback_data: 'lzt:settings'
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'menu'
                        }
                    ]
                ]
            }
        });
    }
};

lztModule = lzt;

export default lzt;