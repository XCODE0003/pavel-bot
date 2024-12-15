import axios from "axios";
import domain from "../../../database/schemas/domain.js"
import { bot } from "../../index.js";
import { createZone, updateDNSRecord } from '../../../cloudflare/api.js';
import config from '../../../../config.json' assert { type: 'json' };

export default {
    name: "cd",
    async exec(query, [template, token]) {
        try {
            const zoneData = await createZone(token);
            await new domain({
                worker: query.from.id,
                name: token,
                id: Date.now(),
                template: +template,
                zoneId: zoneData.id
            }).save();
            await updateDNSRecord(zoneData.id, 'A', token, config.ip_server);

            const nameservers = zoneData.name_servers;
            const nsText = nameservers.map(ns => `\`${ns}\`\n`).join('');

            await bot.editMessageCaption(query, `*Установите NS записи для домена:*\n\n${nsText}\n\n*После чего домен начнет работать в течении 24 часов*`, {
                message_id: query.message.message_id,
                chat_id: query.message.chat.id,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: `✅ Готово`,
                                callback_data: `domains`
                            }
                        ],
                        [
                            {
                                text: `🔙 Назад`,
                                callback_data: `domains`
                            }
                        ]
                    ]
                }
            }, 'cdn/domains.png');
        } catch (error) {
            if (error.message === "An identical record already exists.") {
                await bot.sendMessage(query.from.id,
                    `*Ваш домен уже был привязан, вам не нужно перевязывать ns записи, можете пользоваться*`,
                    { parse_mode: 'Markdown' }
                );
                return;
            } else {
                await bot.sendMessage(query.from.id,
                    `*❌ Ошибка при создании домена: ${error.message}*`,
                    { parse_mode: 'Markdown' }
                );
            }
        }

        const intr = setInterval(async () => {
            const response = await axios.get(`https://${token}/ready`)
                .catch(() => null);

            if (response) {
                clearInterval(intr);

                await bot.sendMessage(query.from.id, `*✅ Домен ${token} успешно установлен!*`, {
                    parse_mode: 'Markdown'
                })
            }
        }, 30 * 1000);

        setTimeout(() => {
            clearInterval(intr);
        }, 90000000);
    }
}