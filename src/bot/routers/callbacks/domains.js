import { bot } from "../../index.js";
import domain from "../../../database/schemas/domain.js";
import states from "../../states.js";

export default {
    name: "domains",
    async exec(query, [action]) {
        if (action) {
            // return await bot.editMessageCaption(query, `*Тестовый режим\nЗаработает когда будет ключ от апи кф*`, {
            //     parse_mode: 'Markdown',
            //     chat_id: query.message.chat.id,
            //     message_id: query.message.message_id,
            //     reply_markup: {
            //         inline_keyboard: [
            //             [
            //                 {
            //                     text: '🔙 Назад',
            //                     callback_data: 'domains'
            //                 }
            //             ]
            //         ]
            //     }
            // });
            await bot.editMessageCaption(query, `*Введите домен*`, {
                parse_mode: 'Markdown',
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: 'domains'
                            }
                        ]
                    ]
                }
            });
            return states.set(query.from.id, {
                action: 'domain',
                args: []
            });
        }
        const domains = await domain.find({ worker: query.from.id });

        await bot.editMessageCaption(query, `*🔗 Ваши домены*`, {
            parse_mode: 'Markdown',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `➕ Добавить домен`,
                            callback_data: `domains:create`
                        }
                    ],
                    ...domains.map(t => {
                        return [
                            {
                                text: t.name,
                                callback_data: `d:${t.id}`
                            }
                        ];
                    }),
                    [
                        {
                            text: "⚙️ Доп. Настройки",
                            callback_data: "addsettings:d"
                        },
                        {
                            text: '🔙 Назад',
                            callback_data: 'start'
                        }
                    ]
                ]
            }
        }, 'cdn/domains.png');
    }
}