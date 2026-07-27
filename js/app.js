// ================================================================
// FIXMYBLOCK NEPAL - MAIN APP (UPDATED WITH DUPLICATE DETECTION)
// ================================================================

import { auth } from './firebase-config.js';
import { submitReport } from './report.js';
import { supportReport, hasUserSupported } from './support.js';
import { showToast } from './utils.js';

// ... existing code ...

// ================================================================
//  SUBMIT REPORT (CALLBACK FOR DUPLICATE HANDLING)
// ================================================================

document.getElementById('submitReportBtn').addEventListener('click', async function() {
    const btn = this;
    if (btn.disabled) return;

    if (!selectedCategory) {
        document.getElementById('formCategoryError').style.display = 'block';
        showToast('Please select a category', 'error');
        return;
    }

    const location = document.getElementById('locationInput').value.trim() || currentLocationName || 'Kathmandu, Nepal';
    const description = document.getElementById('descriptionInput').value.trim();
    const name = document.getElementById('nameInput').value.trim() || 'Anonymous';

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Submitting...';

    try {
        // Get current user
        const user = auth.currentUser;
        const userId = user ? user.uid : null;

        const result = await submitReport({
            category: selectedCategory,
            description: description || 'No description provided',
            location: location,
            latitude: currentLat || null,
            longitude: currentLng || null,
            photoFile: document.getElementById('photoInput').files[0] || null,
            submittedBy: name,
        }, userId, name);

        if (result.success) {
            // Success - reset form and go home
            resetForm();
            showToast('✅ Report submitted successfully!', 'success');
            showScreen('home');
        } else if (result.duplicate) {
            // Duplicate found - show modal
            showDuplicateModal(result.duplicate, userId);
        } else {
            // Other error
            showToast('❌ Error: ' + (result.error || 'Unknown error'), 'error');
        }

    } catch (error) {
        console.error('Submit error:', error);
        showToast('❌ Error: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Report';
    }
});

// ================================================================
//  DUPLICATE MODAL
// ================================================================

function showDuplicateModal(duplicate, userId) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'duplicate-modal-overlay';
    overlay.id = 'duplicateModal';
    
    const dateStr = duplicate.createdAt ? 
        new Date(duplicate.createdAt.toMillis()).toLocaleDateString('en-NP', {
            year: 'numeric', month: 'short', day: 'numeric'
        }) : 'Recently';
    
    // Build modal HTML
    overlay.innerHTML = `
        <div class="duplicate-modal glassmorphism">
            <div class="modal-header">
                <div class="modal-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Similar Issue Already Reported</h2>
                <p class="modal-subtitle">This issue has already been reported nearby. Instead of creating a duplicate, you can show your support!</p>
            </div>
            
            <div class="modal-body">
                <div class="duplicate-report-card">
                    ${duplicate.photoUrl ? `<img src="${duplicate.photoUrl}" alt="Report photo" class="duplicate-photo" />` : 
                        `<div class="duplicate-photo placeholder"><i class="fas fa-image"></i></div>`}
                    
                    <div class="duplicate-info">
                        <div class="duplicate-category">
                            <i class="fas ${getCategoryIcon(duplicate.category)}"></i>
                            ${getCategoryLabel(duplicate.category)}
                        </div>
                        <div class="duplicate-location">
                            <i class="fas fa-location-dot"></i> ${duplicate.location}
                        </div>
                        <div class="duplicate-meta">
                            <span class="duplicate-date">📅 ${dateStr}</span>
                            <span class="duplicate-distance">📍 ${duplicate.distance}</span>
                        </div>
                        <div class="duplicate-status">
                            <span class="status-badge ${getStatusClass(duplicate.status)}">${getStatusLabel(duplicate.status)}</span>
                            <span class="priority-badge priority-${duplicate.priority.toLowerCase()}">
                                <i class="fas ${getPriorityIcon(duplicate.priority)}"></i> ${duplicate.priorityLabel}
                            </span>
                        </div>
                        <div class="duplicate-affected">
                            <div class="affected-count">
                                <span class="count">${duplicate.affectedCount}</span>
                                <span class="label">Citizens Affected</span>
                            </div>
                            <div class="affected-bar">
                                <div class="affected-progress" style="width: ${Math.min(100, duplicate.affectedCount)}%"></div>
                            </div>
                        </div>
                        ${duplicate.description ? `<div class="duplicate-description">📝 ${duplicate.description}</div>` : ''}
                        <div class="duplicate-id">Report #${duplicate.id.substring(0, 8)}</div>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-cancel" onclick="closeDuplicateModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn btn-support" id="supportDuplicateBtn">
                    <i class="fas fa-thumbs-up"></i> 👍 I'm Also Affected
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    // Add support button handler
    document.getElementById('supportDuplicateBtn').addEventListener('click', async function() {
        const btn = this;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Supporting...';
        
        try {
            const user = auth.currentUser;
            if (!user) {
                showToast('Please login to support this report', 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-thumbs-up"></i> 👍 I\'m Also Affected';
                return;
            }
            
            const result = await supportReport(duplicate.id, user.uid);
            
            if (result.success) {
                showToast(`✅ ${result.message} (${result.affectedCount} citizens affected)`, 'success');
                closeDuplicateModal();
                // Refresh the home page to show updated stats
                renderHome();
            } else if (result.alreadySupported) {
                showToast('ℹ️ You have already supported this report.', 'info');
                closeDuplicateModal();
            } else {
                showToast('❌ Error: ' + result.error, 'error');
            }
            
        } catch (error) {
            console.error('Support error:', error);
            showToast('❌ Error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-thumbs-up"></i> 👍 I\'m Also Affected';
        }
    });
}

// Close duplicate modal
window.closeDuplicateModal = function() {
    const modal = document.getElementById('duplicateModal');
    if (modal) {
        modal.classList.add('closing');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
};

// Click outside to close
document.addEventListener('click', function(e) {
    const modal = document.getElementById('duplicateModal');
    if (modal && e.target === modal) {
        closeDuplicateModal();
    }
});

// ================================================================
//  HELPER FUNCTIONS (Add these)
// ================================================================

function getPriorityIcon(priority) {
    const icons = {
        'LOW': 'fa-arrow-down',
        'MEDIUM': 'fa-minus',
        'HIGH': 'fa-arrow-up',
        'CRITICAL': 'fa-exclamation-triangle'
    };
    return icons[priority] || 'fa-circle';
}

function resetForm() {
    // ... existing reset logic ...
}