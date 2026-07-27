// ================================================================
// FIXMYBLOCK NEPAL - ADMIN DASHBOARD (UPDATED)
// ================================================================

import { db, auth } from './firebase-config.js';
import { getPriorityDetails } from './priority.js';

// ... existing code ...

// ================================================================
//  RENDER ADMIN REPORTS (WITH PRIORITY & AFFECTED COUNT)
// ================================================================

function renderAdminReports() {
    const container = document.getElementById('adminReportList');

    if (filteredReports.length === 0) {
        container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No reports found</h3>
                    <p>${allReports.length === 0 ? 'No reports submitted yet.' : 'Try adjusting your search.'}</p>
                </div>
            `;
        return;
    }

    container.innerHTML = filteredReports.map(r => {
        const priorityDetails = getPriorityDetails(r.priority || 'LOW');
        const affectedCount = r.affectedCount || 0;
        const supportCount = (r.supportedBy || []).length;
        
        return `
                <div class="admin-report-item">
                    <div class="info">
                        <div class="title">
                            #${r.id.substring(0, 8)} 
                            <i class="fas ${getCategoryIcon(r.category)}" style="color:#1a73e8;"></i>
                            ${getCategoryLabel(r.category)}
                            <span class="priority-badge priority-${(r.priority || 'LOW').toLowerCase()}">
                                <i class="fas ${priorityDetails.icon}"></i> ${priorityDetails.label}
                            </span>
                        </div>
                        <div class="loc"><i class="fas fa-location-dot"></i> ${r.location || 'Unknown'}</div>
                        <div class="meta">
                            ${formatTimestamp(r.createdAt)} · 
                            ${r.submittedBy || 'Anonymous'} · 
                            ${r.latitude ? `${r.latitude.toFixed(4)}, ${r.longitude?.toFixed(4) || ''}` : ''}
                        </div>
                        <div class="community-stats">
                            <span class="stat-item">
                                <i class="fas fa-users"></i> ${affectedCount} affected
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-hand-peace"></i> ${supportCount} supporters
                            </span>
                        </div>
                        ${r.description ? `<div class="desc">📝 ${r.description}</div>` : ''}
                        ${r.photoUrl ? `<div class="photo-link">📷 <a href="${r.photoUrl}" target="_blank">View Photo</a></div>` : ''}
                    </div>
                    <div class="actions">
                        <span class="status-badge ${getStatusClass(r.status || 'submitted')}">${getStatusLabel(r.status || 'submitted')}</span>
                        <select onchange="updateStatus('${r.id}', this.value)">
                            <option value="submitted" ${(r.status || 'submitted') === 'submitted' ? 'selected' : ''}>Submitted</option>
                            <option value="reviewing" ${(r.status || 'submitted') === 'reviewing' ? 'selected' : ''}>Under Review</option>
                            <option value="in_progress" ${(r.status || 'submitted') === 'in_progress' ? 'selected' : ''}>In Progress</option>
                            <option value="resolved" ${(r.status || 'submitted') === 'resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="rejected" ${(r.status || 'submitted') === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                        <button class="btn btn-danger btn-sm" onclick="deleteReport('${r.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
    }).join('');
}

// ================================================================
//  ADMIN FILTERS (ADD TO admin.html)
// ================================================================

window.filterByPriority = function(priority) {
    // Add priority filter logic
    const filtered = allReports.filter(r => 
        (r.priority || 'LOW') === priority
    );
    filteredReports = filtered;
    renderAdminReports();
};

window.sortReports = function(sortBy) {
    let sorted = [...allReports];
    switch(sortBy) {
        case 'priority':
            const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
            sorted.sort((a, b) => 
                priorityOrder[a.priority || 'LOW'] - priorityOrder[b.priority || 'LOW']
            );
            break;
        case 'supported':
            sorted.sort((a, b) => 
                (b.affectedCount || 0) - (a.affectedCount || 0)
            );
            break;
        case 'newest':
            sorted.sort((a, b) => 
                (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
            );
            break;
        case 'oldest':
            sorted.sort((a, b) => 
                (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0)
            );
            break;
        default:
            break;
    }
    filteredReports = sorted;
    renderAdminReports();
};