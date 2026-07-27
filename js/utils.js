// ================================================================
// FIXMYBLOCK NEPAL - UTILITY FUNCTIONS
// ================================================================

// ================================================================
//  TOAST NOTIFICATIONS
// ================================================================

export function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-global');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-global toast-${type}`;
    toast.textContent = message;

    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '400px',
        width: '90%',
        background: type === 'success' ? '#1b5e20' : type === 'error' ? '#b71c1c' : '#0d47a1',
        color: '#fff',
        padding: '14px 20px',
        borderRadius: '14px',
        textAlign: 'center',
        fontWeight: '500',
        zIndex: '9999',
        boxShadow: '0 8px 30px rgba(0,0,0,0.30)',
        opacity: '0',
        transition: 'opacity 0.3s, transform 0.3s',
        pointerEvents: 'none'
    });

    document.body.appendChild(toast);

    // Show toast
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Hide and remove after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ================================================================
//  VALIDATION
// ================================================================

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
}

export function validateRequired(value) {
    return value && value.trim().length > 0;
}

export function validateMinLength(value, minLength) {
    return value && value.length >= minLength;
}

// ================================================================
//  FORMATTING
// ================================================================

export function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-NP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatCurrency(amount, currency = 'NPR') {
    return new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount);
}

export function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ================================================================
//  GEOLOCATION
// ================================================================

export function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }),
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

export function getLocationName(lat, lng) {
    // Simple location mapping for demo
    const locations = [
        { name: 'New Road, Kathmandu', lat: 27.7172, lng: 85.3240 },
        { name: 'Thamel, Kathmandu', lat: 27.7167, lng: 85.3190 },
        { name: 'Baneshwor, Kathmandu', lat: 27.6920, lng: 85.3350 },
        { name: 'Sundhara, Kathmandu', lat: 27.7020, lng: 85.3180 },
        { name: 'Swayambhu, Kathmandu', lat: 27.7100, lng: 85.2920 },
        { name: 'Patan, Lalitpur', lat: 27.6740, lng: 85.3240 },
        { name: 'Bhaktapur, Kathmandu', lat: 27.6720, lng: 85.4290 },
    ];
    const closest = locations.reduce((best, loc) => {
        const d = Math.abs(loc.lat - lat) + Math.abs(loc.lng - lng);
        return d < best.d ? { loc, d } : best;
    }, { loc: locations[0], d: Infinity });
    return closest.loc.name;
}

// ================================================================
//  FILE HELPERS
// ================================================================

export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

export function getFileSizeMB(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2);
}

export function isImageFile(file) {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    return imageTypes.includes(file.type);
}

// ================================================================
//  RANDOM ID GENERATOR
// ================================================================

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ================================================================
//  COPY TO CLIPBOARD
// ================================================================

export function copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
}

// ================================================================
//  DOWNLOAD FILE
// ================================================================

export function downloadFile(data, filename, type = 'text/csv') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}