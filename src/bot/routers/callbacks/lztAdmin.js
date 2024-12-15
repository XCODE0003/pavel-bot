import { bot } from "../../index.js";
import Database from "../../../database/index.js";
import market from "../../../database/schemas/market.js";
import User from "../../../database/schemas/user.js";
import states from "../../states.js";

export default {
    name: "lztadmin",
    async exec(query, [action, reset]) {

        if (action) {
            switch (action) {
                case 'on':
                case 'off':
                    const u = await User.findOneAndUpdate({ id: query.from.id }, {
                        lztOn: action === 'on'
                    }, { new: true });

                    let inline_keyboard = query.message.reply_markup.inline_keyboard;

                    inline_keyboard[0][0] = {
                        text: u.lztOn ? '🟢 LZT' : '🛑 LZT',
                        callback_data: u.lztOn ? `lztadmin:off` : 'lztadmin:on'
                    };

                    return await bot.editMessageReplyMarkup({ inline_keyboard }, {
                        message_id: query.message.message_id,
                        chat_id: query.message.chat.id
                    });

                case 'settings':
                    const usr = await Database.getUser(query.from.id);
                    const x = await market.findOne({ token: usr.admToken });

                    if (!usr.admToken || reset || !x) {
                        await bot.editMessageCaption(query, `*⚙️ Отправьте токен LZT с правами маркета.*`, {
                            parse_mode: 'Markdown',
                            message_id: query.message.message_id,
                            chat_id: query.message.chat.id,
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            text: '🔙 Назад',
                                            callback_data: 'admin'
                                        }
                                    ]
                                ]
                            }
                        }, 'cdn/settings.png')

                        return states.set(query.from.id, {
                            action: 'lztadmin',
                            args: []
                        });
                    }

                    return await bot.editMessageCaption(query, `*⚙️ Выберите какой параметр хотите изменить либо настройте заново.*`, {
                        parse_mode: 'Markdown',
                        message_id: query.message.message_id,
                        chat_id: query.message.chat.id,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Токен',
                                        callback_data: 'editlzta:token'
                                    }
                                ],
                                [
                                    {
                                        text: 'Название объявления на Русском',
                                        callback_data: 'editlzta:name'
                                    }
                                ],
                                [
                                    {
                                        text: 'Название объявления на Английском',
                                        callback_data: 'editlzta:nameEn'
                                    }
                                ],
                                [
                                    {
                                        text: 'Описание объявления',
                                        callback_data: 'editlzta:bio'
                                    }
                                ],
                                [
                                    {
                                        text: 'Цена',
                                        callback_data: 'editlzta:price'
                                    }
                                ],
                                [
                                    {
                                        text: 'Цена за Российский аккаунт',
                                        callback_data: 'editlzta:ru'
                                    }
                                ],
                                [
                                    {
                                        text: 'Цена за Украинский аккаунт',
                                        callback_data: 'editlzta:ua'
                                    }
                                ],
                                [
                                    {
                                        text: 'Цена за Беларусский аккаунт',
                                        callback_data: 'editlzta:br'
                                    }
                                ],
                                [
                                    {
                                        text: 'Цена за Польский аккаунт',
                                        callback_data: 'editlzta:pl'
                                    }
                                ],
                                [
                                    {
                                        text: 'Цена за Казахский аккаунт',
                                        callback_data: 'editlzta:kz'
                                    }
                                ],
                                [
                                    {
                                        text: 'Цена за Кыргыстанский аккаунт',
                                        callback_data: 'editlzta:kg'
                                    }
                                ],
                                [
                                    {
                                        text: 'Цена за Азербайджанский аккаунт',
                                        callback_data: 'editlzta:az'
                                    }
                                ],
                                [
                                    {
                                        text: 'Цена за Индонезийский аккаунт',
                                        callback_data: 'editlzta:in'
                                    }
                                ],
                                [
                                    {
                                        text: 'Цена за Премиум Аккаунт',
                                        callback_data: 'editlzta:premium'
                                    }
                                ],
                                [
                                    {
                                        text: 'Цена за Спам-блок',
                                        callback_data: 'editlzta:spam'
                                    }
                                ],
                                [
                                    {
                                        text: 'Цена за 2FA',
                                        callback_data: 'editlzta:pass'
                                    }
                                ],
                                [
                                    {
                                        text: '🔄 Заново',
                                        callback_data: `lztadmin:settings:true`
                                    },
                                    {
                                        text: '🔙 Назад',
                                        callback_data: 'lztadmin'
                                    }
                                ]
                            ]
                        }
                    }, 'cdn/settings.png');
                    break;
            }
        }

        const user = await Database.getUser(query.from.id);
        const m = await market.findOne({ token: user.admToken });


        if (!user.admToken || !m) return await bot.editMessageCaption(query, `⚙️ Настройки

*Вы еще не настроили автоматическую продажу на LZT.*`, {
            parse_mode: 'Markdown',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🛑 LZT Выключен',
                            callback_data: `lztoff:adm`
                        },
                        {
                            text: `⚙️ Настройки`,
                            callback_data: 'lztadmin:settings'
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'admin'
                        }
                    ]
                ]
            }
        }, 'cdn/settings.png');

        await bot.editMessageCaption(query, `*⚙️ Настройки*

*💰 Цена:* ${m.price}
🗒 Статистика:
  Успешно выложено: ${m.success}
  Ошибка публикации: ${m.error}
  Перепродажа: ${m.resale}`, {
            parse_mode: 'MarkdownV2',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: user.lztOn ? '🟢 LZT Включен' : '🛑 LZT Выключен',
                            callback_data: user.lztOn ? `lztadmin:off` : 'lztadmin:on'
                        },
                        {
                            text: `⚙️ Настройки`,
                            callback_data: 'lztadmin:settings'
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'admin'
                        }
                    ]
                ]
            }
        }, 'cdn/settings.png');
    }
}