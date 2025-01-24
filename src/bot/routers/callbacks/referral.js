import { bot } from "../../index.js";
import template from "../../../database/schemas/template.js";
import states from "../../states.js";
export default {
    name: "referral",
    async exec(query, [id, action]) {
        const t = await template.findOne({ id });
        if(!t) return await bot.answerCallbackQuery(query.id, {
            text: "❌ Шаблон не найден"
        });

        let message = `<b>👥 Реферальная система</b>

<i>❔ Пользователь после авторизации может приглашать друзей.</i>

<b>❕Спец.метки в сообщениях:</b>
<code>$refdrygname</code> - имя пользователя который пригласил
<code>$refname</code> - имя пользователя который присоединился
<code>$refmax</code> - сколько людей нужно пригласить
<code>$refskok</code> - сколько людей пригласил
<code>$link</code> - реферальная ссылка`;

        let keyboard = query.message.reply_markup.inline_keyboard;
        if(action === 'referralToggle') {
            await template.findOneAndUpdate(
                { id: id },
                { $set: { referral_system_on: !t.referral_system_on } }
            );
            
            keyboard[0][0].text = `Реферальная система ${t.referral_system_on ? '🟢' : '🔴'}`;
            
            return await bot.editMessageCaption(query, message, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: keyboard
                }
            });
        }
        else if(action === 'referralJoinNotify') {
            states.set(query.from.id, { 
                action: 'editReferralJoinNotify', 
                args: [id]  
            });
            
            return await bot.sendMessage(query.from.id, `<b>🔔 Уведомление пользователю о новом реферале.</b>
                
<i>❔ Сообщение которое приходит после того как кто-то перешел по реф.ссылке.</i>
                
<b>Значение сейчас:</b> ${t.referral_notify_join || 'Пусто'}
                
<b>Введите новое значение:</b>`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🔙 Назад', callback_data: `referral:${id}` }
                    ]]
                }
            });

        }
        else if(action === 'referralAuthNotify') {
            states.set(query.from.id, { 
                action: 'editReferralAuthNotify', 
                args: [id]  
            });
            return await bot.sendMessage(query.from.id, `<b>🛎 Уведомление успешной авторизации реферала.</b>
                
<i>❔Сообщение приходит когда реферал прошел авторизацию в боте.</i>
                
<b>Значение сейчас:</b> ${t.referral_notify_auth || 'Пусто'}
                
<b>Введите новое значение:</b>`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🔙 Назад', callback_data: `referral:${id}` }
                    ]]
                }
            });
        }
        else if(action === 'editRefMessage') {
            states.set(query.from.id, { 
                action: 'editRefMessage', 
                args: [id]  
            });
            
            return await bot.sendMessage(query.from.id, `<b>💬 Реферальное сообщение после авторизации.</b>
                
<i>❔Сообщение отправляется после сообщения "Сообщение после авторизации"</i>
                
<b>Значение сейчас:</b> ${t.referral_message || 'Пусто'}
                
<b>Введите новое сообщение:</b>`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🔙 Назад', callback_data: `referral:${id}` }
                    ]]
                }
            });
        }
        else if(action === 'editCountFriend') {
            states.set(query.from.id, { 
                action: 'editCountFriend', 
                args: [id]  
            });
            return await bot.sendMessage(query.from.id, `<b>👥 Укажите количество нужно пригласить в бота.</b>

<i>❔ Советуем указать двоих, чтобы пользователь не делал спам, а пригласил своих близких которые могут помочь пользователю выполнить задание.</i>
<i>❗️ Отправляйте сообщение цифрами.</i>

<b>Значение сейчас:</b> <code>${t.referral_count || 0}</code>

<b>Введите новое значение:</b>`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🔙 Назад', callback_data: `referral:${id}` }
                    ]]
                }
            });
        }
        else if(action === 'referralWelcome') {
            states.set(query.from.id, { 
                action: 'editReferralWelcome', 
                args: [id]  
            });

            return await bot.sendMessage(query.from.id, `<b>👋🏻 Вступительное сообщение для реферала.</b>

<i>❔ Сообщение приходит вместо "Вступительного сообщения" пользователю который перешел по ссылке.</i>

<b>Значение сейчас:</b> ${t.referral_welcome || 'Пусто'}

<b>Введите новое значение:</b>`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🔙 Назад', callback_data: `referral:${id}` }
                    ]]
                }
            });
        }
        else if(action === 'referralGoal') {
            states.set(query.from.id, { 
                action: 'editReferralGoal', 
                args: [id]  
            });

            return await bot.sendMessage(query.from.id, `<b>⭐️ Сообщение после выполнения цели реферала.</b>

<i>❔ Это сообщение придет когда пользователь пригласит максимальное количество рефералов.</i>

<b>Значение сейчас:</b> ${t.referral_goal || 'Пусто'}

<b>Введите новое значение:</b>`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🔙 Назад', callback_data: `referral:${id}` }
                    ]]
                }
            });
        }


        await bot.editMessageCaption(query, message, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `Реферальная система ${t.referral_system_on ? '🟢' : '🔴'}`,
                            callback_data: `referral:${id}:referralToggle`
                        }
                    ],
                    [
                        {
                            text: '💬 Реф.сообщение',
                            callback_data: `referral:${id}:editRefMessage`
                        }
                    ],
                    [
                        {
                            text: `👥 Сколько нужно пригласить (${t.referral_count || 0})`,
                            callback_data: `referral:${id}:editCountFriend`
                        }
                    ],
                    [
                        {
                            text: `🔔 Увед.перехода рефа`,
                            callback_data: `referral:${id}:referralJoinNotify`
                        }
                    ],
                    [
                        {
                            text: `🛎 Увед.успешной авториз.рефа`,
                            callback_data: `referral:${id}:referralAuthNotify`
                        }
                    ],
                    [
                        {
                            text: '👋🏻 Вступ.сообщение рефа',
                            callback_data: `referral:${id}:referralWelcome`
                        }
                    ],
                    [
                        {
                            text: '⭐️ Цель сообщение рефа',
                            callback_data: `referral:${id}:referralGoal`
                        }
                    ],
                    [
                        {
                            text: '🔙 Назад',
                            callback_data: `t:${id}`
                        }
                    ]
                ]
            },
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        }, 'cdn/templates.png')
    }
}