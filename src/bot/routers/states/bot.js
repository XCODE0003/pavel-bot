import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import states from "../../states.js";
import Bot from "../../../database/schemas/bot.js";
import axios from 'axios';
import template from "../../../database/schemas/template.js";
import _ from 'lodash';

const reply_markup = {
    inline_keyboard: [
        [
            {
                text: '🔙 Назад',
                callback_data: 'b:bots'
            }
        ]
    ]
}

export default {
    name: "bot",
    async exec(message, args) {
        if(!message.text) return;
        const b = await axios.get(`https://api.telegram.org/bot${message.raw}/getMe`)
            .catch(() => null);
        
        if(!b) return await bot.sendMessage(message.from.id, `*✖️ Неверный токен бота*`, {
            parse_mode: 'Markdown',
            reply_markup
        });

        if(await Bot.findOne({ token: message.raw })) return await bot.sendMessage(message.from.id, `*✖️ Этот токен уже используется, введите другой!*`, {
            parse_mode: 'Markdown',
            reply_markup
        });

        const templates = await template.find({ owner: message.from.id });

        states.delete(message.from.id);
        return await bot.sendMessage(message.from.id, `*Выберите шаблон для бота:*`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    ..._.chunk(templates.map(t => (
                        {
                            text: t.name,
                            callback_data: `x:${t.id}:${message.raw.replaceAll(":", "!")}`.toString('utf-8')
                        }
                    ))),
                    reply_markup.inline_keyboard[0]
                ]
            }
        });
    }
}