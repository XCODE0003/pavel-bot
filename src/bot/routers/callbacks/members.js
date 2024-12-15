import user from "../../../database/schemas/user.js";
import { bot } from "../../index.js";
import _ from 'lodash';

export default {
    name: "members",
    /**
     * @param { import("node-telegram-bot-api").CallbackQuery } query
     */
    async exec(query, [ page ]) {
        page = page? +page : 0
        const users =  _.chunk(await user.find(), 10)[page];
        if(!users) return await bot.answerCallbackQuery(query.id, {
            text: `Page not found`
        });

        await bot.editMessageCaption(query, "Список участников", {
            reply_markup: {
                inline_keyboard: [
                    ...users.map(member => [
                        {
                            text: member.username? `@${member.username}` : `#${member.id}`,
                            callback_data: `member:${member.id}`
                        }
                    ]),
                    [
                        {
                            text: `🔙`,
                            callback_data: `members:${page - 1}`
                        },
                        {
                            text: `➡️`,
                            callback_data: `members:${page + 1}`
                        }
                    ],
                    [
                        {
                            text: "🔙 Назад",
                            callback_data: `admin`
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        });
    }
}