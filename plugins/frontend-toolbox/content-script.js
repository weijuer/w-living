// import { calculateDrillo } from '../content-scripts/drillo.js'

const button = new DOMParser().parseFromString(
    '<button>Click to open side panel</button>',
    'text/html'
).body.firstElementChild;

button.addEventListener('click', function () {
    chrome.runtime.sendMessage({ type: 'open_side_panel' });
});
// document.body.append(button);

const header = document.querySelector('h1');

const generateDMS = (coords, isLat) => {
    const absCoords = Math.abs(coords);
    const deg = Math.floor(absCoords);
    const min = Math.floor((absCoords - deg) * 60);
    const sec = ((absCoords - deg - min / 60) * 3600).toFixed(1);
    const direction = coords >= 0 ? (isLat ? 'N' : 'E') : isLat ? 'S' : 'W';

    return `${deg}°${min}'${sec}"${direction}`;
};

navigator.geolocation.getCurrentPosition(
    (loc) => {
        const { coords } = loc;
        let { latitude, longitude } = coords;
        latitude = generateDMS(latitude, true);
        longitude = generateDMS(longitude);

        console.log(`position: ${latitude}, ${longitude}`);
    },
    (err) => {
        // header.innerText = 'error (check console)';
        console.error(err);
    }
);

// calculateDrillo();