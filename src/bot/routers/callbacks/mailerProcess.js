import TelegramBot from "node-telegram-bot-api";
import botUser from "../../../database/schemas/botUser.js";
import u from "../../../database/schemas/user.js";
import { bot } from "../../index.js";
import states from "../../states.js";
import tempMessageState from "../../tempMessageState.js";
import Bot from "../../../database/schemas/bot.js";

export default {
    name: "w",
    async exec(query, [id, action]) {
        if(query.message.reply_markup.inline_keyboard.length > 5) return await bot.answerCallbackQuery(query.id, {
            text: '❌ Привышен лимит кнопок'
        })

        if(action === 'a') {
            let buttons = query.message.reply_markup.inline_keyboard;
            const x = Date.now().toString();

            bot.on('callback_query', async (q) => {
                if(q.data !== x) return;
                await bot.deleteMessage(q.message.chat.id, q.message.message_id);

                if(query.message.photo?.[0]) {
                    await bot.sendPhoto(query.from.id, query.message.photo[query.message.photo.length - 1].file_id, { caption: tempMessageState.get(query.from.id), parse_mode: 'HTML', reply_markup: {
                        inline_keyboard: buttons
                    } })
                } else {
                    await bot.sendMessage(query.from.id, tempMessageState.get(query.from.id), { parse_mode: 'HTML', reply_markup: {
                        inline_keyboard: buttons
                    } })
                }
            })
            await bot.deleteMessage(query.message.chat.id, query.message.message_id);
            await bot.sendMessage(query.from.id, `*Введите текст кнопки*`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: x
                            }
                        ]
                    ]
                }
            });

            console.log(query.message)
            return states.set(query.from.id, {
                action: 'addButton',
                args: [null, id, tempMessageState.get(query.from.id), query.message.reply_markup.inline_keyboard, query.message.photo?.[query.message.photo.length - 1]]
            })
        }

        await bot.deleteMessage(query.message.chat.id, query.message.message_id);
        let users, scamBot;
        if(id == 'null') {
            users = await u.find();
        } else {
            users = await botUser.find({ botId: id });
            scamBot = new TelegramBot(
                await Bot.findOne({ id })
                    .then(b => b.token)
            )
        }

        let buttons = query.message.reply_markup.inline_keyboard;
        buttons.pop();
        buttons.pop();
        buttons.pop();

        let i = 0;
        for(let user of users) {
            if(user.id === query.from.id) continue;
            if(query.message.photo?.[0]) {
                await (scamBot || bot).sendPhoto(user.id, query.message.photo[query.message.photo.length - 1].file_id, { caption: tempMessageState.get(query.from.id), parse_mode: 'HTML', reply_markup: {
                    inline_keyboard: buttons
                } })
                    .catch(() => i++)
            } else {
                await (scamBot || bot).sendMessage(user.id, tempMessageState.get(query.from.id), { parse_mode: 'HTML', reply_markup: {
                    inline_keyboard: buttons
                } })
                    .catch(() => i++)
            }
        }

        await bot.sendMessage(query.from.id, `*✅ Рассылка завершена*\n\n*🔔 Доставлено:* \`${users.length - i}\`\n*🔕 Не доставлено:* \`${i}\``, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: id == 'null' ? 'admin' : `bot:${id}`
                        }
                    ]
                ]
            }
        })
    }
}