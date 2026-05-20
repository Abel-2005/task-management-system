document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const logoutButton = document.getElementById('logout-button');
    const refreshButton = document.getElementById('refresh-button');
    // Use relative API paths; reverse proxy routes /api/* to auth-service
    const API_URL = '/api/tasks';

    if (!localStorage.getItem('tm_token')) {
        window.location.href = 'login.html';
        return;
    }

    let tasks = [];

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            const left = document.createElement('div');
            left.textContent = task.title || task;
            const right = document.createElement('div');
            right.className = 'chip';
            if (/docker/i.test(left.textContent)) right.textContent = 'Docker';
            else if (/jenkins/i.test(left.textContent)) right.textContent = 'Jenkins';
            else if (/github|actions/i.test(left.textContent)) right.textContent = 'CI';
            else if (/postgre|db/i.test(left.textContent)) right.textContent = 'DB';
            else right.textContent = 'Task';
            li.appendChild(left);
            li.appendChild(right);
            taskList.appendChild(li);
        });

        const total = document.getElementById('total-tasks');
        const active = document.getElementById('active-tasks');
        const completed = document.getElementById('completed-tasks');
        if (total) total.textContent = tasks.length;
        if (active) active.textContent = tasks.length;
        if (completed) completed.textContent = 0;
    }

    async function loadTasks() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            tasks = await response.json();
        } catch (error) {
            console.error('Unable to load tasks:', error);
            tasks = [];
        }
        renderTasks();
    }

    if (taskForm) {
        taskForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const input = document.getElementById('task-input');
            if (!input || !input.value.trim()) {
                return;
            }
            const newTask = { title: input.value.trim() };
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newTask)
                });
                if (!response.ok) throw new Error('Unable to save task');
                const savedTask = await response.json();
                tasks.push(savedTask);
                input.value = '';
                renderTasks();
            } catch (error) {
                console.error('Error saving task:', error);
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('tm_token');
            window.location.href = 'login.html';
        });
    }

    if (refreshButton) {
        refreshButton.addEventListener('click', async () => {
            await loadTasks();
        });
    }

    loadTasks();
});
