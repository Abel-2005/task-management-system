document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const logoutButton = document.getElementById('logout-button');

    if (!localStorage.getItem('tm_token')) {
        window.location.href = 'login.html';
        return;
    }

    const tasks = JSON.parse(localStorage.getItem('tm_tasks') || '[]');

    // If no tasks exist, preload some demo DevOps tasks for presentation
    if (tasks.length === 0) {
        const demo = [
            'Docker container deployment: web-service',
            'Jenkins pipeline execution: nightly-build',
            'GitHub Actions workflow: ci.yml',
            'PostgreSQL health check: primary-db',
            'Build monitoring: frontend-app'
        ];
        demo.forEach(t => tasks.push(t));
        localStorage.setItem('tm_tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            // show task with a subtle label for type
            const left = document.createElement('div');
            left.textContent = task;
            const right = document.createElement('div');
            right.className = 'chip';
            // infer simple type from keywords
            if (/docker/i.test(task)) right.textContent = 'Docker';
            else if (/jenkins/i.test(task)) right.textContent = 'Jenkins';
            else if (/github|actions/i.test(task)) right.textContent = 'CI';
            else if (/postgre|db/i.test(task)) right.textContent = 'DB';
            else right.textContent = 'Task';
            li.appendChild(left);
            li.appendChild(right);
            li.addEventListener('click', () => {
                // animate removal then update storage
                li.classList.add('removing');
                setTimeout(() => {
                    const idx = tasks.indexOf(task);
                    if (idx >= 0) tasks.splice(idx, 1);
                    localStorage.setItem('tm_tasks', JSON.stringify(tasks));
                    renderTasks();
                }, 220);
            });
            taskList.appendChild(li);
        });
        // update summary counts if present
        const total = document.getElementById('total-tasks');
        const active = document.getElementById('active-tasks');
        const completed = document.getElementById('completed-tasks');
        if (total) total.textContent = tasks.length;
        if (active) active.textContent = tasks.length;
        if (completed) completed.textContent = 0;
    }

    if (taskForm) {
        taskForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = document.getElementById('task-input');
            if (!input || !input.value.trim()) {
                return;
            }
            tasks.push(input.value.trim());
            input.value = '';
            localStorage.setItem('tm_tasks', JSON.stringify(tasks));
            renderTasks();
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('tm_token');
            window.location.href = 'login.html';
        });
    }

    renderTasks();
});
