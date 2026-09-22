/* Jornada do estudante: XP por atividade única e coleção de ícones. */
(function () {
    'use strict';
    function eventos() {
        var dados = ClinifyUI.ler('jornada:estudante', []);
        return Array.isArray(dados) ? dados.filter(function (e) { return e && typeof e.id === 'string' && ['caso', 'modulo'].includes(e.tipo); }) : [];
    }
    function resumo() {
        var lista = eventos();
        var xp = lista.reduce(function (total, e) { return total + (e.tipo === 'caso' ? 100 : 150); }, 0);
        return {xp: xp, nivel: Math.floor(xp / 250) + 1, casos: lista.filter(function (e) { return e.tipo === 'caso'; }).length, modulos: lista.filter(function (e) { return e.tipo === 'modulo'; }).length};
    }
    function registrar(id, tipo) {
        if (!id || !['caso', 'modulo'].includes(tipo)) return 0;
        var lista = eventos();
        if (lista.some(function (e) { return e.id === id; })) return 0;
        lista.push({id: id, tipo: tipo, data: new Date().toISOString()});
        return ClinifyUI.salvar('jornada:estudante', lista) ? (tipo === 'caso' ? 100 : 150) : 0;
    }
    window.ClinifyJornada = {registrar: registrar, resumo: resumo};
    // Reconhecer atividades concluídas antes da criação da jornada.
    if (!ClinifyUI.ler('jornada:migrada', false)) {
        var anterior = ClinifyUI.ler('resultado-simulacao', null);
        if (anterior && anterior.data) registrar('caso:cefaleia', 'caso');
        var modulo = ClinifyUI.ler('modulo:cardiologia', null);
        if (modulo && modulo.concluido) registrar('modulo:cardiologia', 'modulo');
        ClinifyUI.salvar('jornada:migrada', true);
    }

    var caminhos = {
        semente: '<path d="M12 21V11M12 15C4 15 3 10 3 5c6 0 9 3 9 8M12 11c0-5 4-8 9-8 0 6-3 10-9 10"/>',
        pulso: '<path d="M2 12h5l3-7 4 14 3-7h5"/>',
        livro: '<path d="M12 5v16M12 5C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-3-1-6-2-10 1Z"/>',
        bussola: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',
        estrela: '<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
        escudo: '<path d="m12 2 9 4v6c0 5-6 9-9 10-3-1-9-5-9-10V6Z"/><path d="m8 12 3 3 5-6"/>'
    };
    function icone(id) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + caminhos[id] + '</svg>'; }
    var colecao = [
        {id: 'semente', nome: 'Primeiro passo', regra: 'Disponível desde o início', abre: function () { return true; }},
        {id: 'pulso', nome: 'Pulso clínico', regra: 'Conclua 1 caso', abre: function (r) { return r.casos >= 1; }},
        {id: 'livro', nome: 'Conhecimento em ação', regra: 'Conclua 1 módulo de estudo', abre: function (r) { return r.modulos >= 1; }},
        {id: 'bussola', nome: 'Explorador clínico', regra: 'Conclua 3 casos', abre: function (r) { return r.casos >= 3; }},
        {id: 'estrela', nome: 'Dedicação em destaque', regra: 'Alcance o nível 3', abre: function (r) { return r.nivel >= 3; }},
        {id: 'escudo', nome: 'Guardião do cuidado', regra: 'Conclua 5 casos e 1 módulo', abre: function (r) { return r.casos >= 5 && r.modulos >= 1; }}
    ];
    var alvo = document.querySelector('[data-jornada]');
    function renderizar() {
        var r = resumo();
        var escolhido = ClinifyUI.ler('icone:estudante', 'semente');
        var recompensa = colecao.find(function (c) { return c.id === escolhido && c.abre(r); }) || colecao[0];
        var avatar = document.querySelector('.profile-avatar');
        if (avatar) { avatar.innerHTML = icone(recompensa.id); avatar.setAttribute('role', 'img'); avatar.setAttribute('aria-label', recompensa.nome); }
        if (!alvo) return;
        alvo.innerHTML = '<div class="jornada-cabecalho"><div><p class="jornada-selo">Sua jornada Clinify</p><h2>Cada prática conta.</h2><p>Transforme sua dedicação em novas conquistas.</p></div><span class="jornada-nivel">Nível ' + r.nivel + '</span></div>' +
            '<div class="jornada-numeros"><div><strong>' + r.xp + '</strong><span>XP acumulado</span></div><div><strong>' + r.casos + '</strong><span>Casos concluídos</span></div><div><strong>' + r.modulos + '</strong><span>Módulos concluídos</span></div></div>' +
            '<label for="jornada-xp">' + (250 - r.xp % 250) + ' XP para o nível ' + (r.nivel + 1) + '</label><progress id="jornada-xp" max="250" value="' + r.xp % 250 + '">' + r.xp % 250 + ' de 250 XP</progress>' +
            '<p class="jornada-proximo"><strong>Próxima conquista:</strong> ' + (colecao.find(function (c) { return !c.abre(r); }) ? colecao.find(function (c) { return !c.abre(r); }).regra : 'Coleção completa! Continue explorando os casos.') + '</p><details class="jornada-ajuda"><summary>Como ganhar XP?</summary><p class="jornada-regras">+100 XP por caso concluído · +150 XP por módulo. Cada caso ou sala e cada módulo contam uma vez; revisões não repetem XP. As conquistas reconhecem sua prática, sem representar habilitação clínica.</p></details>' +
            '<h3>Sua coleção de ícones</h3><p>' + colecao.filter(function (c) { return c.abre(r); }).length + ' de ' + colecao.length + ' desbloqueados. Selecione um ícone para equipar no perfil.</p><div class="jornada-colecao">' +
            colecao.map(function (c) {
                var aberto = c.abre(r), ativo = c.id === recompensa.id;
                return '<button type="button" class="jornada-conquista' + (aberto ? '' : ' is-locked') + '" data-icone="' + c.id + '" aria-pressed="' + ativo + '"' + (aberto ? '' : ' disabled') + '><span class="jornada-icone">' + icone(c.id) + '</span><strong>' + c.nome + '</strong><span>' + c.regra + '</span><small>' + (ativo ? 'Em uso' : aberto ? 'Usar no perfil' : 'Bloqueado') + '</small></button>';
            }).join('') + '</div><a class="btn btn--primary" href="casos.html">Continuar praticando</a>';
    }
    if (alvo) {
        renderizar();
        alvo.addEventListener('click', function (e) {
            var botao = e.target.closest('[data-icone]');
            if (!botao || botao.disabled) return;
            if (ClinifyUI.salvar('icone:estudante', botao.dataset.icone)) {
                renderizar();
                alvo.querySelector('[data-icone="' + botao.dataset.icone + '"]').focus();
                ClinifyUI.mensagem('Novo ícone equipado. Sua jornada tem a sua marca!');
            }
        });
        window.addEventListener('storage', renderizar);
    }
})();
