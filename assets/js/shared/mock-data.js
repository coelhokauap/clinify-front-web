(function () {
    var seed = {
        professores: [
            { id: 'prof-1', nome: 'Prof. Daniel Ribeiro', email: 'daniel.ribeiro@clinify.com', status: 'ativo' },
            { id: 'prof-2', nome: 'Profa. Helena Martins', email: 'helena.martins@clinify.com', status: 'ativo' },
            { id: 'prof-3', nome: 'Prof. Caio Andrade', email: 'caio.andrade@clinify.com', status: 'inativo' }
        ],
        turmas: [
            { id: 'turma-1', nome: 'Medicina 6A', alunos: 42, simulacoes: 18 },
            { id: 'turma-2', nome: 'Medicina 7B', alunos: 37, simulacoes: 21 },
            { id: 'turma-3', nome: 'Internato Clínica', alunos: 29, simulacoes: 16 }
        ],
        alunos: [
            { id: 'aluno-1', nome: 'Ana Costa', turma: 'Medicina 6A' },
            { id: 'aluno-2', nome: 'Bruno Lima', turma: 'Medicina 7B' },
            { id: 'aluno-3', nome: 'Luiza Nunes', turma: 'Internato Clínica' },
            { id: 'aluno-4', nome: 'Rafael Melo', turma: 'Medicina 6A' },
            { id: 'aluno-5', nome: 'Sofia Prado', turma: 'Medicina 7B' }
        ],
        atividades: [
            { aluno: 'Ana Costa', acao: 'concluiu Cardiologia', quando: 'Hoje' },
            { aluno: 'Bruno Lima', acao: 'iniciou uma simulação', quando: 'Ontem' },
            { aluno: 'Luiza Nunes', acao: 'revisou Pneumologia', quando: '2 dias atrás' }
        ]
    };

    function read(key) {
        try {
            var saved = localStorage.getItem('clinify:' + key);
            if (!saved) return seed[key].slice();
            var dados = JSON.parse(saved);
            return Array.isArray(dados) && dados.every(function (item) { return item && typeof item === 'object' && Object.keys(seed[key][0]).every(function (campo) { return typeof item[campo] === typeof seed[key][0][campo]; }); }) ? dados : seed[key].slice();
        } catch (error) {
            return seed[key].slice();
        }
    }

    function write(key, value) {
        if (!ClinifyUI.salvar(key, value)) throw new Error('Não foi possível salvar os dados.');
    }

    function uid(prefix) {
        return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    }

    window.ClinifyDB = {
        professores: {
            listar: function () {
                return read('professores');
            },
            cadastrar: function (dados) {
                var professores = read('professores');
                professores.push({ id: uid('prof'), nome: dados.nome, email: dados.email, status: 'ativo' });
                write('professores', professores);
            },
            editar: function (id, dados) {
                var professores = read('professores').map(function (professor) {
                    if (professor.id !== id) return professor;
                    return Object.assign({}, professor, dados);
                });
                write('professores', professores);
            },
            alternarStatus: function (id) {
                var professores = read('professores').map(function (professor) {
                    if (professor.id !== id) return professor;
                    return Object.assign({}, professor, { status: professor.status === 'ativo' ? 'inativo' : 'ativo' });
                });
                write('professores', professores);
            }
        },
        turmas: {
            listar: function () {
                return read('turmas');
            }
        },
        alunos: {
            listar: function () {
                return read('alunos');
            }
        },
        atividades: {
            listar: function () {
                return seed.atividades.slice();
            }
        }
    };
})();
