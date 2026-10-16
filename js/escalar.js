const formationSelect = document.getElementById("formation-select");
const formationContainer = document.getElementById("formation-container");

let formacaoAtual = obterFormacaoAtual();

let jogadoresEscalados = lerJSON(CHAVES.escalacao, []);

const lineupCount = document.getElementById("lineup-count");

const lineupPercentage = document.getElementById("lineup-percentage");

const lineupProgress = document.getElementById("lineup-progress");

const lineupMissing = document.getElementById("lineup-missing");

const budgetTotal = document.getElementById("budget-total");

const budgetUsed = document.getElementById("budget-used");

const budgetAvailable = document.getElementById("budget-available");

const confirmLineup = document.getElementById("confirm-lineup");

const confirmMessage = document.getElementById("confirm-message");

// Define o texto da mensagem e o estado visual (success/error); sem tipo
// a mensagem é neutra. Só apresentação: a validade da confirmação vem de
// confirmacaoEstaValida().
function definirMensagemConfirmacao(texto, tipo) {
  confirmMessage.textContent = texto;
  confirmMessage.classList.toggle("is-success", tipo === "success");
  confirmMessage.classList.toggle("is-error", tipo === "error");
}

// ================================
// RESUMO DA RODADA
// ================================


// ================================
// CARREGAR FORMAÇÕES
// ================================

function carregarFormacoes() {
  const formacoes = CONFIG.escalacao.formacoes;

  Object.keys(formacoes).forEach((nomeFormacao) => {
    const option = document.createElement("option");

    option.value = nomeFormacao;
    option.textContent = nomeFormacao;

    if (nomeFormacao === formacaoAtual) {
      option.selected = true;
    }

    formationSelect.appendChild(option);
  });
}

// ================================
// CRIAR VAGA DE JOGADOR
// ================================

function criarVaga(posicao, indice) {
  const slotId = `${posicao}-${indice}`;

  // Procura se existe jogador escalado nesta vaga
  const escalado = jogadoresEscalados.find(function (item) {
    return item.slot === slotId;
  });

  // =========================
  // VAGA PREENCHIDA
  // =========================

  if (escalado) {
    const jogador = JOGADORES.find(function (item) {
      return item.id === escalado.jogadorId;
    });

    if (jogador) {
      const slot = document.createElement("div");

      slot.classList.add("player-slot", "filled");

      slot.dataset.slot = slotId;
      slot.dataset.jogadorId = jogador.id;

      const iniciais = gerarIniciais(jogador.nome);

      slot.innerHTML = `
    <div class="player-avatar">
        ${iniciais}

        <span class="player-points">
            ${formatarPontos(jogador.pontos)}
        </span>
    </div>

    <strong>
        ${jogador.nome}
    </strong>

    <span>
        ${posicao}
    </span>

    <div class="player-slot-actions">

        <button
            type="button"
            class="slot-action change-player"
            title="Trocar jogador"
            aria-label="Trocar jogador"
        >
            ↻
        </button>

        <button
            type="button"
            class="slot-action remove-player"
            title="Remover jogador"
            aria-label="Remover jogador"
        >
            ×
        </button>

    </div>
`;
      const botaoRemover = slot.querySelector(".remove-player");

      botaoRemover.addEventListener("click", function (event) {
        event.stopPropagation();

        removerJogador(slotId);
      });

      const botaoTrocar = slot.querySelector(".change-player");

      botaoTrocar.addEventListener("click", function (event) {
        event.stopPropagation();

        // "trocar" identifica o jogador substituído. A lista ainda não usa
        // esse parâmetro; fica na URL para quando a troca precisar dele.
        window.location.href = `jogadores.html?posicao=${posicao}&slot=${slotId}&trocar=${jogador.id}`;
      });

      return slot;
    }
  }

  // =========================
  // VAGA VAZIA
  // =========================

  return criarVagaVazia(posicao, slotId);
}

function removerJogador(slotId) {
  jogadoresEscalados = jogadoresEscalados.filter(function (item) {
    return item.slot !== slotId;
  });

  // A escalação foi alterada.
  // A confirmação anterior deixa de valer.
  localStorage.removeItem(CHAVES.confirmada);

  localStorage.setItem(CHAVES.escalacao, JSON.stringify(jogadoresEscalados));

  montarFormacao(formacaoAtual);

  atualizarPainel();
}

// ================================
// MONTAR CAMPO
// ================================

function montarFormacao(nomeFormacao) {
  montarCampoFormacao(formationContainer, nomeFormacao, criarVaga);
}

// ================================
// TROCAR FORMAÇÃO
// ================================

formationSelect.addEventListener("change", function () {
  formacaoAtual = formationSelect.value;

  // Trocar a formação sempre invalida a confirmação anterior
  localStorage.removeItem(CHAVES.confirmada);

  // Salva a formação escolhida
  localStorage.setItem(CHAVES.formacao, formacaoAtual);

  // =========================
  // REMOVER SLOTS INVÁLIDOS
  // =========================

  const formacao = CONFIG.escalacao.formacoes[formacaoAtual];

  jogadoresEscalados = jogadoresEscalados.filter(function (escalado) {
    const partes = escalado.slot.split("-");

    const posicao = partes[0];

    const indice = Number(partes[1]);

    // Goleiro
    if (posicao === "GOL") {
      return indice < CONFIG.escalacao.goleiros;
    }

    // DEF / MEI / ATA
    if (formacao[posicao] !== undefined) {
      return indice < formacao[posicao];
    }

    return false;
  });

  // Atualiza o localStorage
  localStorage.setItem(CHAVES.escalacao, JSON.stringify(jogadoresEscalados));

  // Reconstrói o campo
  montarFormacao(formacaoAtual);

  // Atualiza contador e orçamento
  atualizarPainel();
});

// ================================
// INICIAR PÁGINA
// ================================

carregarFormacoes();

montarFormacao(formacaoAtual);

atualizarPainel();

// ================================
// CONFIRMAR ESCALAÇÃO
// ================================

confirmLineup.addEventListener("click", function () {
  const totalJogadores = CONFIG.escalacao.totalJogadores;

  const quantidadeEscalada = jogadoresEscalados.length;

  const valorUtilizado = calcularValorEscalacao(idsDaEscalacao(jogadoresEscalados));

  const dentroDoOrcamento = valorUtilizado <= CONFIG.moeda.orcamentoInicial;

  // Segurança extra
  if (quantidadeEscalada !== totalJogadores || !dentroDoOrcamento) {
    return;
  }

  const escalacaoParaSalvar = {
    formacao: formacaoAtual,
    jogadores: jogadoresEscalados,
    valorTotal: valorUtilizado,
    confirmada: true,
    dataConfirmacao: new Date().toISOString(),
  };

  localStorage.setItem(
    CHAVES.confirmada,
    JSON.stringify(escalacaoParaSalvar),
  );

  atualizarPainel();

  confirmLineup.textContent = "Escalação confirmada ✓";

  confirmLineup.disabled = true;

  confirmLineup.classList.remove("btn-primary");

  confirmLineup.classList.add("btn-disabled");

  definirMensagemConfirmacao(
    "Sua escalação foi confirmada para a rodada.",
    "success",
  );
});

// ================================
// ATUALIZAR RESUMO DA RODADA
// ================================



function atualizarPainel() {
  const totalJogadores = CONFIG.escalacao.totalJogadores;

  const quantidadeEscalada = jogadoresEscalados.length;


  // =========================
  // PROGRESSO
  // =========================

  const porcentagem = Math.round((quantidadeEscalada / totalJogadores) * 100);

  lineupCount.textContent = `${quantidadeEscalada} de ${totalJogadores} jogadores`;

  lineupPercentage.textContent = `${porcentagem}%`;

  lineupProgress.style.width = `${porcentagem}%`;

  // =========================
  // JOGADORES RESTANTES
  // =========================

  const faltam = totalJogadores - quantidadeEscalada;

  if (faltam === 0) {
    lineupMissing.textContent = "Escalação completa.";
  } else if (faltam === 1) {
    lineupMissing.textContent = "Falta 1 jogador.";
  } else {
    lineupMissing.textContent = `Faltam ${faltam} jogadores.`;
  }

  // =========================
  // ORÇAMENTO
  // =========================

  const orcamentoTotal = CONFIG.moeda.orcamentoInicial;

  const utilizado = calcularValorEscalacao(idsDaEscalacao(jogadoresEscalados));

  const disponivel = orcamentoTotal - utilizado;

  budgetTotal.textContent = formatarMoeda(orcamentoTotal);

  budgetUsed.textContent = formatarMoeda(utilizado);

  budgetAvailable.textContent = formatarMoeda(disponivel);

  // =========================
  // BOTÃO DE CONFIRMAÇÃO
  // =========================

  const escalacaoCompleta = quantidadeEscalada === totalJogadores;

  const dentroDoOrcamento = disponivel >= 0;

  // Regra única (script.js), igual à usada na Home e em Rodadas:
  // a confirmação só vale se a escalação atual é a que foi confirmada
  const confirmacaoValida = confirmacaoEstaValida();

  // =========================
  // JÁ ESTÁ CONFIRMADA
  // =========================

  if (confirmacaoValida) {
    confirmLineup.textContent = "Escalação confirmada ✓";

    confirmLineup.disabled = true;

    confirmLineup.classList.remove("btn-primary");

    confirmLineup.classList.add("btn-disabled");

    definirMensagemConfirmacao(
    "Sua escalação foi confirmada para a rodada.",
    "success",
  );
  }

  // =========================
  // COMPLETA, MAS NÃO CONFIRMADA
  // =========================
  else if (escalacaoCompleta && dentroDoOrcamento) {
    confirmLineup.textContent = "Confirmar escalação";

    confirmLineup.disabled = false;

    confirmLineup.classList.remove("btn-disabled");

    confirmLineup.classList.add("btn-primary");

    definirMensagemConfirmacao("Sua escalação está pronta para ser confirmada.");
  }

  // =========================
  // INCOMPLETA OU SEM ORÇAMENTO
  // =========================
  else {
    confirmLineup.textContent = "Confirmar escalação";

    confirmLineup.disabled = true;

    confirmLineup.classList.remove("btn-primary");

    confirmLineup.classList.add("btn-disabled");

    if (!dentroDoOrcamento) {
      definirMensagemConfirmacao("Sua escalação ultrapassou o orçamento.", "error");
    } else {
      definirMensagemConfirmacao(
        `Complete os ${totalJogadores} jogadores para confirmar.`,
      );
    }
  }
}
