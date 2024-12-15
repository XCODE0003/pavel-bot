import fetch from 'node-fetch';
import config from './../../config.json' assert { type: 'json' };

const CF_API_EMAIL = config.cloudflare_api_email;
const CF_API_KEY = config.cloudflare_api_key;
const CF_API_URL = 'https://api.cloudflare.com/client/v4';

async function getAccountId() {
    const response = await fetch(`${CF_API_URL}/accounts`, {
        method: 'GET',
        headers: {
            'X-Auth-Email': CF_API_EMAIL,
            'X-Auth-Key': CF_API_KEY,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (data.success) {
        return data.result[0].id;
    }
    return { success: false, error: 'Ошибка при получении ID аккаунта' };
}

export async function getDomains() {
    const response = await fetch(`${CF_API_URL}/zones`, {
        method: 'GET',
        headers: {
            'X-Auth-Email': CF_API_EMAIL,
            'X-Auth-Key': CF_API_KEY,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (data.success) {
        return data.result;
    }
    return { success: false, error: 'Ошибка при получении доменов' };
}

export async function createZone(domainName) {
    try {
        const accountId = await getAccountId();
        if (!accountId || accountId.success === false) {
            throw new Error(accountId.error || 'Ошибка при получении ID аккаунта');
        }

        const response = await fetch(`${CF_API_URL}/zones`, {
            method: 'POST',
            headers: {
                'X-Auth-Email': CF_API_EMAIL,
                'X-Auth-Key': CF_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: domainName,
                account: {
                    id: accountId
                },
                type: 'full'
            })
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.errors?.[0]?.message || 'Ошибка при создании зоны');
        }

        return {
            id: data.result.id,                    // ID зоны
            name: data.result.name,                // Имя домена
            status: data.result.status,            // Статус
            name_servers: data.result.name_servers // Массив name servers
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function updateDNSRecord(zoneId, type, name, content) {
    const response = await fetch(`${CF_API_URL}/zones/${zoneId}/dns_records`, {
        method: 'POST',
        headers: {
            'X-Auth-Email': CF_API_EMAIL,
            'X-Auth-Key': CF_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type,
            name,
            content,
            proxied: true,
            ttl: 3600
        })
    });

    const data = await response.json();
    if (!data.success) {
        throw new Error(data.errors[0]?.message || 'Ошибка при создании DNS записи');
    }

    return data.result;
}

export async function deleteZone(zoneId) {
    const response = await fetch(`${CF_API_URL}/zones/${zoneId}`, {
        method: 'DELETE',
        headers: {
            'X-Auth-Email': CF_API_EMAIL,
            'X-Auth-Key': CF_API_KEY,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (!data.success) {
        console.log(data)
        throw new Error(data.errors[0]?.message || 'Ошибка при удалении зоны');
    }

    return data.result;
}
