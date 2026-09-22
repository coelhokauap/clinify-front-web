/* Salas locais compartilhadas entre as telas de professor e estudante. */
(function () {
    'use strict';
    var chave = 'salas';
    function listar() {
        var dados = ClinifyUI.ler(chave, []);
        return Array.isArray(dados) ? dados.filter(function (sala) {
            return sala && typeof sala.codigo === 'string' && typeof sala.nome === 'string' &&
                typeof sala.turma === 'string' && typeof sala.instrucoes === 'string' &&
                ['aberta', 'encerrada'].includes(sala.status) && Array.isArray(sala.tentativas);
        }) : [];
    }
    function salvar(salas) {
        if (!ClinifyUI.salvar(chave, salas)) throw new Error('Não foi possível salvar a sala. Tente novamente.');
    }
    function localizar(codigo) { return listar().find(function (sala) { return sala.codigo === codigo; }); }
    function codigoNovo(salas) {
        var caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        for (var tentativa = 0; tentativa < 100; tentativa += 1) {
            var valores = new Uint32Array(6);
            crypto.getRandomValues(valores);
            var codigo = Array.from(valores, function (valor) { return caracteres[valor % caracteres.length]; }).join('');
            if (!salas.some(function (sala) { return sala.codigo === codigo; })) return codigo;
        }
        throw new Error('Não foi possível gerar um código único. Tente novamente.');
    }
    function atualizar(codigo, acao) {
        var salas = listar();
        var sala = salas.find(function (item) { return item.codigo === codigo; });
        if (!sala) throw new Error('Sala não encontrada.');
        acao(sala); salvar(salas); return sala;
    }
    function validar(dados) {
        if (!dados.nome || !dados.nome.trim() || !dados.turma || !dados.turma.trim()) throw new Error('Preencha o nome da sala e a turma.');
        return {nome: dados.nome.trim().slice(0, 80), turma: dados.turma.trim().slice(0, 60), instrucoes: (dados.instrucoes || '').trim().slice(0, 1000)};
    }
    window.ClinifySalas = {
        listar: listar,
        localizar: localizar,
        criar: function (dados) {
            var salas = listar();
            var sala = Object.assign(validar(dados), {codigo: codigoNovo(salas), status: 'aberta', criado: new Date().toISOString(), tentativas: []});
            salas.unshift(sala); salvar(salas); return sala;
        },
        editar: function (codigo, dados) { return atualizar(codigo, function (sala) { Object.assign(sala, validar(dados)); }); },
        status: function (codigo, status) {
            if (!['aberta', 'encerrada'].includes(status)) throw new Error('Status inválido.');
            return atualizar(codigo, function (sala) { sala.status = status; });
        },
        excluir: function (codigo) { salvar(listar().filter(function (sala) { return sala.codigo !== codigo; })); },
        entrar: function (codigo, aluno) {
            var tentativa;
            atualizar(codigo, function (sala) {
                if (sala.status !== 'aberta') throw new Error('Esta sala está encerrada. Peça ao professor para reabri-la.');
                if (!aluno || !aluno.trim()) throw new Error('Informe seu nome para entrar.');
                tentativa = {id: crypto.randomUUID(), aluno: aluno.trim().slice(0, 60), estado: 'em andamento', inicio: new Date().toISOString(), respostas: [], pontos: null, segundos: null};
                sala.tentativas.push(tentativa);
            });
            return tentativa;
        },
        responder: function (codigo, id, texto) {
            return atualizar(codigo, function (sala) {
                var tentativa = sala.tentativas.find(function (item) { return item.id === id; });
                if (sala.status !== 'aberta') throw new Error('Sala encerrada pelo professor.');
                if (!tentativa || tentativa.estado !== 'em andamento') throw new Error('Tentativa indisponível. Entre novamente pelo código.');
                tentativa.respostas.push({texto: texto.slice(0, 2000), data: new Date().toISOString()});
            });
        },
        finalizar: function (codigo, id, resultado) {
            return atualizar(codigo, function (sala) {
                var tentativa = sala.tentativas.find(function (item) { return item.id === id; });
                if (sala.status !== 'aberta') throw new Error('Sala encerrada pelo professor.');
                if (!tentativa || tentativa.estado !== 'em andamento') throw new Error('Tentativa já finalizada ou não encontrada.');
                Object.assign(tentativa, {estado: 'concluída', pontos: resultado.pontos, segundos: resultado.segundos, fim: new Date().toISOString()});
            });
        }
    };
})();
