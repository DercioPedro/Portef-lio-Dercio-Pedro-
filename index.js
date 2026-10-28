(function () {
    // ---------- MODO ESCURO ----------
    const toggleBtn = document.getElementById('themeToggle');
    const body = document.body;
    const iconTheme = toggleBtn.querySelector('i');
    const spanTheme = toggleBtn.querySelector('span');

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

    // ---------- SCROLL ANIMATION ----------
    const fadeElements = document.querySelectorAll('.fade-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });
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

    // ---------- FORMULÁRIO COM MODAL ----------
    const contactForm = document.getElementById('contactForm');
    const modal = document.getElementById('thankYouModal');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            const formData = new FormData(this);

            try {
                const response = await fetch('https://formsubmit.co/ajax/derciop66@gmail.com', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    contactForm.reset();
                    modal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                } else {
                    throw new Error('Falha no envio');
                }
            } catch (error) {
                alert('Erro ao enviar. Tente novamente ou envie um email direto para derciop66@gmail.com');
                console.error(error);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Função global para fechar modal
    window.fecharModal = function () {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fechar modal clicando fora
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            fecharModal();
        }
    });
})();
