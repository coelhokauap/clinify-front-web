(function () {
    var shell = document.querySelector('.app-shell');
    if (!shell) return;

    var collapseToggle = document.querySelector('[data-sidebar-collapse]');
    var mobileToggle = document.querySelector('[data-sidebar-mobile-toggle]');
    var backdrop = document.querySelector('[data-sidebar-backdrop]');
    var ultimoFoco;
    var sidebar = document.querySelector('.sidebar');
    var tooltip = document.createElement('span');
    tooltip.className = 'sidebar__tooltip';
    tooltip.hidden = true;
    tooltip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tooltip);
    sidebar.id = 'menu-principal';
    if (mobileToggle) { mobileToggle.setAttribute('aria-controls', sidebar.id); mobileToggle.setAttribute('aria-expanded', 'false'); }

    function isMobile() {
        return window.matchMedia('(max-width: 880px)').matches;
    }

    function hideTooltip() { tooltip.hidden = true; }

    function showTooltip(link) {
        if (isMobile() || !shell.classList.contains('is-collapsed') || !link) return;
        var rect = link.getBoundingClientRect();
        tooltip.textContent = link.dataset.label || link.getAttribute('aria-label') || '';
        tooltip.style.left = rect.right + 14 + 'px';
        tooltip.style.top = Math.max(26, Math.min(window.innerHeight - 26, rect.top + rect.height / 2)) + 'px';
        tooltip.hidden = false;
    }

    function syncCollapseButton() {
        if (!collapseToggle) return;
        var collapsed = shell.classList.contains('is-collapsed');
        collapseToggle.setAttribute('aria-expanded', String(!collapsed));
        collapseToggle.setAttribute('aria-label', collapsed ? 'Expandir menu' : 'Recolher menu');
        collapseToggle.title = collapsed ? 'Expandir menu' : 'Recolher menu';
    }

    function closeMobile() {
        hideTooltip();
        shell.classList.remove('is-mobile-open');
        document.body.style.overflow = '';
        sidebar.inert = isMobile();
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        if (ultimoFoco) { ultimoFoco.focus(); ultimoFoco = null; }
    }

    function openMobile() {
        shell.classList.add('is-mobile-open');
        document.body.style.overflow = 'hidden';
        ultimoFoco = document.activeElement;
        sidebar.inert = false;
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
        var primeiroLink = sidebar.querySelector('a');
        if (primeiroLink) primeiroLink.focus();
    }

    function toggleCollapse() {
        hideTooltip();
        shell.classList.toggle('is-collapsed');
        ClinifyUI.salvar('sidebar-collapsed', shell.classList.contains('is-collapsed'));
        syncCollapseButton();
    }

    sidebar.inert = isMobile();
    if (!isMobile() && ClinifyUI.ler('sidebar-collapsed', false)) {
        shell.classList.add('is-collapsed');
    }
    syncCollapseButton();

    sidebar.addEventListener('mouseover', function (event) {
        var link = event.target.closest && event.target.closest('.sidebar__link');
        if (link) showTooltip(link);
    });
    sidebar.addEventListener('mouseout', function (event) {
        var link = event.target.closest && event.target.closest('.sidebar__link');
        if (link && (!event.relatedTarget || !link.contains(event.relatedTarget))) hideTooltip();
    });
    sidebar.addEventListener('focusin', function (event) {
        var link = event.target.closest && event.target.closest('.sidebar__link');
        if (link) showTooltip(link);
    });
    sidebar.addEventListener('focusout', hideTooltip);
    sidebar.addEventListener('click', hideTooltip);
    sidebar.addEventListener('scroll', hideTooltip, true);

    if (collapseToggle) {
        collapseToggle.addEventListener('click', function () {
            if (isMobile()) {
                closeMobile();
                return;
            }
            toggleCollapse();
        });
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function () {
            if (shell.classList.contains('is-mobile-open')) {
                closeMobile();
                return;
            }
            openMobile();
        });
    }

    var fecharMenu = document.querySelector('[data-sidebar-mobile-close]');
    if (fecharMenu) fecharMenu.addEventListener('click', closeMobile);
    if (backdrop) {
        backdrop.addEventListener('click', closeMobile);
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && shell.classList.contains('is-mobile-open')) closeMobile();
        if (event.key === 'Tab' && shell.classList.contains('is-mobile-open')) {
            var links = Array.from(sidebar.querySelectorAll('a, button')).filter(function (el) { return el.offsetParent !== null; });
            var primeiro = links[0], ultimo = links[links.length - 1];
            if (event.shiftKey && document.activeElement === primeiro) { event.preventDefault(); ultimo.focus(); }
            else if (!event.shiftKey && document.activeElement === ultimo) { event.preventDefault(); primeiro.focus(); }
        }
    });

    window.addEventListener('resize', function () {
        closeMobile();
    });
})();

(function () {
    var bellBtn = document.getElementById('bell-btn');
    var notifications = document.getElementById('notifications');
    if (!bellBtn || !notifications) return;

    var dot = bellBtn.querySelector('.dot');
    notifications.hidden = true;
    notifications.setAttribute('role', 'region');
    notifications.setAttribute('aria-label', 'Notificações recentes');
    bellBtn.setAttribute('aria-controls', notifications.id);
    bellBtn.setAttribute('aria-expanded', 'false');

    function fecharNotificacoes() {
        notifications.hidden = true;
        bellBtn.setAttribute('aria-expanded', 'false');
    }

    bellBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        var abrir = notifications.hidden;
        notifications.hidden = !abrir;
        bellBtn.setAttribute('aria-expanded', String(abrir));
        if (dot) dot.hidden = true;
    });

    document.addEventListener('click', function (event) {
        if (!bellBtn.contains(event.target) && !notifications.contains(event.target)) fecharNotificacoes();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !notifications.hidden) {
            fecharNotificacoes();
            bellBtn.focus();
        }
    });
})();
