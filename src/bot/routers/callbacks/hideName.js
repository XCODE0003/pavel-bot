import { bot } from "../../index.js";
import user from "../../../database/schemas/user.js";

export default {
    name: "hideName",
    async exec(query, [type, time]) {
        await user.updateOne({ id: query.from.id }, { $set: { hiden: type === 'true' }});
        query.data = `top:${time}:true`
        bot.emit('callback_query', query);
    }
}