(function () {
    /* Paciente virtual simples usado diretamente pela simulação do site.
       As respostas são locais e baseadas em palavras-chave. */
    var DIALOGOS_POR_CASO = {
        cefaleia: {
            inicio: 'Começou há quatro dias e ficou mais forte aos poucos.',
            associados: 'A luz e o barulho pioram muito. Não percebi fraqueza, desmaio ou alteração da fala.',
            intensidade: 'Eu diria que está em 8 de 10 e a dor pulsa na cabeça toda.',
            medicamentos: 'Tomei paracetamol. Melhorou um pouco, mas a dor voltou.',
            contexto: 'Nunca senti uma dor assim antes e isso está me preocupando.',
            contextos: [
                'Nunca senti uma dor assim antes e isso está me preocupando.',
                'A dor está atrapalhando meu sono e precisei ficar em um quarto escuro para tentar melhorar.',
                'O que mais me assusta é ser uma dor nova e continuar piorando mesmo depois do remédio.'
            ]
        },
        'cardio-dor': {
            inicio: 'Começou hoje, enquanto eu subia uma escada, e melhorou quando parei.',
            associados: 'Senti um pouco de falta de ar e suor frio, mas não desmaiei.',
            intensidade: 'A dor chegou a 7 de 10, como um aperto no centro do peito.',
            medicamentos: 'Não tomei remédio para essa dor.',
            contexto: 'Tenho pressão alta e meu pai teve problema no coração.'
        },
        'anatomia-ombro': {
            inicio: 'A dor começou ontem, depois que carreguei caixas pesadas.',
            associados: 'Não tive febre nem formigamento, mas sinto fraqueza para levantar o braço.',
            intensidade: 'A dor chega a 6 de 10 quando elevo o braço acima do ombro.',
            medicamentos: 'Usei uma compressa fria, mas ainda não tomei remédio.',
            contexto: 'A dor fica mais na parte lateral do ombro e melhora quando deixo o braço parado.'
        },
        'anatomia-coluna': {
            inicio: 'Começou há três dias, depois de passar muito tempo sentada.',
            associados: 'Sinto formigamento na perna direita, mas não perdi o controle da urina nem das fezes.',
            intensidade: 'A dor está em 8 de 10 e piora quando me abaixo.',
            medicamentos: 'Tomei um analgésico comum, com pouca melhora.',
            contexto: 'A dor sai da lombar, passa pelo glúteo e desce pela parte de trás da perna.'
        },
        'pneumo-fadiga': {
            inicio: 'A falta de ar começou há cerca de duas semanas e está piorando.',
            associados: 'Tenho tosse seca e cansaço ao subir escadas. Não tive desmaio.',
            intensidade: 'Em repouso é leve, mas no esforço chega a 6 de 10.',
            medicamentos: 'Ainda não usei nenhum remédio para isso.',
            contexto: 'Não fumo e não tive uma infecção recente.'
        },
        'pediatria-febre': {
            inicio: 'A febre começou ontem e as manchas apareceram hoje pela manhã.',
            associados: 'A garganta dói e está difícil engolir, mas a criança está respirando bem.',
            intensidade: 'A dor de garganta está em 5 de 10.',
            medicamentos: 'Foi dado antitérmico, com melhora temporária da febre.',
            contexto: 'A vacinação está em dia e não conhecemos alergias.'
        },
        'endo-sede': {
            inicio: 'A sede e a vontade de urinar aumentaram no último mês.',
            associados: 'Perdi peso sem tentar e a ferida no pé demora para cicatrizar.',
            intensidade: 'A dor no pé é leve, em torno de 3 de 10.',
            medicamentos: 'Uso remédio para pressão, mas nenhum para glicose.',
            contexto: 'Minha mãe tinha diabetes.'
        },
        'gastro-dor': {
            inicio: 'Começou há uma semana e aparece principalmente depois das refeições.',
            associados: 'Tenho náusea e sensação de estômago cheio, mas não vomitei sangue.',
            intensidade: 'A queimação fica em torno de 5 de 10.',
            medicamentos: 'Usei um antiácido e melhorei por algumas horas.',
            contexto: 'Tenho comido fora com frequência e tomo bastante café.'
        },
        'histo-biopsia': {
            inicio: 'Recebi o laudo da biópsia hoje e fiquei com dúvidas sobre os termos.',
            associados: 'Não tenho sintomas novos desde a coleta do material.',
            intensidade: 'Sinto apenas um desconforto leve no local, em torno de 1 de 10.',
            medicamentos: 'Não estou usando medicamentos por causa da biópsia.',
            contexto: 'Quero entender como a análise das células e dos tecidos ajuda no diagnóstico.'
        },
        'gineco-dor': {
            inicio: 'A dor começou há dois dias e o sangramento está irregular neste mês.',
            associados: 'Tenho náusea, mas não tive desmaio nem febre alta.',
            intensidade: 'A dor está em 8 de 10 e é mais forte no baixo ventre.',
            medicamentos: 'Tomei um analgésico comum, sem muita melhora.',
            contexto: 'Meu ciclo costuma ser regular.'
        },
        'mental-palpitacoes': {
            inicio: 'Começou de repente, há cerca de vinte minutos.',
            associados: 'Senti falta de ar, tremor e muito medo, mas não desmaiei.',
            intensidade: 'O medo chegou a 9 de 10 e agora está diminuindo.',
            medicamentos: 'Não tomei nenhum medicamento hoje.',
            contexto: 'Já tive uma sensação parecida em uma semana de muitas provas.'
        },
        'emergencia-queda': {
            inicio: 'Caí da bicicleta há aproximadamente uma hora.',
            associados: 'Bati a cabeça, fiquei confuso e agora sinto dor na barriga.',
            intensidade: 'A dor abdominal está em 8 de 10 e piora quando me mexo.',
            medicamentos: 'Não tomei nenhum remédio depois da queda.',
            contexto: 'Eu estava de capacete, mas não lembro de todos os detalhes da queda.'
        },
        'neuro-confusao': {
            inicio: 'Minha família notou a confusão hoje, depois de uma queda em casa.',
            associados: 'Tive febre baixa. Não percebi fraqueza em um lado, mas estou mais sonolenta.',
            intensidade: 'A dor da queda está em 4 de 10.',
            medicamentos: 'Uso remédios de rotina, mas não comecei nenhum novo.',
            contexto: 'Antes de hoje eu estava orientada e fazia minhas atividades normalmente.'
        }
    };

    var ASSUNTOS = [
        ['inicio', ['quando', 'comecou', 'inicio', 'ha quanto', 'tempo']],
        ['associados', ['febre', 'fraqueza', 'visao', 'falta de ar', 'nausea', 'desmaio', 'sintoma']],
        ['intensidade', ['intensidade', 'quanto doi', 'zero a dez', '0 a 10', 'piora']],
        ['medicamentos', ['remedio', 'medicamento', 'tomou', 'tratamento']]
    ];

    var REGRAS = [
        ['acolhimento', ['ola', 'bom dia', 'como posso ajudar', 'entendo', 'compreendo'], 'Boa abertura: acolhimento e linguagem clara ajudam a conduzir a conversa.'],
        ['anamnese', ['quando comecou', 'inicio', 'duracao', 'intensidade', 'localizacao', 'historia', 'sintomas'], 'Você investigou a história da queixa. Continue organizando as perguntas.'],
        ['sinais de alerta', ['febre', 'rigidez', 'fraqueza', 'visao', 'confusao', 'neurolog', 'subita', 'pior dor'], 'Você procurou sinais de alerta. Em uma situação real, isso exigiria avaliação profissional.'],
        ['segurança', ['avaliacao', 'encaminhar', 'urgencia', 'emergencia', 'supervisao', 'exame', 'retorno'], 'Você considerou um encaminhamento ou avaliação supervisionada.']
    ];

    function normalizar(texto) {
        return (texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function contemAlguma(frase, palavras) {
        return palavras.some(function (palavra) { return frase.includes(palavra); });
    }

    function responderPaciente(casoId, fala, numeroResposta) {
        var frase = normalizar(fala);
        var dialogo = DIALOGOS_POR_CASO[casoId] || {
            inicio: 'Percebi os sintomas recentemente e eles ainda estão presentes.',
            associados: 'Não notei outros sintomas além dos descritos no caso.',
            intensidade: 'O desconforto está moderado neste momento.',
            medicamentos: 'Ainda não usei um medicamento específico para essa queixa.',
            contexto: 'Posso contar mais detalhes se você fizer uma pergunta específica.'
        };
        var respostas = [];

        ASSUNTOS.forEach(function (assunto) {
            if (contemAlguma(frase, assunto[1])) respostas.push(dialogo[assunto[0]]);
        });

        if (respostas.length) return respostas.join(' ');
        if (dialogo.contextos && dialogo.contextos.length) {
            return dialogo.contextos[(numeroResposta - 1) % dialogo.contextos.length];
        }
        return dialogo.contexto;
    }

    function responder(casoId, fala, tentativa) {
        if (tentativa.estado !== 'em andamento') {
            throw new Error('A tentativa já foi concluída.');
        }

        var frase = normalizar(fala);
        var novos = [];
        var mensagens = [];

        REGRAS.forEach(function (regra) {
            if (!tentativa.criterios.includes(regra[0]) && contemAlguma(frase, regra[1])) {
                novos.push(regra[0]);
                mensagens.push(regra[2]);
            }
        });

        tentativa.criterios = tentativa.criterios.concat(novos);
        tentativa.pontos = Math.min(100, tentativa.pontos + Math.min(18, novos.length * 9));
        tentativa.respostas += 1;

        return {
            tentativa: tentativa,
            resultado: {
                feedback: mensagens.join(' '),
                resposta_paciente: responderPaciente(casoId, fala, tentativa.respostas),
                criterios: novos,
                criterios_total: tentativa.criterios,
                pontos: tentativa.pontos,
                respostas: tentativa.respostas
            }
        };
    }

    function concluir(tentativa) {
        if (!tentativa.respostas) {
            throw new Error('Responda ao caso antes de concluí-lo.');
        }
        if (tentativa.estado !== 'em andamento') {
            throw new Error('A tentativa já foi concluída.');
        }

        tentativa.estado = 'concluída';
        return {
            tentativa: tentativa,
            resultado: {
                pontos: tentativa.pontos,
                criterios: tentativa.criterios,
                respostas: tentativa.respostas,
                estado: tentativa.estado
            }
        };
    }

    window.ClinifyAgente = {
        responder: responder,
        concluir: concluir
    };
})();
