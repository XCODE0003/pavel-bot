import { bot } from "../../index.js";
import states from "../../states.js";
import domain from "../../../database/schemas/domain.js";
import template from "../../../database/schemas/domainTemplate.js";

const reply_markup = {
    inline_keyboard: [
        [
            {
                text: '🔙 Назад',
                callback_data: 'b:domains'
            }
        ]
    ]
}

export default {
    name: "domain",
    async exec(message, args) {
        if(!message.text) return;

        if(await domain.findOne({ name: message.raw })) return await bot.sendMessage(message.from.id, `*✖️ Этот домен уже используется, введите другой!*`, {
            parse_mode: 'Markdown',
            reply_markup
        });

        states.delete(message.from.id);

        const templates = await template.find({ 'owner': message.from.id});

        return await bot.sendMessage(message.from.id, `*Выберите шаблон для домена:*`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Авторизация',
                            callback_data: `b:cd:0:${message.raw}`
                        }
                    ],
                    ...templates.map(t => [
                        {
                            text: t.name,
                            callback_data: `b:cd:${t.id}:${message.raw}`
                        }
                    ]),
                    reply_markup.inline_keyboard[0]
                ]
            }
        });
    }
}