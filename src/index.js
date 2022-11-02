import { join, dirname } from 'path';
import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';
import { fetchCurrentEpochNumber, shuffleTerraforms } from './helpers/api.js';
import { getCurrentHumanReadableTime } from './helpers/utility.js';
import { infoLog } from './helpers/log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = join(__dirname, '../data/db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Read data from JSON file, this will set db.data content
await db.read();

// Set default data
db.data ||= {
    epoch: '',
    lastUpdated: '',
}

const actualEpoch = await fetchCurrentEpochNumber()

if (process.env.NODE_ENV === 'development') {
    infoLog('✨ DEV MODE ✨');
    infoLog('✨ Shuffle Terraforms Every Run ✨');
    await shuffleTerraforms();
} else if (db.data.epoch !== actualEpoch) {
    infoLog(`🔭 New Epoch ${actualEpoch} detected`);
    await shuffleTerraforms();
} else {
    infoLog(`✅ Epoch ${db.data.epoch} in the database matches the current Epoch`)
}

db.data = {
    epoch: actualEpoch,
    lastUpdated: getCurrentHumanReadableTime(),
};

// Finally write db.data content to file
await db.write();
