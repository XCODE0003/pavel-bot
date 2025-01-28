import { bot } from "../../index.js";
import template from "../../../database/schemas/template.js";
import states from "../../states.js";
import Commission from "../../../database/schemas/commission.js";
export default {
    name: "proxy",
    async exec(query, [type]) {
        let message = `🌐 Выберите активные прокси.

📊 Статус:
🟢 Ake.net
🟢 iproyal`;
        if(type){
            const commission = await Commission.findOne();
            commission.proxy = type;
            await commission.save();
     
            return bot.editMessageText(message, {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: `${commission.proxy === "ake" ? "✅" : ""} Ake.net `,
                                callback_data: "proxy:ake"
                            },
                            {
                                text: `${commission.proxy === "iproyal" ? "✅" : ""} iproyal `,
                                callback_data: "proxy:iproyal" 
                            }
                        ],
                        [
                            {
                                text: "🔙 Назад",
                                callback_data: "start"
                            }
                        ]
                    ]
                }
            });
        }
        const commission = await Commission.findOne();

        await bot.sendMessage(query.from.id, message, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `${commission.proxy === "ake" ? "✅" : ""} Ake.net `,
                            callback_data: "proxy:ake"
                        },
                        {
                            text: `${commission.proxy === "iproyal" ? "✅" : ""} iproyal `,
                            callback_data: "proxy:iproyal" 
                        }
                    ],
                    [
                        {
                            text: "🔙 Назад",
                            callback_data: "admin"
                        }
                    ]
                ]
            }
        });
    }
}