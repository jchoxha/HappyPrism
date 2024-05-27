import { Logger } from "../Debug/logger.js";

function loadTippyJS() {
    // Load Tippy.js CSS
    const tippyCSS = document.createElement('link');
    tippyCSS.rel = 'stylesheet';
    tippyCSS.href = 'https://unpkg.com/tippy.js@6/dist/tippy.css';
    document.head.appendChild(tippyCSS);

    // Load Popper.js
    const popperScript = document.createElement('script');
    popperScript.src = 'https://unpkg.com/@popperjs/core@2';
    popperScript.async = false;
    popperScript.onload = () => {
        // Load Tippy.js after Popper.js has loaded
        const tippyScript = document.createElement('script');
        tippyScript.src = 'https://unpkg.com/tippy.js@6';
        tippyScript.async = false;
        tippyScript.onload = initializeTippy;
        document.head.appendChild(tippyScript);
        tippyScript.onload = () => {
            // Load Tippy.js animations
            const tippyPerspectiveAnimationLink = document.createElement('link');
            tippyPerspectiveAnimationLink.rel = 'stylesheet';
            tippyPerspectiveAnimationLink.href = 'https://unpkg.com/tippy.js@6/animations/perspective.css';
            document.head.appendChild(tippyPerspectiveAnimationLink);
            initializeTippy();
        };
    };
    document.head.appendChild(popperScript);
}

const canvasUIButtonGroups = [
    { selector: '#top-left button', placement: 'bottom' },
    { selector: '#top-center button', placement: 'bottom' },
    { selector: '#top-right button', placement: 'bottom' },
    { selector: '#lower-left button', placement: 'top' },
    { selector: '#lower-center button', placement: 'top' },
    { selector: '#lower-right button', placement: 'top' }
];

// Initialize Tippy.js tooltips
function initializeTippy() {
    initializeTippySingletons(canvasUIButtonGroups);
}

function initializeTippySingletons(buttonGroups) {
    buttonGroups.forEach(group => initializeTippyGroup(group.selector, group.placement));
}

function initializeTippyGroup(selector, placement) {
    const buttons = document.querySelectorAll(selector);
    const tooltips = tippy(buttons, {
        content(reference) {
            return reference.querySelector('img').getAttribute('alt') || reference.innerText;
        },
        placement: placement,
        animation: 'perspective', // Set the desired animation
        theme: 'translucent', // Set the desired theme
        delay: [500, 0],
        arrow: true, // Ensure this matches the desired arrow setting
        interactive: true,
        allowHTML: true
    });

    tippy.createSingleton(tooltips, {
        delay: [500, 0],
        moveTransition: 'transform 0.2s ease-out',
        overrides: ['placement', 'theme', 'animation', 'arrow', 'interactive', 'allowHTML', 'touch'] // Explicitly override these options
    });
}


export { loadTippyJS };