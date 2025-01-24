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
            return await bot.sendMessage(message.from.id, args[0] === 'bot'? `<b>📘 Введите username бота</b>
❔ Username будет отображаться на странице лендинга\n💡 Пример: @tonlogpanelbot` : `<b>📘 Введите количество подписчиков</b>💡 Пример: <code>10 000</code>`, {
                parse_mode: 'HTML',
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
            return await bot.sendMessage(message.from.id, `<b>🖼 Отправьте адрес ссылки на аватарку.

1. Перейдите на сайт </b><a href="https://imgur.com/"><b>imgur.com</b></a>
2. <b>Нажмите права вверху "New Post"</b>
3. <b>Выберите медиафайл, загрузите его</b>
4. <b>Нажмите на фотографию правой кнопкой мышки и нажмите "копировать URL картинки"</b>
5. <b>Отправьте полный адрес ссылки в чат</b>`, {
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