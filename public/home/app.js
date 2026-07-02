let allData = [];
let activeFilter = 'Todos';
let searchTerm = '';
let mostrandoFavoritos = false;

// ── Auth ──────────────────────────────────────────
const usuarioSession = sessionStorage.getItem('usuario');
if (!usuarioSession) window.location.href = '../login/login.html';

let usuario = JSON.parse(usuarioSession);

// ── Favoritos (db via json-server) ────────────────
function getFavoritos() {
  return (usuario.favoritos || []).map(String);
}

function isFavorito(id) {
  return getFavoritos().includes(String(id));
}

async function toggleFavorito(id) {
  const sid = String(id);
  let favs = getFavoritos();

  if (favs.includes(sid)) {
    favs = favs.filter(f => f !== sid);
  } else {
    favs.push(sid);
  }

  try {
    const res = await fetch(`http://localhost:3000/usuarios/${usuario.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favoritos: favs })
    });
    const updated = await res.json();
    usuario = updated;
    sessionStorage.setItem('usuario', JSON.stringify(updated));
  } catch (e) {
    console.error('Erro ao salvar favorito:', e);
    return;
  }

  render();
}

// ── Header ────────────────────────────────────────
document.querySelector('.greeting').innerHTML = `Olá, <strong>${usuario.nome}</strong> 👋`;

const headerRight = document.querySelector('.header-right');

// Botão Favoritos
const btnFavs = document.createElement('button');
btnFavs.id = 'btn-favoritos';
btnFavs.innerHTML = `
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
  Favoritos
`;
btnFavs.style.cssText = `
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.875rem;
  font-family: 'Inter', sans-serif;
  padding: 0.45rem 1.1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
`;
btnFavs.onclick = () => {
  mostrandoFavoritos = !mostrandoFavoritos;
  if (mostrandoFavoritos) {
    btnFavs.style.borderColor = 'var(--accent)';
    btnFavs.style.color = 'var(--accent)';
    btnFavs.style.background = 'var(--accent-dim)';
  } else {
    btnFavs.style.borderColor = 'var(--border)';
    btnFavs.style.color = 'var(--muted)';
    btnFavs.style.background = 'transparent';
  }
  render();
};

// Botão Sair
const btnLogout = document.createElement('button');
btnLogout.id = 'btn-logout';
btnLogout.textContent = 'Sair';
btnLogout.style.cssText = `
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.875rem;
  font-family: 'Inter', sans-serif;
  padding: 0.45rem 1.1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
`;
btnLogout.onclick = () => {
  sessionStorage.removeItem('usuario');
  window.location.href = '../login/login.html';
};

headerRight.appendChild(btnFavs);
headerRight.appendChild(btnLogout);

// ── Dados ─────────────────────────────────────────
async function loadData() {
  // Recarrega o usuário do servidor para pegar favoritos atualizados
  try {
    const resUser = await fetch(`http://localhost:3000/usuarios/${usuario.id}`);
    usuario = await resUser.json();
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
  } catch (e) {
    console.error('Erro ao recarregar usuário:', e);
  }

  try {
    const res = await fetch('http://localhost:3000/pontos_turisticos');
    allData = await res.json();
    buildFilters();
    buildCarousel(allData);
    render();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}

// ── Carrossel de destaques (Bootstrap) ─────────────
function buildCarousel(data) {
  const destaques = [...data]
    .sort((a, b) => Number(b.avaliacao) - Number(a.avaliacao))
    .slice(0, 5);

  const indicators = document.getElementById('carousel-indicators');
  const inner = document.getElementById('carousel-inner');

  indicators.innerHTML = destaques.map((p, i) => `
    <button type="button" data-bs-target="#carouselDestaques" data-bs-slide-to="${i}"
      ${i === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${i + 1}"></button>
  `).join('');

  inner.innerHTML = destaques.map((p, i) => `
    <div class="carousel-item${i === 0 ? ' active' : ''}">
      <img src="${p.imagem}" class="d-block w-100" alt="${p.nome}"
           onerror="this.style.background='#2a2f42';this.removeAttribute('src')"/>
      <div class="carousel-caption">
        <h5>${p.nome}</h5>
        <p>${p.cidade}, ${p.pais} · ★ ${Number(p.avaliacao).toFixed(1)}</p>
      </div>
    </div>
  `).join('');

  const carouselEl = document.getElementById('carouselDestaques');
  if (window.bootstrap && carouselEl) {
    const existing = bootstrap.Carousel.getInstance(carouselEl);
    if (existing) existing.dispose();
    new bootstrap.Carousel(carouselEl, { interval: 4000, ride: 'carousel' });
  }
}

function buildFilters() {
  const cats = ['Todos', ...new Set(allData.map(p => p.categoria))];
  const container = document.getElementById('filters');
  container.innerHTML = '';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === activeFilter ? ' active' : '');
    btn.dataset.filter = cat;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      activeFilter = cat;
      mostrandoFavoritos = false;
      btnFavs.style.borderColor = 'var(--border)';
      btnFavs.style.color = 'var(--muted)';
      btnFavs.style.background = 'transparent';
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
    container.appendChild(btn);
  });
}

function render() {
  const grid = document.getElementById('grid');
  const countEl = document.getElementById('count');

  let filtered = allData.filter(p => {
    if (mostrandoFavoritos) return isFavorito(p.id);
    const matchCat = activeFilter === 'Todos' || p.categoria === activeFilter;
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      p.nome.toLowerCase().includes(q) ||
      p.pais.toLowerCase().includes(q) ||
      p.cidade.toLowerCase().includes(q) ||
      p.continente.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  countEl.textContent = mostrandoFavoritos
    ? `${filtered.length} favorito${filtered.length !== 1 ? 's' : ''}`
    : `${filtered.length} destino${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          ${mostrandoFavoritos
            ? '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'
            : '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'}
        </svg>
        <p>${mostrandoFavoritos ? 'Você ainda não favoritou nenhum destino.' : `Nenhum destino encontrado para "<strong>${searchTerm}</strong>".`}</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const fav = isFavorito(p.id);
    return `
      <div class="card" data-id="${p.id}">
        <img class="card-img" src="${p.imagem}" alt="${p.nome}" loading="lazy"
             onerror="this.style.background='#2a2f42';this.removeAttribute('src')"/>
        <div class="card-body">
          <div class="card-category">${p.categoria}</div>
          <div class="card-title">${p.nome}</div>
          <div class="card-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            ${p.cidade}, ${p.pais}
          </div>
          <div class="card-desc">${p.descricao}</div>
          <div class="card-footer">
            <div class="stars">
              <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ${Number(p.avaliacao).toFixed(1)}
            </div>
            <button class="btn-fav" data-id="${p.id}" style="
              background: transparent;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.3rem;
              color: ${fav ? 'var(--accent)' : 'var(--muted)'};
              font-size: 0.8rem;
              font-family: 'Inter', sans-serif;
              padding: 0;
            ">
              <svg viewBox="0 0 24 24" width="16" height="16"
                fill="${fav ? 'var(--accent)' : 'none'}"
                stroke="${fav ? 'var(--accent)' : 'currentColor'}"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                style="pointer-events:none;">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span style="pointer-events:none;">${fav ? 'Favoritado' : 'Favoritar'}</span>
            </button>
            ${usuario.adm ? `
            <button class="btn-excluir" data-id="${p.id}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span style="pointer-events:none;">Excluir</span>
            </button>` : ''}
            <span class="continente-tag">${p.continente}</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

document.getElementById('search').addEventListener('input', e => {
  searchTerm = e.target.value;
  render();
});

document.getElementById('grid').addEventListener('click', e => {
  const btnFav = e.target.closest('.btn-fav');
  if (btnFav) {
    toggleFavorito(Number(btnFav.dataset.id));
    return;
  }
  const btnDel = e.target.closest('.btn-excluir');
  if (btnDel) {
    excluirPonto(btnDel.dataset.id);
    return;
  }
  const card = e.target.closest('.card');
  if (card) {
    window.location.href = `../detalhes/detalhes.html?id=${card.dataset.id}`;
  }
});

async function excluirPonto(id) {
  if (!confirm('Tem certeza que deseja excluir este ponto turístico?')) return;

  try {
    const res = await fetch(`http://localhost:3000/pontos_turisticos/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Falha ao excluir ponto turístico');
    await loadData();
    mostrarToast('Ponto turístico excluído com sucesso!');
  } catch (err) {
    console.error('Erro ao excluir ponto turístico:', err);
  }
}

// ── Toast ───────────────────────────────────────────
function mostrarToast(mensagem) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensagem;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 2500);
}

// ── Modal: Criar Ponto Turístico ───────────────────
const modalCriarPonto = document.getElementById('modal-criar-ponto');
const formCriarPonto = document.getElementById('form-criar-ponto');

function abrirModalCriar() {
  modalCriarPonto.classList.add('active');
}

function fecharModalCriar() {
  modalCriarPonto.classList.remove('active');
  formCriarPonto.reset();
}

const btnAbrirModalCriar = document.getElementById('btn-abrir-modal-criar');
if (usuario.adm) {
  btnAbrirModalCriar.addEventListener('click', abrirModalCriar);
} else {
  btnAbrirModalCriar.classList.add('disabled');
  btnAbrirModalCriar.title = 'Disponível apenas para administradores';
  btnAbrirModalCriar.addEventListener('click', () => {
    mostrarToast('Disponível apenas para administradores.');
  });
}
document.getElementById('btn-fechar-modal-criar').addEventListener('click', fecharModalCriar);
document.getElementById('btn-cancelar-criar').addEventListener('click', fecharModalCriar);

modalCriarPonto.addEventListener('click', e => {
  if (e.target === modalCriarPonto) fecharModalCriar();
});

formCriarPonto.addEventListener('submit', async e => {
  e.preventDefault();
  const ponto_nome = document.getElementById("ponto-nome")
  const ponto_cidade = document.getElementById("ponto-cidade")
  const ponto_pais = document.getElementById("ponto-pais")
  const ponto_continente = document.getElementById("ponto-continente")
  const ponto_categoria = document.getElementById("ponto-categoria")
  const ponto_descricao = document.getElementById("ponto-descricao")
  const ponto_avaliacao = document.getElementById("ponto-avaliacao")
  const ponto_url = document.getElementById("ponto-imagem")

  try {
    const res = await fetch('http://localhost:3000/pontos_turisticos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: ponto_nome.value,
        cidade: ponto_cidade.value,
        pais: ponto_pais.value,
        continente: ponto_continente.value,
        descricao: ponto_descricao.value,
        categoria: ponto_categoria.value,
        avaliacao: Number(ponto_avaliacao.value),
        imagem: ponto_url.value
      })
    });
    if (!res.ok) throw new Error('Falha ao criar ponto turístico');
    await res.json();
    fecharModalCriar();
    await loadData();
    mostrarToast('Ponto turístico criado com sucesso!');
  } catch (err) {
    console.error('Erro ao criar ponto turístico:', err);
  }
});

loadData();