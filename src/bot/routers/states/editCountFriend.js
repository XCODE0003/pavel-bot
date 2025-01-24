import { bot } from "../../index.js";
import template from "../../../database/schemas/template.js";
import Database from "../../../database/index.js";
import states from "../../states.js";

export default {
    name: "editCountFriend",
    async exec(message, args) {
        const user = await Database.getUser(message.from.id);
        const state = states.get(message.from.id);

        await template.findOneAndUpdate(
            { id: args[0] },
            { $set: { referral_count: message.text } }
        );
        
        return await bot.sendPhoto(message.from.id, 'cdn/templates.png', {
            caption: `<b>✅ Количество приглашенных людей успешно обновлено!</b>`,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    { text: '🔙 Назад', callback_data: `referral:${args[0]}` }
                ]]
            }
        });
    }
} 