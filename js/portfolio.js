const $ = (id) => document.getElementById(id);
const dbKey = 'dercio_portfolio_db';

async function loadPortfolio() {
  let data = null;
  try {
    const raw = localStorage.getItem(dbKey);
    if (raw) data = JSON.parse(raw);
  } catch (_) {
    data = null;
  }
  if (!data) {
    const fallback = await fetch('data/default.json');
    data = await fallback.json();
  }
  const p = data.profile || {};

  document.title = data.settings?.siteTitle || document.title;
  $('heroName').textContent = p.name || 'Dercio Pedro Luis';
  $('heroTagline').textContent = p.tagline || '';
  $('heroLocation').innerHTML = `<i class="fas fa-location-dot"></i> ${p.location || ''}`;
  $('heroRole').innerHTML = `<i class="fas fa-code"></i> ${p.title || ''}`;
  $('aboutBio').textContent = p.bio || '';
  $('infoEmail').textContent = p.email || '';
  $('infoPhone').textContent = p.phone || '';
  $('infoLocation').textContent = p.location || '';
  if (p.avatar) $('heroAvatar').src = p.avatar;
  if (!p.available) $('availability').innerHTML = '<span class="dot" style="background:#fb7185"></span> Em projecto no momento';

  const chips = ['HTML5', 'CSS3', 'JavaScript', 'React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind'];
  $('techChips').innerHTML = chips.map((c) => `<span class="chip">${c}</span>`).join('');

  $('servicesGrid').innerHTML = (data.services || []).map((s) => `
    <article class="card">
      <i class="fas ${s.icon || 'fa-star'}"></i>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
    </article>
  `).join('');

  $('experienceList').innerHTML = (data.experience || []).map((e) => `
    <article class="card timeline-item">
      <strong>${e.year}</strong>
      <div>
        <h3>${e.title}</h3>
        <p>${e.place}</p>
        <p>${e.description}</p>
      </div>
    </article>
  `).join('');

  const projects = (data.projects || []).filter((proj) => proj.published !== false);
  $('projectsGrid').innerHTML = projects.map((proj) => `
    <article class="card project">
      <div class="project-cover">${proj.image ? `<img src="${proj.image}" alt="${proj.title}">` : '<i class="fas fa-laptop-code"></i>'}</div>
      <div class="project-body">
        <h3>${proj.title}</h3>
        <p>${proj.description}</p>
        <div class="chips">${(proj.tech || []).map((t) => `<span class="chip">${t}</span>`).join('')}</div>
        <div class="project-links">
          ${proj.liveUrl ? `<a href="${proj.liveUrl}" target="_blank" rel="noopener">Ver projecto <i class="fas fa-arrow-right"></i></a>` : ''}
          ${proj.repoUrl ? `<a href="${proj.repoUrl}" target="_blank" rel="noopener">Código</a>` : ''}
        </div>
      </div>
    </article>
  `).join('') || '<p>Novos projectos em breve.</p>';

  const grouped = {};
  (data.skills || []).forEach((s) => {
    grouped[s.category] = grouped[s.category] || [];
    grouped[s.category].push(s);
  });
  $('skillsGrid').innerHTML = Object.entries(grouped).map(([cat, items]) => `
    <article class="card">
      <h3>${cat}</h3>
      <div class="skill-list">
        ${items.map((s) => `
          <div>
            <div class="skill-row"><span>${s.name}</span><span>${s.level}%</span></div>
            <div class="bar"><span data-w="${s.level}"></span></div>
          </div>
        `).join('')}
      </div>
    </article>
  `).join('');

  requestAnimationFrame(() => {
    document.querySelectorAll('.bar > span').forEach((el) => {
      el.style.width = `${el.dataset.w}%`;
    });
  });

  const socials = [
    [p.github, 'fa-github'],
    [p.linkedin, 'fa-linkedin'],
    [p.instagram, 'fa-instagram'],
    [p.twitter, 'fa-x-twitter'],
  ].filter(([url]) => url);
  $('socials').innerHTML = socials.map(([url, icon]) => `<a href="${url}" target="_blank" rel="noopener"><i class="fab ${icon}"></i></a>`).join('');
  const wa = p.whatsapp || (p.phone ? `https://wa.me/${p.phone.replace(/\D/g, '')}` : '#');
  $('whatsappBtn').href = wa;
}

$('year').textContent = new Date().getFullYear();
$('menuBtn').addEventListener('click', () => $('navLinks').classList.toggle('open'));

const toTop = $('toTop');
window.addEventListener('scroll', () => {
  toTop.style.display = window.scrollY > 400 ? 'block' : 'none';
});
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

$('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('submitBtn');
  btn.disabled = true;
  btn.textContent = 'A enviar...';
  const form = new FormData(e.target);
  const payload = {
    id: `msg_${Date.now()}`,
    name: form.get('name'),
    email: form.get('email'),
    message: form.get('message'),
    read: false,
    createdAt: new Date().toISOString(),
  };
  try {
    try {
      const db = JSON.parse(localStorage.getItem(dbKey) || 'null') || {};
      db.messages = db.messages || [];
      db.messages.unshift(payload);
      localStorage.setItem(dbKey, JSON.stringify(db));
    } catch (_) {
      /* ignore */
    }
    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('email', payload.email);
      formData.append('message', payload.message);
      await fetch('https://formsubmit.co/ajax/derciop66@gmail.com', {
        method: 'POST',
        body: formData,
      });
    } catch (_) {
      /* o painel local já guardou a mensagem */
    }
    e.target.reset();
    $('thankModal').classList.add('open');
  } catch {
    alert('Não foi possível enviar. Tenta novamente ou usa o e-mail directo.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar mensagem';
  }
});

$('closeModal').addEventListener('click', () => $('thankModal').classList.remove('open'));
$('thankModal').addEventListener('click', (e) => {
  if (e.target.id === 'thankModal') $('thankModal').classList.remove('open');
});

loadPortfolio().catch(() => {
  $('aboutBio').textContent = 'Portfólio temporariamente offline. Tenta recarregar a página.';
});
