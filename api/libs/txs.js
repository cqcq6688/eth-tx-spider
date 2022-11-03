/* eslint-disable prettier/prettier */
const express = require('express')
const validate = require('validate.js')
const spiderEtherrscan = require('../utils/spider-etherscan')
const apiCache = require('../utils/api-cache')
const env = require('./env')

const router = express.Router()
const { apiTTL } = env

const pageSize = ['10', '25', '50', '100']
const constraints = {
    a: {
        presence: {
            allowEmpty: false
        },
    },
    page: {
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 1
        }
    },
    pageSize: {
        inclusion: {
            within: pageSize,
            message: "^%{value} is not in the list:" + pageSize.toString()
        }
    }
}

// 检查入参
router.use(function checkParams (req, res, next) {
    const errors = validate(req.query, constraints)

    if (errors) {
        return res.status(400).json({ errors})
    }
    next()
})

// 请求缓存
router.use(apiCache(apiTTL))

// 爬取数据
router.get('/', (req, res) => {
    const params = {
        address: req.query.a,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 50
    }
    spiderEtherrscan(params, (err, result) =>  {
        if (err) {
            return res.status(400).json({ errors: err })
        }
        res.send(result)
    })
})

module.exports = router