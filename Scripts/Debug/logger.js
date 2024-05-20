// logger.js
const Logger = (function() {
    let debugMode = false;

    function setDebugMode(mode) {
        debugMode = mode;
    }

    function log(...args) {
        if (debugMode) {
            console.log(...args);
        }
    }

    function info(...args) {
        if (debugMode) {
            console.info(...args);
        }
    }

    function warn(...args) {
        if (debugMode) {
            console.warn(...args);
        }
    }

    function error(...args) {
        console.error(...args); // Always log errors
    }

    return {
        setDebugMode,
        log,
        info,
        warn,
        error
    };
})();

export { Logger };
