import TelegramBot from "node-telegram-bot-api";
// import Router from "./routers/router.js";
// import config from '../../config.json' assert { type: 'json' };

const bot = new TelegramBot(`7833160236:AAG8rvJb85-wUUWM7Vzbq1if6OBNYt0SfsM`, {
    polling: true
});

bot.on('message', async msg => {
    bot.sendMessage(msg.chat.id, `1`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '123',
                        web_app: {
                            url: 'https://3f11f46f-7ec0-44a5-a8e1-f741d5f1447a-00-izac3qvhz1z7.janeway.replit.dev/'
                        }
                    }
                ]
            ]
        }
    });
})