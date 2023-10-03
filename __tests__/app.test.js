const db = require('../db/connection.js')
const seed = require('../db/seeds/seed.js')
const app = require('../app.js')
const data = require('../db/data/test-data/index.js')
const request = require('supertest')
const endpoints = require('../endpoints.json')


beforeEach(() => {
    return seed(data);
})

afterAll(() => {
    return db.end();
})

describe('Route does not exist', () => {
    test('GET 404 responds with error message "Path not found!"', () => {
        return request(app)
        .get('/api/notAValidPath')
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Path not found!');
        })
    })
})

describe('GET /api/topics', () => {
    test('GET 200 sends an array of topic objects with properties - slug and description', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
            expect(body.topics).toHaveLength(3);
            body.topics.forEach((topic) => {
                expect(typeof topic.slug).toBe('string');
                expect(typeof topic.description).toBe('string');
            })
        })
    })
})
describe('GET /api', () => {
    test('GET 200 sends an object with properties of the available api endpoints', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
            expect(body.endpoints).toEqual(endpoints)
        })
    })
})
describe('GET /api/articles/:article_id', () => {
    test.only('GET 200 sends an article object with the passed article_id with correct properties and values', () => {
        return request(app)
        .get('/api/articles/2')
        .expect(200)
        .then(({ body }) => {
            expect(body.article.article_id).toBe(2);
            expect(body.article.title).toBe('Sony Vaio; or, The Laptop');
            expect(body.article.author).toBe('icellusedkars');
            expect(body.article.topic).toBe('mitch');
            expect(body.article.votes).toBe(0);
            expect(body.article).toHaveProperty('created_at');
            expect(body.article).toHaveProperty('body');
            expect(body.article).toHaveProperty('article_img_url')
        })
    })
    test('GET 400 sends an error message when passed an invalid article_id', () => {
        return request(app)
        .get('/api/articles/notvalidid')
        .expect(400)
        .then(({ body }) => {
            expect(body.msg).toBe('invalid id')
        })
    })
    test('GET 404 sends an error message when passed a valid id but does not exist', () => {
        return request(app)
        .get('/api/articles/99999999')
        .expect(404)
        .then(({ body }) => {
            expect(body.msg).toBe('Not found')
        })
    })
})
