let mapInstance = null, marker = null;

function loadLeafletCSS() {
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }
}

function loadLeafletJS(callback) {
    if (typeof L !== 'undefined') { callback(); return; }
    if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = callback;
        document.body.appendChild(script);
    } else {
        const checkLoaded = setInterval(() => { if (typeof L !== 'undefined') { clearInterval(checkLoaded);
                callback(); } }, 100);
    }
}

export function initMapPicker(containerId, lat = 27.7172, lng = 85.3240, onLocationSelect = null) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    container.innerHTML = `<div class="map-loading"><i class="fas fa-spinner fa-spin"></i> Loading map...</div>`;
    loadLeafletCSS();
    loadLeafletJS(() => {
        mapInstance = L.map(containerId, { center: [lat, lng], zoom: 15, zoomControl: true, fadeAnimation: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors',
            maxZoom: 19 }).addTo(mapInstance);
        const icon = L.divIcon({ html: '<i class="fas fa-map-pin map-pin-icon"></i>',
            iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
        marker = L.marker([lat, lng], { draggable: true, icon: icon }).addTo(mapInstance);
        marker.on('dragend', function() { const pos = marker.getLatLng();
            updateLocation(pos.lat, pos.lng, onLocationSelect); });
        mapInstance.on('click', function(e) { const pos = e.latlng;
            marker.setLatLng(pos);
            updateLocation(pos.lat, pos.lng, onLocationSelect); });
        L.control.scale().addTo(mapInstance);
        setTimeout(() => mapInstance.invalidateSize(), 200);
        mapInstance._isLoaded = true;
        return mapInstance;
    });
    return null;
}

function updateLocation(lat, lng, onLocationSelect) {
    const latInput = document.getElementById('selectedLat'),
        lngInput = document.getElementById('selectedLng');
    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;
    const statusEl = document.getElementById('locationStatus');
    if (statusEl) statusEl.innerHTML = `📍 <span class="text-muted">Location:</span> ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    const addressInput = document.getElementById('addressInput');
    if (addressInput) {
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`)
            .then(r => r.json()).then(data => { if (data && data.display_name) { addressInput.value = data.display_name; if (
                        statusEl) statusEl.innerHTML = `📍 <span class="text-muted">Location:</span> ${data.display_name}`; } })
            .catch(() => {});
    }
    if (onLocationSelect) onLocationSelect(lat, lng);
}

export function getMapPosition() { if (marker) { const pos = marker.getLatLng(); return { lat: pos.lat, lng: pos.lng }; } return null; }

export function setMapPosition(lat, lng, zoom = 15) {
    if (mapInstance && marker) { marker.setLatLng([lat, lng]);
        mapInstance.setView([lat, lng], zoom);
        const latInput = document.getElementById('selectedLat'),
            lngInput = document.getElementById('selectedLng'); if (latInput) latInput.value = lat; if (lngInput) lngInput.value =
            lng; }
}

export function getRouteUrl(lat, lng) { return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`; }

export function initStaticMap(containerId, lat, lng, popupContent = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<div class="map-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;
    loadLeafletCSS();
    loadLeafletJS(() => {
        const map = L.map(containerId, { center: [lat, lng], zoom: 14, zoomControl: false, attributionControl: false,
            fadeAnimation: true, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap',
            maxZoom: 19 }).addTo(map);
        const icon = L.divIcon({ html: '<i class="fas fa-map-pin map-pin-icon small"></i>',
            iconSize: [28, 28], iconAnchor: [14, 28] });
        const marker = L.marker([lat, lng], { icon: icon }).addTo(map);
        if (popupContent) marker.bindPopup(popupContent).openPopup();
        setTimeout(() => map.invalidateSize(), 200);
        container._leafletMap = map;
    });
}

export function destroyMap() { if (mapInstance) { mapInstance.remove();
        mapInstance = null;
        marker = null; } }