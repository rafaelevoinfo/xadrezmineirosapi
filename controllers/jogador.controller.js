const { LichessApi } = require("../lichess-api");
const { Log, LogLevel } = require("../log");
const { Jogador } = require("../models/types");

class JogadorController{
    constructor(){
        this.chessApi = new LichessApi();
    }

    async buscarJogador(username) {    
        Log.logInfo("Buscando jogador "+username);
        let vaResult = await this.chessApi.buscarUsuario(username);
        if (vaResult) {
          Log.logInfo("Jogador encontrado", LogLevel.DEBUG, vaResult);
          let vaJogador = new Jogador();
          vaJogador.nome = vaResult?.profile?.firstName;
          vaJogador.rating = vaResult.perfs?.rapid?.rating;
          vaJogador.username = username;
    
          if (!vaJogador.nome) {
            vaJogador.nome = vaJogador.username
          }
          if (!vaJogador.rating) {
            vaJogador.rating = 1500;
          }
    
          return vaJogador;
        }
      }
}

module.exports = JogadorController;