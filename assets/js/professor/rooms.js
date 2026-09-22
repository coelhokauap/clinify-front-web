(function () {
    'use strict';
    var grid = document.getElementById('salas-grid');
    var busca = document.getElementById('buscar-sala');
    var filtro = document.getElementById('status-sala');
    var modal = document.getElementById('modal-sala');
    var analise = document.getElementById('modal-analise');
    var modalQr = document.getElementById('modal-qr');
    var qrSala = document.getElementById('qr-sala');
    var codigoQr = '';
    var form = document.getElementById('form-sala');
    var codigoEdicao = document.getElementById('codigo-edicao');
    var salaAnalisada;
    var e = ClinifyUI.escapar;
    function normalizar(texto) { return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    function concluidas(sala) { return sala.tentativas.filter(function (t) { return t.estado === 'concluída'; }); }
    function renderizar() {
        var salas = ClinifySalas.listar();
        var visiveis = salas.filter(function (sala) {
            return (filtro.value === 'todas' || sala.status === filtro.value) && normalizar(sala.nome + ' ' + sala.turma + ' ' + sala.codigo).includes(normalizar(busca.value.trim()));
        });
        document.getElementById('total-abertas').textContent = salas.filter(function (s) { return s.status === 'aberta'; }).length;
        document.getElementById('total-tentativas').textContent = salas.reduce(function (n, s) { return n + s.tentativas.length; }, 0);
        document.getElementById('total-concluidas').textContent = salas.reduce(function (n, s) { return n + concluidas(s).length; }, 0);
        document.getElementById('salas-contagem').textContent = visiveis.length + (visiveis.length === 1 ? ' sala' : ' salas');
        grid.innerHTML = visiveis.map(function (sala) {
            return '<article class="sala-card"><div class="sala-card__topo"><span class="sala-status sala-status--' + sala.status + '">' + (sala.status === 'aberta' ? '● Aberta para alunos' : '○ Encerrada') + '</span><span class="sala-turma">' + e(sala.turma) + '</span></div>' +
                '<h3>' + e(sala.nome) + '</h3><p class="sala-cenario">Cefaleia intensa inédita · Clínica Médica</p>' +
                '<div class="sala-convite"><span>CÓDIGO DA SALA</span><strong>' + e(sala.codigo) + '</strong><div class="sala-convite__acoes"><button type="button" data-acao="copiar" data-codigo="' + e(sala.codigo) + '" aria-label="Copiar código ' + e(sala.codigo) + '">Copiar código</button><button type="button" data-acao="qr" data-codigo="' + e(sala.codigo) + '" aria-label="Gerar QR Code da sala ' + e(sala.codigo) + '">Gerar QR Code</button></div></div>' +
                '<p class="sala-participacao">' + sala.tentativas.length + ' tentativa(s) · ' + concluidas(sala).length + ' concluída(s)</p>' +
                '<div class="sala-acoes"><button class="btn btn--primary" type="button" data-acao="analisar" data-codigo="' + sala.codigo + '">Analisar sala</button><button class="btn btn--ghost" type="button" data-acao="editar" data-codigo="' + sala.codigo + '">Editar</button></div>' +
                '<div class="sala-acoes-secundarias"><button type="button" data-acao="status" data-codigo="' + sala.codigo + '">' + (sala.status === 'aberta' ? 'Encerrar sala' : 'Reabrir sala') + '</button><button type="button" data-acao="excluir" data-codigo="' + sala.codigo + '">Excluir</button></div></article>';
        }).join('');
        var vazio = document.getElementById('salas-vazio');
        vazio.hidden = visiveis.length !== 0;
        vazio.querySelector('h3').textContent = salas.length ? 'Nenhuma sala encontrada' : 'Sua próxima atividade começa aqui';
        vazio.querySelector('p').textContent = salas.length ? 'Experimente outro nome, código ou status.' : 'Crie uma sala para gerar o primeiro código e convidar sua turma.';
        vazio.querySelector('button').hidden = salas.length !== 0;
    }
    function abrirFormulario(sala) {
        form.reset(); codigoEdicao.value = sala ? sala.codigo : '';
        document.getElementById('titulo-sala').textContent = sala ? 'Editar sala · ' + sala.codigo : 'Criar sala';
        document.getElementById('salvar-sala').textContent = sala ? 'Salvar alterações' : 'Criar e gerar código';
        if (sala) {
            document.getElementById('nome-sala').value = sala.nome;
            document.getElementById('turma-sala').value = sala.turma;
            document.getElementById('instrucoes-sala').value = sala.instrucoes;
        }
        modal.hidden = false;
    }
    function analisar(codigo) {
        var sala = ClinifySalas.localizar(codigo);
        if (!sala) { analise.hidden = true; return; }
        salaAnalisada = codigo;
        document.getElementById('titulo-analise').textContent = sala.nome;
        var finalizadas = concluidas(sala);
        var media = finalizadas.length ? Math.round(finalizadas.reduce(function (n, t) { return n + t.pontos; }, 0) / finalizadas.length) + '/100' : '—';
        document.getElementById('conteudo-analise').innerHTML = '<p>' + e(sala.turma) + ' · Código <strong>' + e(sala.codigo) + '</strong> · ' + e(sala.status) + '</p>' +
            '<div class="salas-indicadores"><article><span>Tentativas</span><strong>' + sala.tentativas.length + '</strong></article><article><span>Concluídas</span><strong>' + finalizadas.length + '</strong></article><article><span>Pontuação média</span><strong>' + media + '</strong></article></div>' +
            (sala.instrucoes ? '<div class="sala-orientacoes"><strong>Orientações</strong><p>' + e(sala.instrucoes) + '</p></div>' : '') +
            (sala.tentativas.length ? '<h3>Respostas da turma</h3>' + sala.tentativas.map(function (t) {
                return '<details class="sala-tentativa"><summary><strong>' + e(t.aluno) + '</strong><span>' + e(t.estado) + ' · ' + (t.pontos === null ? 'Sem resultado' : e(t.pontos) + '/100') + '</span></summary><p>' + (t.segundos === null ? 'Atividade em andamento' : 'Duração: ' + Math.floor(t.segundos / 60) + 'min ' + t.segundos % 60 + 's') + '</p>' + (t.respostas.length ? '<ol>' + t.respostas.map(function (r) { return '<li>' + e(r.texto) + '</li>'; }).join('') + '</ol>' : '<p>Nenhuma resposta enviada ainda.</p>') + '</details>';
            }).join('') : '<div class="salas-vazio"><h3>Aguardando sua turma</h3><p>Compartilhe o código. As tentativas aparecem aqui quando os alunos entrarem.</p></div>');
        if (analise.hidden) analise.hidden = false;
    }
    function exibirQr(sala) {
        if (typeof QRCode === 'undefined') throw new Error('Não foi possível carregar o gerador de QR Code.');
        codigoQr = sala.codigo;
        qrSala.innerHTML = '';
        document.getElementById('qr-sala-codigo').textContent = sala.codigo;
        new QRCode(qrSala, {text: 'CLINIFY:SALA:' + sala.codigo, width: 220, height: 220, colorDark: '#12355b', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H});
        modalQr.hidden = false;
    }
    document.getElementById('nova-sala').addEventListener('click', function () { abrirFormulario(); });
    document.querySelector('[data-criar-sala]').addEventListener('click', function () { abrirFormulario(); });
    document.querySelectorAll('[data-fechar-modal]').forEach(function (botao) {
        botao.addEventListener('click', function () { botao.closest('.modal-overlay').hidden = true; });
    });
    [modal, analise, modalQr].forEach(function (alvo) { alvo.addEventListener('click', function (evento) { if (evento.target === alvo) alvo.hidden = true; }); });
    document.getElementById('copiar-qr').addEventListener('click', async function () {
        try { await navigator.clipboard.writeText(codigoQr); ClinifyUI.mensagem('Código ' + codigoQr + ' copiado!'); }
        catch (erro) { ClinifyUI.mensagem('Copie o código exibido: ' + codigoQr); }
    });
    document.getElementById('baixar-qr').addEventListener('click', function () {
        var canvas = qrSala.querySelector('canvas');
        var imagem = qrSala.querySelector('img');
        var endereco = canvas ? canvas.toDataURL('image/png') : imagem && imagem.src;
        if (!endereco) { ClinifyUI.mensagem('Aguarde a geração do QR Code.', true); return; }
        var link = document.createElement('a'); link.href = endereco; link.download = 'clinify-sala-' + codigoQr + '.png'; link.click();
    });
    form.addEventListener('submit', function (evento) {
        evento.preventDefault();
        if (!form.reportValidity()) return;
        try {
            var dados = {nome: document.getElementById('nome-sala').value, turma: document.getElementById('turma-sala').value, instrucoes: document.getElementById('instrucoes-sala').value};
            var sala = codigoEdicao.value ? ClinifySalas.editar(codigoEdicao.value, dados) : ClinifySalas.criar(dados);
            modal.hidden = true; renderizar();
            ClinifyUI.mensagem('Sala salva! Código para os alunos: ' + sala.codigo);
        } catch (erro) { ClinifyUI.mensagem(erro.message, true); }
    });
    grid.addEventListener('click', async function (evento) {
        var botao = evento.target.closest('[data-acao]');
        if (!botao) return;
        var codigo = botao.dataset.codigo;
        var sala = ClinifySalas.localizar(codigo);
        if (!sala) return;
        try {
            if (botao.dataset.acao === 'copiar') {
                try { await navigator.clipboard.writeText(codigo); ClinifyUI.mensagem('Código ' + codigo + ' copiado!'); }
                catch (erro) { ClinifyUI.mensagem('Copie o código exibido na sala: ' + codigo); }
            }
            if (botao.dataset.acao === 'editar') abrirFormulario(sala);
            if (botao.dataset.acao === 'analisar') analisar(codigo);
            if (botao.dataset.acao === 'qr') exibirQr(sala);
            if (botao.dataset.acao === 'status') {
                if (sala.status === 'aberta' && !confirm('Encerrar esta sala? Os alunos não poderão entrar ou enviar novas respostas.')) return;
                ClinifySalas.status(codigo, sala.status === 'aberta' ? 'encerrada' : 'aberta'); renderizar(); ClinifyUI.mensagem('Status da sala atualizado.');
            }
            if (botao.dataset.acao === 'excluir') {
                if (!confirm('Excluir a sala ' + codigo + ' e suas tentativas? Esta ação não pode ser desfeita.')) return;
                ClinifySalas.excluir(codigo); renderizar(); ClinifyUI.mensagem('Sala excluída.');
            }
        } catch (erro) { ClinifyUI.mensagem(erro.message, true); }
    });
    busca.addEventListener('input', renderizar); filtro.addEventListener('change', renderizar);
    window.addEventListener('storage', function (evento) {
        if (evento.key === 'clinify:salas' || evento.key === null) { renderizar(); if (!analise.hidden) analisar(salaAnalisada); }
    });
    renderizar();
})();
