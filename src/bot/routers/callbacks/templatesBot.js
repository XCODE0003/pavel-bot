import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import template from "../../../database/schemas/template.js";
import states from "../../states.js";
import {decline} from "../../../utils/index.js";
import _ from 'lodash';

export default {
    name: "templatesb",
    async exec(query, [action]) {
            
        if(action) {
            await bot.editMessageCaption(query, `*Введите название шаблона:*`, {
                parse_mode: 'Markdown',
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: 'templatesb'
                            }
                        ]
                    ]
                }

            });
            return states.set(query.from.id, {
                action: 'template',
                args: []
            });
        }
        const templates = await template.find({ owner: query.from.id });

	
        await bot.editMessageCaption(query, `*📁 У вас ${decline(templates.length, ['шаблон', 'шаблона', 'шаблонов'])} *`, {
            parse_mode: 'Markdown',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `➕ Создать шаблон`,
                            callback_data: `templatesb:create`
                        }
                    ],
                    ...(_.chunk(templates.map(t => (
                        {
                            text: t.name,
                            callback_data: `t:${t.id}`
                        }
                    )), 2)),
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'templates'
                        }
                    ]
                ]
            }
        }, `cdn/templates.png`);
    }
}