// ================================
// DADOS DA ESCALAÇÃO
// ================================

const jogadoresEscaladosRodada = lerJSON(CHAVES.escalacao, []);


// ================================
// ELEMENTOS DA PÁGINA
// ================================

const roundLineupCount =
  document.getElementById(
    "round-lineup-count"
  );

const roundBudgetAvailable =
  document.getElementById(
    "round-budget-available"
  );

const roundLineupTitle =
  document.getElementById(
    "round-lineup-title"
  );

const roundLineupMessage =
  document.getElementById(
    "round-lineup-message"
  );

const roundLineupButton =
  document.getElementById(
    "round-lineup-button"
  );


// ================================
// ATUALIZAR RODADA ATUAL
// ================================

function atualizarRodadaAtual() {

  const totalJogadores =
    CONFIG.escalacao.totalJogadores;

  const quantidadeEscalada =
    jogadoresEscaladosRodada.length;

  const valorUtilizado =
    calcularValorEscalacao(idsDaEscalacao(jogadoresEscaladosRodada));

  const valorDisponivel =
    CONFIG.moeda.orcamentoInicial -
    valorUtilizado;


  // Quantidade de jogadores

  roundLineupCount.textContent =
    `${quantidadeEscalada} / ${totalJogadores}`;


  // Orçamento

  roundBudgetAvailable.textContent =
    formatarMoeda(
      valorDisponivel
    );


  // =========================
  // ESCALAÇÃO CONFIRMADA
  // =========================

  // Mesmo critério de confirmação usado na Home e em Escalar
  if (confirmacaoEstaValida()) {

    roundLineupTitle.textContent =
      "Escalação confirmada";

    roundLineupMessage.textContent =
      "Sua escalação está confirmada para esta rodada.";

    roundLineupButton.textContent =
      "VER ESCALAÇÃO";

    return;
  }


  // =========================
  // ESCALAÇÃO COMPLETA
  // =========================

  if (
    quantidadeEscalada ===
    totalJogadores
  ) {

    roundLineupTitle.textContent =
      "Confirme sua escalação";

    roundLineupMessage.textContent =
      "Os 7 jogadores foram escolhidos. Falta confirmar sua escalação.";

    roundLineupButton.textContent =
      "CONFIRMAR ESCALAÇÃO";

    return;
  }


  // =========================
  // ESCALAÇÃO INCOMPLETA
  // =========================

  const faltam =
    totalJogadores -
    quantidadeEscalada;

  roundLineupTitle.textContent =
    "Prepare sua escalação";

  roundLineupMessage.textContent =
    faltam === 1
      ? "Falta 1 jogador para completar sua escalação."
      : `Faltam ${faltam} jogadores para completar sua escalação.`;

  roundLineupButton.textContent =
    quantidadeEscalada === 0
      ? "MONTAR ESCALAÇÃO"
      : "CONTINUAR ESCALAÇÃO";
}


// ================================
// INICIAR
// ================================

atualizarRodadaAtual();

// ================================
// HISTÓRICO DE RODADAS
// ================================

const roundsHistoryList =
  document.getElementById(
    "rounds-history-list"
  );


function criarCardRodada(rodada) {

  const card =
    document.createElement("article");

  card.classList.add(
    "round-history-card"
  );


  let botaoResultado;


  if (rodada.resultadosDisponiveis) {

    botaoResultado = `
      <button
        class="round-details-button"
        onclick="abrirDetalhesRodada(${rodada.numero})"
      >
        VER RESULTADOS
      </button>
    `;

  } else {

    botaoResultado = `
      <button
        class="round-details-button"
        disabled
      >
        RESULTADOS INDISPONÍVEIS
      </button>
    `;

  }


  card.innerHTML = `
    <div class="round-history-header">

      <div>
        <span class="eyebrow">
          RODADA
        </span>

        <h3>
          Rodada ${String(rodada.numero).padStart(2, "0")}
        </h3>
      </div>

      <span class="status finished">
        ${rodada.status}
      </span>

    </div>


    <span class="round-date">
      ${rodada.data}
    </span>


    <div class="round-result">

      <div>
        <strong>
          ${formatarPontos(rodada.pontos)}
        </strong>

        <span>pontos</span>
      </div>


      <div>
        <strong>
          ${rodada.posicao}º
        </strong>

        <span>posição</span>
      </div>

    </div>


    ${botaoResultado}
  `;


  return card;
}


function carregarHistoricoRodadas() {

  if (!roundsHistoryList) {
    return;
  }


  roundsHistoryList.innerHTML = "";


  const rodadasFinalizadas =
    RODADAS.filter(
      function (rodada) {
        return !rodada.atual;
      }
    );


  rodadasFinalizadas.forEach(
    function (rodada) {

      const card =
        criarCardRodada(rodada);

      roundsHistoryList.appendChild(
        card
      );

    }
  );

}


carregarHistoricoRodadas();

// ================================
// ABRIR DETALHES DA RODADA
// ================================

function abrirDetalhesRodada(numeroRodada) {
  window.location.href =
    `rodada.html?rodada=${numeroRodada}`;
}