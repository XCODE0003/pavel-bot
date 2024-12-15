import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import states from "../../states.js";
import template from "../../../database/schemas/template.js";
import botModel from "../../../database/schemas/bot.js";

export default {
    name: "editt",
    async exec(query, [id, action, confirm]) {
        const t = await template.findOne({ id }) || await dtemplate.findOne({ id });
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
            return await bot.editMessageCaption(query, `*✅ Шаблон успешно удален*`, {
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

        states.set(query.from.id, { action: 'editt', args: [id, action] })
        await bot.editMessageCaption(query, `<b>Значение сейчас:</b>
${t[action]}

Введите новое значение:${action.startsWith('url') ? `

<b>💡Для того что бы после нажатия кнопки бот повторно отправил Ваш оффер введите: /cтарт</b>` : ''}`, {
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