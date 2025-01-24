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
                return await bot.editMessageCaption(query, `*🤖 У Вас 0 шаблонов ботов. *`, {
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

            await bot.editMessageCaption(query, `<b>🤖 Добавление нового бота:</b>

<i>❗️Не в коем случае не делайте его на своем аккаунте!</i>

1. Перейдите в @BotFather
2. Создайте бота /newbot или выберите из существующего <code>/mybots</code> > <code>/revoke</code>
3. Скопируйте токен бота и отправьте в чат.

❔ Примерно так выглядит токен:
<code>123456789:ABCdefGHIjklMNOpqrsTUVwxyz12345678</code>

❕Массовая загрузка токенов через пробел:
<code>123456789:ABCdefGHIjklMNOpqrsTUVwxyz12345678</code>
<code>987654321:ABCdefGHIjklMNOpqrsTUVwxyz87654321</code>

Отправьте токен бота:`, {
                parse_mode: 'HTML',
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
     


        await bot.editMessageCaption(query, `*🤖 Ваши боты и шаблоны*

🔄 Все боты проверяются на блокировку каждые 5 минут
ℹ️ Нажмите на бота для управления`, {
            parse_mode: 'Markdown',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "📂 Шаблоны ботов",
                            callback_data: "templatesb"
                        }
                    ],
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
                    }), 1),
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