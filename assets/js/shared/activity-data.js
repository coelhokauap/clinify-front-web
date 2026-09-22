(function () {
    'use strict';

    function chaveHistorico() {
        var usuario = ClinifyUI.ler('sessao:usuario', {});
        return 'historico-atividades:' + (usuario.id || usuario.email || 'visitante');
    }

    function listaLocal(chave) {
        var dados = ClinifyUI.ler(chave, []);
        return Array.isArray(dados) ? dados : [];
    }

    function criarId(prefixo) {
        return prefixo + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    }

    function normalizarAtividade(atividade) {
        var data = new Date().toISOString();
        return {
            id: atividade.id || criarId(atividade.tipo || 'atividade'),
            tipo: atividade.tipo,
            recurso: atividade.recurso,
            titulo: atividade.titulo,
            estado: 'concluida',
            concluida_em: atividade.concluida_em || data,
            duracao_segundos: Math.max(0, Number(atividade.duracao_segundos) || 0),
            pontuacao: Math.max(0, Number(atividade.pontuacao) || 0),
            detalhes: atividade.detalhes && typeof atividade.detalhes === 'object' ? atividade.detalhes : {}
        };
    }

    function guardarLocal(atividade) {
        var chave = chaveHistorico();
        var historico = listaLocal(chave);
        var indice = historico.findIndex(function (item) { return item.id === atividade.id; });
        if (indice >= 0) historico[indice] = atividade;
        else historico.push(atividade);
        ClinifyUI.salvar(chave, historico.slice(-100));

    }

    function registrar(atividade) {
        var registro = normalizarAtividade(atividade);
        guardarLocal(registro);
        return registro;
    }

    function registrarEstudo(dados) {
        return registrar({
            id: 'estudo-' + dados.especialidade + '-' + dados.modulo,
            tipo: 'estudo',
            recurso: dados.especialidade,
            titulo: dados.titulo,
            concluida_em: dados.concluida_em,
            pontuacao: dados.pontuacao,
            detalhes: {
                modulo: dados.modulo,
                acertos: dados.acertos,
                total_questoes: dados.total_questoes
            }
        });
    }

    function registrarSimulado(dados) {
        return registrar({
            id: 'simulado-' + dados.tentativa,
            tipo: 'simulado',
            recurso: dados.caso,
            titulo: dados.titulo,
            concluida_em: dados.concluida_em,
            duracao_segundos: dados.duracao_segundos,
            pontuacao: dados.pontuacao,
            detalhes: {
                respostas: dados.respostas,
                criterios: dados.criterios
            }
        });
    }

    window.ClinifyAtividades = {
        registrarEstudo: registrarEstudo,
        registrarSimulado: registrarSimulado,
        listarLocal: function () { return listaLocal(chaveHistorico()); }
    };
})();
