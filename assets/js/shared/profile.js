(function () {
    'use strict';
    var nome = document.getElementById('perfil-nome');
    var email = document.getElementById('perfil-email');
    var form = document.querySelector('[data-profile-form]');
    if (!form || !nome || !email) return;
    var area = document.body.dataset.area;
    var sessao = ClinifyUI.ler('sessao:usuario', {});
    var identificador = sessao.id || sessao.email || area;
    var chave = 'perfil:' + identificador;
    var salvo = ClinifyUI.ler(chave, null);
    function atualizar() {
        document.querySelector('.profile-name').textContent = nome.value;
        document.querySelector('.profile-email').textContent = email.value;
    }
    if (salvo && typeof salvo.nome === 'string' && typeof salvo.email === 'string') {
        nome.value = salvo.nome; email.value = salvo.email; atualizar();
    }
    form.addEventListener('submit', function (evento) {
        evento.preventDefault();
        nome.value = nome.value.trim();
        if (!form.reportValidity()) return;
        if (ClinifyUI.salvar(chave, {nome: nome.value, email: email.value.trim()})) {
            ClinifyUI.salvar('sessao:usuario', {
                id: identificador,
                email: email.value.trim().toLowerCase(),
                nome: nome.value,
                perfil: area
            });
            atualizar(); ClinifyUI.mensagem('Perfil atualizado com sucesso.');
        }
    });
})();
