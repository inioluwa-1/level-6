// Stack Class Implementation (Object-based, optimized)
class Stack {
    constructor() {
        this.items = {};  // store stack elements
        this.count = 0;   // track size
    }

    // Add an element to the stack
    push(element) {
        this.items[this.count] = element;
        this.count++;
        return this.count;
    }

    // Remove the top element
    pop() {
        if (this.isEmpty()) {
            return null;
        }
        this.count--;
        const removed = this.items[this.count];
        delete this.items[this.count];
        return removed;
    }

    // Look at the top element
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[this.count - 1];
    }

    // Stack size
    size() {
        return this.count;
    }

    // Check if empty
    isEmpty() {
        return this.count === 0;
    }

    // Clear the stack
    clear() {
        this.items = {};
        this.count = 0;
    }

    // Get all elements as array
    getAllElements() {
        const elements = [];
        for (let i = 0; i < this.count; i++) {
            elements.push(this.items[i]);
        }
        return elements;
    }
}

// ============ TEXT EDITOR MODE ============

// Initialize stacks for text editor
const undoStack = new Stack();
const redoStack = new Stack();

let lastSavedContent = '';

// Record Action
function recordAction() {
    const editor = document.getElementById('textEditor');
    const currentContent = editor.innerHTML;

    if (currentContent === lastSavedContent) {
        showNotification('⚠️ No changes to record!', 'warning');
        return;
    }

    const action = {
        id: Date.now(),
        content: lastSavedContent,
        timestamp: new Date().toLocaleTimeString()
    };

    undoStack.push(action);
    lastSavedContent = currentContent;
    
    // Clear redo stack when new action is recorded
    redoStack.clear();
    
    updateDisplay();
    showNotification('✅ Action recorded!', 'success');
}

// Undo
function undo() {
    if (undoStack.isEmpty()) {
        showNotification('⚠️ Nothing to undo!', 'warning');
        return;
    }

    const editor = document.getElementById('textEditor');
    const currentContent = editor.innerHTML;

    // Push current state to redo stack
    const currentAction = {
        id: Date.now(),
        content: currentContent,
        timestamp: new Date().toLocaleTimeString()
    };
    redoStack.push(currentAction);

    // Pop from undo stack and restore
    const previousAction = undoStack.pop();
    editor.innerHTML = previousAction.content;
    lastSavedContent = previousAction.content;

    updateDisplay();
    showNotification('↶ Undo successful!', 'info');
}

// Redo
function redo() {
    if (redoStack.isEmpty()) {
        showNotification('⚠️ Nothing to redo!', 'warning');
        return;
    }

    const editor = document.getElementById('textEditor');
    const currentContent = editor.innerHTML;

    // Push current state to undo stack
    const currentAction = {
        id: Date.now(),
        content: currentContent,
        timestamp: new Date().toLocaleTimeString()
    };
    undoStack.push(currentAction);

    // Pop from redo stack and restore
    const nextAction = redoStack.pop();
    editor.innerHTML = nextAction.content;
    lastSavedContent = nextAction.content;

    updateDisplay();
    showNotification('↷ Redo successful!', 'success');
}

// Clear All
function clearAll() {
    if (confirm('🗑️ Are you sure you want to clear everything?')) {
        document.getElementById('textEditor').innerHTML = '';
        undoStack.clear();
        redoStack.clear();
        lastSavedContent = '';
        updateDisplay();
        showNotification('✅ All cleared!', 'success');
    }
}

// Update Display
function updateDisplay() {
    // Update counts
    document.getElementById('undoCount').textContent = undoStack.size();
    document.getElementById('redoCount').textContent = redoStack.size();

    // Update buttons
    document.getElementById('undoBtn').disabled = undoStack.isEmpty();
    document.getElementById('redoBtn').disabled = redoStack.isEmpty();

    // Update undo stack display
    const undoStackDisplay = document.getElementById('undoStack');
    if (undoStack.isEmpty()) {
        undoStackDisplay.innerHTML = '<p class="text-muted text-center mb-0 small">Empty</p>';
    } else {
        const actions = undoStack.getAllElements().reverse();
        undoStackDisplay.innerHTML = actions.map((action, index) => `
            <div class="stack-item p-2 mb-1 bg-light border-start border-warning border-3">
                <div class="d-flex justify-content-between align-items-center">
                    <small><strong>#${actions.length - index}</strong></small>
                    <span class="badge action-badge bg-warning">${action.timestamp}</span>
                </div>
                <small class="text-muted d-block mt-1" style="max-height: 40px; overflow: hidden;">
                    ${action.content.substring(0, 50) || '(empty)'}...
                </small>
            </div>
        `).join('');
    }

    // Update redo stack display
    const redoStackDisplay = document.getElementById('redoStack');
    if (redoStack.isEmpty()) {
        redoStackDisplay.innerHTML = '<p class="text-muted text-center mb-0 small">Empty</p>';
    } else {
        const actions = redoStack.getAllElements().reverse();
        redoStackDisplay.innerHTML = actions.map((action, index) => `
            <div class="stack-item p-2 mb-1 bg-light border-start border-info border-3">
                <div class="d-flex justify-content-between align-items-center">
                    <small><strong>#${actions.length - index}</strong></small>
                    <span class="badge action-badge bg-info">${action.timestamp}</span>
                </div>
                <small class="text-muted d-block mt-1" style="max-height: 40px; overflow: hidden;">
                    ${action.content.substring(0, 50) || '(empty)'}...
                </small>
            </div>
        `).join('');
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
    } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
    } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        recordAction();
    }
});

// ============ NOTIFICATIONS ============

function showNotification(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 2500);
}

// ============ INITIALIZATION ============

// Initialize on load
window.addEventListener('load', function() {
    updateDisplay();
    
    // Set initial last saved content
    lastSavedContent = document.getElementById('textEditor').innerHTML;
});
