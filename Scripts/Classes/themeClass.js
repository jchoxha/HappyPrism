import { Logger } from "../Debug/logger.js";

class Theme {
    constructor(themeName = "default") {

        this.themeName = themeName;

        //Default / Light Theme
        if(themeName == "default" || themeName == "light"){
        //UI
        this.menu_background = "#013561";
        this.button_text_color = "#000000";
        this.button_bg_color = "#f0f0f0";
        //Canvas
        this.canvas_background = "#F2F2F2";
        this.canvas_grid_color = "#E5E5E5";
        //Nodes
        this.node_fill = null;
        }
    }
  

    initTheme() {

        //UI

        //Color Picker UI
        jscolor.presets.default = {
            format:'rgba', previewSize:60, 
            palette:'rgba(238, 84, 84,1) rgba(243, 169, 56,1) rgba(251, 235, 113,1) rgba(89, 153, 89,1) rgba(103, 112, 228,1) rgba(188, 88, 206,1) rgba(122, 121, 118,1) rgba(210, 209, 205,1)', 
            paletteCols:9, backgroundColor:'rgb(8,22,34)', 
            borderColor:'rgba(151,151,151,1)', width:180, height:100, 
            mode:'HVS', closeButton:true, closeText:'Close Window', 
            buttonColor:'rgba(255,255,255,1)', 
            controlBorderColor:'rgba(115,115,115,1)', 
            shadowColor:'rgba(0,0,0,0.5)'

        };
        Logger.log("Theme Initialized");
    }


}
  

export { Theme }