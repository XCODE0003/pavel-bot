import { Router, bot } from "./bot/index.js";
import Database from "./database/index.js";
import config from '../config.json' assert { type: 'json' };
import user from "./database/schemas/user.js";
import template from "./database/schemas/template.js";
import Bot from "./database/schemas/bot.js";
import notifyBot from "./notifyBot/index.js";
import scamBot from "./scamBot/index.js";
import botUser from "./database/schemas/botUser.js";
import log from "./database/schemas/log.js";

process.env.NTBA_FIX_350 = 1;

console.clear();
await Database.connect(config.db);
await new Router().route(bot);
notifyBot();
for(let bot of await Bot.find({ blocked: false })) {
    try {
        scamBot(bot.token, await template.findOne({ id: bot.template }) || {});
    } catch(e) {
        console.log(e)
    }
}

const day = new Date();
day.setDate(new Date().getDate() +1);
day.setHours(0, 0, 0, 0)

const interval = day.getTime() - Date.now();


async function send() {
    setTimeout(send, 86400000);
    const users = await user.find();
    
    for(let user of users) {
        let templates = await template.find({ owner: user.id });
        let templatesY = await template.find({ owner: user.id });

        if(!templates.length) continue;

        templates = await Promise.all(
            templates.map(async t => {
                const bots = await Bot.find({ template: t.id });

                const starts = (await Promise.all(
                    bots.map(async bot => {
                        return (await botUser.find({ botId: bot.id }))
                            .filter(x => {
                                return new Date(x.created).getDate() == (new Date().getDate() - 1);
                            }).length;
                    })
                ))
                    .reduce((a, b) => a + b, 0);

                const logs = (await Promise.all(
                    bots.map(async bot => {
                        return (await log.find({ bot: bot.token }))
                            .filter(x => {
                                return new Date(x.created).getDate() == (new Date().getDate() - 1);
                            }).length;
                    })
                ))
                    .reduce((a, b) => a + b, 0);

                return {
                    template: t.name,
                    starts: starts,
                    logs
                }
            })
        )

        templatesY = await Promise.all(
            templatesY.map(async t => {
                const bots = await Bot.find({ template: t.id });

                const logs = (await Promise.all(
                    bots.map(async bot => {
                        return (await log.find({ bot: bot.token }))
                            .filter(x => {
                                return new Date(x.created).getDate() == (new Date().getDate() - 2);
                            }).length;
                    })
                ))
                    .reduce((a, b) => a + b, 0);

                return {
                    template: t.name,
                    logs
                }
            })
        )

        const allLogs = templates.map(x => x.logs).reduce((a, b) => a + b, 0);
        const allLogsY = templatesY.map(x => x.logs).reduce((a, b) => a + b, 0)
        const msg = `<b>🌙  Наступил конец рабочего дня.</b>

ℹ️ <b>За сегодня Вы получили: ${allLogs} сессий. Это на </b><b>${Math.abs(allLogs - allLogsY)}</b> <b>${allLogs > allLogsY ? 'больше' : 'меньше'} чем за вчера. 

⚡️ Статистика по шаблонам:
</b>
${
    templates.map(t => {
        return `🤖 <b>${t.template}</b>: 
<b>🚀 Запуски:</b> <code>${t.starts}</code>
<b>📊 Получено логов:</b> <code>${t.logs}</code>`
    }).join('\n\n')
}


💎 Спасибо за выбор <code>TonLog</code>`

        await bot.sendMessage(user.id, msg, {
            parse_mode: 'HTML'
        })
            .catch(e => console.log(e.toString()));
    }
}

setTimeout(send, interval);

console.log(await bot.getMe());
// await user.deleteMany()
// await template.deleteMany();