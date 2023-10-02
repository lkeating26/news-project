const db = require('../db/connection.js')
const seed = require('../db/seeds/seed.js')
const app = require('../app.js')
const data = require('../db/data/test-data/index.js')
const request = require('supertest')

beforeEach(() => {
    return seed(data);
})

afterAll(() => {
    return db.end();
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
    });
})