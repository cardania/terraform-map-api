import fs from 'fs';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import fetch from 'node-fetch';
import { shuffleArray, parseJsonFromFile } from './utility.js';
import { errorLog, successLog, warnLog } from './log.js';
import * as GRID from '../constants/grid.js';

/**
 * Fetches the current epoch number.
 * @returns {number}
 */
export async function fetchCurrentEpochNumber() {
    const response = await fetch('https://pool.pm/feed.json');
    const data = await response.json();
    const number = Object.keys(data)[0];

    return number;
}

/**
 * Shuffle the terraforms within their respective Alpha sectors.
 *
 * Generates the new static files with the grid coordinates.
 */
export function shuffleTerraforms() {
    const terraforms = parseJsonFromFile('data/terraforms.json');

    let terraformsByAlphaSector = {
        "Arshi_En": [],
        "Asama": [],
        "Foundation": [],
    };

    let terraformsByLandType = {
        "Prismatic": [],
        "Badlands": [],
        "Tundra": [],
        "Fungal": [],
        "Desert": [],
        "Artificial": [],
        "Wasteland": [],
        "Volcanic": [],
        "Rocky": [],
        "Grass": [],
    };

    terraforms.forEach((terraform) => {
        terraformsByAlphaSector[terraform.alpha_sector].push(terraform);
        terraformsByLandType[terraform.land_type].push(terraform);

        const { token_name } = terraform;
        const terraformId = token_name.replace( /^\D+/g, ''); // replace all leading non-digits with nothing

        // Create the id routes if they don't already exist.
        if (!fs.existsSync(`public/v1/id/${terraformId}/index.json`)) {
            warnLog(`Missing endpoint for v1/id/${terraformId}`);

            fs.mkdirSync(`public/v1/id/${terraformId}`, { recursive: true });
            fs.writeFileSync(`public/v1/id/${terraformId}/index.json`, JSON.stringify(terraform));

            successLog(`Created endpoint for v1/id/${terraformId}`);
        }
    })

    if (!fs.existsSync('data/terraformsByAlphaSector.json')) {
        fs.writeFileSync('data/terraformsByAlphaSector.json', JSON.stringify(terraformsByAlphaSector));
    }

    if (!fs.existsSync('data/terraformsByLandType.json')) {
        fs.writeFileSync('data/terraformsByLandType.json', JSON.stringify(terraformsByLandType));
    }

    const alphaSectors = Object.keys(terraformsByAlphaSector);

    alphaSectors.forEach((alphaSector) => {
        const alphaSectorTerraforms = terraformsByAlphaSector[alphaSector];

        // Shuffle terraforms within their respective alpha sectors.
        shuffleArray(alphaSectorTerraforms);

        const alphaSectorTerraformsWithCoordinates = addCoordinates(alphaSector, alphaSectorTerraforms);

        const bar1 = new cliProgress.SingleBar({
            format: chalk.magenta('Cardania ') + chalk.blueBright('{bar}') + ' {percentage}% {value}/{total} Terraforms in ' + chalk.yellowBright(alphaSector),
            hideCursor: true
        }, cliProgress.Presets.rect);
        bar1.start(alphaSectorTerraforms.length, 0);

        // Create coordinate endpoints within each sector.
        alphaSectorTerraformsWithCoordinates.forEach((terraform, i) => {
            bar1.update(i + 1);

            const { x, y } = terraform.location;

            const sanitizedTerraform = sanitizeTerraformResponse(terraform);

            fs.mkdirSync(`public/v1/alpha_sector/${alphaSector}/${x}/${y}/`, { recursive: true });
            fs.writeFileSync(`public/v1/alpha_sector/${alphaSector}/${x}/${y}/index.json`, JSON.stringify(sanitizedTerraform, null, 2));
        });

        bar1.stop();

        fs.mkdirSync(`public/v1/alpha_sector/${alphaSector}`, { recursive: true });

        let indexResponseObject = {};

        alphaSectorTerraforms.forEach((item) => {
            const { key, terraform } = sanitizeTerraformIndexResponse(item);
            indexResponseObject[key] = terraform;
        });

        fs.writeFileSync(`public/v1/alpha_sector/${alphaSector}/index.json`, JSON.stringify(indexResponseObject, null, 2));
    })
}

/**
 * Returns the coordinates of a Terraform given it's index within it's Alpha Sector.
 *
 * @param {string} alphaSector
 * @param {array} alphaSectorTerraforms
 */
export function addCoordinates(alphaSector, alphaSectorTerraforms) {

    if (alphaSector === 'Arshi_En') {
        alphaSectorTerraforms.forEach((terraform, i) => {
            alphaSectorTerraforms[i].location = getTerraformLocationFromIndex(i, GRID.ARSHI_EN_LENGTH);
            const neighborLocations = getNeighborLocations(alphaSectorTerraforms[i].location, GRID.ARSHI_EN_LENGTH);
            alphaSectorTerraforms[i].neighbors = getNeighborDetails(neighborLocations, 'Arshi_En');
        })
    }

    if (alphaSector === 'Asama') {
        alphaSectorTerraforms.forEach((terraform, i) => {
            alphaSectorTerraforms[i].location = getTerraformLocationFromIndex(i, GRID.ASAMA_LENGTH);
            const neighborLocations = getNeighborLocations(alphaSectorTerraforms[i].location, GRID.ASAMA_LENGTH);
            alphaSectorTerraforms[i].neighbors = getNeighborDetails(neighborLocations, 'Asama');
        })
    }

    if (alphaSector === 'Foundation') {
        alphaSectorTerraforms.forEach((terraform, i) => {
            alphaSectorTerraforms[i].location = getTerraformLocationFromIndex(i, GRID.FOUNDATION_LENGTH);
            const neighborLocations = getNeighborLocations(alphaSectorTerraforms[i].location, GRID.FOUNDATION_LENGTH);
            alphaSectorTerraforms[i].neighbors = getNeighborDetails(neighborLocations, 'Foundation');
        })
    }

    return alphaSectorTerraforms
}

function getTerraformLocationFromIndex(index, maxRowLength) {
    const location = { x: 0, y: 0 };

    location.x = (index % maxRowLength) + 1;
    location.y = (Math.floor(index / maxRowLength)) + 1;

    return location;
}

function getNeighborLocations({ x, y }, maxRowLength) {
    const top = {
        x: x,
        y: y + 1,
    };
    const topRight = {
        x: x + 1,
        y: y + 1,
    };
    const right = {
        x: x + 1,
        y: y,
    };
    const bottomRight = {
        x: x + 1,
        y: y - 1,
    };
    const bottom =  {
        x: x,
        y: y - 1,
    };
    const bottonLeft =  {
        x: x - 1,
        y: y - 1,
    };
    const left =  {
        x: x - 1,
        y: y,
    };
    const topLeft =  {
        x: x - 1,
        y: y + 1,
    };

    return {
        top,
        topRight,
        right,
        bottomRight,
        bottom,
        bottonLeft,
        left,
        topLeft,
    };
}

function getNeighborDetails(locations, alphaSector) {
    const {
        top,
        topRight,
        right,
        bottomRight,
        bottom,
        bottonLeft,
        left,
        topLeft,
    } = locations;

    let location = {
        top: {
            ...getTerraformAtLocation(top, alphaSector),
        },
        topRight: {
            ...getTerraformAtLocation(topRight, alphaSector),
        },
        right: {
            ...getTerraformAtLocation(right, alphaSector),
        },
        bottomRight: {
            ...getTerraformAtLocation(bottomRight, alphaSector),
        },
        bottom: {
            ...getTerraformAtLocation(bottom, alphaSector),
        },
        bottonLeft: {
            ...getTerraformAtLocation(bottonLeft, alphaSector),
        },
        left: {
            ...getTerraformAtLocation(left, alphaSector),
        },
        topLeft: {
            ...getTerraformAtLocation(topLeft, alphaSector),
        }
    };

    return location;
}

function getTerraformAtLocation({ x, y }, alphaSector) {
    const path = `./public/v1/alpha_sector/${alphaSector}/${x}/${y}/index.json`;

    if (!fs.existsSync(path)) {
        return null;
    }

    const terraform = JSON.parse(fs.readFileSync(path, 'utf8'));

    delete terraform.location;
    delete terraform.neighbors;

    return {
        ...terraform,
        location: { x, y },
    }
}

function sanitizeTerraformResponse(terraform) {
    delete terraform.pool_link;
    delete terraform.image;

    return terraform;
}

function sanitizeTerraformIndexResponse(terraform) {
    const key = `${terraform.location.x},${terraform.location.y}`;

    delete terraform.location;
    delete terraform.neighbors;
    delete terraform.alpha_sector;

    return { key, terraform };
}
