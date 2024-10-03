// script.js

// Data Structures
let tasks = [];
let categories = [];

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const categoryForm = document.getElementById('category-form');
const categoryInput = document.getElementById('category-input');
const categoryColor = document.getElementById('category-color');
const categoryList = document.getElementById('category-list');
const themeSwitch = document.getElementById('theme-switch');
const themeLabel = document.getElementById('theme-label');
const notification = document.getElementById('notification');
const body = document.body;
const fab = document.getElementById('fab');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderCategories();
    renderTasks();
    initializeTheme();
});

// Load Data from localStorage
function loadData() {
    const storedTasks = localStorage.getItem('tasks');
    const storedCategories = localStorage.getItem('categories');

    tasks = storedTasks ? JSON.parse(storedTasks) : [];
    categories = storedCategories ? JSON.parse(storedCategories) : [
        { name: 'Others', color: '#cccccc' }
    ];
}

// Save Data to localStorage
function saveData() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Render Categories in Select Dropdown and Filter
function renderCategories() {
    // Clear existing options
    categorySelect.innerHTML = '';
    filterSelect.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);

        const filterOption = document.createElement('option');
        filterOption.value = category.name;
        filterOption.textContent = category.name;
        filterSelect.appendChild(filterOption);
    });

    renderCategoryList();
}

// Render Category Management List
function renderCategoryList() {
    categoryList.innerHTML = '';

    categories.forEach((category, index) => {
        // Skip default category "Others"
        if (category.name === 'Others') return;

        const li = document.createElement('li');
        li.classList.add('category-item');

        const leftDiv = document.createElement('div');
        leftDiv.classList.add('category-name');

        const colorDiv = document.createElement('div');
        colorDiv.classList.add('category-color');
        colorDiv.style.backgroundColor = category.color;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = category.name;

        leftDiv.appendChild(colorDiv);
        leftDiv.appendChild(nameSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('category-actions');

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Edit Category';
        editBtn.setAttribute('aria-label', 'Edit Category');
        editBtn.addEventListener('click', () => editCategory(index));

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete Category';
        deleteBtn.setAttribute('aria-label', 'Delete Category');
        deleteBtn.addEventListener('click', () => deleteCategory(index));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(leftDiv);
        li.appendChild(actionsDiv);
        categoryList.appendChild(li);
    });
}

// Render Tasks List
function renderTasks() {
    taskList.innerHTML = '';

    let filteredTasks = [...tasks];

    // Apply Filter
    const filterValue = filterSelect.value;
    if (filterValue !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === filterValue);
    }

    // Apply Search
    const searchQuery = searchInput.value.toLowerCase();
    if (searchQuery) {
        filteredTasks = filteredTasks.filter(task => task.text.toLowerCase().includes(searchQuery));
    }

    filteredTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.classList.add('task-item');
        if (task.completed) {
            li.classList.add('completed');
        }

        // Task Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', 'Mark task as completed');
        checkbox.addEventListener('change', () => toggleTaskCompletion(index));

        // Task Text
        const taskText = document.createElement('span');
        taskText.classList.add('task-text');
        taskText.textContent = task.text;
        taskText.style.color = task.color;

        // Task Actions
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('task-actions');

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Edit Task';
        editBtn.setAttribute('aria-label', 'Edit Task');
        editBtn.addEventListener('click', () => editTask(index));

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete Task';
        deleteBtn.setAttribute('aria-label', 'Delete Task');
        deleteBtn.addEventListener('click', () => deleteTask(index));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(actionsDiv);

        // Add Animation
        li.style.opacity = 0;
        taskList.appendChild(li);
        setTimeout(() => {
            li.style.opacity = 1;
            li.style.transform = 'translateY(0)';
        }, 100);

        // Accessibility: Allow keyboard navigation
        li.tabIndex = 0;
    });
}

// Add Task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const category = categorySelect.value;

    if (!text) {
        showNotification('Task description cannot be empty.', true);
        return;
    }

    const newTask = {
        text,
        category,
        color: getCategoryColor(category),
        completed: false
    };

    tasks.push(newTask);
    saveData();
    renderTasks();
    taskForm.reset();
    showNotification('Task added successfully.');
});

// Get Category Color
function getCategoryColor(categoryName) {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#cccccc';
}

// Toggle Task Completion
function toggleTaskCompletion(index) {
    tasks[index].completed = !tasks[index].completed;
    saveData();
    renderTasks();
}

// Edit Task
function editTask(index) {
    const task = tasks[index];
    const newText = prompt('Edit Task Description:', task.text);
    if (newText === null) return; // Cancelled
    const trimmedText = newText.trim();
    if (!trimmedText) {
        showNotification('Task description cannot be empty.', true);
        return;
    }

    // Create a list of category names for validation
    const categoryNames = categories.map(cat => cat.name);
    const newCategory = prompt('Edit Task Category:', task.category);
    if (newCategory === null) return; // Cancelled

    if (!categoryNames.includes(newCategory)) {
        showNotification('Category does not exist.', true);
        return;
    }

    task.text = trimmedText;
    task.category = newCategory;
    task.color = getCategoryColor(newCategory);
    saveData();
    renderTasks();
    showNotification('Task edited successfully.');
}

// Delete Task
function deleteTask(index) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks.splice(index, 1);
        saveData();
        renderTasks();
        showNotification('Task deleted successfully.');
    }
}

// Add Category
categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = categoryInput.value.trim();
    const color = categoryColor.value;

    if (!name) {
        showNotification('Category name cannot be empty.', true);
        return;
    }

    if (categories.find(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Category already exists.', true);
        return;
    }

    const newCategory = { name, color };
    categories.push(newCategory);
    saveData();
    renderCategories();
    renderTasks(); // Update task colors if needed
    categoryForm.reset();
    showNotification('Category added successfully.');
});

// Edit Category
function editCategory(index) {
    const category = categories[index];
    const newName = prompt('Edit Category Name:', category.name);
    if (newName === null) return; // Cancelled
    const trimmedName = newName.trim();
    if (!trimmedName) {
        showNotification('Category name cannot be empty.', true);
        return;
    }

    if (categories.find((cat, idx) => cat.name.toLowerCase() === trimmedName.toLowerCase() && idx !== index)) {
        showNotification('Another category with this name already exists.', true);
        return;
    }

    const newColor = prompt('Edit Category Color (hex code, e.g., #ff0000):', category.color);
    if (newColor === null) return; // Cancelled
    const isValidColor = /^#([0-9A-F]{3}){1,2}$/i.test(newColor);
    if (!isValidColor) {
        showNotification('Invalid color code.', true);
        return;
    }

    category.name = trimmedName;
    category.color = newColor;
    saveData();
    renderCategories();
    renderTasks();
    showNotification('Category edited successfully.');
}

// Delete Category
function deleteCategory(index) {
    const category = categories[index];
    if (category.name === 'Others') {
        showNotification('Cannot delete default category.', true);
        return;
    }

    if (confirm(`Are you sure you want to delete the category "${category.name}"? Tasks in this category will be moved to "Others".`)) {
        // Reassign tasks to "Others"
        tasks.forEach(task => {
            if (task.category === category.name) {
                task.category = 'Others';
                task.color = getCategoryColor('Others');
            }
        });
        categories.splice(index, 1);
        saveData();
        renderCategories();
        renderTasks();
        showNotification('Category deleted successfully.');
    }
}

// Filter and Search
filterSelect.addEventListener('change', renderTasks);
searchInput.addEventListener('input', renderTasks);

// Theme Toggle
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        body.classList.add('dark');
        themeSwitch.checked = true;
        themeLabel.textContent = 'Dark Mode';
    } else {
        themeLabel.textContent = 'Light Mode';
    }
}

themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        body.classList.add('dark');
        themeLabel.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark');
        themeLabel.textContent = 'Light Mode';
        localStorage.setItem('theme', 'light');
    }
});

// Notifications
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.style.backgroundColor = isError ? 'var(--notification-error-bg)' : 'var(--notification-bg)';
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Accessibility Enhancements: Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        // Ensure focus styles are visible
        document.body.classList.add('user-is-tabbing');
    }
});

// Floating Action Button Click Event
fab.addEventListener('click', () => {
    taskInput.focus(); // Focus on the task input field
    taskForm.scrollIntoView({ behavior: 'smooth' }); // Scroll to the task form
});
