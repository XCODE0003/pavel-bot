import log from "../../../database/schemas/log.js";
import User from "../../../database/schemas/user.js";
import { bot } from "../../index.js";

export default {
    name: "member",
    /**
     * @param { import("node-telegram-bot-api").CallbackQuery } query
     */
    async exec(query, [ id, action ]) {
        if(action) {
            return;
        }
        const user =  await User.findOne({ id });

        if(!user) return;

        await bot.editMessageCaption(query, `ID: ${id}\nLZT: ${user.lzt || '-'}\nЛогов: ${(await log.find({ worker: id })).length}`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: user.banned? `Разблокировать`: 'Заблокировать',
                            callback_data: `member:${id}:ban:${!user.banned}`
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: `members`
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        });
    }
}