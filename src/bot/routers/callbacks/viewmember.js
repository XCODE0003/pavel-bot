import { bot } from "../../index.js";
import user from "../../../database/schemas/user.js";
import Database from "../../../database/index.js";
import { declineDays, formatDate } from "../../../utils/index.js";
import TelegramBot from "node-telegram-bot-api";
import commission from "../../../database/schemas/commission.js";

export default {
    name: "vmember",
    async exec(query, [id]) {
        const t = await user.findOne({ id });
        if(!t) return await bot.answerCallbackQuery(query.id, {
            text: "❌ Пользователь не найден"
        });

        const logsUser = await Database.getLogsSummary(t.id);
        const registeredDays = Math.floor((Date.now() - t.reg) / (1000 * 60 * 60 * 24));
        const registeredDate = formatDate(new Date(t.reg));
        const registered = declineDays(registeredDays);

        await bot.editMessageText(`*💻 Личный кабинет

🆔 Ваш ID:* \`${id}\`
*🧾 Комиссия:* Каждый ${t.com || (await commission.findOne({})).value} лог

>📊 Получено логов: 
>За сегодня: ${logsUser.d}
>За месяц: ${logsUser.m}
>За всё время: ${logsUser.all}

*🗓 Дата регистрации:* \`${registeredDate}\`
*📆 В команде:* \`${registered}\``, {
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `🧾 Изменить комиссию`,
                            callback_data: `b:procent:a:${id}`
                        },
                    ],
                    [
                        {
                            text: !t.blocked? `❌ Заблокировать` : `✅ Разблокировать`,
                            callback_data: `block:${t.id}:${!t.blocked}`
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'b:admin'
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        })
    }
}