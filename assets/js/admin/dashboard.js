(function () {
    if (!window.ClinifyDB) return;

    const professores = ClinifyDB.professores.listar();
    const turmas = ClinifyDB.turmas.listar();
    const alunos = ClinifyDB.alunos.listar();

    const statProfessores = document.getElementById('stat-professores');
    const statTurmas = document.getElementById('stat-turmas');
    const statAlunos = document.getElementById('stat-alunos');

    if (statProfessores) statProfessores.textContent = professores.length;
    if (statTurmas) statTurmas.textContent = turmas.length;
    if (statAlunos) statAlunos.textContent = alunos.length;

    const tbody = document.getElementById('professores-preview');
    if (tbody) {
        if (professores.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="empty-state">Nenhum professor cadastrado.</td></tr>`;
        } else {
            tbody.innerHTML = professores.slice(0, 5).map((p) => `
                <tr>
                    <td>${ClinifyUI.escapar(p.nome)}</td>
                    <td>${ClinifyUI.escapar(p.email)}</td>
                    <td><span class="badge ${p.status === 'ativo' ? 'badge--ativo' : 'badge--inativo'}">${p.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
                </tr>
            `).join('');
        }
    }
})();
