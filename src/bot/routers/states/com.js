import { bot } from "../../index.js";
import states from "../../states.js";
import commission from "../../../database/schemas/commission.js";
import user from "../../../database/schemas/user.js";

export default {
    name: "com",
    async exec(message, [id]) {
        if (!message.text) return;

        if (!id) await commission.findOneAndUpdate({}, { $set: { value: +message.text } })
        else await user.findOneAndUpdate({ id }, { $set: { com: +message.text } });

        states.delete(message.from.id);
        await bot.sendMessage(message.from.id, `*✅ Комиссия успешно изменена*`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: id ? `vmember:${id}` : `b:admin`
                        }
                    ]
                ]
            },
            parse_mode: "Markdown"
        });
    }
}