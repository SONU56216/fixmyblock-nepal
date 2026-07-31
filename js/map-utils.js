// ================================================================
// FIXMYBLOCK NEPAL - MAP UTILITIES (Leaflet + OpenStreetMap)
// COMPLETELY FREE – NO API KEY REQUIRED
// ================================================================

let mapInstance = null;
let marker = null;
let mapInitialized = false;

/**
 * Load Leaflet CSS dynamically
 */
function loadLeafletCSS() {
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }
}

/**
 * Load Leaflet JS dynamically and call callback
 */
function loadLeafletJS(callback) {
    if (typeof L !== 'undefined') {
        callback();
        return;
    }
    if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = callback;
        document.body.appendChild(script);
    } else {
        // Script exists but not loaded yet? Wait for it.
        const checkLoaded = setInterval(() => {
            if (typeof L !== 'undefined') {
                clearInterval(checkLoaded);
                callback();
            }
        }, 100);
    }
}

/**
 * Initialize the map for location picker
 * @param {string} containerId - The ID of the map container div
 * @param {number} lat - Initial latitude
 * @param {number} lng - Initial longitude
 * @param {Function} onLocationSelect - Callback when location is selected
 */
export function initMapPicker(containerId, lat = 27.7172, lng = 85.3240, onLocationSelect = null) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Map container not found:', containerId);
        return null;
    }

    // Show loading
    container.innerHTML = `<div class="map-loading">
        <i class="fas fa-spinner fa-spin"></i> Loading map...
    </div>`;

    loadLeafletCSS();
    loadLeafletJS(() => {
        // Create the map
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

        // Custom marker
        const markerIcon = L.divIcon({
            html: '<i class="fas fa-map-pin" style="font-size:32px;color:#ea4335;text-shadow:0 2px 4px rgba(0,0,0,0.2);"></i>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        });

        marker = L.marker([lat, lng], {
            draggable: true,
            icon: markerIcon,
        }).addTo(mapInstance);

        // Update on drag end
        marker.on('dragend', function() {
            const pos = marker.getLatLng();
            updateLocation(pos.lat, pos.lng, onLocationSelect);
        });

        // Update on map click
        mapInstance.on('click', function(e) {
            const pos = e.latlng;
            marker.setLatLng(pos);
            updateLocation(pos.lat, pos.lng, onLocationSelect);
        });

        // Add scale control
        L.control.scale().addTo(mapInstance);

        // Resize after a moment
        setTimeout(() => {
            mapInstance.invalidateSize();
        }, 200);

        mapInitialized = true;
        mapInstance._isLoaded = true;

        // If we have an address input, we can add reverse geocoding via Nominatim (free)
        // But we'll keep it simple for now – user can see coordinates.

        // Return the map instance
        return mapInstance;
    });

    return null;
}

/**
 * Update location when marker moves
 */
function updateLocation(lat, lng, onLocationSelect) {
    // Update hidden fields
    const latInput = document.getElementById('selectedLat');
    const lngInput = document.getElementById('selectedLng');
    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;

    // Update status display
    const statusEl = document.getElementById('locationStatus');
    if (statusEl) {
        statusEl.innerHTML = `📍 <span class="text-muted">Location:</span> ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    // Optional: reverse geocode to get address using Nominatim (free)
    // We'll do it asynchronously – just update address input if exists
    const addressInput = document.getElementById('addressInput');
    if (addressInput) {
        // Use Nominatim API for reverse geocoding (free, no key)
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
                if (data && data.display_name) {
                    addressInput.value = data.display_name;
                    if (statusEl) {
                        statusEl.innerHTML = `📍 <span class="text-muted">Location:</span> ${data.display_name}`;
                    }
                }
            })
            .catch(() => {
                // Silent fail – coordinates are enough
            });
    }

    if (onLocationSelect) {
        onLocationSelect(lat, lng);
    }
}

/**
 * Get current marker position
 * @returns {Object|null} {lat, lng} or null
 */
export function getMapPosition() {
    if (marker) {
        const pos = marker.getLatLng();
        return { lat: pos.lat, lng: pos.lng };
    }
    return null;
}

/**
 * Set map position programmatically
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} zoom - Zoom level (default 15)
 */
export function setMapPosition(lat, lng, zoom = 15) {
    if (mapInstance && marker) {
        marker.setLatLng([lat, lng]);
        mapInstance.setView([lat, lng], zoom);
        // Update hidden fields
        const latInput = document.getElementById('selectedLat');
        const lngInput = document.getElementById('selectedLng');
        if (latInput) latInput.value = lat;
        if (lngInput) lngInput.value = lng;
    }
}

/**
 * Initialize static map for admin dashboard (no interaction)
 * @param {string} containerId - Container ID
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} popupContent - HTML content for popup (optional)
 */
export function initStaticMap(containerId, lat, lng, popupContent = '') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Static map container not found:', containerId);
        return;
    }

    // Show loading
    container.innerHTML = `<div class="map-loading">
        <i class="fas fa-spinner fa-spin"></i> Loading...
    </div>`;

    loadLeafletCSS();
    loadLeafletJS(() => {
        const map = L.map(containerId, {
            center: [lat, lng],
            zoom: 14,
            zoomControl: false,
            attributionControl: false,
            fadeAnimation: true,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19,
        }).addTo(map);

        const markerIcon = L.divIcon({
            html: '<i class="fas fa-map-pin" style="font-size:28px;color:#ea4335;text-shadow:0 2px 4px rgba(0,0,0,0.2);"></i>',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
        });

        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        if (popupContent) {
            marker.bindPopup(popupContent).openPopup();
        }

        // Resize after a moment
        setTimeout(() => {
            map.invalidateSize();
        }, 200);

        // Store map reference for potential cleanup
        container._leafletMap = map;
    });
}

/**
 * Destroy map instance (cleanup)
 */
export function destroyMap() {
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
        marker = null;
        mapInitialized = false;
    }
}