import fs from 'fs';
import path from 'path';

export function convertToTData(dcId, userId, authKey, outputPath) {
    try {
        const tdataStructure = {
            auth_key: Buffer.from(authKey, 'hex'),
            dc_id: parseInt(dcId),
            user_id: parseInt(userId),
            server_time: Math.floor(Date.now() / 1000)
        };

        fs.mkdirSync(path.join(outputPath, 'tdata'), { recursive: true });
        
        const keyFile = path.join(outputPath, 'tdata', `key_${dcId}`);
        fs.writeFileSync(keyFile, tdataStructure.auth_key);

        const dcFile = path.join(outputPath, 'tdata', 'settings');
        const dcInfo = Buffer.alloc(4);
        dcInfo.writeInt32LE(tdataStructure.dc_id, 0);
        fs.writeFileSync(dcFile, dcInfo);

        return true;
    } catch (error) {
        console.error('Error converting to tdata:', error);
        return false;
    }
} 