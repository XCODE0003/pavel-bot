import { bot } from "../../index.js";
import states from "../../states.js";
import {validateLink} from "../../../utils/index.js";

export default {
    name: "addButton",
    async exec(message, [t, id, text, buttons, photo]) {
        if(!message.text) return;

        if(!t) {
            const x = Date.now().toString();
            const y = (Date.now() + 1).toString();

            bot.addListener('callback_query', async (query) => {
                if(query.data === y) {
                    const options = { parse_mode: 'HTML', reply_markup: {
                        inline_keyboard: buttons
                    } };
                    
                    await bot.deleteMessage(query.message.chat.id, query.message.message_id);

                    if(photo) {
                        options.caption = text;
                        await bot.sendPhoto(message.from.id, photo.file_id, options)
                            .catch(console.log)
                    } else {
                        await bot.sendMessage(message.from.id, text, options)
                            .catch(console.log)
                    }
                    return states.delete(message.from.id);
                }

                if(query.data !== x) return;
                await bot.deleteMessage(query.message.chat.id, query.message.message_id);

                states.set(message.from.id, { action: 'addButton', args: [message.text, id, text, buttons, photo]})
                message.text = 'b:start';

                bot.emit('message', message);
            })

            states.set(message.from.id, { action: 'addButton', args: [message.text, id, text, buttons, photo]})
            return await bot.sendMessage(message.from.id, `*Введите ссылку кнопки*`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🏠 На старт',
                                callback_data: x
                            }
                        ],
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: y
                            }
                        ]
                    ]
                },
                parse_mode: 'Markdown'
            });
        }
        if(!validateLink(message.raw) && !message.text.startsWith('b:'))
        {
            return await bot.sendMessage(message.from.id, `*Введите корректную ссылку*`,
                {
                    parse_mode: 'Markdown'
                });
        }
        states.delete(message.from.id);

        const options = { parse_mode: 'HTML', reply_markup: {
            inline_keyboard: [
                message.text.startsWith('b:') ? [{
                    text: t,
                    callback_data: message.text
                }] : [
                    {
                        text: t,
                        url: message.raw
                    }
                ],
                ...buttons
            ]
        } };

        if(photo) {
            options.caption = text;
            await bot.sendPhoto(message.from.id, photo.file_id, options)
                .catch(console.log)
        } else {
            await bot.sendMessage(message.from.id, text, options)
                .catch(console.log)
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