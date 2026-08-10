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
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const hoje = dias[new Date().getDay()];
  document.querySelectorAll('.dia-filtro-btn').forEach(btn => {
    if (btn.textContent.trim() && hoje.startsWith(btn.textContent.trim().slice(0,3))) {
      filtrarDiaNota(hoje, btn);
    }
  });
});