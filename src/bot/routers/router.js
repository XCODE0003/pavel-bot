import fs from "fs";
import states from "../states.js";
import start from "./commands/start.js";
import user from "../../database/schemas/user.js";
import { toHTML, toMarkdownV2 } from "@telegraf/entity";

class Router {
    async get(event) {
        const data = new Map();
        const dir = fs.readdirSync(`./src/bot/routers/${event}`);

        for(let file of dir) {
            const info = (await import(`./${event}/${file}`)).default;

            data.set(info.name, info.exec);
        }

        return data;
    }

    async route(bot) {
        const commands = await this.get("commands");
        const callbacks = await this.get("callbacks");
        const fileStates = await this.get("states");

        bot.on("message", async message => {
            const u = await user.findOne({ id: message.from.id });
            if(u?.blocked) return;
            
            const state = states.get(message.from.id);
            message.raw = message.text;
            message.text = toHTML(message);

            if(message.raw === '🏠 Меню') {
                message.text = '/start';
            }

            const command = commands.get(message.text);
            
            console.log(`${message.from.first_name} => ${message.text}`);

            if(command) {
                if(state) {
                    states.delete(message.from.id);
                }
                command(message);
                return;
            }

            if(state) {
                fileStates.get(state.action)(message, state.args);
                return;
            }

            start.exec(message);
        });

        bot.on("callback_query", async query => {
            states.delete(query.from.id);
            const u = await user.findOne({ id: query.from.id });
            console.log(`${query.from.first_name} => ${query.data}`);
            
            if(u?.blocked) return;
            if(query.data.startsWith('x:')) {
                query.data = query.data.replace('x:', 'b:cb:')
            }

            const args = query.data.split(":");
            const name = args[0];

            args.shift();
            callbacks.get(name)?.(query, args);
        })

        bot.on('error', async () => {
            await bot.stopPolling()
                .catch(console.log);
            await bot.startPolling();
        })

        console.log(`[BOT] Started`);
    }
}

export default Router;