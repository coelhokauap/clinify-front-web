(function () {
    'use strict';

    function lerLista(chave) {
        var lista = ClinifyUI.ler(chave, []);
        return Array.isArray(lista) ? lista : [];
    }

    function usuarioAtual() {
        var usuario = ClinifyUI.ler('sessao:usuario', {});
        return {
            id: usuario.id || usuario.email || 'visitante',
            nome: usuario.nome || 'Usuário Clinify',
            email: usuario.email || '',
            perfil: usuario.perfil || document.body.dataset.area || 'visitante'
        };
    }

    function chaveInteracoes() {
        return 'historico-interacoes:' + usuarioAtual().id;
    }

    function chaveAtividades() {
        return 'historico-atividades:' + usuarioAtual().id;
    }

    function registrar(tipo, acao) {
        var chave = chaveInteracoes();
        var interacoes = lerLista(chave);
        interacoes.push({
            id: 'interacao-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
            tipo: tipo,
            acao: acao.slice(0, 100),
            pagina: window.location.pathname,
            data: new Date().toISOString()
        });
        ClinifyUI.salvar(chave, interacoes.slice(-200));
    }

    function criarNomeArquivo(data) {
        var horario = data.toISOString().replace(/[:.]/g, '-');
        return 'clinify_dados_' + horario + '.json';
    }

    function baixarJSON(conteudo, nomeArquivo) {
        var arquivo = new Blob([conteudo], {type: 'application/json'});
        var endereco = URL.createObjectURL(arquivo);
        var link = document.createElement('a');
        link.href = endereco;
        link.download = nomeArquivo;
        link.click();
        window.setTimeout(function () { URL.revokeObjectURL(endereco); }, 1000);
    }

    function abrirBancoPastas() {
        return new Promise(function (resolver, rejeitar) {
            var pedido = indexedDB.open('clinify-arquivos', 1);
            pedido.onupgradeneeded = function () {
                if (!pedido.result.objectStoreNames.contains('configuracoes')) pedido.result.createObjectStore('configuracoes');
            };
            pedido.onsuccess = function () { resolver(pedido.result); };
            pedido.onerror = function () { rejeitar(pedido.error); };
        });
    }

    async function lerPastaSalva() {
        var banco = await abrirBancoPastas();
        return new Promise(function (resolver, rejeitar) {
            var pedido = banco.transaction('configuracoes').objectStore('configuracoes').get('pasta-dados');
            pedido.onsuccess = function () { resolver(pedido.result || null); };
            pedido.onerror = function () { rejeitar(pedido.error); };
        });
    }

    async function guardarPasta(pasta) {
        var banco = await abrirBancoPastas();
        return new Promise(function (resolver, rejeitar) {
            var transacao = banco.transaction('configuracoes', 'readwrite');
            transacao.objectStore('configuracoes').put(pasta, 'pasta-dados');
            transacao.oncomplete = function () { resolver(); };
            transacao.onerror = function () { rejeitar(transacao.error); };
        });
    }

    async function escolherPastaDados() {
        var pasta = null;
        try { pasta = await lerPastaSalva(); } catch (erro) { pasta = null; }
        if (pasta) {
            try {
                var permissao = await pasta.queryPermission({mode: 'readwrite'});
                if (permissao !== 'granted') permissao = await pasta.requestPermission({mode: 'readwrite'});
                if (permissao === 'granted') return pasta;
            } catch (erro) { pasta = null; }
        }
        ClinifyUI.mensagem('Selecione a pasta Computational Thinking With Python/dados.');
        pasta = await window.showDirectoryPicker({id: 'clinify-dados', mode: 'readwrite', startIn: 'documents'});
        if (pasta.name.toLowerCase() !== 'dados') throw new Error('Selecione a pasta Computational Thinking With Python/dados.');
        try { await guardarPasta(pasta); } catch (erro) { /* A gravação atual ainda pode continuar. */ }
        return pasta;
    }

    async function gravarNaPastaDados(conteudo, nomeArquivo) {
        var pasta = await escolherPastaDados();
        var arquivo = await pasta.getFileHandle(nomeArquivo, {create: true});
        var gravacao = await arquivo.createWritable();
        await gravacao.write(conteudo);
        await gravacao.close();
    }

    async function exportarJSON() {
        registrar('clique', 'Salvar dados');
        var dataSalvamento = new Date();
        var nomeArquivo = criarNomeArquivo(dataSalvamento);
        var pacote = {
            versao: 1,
            gerado_em: dataSalvamento.toISOString(),
            usuario: usuarioAtual(),
            interacoes: lerLista(chaveInteracoes()),
            atividades: lerLista(chaveAtividades())
        };
        var jsonGeradoPeloJavaScript = JSON.stringify(pacote, null, 2);
        var botao = document.querySelector('[data-exportar-json]');
        if (botao) botao.disabled = true;
        try {
            if ('showDirectoryPicker' in window && 'indexedDB' in window) {
                await gravarNaPastaDados(jsonGeradoPeloJavaScript, nomeArquivo);
                ClinifyUI.mensagem('Novo arquivo salvo: ' + nomeArquivo);
            } else {
                baixarJSON(jsonGeradoPeloJavaScript, nomeArquivo);
                ClinifyUI.mensagem('Novo arquivo baixado: ' + nomeArquivo);
            }
        } catch (erro) {
            if (erro.name !== 'AbortError') ClinifyUI.mensagem(erro.message || 'Não foi possível salvar os dados.', true);
        } finally {
            if (botao) botao.disabled = false;
        }
    }

    document.addEventListener('click', function (evento) {
        var controle = evento.target.closest('button, a');
        if (!controle || controle.hasAttribute('data-exportar-json')) return;
        var texto = controle.getAttribute('aria-label') || controle.textContent || controle.id || controle.tagName;
        registrar('clique', texto.trim().replace(/\s+/g, ' '));
    });

    document.addEventListener('submit', function (evento) {
        registrar('formulario', evento.target.getAttribute('aria-label') || evento.target.id || 'formulario');
    });

    var voltarLogin = document.querySelector('.sidebar__login');
    if (voltarLogin) {
        var botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'sidebar__link sidebar__export';
        botao.setAttribute('data-exportar-json', '');
        botao.setAttribute('aria-label', 'Salvar dados na pasta do Python');
        botao.dataset.label = 'Salvar dados';
        botao.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/></svg><span class="sidebar__link-text">Salvar dados</span>';
        botao.addEventListener('click', exportarJSON);
        voltarLogin.parentNode.insertBefore(botao, voltarLogin);
    }

    window.ClinifyDados = { exportar: exportarJSON, usuarioAtual: usuarioAtual };

    registrar('navegacao', document.title);
})();
