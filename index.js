(function () {
    // ---------- MODO ESCURO ----------
    const toggleBtn = document.getElementById('themeToggle');
    const body = document.body;
    const iconTheme = toggleBtn.querySelector('i');
    const spanTheme = toggleBtn.querySelector('span');

    // verifica preferência salva
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        iconTheme.className = 'fas fa-sun';
        spanTheme.innerText = 'Claro';
    }

    toggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            iconTheme.className = 'fas fa-sun';
            spanTheme.innerText = 'Claro';
            localStorage.setItem('theme', 'dark');
        } else {
            iconTheme.className = 'fas fa-moon';
            spanTheme.innerText = 'Escuro';
            localStorage.setItem('theme', 'light');
        }
    });

    // ---------- SCROLL ANIMATION (fade) ----------
    const fadeElements = document.querySelectorAll('.fade-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -20px 0px' });
    fadeElements.forEach(el => observer.observe(el));

    // ---------- BOTÃO VOLTAR AO TOPO ----------
    const backBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backBtn.classList.add('show');
        } else {
            backBtn.classList.remove('show');
        }
    });
    backBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---------- FORM SUBMIT com feedback ----------
    const form = document.getElementById('contactForm');
    const successMsg = document.getElementById('formSuccess');

    // Se houver parâmetro na URL indicando sucesso (após redirecionamento)
    if (window.location.search.includes('send=true') || window.location.hash === '#sucesso') {
        successMsg.classList.add('show');
        // Remove o parâmetro da URL sem recarregar
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Intercepta o envio para mostrar feedback (opcional, pois o formsubmit redireciona)
    form.addEventListener('submit', function (e) {
        // Não prevenimos o submit - queremos que envie mesmo
        // Mas podemos mostrar uma mensagem rápida (opcional)
        // Como o formsubmit redireciona, essa mensagem não será vista
        // Vamos deixar o redirecionamento cuidar disso

        // Se quiser evitar redirecionamento e usar fetch (mais sofisticado), 
        // precisaríamos de um backend. Por simplicidade, mantemos o redirecionamento.

        // Para teste local, podemos mostrar mensagem e depois enviar
        // Mas como é um formulário real, vamos apenas enviar.
        console.log('Enviando mensagem...');
    });

    // Caso queira testar sem backend, descomente abaixo:
    /*
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        successMsg.classList.add('show');
        form.reset();
        setTimeout(() => successMsg.classList.remove('show'), 5000);
    });
    */
})();