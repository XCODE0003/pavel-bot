import { bot } from "../../index.js";
import Database from "../../../database/index.js";
import config from '../../../../config.json' assert { type: 'json' };
import commission from "../../../database/schemas/commission.js";
import states from "../../states.js";

export default {
    name: "procent",
    async exec(query, [a, id]) {
        if(a) {
            await bot.sendMessage(query.message.chat.id, `🧾 Введите комиссию панели.
                
<b>Значение сейчас:</b> ${(await commission.findOne({ })).value}


<b>Введите новое значение:</b>`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: 'admin'
                            }
                        ]
                    ]
                }
            });

            return states.set(query.from.id, {
                action: 'com',
                args: [id]
            })
        }
    }
}