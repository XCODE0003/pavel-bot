import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import template from "../../../database/schemas/domainTemplate.js";
import states from "../../states.js";
import {decline} from "../../../utils/index.js";

export default {
    name: "templatess",
    async exec(query, [action, x]) {
        if(action) {
            if(!x)
                return await bot.editMessageCaption(query, `*<b>Выберите тип шаблона:</b> <i>❔ Авторизация - обычная страница входа в менеджер. Бот - лендинг бота. Канал - лендинг канала.</i>`, {
                    parse_mode: 'Markdown',
                    chat_id: query.message.chat.id,
                    message_id: query.message.message_id,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Бот',
                                    callback_data: `templatess:create:bot`
                                },
                                {
                                    text: 'Канал',
                                    callback_data: `templatess:create:channel`
                                },
                                {
                                    text: 'Авторизация',
                                    callback_data: `templatess:create:auth`
                                }
                                
                            ],
                            [
                                {
                                    text: '🔙 Назад',
                                    callback_data: 'templatess'
                                }
                            ]
                        ]
                    }
                });

            await bot.editMessageCaption(query, `*Введите название ${x === 'bot'? `бота` : "канала"}:*`, {
                parse_mode: 'Markdown',
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: 'templatess'
                            }
                        ]
                    ]
                }
            });
            
            return states.set(query.from.id, {
                action: 'templates',
                args: [x]
            });
        }
        const templates = await template.find({ owner: query.from.id });

        await bot.editMessageCaption(query, `*📁 У вас ${templates.length} шаблонов доменов*`, {
            parse_mode: 'Markdown',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                   
                    [
                        {
                            text: `➕ Создать шаблон`,
                            callback_data: `templatess:create`
                        }
                    ],
                    ...templates.map(t => [
                        {
                            text: t.name,
                            callback_data: `ts:${t.id}`
                        }
                    ]),
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'domains'
                        }
                    ]
                ]
            }
        }, 'cdn/templates.png');
    }
}