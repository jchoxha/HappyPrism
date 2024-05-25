import { Logger } from "../../Debug/logger.js";

import { closeAllPopups, toggleSelectOrDragMenu, toggleAddShapeMenu } from "../../UI/canvasUI.js"

let canvasManager = null;

function setUpCanvasBarEvents(appManager){

    canvasManager = appManager.canvasManager;
    setUpTopBarEvents();
    setUpLowerBarEvents();
}

function updateCanvasBarEvents(appManager){
    canvasManager = appManager.canvasManager;
}

function setUpTopBarEvents() {
    
    let theme = null;
    if(canvasManager) theme = canvasManager.theme;
    else return;
    const buttons = {
        'home-button': handleHomeButtonClick,
        'search-button': handleSearchButtonClick,
        'canvas-menu-button': handleCanvasMenuButtonClick,
        'user-profile-button': handleUserProfileButtonClick,
    };

    for (const [id, handler] of Object.entries(buttons)) {
        const button = document.getElementById(id);
        //need to fix this so it doesn't target all buttons, but nothing is broken for now
        if (button && id !== 'home-button') {  // Exclude home button
            button.addEventListener('mousedown', handleButtonMouseDown);
            button.addEventListener('mouseup', handleButtonMouseUp);
            button.addEventListener('click', handler);
        }
    }

    handleHomeButtonHover();

    function handleHomeButtonHover(){
                //Custom Hover For Home Button
        const homeButton = document.getElementById('home-button');
        const letters = document.querySelectorAll('.app-name-letter');

        let letterAnimation;
        let logoAnimation;

        function animateLogo() {
            if (logoAnimation) logoAnimation.pause();
            logoAnimation = anime({
                targets: '#home-button img',
                translateY: [
                    { value: -2.5, duration: 500 },
                    { value: 0, duration: 500 },
                    { value: 2.5, duration: 500 },
                    { value: 0, duration: 500 }
                ],
                easing: 'linear',
                loop: true,
                
            });
        }
        
        function animateLogoBackToDefault() {
            if (logoAnimation) logoAnimation.pause();
            logoAnimation = anime({
                targets: '#home-button img',
                translateY: 0,
                easing: 'spring(1, 80, 10, 0)',
                duration: 500,
                complete: () => {
                    anime.remove('#home-button img');
                }
            });
        }
    
        const animateLetters = () => {
            if (letterAnimation) letterAnimation.pause();
            letterAnimation = anime({
                targets: letters,
                color: [
                    { value: '#FF0000' }, // Red
                    { value: '#FF7F00' }, // Orange
                    { value: '#FFFF00' }, // Yellow
                    { value: '#00FF00' }, // Green
                    { value: '#0000FF' }, // Blue
                    { value: '#4B0082' }, // Indigo
                    { value: '#9400D3' }, // Violet
                    { value: theme.button_bg_color }, // BG Color
                ],
                easing: 'linear',
                duration: 2500,
                loop: 1,
                delay: anime.stagger(100, { start: 0, direction: 'normal' }),
                complete: function() {
                    animateLetters();
                },
            });
        };

        const animateBackToBlack = () => {
            if (letterAnimation) letterAnimation.pause();
            letterAnimation = anime({
                targets: letters,
                color:  theme.button_text_color,
                easing: 'linear',
                duration: 500,
                delay: anime.stagger(100, { start: 0, direction: 'normal' }),
                complete: () => {
                    anime.remove(letters);
                }
            });
        };
    
        homeButton.addEventListener('mouseover', () => {
            animateLogo();
            animateLetters();
        });
    
        homeButton.addEventListener('mouseout', () => {
            animateLogoBackToDefault()
            animateBackToBlack();
        });
    }

}

function setUpLowerBarEvents() {
    const buttons = {
        'undo-button': handleUndoButtonClick,
        'redo-button': handleRedoButtonClick,
        'select-or-drag-button': handleSelectOrDragButtonClick,
        'add-shape-button': handleAddShapeButtonClick,
        'add-text-button': handleAddTextButtonClick,
        'draw-erase-button': handleDrawEraseButtonClick,
        'add-other-button': handleAddOtherButtonClick,
        'mini-map-button': handleMiniMapButtonClick,
        'zoom-out-button': handleZoomOutButtonClick,
        'zoom-in-button': handleZoomInButtonClick,
    };

    for (const [id, handler] of Object.entries(buttons)) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('mousedown', handleButtonMouseDown);
            button.addEventListener('mouseup', handleButtonMouseUp);
            button.addEventListener('click', handler);
        }
    }
}

function handleButtonMouseDown(event) {
    const button = event.currentTarget;
    button.classList.add('button-overlay');
    
}

function handleButtonMouseUp(event) {
    const button = event.currentTarget;
    button.classList.remove('button-overlay');
}


function handleAllButtonClick(event) {
    closeAllPopups();
    const button = event.currentTarget;
    let buttons = null;
    if(button.closest('#top-right')) {
        buttons = document.querySelectorAll('#top-right button');
    } else if(button.closest('#lower-center')) {
        buttons = document.querySelectorAll('#lower-center button');
    } 
        
    
    if (buttons != null) {
        buttons.forEach(btn => {
            btn.classList.remove('button-active');
        });
        button.classList.add('button-active');
        
    }
}



//Top Bar Button Click Event Handlers

//Top Left
function handleHomeButtonClick(event) {
    Logger.log('Home button clicked');
    handleAllButtonClick(event);
}


//Top Right
function handleSearchButtonClick(event) {
    Logger.log('Search button clicked');
    handleAllButtonClick(event);
}

function handleCanvasMenuButtonClick(event) {
    Logger.log('Canvas menu button clicked');
    handleAllButtonClick(event);
}

function handleUserProfileButtonClick(event) {
    Logger.log('User profile button clicked');
    handleAllButtonClick(event);
}


//Lower Bar Button Click Event Handlers

//Lower Left
function handleUndoButtonClick(event) {
    Logger.log('Undo button clicked');
    handleAllButtonClick(event);
}
function handleRedoButtonClick(event) {
    Logger.log('Redo button clicked');
    handleAllButtonClick(event);
}
//Lower Center
function handleSelectOrDragButtonClick(event) {
    Logger.log('Select or Drag button clicked');
    handleAllButtonClick(event);
    toggleSelectOrDragMenu();
}

function handleAddShapeButtonClick(event) {
    Logger.log('Add Shape button clicked');
    handleAllButtonClick(event);
    toggleAddShapeMenu();
}

function handleAddTextButtonClick(event) {
    Logger.log('Add Text button clicked');
    handleAllButtonClick(event);
}

function handleDrawEraseButtonClick(event) {
    Logger.log('Draw or Erase button clicked');
    handleAllButtonClick(event);
}

function handleAddOtherButtonClick(event) {
    Logger.log('Add Other button clicked');
    handleAllButtonClick(event);
}


//Lower Right
function handleMiniMapButtonClick(event) {
    Logger.log('Mini Map button clicked');
    handleAllButtonClick(event);
}

function handleZoomOutButtonClick(event) {
    Logger.log('Zoom Out button clicked');
    handleAllButtonClick(event);
}

function handleZoomInButtonClick(event) {
    Logger.log('Zoom In button clicked');
    handleAllButtonClick(event);
}

export {setUpCanvasBarEvents, updateCanvasBarEvents};