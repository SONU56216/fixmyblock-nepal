import { db, auth } from './firebase-config.js';
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc, deleteDoc, onSnapshot, writeBatch, serverTimestamp, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getTranslation, setLanguage, loadSavedLanguage } from './translations.js';
import { initStaticMap } from './map-utils.js';

let allReports = [], filteredReports = [], currentPriorityFilter = 'all', currentSort = 'newest', selectedReports = [];

const CATEGORIES = { pothole: { label: getTranslation('pothole'), icon: 'fa-circle-exclamation' },
    streetlight: { label: getTranslation('streetlight'), icon: 'fa-lightbulb' },
    drainage: { label: getTranslation('drainage'), icon: 'fa-water' },
    garbage: { label: getTranslation('garbage'), icon: 'fa-trash' },
    landslide: { label: getTranslation('landslide'), icon: 'fa-mountain' } };
const STATUSES = { submitted: { label: getTranslation('statusSubmitted'), class: 'status-submitted' },
    reviewing: { label: getTranslation('statusReviewing'), class: 'status-reviewing' },
    in_progress: { label: getTranslation('statusProgress'), class: 'status-progress' },
    resolved: { label: getTranslation('statusResolved'), class: 'status-resolved' },
    rejected: { label: getTranslation('statusRejected'), class: 'status-rejected' } };
const PRIORITY_ICONS = { LOW: 'fa-arrow-down', MEDIUM: 'fa-minus', HIGH: 'fa-arrow-up', CRITICAL: 'fa-exclamation-triangle' };
const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

function getCategoryLabel(cat) { const key = CATEGORIES[cat]?.label || cat; return getTranslation(key) || key; }

function getCategoryIcon(cat) { return CATEGORIES[cat]?.icon || 'fa-question'; }

function getStatusLabel(status) { const key = STATUSES[status]?.label || status; return getTranslation(key) || key; }

function getStatusClass(status) { return STATUSES[status]?.class || ''; }

function formatTimestamp(ts) { if (!ts) return 'Recently'; try { const diff = Date.now() - ts.toMillis(); if (diff < 60000) return 'Just now'; if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago'; if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago'; return Math.floor(diff / 86400000) + ' days ago'; } catch { return 'Recently'; } }

function showToast(msg, type = '') { const el = document.getElementById('toast'); if (!el) return;
    el.textContent = msg;
    el.className = 'toast ' + type;
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 3500); }

onAuthStateChanged(auth, async (user) => { if (!user) { window.location.href = 'login.html'; return; } try { const adminDoc = await getDoc(
            doc(db, 'admins', user.uid)); if (!adminDoc.exists() || adminDoc.data().role !== 'admin') { await signOut(auth);
            window.location.href = 'login.html'; return; } console.log('✅ Admin verified!'); if (window._listenerUnsubscribe) window
            ._listenerUnsubscribe();
        listenToReports();
        loadAdminLogs(); } catch (error) { console.error('Error checking admin:', error);
        document.getElementById('adminReportList').innerHTML =
        `<div class="error-state"><i class="fas fa-exclamation-circle"></i><h3>Error checking admin status</h3><p>${error.message}</p><button onclick="location.reload()" class="btn btn-primary btn-sm">Retry</button></div>`; } });

window.logout = async function() { await signOut(auth);
    window.location.href = 'login.html'; };

async function logAdminAction(action, reportId = null, details = {}) { try { const user = auth.currentUser; await addDoc(collection(db,
            'admin_logs'), { action, reportId, adminId: user?.uid || 'unknown', adminEmail: user?.email || 'unknown', details,
            timestamp: serverTimestamp() }); } catch (error) { console.error('Error logging admin action:', error); } }

function listenToReports() { const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc')); const unsubscribe = onSnapshot(q, (
        snapshot) => { console.log('✅ Admin Snapshot size:', snapshot.size);
        allReports = [];
        snapshot.forEach((doc) => { allReports.push({ id: doc.id, ...doc.data() }); });
        applyFiltersAndSort();
        updateStats(); }, (error) => { console.error('Listener error:', error);
        document.getElementById('adminReportList').innerHTML =
        `<div class="error-state"><i class="fas fa-exclamation-circle"></i><h3>Error Loading Reports</h3><p>${error.message}</p><button onclick="location.reload()" class="btn btn-primary btn-sm">Retry</button></div>`; });
    window._listenerUnsubscribe = unsubscribe; }

async function loadAdminLogs() { try { const q = query(collection(db, 'admin_logs'), orderBy('timestamp', 'desc'), limit(50)); const snapshot =
        await getDocs(q); const logs = [];
        snapshot.forEach((doc) => { logs.push({ id: doc.id, ...doc.data() }); });
        renderAdminLogs(logs); } catch (error) { console.error('Error loading logs:', error); } }

function renderAdminLogs(logs) { const container = document.getElementById('adminLogs'); if (!container) return; if (logs.length === 0) { container
        .innerHTML = '<div class="text-muted text-center pad-12">No activity logs yet</div>'; return; }
    container.innerHTML = logs.map(log =>
        `<div class="log-line"><strong>${log.action}</strong>${log.reportId ? ` on #${log.reportId.substring(0,8)}` : ''}<span class="log-muted"> ${log.adminEmail || 'Unknown'}</span><span class="log-time">${formatTimestamp(log.timestamp)}</span></div>`
        ).join(''); }

window.filterByPriority = function(priority) { currentPriorityFilter = priority;
    document.querySelectorAll('.filter-priority-btn').forEach(btn => btn.classList.remove('active')); if (priority === 'all') { document
        .querySelector('.filter-priority-btn')?.classList.add('active'); } else { const btn = document.querySelector(
            `.filter-priority-btn.priority-${priority.toLowerCase()}`); if (btn) btn.classList.add('active'); }
    applyFiltersAndSort(); };

window.sortReports = function(sort) { currentSort = sort;
    applyFiltersAndSort(); };

window.applyFiltersAndSort = function() { const search = document.getElementById('adminSearch')?.value.toLowerCase().trim() || '';
    let filtered = allReports; if (currentPriorityFilter !== 'all') { filtered = filtered.filter(r => (r.priority || 'LOW') ===
            currentPriorityFilter); } if (search) { filtered = filtered.filter(r => (r.location || '').toLowerCase().includes(search) || (
                r.description || '').toLowerCase().includes(search) || (r.category || '').toLowerCase().includes(search) || (r
                .submittedBy || '').toLowerCase().includes(search) || r.id.toLowerCase().includes(search)); } switch (currentSort) {
        case 'priority':
            filtered.sort((a, b) => (PRIORITY_ORDER[a.priority || 'LOW'] || 4) - (PRIORITY_ORDER[b.priority || 'LOW'] || 4)); break;
        case 'supported':
            filtered.sort((a, b) => (b.affectedCount || 0) - (a.affectedCount || 0)); break;
        case 'oldest':
            filtered.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0)); break;
        case 'newest':
        default:
            filtered.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)); break; }
    filteredReports = filtered;
    renderAdminReports(); };

window.toggleSelectReport = function(reportId) { const index = selectedReports.indexOf(reportId); if (index > -1) { selectedReports
        .splice(index, 1); } else { selectedReports.push(reportId); }
    updateBulkActions(); };

function updateBulkActions() { const container = document.getElementById('bulkActions'); if (!container) return; if (selectedReports.length ===
        0) { container.style.display = 'none'; return; }
    container.style.display = 'flex';
    document.getElementById('bulkCount').textContent = selectedReports.length; }

window.bulkUpdateStatus = async function(newStatus) { if (selectedReports.length === 0) return; if (!confirm(
        `Update ${selectedReports.length} reports to "${getStatusLabel(newStatus)}"?`)) return; try { const batch = writeBatch(db); for (const id of
        selectedReports) { const ref = doc(db, 'reports', id);
        batch.update(ref, { status: newStatus, updatedAt: new Date().toISOString() }); } await batch.commit();
        showToast(`✅ Updated ${selectedReports.length} reports to "${getStatusLabel(newStatus)}"`, 'success');
        selectedReports = [];
        updateBulkActions(); } catch (error) { console.error('Bulk update error:', error);
        showToast('❌ Error updating reports: ' + error.message, 'error'); } };

function renderAdminReports() { const container = document.getElementById('adminReportList'); if (filteredReports.length === 0) { container
        .innerHTML =
        `<div class="empty-state"><i class="fas fa-inbox"></i><h3>${getTranslation('noReports')}</h3><p>${allReports.length === 0 ? 'No reports submitted yet.' : 'Try adjusting your search or filters.'}</p></div>`;
        return; }
    container.innerHTML = filteredReports.map(r => { const priority = r.priority || 'LOW'; const priorityClass = priority
        .toLowerCase(); const priorityIcon = PRIORITY_ICONS[priority] || 'fa-circle'; const affected = r.affectedCount || 0; const supporters =
            (r.supportedBy || []).length; const isSelected = selectedReports.includes(r.id); return `
            <div class="admin-report-item${isSelected ? ' selected' : ''}">
                <div class="admin-row">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelectReport('${r.id}')" class="checkbox-input" />
                    <div class="info info-flex">
                        <div class="title">
                            <span class="report-id">#${r.id.substring(0, 8)}</span>
                            <i class="fas ${getCategoryIcon(r.category)} category-icon icon-highlight"></i>
                            ${getCategoryLabel(r.category)}
                            ${r.isEmergency ? '<span class="report-emergency-badge">🚨</span>' : ''}
                            <span class="priority-badge priority-${priorityClass}"><i class="fas ${priorityIcon}"></i> ${priority}</span>
                        </div>
                        <div class="loc"><i class="fas fa-location-dot"></i> ${r.location || 'Unknown'}</div>
                        <div class="meta">${formatTimestamp(r.createdAt)} · ${r.submittedBy || 'Anonymous'} · ${r.latitude ? `${r.latitude.toFixed(4)}, ${r.longitude?.toFixed(4) || ''}` : ''}</div>
                        <div class="community-stats"><span class="stat-item"><i class="fas fa-users"></i> <span class="count">${affected}</span> affected</span><span class="stat-item"><i class="fas fa-hand-peace"></i> <span class="count">${supporters}</span> supporters</span>${r.rating > 0 ? `<span class="stat-item"><i class="fas fa-star rating-star"></i> ${r.rating.toFixed(1)}</span>` : ''}</div>
                        ${r.description ? `<div class="desc">📝 ${r.description}</div>` : ''}
                        ${r.photoUrls && r.photoUrls.length > 0 ? `<div class="photo-link">📷 ${r.photoUrls.length} photos <a href="${r.photoUrls[0]}" target="_blank">View</a></div>` : ''}
                        <div class="mt-6"><div class="mini-map" id="map-${r.id}"></div></div>
                    </div>
                    <div class="actions actions-column">
                        <span class="status-badge ${getStatusClass(r.status || 'submitted')}">${getStatusLabel(r.status || 'submitted')}</span>
                        <select onchange="updateStatus('${r.id}', this.value)">
                            <option value="submitted" ${(r.status || 'submitted') === 'submitted' ? 'selected' : ''}>Submitted</option>
                            <option value="reviewing" ${(r.status || 'submitted') === 'reviewing' ? 'selected' : ''}>Under Review</option>
                            <option value="in_progress" ${(r.status || 'submitted') === 'in_progress' ? 'selected' : ''}>In Progress</option>
                            <option value="resolved" ${(r.status || 'submitted') === 'resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="rejected" ${(r.status || 'submitted') === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                        <button class="btn btn-danger btn-sm" onclick="deleteReport('${r.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `; }).join('');
    filteredReports.forEach(r => { if (r.latitude && r.longitude) { const mapId = `map-${r.id}`; const container = document.getElementById(
                mapId); if (container) { initStaticMap(mapId, r.latitude, r.longitude,
                `<b>${getCategoryLabel(r.category)}</b><br>${r.location}`); } } });
    updateBulkActions(); }

function updateStats() { const total = allReports.length; const submitted = allReports.filter(r => r.status === 'submitted').length; const progress =
        allReports.filter(r => r.status === 'reviewing' || r.status === 'in_progress').length; const resolved = allReports.filter(r =>
        r.status === 'resolved').length; const emergency = allReports.filter(r => r.isEmergency).length;
    document.getElementById('adminTotal').textContent = total;
    document.getElementById('adminSubmitted').textContent = submitted;
    document.getElementById('adminProgress').textContent = progress;
    document.getElementById('adminResolved').textContent = resolved;
    document.getElementById('adminEmergency').textContent = emergency; }

window.updateStatus = async function(reportId, newStatus) { try { await updateDoc(doc(db, 'reports', reportId), { status: newStatus,
            updatedAt: new Date().toISOString() });
        await logAdminAction('status_update', reportId, { newStatus });
        showToast(`✅ Report updated to "${getStatusLabel(newStatus)}"`, 'success'); } catch (error) {
        showToast('❌ Error updating status: ' + error.message, 'error'); } };

window.deleteReport = async function(reportId) { if (!confirm('Are you sure? This cannot be undone.')) return; try { await deleteDoc(doc(db,
            'reports', reportId));
        await logAdminAction('delete', reportId);
        showToast('🗑️ Report deleted', 'info');
        applyFiltersAndSort(); } catch (error) {
        showToast('❌ Error deleting report: ' + error.message, 'error'); } };

window.refreshReports = function() { showToast('🔄 Refreshing...', 'info');
    applyFiltersAndSort();
    loadAdminLogs(); };

window.exportExcel = function() { if (allReports.length === 0) { showToast('📭 No reports to export', 'error'); return; } const headers = ['ID',
        'Category', 'Description', 'Location', 'Latitude', 'Longitude', 'Photo URLs', 'Status', 'Priority', 'Affected Count',
        'Supporters', 'Emergency', 'Rating', 'Submitted By', 'Date'
    ]; const rows = allReports.map(r => [r.id || '', getCategoryLabel(r.category) || '', (r.description || '').replace(/,/g, ';'), (
            r.location || '').replace(/,/g, ';'), r.latitude || '', r.longitude || '', (r.photoUrls || []).join('; '),
        getStatusLabel(r.status || 'submitted'), r.priority || 'LOW', r.affectedCount || 0, (r.supportedBy || []).length,
        r.isEmergency ? 'YES' : 'NO', r.rating || 0, r.submittedBy || 'Anonymous', r.createdAt ? new Date(r.createdAt.toMillis())
        .toLocaleString() : ''
    ]);
    let csv = headers.join(',') + '\n';
    rows.forEach(row => csv += row.join(',') + '\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FixMyBlock_Reports_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📊 Excel file downloaded!', 'success'); };

window.clearAllReports = async function() { if (!confirm('Delete ALL reports? This cannot be undone!')) return; try { const q = query(collection(
            db, 'reports')); const snapshot = await getDocs(q); const batch = writeBatch(db); let count = 0; for (const doc of snapshot
            .docs) { batch.delete(doc.ref);
            count++; } await batch.commit();
        await logAdminAction('clear_all');
        showToast(`🗑️ Deleted ${count} reports`, 'info'); } catch (error) {
        showToast('❌ Error clearing reports: ' + error.message, 'error'); } };

window.filterByPriority = filterByPriority;
window.sortReports = sortReports;
window.applyFiltersAndSort = applyFiltersAndSort;
window.updateStatus = updateStatus;
window.deleteReport = deleteReport;
window.refreshReports = refreshReports;
window.exportExcel = exportExcel;
window.clearAllReports = clearAllReports;
window.logout = logout;
window.toggleSelectReport = toggleSelectReport;
window.bulkUpdateStatus = bulkUpdateStatus;
console.log('👑 FixMyBlock Nepal - Admin Dashboard Loaded');