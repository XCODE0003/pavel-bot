import { bot } from "../../index.js";
import Database from "../../../database/index.js";
import market from "../../../database/schemas/market.js";
import states from "../../states.js";

export default {
    name: "edit_en_title",
    async exec(query) {
        const user = await Database.getUser(query.from.id);
        const m = await market.findOne({ token: user.lzt });

        await bot.editMessageCaption(query, `*🇬🇧 Название на Английском | Значение сейчас:* \`${m.en || 'title'}\`

❔ Введите новое название ниже.`, {
            parse_mode: 'Markdown',
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            reply_markup: {
                inline_keyboard: [[
                    { text: '🔙 Назад', callback_data: 'lzt:announcement' }
                ]]
            }
        });

        states.set(query.from.id, {
            action: 'editEnTitle',
            args: [],
            messageId: query.message.message_id,
            chatId: query.message.chat.id
        });
    }
} 