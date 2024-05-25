// logger.js
const Logger = (function() {
    let debugMode = false;
    let returnFullFilePath = false; // New variable to control file path format

    function setDebugMode(mode) {
        debugMode = mode;
        if (debugMode == "default") {
            Logger.log('Debug mode enabled && set to default');
            if (returnFullFilePath) {
                Logger.log('Full file path will be returned');
            }
        }
    }

    function setReturnFullFilePath(value) {
        returnFullFilePath = value;
    }

    function getStackTrace() {
        const obj = {};
        Error.captureStackTrace(obj, getStackTrace);
        const stack = obj.stack.split('\n');
        // Adjust the index if needed based on your environment
        const callerStackLine = stack[3] || stack[2]; 
        const parts = callerStackLine.match(/at (.+) \((.+):(\d+):(\d+)\)/) || callerStackLine.match(/at (.+):(\d+):(\d+)/);
        if (parts) {
            const functionName = parts[1];
            let fileName = parts[2];
            const lineNumber = parts[3];
            if (!returnFullFilePath) {
                // Extract just the file name
                fileName = fileName.split('/').pop().split('\\').pop();
            }
            return `${fileName}:${lineNumber}`;
        }
        return 'unknown';
    }

    function log(...args) {
        if (debugMode == "default") {
            const location = getStackTrace();
            console.log(`[LOG] [${location}]`, ...args);
        }
    }

    function info(...args) {
        if (debugMode == "default") {
            const location = getStackTrace();
            console.info(`[INFO] [${location}]`, ...args);
        }
    }

    function warn(...args) {
        if (debugMode == "default") {
            const location = getStackTrace();
            console.warn(`[WARN] [${location}]`, ...args);
        }
    }

    function error(...args) {
        const location = getStackTrace();
        console.error(`[ERROR] [${location}]`, ...args); // Always log errors
    }

    return {
        setDebugMode,
        setReturnFullFilePath, // Expose the new setter
        log,
        info,
        warn,
        error
    };
})();

export { Logger };
