/* eslint-disable prettier/prettier */
const superagent = require('superagent')
require('superagent-proxy')(superagent)
const cheerio = require('cheerio')

const isDev = process.env.NODE_ENV === 'development'
const proxy = isDev ? 'http://127.0.0.1:1080' : null // 设置本地翻墙，否则无法访问 etherscan

const spider = (params, callback) => {
    const { address, page, pageSize } = params
    const url = `https://etherscan.io/txs?a=${address}&p=${page}&ps=${pageSize}`
    // 1. 获取网页
    superagent.get(url)
    // superagent.get(`https://google.com`)
    .proxy(proxy)
     // 2. 解析内容
    .end((err, res) => {
        if (err) {
            console.log(err, res)
            return callback(err)
        }

        const retData = {
            ...params,
            total: 0,
            data: []
        }

        const $ = cheerio.load(res.text, { decodeEntites: false })
        const $content = $('#ContentPlaceHolder1_mainrow')
        const totalStr = $content.find('#spinwheel').parent().text()
        retData.total = parseInt(totalStr.replace('\n\nA total of ', '').replace(' transactions found\n', '').replace(',', ''), 10)
        
        const $list = $content.find('table tbody tr')
        if ($list) {
            $list.each((idx) => {
                const $item = $list.eq(idx)
                const $tds = $item.find('td')
                const direction = $tds.eq(7).find('span').text().trim()
                const itemData = {
                    txnHash: $tds.eq(1).find('a').text(),
                    method: $tds.eq(2).find('span').text(),
                    block: $tds.eq(3).find('a').text(),
                    date: $tds.eq(4).find('span').text(),
                    age: $tds.eq(5).find('span').text(),
                    direction,
                    from: (() => {
                        let address = ''
                        let title = ''
                        if (direction === 'OUT') {
                            title = $tds.eq(6).find('span').text()
                            address = title
                        } else {
                            title = $tds.eq(6).find('a').text()
                            const href = $tds.eq(6).find('a').attr('href')
                            if (href) {
                                address = href.replace('/address/', '')
                            }
                        }
                        return {
                            address,
                            title,
                        }
                    })(),
                    to: (() => {
                        let address = ''
                        let title = ''
                        if (direction === 'OUT') {
                            title = $tds.eq(8).find('a').text()
                            const href = $tds.eq(8).find('a').attr('href')
                            if (href) {
                                address = href.replace('/address/', '')
                            }
                        } else {
                            title = $tds.eq(8).find('span').text()
                            address = title
                        }
                        return {
                            address,
                            title
                        }
                    })(),
                    value: $tds.eq(9).text(),
                    txnFee: $tds.eq(10).find('span').text(),
                    gasPrice: $tds.eq(11).find('span').text(),
                }
                retData.data.push(itemData)
            })
        }

        retData.pageSize = retData.pageSize || Number($('#ContentPlaceHolder1_ddlRecordsPerPage').val())

        if (isDev) {
            retData._res = res
            retData._url = url
        }

        return callback(null, retData)
    })

}

module.exports = spider