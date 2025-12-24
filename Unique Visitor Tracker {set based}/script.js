// Unique Visitor Tracker using JavaScript Set
// Based on set.js implementation with add(), has(), size operations

const visitorsSet = new Set(); // Main set to store unique visitors
let duplicatesPrevented = 0;
let recentVisitors = [];

// Visitor data structure
class Visitor {
    constructor(id) {
        this.id = id;
        this.timestamp = new Date().toLocaleString();
        this.type = this.getVisitorType(id);
    }

    getVisitorType(id) {
        if (id.includes('@')) return 'email';
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(id)) return 'ip';
        return 'id';
    }
}

// Add Visitor
function addVisitor() {
    const visitorId = document.getElementById('visitorId').value.trim();

    if (!visitorId) {
        showNotification('⚠️ Please enter a visitor ID!', 'warning');
        return;
    }

    // Check if visitor already exists using set.has()
    if (visitorsSet.has(visitorId)) {
        duplicatesPrevented++;
        document.getElementById('duplicatesPrevented').textContent = duplicatesPrevented;
        showNotification(`🚫 Duplicate visitor "${visitorId}" ignored!`, 'warning');
        document.getElementById('visitorId').value = '';
        return;
    }

    // Add new visitor using set.add()
    visitorsSet.add(visitorId);
    const visitor = new Visitor(visitorId);

    // Add to recent visitors (keep last 5)
    recentVisitors.unshift(visitor);
    if (recentVisitors.length > 5) {
        recentVisitors.pop();
    }

    document.getElementById('visitorId').value = '';
    updateDisplay();
    showNotification(`✅ Visitor "${visitorId}" added successfully!`, 'success');
}

// Quick Add Functions
function quickAdd(value) {
    document.getElementById('visitorId').value = value;
    addVisitor();
}

// Clear All Visitors
function clearAllVisitors() {
    if (visitorsSet.size === 0) {
        showNotification('📭 No visitors to clear!', 'info');
        return;
    }

    if (confirm('🗑️ Are you sure you want to clear all visitors?')) {
        visitorsSet.clear(); // Clear the set
        duplicatesPrevented = 0;
        recentVisitors = [];
        updateDisplay();
        showNotification('✅ All visitors cleared!', 'success');
    }
}

// Export Visitors List
function exportVisitors() {
    if (visitorsSet.size === 0) {
        showNotification('📭 No visitors to export!', 'warning');
        return;
    }

    const visitorsArray = Array.from(visitorsSet); // Convert set to array
    const exportData = {
        totalVisitors: visitorsSet.size,
        duplicatesPrevented: duplicatesPrevented,
        exportDate: new Date().toLocaleString(),
        visitors: visitorsArray
    };

    // Create downloadable JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `visitors_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('📤 Visitor list exported!', 'success');
}

// Update Display
function updateDisplay() {
    // Update stats
    document.getElementById('totalVisitors').textContent = visitorsSet.size;
    document.getElementById('duplicatesPrevented').textContent = duplicatesPrevented;

    // Count today's visitors (simple implementation)
    const today = new Date().toDateString();
    const todayCount = recentVisitors.filter(v => new Date(v.timestamp).toDateString() === today).length;
    document.getElementById('todayVisitors').textContent = todayCount;

    // Update visitors list
    const visitorsList = document.getElementById('visitorsList');
    if (visitorsSet.size === 0) {
        visitorsList.innerHTML = '<p class="empty-state text-center mb-0">No visitors yet. Add your first visitor above!</p>';
    } else {
        // Convert set to array and sort for display
        const visitorsArray = Array.from(visitorsSet).sort();
        visitorsList.innerHTML = visitorsArray.map((visitorId, index) => {
            const visitor = new Visitor(visitorId);
            const typeColors = {
                email: 'primary',
                ip: 'success',
                id: 'info'
            };
            const typeIcons = {
                email: '📧',
                ip: '🌐',
                id: '👤'
            };

            return `
                <div class="visitor-item alert alert-light mb-2 d-flex justify-content-between align-items-center" role="alert">
                    <div>
                        <strong>#${index + 1}</strong>
                        <span class="ms-2">${typeIcons[visitor.type]} ${visitorId}</span>
                        <span class="badge badge-visitor-type bg-${typeColors[visitor.type]} ms-2">${visitor.type}</span>
                    </div>
                    <small class="text-muted">${visitor.timestamp}</small>
                </div>
            `;
        }).join('');
    }

    // Update recent visitors
    const recentVisitorsDiv = document.getElementById('recentVisitors');
    if (recentVisitors.length === 0) {
        recentVisitorsDiv.innerHTML = '<p class="empty-state text-center mb-0 small">No recent visitors</p>';
    } else {
        recentVisitorsDiv.innerHTML = recentVisitors.map(visitor => `
            <div class="recent-visitor p-2 mb-2 bg-light border-start border-success border-3">
                <div class="d-flex justify-content-between align-items-center">
                    <small><strong>${visitor.id}</strong></small>
                    <span class="badge bg-success">${visitor.type}</span>
                </div>
                <small class="text-muted d-block">${visitor.timestamp}</small>
            </div>
        `).join('');
    }
}

// Allow Enter key to add visitor
document.getElementById('visitorId').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addVisitor();
    }
});

// Show Notification (Toast-like)
function showNotification(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.textContent = message;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Initialize display
updateDisplay();

// Demo data (optional - comment out for production)
setTimeout(() => {
    if (visitorsSet.size === 0) {
        showNotification('💡 Try adding some visitors to see the Set in action!', 'info');
    }
}, 1000);
