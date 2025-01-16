import commission from "../../../database/schemas/commission.js";
import { bot } from "../../index.js";
import user from "../../../database/schemas/user.js";
import Database from "../../../database/index.js";

export default {
    name: "start",
    async exec(query) {
        const user = await Database.getUser(query.from.id);
        await bot.editMessageCaption(query, `*⚡️ Добро пожаловать в TonLog!*

*🧾 Комиссия:* \`Каждый ${user.com || (await commission.findOne({})).value} лог\``, {
            parse_mode: 'Markdown',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '💻 Профиль',
                            callback_data: 'profile'
                        },
                        {
                            text: '⚙️ Настройки LZT',
                            callback_data: 'lzt'
                        }
                    ],
                    [
                        {
                            text: "🤖 Боты",
                            callback_data: 'bots'
                        },
                        {
                            text: '🌐 Домены',
                            callback_data: `domains`
                        }
                    ],
                    [
                        {
                            text: '🏆 Топ Проекта',
                            callback_data: 'top:all'
                        },
                        {
                            text: '📃 Информация',
                            callback_data: 'info'
                        }
                    ],
                    [
                        {
                            text: '👥 Реферальная система',
                            callback_data: 'templates'
                        }
                    ]
                ]
            }
        }, 'cdn/menu.png');
    }
}