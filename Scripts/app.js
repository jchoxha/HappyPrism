import { Logger } from './Debug/logger.js'
import { AppManager} from './Classes/appManagerClass.js';


document.addEventListener('DOMContentLoaded', () => {
    const appManager = new AppManager();
    function animate() {
        appManager.update();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
});


