const CONFIG = {
  app: {
    nome: "Racha Universitário",
    sigla: "RU",
  },

  moeda: {
    nome: "RUCoin",
    simbolo: "RU$",
    orcamentoInicial: 90,
  },

  escalacao: {
    totalJogadores: 7,
    goleiros: 1,

    formacoes: {
      "2-2-2": {
        DEF: 2,
        MEI: 2,
        ATA: 2,
      },

      "3-2-1": {
        DEF: 3,
        MEI: 2,
        ATA: 1,
      },

      "3-1-2": {
        DEF: 3,
        MEI: 1,
        ATA: 2,
      },

      "2-3-1": {
        DEF: 2,
        MEI: 3,
        ATA: 1,
      },

      "2-1-3": {
        DEF: 2,
        MEI: 1,
        ATA: 3,
      },

      "1-3-2": {
        DEF: 1,
        MEI: 3,
        ATA: 2,
      },

      "1-2-3": {
        DEF: 1,
        MEI: 2,
        ATA: 3,
      },
    },

    formacaoPadrao: "2-2-2",
  },
};
