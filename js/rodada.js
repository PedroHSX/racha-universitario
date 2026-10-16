// ================================
// IDENTIFICAR RODADA PELA URL
// ================================

const parametrosRodada = new URLSearchParams(window.location.search);

const parametroNumeroRodada = parametrosRodada.get("rodada");

// Sem parâmetro: abre a rodada finalizada mais recente que tem resultados.
const rodadaPadrao = RODADAS.filter(function (rodada) {
  return rodada.resultadosDisponiveis;
}).reduce(function (maior, rodada) {
  return Math.max(maior, rodada.numero);
}, 0);

const numeroRodada =
  parametroNumeroRodada === null ? rodadaPadrao : Number(parametroNumeroRodada);

// ================================
// BUSCAR DADOS DA RODADA
// ================================

const rodadaSelecionada = RODADAS.find(function (rodada) {
  return rodada.numero === numeroRodada;
});

// Pontuação, escalação e ranking só existem para rodadas finalizadas
// com resultados. Rodada inexistente, aberta ou sem resultados mostra
// uma mensagem (ver aplicarEstadoRodada).
const rodadaDisponivel = Boolean(
  rodadaSelecionada &&
    !rodadaSelecionada.atual &&
    rodadaSelecionada.resultadosDisponiveis,
);

// ================================
// ELEMENTOS DA PÁGINA
// ================================

const roundDetailTitle =
  document.getElementById(
    "round-detail-title"
  );

const roundDetailStatus =
  document.getElementById(
    "round-detail-status"
  );

const roundDetailDate =
  document.getElementById(
    "round-detail-date"
  );

const roundDetailScore =
  document.getElementById(
    "round-detail-score"
  );

const roundDetailDescription =
  document.getElementById(
    "round-detail-description"
  );

const roundDetailPosition =
  document.getElementById(
    "round-detail-position"
  );

const roundDetailScoreSecondary =
  document.getElementById(
    "round-detail-score-secondary"
  );

const roundDetailGeneralRanking =
  document.getElementById(
    "round-detail-general-ranking"
  );


// ================================
// RODADA SEM RESULTADOS PARA EXIBIR
// ================================

function aplicarEstadoRodada() {
  if (rodadaDisponivel) {
    return;
  }

  const mensagem = document.getElementById("roundStatusMessage");
  const mensagemTitulo = document.getElementById("roundStatusTitle");
  const mensagemTexto = document.getElementById("roundStatusText");
  const mensagemLink = document.getElementById("roundStatusLink");

  let titulo = "Rodada não encontrada";
  let texto =
    "A rodada solicitada não existe. Confira a lista de rodadas disponíveis.";

  if (!rodadaSelecionada) {
    roundDetailTitle.textContent = "Rodada não encontrada";
    roundDetailStatus.hidden = true;
    roundDetailDate.textContent = "";
  } else {
    const numeroFormatado = String(rodadaSelecionada.numero).padStart(2, "0");

    roundDetailTitle.textContent = `Rodada ${numeroFormatado}`;
    roundDetailStatus.textContent = rodadaSelecionada.status;
    roundDetailDate.textContent = rodadaSelecionada.data;

    if (rodadaSelecionada.atual) {
      roundDetailStatus.classList.replace("finished", "open");

      titulo = "Rodada em andamento";
      texto =
        "Esta rodada ainda está aberta. Os resultados serão divulgados após o encerramento.";

      mensagemLink.href = "escalar.html";
      mensagemLink.textContent = "Ir para a escalação";
    } else {
      titulo = "Resultados indisponíveis";
      texto = "Os resultados desta rodada não estão disponíveis.";
    }
  }

  mensagemTitulo.textContent = titulo;
  mensagemTexto.textContent = texto;
  mensagem.hidden = false;

  document
    .querySelectorAll(
      ".round-result-main, .round-lineup-section, .round-highlights-section, .round-ranking-preview",
    )
    .forEach(function (secao) {
      secao.hidden = true;
    });
}

aplicarEstadoRodada();

// ================================
// EXIBIR DADOS DA RODADA
// ================================

function carregarDetalhesRodada() {

  if (!rodadaDisponivel) {
    return;
  }


  const numeroFormatado =
    String(
      rodadaSelecionada.numero
    ).padStart(2, "0");


  const pontosFormatados =
    formatarPontos(
      rodadaSelecionada.pontos
    );


  // Cabeçalho

  roundDetailTitle.textContent =
    `Rodada ${numeroFormatado}`;

  roundDetailStatus.textContent =
    rodadaSelecionada.status;

  roundDetailDate.textContent =
    `${rodadaSelecionada.data} • Resultado da sua escalação`;


  // Pontuação principal

  roundDetailScore.textContent =
    pontosFormatados;

  roundDetailDescription.textContent =
    `Resultado final da sua escalação na Rodada ${numeroFormatado}.`;


  // Resumo

  roundDetailPosition.textContent =
    `${rodadaSelecionada.posicao}º`;

  roundDetailScoreSecondary.textContent =
    `${pontosFormatados} pts`;


  // Ainda será integrado ao ranking

  roundDetailGeneralRanking.textContent =
    "-";

    const roundRankingTitle =
  document.getElementById(
    "roundRankingTitle"
  );

if (roundRankingTitle) {
  roundRankingTitle.textContent =
    `Ranking da Rodada ${numeroFormatado}`;
}

}



// ================================
// INICIAR
// ================================

carregarDetalhesRodada();

// ================================
// ESCALAÇÃO DA RODADA
// ================================

const roundLineupContainer =
  document.getElementById(
    "round-lineup-container"
  );

const roundPlayerCount =
  document.getElementById(
    "round-player-count"
  );


function criarJogadorRodada(item) {

  const jogador =
    JOGADORES.find(
      function (jogador) {
        return jogador.id === item.jogadorId;
      }
    );


  if (!jogador) {
    return "";
  }


  const primeiroNome =
    jogador.nome.split(" ")[0];


  const pontos = formatarPontos(item.pontos);


  return `
    <a
      href="jogador.html?id=${jogador.id}"
      class="result-player"
    >

      <div class="player-avatar">
        ${gerarIniciais(jogador.nome)}
      </div>

      <strong>
        ${primeiroNome}
      </strong>

      <span>
        ${item.posicao}
      </span>

      <div class="player-round-points">
        ${pontos} pts
      </div>

    </a>
  `;
}


function criarLinhaRodada(
  posicao,
  classeExtra = ""
) {

  const jogadoresPosicao =
    rodadaSelecionada.escalacao.filter(
      function (item) {
        return item.posicao === posicao;
      }
    );


  if (
    jogadoresPosicao.length === 0
  ) {
    return "";
  }


  const jogadoresHTML =
    jogadoresPosicao
      .map(criarJogadorRodada)
      .join("");


  return `
    <div class="formation-row ${classeExtra}">
      ${jogadoresHTML}
    </div>
  `;
}


function carregarEscalacaoRodada() {

  if (
    !rodadaDisponivel ||
    !rodadaSelecionada.escalacao
  ) {
    return;
  }


  roundLineupContainer.innerHTML = `

    ${criarLinhaRodada(
      "GOL",
      "goalkeeper"
    )}

    ${criarLinhaRodada("DEF")}

    ${criarLinhaRodada("MEI")}

    ${criarLinhaRodada("ATA")}

  `;


  roundPlayerCount.textContent =
    `${rodadaSelecionada.escalacao.length} / ${CONFIG.escalacao.totalJogadores} jogadores`;
}

// ================================
// MELHOR JOGADOR DA ESCALAÇÃO
// ================================

function obterMelhorJogadorRodada() {

  if (
    !rodadaDisponivel ||
    !rodadaSelecionada.escalacao ||
    rodadaSelecionada.escalacao.length === 0
  ) {
    return null;
  }


  return rodadaSelecionada.escalacao.reduce(
    function (melhor, atual) {

      if (atual.pontos > melhor.pontos) {
        return atual;
      }

      return melhor;
    }
  );
}

// ================================
// RESUMO DA RODADA
// ================================

function carregarResumoRodada() {

  if (
    !rodadaDisponivel ||
    !rodadaSelecionada.escalacao
  ) {
    return;
  }


  const melhorEscalado =
    obterMelhorJogadorRodada();


  if (!melhorEscalado) {
    return;
  }


  const jogador =
    JOGADORES.find(
      function (jogador) {
        return (
          jogador.id ===
          melhorEscalado.jogadorId
        );
      }
    );


  if (!jogador) {
    return;
  }


  const numeroFormatado =
    String(
      rodadaSelecionada.numero
    ).padStart(2, "0");


  const pontosFormatados =
    formatarPontos(
      rodadaSelecionada.pontos
    );


  const melhorPontuacao =
    formatarPontos(
      melhorEscalado.pontos
    );


  document.getElementById(
    "summary-round-title"
  ).textContent =
    `Rodada ${numeroFormatado}`;


  document.getElementById(
    "summary-player-count"
  ).textContent =
    `${rodadaSelecionada.escalacao.length} / ${CONFIG.escalacao.totalJogadores}`;


  document.getElementById(
    "summary-score"
  ).textContent =
    `${pontosFormatados} pts`;


  document.getElementById(
    "summary-position"
  ).textContent =
    `${rodadaSelecionada.posicao}º`;


  document.getElementById(
    "summary-best-avatar"
  ).textContent =
    gerarIniciais(jogador.nome);


  document.getElementById(
    "summary-best-name"
  ).textContent =
    jogador.nome;


  document.getElementById(
    "summary-best-position"
  ).textContent =
    melhorEscalado.posicao;


  document.getElementById(
    "summary-best-score"
  ).textContent =
    `${melhorPontuacao} pts`;
}


carregarEscalacaoRodada();

carregarResumoRodada();

// ================================
// DESTAQUES DA RODADA
// ================================

function carregarDestaquesRodada() {
  const highlightsGrid =
    document.getElementById(
      "roundHighlightsGrid"
    );

  const highlightsDescription =
    document.getElementById(
      "roundHighlightsDescription"
    );

  if (
    !highlightsGrid ||
    !rodadaDisponivel ||
    !rodadaSelecionada.escalacao
  ) {
    return;
  }

  const numeroFormatado =
    String(rodadaSelecionada.numero)
      .padStart(2, "0");

  if (highlightsDescription) {
    highlightsDescription.textContent =
      `Jogadores que se destacaram na Rodada ${numeroFormatado}.`;
  }

  const destaques =
    [...rodadaSelecionada.escalacao]
      .sort(function (a, b) {
        return b.pontos - a.pontos;
      })
      .slice(0, 3);

  highlightsGrid.innerHTML = "";

  destaques.forEach(
    function (item, index) {
      const jogador =
        JOGADORES.find(
          function (jogador) {
            return jogador.id === item.jogadorId;
          }
        );

      if (!jogador) {
        return;
      }

      const pontos =
        formatarPontos(item.pontos);

      let titulo = "BOM DESEMPENHO";
      let icone = "↑";

      if (index === 0) {
        titulo = "MAIOR PONTUAÇÃO";
        icone = "★";
      } else if (index === 1) {
        titulo = "DESTAQUE";
      }

      const card =
        document.createElement("article");

      card.className =
        "round-highlight-box";

      card.innerHTML = `
        <div class="highlight-icon ${
          index === 0
            ? ""
            : "red-highlight"
        }">
          ${icone}
        </div>

        <span class="eyebrow">
          ${titulo}
        </span>

        <div class="round-highlight-player">

          <div class="player-avatar">
            ${gerarIniciais(jogador.nome)}
          </div>

          <div>
            <h3>${jogador.nome}</h3>

            <span>
              ${item.posicao} • ${jogador.ovr} OVR
            </span>
          </div>

        </div>

        <strong class="highlight-score">
          ${pontos} pts
        </strong>
      `;

      highlightsGrid.appendChild(card);
    }
  );
}

carregarDestaquesRodada();

// ================================
// RANKING DA RODADA
// ================================

// Mostra 5 posições ao redor da conta atual. Rodada sem ranking
// cadastrado exibe aviso; nunca reaproveita o ranking de outra rodada.

function carregarRankingRodada() {
  const lista = document.getElementById("roundRankingList");

  if (!lista || !rodadaDisponivel) {
    return;
  }

  const ranking = obterRankingDaRodada(rodadaSelecionada.numero);

  lista.innerHTML = "";

  if (!ranking) {
    const aviso = document.createElement("p");

    aviso.className = "ranking-unavailable";
    aviso.textContent = "Ranking indisponível para esta rodada.";

    lista.appendChild(aviso);

    return;
  }

  const indiceUsuario = ranking.findIndex(function (item) {
    return item.usuario;
  });

  const tamanhoJanela = 5;

  const inicio =
    indiceUsuario >= 0
      ? Math.min(
          Math.max(indiceUsuario - 2, 0),
          Math.max(ranking.length - tamanhoJanela, 0),
        )
      : 0;

  ranking
    .slice(inicio, inicio + tamanhoJanela)
    .forEach(function (item, deslocamento) {
      const linha = document.createElement("div");

      linha.className = "round-ranking-row" + (item.usuario ? " current-user" : "");

      const posicao = document.createElement("strong");
      posicao.textContent = `${inicio + deslocamento + 1}º`;

      const avatar = document.createElement("div");
      avatar.className = "ranking-user-avatar";
      avatar.textContent = gerarIniciais(item.nome);

      const nome = document.createElement("span");
      nome.textContent = item.usuario ? `${item.nome} • Você` : item.nome;

      const pontos = document.createElement("strong");
      pontos.textContent = `${formatarPontos(item.pontos)} pts`;

      linha.append(posicao, avatar, nome, pontos);
      lista.appendChild(linha);
    });
}

carregarRankingRodada();
