// server.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = 3000;

//Задача 1: Привет, мир!
app.get('/', (req, res) => {
  res.send('Привет, мир!');
});

//Задача 2 + 3: Медленный эндпоинт + кэширование
const cache = {};

const slowResponse = {
  message: "Это был медленный запрос"
};

app.get('/slow', async (req, res) => {
  if (cache.slow) {
    return res.json(cache.slow);
  }

  // имитируем долгий запрос
  await new Promise(resolve => setTimeout(resolve, 3000));
  cache.slow = slowResponse;
  res.json(slowResponse);
});

//Rate Limiting для /slow (Задача 5)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 5,
  message: { error: "Слишком много запросов! Подожди минутку" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/slow', limiter);

//Задача 4 + Бонус 1: Пагинация + выбор полей
const { products } = require('./products-data');

app.get('/products-data', (req, res) => {
  let { page = 1, limit = 10, fields } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const start = (page - 1) * limit;
  const end = start + limit;

  let result = products.slice(start, end);

  // Бонус 1: выбор полей
  if (fields) {
    const wanted = fields.split(',');
    result = result.map(p => {
      const obj = {};
      wanted.forEach(field => {
        if (p.hasOwnProperty(field)) obj[field] = p[field];
      });
      return obj;
    });
  }

  // Добавляем заголовки кэширования (Бонус 3)
  res.set('Cache-Control', 'public, max-age=60');
  res.json({
    page,
    limit,
    total: products.length,
    data: result
  });
});


app.get('/products/:id/comments', (req, res) => {
  const id = req.params.id;
  const commentsDb = {
    "1": [{ author: "Аня", text: "Классный товар!" }],
    "5": [{ author: "Витя", text: "Брал два раза, рекомендую!" }],
    "10": [{ author: "Катя", text: "Доставили за день!" }]
  };
setTimeout(() => {
    res.json({ comments: commentsDb[req.params.id] || [] });
  }, 600);
});

// Статическая раздача фронтенда
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});