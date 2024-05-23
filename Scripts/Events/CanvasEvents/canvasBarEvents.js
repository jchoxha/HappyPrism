function setUpCanvasBarEvents(canvasManager){
    
    setUpTopBarEvents(canvasManager);
    setUpLowerBarEvents();
}

function setUpTopBarEvents(canvasManager) {
    const theme = canvasManager.theme;
    const buttons = {
        'home-button': handleHomeButtonClick,
        'search-button': handleSearchButtonClick,
        'canvas-menu-button': handleCanvasMenuButtonClick,
        'user-profile-button': handleUserProfileButtonClick,
    };

    for (const [id, handler] of Object.entries(buttons)) {
        const button = document.getElementById(id);
        if (button && id !== 'home-button') {  // Exclude home button
            button.addEventListener('mousedown', handleButtonMouseDown);
            button.addEventListener('mouseup', handleButtonMouseUp);
            button.addEventListener('click', handleButtonClick);
        }
    }

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
            button.addEventListener('click', handleButtonClick);
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

function handleButtonClick(event) {
    const button = event.currentTarget;
    let buttons = null;
    if(button.closest('#top-right')) {
        buttons = document.querySelectorAll('#top-right button');
    } else if(button.closest('#lower-center')) {
        buttons = document.querySelectorAll('#lower-center button');
    } 
        
    
    if (buttons != null) {
        Logger.log(buttons);
        buttons.forEach(btn => {
            btn.classList.remove('button-active');
        });
        button.classList.add('button-active');
        
    }
}




//Top Bar Button Click Event Handlers

//Top Left
function handleHomeButtonClick() {
    Logger.log('Home button clicked');
}


//Top Right
function handleSearchButtonClick() {
    Logger.log('Search button clicked');
}

function handleCanvasMenuButtonClick() {
    Logger.log('Canvas menu button clicked');
}

function handleUserProfileButtonClick() {
    Logger.log('User profile button clicked');
}


//Lower Bar Button Click Event Handlers

//Lower Left
function handleUndoButtonClick() {
    Logger.log('Undo button clicked');
}
function handleRedoButtonClick() {
    Logger.log('Redo button clicked');
}
//Lower Center
function handleSelectOrDragButtonClick() {
    Logger.log('Select or Drag button clicked');
}

function handleAddShapeButtonClick() {
    Logger.log('Add Shape button clicked');
}

function handleAddTextButtonClick() {
    Logger.log('Add Text button clicked');
}

function handleDrawEraseButtonClick() {
    Logger.log('Draw or Erase button clicked');
}

function handleAddOtherButtonClick() {
    Logger.log('Add Other button clicked');
}


//Lower Right
function handleMiniMapButtonClick() {
    Logger.log('Mini Map button clicked');
}

function handleZoomOutButtonClick() {
    Logger.log('Zoom Out button clicked');
}

function handleZoomInButtonClick() {
    Logger.log('Zoom In button clicked');
}

export {setUpCanvasBarEvents};