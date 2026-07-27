// ================================================================
// FIXMYBLOCK NEPAL - PRIORITY CALCULATION
// ================================================================

/**
 * Priority levels based on affected count
 */
export const PRIORITY_LEVELS = {
    LOW: { label: 'Low', color: '#34a853', bg: '#e8f5e9', icon: 'fa-arrow-down' },
    MEDIUM: { label: 'Medium', color: '#fbbc04', bg: '#fff8e1', icon: 'fa-minus' },
    HIGH: { label: 'High', color: '#ff6b00', bg: '#fff3e0', icon: 'fa-arrow-up' },
    CRITICAL: { label: 'Critical', color: '#ea4335', bg: '#fce4ec', icon: 'fa-exclamation-triangle' }
};

/**
 * Calculate priority based on affected count
 * @param {number} affectedCount - Number of affected citizens
 * @returns {string} Priority level ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
 */
export function calculatePriority(affectedCount) {
    if (affectedCount >= 100) return 'CRITICAL';
    if (affectedCount >= 31) return 'HIGH';
    if (affectedCount >= 11) return 'MEDIUM';
    return 'LOW';
}

/**
 * Get priority details for display
 * @param {string} priority - Priority level
 * @returns {object} Priority details (label, color, bg, icon)
 */
export function getPriorityDetails(priority) {
    return PRIORITY_LEVELS[priority] || PRIORITY_LEVELS.LOW;
}

/**
 * Get priority badge HTML
 * @param {string} priority - Priority level
 * @returns {string} HTML for priority badge
 */
export function getPriorityBadge(priority) {
    const details = getPriorityDetails(priority);
    return `<span class="priority-badge priority-${priority.toLowerCase()}">
        <i class="fas ${details.icon}"></i> ${details.label}
    </span>`;
}