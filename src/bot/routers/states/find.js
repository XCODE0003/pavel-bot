import { bot } from "../../index.js"
import states from "../../states.js";
import user from "../../../database/schemas/user.js";

export default {
    name: "find",
    /**
     * @param { import("node-telegram-bot-api").Message } message
     */
    async exec(message) {
        const users = await user.find({ $or: [
            {
                id: isNaN(+message.text)? 666 : message.text
            }, {
                name: {
                    $regex: message.text,
                    $options: 'i'
                }
            }, {
                wallet: {
                    $regex: message.text
                }
            }
        ]});

        await bot.sendMessage(message.from.id, "*Найдены пользователи:*", {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    ...users.map(member => [
                        {
                            text: member.name? `${member.name}` : `#${member.id}`,
                            callback_data: `vmember:${member.id}`
                        }
                    ]),
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: `b:admin`
                        }
                    ]
                ]
            }
        });

        states.delete(message.from.id);
    }
}