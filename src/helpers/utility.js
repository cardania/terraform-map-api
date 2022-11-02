import fs from 'fs'

/**
 * Randomize array in-place using Durstenfeld shuffle algorithm.
 * @param {array} array The array to shuffle.
 */
export function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

/**
 * Returns the current human readable time/date.
 */
export function getCurrentHumanReadableTime() {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
        timeZone: 'America/New_York',
    })
}

/**
 * Fetches the project's token snapshot.
 * @param {array} jsonFile Path to JSON file.
 */
export function parseJsonFromFile(jsonFile) {
   const json = fs.readFileSync(jsonFile, 'utf8')
   return JSON.parse(json)
}
