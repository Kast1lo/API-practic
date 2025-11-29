document.getElementById('slowBtn').addEventListener('click', async () => {
  const el = document.getElementById('slowResult');
  el.innerHTML = '⏳ Ждём 3 секунды... (или мгновенно, если в кэше)';
  const start = Date.now();
  const res = await fetch('/slow');
  const data = await res.json();
  const time = ((Date.now() - start)/1000).toFixed(2);
  el.innerHTML = `<strong>Готово за ${time}с!</strong><br>${JSON.stringify(data)}`;
});

let spamCount = 0;
document.getElementById('spamBtn').addEventListener('click', async () => {
  spamCount++;
  const res = await fetch('/slow');
  const result = document.getElementById('spamResult');
  if (res.ok) {
    const data = await res.json();
    result.innerHTML += `<div>${spamCount}. Успех!</div>`;
  } else {
    const err = await res.json();
    result.innerHTML += `<div style="color:red">${spamCount}. ${err.error || 'Ошибка'}</div>`;
  }
});

// === Продукты ===
let currentPage = 1;
const loadProducts = async () => {
  const page = document.getElementById('page').value || 1;
  const limit = document.getElementById('limit').value || 10;
  const fields = document.getElementById('fields').value;

  const url = new URL('/products', location.origin);
  url.searchParams.set('page', page);
  url.searchParams.set('limit', limit);
  if (fields) url.searchParams.set('fields', fields);

  const res = await fetch(url);
  const json = await res.json();

  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  json.data.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <h3>Товар #${p.id}</h3>
      ${p.name ? `<div><strong>${p.name}</strong></div>` : ''}
      ${p.price ? `<div class="price">${p.price} ₽</div>` : ''}
      <button class="comments-btn" data-id="${p.id}">Комментарии</button>
      <div class="comments" id="comments-${p.id}"></div>
    `;
    grid.appendChild(div);
  });

  document.getElementById('pageInfo').textContent = `Страница ${json.page} из ${Math.ceil(json.total / limit)}`;
  currentPage = json.page;
};

document.getElementById('loadProducts').addEventListener('click', loadProducts);
document.getElementById('prev').addEventListener('click', () => {
  if (currentPage > 1) {
    document.getElementById('page').value = currentPage - 1;
    loadProducts();
  }
});
document.getElementById('next').addEventListener('click', () => {
  document.getElementById('page').value = currentPage + 1;
  loadProducts();
});

// Ленивая загрузка комментариев
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('comments-btn')) {
    const id = e.target.dataset.id;
    const commentsEl = document.getElementById(`comments-${id}`);
    if (commentsEl.style.display === 'block') {
      commentsEl.style.display = 'none';
      return;
    }
    commentsEl.innerHTML = 'Загрузка комментариев...';
    commentsEl.style.display = 'block';

    const res = await fetch(`/products/${id}/comments`);
    const data = await res.json();
    if (data.comments.length === 0) {
      commentsEl.innerHTML = '<em>Пока нет комментариев</em>';
    } else {
      commentsEl.innerHTML = data.comments.map(c => 
        `<div class="comment"><strong>${c.author}:</strong> ${c.text}</div>`
      ).join('');
    }
  }
});

// Первая загрузка
loadProducts();