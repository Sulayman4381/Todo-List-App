
// Select HTML Elements
const taskInput = document.querySelector('#taskInput');
const taskList = document.querySelector('#taskList');
const addTaskForm = document.querySelector('#addTaskForm');

const taskCount = document.querySelector('#taskCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.querySelector('#clearCompleted');

const priorityInput = document.querySelector('#priorityInput');
const dueDateInput = document.querySelector('#dueDateInput');

const progressBar = document.querySelector('#progressBar');
const progressPercentage = document.querySelector('#progressPercentage');
const progressText = document.querySelector('#progressText');


// Get Tasks From Local Storage
let storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];


// Convert Old Tasks Into Objects
storedTasks = storedTasks.map((task) => {
    if (typeof task === 'string') {
        return {
            id: crypto.randomUUID(),
            text: task,
            completed: false,
            priority: 'medium',
            dueDate: ''
        };
    }

    return {
        id: task.id || crypto.randomUUID(),
        text: task.text,
        completed: task.completed || false,
        priority: ['low', 'medium', 'high'].includes(task.priority)
            ? task.priority
            : 'medium',
        dueDate: task.dueDate || ''
    };
});


// Current Filter
let currentFilter = 'all';


// Save Tasks
const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(storedTasks));
};


// Get Today's Date
const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};


// Validate Date
const isValidDate = (date) => {
    if (!date) return true;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(date + 'T00:00:00');

    return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date
    );
};


// Format Due Date
const formatDueDate = (date) => {
    const [year, month, day] = date.split('-');

    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    ).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};


// Update Progress
const updateProgress = () => {
    const totalTasks = storedTasks.length;

    const completedTasks = storedTasks.filter(
        (task) => task.completed
    ).length;

    const percentage = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    progressBar.style.width = `${percentage}%`;

    progressPercentage.textContent = `${percentage}%`;

    progressText.textContent =
        `${completedTasks} of ${totalTasks} tasks completed`;
};


// Update Task Count
const updateTaskCount = () => {
    const remainingTasks = storedTasks.filter(
        (task) => !task.completed
    ).length;

    taskCount.textContent =
        `${remainingTasks} remaining / ${storedTasks.length} total`;
};


// Render Tasks
const renderTasks = () => {
    taskList.innerHTML = '';

    // Filter Tasks
    const filteredTasks = storedTasks.filter((task) => {
        if (currentFilter === 'active') {
            return !task.completed;
        }

        if (currentFilter === 'completed') {
            return task.completed;
        }

        return true;
    });


    // Empty State
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');

        emptyMessage.classList.add('empty-message');

        if (currentFilter === 'active') {
            emptyMessage.textContent = 'No active tasks. Great job! 🎉';
        } else if (currentFilter === 'completed') {
            emptyMessage.textContent = 'No completed tasks yet.';
        } else {
            emptyMessage.textContent =
                'No tasks yet. Add one to get started! 🚀';
        }

        taskList.appendChild(emptyMessage);
    }


    // Display Each Task
    filteredTasks.forEach((task) => {
        const li = document.createElement('li');

        if (task.completed) {
            li.classList.add('completed');
        }


        // Checkbox
        const checkbox = document.createElement('input');

        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;

        checkbox.setAttribute(
            'aria-label',
            `Complete ${task.text}`
        );


        // Task Details Container
        const details = document.createElement('div');

        details.classList.add('task-details');


        // Task Name
        const label = document.createElement('label');

        label.textContent = task.text;


        // Priority Badge
        const priorityBadge = document.createElement('span');

        priorityBadge.textContent = `${task.priority} priority`;

        priorityBadge.classList.add(
            'priority',
            task.priority
        );


        // Due Date
        const dueDate = document.createElement('span');

        dueDate.classList.add('due-date');

        if (task.dueDate) {
            const today = getToday();

            dueDate.textContent =
                `Due: ${formatDueDate(task.dueDate)}`;

            if (!task.completed && task.dueDate < today) {
                dueDate.textContent += ' - Overdue!';
                dueDate.classList.add('overdue');
            } else if (!task.completed && task.dueDate === today) {
                dueDate.textContent += ' - Due today!';
                dueDate.classList.add('due-today');
            }

        } else {
            dueDate.textContent = 'No due date';
        }


        details.append(label, priorityBadge, dueDate);


        // Edit Button
        const editBtn = document.createElement('button');

        editBtn.type = 'button';
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');


        // Delete Button
        const deleteBtn = document.createElement('button');

        deleteBtn.type = 'button';
        deleteBtn.textContent = '✕';
        deleteBtn.classList.add('delete-btn');

        deleteBtn.setAttribute(
            'aria-label',
            `Delete ${task.text}`
        );


        // Toggle Completion
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;

            saveTasks();
            renderTasks();
        });


        // Edit Task
        editBtn.addEventListener('click', () => {
            const newText = prompt(
                'Edit task name:',
                task.text
            );

            if (newText === null) return;

            if (!newText.trim()) {
                alert('Task name cannot be empty!');
                return;
            }

            const newPriority = prompt(
                'Enter priority: high, medium, or low',
                task.priority
            );

            if (newPriority === null) return;

            const priority = newPriority.trim().toLowerCase();

            if (!['high', 'medium', 'low'].includes(priority)) {
                alert('Please enter high, medium, or low.');
                return;
            }

            const newDueDate = prompt(
                'Enter due date (YYYY-MM-DD), or leave blank:',
                task.dueDate
            );

            if (newDueDate === null) return;

            const date = newDueDate.trim();

            // Validate the date, including impossible dates
            if (!isValidDate(date)) {
                alert(
                    'Please enter a valid date in YYYY-MM-DD format.'
                );
                return;
            }

            // Update Task
            task.text = newText.trim();
            task.priority = priority;
            task.dueDate = date;

            saveTasks();
            renderTasks();
        });


        // Delete Task
        deleteBtn.addEventListener('click', () => {
            storedTasks = storedTasks.filter(
                (item) => item.id !== task.id
            );

            saveTasks();
            renderTasks();
        });


        // Add Elements To List
        li.append(
            checkbox,
            details,
            editBtn,
            deleteBtn
        );

        taskList.appendChild(li);
    });


    // Update Task Count
    updateTaskCount();


    // Update Progress
    updateProgress();


    // Update Clear Completed Button
    const hasCompletedTasks = storedTasks.some(
        (task) => task.completed
    );

    clearCompletedBtn.disabled = !hasCompletedTasks;
};


// Add New Task
const addTask = (event) => {
    event.preventDefault();

    const task = taskInput.value.trim();

    if (!task) return;

    const newTask = {
        id: crypto.randomUUID(),
        text: task,
        completed: false,
        priority: priorityInput.value,
        dueDate: dueDateInput.value
    };

    storedTasks.push(newTask);

    saveTasks();
    renderTasks();

    addTaskForm.reset();
    taskInput.focus();
};


// Filter Tasks
filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach((btn) => {
            btn.classList.remove('active');
        });

        button.classList.add('active');

        renderTasks();
    });
});


// Clear Completed Tasks
clearCompletedBtn.addEventListener('click', () => {
    storedTasks = storedTasks.filter(
        (task) => !task.completed
    );

    saveTasks();
    renderTasks();
});


// Form Submission
addTaskForm.addEventListener('submit', addTask);


// Save Migrated Tasks
saveTasks();


// Initial Render
renderTasks();
