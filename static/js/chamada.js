// chamada.js — Alfa Profissionalizantes

let turmaSelecionada = null;
let turmaInfo = {};
let mesAtual = new Date().getMonth() + 1;
let anoAtual = new Date().getFullYear();

function abrirCalendario() {
  const select = document.getElementById('select-turma-falta');
  const turmaId = select.value;
  if (!turmaId) { alert('Selecione uma turma!'); return; }

  turmaSelecionada = turmaId;
  const opt = select.options[select.selectedIndex];
  turmaInfo = {
    nome: opt.text,
    dias: opt.dataset.dias ? opt.dataset.dias.split(',').map(d => d.trim()) : []
  };

  mesAtual = new Date().getMonth() + 1;
  anoAtual = new Date().getFullYear();

  document.getElementById('card-selecao').classList.add('oculto');
  document.getElementById('card-calendario').classList.remove('oculto');
  carregarCalendario();
}

function carregarCalendario() {
  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  document.getElementById('cal-titulo').textContent = `Calendário — ${turmaInfo.nome}`;
  document.getElementById('cal-subtitulo').textContent = `${MESES[mesAtual-1]} ${anoAtual}`;

  fetch(`/professor/chamadas_mes/${turmaSelecionada}/${anoAtual}/${mesAtual}`)
    .then(r => r.json())
    .then(chamadas => {
      const diasComChamada = chamadas.map(c => c.data_aula);
      renderizarCalendario(diasComChamada);
    });
}

function renderizarCalendario(diasComChamada) {
  const DIAS_SEMANA_PT = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const container = document.getElementById('calendario-dias');
  container.innerHTML = '';

  const nav = document.createElement('div');
  nav.className = 'cal-nav';
  nav.innerHTML = `
    <button class="btn-cal-nav" onclick="mudarMes(-1)">← Anterior</button>
    <button class="btn-cal-nav" onclick="mudarMes(1)">Próximo →</button>
  `;
  container.appendChild(nav);

  const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const data = new Date(anoAtual, mesAtual - 1, dia);
    data.setHours(0, 0, 0, 0);
    const diaSemana = DIAS_SEMANA_PT[data.getDay()];

    if (!turmaInfo.dias.includes(diaSemana)) continue;

    const dataStr = `${anoAtual}-${String(mesAtual).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    const isHoje = data.getTime() === hoje.getTime();
    const isFuturo = data > hoje;
    const temChamada = diasComChamada.includes(dataStr);

    const btn = document.createElement('button');
    btn.className = `dia-cal ${temChamada ? 'feito' : ''} ${isHoje ? 'hoje' : ''}`;
    btn.textContent = `${String(dia).padStart(2,'0')} ${diaSemana}`;

    if (isFuturo) {
      btn.disabled = true;
      btn.style.opacity = '0.4';
      btn.style.cursor = 'not-allowed';
    } else {
      btn.onclick = () => abrirChamada(dataStr, `${String(dia).padStart(2,'0')}/${String(mesAtual).padStart(2,'0')}/${anoAtual}`);
    }
    container.appendChild(btn);
  }

  if (container.querySelectorAll('.dia-cal').length === 0) {
    const vazio = document.createElement('p');
    vazio.style.color = '#94a3b8';
    vazio.style.fontSize = '0.9rem';
    vazio.textContent = 'Nenhum dia de aula neste mês.';
    container.appendChild(vazio);
  }
}

function mudarMes(direcao) {
  const hoje = new Date();
  let novoMes = mesAtual + direcao;
  let novoAno = anoAtual;

  if (novoMes > 12) { novoMes = 1; novoAno++; }
  if (novoMes < 1)  { novoMes = 12; novoAno--; }

  if (novoAno > hoje.getFullYear() ||
     (novoAno === hoje.getFullYear() && novoMes > hoje.getMonth() + 1)) {
    return;
  }

  mesAtual = novoMes;
  anoAtual = novoAno;
  carregarCalendario();
}

function abrirChamada(data, dataFormatada) {
  document.getElementById('chamada-data-label').textContent = `${dataFormatada} — ${turmaInfo.nome}`;
  document.getElementById('card-calendario').classList.add('oculto');
  document.getElementById('card-chamada').classList.remove('oculto');

  fetch(`/professor/alunos_chamada/${turmaSelecionada}/${data}`)
    .then(r => r.json())
    .then(alunos => {
      const lista = document.getElementById('lista-alunos');
      lista.innerHTML = '';
      lista.dataset.data = data;

      alunos.forEach(a => {
        const card = document.createElement('div');
        card.className = 'card-chamada';
        card.id = `card-${a.id}`;
        card.dataset.status = a.status;

        card.innerHTML = `
          <div class="chamada-aluno-info">
            ${a.foto ? `<img src="${a.foto}" class="aluno-avatar-foto"/>` : `<div class="aluno-avatar">${a.nome[0]}</div>`}
            <div>
              <p class="chamada-aluno-nome">${a.nome}</p>
              <p class="chamada-aluno-info-extra">
                ${a.telefone_responsavel ? a.telefone_responsavel : ''}
                ${a.data_matricula ? ` — Mat: ${a.data_matricula}` : ''}
              </p>
              ${a.faltas_mes > 0 ? `<p class="chamada-faltas">${a.faltas_mes} falta(s) no mês</p>` : ''}
              <div class="historico-notas oculto" id="historico-${a.id}"></div>
            </div>
          </div>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button class="btn-historico" onclick="abrirLancarNota(${a.id}, ${turmaSelecionada})" title="Lançar nota">📝</button>
            <button class="btn-historico" style="background:#fee2e2; border-color:#fca5a5;" onclick="confirmarRemoverAluno(${a.id}, '${a.nome}', ${turmaSelecionada})" title="Remover da turma">🗑️</button>
            <button class="btn-status ${a.status === 'F' ? 'falta' : 'presente'}" onclick="toggleStatus(${a.id})">
              ${a.status === 'F' ? '❌ Falta' : '✅ Presente'}
            </button>
          </div>
        `;
        lista.appendChild(card);
      });
    });
}

function toggleStatus(alunoId) {
  const card = document.getElementById(`card-${alunoId}`);
  const btn  = card.querySelector('.btn-status');
  const novoStatus = card.dataset.status === 'P' ? 'F' : 'P';
  card.dataset.status = novoStatus;
  btn.className = `btn-status ${novoStatus === 'F' ? 'falta' : 'presente'}`;
  btn.textContent = novoStatus === 'F' ? '❌ Falta' : '✅ Presente';
}

function salvarChamada() {
  const lista = document.getElementById('lista-alunos');
  const data  = lista.dataset.data;
  const cards = lista.querySelectorAll('.card-chamada');
  const status = {};
  cards.forEach(c => {
    const id = c.id.replace('card-', '');
    status[id] = c.dataset.status;
  });

  fetch('/professor/salvar_chamada', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turma_id: turmaSelecionada, data, status })
  })
  .then(r => r.json())
  .then(d => {
    const msg = document.getElementById('msg-chamada');
    msg.style.display = 'block';
    if (d.ok) {
      msg.style.background = '#dcfce7';
      msg.style.color = '#16a34a';
      msg.textContent = 'Chamada salva!';
      setTimeout(() => voltarCalendario(), 1500);
    } else {
      msg.style.background = '#fee2e2';
      msg.style.color = '#dc2626';
      msg.textContent = 'Erro ao salvar.';
    }
  });
}

function voltarCalendario() {
  document.getElementById('card-chamada').classList.add('oculto');
  document.getElementById('card-calendario').classList.remove('oculto');
  carregarCalendario();
}

function voltarSelecao() {
  document.getElementById('card-calendario').classList.add('oculto');
  document.getElementById('card-selecao').classList.remove('oculto');
}

function filtrarDia(dia, btn) {
  document.querySelectorAll('.dia-filtro-btn').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  const select = document.getElementById('select-turma-falta');
  select.querySelectorAll('option').forEach(op => {
    if (!op.value) return;
    op.style.display = (!dia || (op.dataset.dias && op.dataset.dias.includes(dia))) ? '' : 'none';
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
        filtrarDia(hoje, btn);
      }
    });
  }
});

function toggleHistorico(alunoId, turmaId) {
  const div = document.getElementById(`historico-${alunoId}`);
  if (!div.classList.contains('oculto')) {
    div.classList.add('oculto');
    return;
  }
  div.classList.remove('oculto');
  div.innerHTML = '<p style="font-size:0.78rem; color:#64748b;">Carregando...</p>';
  fetch(`/professor/historico_notas/${alunoId}/${turmaId}`)
    .then(r => r.json())
    .then(notas => {
      if (notas.length === 0) {
        div.innerHTML = '<p style="font-size:0.78rem; color:#94a3b8;">Nenhuma nota lançada.</p>';
        return;
      }
      const MESES = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                     'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      div.innerHTML = notas.map(n => `
        <div class="nota-historico-item">
          <span>${n.nome_atividade}</span>
          <span style="color:#64748b; font-size:0.75rem;">${MESES[n.mes]} ${n.ano}</span>
          <strong>${n.valor}</strong>
        </div>
      `).join('');
    });
}

function abrirLancarNota(alunoId, turmaId) {
  window.location.href = `/professor/notas?turma=${turmaId}&aluno=${alunoId}`;
}

function confirmarRemoverAluno(alunoId, nomeAluno, turmaId) {
  if (confirm(`Deseja remover "${nomeAluno}" desta turma?\n\nEsta ação não apaga o histórico de chamadas e notas.`)) {
    fetch(`/professor/remover_aluno_turma/${turmaId}/${alunoId}`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          document.getElementById(`card-${alunoId}`).remove();
          alert(`${nomeAluno} removido da turma!`);
        }
      });
  }
}

function abrirAdicionarAluno() {
  fetch(`/professor/alunos_sem_turma/${turmaSelecionada}`)
    .then(r => r.json())
    .then(alunos => {
      if (alunos.length === 0) {
        alert('Nenhum aluno disponível para adicionar.');
        return;
      }
      document.getElementById('lista-adicionar-alunos').innerHTML = alunos.map(a => `
        <label class="turma-check-item">
          <input type="checkbox" value="${a.id}" class="check-add-aluno"/>
          ${a.nome} — Mat. ${a.matricula}
        </label>
      `).join('');
      document.getElementById('overlay-modal-add-aluno').classList.remove('oculto');
      document.getElementById('modal-add-aluno').classList.remove('oculto');
    });
}

function fecharModalAddAluno() {
  document.getElementById('overlay-modal-add-aluno').classList.add('oculto');
  document.getElementById('modal-add-aluno').classList.add('oculto');
}

function confirmarAdicionarAlunos() {
  const selecionados = [...document.querySelectorAll('.check-add-aluno:checked')].map(c => c.value);
  if (selecionados.length === 0) { alert('Selecione ao menos um aluno!'); return; }

  fetch(`/professor/vincular_alunos/${turmaSelecionada}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aluno_ids: selecionados })
  })
  .then(r => r.json())
  .then(data => {
    if (data.ok) {
      fecharModalAddAluno();
      alert('Aluno(s) adicionado(s) com sucesso!');
    }
  });
}