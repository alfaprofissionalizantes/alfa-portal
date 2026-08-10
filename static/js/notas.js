// notas.js — Alfa Profissionalizantes

function trocarAba(aba, botao) {
  document.querySelectorAll('.painel-aba').forEach(p => p.classList.add('oculto'));
  document.querySelectorAll('.aba').forEach(b => b.classList.remove('ativa'));
  document.getElementById('painel-' + aba).classList.remove('oculto');
  botao.classList.add('ativa');
}

function filtrarDiaNota(dia, btn) {
  document.querySelectorAll('.dia-filtro-btn').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');

  const select = document.getElementById('select-turma-nota');
  select.querySelectorAll('option').forEach(op => {
    if (!op.value) return;
    if (!dia || (op.dataset.dias && op.dataset.dias.includes(dia))) {
      op.style.display = '';
    } else {
      op.style.display = 'none';
    }
  });
  select.value = '';
}

document.addEventListener('DOMContentLoaded', function() {
  const mapaAbrev = {
    0: '', 1: 'Segunda', 2: 'Terça', 3: 'Quarta',
    4: 'Quinta', 5: 'Sexta', 6: 'Sábado'
  };
  const hoje = mapaAbrev[new Date().getDay()];
  if (hoje) {
    document.querySelectorAll('.dia-filtro-btn').forEach(btn => {
      const mapaNome = {
        'Seg': 'Segunda', 'Ter': 'Terça', 'Qua': 'Quarta',
        'Qui': 'Quinta', 'Sex': 'Sexta', 'Sáb': 'Sábado'
      };
      if (mapaNome[btn.textContent.trim()] === hoje) {
        filtrarDiaNota(hoje, btn);
      }
    });
  }

  const selectNota = document.getElementById('select-turma-nota');
  if (selectNota) {
    selectNota.addEventListener('change', function() {
      const turmaId = this.value;
      if (!turmaId) return;

      fetch(`/professor/alunos_turma/${turmaId}`)
        .then(r => r.json())
        .then(alunos => {
          const lista = document.getElementById('lista-alunos-nota');
          if (!lista) return;
          lista.innerHTML = '';
          alunos.forEach(a => {
            lista.innerHTML += `
              <div class="nota-aluno-item" id="aluno-${a.id}">
                <span>${a.nome}</span>
                <input type="number" class="campo-nota" min="0" max="10" step="0.1"
                  placeholder="Nota" id="nota-${a.id}"/>
              </div>`;
          });
          const painel = document.getElementById('painel-lancamento');
          if (painel) painel.classList.remove('oculto');
        });
    });
  }
});