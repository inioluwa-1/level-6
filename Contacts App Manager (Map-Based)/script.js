// Contacts App Manager using JavaScript Map
// Based on map.js implementation with set(), get(), has(), delete() operations

const contactsMap = new Map(); // Main map to store contacts (key-value pairs)
let currentEditKey = null;

// Contact data structure
class Contact {
    constructor(name, phone) {
        this.name = name;
        this.phone = phone;
        this.addedAt = new Date().toLocaleString();
        this.lastUpdated = new Date().toLocaleString();
    }

    update(phone) {
        this.phone = phone;
        this.lastUpdated = new Date().toLocaleString();
    }
}

// Add Contact
function addContact() {
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();

    if (!name || !phone) {
        showNotification('⚠️ Please enter both name and phone number!', 'warning');
        return;
    }

    // Check if contact already exists using map.has()
    if (contactsMap.has(name)) {
        showNotification(`🚫 Contact "${name}" already exists! Use edit to update.`, 'warning');
        return;
    }

    // Add new contact using map.set()
    const contact = new Contact(name, phone);
    contactsMap.set(name, contact);

    document.getElementById('contactName').value = '';
    document.getElementById('contactPhone').value = '';
    updateDisplay();
    showNotification(`✅ Contact "${name}" added successfully!`, 'success');
}

// Quick Add Functions
function quickAdd(name, phone) {
    document.getElementById('contactName').value = name;
    document.getElementById('contactPhone').value = phone;
    addContact();
}

// Search Contacts
function searchContacts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const searchResults = document.getElementById('searchResults');
    const searchCount = document.getElementById('searchCount');

    if (!searchTerm) {
        searchResults.style.display = 'none';
        updateContactsList();
        document.getElementById('searchResultsCount').textContent = '-';
        return;
    }

    // Search through map keys
    const results = [];
    for (const [key, contact] of contactsMap) {
        if (key.toLowerCase().includes(searchTerm) ||
            contact.phone.includes(searchTerm)) {
            results.push({ key, contact });
        }
    }

    searchCount.textContent = results.length;
    document.getElementById('searchResultsCount').textContent = results.length;
    searchResults.style.display = 'block';

    updateContactsList(results);
}

// Clear Search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchResultsCount').textContent = '-';
    updateContactsList();
}

// Edit Contact
function editContact(name) {
    const contact = contactsMap.get(name); // Get contact using map.get()
    if (!contact) return;

    currentEditKey = name;
    document.getElementById('editName').value = name;
    document.getElementById('editPhone').value = contact.phone;
    document.getElementById('contactDetails').style.display = 'block';

    // Scroll to edit form
    document.getElementById('contactDetails').scrollIntoView({ behavior: 'smooth' });
}

// Update Contact
function updateContact() {
    if (!currentEditKey) return;

    const newPhone = document.getElementById('editPhone').value.trim();
    if (!newPhone) {
        showNotification('⚠️ Please enter a phone number!', 'warning');
        return;
    }

    const contact = contactsMap.get(currentEditKey);
    contact.update(newPhone);

    // Update map entry
    contactsMap.set(currentEditKey, contact);

    cancelEdit();
    updateDisplay();
    showNotification(`✅ Contact "${currentEditKey}" updated!`, 'success');
}

// Cancel Edit
function cancelEdit() {
    currentEditKey = null;
    document.getElementById('editName').value = '';
    document.getElementById('editPhone').value = '';
    document.getElementById('contactDetails').style.display = 'none';
}

// Delete Contact
function deleteContact(name) {
    if (confirm(`🗑️ Are you sure you want to delete "${name}"?`)) {
        contactsMap.delete(name); // Delete from map using map.delete()
        updateDisplay();
        showNotification(`✅ Contact "${name}" deleted!`, 'success');
    }
}

// Clear All Contacts
function clearAllContacts() {
    if (contactsMap.size === 0) {
        showNotification('📭 No contacts to clear!', 'info');
        return;
    }

    if (confirm('🗑️ Are you sure you want to clear all contacts?')) {
        contactsMap.clear(); // Clear the map
        updateDisplay();
        showNotification('✅ All contacts cleared!', 'success');
    }
}

// Export Contacts to JSON
function exportContacts() {
    if (contactsMap.size === 0) {
        showNotification('📭 No contacts to export!', 'warning');
        return;
    }

    // Convert map to object for JSON export
    const contactsObject = {};
    for (const [key, contact] of contactsMap) {
        contactsObject[key] = {
            name: contact.name,
            phone: contact.phone,
            addedAt: contact.addedAt,
            lastUpdated: contact.lastUpdated
        };
    }

    const exportData = {
        totalContacts: contactsMap.size,
        exportDate: new Date().toLocaleString(),
        contacts: contactsObject
    };

    // Create downloadable JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('📤 Contacts exported to JSON!', 'success');
}

// Update Display
function updateDisplay() {
    // Update stats
    document.getElementById('totalContacts').textContent = contactsMap.size;

    // Count recently added (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let recentCount = 0;
    for (const contact of contactsMap.values()) {
        if (new Date(contact.addedAt) > oneDayAgo) {
            recentCount++;
        }
    }
    document.getElementById('recentContacts').textContent = recentCount;

    // Update last updated time
    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();

    updateContactsList();
}

// Update Contacts List
function updateContactsList(searchResults = null) {
    const contactsList = document.getElementById('contactsList');
    const contactsToShow = searchResults || Array.from(contactsMap.entries());

    if (contactsToShow.length === 0) {
        contactsList.innerHTML = '<p class="empty-state text-center mb-0">No contacts found.</p>';
        return;
    }

    // Sort contacts alphabetically by name
    contactsToShow.sort((a, b) => {
        const nameA = searchResults ? a.key : a[0];
        const nameB = searchResults ? b.key : b[0];
        return nameA.localeCompare(nameB);
    });

    contactsList.innerHTML = contactsToShow.map(([name, contact], index) => {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const highlightedName = searchTerm ?
            name.replace(new RegExp(searchTerm, 'gi'), match => `<span class="search-highlight">${match}</span>`) :
            name;

        return `
            <div class="contact-item alert alert-light mb-2 d-flex justify-content-between align-items-center" role="alert">
                <div class="flex-grow-1">
                    <strong>#${index + 1}</strong>
                    <span class="ms-2">${highlightedName}</span>
                    <span class="badge badge-contact-type bg-primary ms-2">📞 ${contact.phone}</span>
                    <br>
                    <small class="text-muted ms-4">
                        Added: ${contact.addedAt}
                        ${contact.lastUpdated !== contact.addedAt ? `| Updated: ${contact.lastUpdated}` : ''}
                    </small>
                </div>
                <div class="contact-actions">
                    <button onclick="editContact('${name.replace(/'/g, "\\'")}')" class="btn btn-sm btn-outline-warning me-1">
                        ✏️ Edit
                    </button>
                    <button onclick="deleteContact('${name.replace(/'/g, "\\'")}')" class="btn btn-sm btn-outline-danger">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Allow Enter key to add contact
document.getElementById('contactName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('contactPhone').focus();
    }
});

document.getElementById('contactPhone').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addContact();
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
    if (contactsMap.size === 0) {
        showNotification('💡 Try adding some contacts to see the Map in action!', 'info');
    }
}, 1000);