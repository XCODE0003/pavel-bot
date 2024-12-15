import { bot } from "../../index.js";
import template from "../../../database/schemas/domainTemplate.js";

export default {
    name: "ts",
    async exec(query, [id]) {
        const t = await template.findOne({ id });
        if(!t) return await bot.answerCallbackQuery(query.id, {
            text: "❌ Шаблон не найден"
        });

        await bot.editMessageCaption(query, `*📁 Шаблон:* \`${t.name}\`
*💻 Формат:* \`${t.type === 'bot'? 'Бот' : 'Канал'}\`

Выберите что хотите изменить`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: t.type === 'bot'? "Username" : `Подписчики`,
                            callback_data: `editt:${id}:desc`
                        }
                    ],
                    [
                        {
                            text: `Описание`,
                            callback_data: `editt:${id}:bio`
                        }
                    ],
                    [
                        {
                            text: `Аватарка`,
                            callback_data: `editt:${id}:image`
                        }
                    ],
                    [
                        {
                            text: '🗑 Удалить',
                            callback_data: `editt:${id}:delete`
                        },
                        {
                            text: '🔙 Назад',
                            callback_data: 'templatess'
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        }, 'cdn/templates.png')
    }
}