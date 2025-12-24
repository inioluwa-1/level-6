// Queue Class Implementation (Object-based, optimized)
class Queue {
    constructor() {
        this.items = {};   // store queue elements
        this.frontIndex = 0; // track the front
        this.rearIndex = 0;  // track the rear
    }

    // Add element to the queue (enqueue)
    enqueue(element) {
        this.items[this.rearIndex] = element;
        this.rearIndex++;
        return this.rearIndex - this.frontIndex; // size
    }

    // Remove element from the front (dequeue)
    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        const removed = this.items[this.frontIndex];
        delete this.items[this.frontIndex];
        this.frontIndex++;
        return removed;
    }

    // Peek at the first element
    front() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[this.frontIndex];
    }

    // Peek at the last element
    end() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[this.rearIndex - 1];
    }

    // Queue size
    size() {
        return this.rearIndex - this.frontIndex;
    }

    // Check if empty
    isEmpty() {
        return this.size() === 0;
    }

    // Get all elements as array
    getAllElements() {
        const elements = [];
        for (let i = this.frontIndex; i < this.rearIndex; i++) {
            elements.push(this.items[i]);
        }
        return elements;
    }

    // Clear queue
    clear() {
        this.items = {};
        this.frontIndex = 0;
        this.rearIndex = 0;
    }
}

// Task Scheduler
const taskScheduler = new Queue();
const processedTasks = [];

// Task Icons
const taskIcons = {
    email: '📧',
    upload: '📤',
    message: '💬',
    other: '📌'
};

// Task Colors
const taskColors = {
    email: 'primary',
    upload: 'success',
    message: 'info',
    other: 'secondary'
};

// Add Task to Queue
function addTask() {
    const taskName = document.getElementById('taskName').value.trim();
    const taskType = document.getElementById('taskType').value;

    if (!taskName) {
        alert('⚠️ Please enter a task name!');
        return;
    }

    const task = {
        id: Date.now(),
        name: taskName,
        type: taskType,
        addedAt: new Date().toLocaleTimeString()
    };

    taskScheduler.enqueue(task);
    document.getElementById('taskName').value = '';
    
    updateDisplay();
    showNotification(`✅ Task "${taskName}" added to queue!`, 'success');
}

// Process Next Task
function processTask() {
    if (taskScheduler.isEmpty()) {
        showNotification('⚠️ No tasks to process!', 'warning');
        return;
    }

    const task = taskScheduler.dequeue();
    task.processedAt = new Date().toLocaleTimeString();
    processedTasks.unshift(task);

    // Keep only last 20 processed tasks
    if (processedTasks.length > 20) {
        processedTasks.pop();
    }

    updateDisplay();
    updateProcessingLog();
    showNotification(`⚙️ Processed: "${task.name}"`, 'info');
}

// View Queue
function viewQueue() {
    if (taskScheduler.isEmpty()) {
        showNotification('📭 Queue is empty!', 'info');
        return;
    }

    const tasks = taskScheduler.getAllElements();
    const taskList = tasks.map((task, index) => 
        `${index + 1}. ${taskIcons[task.type]} ${task.name} (${task.type})`
    ).join('\n');

    alert(`📋 Current Queue (${tasks.length} tasks):\n\n${taskList}`);
}

// Clear Queue
function clearQueue() {
    if (taskScheduler.isEmpty()) {
        showNotification('📭 Queue is already empty!', 'info');
        return;
    }

    if (confirm('🗑️ Are you sure you want to clear all tasks?')) {
        taskScheduler.clear();
        updateDisplay();
        showNotification('✅ Queue cleared!', 'success');
    }
}

// Update Display
function updateDisplay() {
    // Update stats
    const size = taskScheduler.size();
    document.getElementById('totalTasks').textContent = size;

    const nextTask = taskScheduler.front();
    document.getElementById('nextTask').textContent = nextTask 
        ? `${taskIcons[nextTask.type]} ${nextTask.name}` 
        : 'None';

    const lastTask = taskScheduler.end();
    document.getElementById('lastTask').textContent = lastTask 
        ? `${taskIcons[lastTask.type]} ${lastTask.name}` 
        : 'None';

    // Update queue display
    const queueDisplay = document.getElementById('queueDisplay');
    
    if (taskScheduler.isEmpty()) {
        queueDisplay.innerHTML = '<p class="empty-state text-center mb-0">No tasks in queue. Add a task to get started!</p>';
    } else {
        const tasks = taskScheduler.getAllElements();
        queueDisplay.innerHTML = tasks.map((task, index) => `
            <div class="task-item alert alert-${taskColors[task.type]} mb-2 d-flex justify-content-between align-items-center" role="alert">
                <div>
                    <strong>#${index + 1}</strong>
                    <span class="ms-2">${taskIcons[task.type]} ${task.name}</span>
                    <span class="badge badge-task-type bg-${taskColors[task.type]} ms-2">${task.type}</span>
                </div>
                <small class="text-muted">Added: ${task.addedAt}</small>
            </div>
        `).join('');
    }
}

// Update Processing Log
function updateProcessingLog() {
    const logDisplay = document.getElementById('processingLog');
    
    if (processedTasks.length === 0) {
        logDisplay.innerHTML = '<p class="empty-state text-center mb-0">No tasks processed yet.</p>';
    } else {
        logDisplay.innerHTML = processedTasks.map(task => `
            <div class="alert alert-success mb-2 d-flex justify-content-between align-items-center" role="alert">
                <div>
                    <span>${taskIcons[task.type]} ${task.name}</span>
                    <span class="badge bg-success ms-2">${task.type}</span>
                </div>
                <small class="text-muted">Processed: ${task.processedAt}</small>
            </div>
        `).join('');
    }
}

// Show Notification (Toast-like)
function showNotification(message, type) {
    // Create temporary alert
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

// Allow Enter key to add task
document.getElementById('taskName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Initialize display
updateDisplay();
