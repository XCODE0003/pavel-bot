import { bot } from "../../index.js";
import Database from "../../../database/index.js";

export default {
    name: "top",
    async exec(query, [time, x]) {
        // Получаем текущую дату
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);

        // Выполняем запросы параллельно
        const [user, topUsers] = await Promise.all([
            Database.getUser(query.from.id),
            Database.getTopUsers(time)
        ]);

        const timeLabels = {
            all: 'все время',
            m: 'месяц',
            day: 'сутки'
        };

        const topUsersText = topUsers
            .map((u, i) => `${i + 1}. ${u.hiden || u.name === null ? `<b>🥷 Скрыт</b>` : u.name} - ${u.logsCount}`)
            .join('\n');

        try {
            await bot.editMessageCaption(query,
                `<b>🏆 Топ партнеров ${timeLabels[time]}</b>\n\n${topUsersText}`,
                {
                    parse_mode: 'HTML',
                    message_id: query.message.message_id,
                    chat_id: query.message.chat.id,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: `${time === 'all' ? '• ' : ''}За все время`,
                                    callback_data: 'top:all:true'
                                },
                                {
                                    text: `${time === 'm' ? '• ' : ''}За месяц`,
                                    callback_data: 'top:m:true'
                                },
                                {
                                    text: `${time === 'day' ? '• ' : ''}За сутки`,
                                    callback_data: 'top:day:true'
                                }
                            ],
                            [{
                                text: user.hiden ? '🥷 Ваш ник скрыт' : '⚡️ Ваш ник открыт',
                                callback_data: `hideName:${!user.hiden}:${time}`
                            }],
                            [{
                                text: '🔙 Назад',
                                callback_data: 'start'
                            }]
                        ]
                    }
                },
                'cdn/top.png',
                x
            );
        } catch (error) {
            console.error('Error in editMessageCaption:', error);
        }
    }
}
