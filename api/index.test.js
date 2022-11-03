const request = require('supertest')

const app = require('./index')

describe('GET /', () => {
  it('GET / => homepage', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toBe(200)
    expect(res.text).toMatch(/Blocklet/)
  })
})  

describe('GET /api/txs', () => {
  const address1 = '0xeb2a81e229b68c1c22b6683275c00945f9872d90'
  const address2 = '0x01485e923e51f6abb2b48aaa310d357b429ba263'

  it('GET /api/txs => no address', async () => {
    const res = await request(app).get('/api/txs')
    expect(res.statusCode).toBe(400)
    expect(res.body.errors.a[0]).toBe("A can't be blank")
  })

  it('GET /api/txs => get address1', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('GET /api/txs => get address2', async () => {
    const res = await request(app).get(`/api/txs?a=${address2}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('GET /api/txs => get address1 with page:1', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}&page=1`)
    expect(res.statusCode).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
    expect(res.body.page).toBe(1)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('GET /api/txs => get address1 with page:2', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}&page=2`)
    expect(res.statusCode).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
    expect(res.body.page).toBe(2)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('GET /api/txs => get address1 with page:empty', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}&page=`)
    expect(res.statusCode).toBe(400)
    expect(res.body.errors.page[0]).toBe('Page is not a number')
  })

  it('GET /api/txs => get address1 with page:a', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}&page=a`)
    expect(res.statusCode).toBe(400)
    expect(res.body.errors.page[0]).toBe('Page is not a number')
  })

  it('GET /api/txs => get address1 with page:no integer', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}&page=1.1`)
    expect(res.statusCode).toBe(400)
    expect(res.body.errors.page[0]).toBe('Page must be an integer')
  })

  it('GET /api/txs => get address1 with page:-1', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}&page=-1`)
    expect(res.statusCode).toBe(400)
    expect(res.body.errors.page[0]).toBe('Page must be greater than or equal to 1')
  })

  
  it('GET /api/txs => get address1 with pageSize:10', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}&page=2&pageSize=10`)
    expect(res.statusCode).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
    expect(res.body.page).toBe(2)
    expect(res.body.data.length).toBe(10)
  })

  it('GET /api/txs => get address1 with pageSize:25', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}&page=2&pageSize=25`)
    expect(res.statusCode).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
    expect(res.body.page).toBe(2)
    expect(res.body.data.length).toBe(25)
  })

  it('GET /api/txs => get address1 with pageSize:50', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}&page=2&pageSize=50`)
    expect(res.statusCode).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
    expect(res.body.page).toBe(2)
    expect(res.body.data.length).toBe(50)
  })

  it('GET /api/txs => get address1 with pageSize:100', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}&page=2&pageSize=100`)
    expect(res.statusCode).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
    expect(res.body.page).toBe(2)
    expect(res.body.data.length).toBe(100)
  })

  it('GET /api/txs => get address1 with pageSize:5', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}&page=2&pageSize=5`)
    expect(res.statusCode).toBe(400)
    expect(res.body.errors.pageSize[0]).toBe('5 is not in the list:10,25,50,100')
  })

  it('GET /api/txs => get address1 with pageSize:10 again, use apiCache: ', async () => {
    const res = await request(app).get(`/api/txs?a=${address1}&page=2&pageSize=10`)
    expect(res.statusCode).toBe(200)
    expect(res.body.total).toBeGreaterThan(0)
    expect(res.body.page).toBe(2)
    expect(res.body.data.length).toBe(10)
  })
})