import { Logger } from "../Debug/logger.js";
import { loadDependencies } from '../Dependencies/loadDependencies.js';
import { Theme } from './themeClass.js'
import { loadUI, updateUI } from '../UI/ui.js'
import { CanvasManager } from "./Canvas/canvasManagerClass.js";
import { setupEventListeners } from "../Events/eventManager.js";

class AppManager {
    constructor() {

        //Debug
        this.debugMode = false;
        Logger.setReturnFullFilePath(false);
        Logger.setDebugMode(this.debugMode);

        //Load Dependencies
        loadDependencies();

        //Load Theme && UI
        this.theme = new Theme();
        this.theme.initTheme();
        this.uiVersion = 'default';
        loadUI(this);

        //Load Current Page
        this.pageType = "canvas";
        this.canvasManager = null;

        if (this.pageType == "canvas") {
            this.canvasManager = new CanvasManager('canvas');
            this.canvasManager.initCanvas(this);
        }
        
        //Set Up Event Listeners
        setupEventListeners(this);
        


        this.isLoggedIn = false;
        this.currentUser = null;
        // Add more properties as needed
    }

    setIsLoggedIn(isLoggedIn) {
        this.isLoggedIn = isLoggedIn;
    }

    getIsLoggedIn() {
        return this.isLoggedIn;
    }

    setCurrentUser(user) {
        this.currentUser = user;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Add more methods as needed
    update() {
        if (this.canvasManager != null && this.canvasManager.needsUpdating){
            this.canvasManager.update();
            if (this.canvasManager.physicsEnabled) {
                physicsUpdate(this.canvasManager);
            }
        }        
        updateUI(this);
    }

}

export { AppManager };