const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuid } = require('uuid');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dercio-portfolio-secret-change-me';
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

[DATA_DIR, UPLOAD_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function defaultDb() {
  const passwordHash = bcrypt.hashSync('Dercio@2026', 10);
  return {
    admin: {
      username: 'dercio',
      passwordHash,
    },
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
      avatar: '/uploads/avatar.jpg',
      available: true,
    },
    skills: [
      { id: uuid(), name: 'HTML & CSS', level: 95, category: 'Frontend' },
      { id: uuid(), name: 'JavaScript', level: 90, category: 'Frontend' },
      { id: uuid(), name: 'React', level: 88, category: 'Frontend' },
      { id: uuid(), name: 'UI / UX', level: 80, category: 'Frontend' },
      { id: uuid(), name: 'Node.js', level: 75, category: 'Backend' },
      { id: uuid(), name: 'TypeScript', level: 85, category: 'Backend' },
      { id: uuid(), name: 'Git & GitHub', level: 90, category: 'Ferramentas' },
      { id: uuid(), name: 'SQL / NoSQL', level: 70, category: 'Backend' },
    ],
    projects: [
      {
        id: uuid(),
        title: 'Saúde Nampula',
        description:
          'Plataforma que reúne informações de farmácias, centros de saúde e hospitais da cidade de Nampula, com medicamentos disponíveis, horários e localização.',
        image: '',
        tech: ['React', 'Node', 'MongoDB'],
        liveUrl: 'https://derciopedro.github.io/Saude-nampula/',
        repoUrl: '',
        featured: true,
        published: true,
        order: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: uuid(),
        title: 'Sistema de Gestão de Vendas',
        description: 'Sistema de gestão de vendas com controlo de stock, relatórios e fluxo de caixa.',
        image: '',
        tech: ['HTML', 'JavaScript', 'MySQL'],
        liveUrl: 'https://derciopedro.github.io/Sistemadegestao/',
        repoUrl: '',
        featured: true,
        published: true,
        order: 2,
        createdAt: new Date().toISOString(),
      },
    ],
    services: [
      {
        id: uuid(),
        icon: 'fa-code',
        title: 'Desenvolvimento Web',
        description: 'Sites e aplicações modernas, rápidas e responsivas com foco em experiência do utilizador.',
      },
      {
        id: uuid(),
        icon: 'fa-mobile-screen',
        title: 'Interfaces UI/UX',
        description: 'Design de interfaces limpas, acessíveis e alinhadas com a identidade da tua marca.',
      },
      {
        id: uuid(),
        icon: 'fa-server',
        title: 'APIs e Backend',
        description: 'Integração de APIs, bases de dados e lógica de negócio para produtos digitais sólidos.',
      },
    ],
    experience: [
      {
        id: uuid(),
        year: '2024 — Agora',
        title: 'Desenvolvedor Web Freelance',
        place: 'Nampula, Moçambique',
        description: 'Criação de sites, sistemas de gestão e plataformas digitais para clientes locais.',
      },
      {
        id: uuid(),
        year: '2023 — 2024',
        title: 'Projectos pessoais e open source',
        place: 'GitHub',
        description: 'Construção de soluções como Saúde Nampula e sistemas de gestão de vendas.',
      },
    ],
    messages: [],
    settings: {
      siteTitle: 'Dercio Pedro Luis · Dev Web',
      accent: '#38bdf8',
    },
  };
}

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    const db = defaultDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    return db;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg') || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas imagens são permitidas'));
    }
    cb(null, true);
  },
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(FRONTEND_DIR));

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Não autenticado' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Sessão inválida ou expirada' });
  }
}

app.get('/api/portfolio', (_req, res) => {
  const db = readDb();
  res.json({
    profile: db.profile,
    skills: db.skills,
    projects: (db.projects || [])
      .filter((p) => p.published)
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    services: db.services || [],
    experience: db.experience || [],
    settings: db.settings,
  });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Preenche todos os campos' });
  }
  const db = readDb();
  db.messages.unshift({
    id: uuid(),
    name: String(name).slice(0, 120),
    email: String(email).slice(0, 180),
    message: String(message).slice(0, 4000),
    read: false,
    createdAt: new Date().toISOString(),
  });
  writeDb(db);
  res.json({ success: true });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const db = readDb();
  if (!username || !password) {
    return res.status(400).json({ error: 'Utilizador e palavra-passe obrigatórios' });
  }
  if (username !== db.admin.username || !bcrypt.compareSync(password, db.admin.passwordHash)) {
    return res.status(401).json({ error: 'Credenciais incorrectas' });
  }
  const token = jwt.sign({ username: db.admin.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: db.admin.username });
});

app.get('/api/admin/me', auth, (_req, res) => {
  const db = readDb();
  res.json({ username: db.admin.username, profile: db.profile });
});

app.get('/api/admin/dashboard', auth, (_req, res) => {
  const db = readDb();
  res.json({
    projects: db.projects.length,
    published: db.projects.filter((p) => p.published).length,
    messages: db.messages.length,
    unread: db.messages.filter((m) => !m.read).length,
    skills: db.skills.length,
    recentMessages: db.messages.slice(0, 5),
  });
});

app.get('/api/admin/projects', auth, (_req, res) => {
  const db = readDb();
  res.json(db.projects.sort((a, b) => (a.order || 0) - (b.order || 0)));
});

app.post('/api/admin/projects', auth, (req, res) => {
  const db = readDb();
  const body = req.body || {};
  const project = {
    id: uuid(),
    title: body.title || 'Novo projecto',
    description: body.description || '',
    image: body.image || '',
    tech: Array.isArray(body.tech) ? body.tech : String(body.tech || '').split(',').map((t) => t.trim()).filter(Boolean),
    liveUrl: body.liveUrl || '',
    repoUrl: body.repoUrl || '',
    featured: Boolean(body.featured),
    published: body.published !== false,
    order: Number(body.order) || db.projects.length + 1,
    createdAt: new Date().toISOString(),
  };
  db.projects.push(project);
  writeDb(db);
  res.json(project);
});

app.put('/api/admin/projects/:id', auth, (req, res) => {
  const db = readDb();
  const idx = db.projects.findIndex((p) => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Projecto não encontrado' });
  const body = req.body || {};
  const current = db.projects[idx];
  db.projects[idx] = {
    ...current,
    title: body.title ?? current.title,
    description: body.description ?? current.description,
    image: body.image ?? current.image,
    tech: body.tech
      ? Array.isArray(body.tech)
        ? body.tech
        : String(body.tech).split(',').map((t) => t.trim()).filter(Boolean)
      : current.tech,
    liveUrl: body.liveUrl ?? current.liveUrl,
    repoUrl: body.repoUrl ?? current.repoUrl,
    featured: body.featured ?? current.featured,
    published: body.published ?? current.published,
    order: body.order != null ? Number(body.order) : current.order,
  };
  writeDb(db);
  res.json(db.projects[idx]);
});

app.delete('/api/admin/projects/:id', auth, (req, res) => {
  const db = readDb();
  db.projects = db.projects.filter((p) => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

app.get('/api/admin/skills', auth, (_req, res) => {
  res.json(readDb().skills);
});

app.post('/api/admin/skills', auth, (req, res) => {
  const db = readDb();
  const skill = {
    id: uuid(),
    name: req.body.name || 'Nova skill',
    level: Math.min(100, Math.max(0, Number(req.body.level) || 50)),
    category: req.body.category || 'Frontend',
  };
  db.skills.push(skill);
  writeDb(db);
  res.json(skill);
});

app.put('/api/admin/skills/:id', auth, (req, res) => {
  const db = readDb();
  const idx = db.skills.findIndex((s) => s.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Skill não encontrada' });
  db.skills[idx] = {
    ...db.skills[idx],
    name: req.body.name ?? db.skills[idx].name,
    level: req.body.level != null ? Math.min(100, Math.max(0, Number(req.body.level))) : db.skills[idx].level,
    category: req.body.category ?? db.skills[idx].category,
  };
  writeDb(db);
  res.json(db.skills[idx]);
});

app.delete('/api/admin/skills/:id', auth, (req, res) => {
  const db = readDb();
  db.skills = db.skills.filter((s) => s.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

app.get('/api/admin/services', auth, (_req, res) => res.json(readDb().services || []));

app.post('/api/admin/services', auth, (req, res) => {
  const db = readDb();
  db.services = db.services || [];
  const item = {
    id: uuid(),
    icon: req.body.icon || 'fa-star',
    title: req.body.title || 'Serviço',
    description: req.body.description || '',
  };
  db.services.push(item);
  writeDb(db);
  res.json(item);
});

app.put('/api/admin/services/:id', auth, (req, res) => {
  const db = readDb();
  db.services = db.services || [];
  const idx = db.services.findIndex((s) => s.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Serviço não encontrado' });
  db.services[idx] = { ...db.services[idx], ...req.body, id: db.services[idx].id };
  writeDb(db);
  res.json(db.services[idx]);
});

app.delete('/api/admin/services/:id', auth, (req, res) => {
  const db = readDb();
  db.services = (db.services || []).filter((s) => s.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

app.get('/api/admin/experience', auth, (_req, res) => res.json(readDb().experience || []));

app.post('/api/admin/experience', auth, (req, res) => {
  const db = readDb();
  db.experience = db.experience || [];
  const item = {
    id: uuid(),
    year: req.body.year || '',
    title: req.body.title || '',
    place: req.body.place || '',
    description: req.body.description || '',
  };
  db.experience.push(item);
  writeDb(db);
  res.json(item);
});

app.put('/api/admin/experience/:id', auth, (req, res) => {
  const db = readDb();
  db.experience = db.experience || [];
  const idx = db.experience.findIndex((s) => s.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Não encontrado' });
  db.experience[idx] = { ...db.experience[idx], ...req.body, id: db.experience[idx].id };
  writeDb(db);
  res.json(db.experience[idx]);
});

app.delete('/api/admin/experience/:id', auth, (req, res) => {
  const db = readDb();
  db.experience = (db.experience || []).filter((s) => s.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

app.get('/api/admin/messages', auth, (_req, res) => res.json(readDb().messages));

app.put('/api/admin/messages/:id/read', auth, (req, res) => {
  const db = readDb();
  const msg = db.messages.find((m) => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Mensagem não encontrada' });
  msg.read = true;
  writeDb(db);
  res.json(msg);
});

app.delete('/api/admin/messages/:id', auth, (req, res) => {
  const db = readDb();
  db.messages = db.messages.filter((m) => m.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

app.get('/api/admin/profile', auth, (_req, res) => {
  const db = readDb();
  res.json({ profile: db.profile, settings: db.settings });
});

app.put('/api/admin/profile', auth, (req, res) => {
  const db = readDb();
  db.profile = { ...db.profile, ...(req.body.profile || req.body) };
  if (req.body.settings) db.settings = { ...db.settings, ...req.body.settings };
  writeDb(db);
  res.json({ profile: db.profile, settings: db.settings });
});

app.put('/api/admin/password', auth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: 'Palavra-passe nova deve ter pelo menos 6 caracteres' });
  }
  const db = readDb();
  if (!bcrypt.compareSync(currentPassword, db.admin.passwordHash)) {
    return res.status(401).json({ error: 'Palavra-passe actual incorrecta' });
  }
  db.admin.passwordHash = bcrypt.hashSync(newPassword, 10);
  writeDb(db);
  res.json({ success: true });
});

app.post('/api/admin/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Ficheiro em falta' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'admin.html'));
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Portfolio running on http://localhost:${PORT}`);
});
