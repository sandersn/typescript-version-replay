const sh = require('shelljs')
const semver = require('semver')
const dateRange = require('date-range-array')

/**
 * @param {string} path
 * @param {string} start
 * @param {string} end
 * @param {Options} [options={}]
 */
module.exports.dates = function (path, start, end, options = {}) {
    return dateRange(start, end).map(pipe(versionFromDate, compile(path, options)))
}
/**
 * @param {string} path
 * @param {string} start
 * @param {string} end
 * @param {Options} [options={}]
 */
module.exports.versions = function(path, start, end, options = {}) {
    return createVersionRange(start, end).map(compile(path, options))
}

/**
 * @param {string} path
 * @param {Options} options
 * @return {(version: string) => [string, number | undefined]}
 */
function compile(path, options) {
    return (version) => {
        if (installVersion(version)) {
            console.log(version)
            const result = sh.exec(`node ${version}/lib/tsc.js --extendedDiagnostics -p ${path}`, { silent: true })
            if (options.types) {
                const m = result.stdout.match(/Types:\W+(\d+)/)
                console.log([version, m ? Number.parseInt(m[1]) : undefined])
                return [version, m ? Number.parseInt(m[1]) : undefined]
            }
            else if (options.errors) {
                if (result.code > 0) {
                    console.log(result.stdout)
                    console.log(result.stderr)
                }
                return [version, result.code]
            }
        }
        return [version, undefined]
    }
}

/**
 * @param {string} version
 */
function installVersion(version) {
    if (!sh.test("-d", version)) {
        if (sh.exec('npm pack typescript@' + version).code) {
            return false;
        }
        sh.exec('tar -xzf typescript-' + version + '.?.tgz')
        sh.mv('package', version)
    }
    return true
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
    const startV = semver.coerce(start)
    const endV = semver.coerce(end)
    if (!startV || !endV) {
        console.log(startV)
        console.log(endV)
        return []
    }
    const vers = []
    do {
        vers.push(startV.major + '.' + startV.minor)
        const minorEnd = startV.major === endV.major ? endV.minor : 9;
        while(startV.minor < minorEnd) {
            semver.inc(startV, 'minor')
            vers.push(startV.major + '.' + startV.minor)
        }
        semver.inc(startV, 'major')
        startV.minor = 0
    } while (startV.major <= endV.major)
    return vers
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
    console.log(module.exports.versions('/home/nathansa/src/test/welove.ts', '2.2', '3.5', { errors: true }))
    // module.exports.dates('bob.ts', '2019-01-29', '2019-04-03', {});
}
