const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const app = require("../app.js");
const data = require("../db/data/test-data/index.js");
const request = require("supertest");
const endpoints = require("../endpoints.json");
const e = require("express");
require("jest-sorted");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("Route does not exist", () => {
  test('GET 404 responds with error message "Path not found!"', () => {
    return request(app)
      .get("/api/notAValidPath")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Path not found!");
      });
  });
});

describe("GET /api", () => {
  test("GET 200 sends an object with properties of the available api endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
});

describe("GET /api/topics", () => {
  test("GET 200 sends an array of topic objects with properties - slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toHaveLength(3);
        body.topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("GET 200 sends an array of article objects with correct properties and limited to 10 articles returned", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(10);

        body.articles.forEach((article) => {
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.title).toBe("string");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.author).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
          expect(article.total_count).toBe(13);
        });
      });
  });
  test("article object should not have 'body' property ", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).not.toHaveProperty("body");
        });
      });
  });
  test("article objects should be ordered by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("article object should have correct number of comments from the comments table referencing the article_id", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        expect(body.articles[0].comment_count).toBe(2);
        expect(body.articles[6].comment_count).toBe(11);
      });
  });
  test("article objects should be filtered by topic when passed a valid topic query", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(1);
        expect(body.articles[0].topic).toBe("cats");
      });
  });
  test("article objects should be ordered by sort_by query when passed a valid sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("votes", { descending: true });
      });
  });
  test("GET 404 sends an error message when passed a valid topic query but does not exist", () => {
    return request(app)
      .get("/api/articles?topic=notopic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic not found!");
      });
  });
  test("GET 400 sends an error message when passed an invalid sort_by column", () => {
    return request(app)
      .get("/api/articles?sort_by=not_valid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid sort_by query");
      });
  });
  test("GET 400 sends an error message when passed an invalid order direction", () => {
    return request(app)
      .get("/api/articles?order=not_valid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid order query");
      });
  });
  test("should paginate the response with a limit and page number", () => {
    const limit = 5;
    const page = 3;
    return request(app)
      .get(`/api/articles?limit=${limit}&p=${page}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(3);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("GET 200 sends an article object with the passed article_id with correct properties and values", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        expect(body.article.article_id).toBe(2);
        expect(body.article.title).toBe("Sony Vaio; or, The Laptop");
        expect(body.article.author).toBe("icellusedkars");
        expect(body.article.topic).toBe("mitch");
        expect(body.article.votes).toBe(0);
        expect(body.article).toHaveProperty("created_at");
        expect(body.article).toHaveProperty("body");
        expect(body.article).toHaveProperty("article_img_url");
      });
  });

  test("GET 200 sends an article object with the passed article_id with correct number of comments", () => {
    return request(app)
      .get("/api/articles/5")
      .expect(200)
      .then(({ body }) => {
        expect(body.article.comment_count).toBe(2);
      });
  });
  test("GET 400 sends an error message when passed an invalid article_id", () => {
    return request(app)
      .get("/api/articles/notvalidid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("GET 404 sends an error message when passed a valid id but does not exist", () => {
    return request(app)
      .get("/api/articles/99999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article_id not found!");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("POST 201 sends the posted comment and has the next sequential comment_id", () => {
    const newComment = {
      username: "rogersop",
      body: "new comment",
    };
    const postedComment = {
      comment_id: 19,
      author: "rogersop",
      article_id: 1,
      body: "new comment",
      votes: 0,
      created_at: expect.any(String),
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject(postedComment);
      });
  });
  test("POST 404 sends an error message when article_id not found in articles table", () => {
    const newComment = {
      username: "rogersop",
      body: "new comment",
    };
    return request(app)
      .post("/api/articles/999999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("not found");
      });
  });
  test("POST 404 sends an error message when username not found in users table", () => {
    const newComment = {
      username: "not user",
      body: "new comment",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("not found");
      });
  });
  test("POST 400 sends an error message when missing required fields", () => {
    const missingUsername = {
      body: "missing username",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(missingUsername)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Please provide username and body");
      });
  });
  test("POST 400 sends an error message when fields are incorrect", () => {
    const incorrectFields = {
      user: "should be username",
      comment: "should be body",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(incorrectFields)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Please provide username and body");
      });
  });
});
describe("GET /api/articles/:article_id/comments", () => {
  test("GET 200 sends an array of comment objects for the passed article_id with correct properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(10);
        body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            article_id: 1,
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
          });
        });
      });
  });
  test("comment objects should be ordered with most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .then(({ body }) => {
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("GET 200 sends an empty array for article that exists but has no comments", () => {
    return request(app)
      .get("/api/articles/13/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
  test("GET 400 sends an error message when passed an invalid article_id", () => {
    return request(app)
      .get("/api/articles/notvalidid/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("GET 404 sends an error message when passed a valid id but does not exist", () => {
    return request(app)
      .get("/api/articles/99999999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article_id not found!");
      });
  });
  test("should paginate the response with a limit and page number", () => {
    const limit = 5;
    const page = 3;
    return request(app)
      .get(`/api/articles/1/comments?limit=${limit}&p=${page}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(1);
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("PATCH 200 send the updated article object with votes properly incremented inc_votes value", () => {
    const vote = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/2")
      .send(vote)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({ article_id: 2, votes: 1 });
      });
  });
  test("PATCH 200 send the updated article object with votes properly decremented inc_votes value", () => {
    const vote = {
      inc_votes: -100,
    };
    return request(app)
      .patch("/api/articles/3")
      .send(vote)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({ article_id: 3, votes: -100 });
      });
  });
  test("PATCH 200 send the updated article object with votes property updated if value is string", () => {
    const voteString = {
      inc_votes: "5",
    };
    return request(app)
      .patch("/api/articles/4")
      .send(voteString)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({ article_id: 4, votes: 5 });
      });
  });

  test("PATCH 404 sends an error message when article_id not found in articles table", () => {
    const vote = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/9999999")
      .send(vote)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article_id not found!");
      });
  });
  test("PATCH 400 sends an error message when missing required field", () => {
    const missingIncVote = {};
    return request(app)
      .patch("/api/articles/1")
      .send(missingIncVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Please provide inc_votes");
      });
  });
  test("PATCH 400 sends an error message when missing required field", () => {
    const wrongVoteField = {
      wrongField: 1,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(wrongVoteField)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Please provide inc_votes");
      });
  });
  test("PATCH 400 sends an error message when inc_votes value is a string letter not a number", () => {
    const voteStringLetter = {
      inc_votes: "notanumber",
    };
    return request(app)
      .patch("/api/articles/1")
      .send(voteStringLetter)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("DELETE 204 deletes the comment with passed comment_id but returns no content", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("DELETE 400 sends an error message when passed an invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/notvalidid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("DELETE 404 sends an error message when passed a valid id but does not exist", () => {
    return request(app)
      .delete("/api/comments/9999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment_id not found!");
      });
  });
});

describe("GET /api/users", () => {
  test("GET 200 sends an array of user objects with correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toHaveLength(4);
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});
describe("GET /api/users/:username", () => {
  test("GET 200 sends a user object with the passed username with correct properties", () => {
    return request(app)
      .get("/api/users/rogersop")
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          username: "rogersop",
          name: "paul",
          avatar_url:
            "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
        });
      });
  });
  test("GET 404 sends an error message when passed a valid username but does not exist", () => {
    return request(app)
      .get("/api/users/notvaliduser")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username not found!");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("PATCH 200 send the updated comment object with votes properly incremented inc_votes value", () => {
    const vote = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/comments/5")
      .send(vote)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({ comment_id: 5, votes: 1 });
      });
  });
  test("PATCH 200 send the updated comment object with votes properly decremented inc_votes value", () => {
    const vote = {
      inc_votes: -100,
    };
    return request(app)
      .patch("/api/comments/5")
      .send(vote)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({ comment_id: 5, votes: -100 });
      });
  });
  test("PATCH 200 send the updated comment object with votes property updated if value is string", () => {
    const voteString = {
      inc_votes: "5",
    };
    return request(app)
      .patch("/api/comments/10")
      .send(voteString)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({ comment_id: 10, votes: 5 });
      });
  });

  test("PATCH 404 sends an error message when comment_id not found in comments table", () => {
    const vote = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/comments/9999999")
      .send(vote)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment_id not found!");
      });
  });
  test("PATCH 400 sends an error message when missing required field", () => {
    const missingIncVote = {};
    return request(app)
      .patch("/api/comments/1")
      .send(missingIncVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Please provide inc_votes");
      });
  });
});
describe("POST /api/articles", () => {
  test("POST 201 sends the posted article and has the next sequential article_id", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "new article",
      body: "new article body",
      topic: "mitch",
      article_img_url: "https://image.com",
    };
    const postedArticle = {
      article_id: 14,
      title: "new article",
      topic: "mitch",
      author: "butter_bridge",
      body: "new article body",
      votes: 0,
      created_at: expect.any(String),
      comment_count: 0,
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject(postedArticle);
      });
  });
  test("POST 201 sends the posted article and has the default article_img_url if not provided", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "new article",
      body: "new article body",
      topic: "mitch",
    };
    const defaultImg =
      "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700";
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article.article_img_url).toBe(defaultImg);
      });
  });
  test("POST 404 sends an error message when username not found in users table", () => {
    const newArticle = {
      author: "not user",
      title: "new article",
      body: "new article body",
      topic: "mitch",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("not found");
      });
  });
  test("POST 404 sends an error message when topic not found in topics table", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "new article",
      body: "new article body",
      topic: "notopic",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("not found");
      });
  });
  test("POST 400 sends an error message when missing required fields", () => {
    const missingTitle = {
      author: "butter_bridge",
      body: "missing title",
      topic: "mitch",
    };
    return request(app)
      .post("/api/articles")
      .send(missingTitle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Please provide title, body, topic and author");
      });
  });
  test("POST 400 sends an error message when fields are incorrect", () => {
    const incorrectFields = {
      user: "should be author",
      comment: "should be body",
    };
    return request(app)
      .post("/api/articles")
      .send(incorrectFields)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Please provide title, body, topic and author");
      });
  });
});
describe("POST /api/topics", () => {
  test("POST 201 creates a topic in db and returns it", () => {
    const newTopic = {
      slug: "newslug",
      description: "new description",
    };
    const postedTopic = {
      slug: "newslug",
      description: "new description",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then(({ body }) => {
        expect(body.topic).toMatchObject(postedTopic);
      });
  });
  test("POST 400 sends an error message when missing required fields", () => {
    const missingSlug = {
      description: "missing slug",
    };
    return request(app)
      .post("/api/topics")
      .send(missingSlug)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Please provide slug and description");
      });
  });
  test("POST 400 sends an error message when missing required fields", () => {
    const missingDescription = {
      slug: "missing description",
    };
    return request(app)
      .post("/api/topics")
      .send(missingDescription)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Please provide slug and description");
      });
  });
  test("POST 400 sends an error message when fields are incorrect", () => {
    const incorrectFields = {
      slug: "should be slug",
      comment: "should be description",
    };
    return request(app)
      .post("/api/topics")
      .send(incorrectFields)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Please provide slug and description");
      });
  });
  test("POST 400 sends an error message when topic already exists", () => {
    const existingTopic = {
      slug: "cats",
      description: "new description",
    };
    return request(app)
      .post("/api/topics")
      .send(existingTopic)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic already exists");
      });
  });
});
