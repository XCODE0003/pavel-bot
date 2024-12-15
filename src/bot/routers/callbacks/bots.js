import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import Bot from "../../../database/schemas/bot.js";
import TelegramBot from "node-telegram-bot-api";
import states from "../../states.js";
import template from "../../../database/schemas/template.js";
import _ from 'lodash';

export default {
    name: "bots",
    async exec(query, [action]) {
        if(action) {
            const templates = await template.find({ owner: query.from.id });

            if(!templates.length) {
                return await bot.editMessageCaption(query, `*✖️ У вас нет шаблонов*`, {
                    parse_mode: 'Markdown',
                    chat_id: query.message.chat.id,
                    message_id: query.message.message_id,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '➕ Создать шаблон',
                                    callback_data: 'templatesb:create'
                                }
                            ],
                            [
                                {
                                    text: '🔙 Назад',
                                    callback_data: 'bots'
                                }
                            ]
                        ]
                    }
                });
            }

            await bot.editMessageCaption(query, `*Введите токен бота*`, {
                parse_mode: 'Markdown',
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: 'bots'
                            }
                        ]
                    ]
                }
            });
            return states.set(query.from.id, {
                action: 'bot',
                args: []
            });
        }
        const bots = await Bot.find({ owner: query.from.id });
        console.log(bots);


        await bot.editMessageCaption(query, `*🤖 Ваши боты*`, {
            parse_mode: 'Markdown',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `➕ Добавить бота`,
                            callback_data: `bots:create`
                        }
                    ],
                    ..._.chunk(bots.map(t => {
                        return (
                            {
                                text: t.username,
                                callback_data: `bot:${t.id}`
                            }
                        )
                    }), 2),
                    [
                        {
                            text: "⚙️ Доп. Настройки",
                            callback_data: "addsettings"
                        },
                        {
                            text: '🔙 Назад',
                            callback_data: 'start'
                        }
                    ]
                ]
            }
        }, 'cdn/bots.png');
    }
}