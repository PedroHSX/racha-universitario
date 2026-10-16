/* =========================
   UTILITÁRIOS COMPARTILHADOS
========================= */

/* Chaves do localStorage.
   "fantasyUpeUser" mantém o nome antigo por compatibilidade com o
   protótipo já em uso; ele NÃO é o nome do aplicativo. */

const CHAVES = {
  usuario: "fantasyUpeUser",
  escalacao: "ruEscalacao",
  confirmada: "ruEscalacaoConfirmada",
  formacao: "ruFormacao",
  sessao: "ruSessao",
  notificacoes: "ruNotificationSettings",
};

/* Leitura segura do localStorage: dado inexistente ou corrompido
   devolve o valor padrão em vez de quebrar a página. */

function lerJSON(chave, padrao = null) {
  try {
    const bruto = localStorage.getItem(chave);

    return bruto === null ? padrao : JSON.parse(bruto);
  } catch (erro) {
    console.error("Dados inválidos em " + chave + ":", erro);

    return padrao;
  }
}

/* Evita que texto digitado pelo usuário vire HTML ao usar innerHTML. */

function escaparHTML(texto) {
  return String(texto).replace(/[&<>"']/g, function (caractere) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[caractere];
  });
}

/* =========================
   FORMATAÇÃO
========================= */

/* Número com vírgula decimal (ex.: 12,5) */

function formatarDecimal(valor, casas) {
  return valor.toFixed(casas).replace(".", ",");
}

/* Valores em RUCoin usam 2 casas e pontuações usam 1 */

function formatarNumero(numero) {
  return formatarDecimal(numero, 2);
}

function formatarPontos(numero) {
  return formatarDecimal(numero, 1);
}

/* Valor com o símbolo da moeda (ex.: RU$ 10,80) */

function formatarMoeda(valor) {
  return CONFIG.moeda.simbolo + " " + formatarNumero(Number(valor));
}

/* Até duas iniciais, das duas primeiras palavras do nome */

function gerarIniciais(nome) {
  return nome
    .split(" ")
    .filter(function (palavra) {
      return palavra.length > 0;
    })
    .map(function (palavra) {
      return palavra[0];
    })
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

/* =========================
   ORÇAMENTO
========================= */

/* A escalação salva é uma lista de { jogadorId, posicaoEscalada, slot } */

function idsDaEscalacao(escalacao) {
  return escalacao.map(function (item) {
    return item.jogadorId;
  });
}

function calcularValorEscalacao(idsJogadores) {
  return idsJogadores.reduce(function (total, id) {
    if (!id) {
      return total;
    }

    const jogador = JOGADORES.find(function (item) {
      return item.id === id;
    });

    if (!jogador) {
      return total;
    }

    return total + jogador.valor;
  }, 0);
}

function calcularSaldo(idsJogadores) {
  const utilizado = calcularValorEscalacao(idsJogadores);

  return CONFIG.moeda.orcamentoInicial - utilizado;
}

/* =========================
   CAMPO DE FUTEBOL
   (compartilhado por Home e Escalar)

   Cada página cria o próprio slot preenchido; a vaga vazia, a linha e
   a ordem das linhas (ATA, MEI, DEF, GOL) são iguais nas duas.
========================= */

function criarVagaVazia(posicao, slotId) {
  const slot = document.createElement("a");

  slot.href = `jogadores.html?posicao=${posicao}&slot=${slotId}`;

  slot.classList.add("player-slot", "empty");

  slot.innerHTML = `
    <div class="player-avatar">+</div>

    <strong>Adicionar</strong>

    <span>${posicao}</span>
  `;

  return slot;
}

function criarLinhaFormacao(posicao, quantidade, criarVaga) {
  const linha = document.createElement("div");

  linha.classList.add("formation-row");

  for (let i = 0; i < quantidade; i++) {
    linha.appendChild(criarVaga(posicao, i));
  }

  return linha;
}

function montarCampoFormacao(container, nomeFormacao, criarVaga) {
  const formacao = CONFIG.escalacao.formacoes[nomeFormacao];

  container.innerHTML = "";

  [
    ["ATA", formacao.ATA],
    ["MEI", formacao.MEI],
    ["DEF", formacao.DEF],
    ["GOL", CONFIG.escalacao.goleiros],
  ].forEach(function (linhaFormacao) {
    const linha = criarLinhaFormacao(
      linhaFormacao[0],
      linhaFormacao[1],
      criarVaga,
    );

    if (linhaFormacao[0] === "GOL") {
      linha.classList.add("goalkeeper");
    }

    container.appendChild(linha);
  });
}

/* =========================
   SESSÃO DEMONSTRATIVA

   ATENÇÃO: isto NÃO é autenticação segura. O protótipo não guarda
   senha e não tem servidor: a "sessão" é só uma flag em
   sessionStorage que impede abrir as telas internas sem passar pelo
   login. Qualquer pessoa com acesso ao navegador pode alterá-la.
   Encerrar a sessão remove apenas a flag; conta, escalação e
   formação continuam salvas.
========================= */

const PAGINAS_PROTEGIDAS = [
  "home.html",
  "escalar.html",
  "jogadores.html",
  "jogador.html",
  "rodadas.html",
  "rodada.html",
  "ranking.html",
  "perfil.html",
  "configuracoes.html",
];

function sessaoAtiva() {
  try {
    return sessionStorage.getItem(CHAVES.sessao) === "ativa";
  } catch (erro) {
    return false;
  }
}

function iniciarSessao() {
  sessionStorage.setItem(CHAVES.sessao, "ativa");
}

function encerrarSessao() {
  sessionStorage.removeItem(CHAVES.sessao);
}

const paginaAtual = window.location.pathname.split("/").pop() || "index.html";

if (
  PAGINAS_PROTEGIDAS.includes(paginaAtual) &&
  (!sessaoAtiva() || !lerJSON(CHAVES.usuario))
) {
  window.location.replace("index.html?aviso=login");
}

/* =========================
   ESCALAÇÃO CONFIRMADA

   Regra única usada por Home, Escalar e Rodadas: a confirmação só
   vale enquanto a escalação e a formação atuais forem iguais às
   que foram confirmadas (a ordem dos itens não importa).
========================= */

function obterFormacaoAtual() {
  const salva = localStorage.getItem(CHAVES.formacao);

  return CONFIG.escalacao.formacoes[salva]
    ? salva
    : CONFIG.escalacao.formacaoPadrao;
}

function assinaturaEscalacao(lista) {
  return lista
    .map(function (item) {
      return item.slot + ":" + item.jogadorId;
    })
    .sort()
    .join("|");
}

function confirmacaoEstaValida() {
  const confirmada = lerJSON(CHAVES.confirmada);

  if (!confirmada || confirmada.confirmada !== true) {
    return false;
  }

  if (confirmada.formacao !== obterFormacaoAtual()) {
    return false;
  }

  return (
    assinaturaEscalacao(confirmada.jogadores || []) ===
    assinaturaEscalacao(lerJSON(CHAVES.escalacao, []))
  );
}

/* Chamada depois de qualquer alteração na escalação: se a
   confirmação deixou de valer, ela é removida. */

function sincronizarConfirmacao() {
  if (!confirmacaoEstaValida()) {
    localStorage.removeItem(CHAVES.confirmada);
  }
}

/* =========================
   VALIDAÇÕES (Cadastro e Configurações)

   Cada função devolve a mensagem de erro, ou "" se o valor é válido.
   Limites de altura e peso ficam em um só lugar para facilitar ajuste.
========================= */

const REGRAS_VALIDACAO = {
  nomeMinimo: 3,
  usernameMinimo: 3,
  alturaMinima: 1.4,
  alturaMaxima: 2.2,
  pesoMinimo: 40,
  pesoMaximo: 150,
};

function numeroDoCampo(valor) {
  const texto = String(valor).trim().replace(",", ".");

  return texto === "" ? NaN : Number(texto);
}

function validarNome(valor) {
  if (String(valor).trim().length < REGRAS_VALIDACAO.nomeMinimo) {
    return "Informe seu nome completo.";
  }

  return "";
}

function validarUsername(valor) {
  const username = String(valor).trim();

  if (username.length < REGRAS_VALIDACAO.usernameMinimo) {
    return "O nome de usuário deve ter pelo menos 3 caracteres.";
  }

  if (!/^[a-zA-Z0-9._]+$/.test(username)) {
    return "Use apenas letras, números, ponto ou underline.";
  }

  return "";
}

function validarEmail(valor) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).trim())) {
    return "Informe um e-mail válido.";
  }

  return "";
}

function validarAltura(valor) {
  const altura = numeroDoCampo(valor);

  if (String(valor).trim() === "") {
    return "Informe sua altura.";
  }

  if (
    !Number.isFinite(altura) ||
    altura < REGRAS_VALIDACAO.alturaMinima ||
    altura > REGRAS_VALIDACAO.alturaMaxima
  ) {
    return "Informe uma altura entre 1,40 m e 2,20 m (ex.: 1,75).";
  }

  return "";
}

function validarPeso(valor) {
  const peso = numeroDoCampo(valor);

  if (String(valor).trim() === "") {
    return "Informe seu peso.";
  }

  if (
    !Number.isFinite(peso) ||
    peso < REGRAS_VALIDACAO.pesoMinimo ||
    peso > REGRAS_VALIDACAO.pesoMaximo
  ) {
    return "Informe um peso entre 40 kg e 150 kg.";
  }

  return "";
}

/* =========================
   LOGIN
========================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("senha");
  const loginErrorMessage = document.getElementById("loginErrorMessage");

  /* Veio de uma página interna sem sessão ativa */

  if (new URLSearchParams(window.location.search).get("aviso") === "login") {
    loginErrorMessage.textContent = "Faça login para acessar essa página.";
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const savedUser = lerJSON(CHAVES.usuario);

    loginErrorMessage.textContent = "";

    /* Nenhum usuário cadastrado */

    if (!savedUser) {
      loginErrorMessage.textContent =
        "Nenhuma conta cadastrada. Crie uma conta primeiro.";

      return;
    }

    /* E-mail diferente do cadastrado */

    if (
      emailInput.value.trim().toLowerCase() !==
      String(savedUser.email || "").toLowerCase()
    ) {
      loginErrorMessage.textContent = "E-mail não encontrado.";

      return;
    }

    /* Validação mínima da senha para o protótipo.
       A senha NÃO é guardada nem conferida: isto é só uma simulação. */

    if (passwordInput.value.length < 8) {
      loginErrorMessage.textContent =
        "A senha deve possuir pelo menos 8 caracteres.";

      return;
    }

    /* Login aceito: abre a sessão demonstrativa (apenas uma flag).
       Conta e escalação salvas não são tocadas. */

    iniciarSessao();

    window.location.href = "home.html";
  });
}

/* =========================
   LISTA DE JOGADORES
========================= */

const playersList = document.getElementById("playersList");

const parametrosJogadores = new URLSearchParams(window.location.search);

const posicaoEscalacao = parametrosJogadores.get("posicao");

const slotEscalacao = parametrosJogadores.get("slot");

const modoEscalacao = posicaoEscalacao !== null && slotEscalacao !== null;

const searchInput = document.getElementById("playerSearch");

const filterButtons = document.querySelectorAll(".filter");

let filtroAtual = "TODOS";

function escalarJogador(jogadorId) {
  if (!modoEscalacao) {
    return;
  }

  let escalacao = lerJSON(CHAVES.escalacao, []);

  // Impede jogador duplicado
  const jogadorJaEscalado = escalacao.some(function (item) {
    return item.jogadorId === jogadorId;
  });

  if (jogadorJaEscalado) {
    alert("Este jogador já está na sua escalação.");

    return;
  }

  // Remove o jogador que ocupava esta vaga
  escalacao = escalacao.filter(function (item) {
    return item.slot !== slotEscalacao;
  });

  // Coloca o novo jogador
  escalacao.push({
    jogadorId: jogadorId,
    posicaoEscalada: posicaoEscalacao,
    slot: slotEscalacao,
  });

  // Salva a escalação
  localStorage.setItem(CHAVES.escalacao, JSON.stringify(escalacao));

  // Adicionar ou trocar jogador invalida a confirmação anterior
  sincronizarConfirmacao();

  // Volta para o campo
  window.location.href = "escalar.html";
}

function renderizarJogadores() {
  if (!playersList) {
    return;
  }

  const pesquisa = searchInput ? searchInput.value.toLowerCase() : "";

  const jogadoresFiltrados = JOGADORES.filter(function (jogador) {
    const correspondeNome = jogador.nome.toLowerCase().includes(pesquisa);

    const correspondePosicao =
      filtroAtual === "TODOS" || jogador.posicoes.includes(filtroAtual);

    return correspondeNome && correspondePosicao;
  });

  if (jogadoresFiltrados.length === 0) {
    playersList.innerHTML = `
            <div
                style="
                    padding: 40px;
                    text-align: center;
                "
            >
                <strong>
                    Nenhum jogador encontrado.
                </strong>
            </div>
        `;

    return;
  }

  playersList.innerHTML = jogadoresFiltrados
    .map(function (jogador) {
      let classeVariacao = "";
      let simbolo = "—";

      if (jogador.variacao > 0) {
        classeVariacao = "positive";

        simbolo = "▲";
      } else if (jogador.variacao < 0) {
        classeVariacao = "negative";

        simbolo = "▼";
      }

      const iniciais = gerarIniciais(jogador.nome);

      const destinoJogador = `jogador.html?id=${jogador.id}`;

      return `
                    <a
                        href="${destinoJogador}"
                        class="player-row"

                    >

                        <div class="player-name">

                            <div class="player-avatar">
                                ${iniciais}
                            </div>

                            <strong>
                                ${jogador.nome}
                            </strong>

                        </div>

                        <span class="position">
                            ${jogador.posicoes.join(" / ")}
                        </span>

                        <strong>
                            ${jogador.ovr} OVR
                        </strong>

                        <span>
                            ${formatarPontos(jogador.pontos)} pts
                        </span>

                        <span>
                            ${formatarMoeda(jogador.valor)}
                        </span>

                        <span class="${classeVariacao}">
                            ${simbolo}
                            ${formatarMoeda(Math.abs(jogador.variacao))}
                        </span>

                        ${
                          modoEscalacao
                            ? `
            <button
                type="button"
                class="btn-escalar-jogador"
                onclick="
                    event.preventDefault();
                    event.stopPropagation();
                    escalarJogador('${jogador.id}');
                "
            >
                ESCALAR
            </button>
        `
                            : `
            <span class="player-arrow">
                →
            </span>
        `
                        }

                    </a>
                `;
    })
    .join("");
}

if (playersList) {
  const featuredSection = document.getElementById("featuredSection");

  // Veio da tela Escalar
  if (modoEscalacao) {
    // Esconde os Destaques
    if (featuredSection) {
      featuredSection.style.display = "none";
    }

    // Seleciona automaticamente
    // a posição da vaga clicada
    filtroAtual = posicaoEscalacao;

    filterButtons.forEach(function (botao) {
      botao.classList.remove("active");

      if (botao.dataset.position === posicaoEscalacao) {
        botao.classList.add("active");
      }
    });
  }

  // Mostra a lista
  renderizarJogadores();

  // Busca
  if (searchInput) {
    searchInput.addEventListener("input", renderizarJogadores);
  }

  // Filtros
  filterButtons.forEach(function (botao) {
    botao.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.classList.remove("active");
      });

      botao.classList.add("active");

      filtroAtual = botao.dataset.position;

      renderizarJogadores();
    });
  });
}

/* =========================
   RANKING
========================= */

const usuarioRankingSalvo = lerJSON(CHAVES.usuario);

const nomeUsuarioRanking =
  usuarioRankingSalvo?.name || "Usuário";

const rankingGeral = [
  { nome: "Rafael", pontos: 361.8 },
  { nome: "Mariana", pontos: 354.2 },
  { nome: "Bruno", pontos: 346.7 },
  { nome: "Lucas", pontos: 338.9 },
  { nome: "Gabriel", pontos: 331.5 },
  { nome: nomeUsuarioRanking, pontos: 327.4, usuario: true },
  { nome: "Felipe", pontos: 320.8 },
  { nome: "Thiago", pontos: 316.3 },
  { nome: "Daniel", pontos: 309.7 },
  { nome: "Gustavo", pontos: 301.4 },
];

/* O ranking de cada rodada fica em RODADAS (js/rodadas-data.js).
   A entrada marcada com "usuario: true" recebe o nome da conta atual.
   Rodada sem ranking cadastrado devolve null. */

function obterRankingDaRodada(numero) {
  if (typeof RODADAS === "undefined") {
    return null;
  }

  const rodada = RODADAS.find(function (item) {
    return item.numero === numero;
  });

  if (!rodada || !Array.isArray(rodada.ranking) || rodada.ranking.length === 0) {
    return null;
  }

  return rodada.ranking.map(function (item) {
    return item.usuario ? { ...item, nome: nomeUsuarioRanking } : item;
  });
}

/* Rodada mais recente que possui ranking cadastrado */

const rodadaDoRanking =
  typeof RODADAS === "undefined"
    ? null
    : RODADAS.filter(function (item) {
        return Array.isArray(item.ranking) && item.ranking.length > 0;
      }).sort(function (a, b) {
        return b.numero - a.numero;
      })[0] || null;

const numeroRodadaRanking = rodadaDoRanking
  ? String(rodadaDoRanking.numero).padStart(2, "0")
  : "";

const rankingRodada = rodadaDoRanking
  ? obterRankingDaRodada(rodadaDoRanking.numero)
  : [];

const rankingList = document.getElementById("rankingList");
const rankingTabs = document.querySelectorAll(".ranking-tab");

function atualizarPodio(ranking) {
  const primeiro = ranking[0];
  const segundo = ranking[1];
  const terceiro = ranking[2];

  document.getElementById("firstName").textContent = primeiro.nome;
  document.getElementById("firstPoints").textContent =
    formatarPontos(primeiro.pontos) + " pts";

  document.getElementById("secondName").textContent = segundo.nome;
  document.getElementById("secondPoints").textContent =
    formatarPontos(segundo.pontos) + " pts";

  document.getElementById("thirdName").textContent = terceiro.nome;
  document.getElementById("thirdPoints").textContent =
    formatarPontos(terceiro.pontos) + " pts";
}

function renderizarRanking(tipo = "geral") {
  if (!rankingList) {
    return;
  }

  const ranking =
    tipo === "geral" ? rankingGeral : rankingRodada;

  if (ranking.length === 0) {
    rankingList.innerHTML =
      '<p class="ranking-unavailable">Ranking indisponível.</p>';

    return;
  }

  atualizarPodio(ranking);

  rankingList.innerHTML = ranking
    .map(function (usuario, index) {
      const posicao = index + 1;
      const classeUsuario =
        usuario.usuario ? "current-user" : "";

      return `
        <div class="ranking-row ${classeUsuario}">

          <span class="ranking-position">
            ${posicao}º
          </span>

          <div class="ranking-user">

            <div class="ranking-user-avatar">
              ${escaparHTML(gerarIniciais(usuario.nome))}
            </div>

            <div>
              <strong>
                ${escaparHTML(usuario.nome)}
                ${usuario.usuario ? " • Você" : ""}
              </strong>

              <small>
                Racha Universitário
              </small>
            </div>

          </div>

          <strong class="ranking-score">
            ${formatarPontos(usuario.pontos)} pts
          </strong>

        </div>
      `;
    })
    .join("");

  const usuarioAtual = ranking.find(function (usuario) {
    return usuario.usuario;
  });

  const posicaoUsuario =
    ranking.findIndex(function (usuario) {
      return usuario.usuario;
    }) + 1;

  if (usuarioAtual) {
    document.getElementById("myPosition").textContent =
      posicaoUsuario + "º lugar";

    document.getElementById("myScore").textContent =
      formatarPontos(usuarioAtual.pontos);
  }

  document.getElementById("myScoreLabel").textContent =
    tipo === "geral"
      ? "pontos no geral"
      : "pontos na Rodada " + numeroRodadaRanking;

  document.getElementById("rankingDescription").textContent =
    tipo === "geral"
      ? "Pontuação acumulada nas rodadas finalizadas."
      : "Classificação da Rodada " + numeroRodadaRanking + ".";
}

rankingTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    rankingTabs.forEach(function (botao) {
      botao.classList.remove("active");
    });

    tab.classList.add("active");

    renderizarRanking(tab.dataset.ranking);
  });
});

if (rankingList) {
  renderizarRanking("geral");
}
/* =========================
   HOME
========================= */

const homeGreeting = document.getElementById("homeGreeting");

if (homeGreeting) {
  const savedUser = lerJSON(CHAVES.usuario);

  /* USUÁRIO (o cabeçalho é atualizado por atualizarCabecalhoUsuario) */

  if (savedUser) {
    const firstName = savedUser.name.split(" ")[0];

    homeGreeting.textContent = "Olá, " + firstName + "!";
  }

  /* ESCALAÇÃO */

  const lineup = lerJSON(CHAVES.escalacao, []);

  // Mesmo critério de confirmação usado em Escalar e Rodadas
  const lineupConfirmed = confirmacaoEstaValida();

  const totalPlayers = CONFIG.escalacao.totalJogadores;
  const lineupCount = lineup.length;

  const percentage = Math.round((lineupCount / totalPlayers) * 100);

  const homeLineupCount = document.getElementById("homeLineupCount");
  const homeLineupPercentage = document.getElementById(
    "homeLineupPercentage",
  );
  const homeProgressBar = document.getElementById("homeProgressBar");
  const homeLineupStatus = document.getElementById("homeLineupStatus");
  const homeLineupMessage = document.getElementById("homeLineupMessage");
  const homeLineupSubtitle = document.getElementById("homeLineupSubtitle");

  homeLineupCount.textContent =
    lineupCount + " de " + totalPlayers + " jogadores";

  homeLineupPercentage.textContent = percentage + "%";

  homeProgressBar.style.width = percentage + "%";

  homeLineupSubtitle.textContent =
    "Rodada 06 • " + lineupCount + " de " + totalPlayers + " jogadores";

  /* ESTADO DA ESCALAÇÃO */

  if (lineupConfirmed) {
    homeLineupStatus.textContent = "Escalação confirmada";

    homeLineupMessage.textContent =
      "Sua escalação está confirmada para esta rodada.";
  } else if (lineupCount === totalPlayers) {
    homeLineupStatus.textContent = "Sua escalação está completa";

    homeLineupMessage.textContent =
      "Confirme sua escalação antes do encerramento.";
  } else if (lineupCount === 0) {
    homeLineupStatus.textContent = "Monte sua escalação";

    homeLineupMessage.textContent =
      "Escolha seus 7 jogadores para participar da rodada.";
  } else {
    homeLineupStatus.textContent = "Sua escalação está quase pronta";

    homeLineupMessage.textContent =
      "Complete as posições restantes antes do encerramento.";
  }

  /* ORÇAMENTO */

  const availableBudget = calcularSaldo(idsDaEscalacao(lineup));

  const homeBudgetAvailable = document.getElementById(
    "homeBudgetAvailable",
  );

  homeBudgetAvailable.textContent = formatarMoeda(availableBudget);

  /* CAMPO DA ESCALAÇÃO */

const homeFormationContainer = document.getElementById(
  "homeFormationContainer",
);

const currentFormation = obterFormacaoAtual();

function createHomePlayerSlot(position, index) {
  const slotId = `${position}-${index}`;

  const selectedPlayer = lineup.find(function (item) {
    return item.slot === slotId;
  });

  /* VAGA PREENCHIDA */

  if (selectedPlayer) {
    const player = JOGADORES.find(function (item) {
      return item.id === selectedPlayer.jogadorId;
    });

    if (player) {
      const slot = document.createElement("div");

      slot.classList.add("player-slot", "filled");

      const initials = gerarIniciais(player.nome);

      slot.innerHTML = `
        <div class="player-avatar">
          ${initials}
        </div>

        <strong>${player.nome}</strong>

        <span>${position}</span>
      `;

      return slot;
    }
  }

  /* VAGA VAZIA */

  return criarVagaVazia(position, slotId);
}

montarCampoFormacao(
  homeFormationContainer,
  currentFormation,
  createHomePlayerSlot,
);
}

/* =========================
   PERFIL
========================= */

const profileName = document.getElementById("profileName");
const profileAvatar = document.getElementById("profileAvatar");

if (profileName && profileAvatar) {
  const savedUser = lerJSON(CHAVES.usuario);

  if (savedUser) {
    const profileUsername = document.getElementById("profileUsername");
    const profileDescription = document.getElementById("profileDescription");

    const initials = gerarIniciais(savedUser.name);

if (profileName) {
  profileName.textContent = savedUser.name;
}

if (profileUsername) {
  profileUsername.textContent = "@" + savedUser.username;
}

if (profileAvatar) {
  profileAvatar.textContent = initials;
}

    
    if (savedUser.isPlayer) {
  profileDescription.textContent =
    "Participante do Racha Universitário e jogador das peladas.";

  const playerCard = document.getElementById("profilePlayerCard");

  if (playerCard && savedUser.player) {
    playerCard.hidden = false;

    const player = savedUser.player;

    // Atributos PROVISÓRIOS (50): ainda não há estatísticas individuais.
    const card = player.card || {
      overall: 50,
      ataque: 50,
      defesa: 50,
      habilidade: 50,
    };


    // ==========================================
    // DADOS DO JOGADOR
    // ==========================================

    const playerPosition =
      document.getElementById("profilePlayerPosition");

    const playerHeight =
      document.getElementById("profilePlayerHeight");

    const playerWeight =
      document.getElementById("profilePlayerWeight");

    const playerOverall =
      document.getElementById("profilePlayerOverall");


    if (playerPosition) {
      playerPosition.textContent = player.position;
    }

    if (playerHeight) {
      playerHeight.textContent =
        formatarNumero(Number(player.height)) + " m";
    }

    if (playerWeight) {
      playerWeight.textContent =
        formatarDecimal(Number(player.weight), 1) + " kg";
    }

    if (playerOverall) {
      playerOverall.textContent = card.overall;
    }


    // ==========================================
    // CARTA RU
    // ==========================================

    const cardName =
      document.getElementById("playerCardName");

    const detailsName =
      document.getElementById("profilePlayerDetailsName");

    const cardAvatar =
      document.getElementById("playerCardAvatar");

    const cardOverall =
      document.getElementById("playerCardOverall");

    const cardPosition =
      document.getElementById("playerCardPosition");


    if (cardName) {
      cardName.textContent = savedUser.name;
    }

    if (detailsName) {
      detailsName.textContent = savedUser.name;
    }

    if (cardAvatar) {
  cardAvatar.textContent = initials;
}

    if (cardOverall) {
      cardOverall.textContent = card.overall;
    }

if (cardPosition) {
  cardPosition.textContent = player.position;
}

    // ==========================================
    // ATRIBUTOS DA CARTA
    // ==========================================

    const cardAttack =
      document.getElementById("playerCardAttack");

    const cardDefense =
      document.getElementById("playerCardDefense");

    const cardSkill =
      document.getElementById("playerCardSkill");


    if (cardAttack) {
      cardAttack.textContent = card.ataque;
    }

    if (cardDefense) {
      cardDefense.textContent = card.defesa;
    }

    if (cardSkill) {
      cardSkill.textContent = card.habilidade;
    }


    // ==========================================
    // VALORES AO LADO DA CARTA
    // ==========================================

    const attackValue =
      document.getElementById("profileAttackValue");

    const defenseValue =
      document.getElementById("profileDefenseValue");

    const skillValue =
      document.getElementById("profileSkillValue");


    if (attackValue) {
      attackValue.textContent = card.ataque;
    }

    if (defenseValue) {
      defenseValue.textContent = card.defesa;
    }

    if (skillValue) {
      skillValue.textContent = card.habilidade;
    }


    // ==========================================
    // BARRAS DOS ATRIBUTOS
    // ==========================================

    const attackBar =
      document.getElementById("profileAttackBar");

    const defenseBar =
      document.getElementById("profileDefenseBar");

    const skillBar =
      document.getElementById("profileSkillBar");


    if (attackBar) {
      attackBar.style.width = `${card.ataque}%`;
    }

    if (defenseBar) {
      defenseBar.style.width = `${card.defesa}%`;
    }

    if (skillBar) {
      skillBar.style.width = `${card.habilidade}%`;
    }
  }

} else {
  profileDescription.textContent =
    "Participante do Racha Universitário.";
}
  }
}
/* =========================
   CONFIGURAÇÕES
========================= */

const settingsButtons = document.querySelectorAll(".settings-menu-item");

const settingsPanels = document.querySelectorAll(".settings-panel");

settingsButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    settingsButtons.forEach(function (item) {
      item.classList.remove("active");
    });

    settingsPanels.forEach(function (panel) {
      panel.classList.remove("active");
    });

    button.classList.add("active");

    const target = button.dataset.settings;

    const panel = document.getElementById("settings-" + target);

    if (panel) {
      panel.classList.add("active");
    }
  });
});

/* SIMULAÇÃO DE SALVAR PERFIL */


/* =========================
   CONFIGURAÇÕES — MINHA CONTA
========================= */

const profileForm = document.getElementById("profileForm");

if (profileForm) {
  const inputName = document.getElementById("profileName");
  const inputUsername = document.getElementById("profileUsername");
  const inputEmail = document.getElementById("profileEmail");
  const settingsMessage = document.getElementById("settingsMessage");

  function exibirMensagemConfiguracoes(texto, ehErro) {
    settingsMessage.textContent = texto;
    settingsMessage.classList.toggle("error", Boolean(ehErro));
  }

  // Carregar os dados cadastrados

  const usuarioSalvo = lerJSON(CHAVES.usuario);

  if (usuarioSalvo) {
    inputName.value = usuarioSalvo.name || "";
    inputUsername.value = usuarioSalvo.username || "";
    inputEmail.value = usuarioSalvo.email || "";
  }

  // Salvar alterações

  profileForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const usuarioAtual = lerJSON(CHAVES.usuario);

    if (!usuarioAtual) {
      exibirMensagemConfiguracoes(
        "Nenhum usuário cadastrado foi encontrado.",
        true,
      );
      return;
    }

    const novoNome = inputName.value.trim();
    const novoUsername = inputUsername.value.trim();
    const novoEmail = inputEmail.value.trim();

    // Mesmas regras do Cadastro
    const erroValidacao =
      validarNome(novoNome) ||
      validarUsername(novoUsername) ||
      validarEmail(novoEmail);

    if (erroValidacao) {
      exibirMensagemConfiguracoes(erroValidacao, true);
      return;
    }

    // Preserva os demais dados do cadastro,
    // incluindo as informações de jogador.

    const usuarioAtualizado = {
      ...usuarioAtual,
      name: novoNome,
      username: novoUsername,
      email: novoEmail,
    };

    localStorage.setItem(
      CHAVES.usuario,
      JSON.stringify(usuarioAtualizado)
    );

    exibirMensagemConfiguracoes("Alterações salvas com sucesso!", false);

    // Atualiza o nome e o avatar do cabeçalho.

    if (typeof atualizarCabecalhoUsuario === "function") {
      atualizarCabecalhoUsuario();
    }

    setTimeout(function () {
      exibirMensagemConfiguracoes("", false);
    }, 3000);
  });
}


/* =========================
   CADASTRO
========================= */

const registerForm = document.getElementById("registerForm");
const playerYes = document.getElementById("playerYes");
const playerNo = document.getElementById("playerNo");
const playerData = document.getElementById("playerData");

function atualizarCamposJogador() {
  if (!playerData) {
    return;
  }

  if (playerYes && playerYes.checked) {
    playerData.hidden = false;
  } else {
    playerData.hidden = true;
  }
}

if (playerYes) {
  playerYes.addEventListener("change", atualizarCamposJogador);
}

if (playerNo) {
  playerNo.addEventListener("change", atualizarCamposJogador);
}

/* MOSTRAR / OCULTAR SENHA */

const passwordToggles = document.querySelectorAll(".password-toggle");

passwordToggles.forEach(function (button) {
  button.addEventListener("click", function () {
    const targetId = button.dataset.passwordTarget;

    const input = document.getElementById(targetId);

    if (!input) {
      return;
    }

    if (input.type === "password") {
      input.type = "text";

      button.textContent = "Ocultar";
    } else {
      input.type = "password";

      button.textContent = "Mostrar";
    }
  });
});

/* MOSTRAR ERRO */

function mostrarErro(input, mensagem) {
  const field = input.closest(".register-field");

  if (!field) {
    return;
  }

  field.classList.add("error");

  const error = field.querySelector(".form-error");

  if (error) {
    error.textContent = mensagem;
  }
}

/* LIMPAR ERRO */

function limparErro(input) {
  const field = input.closest(".register-field");

  if (!field) {
    return;
  }

  field.classList.remove("error");

  const error = field.querySelector(".form-error");

  if (error) {
    error.textContent = "";
  }
}

/* ENVIO DO CADASTRO */

if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("registerName");

    const username = document.getElementById("registerUsername");

    const email = document.getElementById("registerEmail");

    const password = document.getElementById("registerPassword");

    const confirmPassword = document.getElementById("registerConfirmPassword");

    const terms = document.getElementById("registerTerms");

    const termsError = document.getElementById("termsError");

    const participation = document.querySelector(
  'input[name="playerParticipation"]:checked',
);

const participationError = document.getElementById(
  "playerParticipationError",
);

const position = document.getElementById("registerPosition");
const height = document.getElementById("registerHeight");
const weight = document.getElementById("registerWeight");

    let valid = true;

    /* LIMPA ERROS */

    [
      name,
      username,
      email,
      password,
      confirmPassword,
      position,
      height,
      weight,
    ].forEach(function (input) {
      limparErro(input);
    });

    termsError.textContent = "";

    participationError.textContent = "";

    /* NOME */

    const erroNome = validarNome(name.value);

    if (erroNome) {
      mostrarErro(name, erroNome);

      valid = false;
    }

    /* USUÁRIO */

    const erroUsername = validarUsername(username.value);

    if (erroUsername) {
      mostrarErro(username, erroUsername);

      valid = false;
    }

    /* EMAIL */

    const erroEmail = validarEmail(email.value);

    if (erroEmail) {
      mostrarErro(email, erroEmail);

      valid = false;
    }

    /* SENHA */

    if (password.value.length < 8) {
      mostrarErro(password, "A senha deve possuir pelo menos 8 caracteres.");

      valid = false;
    }

    /* CONFIRMAÇÃO */

    if (confirmPassword.value !== password.value) {
      mostrarErro(confirmPassword, "As senhas não coincidem.");

      valid = false;
    }

    /* PARTICIPAÇÃO */

if (!participation) {
  participationError.textContent =
    "Informe se você também participa das peladas.";

  valid = false;
}

/* DADOS DO JOGADOR */

if (participation && participation.value === "sim") {
  if (!position.value) {
    mostrarErro(position, "Selecione sua posição principal.");
    valid = false;
  }

  const erroAltura = validarAltura(height.value);

  if (erroAltura) {
    mostrarErro(height, erroAltura);
    valid = false;
  }

  const erroPeso = validarPeso(weight.value);

  if (erroPeso) {
    mostrarErro(weight, erroPeso);
    valid = false;
  }
}

    /* TERMOS */

    if (!terms.checked) {
      termsError.textContent = "Você precisa aceitar os termos.";

      valid = false;
    }

    /* INTERROMPE SE HOUVER ERRO */

    if (!valid) {
      return;
    }

    /* SIMULAÇÃO DO CADASTRO */

    const newUser = {
  name: name.value.trim(),
  username: username.value.trim(),
  email: email.value.trim(),

  isPlayer: participation.value === "sim",
};

  if (newUser.isPlayer) {
  newUser.player = {
    position: position.value,
    height: numeroDoCampo(height.value),
    weight: numeroDoCampo(weight.value),

    // Atributos PROVISÓRIOS (50): ainda não há estatísticas individuais.
    card: {
      overall: 50,
      ataque: 50,
      defesa: 50,
      habilidade: 50,
    },
  };
}


    // Salvar o novo usuário
    localStorage.setItem(CHAVES.usuario, JSON.stringify(newUser));

    // Conta única por navegador: um novo cadastro concluído descarta a
    // escalação anterior. Só aqui essas chaves são apagadas (nunca no
    // login, no logout ou ao carregar páginas).
    localStorage.removeItem(CHAVES.escalacao);
    localStorage.removeItem(CHAVES.confirmada);
    localStorage.removeItem(CHAVES.formacao);

    // A conta nova ainda precisa fazer login
    encerrarSessao();

    // Exibir mensagem de sucesso
    const success = document.getElementById("registerSuccess");

    success.classList.add("show");

    const submitButton = registerForm.querySelector(".register-submit");

    submitButton.disabled = true;

    submitButton.textContent = "CONTA CRIADA";

    setTimeout(function () {
      window.location.href = "index.html?cadastro=sucesso";
    }, 1800);
  });
}


/* =========================
   RETORNO DO CADASTRO
========================= */

const loginSuccessMessage = document.getElementById("loginSuccessMessage");

if (loginSuccessMessage) {
  const params = new URLSearchParams(window.location.search);

  if (params.get("cadastro") === "sucesso") {
    loginSuccessMessage.classList.add("show");
  }
}

/* =========================
   CONFIGURAÇÕES GERAIS DO APP
========================= */

function carregarConfiguracoesApp() {
  const nomes = document.querySelectorAll("[data-app-nome]");

  const siglas = document.querySelectorAll("[data-app-sigla]");

  nomes.forEach(function (elemento) {
    elemento.textContent = CONFIG.app.nome;
  });

  siglas.forEach(function (elemento) {
    elemento.textContent = CONFIG.app.sigla;
  });
}

carregarConfiguracoesApp();

// ==================================================
// CONFIGURAÇÕES — NOTIFICAÇÕES
// ==================================================

const notificationDeadline =
  document.getElementById("notificationDeadline");

const notificationResults =
  document.getElementById("notificationResults");

const notificationRanking =
  document.getElementById("notificationRanking");

const notificationMessage =
  document.getElementById("notificationMessage");

if (
  notificationDeadline &&
  notificationResults &&
  notificationRanking
) {
  const savedNotifications = lerJSON(CHAVES.notificacoes);

  const notificationSettings =
    savedNotifications || {
      deadline: true,
      results: true,
      ranking: false,
    };

  notificationDeadline.checked =
    notificationSettings.deadline;

  notificationResults.checked =
    notificationSettings.results;

  notificationRanking.checked =
    notificationSettings.ranking;

  function saveNotificationSettings() {
    const settings = {
      deadline: notificationDeadline.checked,
      results: notificationResults.checked,
      ranking: notificationRanking.checked,
    };

    localStorage.setItem(
      CHAVES.notificacoes,
      JSON.stringify(settings)
    );

    if (notificationMessage) {
      notificationMessage.textContent =
        "Preferências salvas.";

      setTimeout(() => {
        notificationMessage.textContent = "";
      }, 2000);
    }
  }

  notificationDeadline.addEventListener(
    "change",
    saveNotificationSettings
  );

  notificationResults.addEventListener(
    "change",
    saveNotificationSettings
  );

  notificationRanking.addEventListener(
    "change",
    saveNotificationSettings
  );
}

/* =========================
   CONFIGURAÇÕES — SEGURANÇA
========================= */

const securityForm = document.getElementById("securityForm");

if (securityForm) {
  const currentPassword =
    document.getElementById("currentPassword");

  const newPassword =
    document.getElementById("newPassword");

  const confirmNewPassword =
    document.getElementById("confirmNewPassword");

  const securityMessage =
    document.getElementById("securityMessage");

  securityForm.addEventListener("submit", function (event) {
    event.preventDefault();

    securityMessage.textContent = "";

    if (
      !currentPassword.value ||
      !newPassword.value ||
      !confirmNewPassword.value
    ) {
      securityMessage.textContent =
        "Preencha todos os campos.";
      return;
    }

    if (newPassword.value.length < 8) {
      securityMessage.textContent =
        "A nova senha deve possuir pelo menos 8 caracteres.";
      return;
    }

    if (newPassword.value !== confirmNewPassword.value) {
      securityMessage.textContent =
        "As novas senhas não coincidem.";
      return;
    }

    if (currentPassword.value === newPassword.value) {
      securityMessage.textContent =
        "A nova senha deve ser diferente da senha atual.";
      return;
    }

    securityMessage.textContent =
      "Senha validada para alteração.";

    securityForm.reset();
  });
}

/* =========================
   HOME — DESTAQUES
========================= */

const homeHighlights =
  document.getElementById("homeHighlights");

if (
  homeHighlights &&
  typeof JOGADORES !== "undefined"
) {
  const destaques = [...JOGADORES]
    .sort(function (a, b) {
      return b.pontos - a.pontos;
    })
    .slice(0, 2);

  homeHighlights.innerHTML = "";

  destaques.forEach(function (jogador, index) {
    const iniciais = gerarIniciais(jogador.nome);

    const card = document.createElement("article");

    card.className = "highlight-card";

    card.innerHTML = `
      <div class="player-avatar">
        ${iniciais}
      </div>

      <div>
        <span class="position">
          ${jogador.posicaoPrincipal}
        </span>

        <h3>${jogador.nome}</h3>

        <strong>
          ${formatarPontos(jogador.pontos)} pts
        </strong>

        <p>
          ${index === 0 ? "Maior pontuação" : "Destaque da rodada"}
        </p>
      </div>
    `;

    homeHighlights.appendChild(card);
  });
}

/* =========================
   JOGADORES — DESTAQUES
========================= */

const featuredPlayers = document.getElementById("featuredPlayers");

if (featuredPlayers && typeof JOGADORES !== "undefined") {
  const destaques = [...JOGADORES]
    .sort(function (a, b) {
      return b.pontos - a.pontos;
    })
    .slice(0, 3);

  featuredPlayers.innerHTML = "";

  destaques.forEach(function (jogador) {
    const iniciais = gerarIniciais(jogador.nome);

    const valorFormatado = formatarNumero(jogador.valor);

    const variacaoFormatada = formatarNumero(Math.abs(jogador.variacao));

    const card = document.createElement("a");

    card.href = `jogador.html?id=${jogador.id}`;
    card.className = "featured-player";

    card.innerHTML = `
      <div class="featured-top">
        <div>
          <strong class="big-ovr">${jogador.ovr}</strong>
          <span>OVR</span>
        </div>

        <span class="position">
          ${jogador.posicaoPrincipal}
        </span>
      </div>

      <div class="featured-photo">
        ${iniciais}
      </div>

      <h3>${jogador.nome}</h3>

      <div class="featured-data">
        <strong>
          ${formatarPontos(jogador.pontos)} pts
        </strong>

        <span>
          RU$ ${valorFormatado}
        </span>
      </div>

      <span class="${jogador.variacao >= 0 ? "positive" : "negative"}">
        ${jogador.variacao >= 0 ? "↑" : "↓"}
        RU$ ${variacaoFormatada}
      </span>
    `;

    featuredPlayers.appendChild(card);
  });
}

/* =========================
   RANKING — USUÁRIO
========================= */

const rankingUserName =
  document.getElementById("rankingUserName");

if (rankingUserName) {
  const savedUser = lerJSON(CHAVES.usuario);

  if (savedUser) {
    const rankingUsername =
      document.getElementById("rankingUsername");

    rankingUserName.textContent = savedUser.name;

    if (rankingUsername) {
      rankingUsername.textContent =
        "• @" + savedUser.username;
    }
  }
}

/* =========================
   USUÁRIO — CABEÇALHO GLOBAL
========================= */

function atualizarCabecalhoUsuario() {
  const menuUsuario = document.querySelector(".topbar .user-menu");

  if (!menuUsuario) return;

  const usuario = lerJSON(CHAVES.usuario);

  if (!usuario || !usuario.name) return;

  const nome = usuario.name.trim();
  const username = (usuario.username || "").trim();

  const elementoNome = menuUsuario.querySelector("strong");
  const elementoUsername = menuUsuario.querySelector("small");
  const elementoAvatar = menuUsuario.querySelector(".avatar");

  if (elementoNome) {
    elementoNome.textContent = nome;
  }

  if (elementoUsername) {
    elementoUsername.textContent = username ? `@${username}` : "";
  }

  if (elementoAvatar) {
    elementoAvatar.textContent = gerarIniciais(nome);
  }
}

/* O cabeçalho vem antes deste script no HTML, então já existe aqui.
   É a única função que escreve nome, @usuário e iniciais no cabeçalho;
   Configurações a chama de novo depois de salvar. */

atualizarCabecalhoUsuario();

/* =========================
   SAIR DA CONTA

   Encerra só a sessão demonstrativa. Conta, escalação e formação
   continuam salvas, então um novo login recupera tudo.
========================= */

const botaoSair = document.querySelector(".logout-button");

if (botaoSair) {
  botaoSair.addEventListener("click", function () {
    encerrarSessao();
  });
}

/* =========================
   NAVEGAÇÃO ROLÁVEL (CELULAR)

   Quando os links do cabeçalho não cabem na largura, a barra rola na
   horizontal. As classes can-scroll-start/end fazem o CSS esmaecer a
   borda daquele lado (indica que há mais links) e o link da página
   atual é centralizado ao abrir.
========================= */

const navegacaoTopo = document.querySelector(".topbar .navigation");

if (navegacaoTopo) {
  const atualizarIndicadoresNavegacao = function () {
    const restante =
      navegacaoTopo.scrollWidth -
      navegacaoTopo.clientWidth -
      navegacaoTopo.scrollLeft;

    navegacaoTopo.classList.toggle(
      "can-scroll-start",
      navegacaoTopo.scrollLeft > 4,
    );

    navegacaoTopo.classList.toggle("can-scroll-end", restante > 4);
  };

  const centralizarLinkAtivo = function () {
    const linkAtivo = navegacaoTopo.querySelector("a.active");

    if (!linkAtivo || navegacaoTopo.scrollWidth <= navegacaoTopo.clientWidth) {
      return;
    }

    const caixaNavegacao = navegacaoTopo.getBoundingClientRect();
    const caixaLink = linkAtivo.getBoundingClientRect();

    navegacaoTopo.scrollLeft +=
      caixaLink.left -
      caixaNavegacao.left -
      (caixaNavegacao.width - caixaLink.width) / 2;
  };

  navegacaoTopo.addEventListener("scroll", atualizarIndicadoresNavegacao, {
    passive: true,
  });

  window.addEventListener("resize", atualizarIndicadoresNavegacao);

  // A largura dos links muda quando a fonte termina de carregar
  window.addEventListener("load", function () {
    centralizarLinkAtivo();
    atualizarIndicadoresNavegacao();
  });

  centralizarLinkAtivo();
  atualizarIndicadoresNavegacao();
}
