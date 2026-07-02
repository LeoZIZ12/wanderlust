// ── Auth ──────────────────────────────────────────
const usuarioSession = sessionStorage.getItem('usuario');
if (!usuarioSession) window.location.href = '../login/login.html';

let usuario = JSON.parse(usuarioSession);

document.querySelector('.greeting').innerHTML = `Olá, <strong>${usuario.nome}</strong> 👋`;

// Botão Sair
const btnLogout = document.createElement('button');
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
document.querySelector('.header-right').appendChild(btnLogout);

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

  renderFavButton();
}

// ── Dados ─────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const ponto_id = params.get('id');

const container = document.getElementById('detalhe-container');
let ponto = null;

function renderFavButton() {
  const fav = isFavorito(ponto.id);
  const btn = document.getElementById('btn-fav-detail');
  if (!btn) return;
  btn.style.color = fav ? 'var(--accent)' : 'var(--muted)';
  btn.style.borderColor = fav ? 'var(--accent)' : 'var(--border)';
  btn.querySelector('svg').setAttribute('fill', fav ? 'var(--accent)' : 'none');
  btn.querySelector('svg').setAttribute('stroke', fav ? 'var(--accent)' : 'currentColor');
  btn.querySelector('span').textContent = fav ? 'Favoritado' : 'Favoritar';
}

function renderDetalhe() {
  container.innerHTML = `
    <div class="detail-hero">
      <img class="detail-img" src="${ponto.imagem}" alt="${ponto.nome}"
           onerror="this.style.background='#2a2f42';this.removeAttribute('src')"/>
    </div>
    <div class="detail-content">
      <div class="detail-category">${ponto.categoria}</div>
      <h1 class="detail-title">${ponto.nome}</h1>
      <div class="detail-meta">
        <div class="detail-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          ${ponto.cidade}, ${ponto.pais}
        </div>
        <span class="continente-tag">${ponto.continente}</span>
        <div class="stars">
          <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ${ponto.avaliacao.toFixed(1)}
        </div>
      </div>
      <p class="detail-desc">${ponto.descricao}</p>
      <div class="detail-actions">
        <button class="btn-fav-detail" id="btn-fav-detail">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>Favoritar</span>
        </button>
        ${usuario.adm ? `
        <button class="btn-editar-detail" id="btn-editar-detail">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
          </svg>
          <span>Editar</span>
        </button>
        <button class="btn-excluir-detail" id="btn-excluir-detail">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <span>Excluir</span>
        </button>` : ''}
      </div>
    </div>
  `;
  renderFavButton();

  document.getElementById('btn-fav-detail').addEventListener('click', () => toggleFavorito(ponto.id));

  const btnExcluirDetail = document.getElementById('btn-excluir-detail');
  if (btnExcluirDetail) btnExcluirDetail.addEventListener('click', excluirPonto);

  const btnEditarDetail = document.getElementById('btn-editar-detail');
  if (btnEditarDetail) btnEditarDetail.addEventListener('click', abrirModalEditar);
}

async function excluirPonto() {
  if (!confirm('Tem certeza que deseja excluir este ponto turístico?')) return;

  try {
    const res = await fetch(`http://localhost:3000/pontos_turisticos/${ponto.id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Falha ao excluir ponto turístico');
    window.location.href = '../home/index.html';
  } catch (err) {
    console.error('Erro ao excluir ponto turístico:', err);
  }
}

// ── Modal: Editar Ponto Turístico ──────────────────
const modalEditarPonto = document.getElementById('modal-editar-ponto');
const formEditarPonto = document.getElementById('form-editar-ponto');

function abrirModalEditar() {
  document.getElementById('edit-nome').value = ponto.nome || '';
  document.getElementById('edit-cidade').value = ponto.cidade || '';
  document.getElementById('edit-pais').value = ponto.pais || '';
  document.getElementById('edit-continente').value = ponto.continente || '';
  document.getElementById('edit-categoria').value = ponto.categoria || '';
  document.getElementById('edit-descricao').value = ponto.descricao || '';
  document.getElementById('edit-avaliacao').value = ponto.avaliacao ?? '';
  document.getElementById('edit-imagem').value = ponto.imagem || '';

  modalEditarPonto.classList.add('active');
}

function fecharModalEditar() {
  modalEditarPonto.classList.remove('active');
  formEditarPonto.reset();
}

document.getElementById('btn-fechar-modal-editar').addEventListener('click', fecharModalEditar);
document.getElementById('btn-cancelar-editar').addEventListener('click', fecharModalEditar);

modalEditarPonto.addEventListener('click', e => {
  if (e.target === modalEditarPonto) fecharModalEditar();
});

formEditarPonto.addEventListener('submit', async e => {
  e.preventDefault();

  const dadosAtualizados = {
    nome: document.getElementById('edit-nome').value,
    cidade: document.getElementById('edit-cidade').value,
    pais: document.getElementById('edit-pais').value,
    continente: document.getElementById('edit-continente').value,
    categoria: document.getElementById('edit-categoria').value,
    descricao: document.getElementById('edit-descricao').value,
    avaliacao: Number(document.getElementById('edit-avaliacao').value),
    imagem: document.getElementById('edit-imagem').value
  };

  try {
    const res = await fetch(`http://localhost:3000/pontos_turisticos/${ponto.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ponto.id, ...dadosAtualizados })
    });
    if (!res.ok) throw new Error('Falha ao editar ponto turístico');

    ponto = await res.json();
    fecharModalEditar();
    renderDetalhe();
    mostrarToast('Ponto turístico atualizado com sucesso!');
  } catch (err) {
    console.error('Erro ao editar ponto turístico:', err);
  }
});

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

function renderErro(msg) {
  container.innerHTML = `<div class="detail-loading">${msg}</div>`;
}

async function loadDetalhe() {
  if (!ponto_id) {
    renderErro('Nenhum destino informado.');
    return;
  }

  try {
    const resUser = await fetch(`http://localhost:3000/usuarios/${usuario.id}`);
    usuario = await resUser.json();
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
  } catch (e) {
    console.error('Erro ao recarregar usuário:', e);
  }

  try {
    const res = await fetch(`http://localhost:3000/pontos_turisticos/${ponto_id}`);
    if (!res.ok) {
      renderErro('Destino não encontrado.');
      return;
    }
    ponto = await res.json();
    renderDetalhe();
  } catch (err) {
    console.error('Erro ao carregar destino:', err);
    renderErro('Erro ao carregar destino.');
  }
}

loadDetalhe();
