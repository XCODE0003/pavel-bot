import { bot } from "../../index.js";
import Database from "../../../database/index.js";
import market from "../../../database/schemas/market.js";
import User from "../../../database/schemas/user.js";
import states from "../../states.js";

export default {
    name: "lztoff",
    async exec(query, [x]) {
        await bot.editMessageCaption(query, `*Для включения авто-продажи на LZT необходимо её настроить 👇*`, {
            parse_mode: 'Markdown',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `⚙️ Настройки`,
                            callback_data: x? `lztadmin:settings` : 'lzt:settings'
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: x? `lztadmin` : 'lzt'
                        }
                    ]
                ]
            }
        });
    }
}