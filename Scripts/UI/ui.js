import { Logger } from "../Debug/logger.js";
import { updateCanvasUI } from "./canvasUI.js";


function loadUI(appManager){
    const uiVersion = appManager.uiVersion;
    switch
    (uiVersion){
        case "default":
            loadUIDefault();
            break;
    }
}

function updateUI (canvasManager){
    updateCanvasUI(canvasManager);
}

function loadUIDefault(){
  Logger.log("Loading default UI");
  /*HTML*/
  let defaultHTML = `
  <div id="top-bar">
    <div id="top-left">
      <button id="home-button">
        <img src="Assets/Images/Icons/ui/Button_Home/LogoDarkLargeNoBG.svg" alt="Home">
        <span id="app-name">
        <span class="app-name-letter">H</span>
        <span class="app-name-letter">a</span>
        <span class="app-name-letter">p</span>
        <span class="app-name-letter">p</span>
        <span class="app-name-letter">y</span>
        <span class="app-name-letter">P</span>
        <span class="app-name-letter">r</span>
        <span class="app-name-letter">i</span>
        <span class="app-name-letter">s</span>
        <span class="app-name-letter">m</span>
        </span>
        </button>
    </div>
    <div id="top-center">
      <div id="main-title-div">
        <span id="main-title">Main Title</span>
      </div>
      <div id="secondary-title-div">
        <span id="secondary-title">Secondary Title</span>
      </div>
      <div id="tertiary-title-div">
        <span id="tertiary-title">Tertiary Title</span>
      </div>
    </div>
    <div id="top-right">
      <button id="search-button">
      <img src="Assets/Images/Icons/ui/Button_Search/search.svg" alt="Search">
      </button>
      <button id="canvas-menu-button">
        <img src="Assets/Images/Icons/ui/Button_Canvas_Menu/menu.svg" alt="Canvas Menu">
      </button>
      <button id="user-profile-button">
        <img src="Assets/Images/Icons/ui/Button_Profile/profile-circle.svg" alt="User Profile" class="circle-image">
      </button>
    </div>
  </div>
  <div id="lower-bar">
    <div id="lower-left">
      <button id="undo-button">
      <img src="Assets/Images/Icons/ui/Button_Undo/undo.svg" alt="Undo">
      </button>
      <button id="redo-button">
      <img src="Assets/Images/Icons/ui/Button_Redo/redo.svg" alt="Redo">
      </button>
    </div>
    <div id="lower-center">
      <button id="select-or-drag-button">
      <img src="Assets/Images/Icons/ui/Button_Cursor/cursor.svg" alt="Select">
      </button>
      <button id="add-shape-button">
      <img src="Assets/Images/Icons/ui/Button_Shape/circle.svg" alt="Add Shape">
      </button>
      <button id="add-text-button">
      <img src="Assets/Images/Icons/ui/Button_Text/text.svg" alt="Add Text">
      </button>
      <button id="draw-erase-button">
      <img src="Assets/Images/Icons/ui/Button_Draw/pencil.svg" alt="Draw or Erase">
      </button>
      <button id="add-other-button">
      <img src="Assets/Images/Icons/ui/Button_Apps/apps.svg" alt="Add Other">
      </button>
    </div>
    <div id="lower-right">
      <button id="mini-map-button">
      <img src="Assets/Images/Icons/ui/Button_Map/map.svg" alt="Map">
      </button>
      <button id="zoom-out-button">
      <img src="Assets/Images/Icons/ui/Button_Zoom/minus.svg" alt="Zoom Out">
      </button>
      <button id="zoom-in-button">
      <img src="Assets/Images/Icons/ui/Button_Zoom/plus.svg" alt="Zoom In">
      </button>
    </div>
  </div>
  <canvas id="canvas"></canvas>
  <div id="confirmation-modal" style="display:none;"></div>
  </div>`;
  document.body.innerHTML = defaultHTML;
}

export { loadUI, updateUI };