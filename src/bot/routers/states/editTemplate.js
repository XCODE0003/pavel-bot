import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import states from "../../states.js";
import template from "../../../database/schemas/template.js";
import dtemplate from "../../../database/schemas/domainTemplate.js";
import { validateLink } from "../../../utils/index.js";
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

export default {
    name: "editt",
    async exec(message, [id, action]) {





        if (!message.text) return;
        let obj = {};
        obj[action] = message.raw !== '/старт' ? message.text : 'Старт';
        console.log(message.photo)
        if (action === 'start') {
            if (message.photo) {
                try {
                    const photo = message.photo[message.photo.length - 1];
                    const file = await bot.getFile(photo.file_id);

                    const uploadDir = 'uploads';
                    await fs.mkdir(uploadDir, { recursive: true });

                    const fileName = `${Date.now()}_${message.from.id}.jpg`;
                    const relativePath = path.join(uploadDir, fileName);

                    const fileUrl = `https://api.telegram.org/file/bot${config.token}/${file.file_path}`;
                    const response = await axios({
                        method: 'get',
                        url: fileUrl,
                        responseType: 'arraybuffer'
                    });

                    await fs.writeFile(relativePath, response.data);

                    obj[action] = message.text;
                    obj.media_startbot = relativePath;
                } catch (error) {
                    obj[action] = message.text;
                }
            } else {
                obj[action] = message.text;
                obj.media_startbot = null;
            }
        }
        if ((action === 'url' || action === 'urlUnauth' || action === 'image') && message.raw !== '/старт') {
            if (!validateLink(message.raw)) {
                return await bot.sendMessage(message.from.id, `*Введите корректную ссылку*`,
                    {
                        parse_mode: 'Markdown'

                    });
            }
            obj[action] = message.raw;
        }

        if (action === 'desc') {
            const t = (await dtemplate.findOne({ id })).type === 'bot';

            obj[action] = t ? `@${message.raw.replace('@', '')}` : `${message.raw} subscribers`;
        }
        const x = await template.findOneAndUpdate({ id }, { $set: obj });
        await dtemplate.findOneAndUpdate({ id }, { $set: obj });
        states.delete(message.from.id);
        await bot.sendMessage(message.from.id, `*✅ Параметр успешно изменен*`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: x ? `b:t:${id}` : `b:ts:${id}`
                        }
                    ]
                ]
            },
            parse_mode: "Markdown"
        });
    }
}