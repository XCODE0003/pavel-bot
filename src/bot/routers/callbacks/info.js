import { bot } from "../../index.js";
import Database from "../../../database/index.js";
import config from '../../../../config.json' assert { type: 'json' };
import {declineDays} from "../../../utils/index.js";

export default {
    name: "info",
    async exec(query) {
        const openedProjectDate = new Date(config.opened_project_date.split('.').reverse().join('-'));
        const registeredDays = Math.floor((Date.now() - openedProjectDate) / (1000 * 60 * 60 * 24));
        const openedProjectDays = declineDays(registeredDays);

        const statisticProject = await Database.getStatisticProject();

        await bot.editMessageCaption(query, `*📃 Информация*

> *📊 Статистика проекта: * 
>  За сегодня: \`${statisticProject.logs.d}\`
>  За месяц: \`${statisticProject.logs.m}\`
>  За всё время: \`${statisticProject.logs.all}\`


*📆 Команде:* \`${openedProjectDays}\``, {
            parse_mode: 'MarkdownV2',
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `🧑‍💻 Поддержка`,
                            url: config.owner
                        },
                        {
                            text: '👤 Наш чат',
                            url: config.chat
                        }
                    ],
                    [
                        {
                            text: '📄Наш Канал',
                            url: config.channel_url
                        }
                    ],
                    [
                        {
                            text: '📚 Знакомство с панелью ',
                            url: 'https://teletype.in/@tonlog/znakomstvo'
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: 'start'
                        }
                    ]
                ]
            }
        }, 'cdn/information.png');
    }
}