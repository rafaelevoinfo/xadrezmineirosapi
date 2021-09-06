const LogLevel = {
  DEBUG: 1,
  RELEASE:2
}

class Log {
  static logInfo(ipMsg, ipLogLevel) {
    let vaLogLevel = LogLevel.DEBUG;
    if (ipLogLevel){
        vaLogLevel = ipLogLevel;
    }

    if (vaLogLevel >= process.env.LOG_LEVEL) {
      if (arguments && arguments.length > 2) {
        console.log(ipMsg, arguments[2]);
      } else {
        console.log(ipMsg);
      }
    }
  }

  static logError(ipError, ipLogLevel) {
    let vaLogLevel = LogLevel.DEBUG;
    if (ipLogLevel){
        vaLogLevel = ipLogLevel;
    }

    if (vaLogLevel >= process.env.LOG_LEVEL) {
      if (arguments && arguments.length > 2) {
        console.error(ipError, arguments[2]);
      } else {
        console.error(ipError);
      }
    }
  }
}

module.exports = {Log, LogLevel};
