const sh = require('shelljs')
const dateRange = require('date-range-array')
const download = require('download-file-sync')
/**
 * @param {string} path
 * @param {string} start
 * @param {string} end
 * @param {Options} options
 */
module.exports.dates = function (path, start, end, options) {
    return dateRange(start, end).map(pipe(versionFromDate, installVersion))
}
/**
 * @param {string} path
 * @param {string} start
 * @param {string} end
 * @param {Options} options
 */
module.exports.versions = function(path, start, end, options) {
    return createVersionRange(start, end)
}

/**
 * @param {string} version
 */
function installVersion(version) {
    if (!sh.test("-d", version)) {
        download(version)


    }
}

/** @param {string} date */
function versionFromDate(date) {
    // TODO: Figure out the correct version prefix (maybe lookup in npm info?)
    return '3.4.0-dev.' + date.replace(/\D/g, '')
}

/**
 * @param {string} start
 * @param {string} end
 */
function createVersionRange(start, end) {
}

/**
 * @template T, U, V
 * @param {(t: T) => U} f
 * @param {(u: U) => V} g
 * @return {(t: T) => V}
 */
function pipe(f, g) {
    return t => g(f(t))
}

// @ts-ignore
if (!module.parent) {
    module.exports.dates('bob.ts', '2019-01-29', '2019-04-03', {});
}
