const { Log, LogLevel } = require("../log");
const { ServerError } = require("../middlewares/handle_error.middleware");
const { Torneio } = require("../models/types");

class TorneioController {
  constructor(ipFirestore) {
    this.firestore = ipFirestore;
  }

  tratarRetornoFirebase(ipSnapshot, ipFiltros) {
    let vaResult = [];
    if (ipSnapshot.empty) {
      console.log("Nenhum torneio encontrado!");
      return;
    }

    ipSnapshot.forEach((doc) => {
      let vaTorneio = this.castDocumentDataToTorneio(doc);
      if (vaTorneio) {
        let vaValido = true;
        if (ipFiltros) {
          if ((ipFiltros.nome) && (!vaTorneio.nome.toUpperCase().startsWith(ipFiltros.nome.toUpperCase()))) {
            vaValido = false;
          }
        }
        if (vaValido) {
          vaResult.push(vaTorneio);
        }
      }
    });

    vaResult = vaResult.sort((t1, t2) => {
      return t1.data_inicio.getTime() - t2.data_inicio.getTime();
    });

    return vaResult;
  }

  async buscarTorneiosPorStatus(ipStatus) {
    try {
      let vaTorneiosRef = this.firestore.collection("torneios");
      let vaSnapshot = undefined;
      vaSnapshot = await vaTorneiosRef.where("status", "==", ipStatus).get();
      return this.tratarRetornoFirebase(vaSnapshot);
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async buscarTorneios(ipQueryString) {
    try {
      let vaResult = [];
      let vaTorneiosRef = this.firestore.collection("torneios");
      let vaSnapshot = undefined;


      if (!ipQueryString.inativos) {
        vaSnapshot = await vaTorneiosRef.where("status", "!=", 2).get();
      } else if (ipQueryString.nome) {
        let strlength = ipQueryString.nome.length;
        let strFrontCode = ipQueryString.nome.slice(0, strlength - 1);
        let strEndCode = ipQueryString.nome.slice(strlength - 1, ipQueryString.nome.length);

        let startcode = ipQueryString.nome;
        let endcode = strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);
        vaSnapshot = await vaTorneiosRef
          .where("nome", ">=", startcode)
          .where("nome", "<", endcode)
          .get();
        //como ja fizemos o filtro diretamete no banco, entao nao preciso mais filtrar
        ipQueryString.nome = undefined;
      } else {
        vaSnapshot = await vaTorneiosRef.get();
      }

      return this.tratarRetornoFirebase(vaSnapshot, ipQueryString);
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async buscarTorneio(ipId) {
    let vaDocRef = await this.firestore.collection("torneios").doc(ipId);
    if (vaDocRef) {
      let vaDoc = await vaDocRef.get();
      return this.castDocumentDataToTorneio(vaDoc);
    } else {
      return null;
    }
  }

  async incluirTorneio(ipTorneio) {
    //nao se pode passar objetos customizados (criados com uso do new). Tem sempre que ser um Object
    let vaDocument = await this.firestore
      .collection("torneios")
      .add(this.createObject(ipTorneio));
    if (vaDocument) {
      ipTorneio.id = vaDocument.id;
    }
    return vaDocument.id;
  }

  async iniciarTorneio(ipIdTorneio){
    let vaTorneio = await this.buscarTorneio(ipIdTorneio);
      if (vaTorneio) {
        vaTorneio.status = 1;
        let vaOrganizer = new TournamentOrganizer();
        if (vaOrganizer.processarRodada(vaTorneio)) {
          let vaSalvou = await this.atualizarTorneio(
            req.params.id,
            vaTorneio
          );
          if (!vaSalvou) {
            throw new ServerError("Não foi possível salvar o registro.", 500)            
          }
        } else {
          throw new ServerError("Não foi possível criar os emparceiramentos da primeira rodada.", 500)          
        }
      } else {        
        throw new ServerError("Torneio não encontrado.", 404)                  
      }
  }

  async atualizarTorneio(ipId, ipTorneio) {
    let vaDocRef = this.firestore.collection("torneios").doc(ipId);
    if (vaDocRef) {
      try {
        await vaDocRef.update(this.createObject(ipTorneio));
        return true;
      } catch (error) {
        Log.logError(
          "Erro ao tentar atualizar um torneio",
          LogLevel.RELEASE,
          error
        );
        return false;
      }
    } else {
      return false;
    }
  }

  async excluirTorneio(ipId) {
    let vaDocRef = this.firestore.collection("torneios").doc(ipId);
    if (vaDocRef) {
      await vaDocRef.delete();
      return true;
    } else {
      return false;
    }
  }

  createObject(ipTorneio) {
    Log.logInfo('Torneio que veio do cliente', LogLevel.DEBUG, ipTorneio)
    let vaObj = Object.assign({}, ipTorneio);
    vaObj.data_inicio = new Date(ipTorneio.data_inicio);
    vaObj.jogadores = [];
    vaObj.rodadas = [];
    if (ipTorneio.jogadores) {
      ipTorneio.jogadores.forEach((j) => {
        vaObj.jogadores.push(Object.assign({}, j));
      });
    }

    if (ipTorneio.rodadas) {
      ipTorneio.rodadas.forEach((r) => {
        let vaRodada = Object.assign({}, r);
        vaRodada.partidas = [];
        for (const vaPartida of r.partidas) {
          let vaJb = Object.assign({}, vaPartida.jogadorBrancas);
          let vaJn = Object.assign({}, vaPartida.jogadorNegras);

          let vaP = Object.assign({}, vaPartida);
          vaP.jogadorBrancas = vaJb;
          vaP.jogadorNegras = vaJn;

          vaRodada.partidas.push(vaP);
        }
        vaObj.rodadas.push(vaRodada);
      });
    }

    //precisamos trocar todos os camps undefined por null senao o Firestore nao aceita
    let vaTorneioPadronizado = this.removeUndefined(vaObj);
    Log.logInfo('Torneio sem campos undefined', LogLevel.DEBUG, vaTorneioPadronizado)
    return vaTorneioPadronizado;
  }

  removeUndefined(ipObj) {
    for (const key in ipObj) {
      if (ipObj[key] === undefined) {
        ipObj[key] = null;
      } else if (ipObj[key] instanceof Object) {
        this.removeUndefined(ipObj[key]);
      }
    }

    return ipObj;
  }

  castDocumentDataToTorneio(ipDoc) {
    if (ipDoc && ipDoc.exists) {
      let vaDocData = ipDoc.data();
      Log.logInfo('Torneio Firestore', LogLevel.DEBUG, vaDocData)
      let vaTorneio = Object.assign(new Torneio(), vaDocData);
      vaTorneio.id = ipDoc.id;
      vaTorneio.data_inicio = new Date(vaDocData.data_inicio.seconds * 1000);
      for (const vaRodada of vaTorneio.rodadas) {
        let vaDataSec = vaRodada.data_inicio;
        vaRodada.data_inicio = new Date(vaDataSec.seconds * 1000);
      }
      return vaTorneio;
    }
  }
}

module.exports = TorneioController;
