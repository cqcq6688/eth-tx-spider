/* eslint-disable prettier/prettier */
const NodeCache = require('node-cache')
const env = require('../libs/env')

const { isDev } = env
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } )

const apiCache = (duration) => {
    return (req, res, next) => {
        const key = `__eth-tx-spider__${ req.originalUrl || req.url }`
        const cachedBody = myCache.get(key)

        if (cachedBody) {
            if (isDev) console.debug('命中缓存', key)
            res.send(JSON.parse(cachedBody))
            return
        }

        res.sendResponse = res.send
        res.send = (body) => {
            // if (isDev) console.debug('缓存请求', key)
            myCache.set(key, body, duration * 1000)
            res.sendResponse(body)
        }
        next()
    }
}

module.exports = apiCache
