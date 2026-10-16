const RODADAS = [
  {
    numero: 6,
    data: "12 de setembro",
    prazo: "18:30",
    status: "ABERTA",
    atual: true,
  },

  {
    numero: 5,
    data: "05 de setembro",
    status: "FINALIZADA",
    pontos: 72.8,
    posicao: 8,
    resultadosDisponiveis: true,

    /* Ranking da rodada (dados demonstrativos). Só existe para a
       Rodada 5; as demais exibem "ranking indisponível".
       A entrada com "usuario: true" é a conta atual (o nome vem do
       cadastro) e deve coincidir com "pontos" e "posicao" acima. */
    ranking: [
      { nome: "Rafael", pontos: 91.2 },
      { nome: "Bruno", pontos: 87.5 },
      { nome: "Mariana", pontos: 84.9 },
      { nome: "Lucas", pontos: 81.3 },
      { nome: "Gabriel", pontos: 78.6 },
      { nome: "Felipe", pontos: 76.4 },
      { nome: "Thiago", pontos: 74.1 },
      { usuario: true, pontos: 72.8 },
      { nome: "Daniel", pontos: 69.7 },
      { nome: "Gustavo", pontos: 67.2 },
    ],

    formacao: "2-2-2",

    escalacao: [
      {
        jogadorId: "victor",
        posicao: "GOL",
        pontos: 5.9,
      },
      {
        jogadorId: "otaciano",
        posicao: "DEF",
        pontos: 9.8,
      },
      {
        jogadorId: "breno",
        posicao: "DEF",
        pontos: 7.6,
      },
      {
        jogadorId: "lucas-melo",
        posicao: "MEI",
        pontos: 15.3,
      },
      {
        jogadorId: "felipe",
        posicao: "MEI",
        pontos: 7.3,
      },
      {
        jogadorId: "carlinhos",
        posicao: "ATA",
        pontos: 14.8,
      },
      {
        jogadorId: "mago",
        posicao: "ATA",
        pontos: 12.1,
      },
    ],
  },

  {
    numero: 4,
    data: "29 de agosto",
    status: "FINALIZADA",
    pontos: 70.2,
    posicao: 9,
    resultadosDisponiveis: true,

    formacao: "3-2-1",

    escalacao: [
      {
        jogadorId: "ramon",
        posicao: "GOL",
        pontos: 6.4,
      },
      {
        jogadorId: "winnicius",
        posicao: "DEF",
        pontos: 8.7,
      },
      {
        jogadorId: "kaio",
        posicao: "DEF",
        pontos: 7.2,
      },
      {
        jogadorId: "jamuelton",
        posicao: "DEF",
        pontos: 6.8,
      },
      {
        jogadorId: "lucas-silva",
        posicao: "MEI",
        pontos: 13.5,
      },
      {
        jogadorId: "igor",
        posicao: "MEI",
        pontos: 9.1,
      },
      {
        jogadorId: "robert",
        posicao: "ATA",
        pontos: 18.5,
      },
    ],
  },

  {
    numero: 3,
    data: "22 de agosto",
    status: "FINALIZADA",
    pontos: 61.3,
    posicao: 13,
    resultadosDisponiveis: true,

    formacao: "2-1-3",

    escalacao: [
      {
        jogadorId: "arthur",
        posicao: "GOL",
        pontos: 4.8,
      },
      {
        jogadorId: "breno",
        posicao: "DEF",
        pontos: 6.2,
      },
      {
        jogadorId: "otaciano",
        posicao: "DEF",
        pontos: 5.7,
      },
      {
        jogadorId: "pedro",
        posicao: "MEI",
        pontos: 10.4,
      },
      {
        jogadorId: "sidney",
        posicao: "ATA",
        pontos: 12.6,
      },
      {
        jogadorId: "allan",
        posicao: "ATA",
        pontos: 9.3,
      },
      {
        jogadorId: "erikarlos",
        posicao: "ATA",
        pontos: 12.3,
      },
    ],
  },

  {
    numero: 2,
    data: "15 de agosto",
    status: "FINALIZADA",
    pontos: 64.7,
    posicao: 11,
    resultadosDisponiveis: true,

    formacao: "1-3-2",

    escalacao: [
      {
        jogadorId: "victor",
        posicao: "GOL",
        pontos: 5.1,
      },
      {
        jogadorId: "kaio",
        posicao: "DEF",
        pontos: 8.9,
      },
      {
        jogadorId: "lucas-melo",
        posicao: "MEI",
        pontos: 11.2,
      },
      {
        jogadorId: "lucas-silva",
        posicao: "MEI",
        pontos: 7.8,
      },
      {
        jogadorId: "felipe",
        posicao: "MEI",
        pontos: 6.5,
      },
      {
        jogadorId: "mago",
        posicao: "ATA",
        pontos: 13.4,
      },
      {
        jogadorId: "carlinhos",
        posicao: "ATA",
        pontos: 11.8,
      },
    ],
  },

  {
    numero: 1,
    data: "08 de agosto",
    status: "FINALIZADA",
    pontos: 58.4,
    posicao: 14,
    resultadosDisponiveis: false,
  },
];