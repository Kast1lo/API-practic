// products-data.js
const products = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Товар ${i + 1} — Супер вещь`,
  price: Math.floor(Math.random() * 9000) + 1000,
  category: ['Электроника', 'Одежда', 'Книги', 'Игрушки'][Math.floor(Math.random() * 4)],
  inStock: Math.random() > 0.2
}));

module.exports = { products };