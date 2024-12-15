import TelegramBot from "node-telegram-bot-api";
import Router from "./routers/router.js";
import config from '../../config.json' assert { type: 'json' };

const bot = new TelegramBot(config.token, {
    polling: true
});

bot.updateCatption = bot.editMessageCaption;
bot.editMessageCaption = async (query, text, options, photo, real = false) => {
    if(real) {
        if(photo) {
            await bot.editMessageMedia({
                'caption': text,
                'type': 'photo',
                media: `attach://${photo}`,
                'parse_mode': options.parse_mode
            }, options)
        }
        return await bot.updateCatption(text, options);
    }
    
    await bot.deleteMessage(query.message.chat.id, query.message.message_id);
    await bot.sendPhoto(query.from.id, photo || query.message.photo[query.message.photo.length - 1].file_id, {
        ...options,
        caption: text
    })
}

export { bot, Router };