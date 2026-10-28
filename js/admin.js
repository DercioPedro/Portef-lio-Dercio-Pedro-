const tokenKey = 'dercio_admin_token';
const $ = (id) => document.getElementById(id);

function token() {
  return localStorage.getItem(tokenKey);
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem(tokenKey);
    location.reload();
    throw new Error('auth');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro');
  return data;
}

function showApp(show) {
  $('loginView').classList.toggle('hidden', show);
  $('appView').classList.toggle('hidden', !show);
}

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('loginError').textContent = '';
  const form = new FormData(e.target);
  try {
    const data = await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        username: form.get('username'),
        password: form.get('password'),
      }),
    });
    localStorage.setItem(tokenKey, data.token);
    showApp(true);
    loadAll();
  } catch (err) {
    $('loginError').textContent = err.message;
  }
});

$('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem(tokenKey);
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

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const data = await api('/api/admin/upload', { method: 'POST', body: fd });
  return data.url;
}

async function loadDash() {
  const d = await api('/api/admin/dashboard');
  $('stats').innerHTML = `
    <div class="stat"><b>${d.projects}</b><span>Projectos</span></div>
    <div class="stat"><b>${d.published}</b><span>Publicados</span></div>
    <div class="stat"><b>${d.unread}</b><span>Mensagens novas</span></div>
    <div class="stat"><b>${d.skills}</b><span>Skills</span></div>
  `;
  $('recentMessages').innerHTML = `<h3>Mensagens recentes</h3>` + (d.recentMessages || []).map((m) => `
    <div class="row"><div><b>${m.name}</b><div>${m.message}</div></div><small>${new Date(m.createdAt).toLocaleString()}</small></div>
  `).join('') || '<p>Sem mensagens.</p>';
}

async function loadProjects() {
  const list = await api('/api/admin/projects');
  $('projectsList').innerHTML = list.map((p) => `
    <div class="row">
      ${p.image ? `<img class="preview" src="${p.image}">` : ''}
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
    btn.onclick = async () => {
      if (!confirm('Apagar este projecto?')) return;
      await api(`/api/admin/projects/${btn.dataset.del}`, { method: 'DELETE' });
      loadProjects();
      loadDash();
    };
  });
  $('projectsList').querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.onclick = async () => {
      const item = list.find((x) => x.id === btn.dataset.toggle);
      await api(`/api/admin/projects/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ published: !item.published }),
      });
      loadProjects();
      loadDash();
    };
  });
}

$('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  let image = '';
  const file = $('projectImage').files[0];
  if (file) image = await uploadFile(file);
  await api('/api/admin/projects', {
    method: 'POST',
    body: JSON.stringify({
      title: form.get('title'),
      description: form.get('description'),
      tech: form.get('tech'),
      liveUrl: form.get('liveUrl'),
      repoUrl: form.get('repoUrl'),
      published: form.get('published') === 'on',
      featured: form.get('featured') === 'on',
      image,
    }),
  });
  e.target.reset();
  loadProjects();
  loadDash();
});

async function loadSkills() {
  const list = await api('/api/admin/skills');
  $('skillsList').innerHTML = list.map((s) => `
    <div class="row">
      <div><b>${s.name}</b> · ${s.category} · ${s.level}%</div>
      <button class="btn btn-danger" data-del="${s.id}">Apagar</button>
    </div>
  `).join('');
  $('skillsList').querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = async () => {
      await api(`/api/admin/skills/${btn.dataset.del}`, { method: 'DELETE' });
      loadSkills();
    };
  });
}

$('skillForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  await api('/api/admin/skills', {
    method: 'POST',
    body: JSON.stringify({
      name: form.get('name'),
      level: form.get('level'),
      category: form.get('category'),
    }),
  });
  e.target.reset();
  loadSkills();
});

async function loadServices() {
  const list = await api('/api/admin/services');
  $('servicesList').innerHTML = list.map((s) => `
    <div class="row">
      <div><b>${s.title}</b><div>${s.description}</div></div>
      <button class="btn btn-danger" data-del="${s.id}">Apagar</button>
    </div>
  `).join('');
  $('servicesList').querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = async () => {
      await api(`/api/admin/services/${btn.dataset.del}`, { method: 'DELETE' });
      loadServices();
    };
  });
}

$('serviceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  await api('/api/admin/services', {
    method: 'POST',
    body: JSON.stringify({
      title: form.get('title'),
      icon: form.get('icon'),
      description: form.get('description'),
    }),
  });
  e.target.reset();
  loadServices();
});

async function loadExp() {
  const list = await api('/api/admin/experience');
  $('expList').innerHTML = list.map((s) => `
    <div class="row">
      <div><b>${s.year}</b> ${s.title}<div>${s.place}</div></div>
      <button class="btn btn-danger" data-del="${s.id}">Apagar</button>
    </div>
  `).join('');
  $('expList').querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = async () => {
      await api(`/api/admin/experience/${btn.dataset.del}`, { method: 'DELETE' });
      loadExp();
    };
  });
}

$('expForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  await api('/api/admin/experience', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(form.entries())),
  });
  e.target.reset();
  loadExp();
});

async function loadMessages() {
  const list = await api('/api/admin/messages');
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
    btn.onclick = async () => {
      await api(`/api/admin/messages/${btn.dataset.read}/read`, { method: 'PUT' });
      loadMessages();
      loadDash();
    };
  });
  $('messagesList').querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = async () => {
      await api(`/api/admin/messages/${btn.dataset.del}`, { method: 'DELETE' });
      loadMessages();
      loadDash();
    };
  });
}

async function loadProfile() {
  const data = await api('/api/admin/profile');
  const p = data.profile || {};
  const form = $('profileForm');
  ['name', 'title', 'tagline', 'bio', 'email', 'phone', 'location', 'github', 'linkedin', 'instagram', 'whatsapp'].forEach((k) => {
    if (form[k]) form[k].value = p[k] || '';
  });
  form.available.checked = Boolean(p.available);
}

$('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const profile = Object.fromEntries(form.entries());
  profile.available = form.get('available') === 'on';
  const file = $('avatarFile').files[0];
  if (file) profile.avatar = await uploadFile(file);
  await api('/api/admin/profile', { method: 'PUT', body: JSON.stringify({ profile }) });
  alert('Perfil actualizado');
});

$('passForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await api('/api/admin/password', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword: form.get('currentPassword'),
        newPassword: form.get('newPassword'),
      }),
    });
    alert('Palavra-passe actualizada');
    e.target.reset();
  } catch (err) {
    alert(err.message);
  }
});

async function loadAll() {
  await Promise.all([loadDash(), loadProjects(), loadSkills(), loadServices(), loadExp(), loadMessages(), loadProfile()]);
}

if (token()) {
  showApp(true);
  loadAll().catch(() => showApp(false));
}
