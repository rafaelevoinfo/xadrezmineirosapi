const fetch = require('node-fetch');
// import fetch from "node-fetch";

class GameResult {
  jogadorBrancas;
  jogadorNegras;
  ritmo;
  resultado;
  link_partida;
}

class LichessApi {
  
  constructor() {
    this.baseUrl = 'https://lichess.org/api/';
  }


  addOption(ipCurrentOptions, ipNewOption) {
    if (ipCurrentOptions) {
      ipCurrentOptions += '&' + ipNewOption;
    } else {
      ipCurrentOptions = ipNewOption;
    }

    return ipCurrentOptions;
  }


  async pegarResultadoJogos(ipUsername, options) {    
    let vaUrl = `${this.baseUrl}games/user/${ipUsername}`;
    if (options) {
      let vaOptions = '';

      if (options.since) {
        vaOptions = this.addOption(vaOptions, 'since=' + options.since);
      }

      if (options.vs) {
        vaOptions = this.addOption(vaOptions, 'vs=' + options.vs);
      }

      if (options.max) {
        vaOptions = this.addOption(vaOptions, 'max=' + options.max);
      }

      if (options.rated) {
        vaOptions = this.addOption(vaOptions, 'rated=' + options.rated);
      }

      if (options.color) {
        vaOptions = this.addOption(vaOptions, 'color=' + options.color);
      }

      if (vaOptions) {
        vaUrl += '?' + vaOptions;
      }
    }

    const response = await fetch(vaUrl,
      {
        method: 'GET'
      });

    let vaGames = [];
    let vaResult = await response.text();

    let vaLinhas = vaResult.split('\n');
    for (let i = 0; i < vaLinhas.length; i++) {
      let vaLinha = vaLinhas[i];
      if (vaLinha.startsWith('[Event')) {
        let vaGame = new GameResult();
        for (let j = i + 1; j < vaLinhas.length; j++) {
          vaLinha = vaLinhas[j];
          if (vaLinha.startsWith('[White')) {
            vaGame.jogadorBrancas = vaLinha.split('"')[1];
          }
          if (vaLinha.startsWith('[Black')) {
            vaGame.jogadorNegras = vaLinha.split('"')[1];
          }

          if (vaLinha.startsWith('[Site')) {
            vaGame.link_partida = vaLinha.split('"')[1];
          }

          if (vaLinha.startsWith('[Result')) {
            vaGame.resultado = vaLinha.split('"')[1];
          }

          if ((options.ritmo) && (vaLinha.startsWith('[TimeControl'))) {
            let vaRitmoRetornado = vaLinha.split('"')[1];
            //o ritmo retornado esta em segundos, entao vamos converter
            let vaRitmo = options.ritmo.split('+');
            if ((vaRitmo) && (vaRitmo.length = 2)) {
              let vaMinutos = vaRitmo[0];
              let vaIncremento = vaRitmo[1];
              let vaRitmoConvertido = (vaMinutos * 60).toString() + '+' + vaIncremento.toString();
              if (vaRitmoConvertido != vaRitmoRetornado) {
                i = j + 1;
                break;
              }
            }
          }

          if (vaLinha.startsWith('[Termination')) {
            i = j + 1;
            vaGames.push(vaGame);
            break;
          }
        }
      }
    }
    return vaGames;

  }
}


module.exports = {LichessApi, GameResult};
