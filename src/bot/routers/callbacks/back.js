import { bot } from "../../index.js";

export default {
    name: "b",
    async exec(query, args) {
        query.data = query.data.replace('b:', '');
        bot.emit('callback_query', query);
    }
};