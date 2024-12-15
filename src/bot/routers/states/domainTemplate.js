import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import states from "../../states.js";
import template from "../../../database/schemas/domainTemplate.js";
import {validateLink} from "../../../utils/index.js";

const reply_markup = {
    inline_keyboard: [
        [
            {
                text: '🔙 Назад',
                callback_data: 'b:templatess'
            }
        ]
    ]
}

export default {
    name: "templates",
    async exec(message, args) {
        if(!message.text) return;
        if(!args[1]) {
            states.set(message.from.id, { action: "templates", args: [...args, message.text]})
            return await bot.sendMessage(message.from.id, args[0] === 'bot'? `*Введите username:\n\n💡 Пример: @username*` : `*Введите количество подписчиков\n\n💡 Пример: *10 000`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        if(!args[2]) {
            if(args[0] !== 'bot') {
                message.text += ` subscribers`;
            } else {
                message.text = `@` + message.text.replaceAll('@', '');
            }
            
            states.set(message.from.id, { action: "templates", args: [...args, message.text]})
            return await bot.sendMessage(message.from.id, `<b>Отправьте прямую ссылку на аватарку:
                
💡 Загрузить аватарку можно через </b><a href="https://imgur.com/"><b>imgur.com</b></a>`, {
                parse_mode: 'HTML',
                reply_markup
            })
        }

        if(!args[3]) {
            if(!validateLink(message.raw))
            {
                return await bot.sendMessage(message.from.id, `*Введите корректную ссылку*`,
                    {
                        parse_mode: 'Markdown'
    
                    });
            }
            states.set(message.from.id, { action: "templates", args: [...args, message.raw]})
            return await bot.sendMessage(message.from.id, `*Введите био канала*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }

        const [type, name, desc, image] = args;
        await new template({ id: Date.now(), owner: message.from.id, type, name, desc, image, bio: message.text }).save();

        states.delete(message.from.id);
        return await bot.sendMessage(message.from.id, `*Шаблон создан*`, {
            parse_mode: 'Markdown',
            reply_markup
        });
    }
}