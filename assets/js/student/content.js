const conteudos = {

    cardiologia: {

        modulo: "Módulo 01",

        titulo: "Introdução à",
        tituloDestaque: "Cardiologia",

        descricao:
            "Aprenda os principais conceitos relacionados ao funcionamento do coração e do sistema cardiovascular.",

        duracao: "45 min",
        nivel: "Nível básico",

        professor: {
            iniciais: "DR",
            nome: "Prof. Daniel Ribeiro",
            especialidade: "Professor de Cardiologia · Faculdade de Medicina"
        },

        video: {
            titulo: "Fundamentos do sistema cardiovascular",

            src: "",

            thumbnail: ""
        },

        introducao: {
            titulo: "Entendendo o sistema cardiovascular",

            paragrafos: [
                "O sistema cardiovascular é responsável por transportar sangue, oxigênio e nutrientes para os tecidos do organismo. Ele é formado principalmente pelo coração e pelos vasos sanguíneos.",

                "O coração funciona como uma bomba que mantém o sangue circulando pelo corpo. Compreender sua estrutura e seu funcionamento é fundamental para o estudo das doenças cardiovasculares."
            ],

            conceitoChave:
                "O coração possui quatro câmaras: dois átrios e dois ventrículos, responsáveis pela circulação pulmonar e sistêmica."
        },

        questoes: [

            {
                pergunta:
                    "Qual é a principal função do coração no sistema cardiovascular?",

                alternativas: [
                    "Produzir células sanguíneas.",
                    "Bombear o sangue pelo organismo.",
                    "Filtrar substâncias tóxicas do sangue.",
                    "Produzir oxigênio para os tecidos."
                ],

                correta: 1
            },

            {
                pergunta:
                    "Quantas câmaras principais existem no coração humano?",

                alternativas: [
                    "Duas.",
                    "Três.",
                    "Quatro.",
                    "Cinco."
                ],

                correta: 2
            },

            {
                pergunta:
                    "Qual das estruturas abaixo faz parte do coração?",

                alternativas: [
                    "Átrio direito.",
                    "Alvéolo.",
                    "Traqueia.",
                    "Esôfago."
                ],

                correta: 0
            }

        ]

    },

    anatomia: {

        modulo: "Módulo 01",

        titulo: "Introdução à",
        tituloDestaque: "Anatomia",

        descricao:
            "Conheça a organização geral do corpo humano e os principais sistemas e estruturas estudados na anatomia.",

        duracao: "40 min",
        nivel: "Nível básico",

        professor: {
            iniciais: "MA",
            nome: "Profa. Mariana Alves",
            especialidade: "Professora de Anatomia · Faculdade de Medicina"
        },

        video: {
            titulo: "Introdução à anatomia humana",
            src: "",
            thumbnail: ""
        },

        introducao: {
            titulo: "Organização do corpo humano",

            paragrafos: [
                "A anatomia é a área da medicina que estuda a estrutura e a organização do corpo humano, desde o nível celular até os órgãos e sistemas.",
                "O corpo é organizado em níveis: células, tecidos, órgãos e sistemas, que trabalham juntos para manter o funcionamento do organismo."
            ],

            conceitoChave:
                "O corpo humano é dividido em sistemas — como o cardiovascular, o respiratório e o muscular — que atuam de forma integrada."
        },

        questoes: [
            {
                pergunta:
                    "Qual é o principal objeto de estudo da anatomia?",
                alternativas: [
                    "As doenças infecciosas.",
                    "A estrutura e organização do corpo humano.",
                    "O funcionamento psicológico do indivíduo.",
                    "A composição química dos medicamentos."
                ],
                correta: 1
            },
            {
                pergunta:
                    "Qual é a ordem correta de organização do corpo, do nível mais simples ao mais complexo?",
                alternativas: [
                    "Órgão → Tecido → Célula → Sistema.",
                    "Célula → Tecido → Órgão → Sistema.",
                    "Sistema → Órgão → Célula → Tecido.",
                    "Tecido → Célula → Sistema → Órgão."
                ],
                correta: 1
            },
            {
                pergunta:
                    "Qual das opções abaixo é um exemplo de sistema do corpo humano?",
                alternativas: [
                    "Sistema muscular.",
                    "Sistema binário.",
                    "Sistema operacional.",
                    "Sistema solar."
                ],
                correta: 0
            }
        ]

    }

};

const parametros = new URLSearchParams(window.location.search);
const especialidade = parametros.get('especialidade') || 'cardiologia';
const chaveProgresso = 'modulo:' + especialidade;
const conteudoAtual = conteudos[especialidade];
let resultadoQuestoes = null;

const studyPage = document.getElementById("studyPage");

function renderizarConteudo(conteudo) {

    studyPage.innerHTML = `

        <header class="study-header">

            <div class="breadcrumb">

                <span>Estudos</span>
                <span>/</span>
                <span>${conteudo.tituloDestaque}</span>

            </div>

            <div class="header-content">

                <div>

                    <p class="eyebrow">
                        ${conteudo.modulo}
                    </p>

                    <h1>
                        ${conteudo.titulo}<br>
                        <em>${conteudo.tituloDestaque}</em>
                    </h1>

                    <p class="description">
                        ${conteudo.descricao}
                    </p>

                </div>

                <div class="module-info">

                    <span>${conteudo.duracao}</span>

                    <span>•</span>

                    <span>${conteudo.nivel}</span>

                </div>

            </div>

        </header>

        ${renderizarVideo(conteudo.video)}

        ${renderizarProfessor(conteudo.professor)}

        ${renderizarIntroducao(conteudo.introducao)}

        ${renderizarQuestoes(conteudo.questoes)}

        <section class="finish-module">

            <div>

                <p class="eyebrow">
                    ${conteudo.modulo}
                </p>

                <h2>
                    Você chegou ao final deste conteúdo.
                </h2>

                <p>
                    Revise suas respostas antes de finalizar o módulo.
                </p>

            </div>

            <button id="finishModule">

                Finalizar módulo

                <span>→</span>

            </button>

        </section>

    `;

    configurarEventos();

}

function renderizarVideo(video) {

    if (video.src) {

        return `

            <section class="lesson-video">

                <video
                    class="real-video"
                    controls
                    poster="${video.thumbnail}"
                >

                    <source
                        src="${video.src}"
                        type="video/mp4"
                    >

                    Seu navegador não suporta vídeos.

                </video>

            </section>

        `;

    }

    return `

        <section class="lesson-video">

            <div class="video-placeholder">

                <div class="video-decoration">

                    <span></span>
                    <span></span>
                    <span></span>

                </div>

                <button
                    class="play-button"
                    disabled aria-label="Vídeo ainda não disponível"
                >
                    ▶
                </button>

                <div class="video-info">

                    <span>AULA 01 · VÍDEO EM PREPARAÇÃO</span>

                    <strong>
                        ${video.titulo}
                    </strong>

                </div>

            </div>

        </section>

    `;
}

function renderizarProfessor(professor) {

    return `

        <section class="teacher">

            <div class="teacher-avatar">

                ${professor.iniciais}

            </div>

            <div>

                <p class="teacher-label">
                    Conteúdo disponibilizado por
                </p>

                <h2>
                    ${professor.nome}
                </h2>

                <p>
                    ${professor.especialidade}
                </p>

            </div>

        </section>

    `;

}

function renderizarIntroducao(introducao) {

    const paragrafos = introducao.paragrafos
        .map(paragrafo => `<p>${paragrafo}</p>`)
        .join("");

    return `

        <section class="lesson-content">

            <p class="eyebrow">
                Sobre a aula
            </p>

            <h2>
                ${introducao.titulo}
            </h2>

            ${paragrafos}

            <div class="highlight">

                <span>
                    CONCEITO-CHAVE
                </span>

                <p>
                    ${introducao.conceitoChave}
                </p>

            </div>

        </section>

    `;

}

function renderizarQuestoes(questoes) {

    const perguntasHTML = questoes
        .map((questao, index) => {

            const alternativasHTML =
                questao.alternativas
                    .map((alternativa, alternativaIndex) => {

                        const letra =
                            String.fromCharCode(65 + alternativaIndex);

                        return `

                            <label>

                                <input
                                    type="radio"
                                    name="question-${index}"
                                    value="${alternativaIndex}"
                                >

                                <span class="alternative-letter">
                                    ${letra}
                                </span>

                                <span class="alternative-text">
                                    ${alternativa}
                                </span>

                            </label>

                        `;

                    })
                    .join("");

            return `

                <article class="question">

                    <span class="question-label">
                        QUESTÃO ${String(index + 1).padStart(2, "0")}
                    </span>

                    <h3>
                        ${questao.pergunta}
                    </h3>

                    <div class="alternatives">

                        ${alternativasHTML}

                    </div>

                </article>

            `;

        })
        .join("");

    return `

        <section class="questions-section">

            <details class="questions">

                <summary>

                    <div class="summary-left">

                        <span class="question-number">
                            ${questoes.length}
                        </span>

                        <div>

                            <p class="eyebrow">
                                Avaliação
                            </p>

                            <h2>
                                Questões
                            </h2>

                        </div>

                    </div>

                    <span class="arrow">
                        ↓
                    </span>

                </summary>

                <div class="questions-content">

                    ${perguntasHTML}

                    <button
                        class="finish-questions"
                        id="finishQuestions"
                    >
                        Finalizar questões
                    </button>

                    <div
                        class="feedback"
                        id="feedback" role="status" aria-live="polite"
                    ></div>

                </div>

            </details>

        </section>

    `;

}

function configurarEventos() {

    const finishQuestions =
        document.getElementById("finishQuestions");

    const finishModule =
        document.getElementById("finishModule");

    finishQuestions.addEventListener("click", () => {

        let acertos = 0;
        let respondidas = 0;

        conteudoAtual.questoes.forEach((questao, index) => {

            const resposta =
                document.querySelector(
                    `input[name="question-${index}"]:checked`
                );

            if (resposta) {

                respondidas++;

                if (
                    Number(resposta.value) ===
                    questao.correta
                ) {

                    acertos++;

                }

            }

        });

        const feedback =
            document.getElementById("feedback");

        if (
            respondidas <
            conteudoAtual.questoes.length
        ) {

            feedback.innerHTML = `
                <strong>Quase lá!</strong>
                Responda todas as questões antes de finalizar.
            `;

            feedback.className =
                "feedback warning";

            return;
        }

        feedback.innerHTML = `
            <strong>${acertos}/${conteudoAtual.questoes.length}</strong>
            questões respondidas corretamente.
        `;

        feedback.className =
            "feedback success";

        resultadoQuestoes = {
            acertos: acertos,
            total: conteudoAtual.questoes.length
        };

    });

    finishModule.addEventListener("click", () => {

        const confirmar = confirm(
            "Deseja finalizar este módulo?"
        );

        if (confirmar) {

            if (ClinifyUI.salvar(chaveProgresso, {concluido: true, data: new Date().toISOString()})) {
                finishModule.textContent = 'Módulo concluído · Revisar';
                var xpGanho = ClinifyJornada.registrar(chaveProgresso, 'modulo');
                if (window.ClinifyAtividades) {
                    ClinifyAtividades.registrarEstudo({
                        especialidade: especialidade,
                        titulo: conteudoAtual.titulo + ' ' + conteudoAtual.tituloDestaque,
                        modulo: conteudoAtual.modulo,
                        concluida_em: new Date().toISOString(),
                        pontuacao: resultadoQuestoes ? Math.round((resultadoQuestoes.acertos / resultadoQuestoes.total) * 100) : 0,
                        acertos: resultadoQuestoes ? resultadoQuestoes.acertos : 0,
                        total_questoes: conteudoAtual.questoes.length
                    });
                }
                ClinifyUI.mensagem('Módulo concluído. Seu progresso foi atualizado.' + (xpGanho ? ' +' + xpGanho + ' XP! Confira suas conquistas no perfil.' : ''));
            }

        }

    });

}

if (conteudoAtual) {
    renderizarConteudo(conteudoAtual);
    if (parametros.get('tipo') === 'questoes') document.querySelector('.questions').open = true;
    if (ClinifyUI.ler(chaveProgresso, null)) document.getElementById('finishModule').textContent = 'Módulo concluído · Revisar';
} else {
    studyPage.innerHTML = '<header class="study-header"><h1>Conteúdo em preparação</h1><p>As aulas desta especialidade estarão disponíveis em breve.</p><a href="estudos.html">Voltar aos estudos</a></header>';
}
