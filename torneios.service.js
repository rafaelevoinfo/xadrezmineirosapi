const Torneio = require("./types");

class TorneioService {

    constructor(ipFirestore){
        this.firestore = ipFirestore;
    }

    async buscarTorneios(ipSomenteAtivos) {      
        try {    
          let vaResult = [];
          let vaTorneiosRef = this.firestore.collection('torneios');
          let vaSnapshot = undefined;
          if (ipSomenteAtivos) {
            vaSnapshot = await vaTorneiosRef.where("status", '!=', 2).get()
          } else {
            vaSnapshot = await vaTorneiosRef.get();
          }
    
          if (vaSnapshot.empty) {
            console.log('Nenhum torneio encontrado!');
            return;
          }
    
          vaSnapshot.forEach(doc => {
            let vaTorneio = this.castDocumentDataToTorneio(doc);
            if (vaTorneio) {
              vaResult.push(vaTorneio);
            }
          });
    
          vaResult = vaResult.sort((t1, t2) => {
            return t1.data_inicio.getTime() - t2.data_inicio.getTime()
          })
    
          return vaResult;
    
        } catch (error) {
          console.log(error);
          return [];
        }
      }

      castDocumentDataToTorneio(ipDocData) {
        if (ipDocData) {
          let vaData = ipDocData.data();
          let vaTorneio = Object.assign(new Torneio, vaData);
          vaTorneio.id = ipDocData.id;
          vaTorneio.data_inicio = new Date(vaData.data_inicio.seconds * 1000);
          for (const vaRodada of vaTorneio.rodadas) {
            let vaDataSec = vaRodada.data_inicio;
            vaRodada.data_inicio = new Date(vaDataSec.seconds * 1000);
          }
          return vaTorneio;
        }
      }
    
} 

module.exports = TorneioService