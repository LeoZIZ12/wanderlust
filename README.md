# Wanderlust ✈️

Aplicação web completa de catálogo de destinos turísticos, com autenticação de usuários, sistema de favoritos, permissões de administrador e operações CRUD completas consumindo uma API REST simulada.

Projeto mais avançado do meu 1º período de Engenharia de Software (PUC Minas), reunindo os principais fundamentos trabalhados no semestre em desenvolvimento de interfaces web: HTML/CSS/JS, consumo de API REST (GET, POST, PUT, DELETE), autenticação básica, controle de sessão, manipulação avançada do DOM e integração com serviços externos (mapa).

## ⚙️ Funcionalidades

**Autenticação e usuários**
- Tela de login e cadastro de novos usuários
- Sessão do usuário mantida via `sessionStorage`
- Distinção entre usuário comum e **administrador** (`adm: true`), com permissões diferentes na interface

**Catálogo de destinos**
- Listagem de destinos turísticos com imagem, categoria, avaliação, cidade e país
- **Carrossel de destaques** com os 5 destinos mais bem avaliados
- **Busca** por nome, cidade, país ou continente
- **Filtro por categoria** (Monumento, Sítio Histórico, Natureza, Templo, etc.), gerado dinamicamente a partir dos dados
- **Página de detalhes** individual para cada destino, acessada via parâmetro de URL

**Favoritos**
- Usuários podem favoritar/desfavoritar destinos
- Aba dedicada para visualizar apenas os favoritos
- Favoritos persistidos no back-end (associados ao usuário logado, não apenas localmente)

**CRUD completo (somente administradores)**
- **Criar** novo destino turístico via modal com formulário
- **Editar** um destino existente
- **Excluir** um destino (com confirmação)
- Todas as operações refletem imediatamente na interface após a resposta da API

**Extras**
- Página de **mapa** interativo (Mapbox GL)
- Notificações temporárias (toast) para ações como criar, editar e excluir
- Tratamento de erro de imagem (fallback visual quando a URL da foto falha)

## 🛠️ Tecnologias

- **HTML5 / CSS3** — tema visual próprio (dark mode), com variáveis CSS para cores e tipografia combinando as fontes Playfair Display e Inter
- **JavaScript (vanilla)** — toda a lógica de autenticação, filtros, busca, favoritos e CRUD, sem frameworks
- **Bootstrap 5** — componente de carrossel
- **JSON Server + lowdb** — simula uma API REST completa a partir do `db/db.json`, com suporte a GET, POST, PUT, PATCH e DELETE
- **Mapbox GL JS** — renderização da página de mapa
- **sessionStorage** — controle de sessão do usuário no navegador

## 🔎 API testada manualmente

Todas as operações da API (GET, POST, PUT, DELETE) foram testadas e documentadas tanto pelo **Postman** quanto pela aba **Network** do navegador, com prints salvos em `docs/prints/`, validando o funcionamento correto de cada endpoint antes da integração com a interface.

## 📂 Estrutura do projeto

```
WonderLust/
├── db/
│   └── db.json                 # Usuários e destinos turísticos (dados simulados)
├── docs/
│   └── prints/                  # Evidências de teste da API (Postman + Network)
├── public/
│   ├── login/
│   │   └── login.html            # Login e cadastro de usuários
│   ├── home/
│   │   ├── index.html             # Catálogo, busca, filtros, carrossel
│   │   └── app.js                  # Lógica principal (dados, favoritos, CRUD)
│   ├── detalhes/
│   │   ├── detalhes.html           # Página de detalhes do destino
│   │   └── detalhes.js              # Lógica de edição/exclusão do destino
│   ├── mapa/
│   │   └── mapa.html                # Página de mapa interativo
│   └── style.css                     # Estilo visual global
├── package.json
```

## ▶️ Como executar

Depende do Node.js, pois o back-end simulado roda via JSON Server.

```bash
git clone https://github.com/leonardomartinsmacedo/wanderlust.git
cd wanderlust
npm install
npm start
```

O servidor sobe em `http://localhost:3000`, servindo tanto a API (`/pontos_turisticos`, `/usuarios`) quanto os arquivos estáticos da pasta `public`. Acesse `http://localhost:3000/login/login.html` para começar.

**Usuários de teste:**

| Papel | E-mail | Senha |
|---|---|---|
| Administrador | adm@gmail.com | 123 |
| Usuário comum | leo@gmail.com | 123 |

## 🔧 Possíveis melhorias futuras

- Implementar autenticação real com hash de senha (atualmente a senha é comparada em texto puro, adequado apenas para fins didáticos)
- Adicionar paginação ou scroll infinito para grandes volumes de destinos
- Validar campos do formulário de criação/edição no front-end antes do envio
- Adicionar testes automatizados para os endpoints da API

## 👤 Autor

Leonardo Martins Macedo — Estudante de Engenharia de Software, PUC Minas
