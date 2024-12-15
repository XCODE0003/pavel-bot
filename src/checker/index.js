import { bot } from "../bot/index.js"
import config from '../../config.json' assert { type: 'json' };
import user from "../database/schemas/user.js";
import start from "../bot/routers/commands/start.js";

export default (id, msg) => {
    let i = 0;
    const interval = setInterval(async () => {
        const { status } = await bot.getChatMember(isNaN(+config.channel)? (await bot.getChat(`@${config.channel}`)).id : config.channel, id)
                .catch(() => ({ status: 'error' }));
                
        if(status !== 'left' && status !== 'error') {
            clearInterval(interval);
            await user.updateOne({ id }, { $set: { member: true }});
            await bot.deleteMessage(id, msg);
            return await start.exec({ from: { id }});
        }
        if(i++ === 3600) return clearInterval(interval);
    }, 1000)
}