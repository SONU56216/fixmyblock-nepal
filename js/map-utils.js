// ================================================================
// FIXMYBLOCK NEPAL - MAP UTILITIES (Leaflet + OpenStreetMap)
// ================================================================

import { getTranslation } from './translations.js';

let mapInstance = null;
let marker = null;

/**
 * Initialize the map for location picker
 * @param {string} containerId - The ID of the map container div
 * @param {number} lat - Initial latitude (optional)
 * @param {number} lng - Initial longitude (optional)
 * @param {Function} onLocationSelect - Callback when location is selected
 * @returns {Object} Map instance
 */
export function initMapPicker(containerId, lat = 27.7172, lng = 85.3240, onLocationSelect = null) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    // Show loading
    container.innerHTML = `<div style="text-align:center;padding:20px;color:#888;">
        <i class="fas fa-spinner fa-spin"></i> ${getTranslation('mapLoading')}
    </div>`;

    // Load Leaflet CSS and JS dynamically
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
            // Script loaded, initialize map
            initializeMap(containerId, lat, lng, onLocationSelect);
        };
        document.body.appendChild(script);
    } else {
        // Already loaded
        initializeMap(containerId, lat, lng, onLocationSelect);
    }

    return mapInstance;
}

function initializeMap(containerId, lat, lng, onLocationSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create map
    mapInstance = L.map(containerId, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        fadeAnimation: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(mapInstance);

    // Add marker (draggable)
    const markerIcon = L.divIcon({
        html: '<i class="fas fa-map-pin" style="font-size:32px;color:#ea4335;"></i>',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    marker = L.marker([lat, lng], {
        draggable: true,
        icon: markerIcon,
    }).addTo(mapInstance);

    // Update location on drag end
    marker.on('dragend', function() {
        const pos = marker.getLatLng();
        if (onLocationSelect) {
            onLocationSelect(pos.lat, pos.lng);
        }
    });

    // Update location on map click
    mapInstance.on('click', function(e) {
        const pos = e.latlng;
        marker.setLatLng(pos);
        if (onLocationSelect) {
            onLocationSelect(pos.lat, pos.lng);
        }
    });

    // Add scale control
    L.control.scale().addTo(mapInstance);

    // Return map instance
    return mapInstance;
}

/**
 * Get the current marker position
 * @returns {Object} {lat, lng}
 */
export function getMapPosition() {
    if (marker) {
        const pos = marker.getLatLng();
        return { lat: pos.lat, lng: pos.lng };
    }
    return null;
}

/**
 * Update marker position
 * @param {number} lat - New latitude
 * @param {number} lng - New longitude
 */
export function setMapPosition(lat, lng) {
    if (marker) {
        marker.setLatLng([lat, lng]);
        mapInstance.setView([lat, lng], 15);
    }
}

/**
 * Destroys map instance
 */
export function destroyMap() {
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
        marker = null;
    }
}

/**
 * Initialize a static map view (for admin dashboard)
 * @param {string} containerId - Container ID
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} popupContent - HTML content for popup (optional)
 */
export function initStaticMap(containerId, lat, lng, popupContent = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Show loading
    container.innerHTML = `<div style="text-align:center;padding:10px;color:#888;">
        <i class="fas fa-spinner fa-spin"></i> ${getTranslation('mapLoading')}
    </div>`;

    // Ensure Leaflet loaded
    if (typeof L === 'undefined') {
        // Load leaflet if not loaded
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
        if (!document.getElementById('leaflet-js')) {
            const script = document.createElement('script');
            script.id = 'leaflet-js';
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
                createStaticMap(containerId, lat, lng, popupContent);
            };
            document.body.appendChild(script);
        } else {
            createStaticMap(containerId, lat, lng, popupContent);
        }
    } else {
        createStaticMap(containerId, lat, lng, popupContent);
    }
}

function createStaticMap(containerId, lat, lng, popupContent) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const map = L.map(containerId, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
    }).addTo(map);

    const markerIcon = L.divIcon({
        html: '<i class="fas fa-map-pin" style="font-size:28px;color:#ea4335;"></i>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
    });

    const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);

    if (popupContent) {
        marker.bindPopup(popupContent).openPopup();
    }

    // Disable scroll zoom on static maps
    map.scrollWheelZoom.disable();

    // Resize map after a short delay
    setTimeout(() => {
        map.invalidateSize();
    }, 200);

    return map;
}