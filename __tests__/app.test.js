const db = require('../db/connection.js')
const seed = require('../db/seeds/seed.js')
const app = require('../app.js')
const data = require('../db/data/test-data/index.js')
const request = require('supertest')
const endpoints = require('../endpoints.json')
require('jest-sorted')


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

describe('GET /api/articles', () => {
    test('GET 200 sends an array of article objects with correct properties', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
            expect(body.articles).toHaveLength(13);
            body.articles.forEach((article) => {
                expect(typeof article.article_id).toBe('number');
                expect(typeof article.title).toBe('string');
                expect(typeof article.topic).toBe('string');
                expect(typeof article.author).toBe('string');
                expect(typeof article.created_at).toBe('string');
                expect(typeof article.votes).toBe('number');
                expect(typeof article.article_img_url ).toBe('string');
                expect(typeof article.comment_count).toBe('number');
            })
        })
    })
    test('article objects should be ordered by date in descending order', () => {
        return request(app)
        .get('/api/articles')
        .then(({ body }) => {
            expect(body.articles).toBeSortedBy('created_at', { descending: true })
        })
    })
    test('article object should have correct number of comments from the comments table referencing the article_id', () => {
        return request(app)
        .get('/api/articles')
        .then(({ body }) => {
            expect(body.articles[0].comment_count).toBe(2);
            expect(body.articles[6].comment_count).toBe(11)
        })
    })
})

describe('GET /api/articles/:article_id', () => {
    test('GET 200 sends an article object with the passed article_id with correct properties and values', () => {
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


