const socket = io();

let firstUpdate = true;

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // Log coordinates for debugging
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

const map = L.map("map").setView([51.505, -0.09], 13); // Set an initial sensible view
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: "DEVELOPED BY YASH 😎😎"
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    if (firstUpdate) {
        map.setView([latitude, longitude], 16);
        firstUpdate = false;
    }

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});


socket.on('user-disconnected', (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
