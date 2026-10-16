
/* =========================
   JOGADOR — DETALHES
========================= */

const parametrosJogador = new URLSearchParams(
  window.location.search
);

const jogadorId = parametrosJogador.get("id");

const jogadorSelecionado = JOGADORES.find(
  function (jogador) {
    return jogador.id === jogadorId;
  }
);

function definirTexto(id, valor) {
  const elemento = document.getElementById(id);

  if (elemento) {
    elemento.textContent = valor;
  }
}

function carregarDetalhesJogador() {
  if (!jogadorSelecionado) {
    document.getElementById("playerDetails").innerHTML = `
      <div class="card">
        <h2>Jogador não encontrado</h2>
        <p>Selecione um jogador na lista para visualizar seus dados.</p>
        <a href="jogadores.html">Voltar para jogadores</a>
      </div>
    `;

    return;
  }

  const jogador = jogadorSelecionado;

  const iniciais = gerarIniciais(jogador.nome);

  document.title =
    `Racha Universitário | ${jogador.nome}`;

  // Dados principais

  definirTexto("playerName", jogador.nome);
  definirTexto("playerPosition", jogador.posicaoPrincipal);

  definirTexto(
    "playerValue",
    formatarMoeda(jogador.valor)
  );

  definirTexto(
    "playerPoints",
    formatarPontos(jogador.pontos) + " pts"
  );

  definirTexto(
    "playerLastPoints",
    formatarPontos(jogador.pontos) + " pts"
  );

  // Valorização

  const variacao = jogador.variacao;

  const variacaoFormatada =
    `${variacao > 0 ? "+" : variacao < 0 ? "-" : ""}` +
    formatarMoeda(Math.abs(variacao));

  definirTexto("playerVariation", variacaoFormatada);

  const elementoVariacao =
    document.getElementById("playerVariation");

  if (elementoVariacao) {
    elementoVariacao.classList.toggle(
      "positive",
      variacao > 0
    );

    elementoVariacao.classList.toggle(
      "negative",
      variacao < 0
    );
  }

  // Carta RU

  definirTexto("playerCardOverall", jogador.ovr);
  definirTexto("playerCardPosition", jogador.posicaoPrincipal);
  definirTexto("playerCardAvatar", iniciais);
  definirTexto("playerCardName", jogador.nome.toUpperCase());

  // ATENÇÃO — valores PROVISÓRIOS: ainda não foram definidas
  // estatísticas individuais, então ATA, DEF e HAB mostram 50 para
  // todos os jogadores. Quando JOGADORES passar a ter os campos
  // "ataque", "defesa" e "habilidade", eles substituem o valor padrão.
  // Substituir por dados reais na implementação final.

  const ATRIBUTO_PROVISORIO = 50;

  const ataque = jogador.ataque ?? ATRIBUTO_PROVISORIO;
  const defesa = jogador.defesa ?? ATRIBUTO_PROVISORIO;
  const habilidade = jogador.habilidade ?? ATRIBUTO_PROVISORIO;

  definirTexto("playerCardAttack", ataque);
  definirTexto("playerCardDefense", defesa);
  definirTexto("playerCardSkill", habilidade);

  definirTexto("playerAttackValue", ataque);
  definirTexto("playerDefenseValue", defesa);
  definirTexto("playerSkillValue", habilidade);

  document.getElementById("playerAttackBar").style.width =
    `${ataque}%`;

  document.getElementById("playerDefenseBar").style.width =
    `${defesa}%`;

  document.getElementById("playerSkillBar").style.width =
    `${habilidade}%`;
}

carregarDetalhesJogador();

