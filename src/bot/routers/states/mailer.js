import { bot } from "../../index.js";
import states from "../../states.js";
import tempMessageState from "../../tempMessageState.js";

export default {
    name: "mailer",
    async exec(message, [id, action]) {
        if(!message.text) return;
        states.delete(message.from.id);
        tempMessageState.set(message.from.id, message.text)
        
        const options = { parse_mode: 'HTML', reply_markup: {
            inline_keyboard: [
                
                [
                    {
                        text: `➕ Добавить кнопку`,
                        callback_data: `w:${id}:a`
                    }
                ],
                [
                    {
                        text: `✅ Отправить`,
                        callback_data: `w:${id}:${action || 's'}`
                    }
                ],
                [
                    {
                        text: '🔙 Назад',
                        callback_data: action == 'allBots' ? 'bots' : id? `bot:${id}` : 'admin'
                        
                    }
                ]
            ]
        } };

        if(message.photo?.[0]) {
            options.caption = message.text;
            await bot.sendPhoto(message.from.id, message.photo[message.photo.length - 1].file_id, options)
        } else {
            await bot.sendMessage(message.from.id, message.text, options)
        }

        return states.delete(message.from.id);
        // let users
        // if(!id) {
        //     users = await u.find();
        // } else {
        //     users = await botUser.find({ botId: id });
        // }

        // let i = 0;
        // for(let user of users) {
        //     if(user.id === message.from.id) continue;
        //     await bot.sendMessage(user.id, message.text, { parse_mode: 'Markdown' })
        //         .catch(() => i++)
        // }

        // await bot.deleteMessage(msg.chat.id, msg.message_id);
        // await bot.sendMessage(message.chat.id, `Рассылка завершена\n\nУспешно: ${users.length - i - 1}\nОшибок: ${i}`);
    }
};