(function () {
    var VITAIS_POR_MATERIA = {
        cardiologia: {pa: '148/92', fc: '104', temperatura: '36,7', dor: '7/10', dorDescricao: 'forte'},
        pneumologia: {pa: '126/78', fc: '98', temperatura: '37,2', dor: '2/10', dorDescricao: 'leve'},
        neurologia: {pa: '120/80', fc: '72', temperatura: '36,5', dor: '8/10', dorDescricao: 'intensa'},
        gastroenterologia: {pa: '112/72', fc: '88', temperatura: '37,1', dor: '6/10', dorDescricao: 'moderada'},
        endocrinologia: {pa: '138/86', fc: '92', temperatura: '36,4', dor: '3/10', dorDescricao: 'leve'},
        histologia: {pa: '118/76', fc: '74', temperatura: '36,6', dor: '0/10', dorDescricao: 'ausente'},
        pediatria: {pa: '100/65', fc: '112', temperatura: '39,1', dor: '5/10', dorDescricao: 'moderada'},
        ginecologia: {pa: '108/68', fc: '96', temperatura: '37,4', dor: '8/10', dorDescricao: 'intensa'},
        mental: {pa: '132/84', fc: '118', temperatura: '36,6', dor: '1/10', dorDescricao: 'mínima'},
        emergencia: {pa: '96/62', fc: '110', temperatura: '36,2', dor: '8/10', dorDescricao: 'intensa'}
    };

    function vitaisPadrao(materia) {
        var sinais = VITAIS_POR_MATERIA[materia] || VITAIS_POR_MATERIA.neurologia;
        return Object.assign({}, sinais);
    }

    var consultation = document.querySelector('[data-simulation-consultation]');
    if (consultation) {
        initConsultation();
        return;
    }
    initLobby();

    function initLobby() {
        var cases = Array.from(document.querySelectorAll('[data-case]'));
        var search = document.querySelector('[data-filter-search]');
        var difficulty = document.querySelector('[data-filter-difficulty]');
        var clear = document.querySelector('[data-clear-filters]');
        var counter = document.querySelector('[data-case-counter]');
        var empty = document.querySelector('[data-empty-state]');
        var codeForm = document.querySelector('[data-code-form]');
        var roomReady = document.querySelector('[data-room-ready]');
        var qrModal = document.getElementById('modal-leitor-qr');
        var qrVideo = document.querySelector('[data-qr-video]');
        var qrCanvas = document.querySelector('[data-qr-canvas]');
        var qrStatus = document.querySelector('[data-qr-status]');
        var qrStream = null;
        var qrFrame = 0;
        var modal = document.querySelector('[data-ai-modal]');
        var openModal = document.querySelector('[data-ai-open]');
        var closeModal = document.querySelector('[data-ai-close]');
        var aiForm = document.querySelector('[data-ai-form]');
        var materiaButtons = Array.from(document.querySelectorAll('[data-materia-filter]'));
        var activeMateria = new URLSearchParams(window.location.search).get('materia') || 'all';
        if (!materiaButtons.some(function (button) { return button.dataset.materiaFilter === activeMateria; })) activeMateria = 'all';
        var nomesMaterias = Object.fromEntries(materiaButtons.map(function (button) {
            return [button.dataset.materiaFilter, button.querySelector('strong').textContent];
        }));

        function normalize(text) {
            return (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        function atualizarConvite() {
            if (!codeForm || !roomReady) return;
            var nome = codeForm.querySelector('[name="nomeAluno"]');
            var codigo = codeForm.querySelector('[name="caseCode"]');
            codigo.value = codigo.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            var pronto = nome.value.trim().length > 1 && codigo.value.length >= 6;
            roomReady.textContent = pronto ? 'Tudo pronto! Você já pode entrar na sala.' : 'Preencha os dois campos para continuar.';
            roomReady.classList.toggle('is-ready', pronto);
            codeForm.classList.toggle('is-ready', pronto);
        }

        if (codeForm) codeForm.addEventListener('input', atualizarConvite);

        function codigoDoQr(conteudo) {
            var texto = String(conteudo || '').trim();
            var convite = texto.match(/^CLINIFY:SALA:([A-Z0-9]{6,12})$/i);
            if (convite) return convite[1].toUpperCase();
            try {
                var url = new URL(texto);
                var parametro = url.searchParams.get('sala') || url.searchParams.get('codigo');
                if (parametro) return parametro.trim().toUpperCase();
            } catch (erro) { /* O conteúdo pode ser apenas o código. */ }
            return /^[A-Z0-9]{6,12}$/i.test(texto) ? texto.toUpperCase() : '';
        }

        function pararLeitorQr() {
            cancelAnimationFrame(qrFrame);
            qrFrame = 0;
            if (qrStream) qrStream.getTracks().forEach(function (trilha) { trilha.stop(); });
            qrStream = null;
            if (qrVideo) { qrVideo.pause(); qrVideo.srcObject = null; }
        }

        function aplicarQr(conteudo) {
            var codigo = codigoDoQr(conteudo);
            if (!codigo) { qrStatus.textContent = 'Este QR Code não contém um convite válido do Clinify.'; return false; }
            codeForm.querySelector('[name="caseCode"]').value = codigo;
            atualizarConvite();
            pararLeitorQr();
            qrModal.hidden = true;
            ClinifyUI.mensagem('Código ' + codigo + ' lido. Informe seu nome para entrar.');
            codeForm.querySelector('[name="nomeAluno"]').focus();
            return true;
        }

        function procurarQr() {
            if (!qrStream || qrVideo.readyState < 2) { qrFrame = requestAnimationFrame(procurarQr); return; }
            var contexto = qrCanvas.getContext('2d', {willReadFrequently: true});
            qrCanvas.width = qrVideo.videoWidth; qrCanvas.height = qrVideo.videoHeight;
            contexto.drawImage(qrVideo, 0, 0, qrCanvas.width, qrCanvas.height);
            var pixels = contexto.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
            var resultado = typeof jsQR === 'function' ? jsQR(pixels.data, pixels.width, pixels.height, {inversionAttempts: 'dontInvert'}) : null;
            if (!resultado || !aplicarQr(resultado.data)) qrFrame = requestAnimationFrame(procurarQr);
        }

        if (qrModal) {
            new MutationObserver(function () { if (qrModal.hidden) pararLeitorQr(); }).observe(qrModal, {attributes: true, attributeFilter: ['hidden']});
            document.querySelector('[data-qr-open]').addEventListener('click', function () { qrModal.hidden = false; });
            document.querySelector('[data-qr-close]').addEventListener('click', function () { pararLeitorQr(); qrModal.hidden = true; });
            qrModal.addEventListener('click', function (event) { if (event.target === qrModal) { pararLeitorQr(); qrModal.hidden = true; } });
            document.querySelector('[data-qr-camera]').addEventListener('click', async function () {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { qrStatus.textContent = 'A câmera não está disponível. Use a opção Ler imagem.'; return; }
                try {
                    pararLeitorQr(); qrStatus.textContent = 'Procurando QR Code…';
                    qrStream = await navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: 'environment'}}, audio: false});
                    qrVideo.srcObject = qrStream; await qrVideo.play(); procurarQr();
                } catch (erro) { qrStatus.textContent = 'Não foi possível acessar a câmera. Autorize o acesso ou use uma imagem.'; }
            });
            document.querySelector('[data-qr-file]').addEventListener('change', function (event) {
                var arquivo = event.target.files[0];
                if (!arquivo) return;
                var imagem = new Image();
                imagem.onload = function () {
                    var contexto = qrCanvas.getContext('2d', {willReadFrequently: true});
                    var limite = 1400; var escala = Math.min(1, limite / Math.max(imagem.width, imagem.height));
                    qrCanvas.width = Math.round(imagem.width * escala); qrCanvas.height = Math.round(imagem.height * escala);
                    contexto.drawImage(imagem, 0, 0, qrCanvas.width, qrCanvas.height);
                    var pixels = contexto.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
                    var resultado = typeof jsQR === 'function' ? jsQR(pixels.data, pixels.width, pixels.height) : null;
                    if (!resultado || !aplicarQr(resultado.data)) qrStatus.textContent = 'QR Code não encontrado na imagem. Tente outra foto.';
                    URL.revokeObjectURL(imagem.src); event.target.value = '';
                };
                imagem.src = URL.createObjectURL(arquivo);
            });
        }

        function render() {
            var query = normalize(search ? search.value : '');
            var selectedDifficulty = difficulty ? difficulty.value : 'all';
            var visible = 0;

            cases.forEach(function (card) {
                var text = normalize(card.textContent);
                var matchesSearch = !query || text.includes(query);
                var matchesDifficulty = selectedDifficulty === 'all' || card.dataset.difficulty === selectedDifficulty;
                var matchesMateria = activeMateria === 'all' || card.dataset.materia === activeMateria;
                var show = matchesSearch && matchesDifficulty && matchesMateria;
                card.hidden = !show;
                if (show) visible += 1;
            });

            if (counter) counter.textContent = visible + (visible === 1 ? ' caso encontrado' : ' casos encontrados');
            if (empty) empty.hidden = visible !== 0;
            if (!visible && empty) {
                var mensagem = empty.querySelector('[data-empty-message]');
                var estudo = empty.querySelector('[data-empty-study-link]');
                if (mensagem) mensagem.textContent = activeMateria === 'all'
                    ? 'Nenhum caso encontrado com esses filtros.'
                    : 'Ainda não há casos para ' + nomesMaterias[activeMateria] + ' com esses filtros.';
                if (estudo) estudo.href = 'estudos.html' + (activeMateria === 'all' ? '' : '?materia=' + encodeURIComponent(activeMateria));
            }
            materiaButtons.forEach(function (button) {
                var selecionado = button.dataset.materiaFilter === activeMateria;
                button.classList.toggle('is-active', selecionado);
                button.setAttribute('aria-pressed', String(selecionado));
            });
        }

        materiaButtons.forEach(function (button) {
            var quantidade = cases.filter(function (card) { return card.dataset.materia === button.dataset.materiaFilter; }).length;
            button.querySelector('small').textContent = quantidade + (quantidade === 1 ? ' caso' : ' casos');
            button.addEventListener('click', function () {
                var value = button.dataset.materiaFilter;
                activeMateria = activeMateria === value ? 'all' : value;
                render();
            });
        });

        if (search) search.addEventListener('input', render);
        if (difficulty) difficulty.addEventListener('change', render);
        if (clear) {
            clear.addEventListener('click', function () {
                if (search) search.value = '';
                if (difficulty) difficulty.value = 'all';
                activeMateria = 'all';
                render();
            });
        }

        if (codeForm) {
            codeForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var codigo = codeForm.querySelector('[name="caseCode"]').value.trim().toUpperCase();
                try {
                    var aluno = codeForm.querySelector('[name="nomeAluno"]').value.trim();
                    var tentativa = ClinifySalas.entrar(codigo, aluno);
                    window.location.href = 'simulacao.html?materia=neurologia&sala=' + encodeURIComponent(codigo) + '&tentativa=' + encodeURIComponent(tentativa.id);
                } catch (erro) { ClinifyUI.mensagem(erro.message, true); }
            });
        }

        if (openModal && modal) {
            openModal.addEventListener('click', function () {
                var seletor = modal.querySelector('[data-ai-specialty]');
                if (seletor && activeMateria !== 'all') seletor.value = activeMateria;
                modal.hidden = false;
            });
        }

        if (closeModal && modal) {
            closeModal.addEventListener('click', function () {
                modal.hidden = true;
            });
        }

        if (modal) {
            modal.addEventListener('click', function (event) {
                if (event.target === modal) modal.hidden = true;
            });
        }

        function gerarCasoLocal(materia, dificuldade, caracteristicas) {
            var materias = {
                cardiologia: ['Cardiologia', 'Sinto um desconforto no peito e gostaria de entender o que está acontecendo.'],
                pneumologia: ['Pneumologia', 'Minha respiração mudou e isso tem me preocupado.'],
                neurologia: ['Neurologia', 'Tenho percebido sintomas diferentes e quero contar quando começaram.'],
                gastroenterologia: ['Gastroenterologia', 'Tenho sentido um desconforto digestivo e gostaria de conversar sobre isso.'],
                endocrinologia: ['Endocrinologia', 'Notei mudanças no meu corpo e gostaria de entender melhor.'],
                histologia: ['Histologia', 'Recebi informações sobre um exame e gostaria de entender o contexto da avaliação.']
            };
            var dificuldades = {
                facil: ['Fácil', 'Organize a queixa principal e faça perguntas iniciais.'],
                media: ['Média', 'Investigue a evolução dos sintomas e os sinais que precisam de atenção.'],
                dificil: ['Difícil', 'Priorize sinais de alerta e explique uma avaliação supervisionada com clareza.']
            };
            var descricao = (caracteristicas || '').trim().replace(/\s+/g, ' ');
            if (!materias[materia]) throw new Error('Selecione uma matéria válida.');
            if (!dificuldades[dificuldade]) throw new Error('Selecione uma dificuldade válida.');
            if (descricao.length < 20 || descricao.length > 500) throw new Error('Descreva o caso com 20 a 500 caracteres.');
            return {
                id: 'personalizado-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
                materia: materia,
                area: materias[materia][0],
                dificuldade: dificuldade,
                titulo: 'Caso personalizado de ' + materias[materia][0],
                pessoa: 'Paciente virtual',
                resumo: descricao,
                fala: materias[materia][1],
                objetivo: dificuldades[dificuldade][1],
                nivel: dificuldades[dificuldade][0],
                sinaisVitais: vitaisPadrao(materia)
            };
        }

        if (aiForm) {
            aiForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var botao = aiForm.querySelector('[type="submit"]');
                botao.disabled = true;
                botao.textContent = 'Preparando caso…';
                try {
                    var casoLocal = gerarCasoLocal(
                        aiForm.querySelector('[data-ai-specialty]').value,
                        aiForm.querySelector('[data-ai-difficulty]').value,
                        aiForm.querySelector('[data-ai-characteristics]').value
                    );
                    sessionStorage.setItem('clinify:caso-personalizado', JSON.stringify(casoLocal));
                    window.location.href = 'simulacao.html?caso=' + encodeURIComponent(casoLocal.id) + '&materia=' + encodeURIComponent(casoLocal.materia);
                } catch (erro) {
                    ClinifyUI.mensagem(erro.message, true);
                    botao.disabled = false;
                    botao.textContent = 'Gerar e iniciar caso →';
                }
            });
        }

        render();
    }

    function initConsultation() {
        var catalogo = {
            'cardio-dor': {materia: 'cardiologia', area: 'Cardiologia', titulo: 'Dor no peito após exercício', pessoa: 'João, 45 anos', resumo: 'Homem, 45 anos, dor no peito após exercício físico.', fala: 'Sinto dor no peito depois de fazer exercício.', sinaisVitais: vitaisPadrao('cardiologia')},
            'pneumo-fadiga': {materia: 'pneumologia', area: 'Pneumologia', titulo: 'Fadiga e falta de ar', pessoa: 'Maria, 28 anos', resumo: 'Mulher, 28 anos, fadiga constante e falta de ar.', fala: 'Estou cansada com frequência e sinto falta de ar.', sinaisVitais: vitaisPadrao('pneumologia')},
            'pediatria-febre': {materia: '', area: 'Pediatria', titulo: 'Febre e manchas na pele', pessoa: 'Paciente, 8 anos', resumo: 'Criança, 8 anos, febre alta, dor de garganta e manchas na pele.', fala: 'Estou com febre e minha garganta dói.', sinaisVitais: vitaisPadrao('pediatria')},
            'endo-sede': {materia: 'endocrinologia', area: 'Endocrinologia', titulo: 'Sede e perda de peso', pessoa: 'Paciente, 61 anos', resumo: 'Mulher, 61 anos, muita sede, perda de peso e ferida no pé.', fala: 'Tenho sentido muita sede e perdi peso.', sinaisVitais: vitaisPadrao('endocrinologia')},
            'gineco-dor': {materia: '', area: 'Ginecologia', titulo: 'Dor pélvica e sangramento irregular', pessoa: 'Paciente, 32 anos', resumo: 'Mulher, 32 anos, dor pélvica intensa e sangramento irregular.', fala: 'Estou com dor pélvica e sangramento irregular.', sinaisVitais: vitaisPadrao('ginecologia')},
            'mental-palpitacoes': {materia: '', area: 'Saúde Mental', titulo: 'Palpitações e medo intenso', pessoa: 'Paciente, 21 anos', resumo: 'Jovem, 21 anos, palpitações, medo intenso e sensação de morte.', fala: 'Estou com palpitações e muito medo.', sinaisVitais: vitaisPadrao('mental')},
            'emergencia-queda': {materia: '', area: 'Emergência', titulo: 'Queda de bicicleta', pessoa: 'Paciente, 24 anos', resumo: 'Homem, 24 anos, queda de bicicleta, confusão e dor abdominal.', fala: 'Caí de bicicleta e estou com dor abdominal.', sinaisVitais: vitaisPadrao('emergencia')},
            'neuro-confusao': {materia: 'neurologia', area: 'Neurologia', titulo: 'Confusão mental súbita', pessoa: 'Paciente, 78 anos', resumo: 'Idosa, 78 anos, confusão mental súbita, febre baixa e queda.', fala: 'Minha família percebeu que fiquei confusa depois de uma queda.', sinaisVitais: {pa: '154/88', fc: '90', temperatura: '37,8', dor: '4/10', dorDescricao: 'moderada'}}
        };
        var form = document.querySelector('[data-sim-form]');
        var input = document.querySelector('[data-sim-input]');
        var thread = document.querySelector('[data-chat-thread]');
        var log = document.querySelector('[data-decision-log]');
        var score = document.querySelector('[data-sim-score]');
        var timer = document.querySelector('[data-sim-timer]');
        var finish = document.querySelector('[data-finish-case]');
        var finishDialog = document.querySelector('[data-finish-dialog]');
        var cancelFinish = document.querySelector('[data-cancel-finish]');
        var confirmFinish = document.querySelector('[data-confirm-finish]');
        var history = document.querySelector('[data-history-summary]');
        var clinicalNotes = document.querySelector('[data-clinical-notes]');
        var notesStatus = document.querySelector('[data-notes-status]');
        var notesCount = document.querySelector('[data-notes-count]');
        var seconds = 0;
        var finalizado = false;
        var intervalo;
        var points = Number(score ? score.textContent : 64);
        var parametros = new URLSearchParams(window.location.search);
        var idCaso = parametros.get('caso') || 'cefaleia';
        var caso = catalogo[idCaso];
        if (!caso && idCaso.startsWith('personalizado-')) {
            try {
                var guardado = JSON.parse(sessionStorage.getItem('clinify:caso-personalizado') || 'null');
                if (guardado && guardado.id === idCaso && guardado.materia && guardado.resumo) caso = guardado;
            } catch (erro) { caso = null; }
        }
        if (idCaso !== 'cefaleia' && !caso) {
            document.querySelector('main').innerHTML = '<section class="record-card"><h1>Caso não encontrado</h1><a href="casos.html">Voltar aos casos</a></section>';
            return;
        }
        var codigoSala = parametros.get('sala');
        var idTentativa = parametros.get('tentativa');
        var chaveAgente = 'clinify:tentativa-ctwp:' + idCaso;
        var idAgente = idTentativa || sessionStorage.getItem(chaveAgente);
        if (!idAgente) { idAgente = crypto.randomUUID(); sessionStorage.setItem(chaveAgente, idAgente); }
        var enviando = false;
        var enviadas = 0;
        var materia = caso ? caso.materia : 'neurologia';
        var notesStorageKey = 'clinify:anotacoes:' + idCaso;
        var notesSaveTimer;
        function updateNotesCount() {
            if (notesCount && clinicalNotes) notesCount.textContent = clinicalNotes.value.length + ' / 4000';
        }
        if (clinicalNotes) {
            try { clinicalNotes.value = localStorage.getItem(notesStorageKey) || ''; }
            catch (erro) { clinicalNotes.value = ''; }
            updateNotesCount();
            clinicalNotes.addEventListener('input', function () {
                updateNotesCount();
                if (notesStatus) notesStatus.textContent = 'Salvando…';
                clearTimeout(notesSaveTimer);
                notesSaveTimer = setTimeout(function () {
                    try {
                        localStorage.setItem(notesStorageKey, clinicalNotes.value);
                        if (notesStatus) notesStatus.textContent = 'Salvo';
                    } catch (erro) {
                        if (notesStatus) notesStatus.textContent = 'Não salvo';
                    }
                }, 350);
            });
        }
        if (codigoSala && idCaso !== 'cefaleia') {
            document.querySelector('main').innerHTML = '<section class="record-card"><h1>Caso não disponível nesta sala</h1><a href="casos.html">Voltar aos casos</a></section>';
            return;
        }
        document.querySelectorAll('a[href^="casos.html"]').forEach(function (link) {
            link.href = 'casos.html' + (materia ? '?materia=' + encodeURIComponent(materia) : '');
        });
        if (caso) {
            var prontuario = document.querySelector('.record-card');
            var sinais = caso.sinaisVitais || vitaisPadrao(caso.materia);
            prontuario.querySelector('h2').textContent = caso.pessoa;
            prontuario.querySelectorAll('p')[0].textContent = caso.resumo + ' As demais informações devem ser obtidas durante a entrevista.';
            prontuario.querySelectorAll('p')[1].textContent = 'Sinais iniciais: PA ' + sinais.pa + ' mmHg, FC ' + sinais.fc + ' bpm, temperatura ' + sinais.temperatura + ' °C e dor ' + sinais.dor + '. Investigue a história e o contexto durante a conversa.';
            var cartaoVitais = document.querySelector('.vital-card');
            cartaoVitais.hidden = false;
            cartaoVitais.querySelector('[data-vital-pa]').innerHTML = sinais.pa + ' <small>mmHg</small>';
            cartaoVitais.querySelector('[data-vital-fc]').innerHTML = sinais.fc + ' <small>bpm</small>';
            cartaoVitais.querySelector('[data-vital-temperatura]').innerHTML = sinais.temperatura + ' <small>°C</small>';
            cartaoVitais.querySelector('[data-vital-dor]').innerHTML = sinais.dor + ' <small>' + sinais.dorDescricao + '</small>';
            document.querySelector('.chat-header h1').textContent = caso.titulo;
            var rotulo = document.querySelector('[data-materia-label]');
            if (rotulo) rotulo.textContent = caso.area + ' · ' + (caso.nivel ? 'dificuldade ' + caso.nivel.toLowerCase() : 'consulta simulada');
            var icone = document.querySelector('.consulta-materia [data-materia-icon]');
            if (icone && materia) {
                icone.className = 'study-icon study-icon--' + ({cardiologia: 'red', pneumologia: 'blue', neurologia: 'purple', endocrinologia: 'orange'}[materia] || 'blue');
                window.ClinifyMaterias.pintar(icone, materia);
                icone.dataset.materiaIcon = materia;
            } else if (icone) icone.remove();
            document.querySelector('.bubble.patient').textContent = caso.fala;
            var objetivos = document.querySelector('.learning-goals ul');
            objetivos.innerHTML = '';
            [caso.objetivo || 'Ouvir a pessoa e organizar a história da queixa.', 'Investigar sinais que exigem atenção.', 'Explicar decisões com clareza e considerar avaliação supervisionada.'].forEach(function (texto) {
                var item = document.createElement('li');
                item.textContent = texto;
                objetivos.appendChild(item);
            });
        }
        if (codigoSala) {
            var sala = ClinifySalas.localizar(codigoSala);
            var tentativa = sala && sala.tentativas.find(function (t) { return t.id === idTentativa; });
            if (!sala || sala.status !== 'aberta' || !tentativa || tentativa.estado !== 'em andamento') {
                document.querySelector('main').innerHTML = '<section class="record-card"><h1>Sala indisponível</h1><p>A sala foi encerrada, não existe ou esta tentativa já foi finalizada.</p><a href="casos.html">Voltar e entrar com outro código</a></section>';
                return;
            }
            var convite = document.createElement('section');
            convite.className = 'convite-sala';
            convite.innerHTML = '<strong>' + ClinifyUI.escapar(sala.nome) + '</strong><p>' + ClinifyUI.escapar(sala.turma) + ' · Código ' + ClinifyUI.escapar(sala.codigo) + ' · ' + ClinifyUI.escapar(tentativa.aluno) + '</p>' + (sala.instrucoes ? '<p>' + ClinifyUI.escapar(sala.instrucoes) + '</p>' : '');
            document.querySelector('main').prepend(convite);
            tentativa.respostas.forEach(function (r) { addMessage('doctor', r.texto); });
            enviadas = tentativa.respostas.length;
            points = typeof tentativa.pontos === 'number' ? tentativa.pontos : 64;
            if (score) score.textContent = points;
            seconds = Math.max(0, Math.floor((Date.now() - new Date(tentativa.inicio).getTime()) / 1000));
        }


        function addMessage(className, text) {
            if (!thread) return;
            var article = document.createElement('article');
            article.className = 'bubble ' + className;
            article.textContent = text;
            thread.appendChild(article);
            thread.scrollTop = thread.scrollHeight;
        }

        function addLog(text) {
            if (!log) return;
            var item = document.createElement('li');
            item.textContent = text;
            log.appendChild(item);
        }


        function chamarAgente(rota, corpo) {
            if (!window.ClinifyAgente) {
                throw new Error('O agente local não foi carregado.');
            }

            var chave = 'tentativa-local:' + idAgente;
            var tentativa = ClinifyUI.ler(chave, {
                estado: 'em andamento',
                criterios: [],
                pontos: 64,
                respostas: 0
            });
            var processamento;

            if (rota === 'concluir') {
                processamento = ClinifyAgente.concluir(tentativa);
            } else {
                processamento = ClinifyAgente.responder(idCaso, corpo.fala, tentativa);
            }

            ClinifyUI.salvar(chave, processamento.tentativa);
            return processamento.resultado;
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                if (finalizado || enviando) return;
                var text = input ? input.value.trim() : '';
                if (!text) return;
                enviando = true;
                var enviar = form.querySelector('[type="submit"]');
                if (enviar) enviar.disabled = true;
                try {
                    var analise = chamarAgente('responder', {tentativa: idAgente, caso: idCaso, codigo_sala: codigoSala || '', fala: text});
                    if (codigoSala) ClinifySalas.responder(codigoSala, idTentativa, text);
                    points = analise.pontos;
                    if (score) score.textContent = points;
                    enviadas = analise.respostas;
                    document.querySelectorAll('[data-criterio]').forEach(function (item) {
                        item.classList.toggle('is-complete', (analise.criterios_total || []).includes(item.dataset.criterio));
                    });

                    addMessage('doctor', text);
                    addMessage('patient', analise.resposta_paciente);
                    addLog(analise.criterios.length ? 'Critérios reconhecidos: ' + analise.criterios.join(', ') + '.' : 'Resposta registrada para reflexão.');
                    if (analise.feedback) addMessage('ai-feedback', analise.feedback);
                    if (input) input.value = '';
                } catch (erro) { ClinifyUI.mensagem(erro.message, true); }
                finally { enviando = false; if (enviar && !finalizado) enviar.disabled = false; }
            });
        }

        function concluirCaso() {
            if (finalizado || enviando) return;
            enviando = true;
            finish.disabled = true;
            if (confirmFinish) confirmFinish.disabled = true;
            try {
                var conclusao = chamarAgente('concluir', {tentativa: idAgente});
                points = conclusao.pontos;
                if (score) score.textContent = points;
                if (codigoSala) ClinifySalas.finalizar(codigoSala, idTentativa, {pontos: points, segundos: seconds});
                var dataConclusao = new Date().toISOString();
                ClinifyUI.salvar('resultado-simulacao', {caso: idCaso, pontos: points, segundos: seconds, data: dataConclusao});
                if (window.ClinifyAtividades) {
                    ClinifyAtividades.registrarSimulado({
                        tentativa: idAgente,
                        caso: idCaso,
                        titulo: document.querySelector('.chat-header h1').textContent,
                        concluida_em: dataConclusao,
                        duracao_segundos: seconds,
                        pontuacao: points,
                        respostas: conclusao.respostas || enviadas,
                        criterios: conclusao.criterios || []
                    });
                }
                finalizado = true;
                clearInterval(intervalo);
                if (input) input.disabled = true;
                if (form) form.querySelector('[type="submit"]').disabled = true;
                var xpGanho = ClinifyJornada.registrar(codigoSala ? 'sala:' + codigoSala : 'caso:' + idCaso, 'caso');
                ClinifyUI.mensagem('Simulação concluída. Resultado registrado.' + (xpGanho ? ' +' + xpGanho + ' XP! Confira suas conquistas no perfil.' : ''));
                if (history) history.textContent = 'Caso finalizado com ' + points + ' pontos.';
                addLog('Caso finalizado.');
                if (!codigoSala) sessionStorage.removeItem(chaveAgente);
            } catch (erro) {
                ClinifyUI.mensagem(erro.message, true);
                finish.disabled = false;
                if (confirmFinish) confirmFinish.disabled = false;
            } finally {
                enviando = false;
            }
        }

        if (finish) {
            finish.addEventListener('click', function () {
                if (finalizado || enviando) return;
                if (!enviadas) {
                    ClinifyUI.mensagem('Envie pelo menos uma resposta antes de concluir.', true);
                    return;
                }
                if (finishDialog && typeof finishDialog.showModal === 'function') finishDialog.showModal();
                else if (finishDialog) finishDialog.setAttribute('open', '');
            });
        }
        if (cancelFinish && finishDialog) {
            cancelFinish.addEventListener('click', function () { finishDialog.close(); });
        }
        if (confirmFinish && finishDialog) {
            confirmFinish.addEventListener('click', function () {
                finishDialog.close();
                concluirCaso();
            });
        }

        if (codigoSala) window.addEventListener('storage', function (evento) {
            if (evento.key !== 'clinify:salas' && evento.key !== null) return;
            var atual = ClinifySalas.localizar(codigoSala);
            var indisponivel = !atual || atual.status !== 'aberta';
            if (!finalizado) {
                if (input) input.disabled = indisponivel;
                if (form) form.querySelector('[type="submit"]').disabled = indisponivel;
                if (finish) finish.disabled = indisponivel;
                ClinifyUI.mensagem(indisponivel ? 'A sala foi encerrada ou excluída pelo professor.' : 'A sala está aberta novamente.', indisponivel);
            }
        });

        if (history) {
            var resultado = ClinifyUI.ler('resultado-simulacao', null);
            if (resultado && typeof resultado.pontos === 'number') history.textContent = 'Última simulação: ' + resultado.pontos + ' pontos.';
        }

        if (timer) {
            intervalo = window.setInterval(function () {
                seconds += 1;
                var minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
                var rest = (seconds % 60).toString().padStart(2, '0');
                timer.textContent = minutes + ':' + rest;
            }, 1000);
        }
    }
})();
