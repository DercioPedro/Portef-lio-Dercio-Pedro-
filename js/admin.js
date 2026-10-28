const tokenKey = 'dercio_admin_token';
const dbKey = 'dercio_portfolio_db';
const $ = (id) => document.getElementById(id);

function defaultDb() {
  return {
    admin: { username: 'dercio', password: 'Dercio@2026' },
    profile: {
      name: 'Dercio Pedro Luis',
      title: 'Desenvolvedor Web',
      tagline: 'Crio experiências digitais rápidas, elegantes e com impacto real.',
      bio: 'Olá! Sou Dercio Pedro Luis, desenvolvedor front-end com paixão por criar interfaces modernas e performáticas. Trabalho lado a lado com design para transformar ideias em código de qualidade. Entusiasta de React, UX e inovações web, baseado em Nampula, Moçambique.',
      email: 'derciop66@gmail.com',
      phone: '+258 85 681 6986',
      location: 'Nampula, Moçambique',
      github: 'https://github.com/DercioPedro',
      linkedin: '',
      instagram: '',
      twitter: '',
      whatsapp: 'https://wa.me/258856816986',
      avatar: 'uploads/avatar.jpg',
      available: true,
    },
    skills: [
      { id: 's1', name: 'HTML & CSS', level: 95, category: 'Frontend' },
      { id: 's2', name: 'JavaScript', level: 90, category: 'Frontend' },
      { id: 's3', name: 'React', level: 88, category: 'Frontend' },
      { id: 's4', name: 'UI / UX', level: 80, category: 'Frontend' },
      { id: 's5', name: 'Node.js', level: 75, category: 'Backend' },
      { id: 's6', name: 'TypeScript', level: 85, category: 'Backend' },
      { id: 's7', name: 'Git & GitHub', level: 90, category: 'Ferramentas' },
      { id: 's8', name: 'SQL / NoSQL', level: 70, category: 'Backend' },
    ],
    projects: [
      {
        id: 'p1',
        title: 'Saúde Nampula',
        description: 'Plataforma que reúne informações de farmácias, centros de saúde e hospitais da cidade de Nampula, com medicamentos disponíveis, horários e localização.',
        image: '',
        tech: ['React', 'Node', 'MongoDB'],
        liveUrl: 'https://derciopedro.github.io/Saude-nampula/',
        repoUrl: '',
        featured: true,
        published: true,
      },
      {
        id: 'p2',
        title: 'Sistema de Gestão de Vendas',
        description: 'Sistema de gestão de vendas com controlo de stock, relatórios e fluxo de caixa.',
        image: '',
        tech: ['HTML', 'JavaScript', 'MySQL'],
        liveUrl: 'https://derciopedro.github.io/Sistemadegestao/',
        repoUrl: '',
        featured: true,
        published: true,
      },
    ],
    services: [
      { id: 'sv1', icon: 'fa-code', title: 'Desenvolvimento Web', description: 'Sites e aplicações modernas, rápidas e responsivas com foco em experiência do utilizador.' },
      { id: 'sv2', icon: 'fa-mobile-screen', title: 'Interfaces UI/UX', description: 'Design de interfaces limpas, acessíveis e alinhadas com a identidade da tua marca.' },
      { id: 'sv3', icon: 'fa-server', title: 'APIs e Backend', description: 'Integração de APIs, bases de dados e lógica de negócio para produtos digitais sólidos.' },
    ],
    experience: [
      { id: 'e1', year: '2024 — Agora', title: 'Desenvolvedor Web Freelance', place: 'Nampula, Moçambique', description: 'Criação de sites, sistemas de gestão e plataformas digitais para clientes locais.' },
      { id: 'e2', year: '2023 — 2024', title: 'Projectos pessoais e open source', place: 'GitHub', description: 'Construção de soluções como Saúde Nampula e sistemas de gestão de vendas.' },
    ],
    messages: [],
    settings: { siteTitle: 'Dercio Pedro Luis · Dev Web' },
  };
}

function readDb() {
  try {
    const raw = localStorage.getItem(dbKey);
    if (!raw) {
      const db = defaultDb();
      writeDb(db);
      return db;
    }
    return { ...defaultDb(), ...JSON.parse(raw) };
  } catch {
    return defaultDb();
  }
}

function writeDb(db) {
  localStorage.setItem(dbKey, JSON.stringify(db));
}

function uid() {
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showApp(show) {
  $('loginView').classList.toggle('hidden', show);
  $('appView').classList.toggle('hidden', !show);
}

$('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  $('loginError').textContent = '';
  const form = new FormData(e.target);
  const db = readDb();
  const username = String(form.get('username') || '');
  const password = String(form.get('password') || '');
  if (username !== db.admin.username || password !== db.admin.password) {
    $('loginError').textContent = 'Credenciais incorrectas';
    return;
  }
  sessionStorage.setItem(tokenKey, 'ok');
  showApp(true);
  loadAll();
});

$('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem(tokenKey);
  location.reload();
});

document.querySelectorAll('.nav-btn[data-tab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn[data-tab]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    ['dash', 'projects', 'skills', 'services', 'experience', 'messages', 'profile'].forEach((t) => {
      $(`tab-${t}`).classList.toggle('hidden', t !== tab);
    });
    const titles = {
      dash: 'Resumo',
      projects: 'Projectos',
      skills: 'Skills',
      services: 'Serviços',
      experience: 'Percurso',
      messages: 'Mensagens',
      profile: 'Perfil',
    };
    $('pageTitle').textContent = titles[tab];
  });
});

function loadDash() {
  const db = readDb();
  const unread = (db.messages || []).filter((m) => !m.read).length;
  $('stats').innerHTML = `
    <div class="stat"><b>${db.projects.length}</b><span>Projectos</span></div>
    <div class="stat"><b>${db.projects.filter((p) => p.published).length}</b><span>Publicados</span></div>
    <div class="stat"><b>${unread}</b><span>Mensagens novas</span></div>
    <div class="stat"><b>${db.skills.length}</b><span>Skills</span></div>
  `;
  $('recentMessages').innerHTML = '<h3>Mensagens recentes</h3>' + ((db.messages || []).slice(0, 5).map((m) => `
    <div class="row"><div><b>${m.name}</b><div>${m.message}</div></div><small>${new Date(m.createdAt).toLocaleString()}</small></div>
  `).join('') || '<p>Sem mensagens.</p>');
}

function loadProjects() {
  const list = readDb().projects || [];
  $('projectsList').innerHTML = list.map((p) => `
    <div class="row">
      ${p.image ? `<img class="preview" src="${p.image}" alt="">` : ''}
      <div style="flex:1">
        <b>${p.title}</b>
        <div>${(p.tech || []).join(', ')}</div>
        <span class="badge ${p.published ? '' : 'warn'}">${p.published ? 'Publicado' : 'Rascunho'}</span>
      </div>
      <button class="btn btn-ghost" data-toggle="${p.id}">${p.published ? 'Ocultar' : 'Publicar'}</button>
      <button class="btn btn-danger" data-del="${p.id}">Apagar</button>
    </div>
  `).join('') || '<p>Ainda sem projectos.</p>';

  $('projectsList').querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = () => {
      if (!confirm('Apagar este projecto?')) return;
      const db = readDb();
      db.projects = db.projects.filter((p) => p.id !== btn.dataset.del);
      writeDb(db);
      loadProjects();
      loadDash();
    };
  });
  $('projectsList').querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.onclick = () => {
      const db = readDb();
      const item = db.projects.find((x) => x.id === btn.dataset.toggle);
      if (item) item.published = !item.published;
      writeDb(db);
      loadProjects();
      loadDash();
    };
  });
}

$('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const file = $('projectImage').files[0];
  const image = file ? await fileToDataUrl(file) : '';
  const db = readDb();
  db.projects.push({
    id: uid(),
    title: form.get('title'),
    description: form.get('description'),
    tech: String(form.get('tech') || '').split(',').map((t) => t.trim()).filter(Boolean),
    liveUrl: form.get('liveUrl'),
    repoUrl: form.get('repoUrl'),
    published: form.get('published') === 'on',
    featured: form.get('featured') === 'on',
    image,
  });
  writeDb(db);
  e.target.reset();
  loadProjects();
  loadDash();
});

function loadSkills() {
  const list = readDb().skills || [];
  $('skillsList').innerHTML = list.map((s) => `
    <div class="row">
      <div><b>${s.name}</b> · ${s.category} · ${s.level}%</div>
      <button class="btn btn-danger" data-del="${s.id}">Apagar</button>
    </div>
  `).join('');
  $('skillsList').querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = () => {
      const db = readDb();
      db.skills = db.skills.filter((s) => s.id !== btn.dataset.del);
      writeDb(db);
      loadSkills();
      loadDash();
    };
  });
}

$('skillForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const db = readDb();
  db.skills.push({
    id: uid(),
    name: form.get('name'),
    level: Number(form.get('level') || 80),
    category: form.get('category') || 'Frontend',
  });
  writeDb(db);
  e.target.reset();
  loadSkills();
  loadDash();
});

function loadServices() {
  const list = readDb().services || [];
  $('servicesList').innerHTML = list.map((s) => `
    <div class="row">
      <div><b>${s.title}</b><div>${s.description}</div></div>
      <button class="btn btn-danger" data-del="${s.id}">Apagar</button>
    </div>
  `).join('');
  $('servicesList').querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = () => {
      const db = readDb();
      db.services = db.services.filter((s) => s.id !== btn.dataset.del);
      writeDb(db);
      loadServices();
    };
  });
}

$('serviceForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const db = readDb();
  db.services.push({
    id: uid(),
    title: form.get('title'),
    icon: form.get('icon') || 'fa-star',
    description: form.get('description'),
  });
  writeDb(db);
  e.target.reset();
  loadServices();
});

function loadExp() {
  const list = readDb().experience || [];
  $('expList').innerHTML = list.map((s) => `
    <div class="row">
      <div><b>${s.year}</b> ${s.title}<div>${s.place}</div></div>
      <button class="btn btn-danger" data-del="${s.id}">Apagar</button>
    </div>
  `).join('');
  $('expList').querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = () => {
      const db = readDb();
      db.experience = db.experience.filter((s) => s.id !== btn.dataset.del);
      writeDb(db);
      loadExp();
    };
  });
}

$('expForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const db = readDb();
  db.experience.push({ id: uid(), ...Object.fromEntries(form.entries()) });
  writeDb(db);
  e.target.reset();
  loadExp();
});

function loadMessages() {
  const list = readDb().messages || [];
  $('messagesList').innerHTML = list.map((m) => `
    <div class="row">
      <div>
        <b>${m.name}</b> · ${m.email}
        <div>${m.message}</div>
        <small>${new Date(m.createdAt).toLocaleString()}</small>
        ${m.read ? '' : '<span class="badge warn">Nova</span>'}
      </div>
      <button class="btn btn-ghost" data-read="${m.id}">Lida</button>
      <button class="btn btn-danger" data-del="${m.id}">Apagar</button>
    </div>
  `).join('') || '<p>Sem mensagens.</p>';
  $('messagesList').querySelectorAll('[data-read]').forEach((btn) => {
    btn.onclick = () => {
      const db = readDb();
      const msg = db.messages.find((m) => m.id === btn.dataset.read);
      if (msg) msg.read = true;
      writeDb(db);
      loadMessages();
      loadDash();
    };
  });
  $('messagesList').querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = () => {
      const db = readDb();
      db.messages = db.messages.filter((m) => m.id !== btn.dataset.del);
      writeDb(db);
      loadMessages();
      loadDash();
    };
  });
}

function loadProfile() {
  const p = readDb().profile || {};
  const form = $('profileForm');
  ['name', 'title', 'tagline', 'bio', 'email', 'phone', 'location', 'github', 'linkedin', 'instagram', 'whatsapp'].forEach((k) => {
    if (form[k]) form[k].value = p[k] || '';
  });
  form.available.checked = Boolean(p.available);
}

$('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const db = readDb();
  db.profile = { ...db.profile, ...Object.fromEntries(form.entries()) };
  db.profile.available = form.get('available') === 'on';
  const file = $('avatarFile').files[0];
  if (file) db.profile.avatar = await fileToDataUrl(file);
  writeDb(db);
  alert('Perfil actualizado. Recarrega o site para ver as mudanças.');
});

$('passForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const db = readDb();
  if (form.get('currentPassword') !== db.admin.password) {
    alert('Palavra-passe actual incorrecta');
    return;
  }
  const next = String(form.get('newPassword') || '');
  if (next.length < 6) {
    alert('A nova palavra-passe deve ter pelo menos 6 caracteres');
    return;
  }
  db.admin.password = next;
  writeDb(db);
  alert('Palavra-passe actualizada');
  e.target.reset();
});

function loadAll() {
  loadDash();
  loadProjects();
  loadSkills();
  loadServices();
  loadExp();
  loadMessages();
  loadProfile();
}

if (sessionStorage.getItem(tokenKey) === 'ok') {
  showApp(true);
  loadAll();
}
