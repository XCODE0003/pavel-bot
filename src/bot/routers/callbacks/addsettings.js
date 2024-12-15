import { bot } from "../../index.js";

export default {
    name: "addsettings", 
    async exec(query, [x]) {
        await bot.editMessageCaption(query, `*⚙️ Дополнительные настройки*`, {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [ 
                        { 
                            text: `🗑️ Удалить все${x? ' домены' : 'х ботов'}`,
                             callback_data: x? 'deletealld' : "deleteall"
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: x? 'domains' : 'bots'
                        }
                    ]
                ]
            },
            parse_mode: "Markdown"
        });
    }
}