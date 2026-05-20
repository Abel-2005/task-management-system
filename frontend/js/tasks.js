document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const logoutButton = document.getElementById('logout-button');
    const refreshButton = document.getElementById('refresh-button');
    const runBuildBtn = document.getElementById('run-build-btn');
    const triggerDeployBtn = document.getElementById('trigger-deploy-btn');
    const checkDbBtn = document.getElementById('check-db-btn');
    const healthCheckBtn = document.getElementById('health-check-btn');
    const activityFeed = document.getElementById('activity-feed');

    // Use relative API paths; reverse proxy routes /api/* to auth-service
    const API_URL = '/api/tasks';
    const ACTIVITY_URL = '/api/activity';
    const ACTION_URL = '/api/tasks/action';

    if (!localStorage.getItem('tm_token')) {
        window.location.href = 'login.html';
        return;
    }

    let tasks = [];
    let activities = [];
    let activityRefreshInterval;
    const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

    // ==================== UTILITY FUNCTIONS ====================
    function normalizeStatus(status) {
        return VALID_STATUSES.includes(status) ? status : 'PENDING';
    }

    function getStatusLabel(status) {
        return normalizeStatus(status).replace('_', ' ');
    }

    function getStatusButtonLabel(status) {
        switch (status) {
            case 'PENDING': return 'Pending';
            case 'IN_PROGRESS': return 'Progress';
            case 'COMPLETED': return 'Done';
            default: return getStatusLabel(status);
        }
    }

    function getCategoryIcon(category) {
        const icons = {
            TASK: '<svg class="icon" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            BUILD: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            DEPLOY: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/></svg>',
            DATABASE: '<svg class="icon" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="5"/></svg>',
            SYSTEM: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>'
        };
        return icons[category] || icons.TASK;
    }

    function getLatestActivity(category) {
        return activities.find(activity => activity.category === category);
    }

    function formatTime(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }

    function getStatusColor(status) {
        switch (normalizeStatus(status)) {
            case 'PENDING': return '#f59e0b';
            case 'IN_PROGRESS': return '#19a7e5';
            case 'COMPLETED': return '#10b981';
            default: return '#9aa6b2';
        }
    }

    // ==================== TASK RENDERING ====================
    function renderTasks() {
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'muted';
            empty.style.textAlign = 'center';
            empty.style.padding = '20px';
            empty.textContent = 'No tasks yet. Add one to get started!';
            taskList.appendChild(empty);
            updateCounters();
            updateDashboardCards();
            return;
        }

        tasks.forEach((task) => {
            const status = normalizeStatus(task.status);
            const li = document.createElement('li');
            li.className = 'task-item';
            li.dataset.id = task.id;

            const content = document.createElement('div');
            content.className = 'task-item-content';

            const title = document.createElement('div');
            title.className = 'task-item-title';
            title.textContent = task.title;

            const statusBadge = document.createElement('div');
            statusBadge.className = `status-badge ${status.toLowerCase().replace('_', '-')}`;
            statusBadge.textContent = getStatusLabel(status);

            content.appendChild(title);
            content.appendChild(statusBadge);

            const actions = document.createElement('div');
            actions.className = 'task-item-actions';

            // Status buttons
            const statusDiv = document.createElement('div');
            statusDiv.className = 'task-item-status';

            ['PENDING', 'IN_PROGRESS', 'COMPLETED'].forEach(s => {
                const btn = document.createElement('button');
                btn.className = `status-btn${status === s ? ' active' : ''}`;
                btn.textContent = getStatusButtonLabel(s);
                btn.title = `Mark ${s.replace('_', ' ').toLowerCase()}`;
                btn.style.color = status === s ? getStatusColor(s) : 'var(--muted)';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    updateTaskStatus(task.id, s);
                };
                statusDiv.appendChild(btn);
            });

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'button sm danger';
            deleteBtn.textContent = 'x';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            };

            actions.appendChild(statusDiv);
            actions.appendChild(deleteBtn);

            li.appendChild(content);
            li.appendChild(actions);
            taskList.appendChild(li);
        });

        updateCounters();
        updateDashboardCards();
    }

    function updateCounters() {
        const total = document.getElementById('total-tasks');
        const active = document.getElementById('active-tasks');
        const completed = document.getElementById('completed-tasks');

        const totalCount = tasks.length;
        const activeCount = tasks.filter(t => {
            const status = normalizeStatus(t.status);
            return status === 'PENDING' || status === 'IN_PROGRESS';
        }).length;
        const completedCount = tasks.filter(t => normalizeStatus(t.status) === 'COMPLETED').length;

        if (total) total.textContent = totalCount;
        if (active) active.textContent = activeCount;
        if (completed) completed.textContent = completedCount;
    }

    // ==================== ACTIVITY FEED ====================
    async function loadActivityFeed() {
        try {
            const response = await fetch(`${ACTIVITY_URL}?limit=15`);
            if (!response.ok) throw new Error('Failed to fetch activities');
            activities = await response.json();
            renderActivityFeed();
        } catch (error) {
            console.error('Unable to load activities:', error);
        }
    }

    function renderActivityFeed() {
        if (!activityFeed) return;

        activityFeed.innerHTML = '';

        if (activities.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'mini-card';
            empty.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg><strong class="muted">No recent activity</strong>';
            activityFeed.appendChild(empty);
            return;
        }

        activities.forEach(activity => {
            const div = document.createElement('div');
            div.className = `mini-card activity-item activity-${activity.category.toLowerCase()} card-animate`;

            const icon = getCategoryIcon(activity.category);
            const timeAgo = formatTime(activity.timestamp);

            div.innerHTML = `
                <span class="activity-icon">${icon}</span>
                <div style="flex:1">
                    <strong>${activity.category}</strong>
                    <span class="muted">${activity.message}</span>
                </div>
                <span class="muted" style="font-size:12px">${timeAgo}</span>
            `;

            activityFeed.appendChild(div);
        });

        updateDashboardCards();
    }

    function updateDashboardCards() {
        const latestBuild = getLatestActivity('BUILD');
        const latestDeploy = getLatestActivity('DEPLOY');
        const latestDatabase = getLatestActivity('DATABASE');
        const completedCount = tasks.filter(t => normalizeStatus(t.status) === 'COMPLETED').length;
        const activeCount = tasks.filter(t => normalizeStatus(t.status) !== 'COMPLETED').length;

        setText('pipeline-status-value', latestBuild ? latestBuild.message : 'Ready');
        setText('github-status-value', completedCount > 0 ? `${completedCount} completed` : 'Ready');
        setText('docker-status-value', latestDeploy ? latestDeploy.message : 'Active');
        setText('database-status-value', latestDatabase ? latestDatabase.message : 'Connected');
        setText('latest-build-value', latestBuild ? `${latestBuild.action.replace('_', ' ')} - ${formatTime(latestBuild.timestamp)}` : 'No builds yet');
        setText('staging-value', activeCount > 0 ? `${activeCount} active task${activeCount === 1 ? '' : 's'}` : 'idle');
        setText('production-value', latestDeploy ? `${latestDeploy.action.replace('_', ' ')} - ${formatTime(latestDeploy.timestamp)}` : 'ready');
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    // ==================== TASK OPERATIONS ====================
    async function loadTasks() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            tasks = await response.json();
        } catch (error) {
            console.error('Unable to load tasks:', error);
            tasks = [];
        }
        try {
            renderTasks();
        } finally {
            loadActivityFeed();
        }
    }

    async function createTask(title) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            if (!response.ok) throw new Error('Unable to save task');
            const savedTask = await response.json();
            tasks.push(savedTask);
            renderTasks();
            loadActivityFeed();
            return true;
        } catch (error) {
            console.error('Error saving task:', error);
            return false;
        }
    }

    async function updateTaskStatus(id, newStatus) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) throw new Error('Unable to update task');
            const updated = await response.json();
            const index = tasks.findIndex(t => t.id === id);
            if (index !== -1) tasks[index] = updated;
            renderTasks();
            loadActivityFeed();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }

    async function deleteTask(id) {
        if (!confirm('Delete this task?')) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Unable to delete task');

            const item = document.querySelector(`[data-id="${id}"]`);
            if (item) {
                item.classList.add('removing');
                setTimeout(() => {
                    tasks = tasks.filter(t => t.id !== id);
                    renderTasks();
                    loadActivityFeed();
                }, 220);
            } else {
                tasks = tasks.filter(t => t.id !== id);
                renderTasks();
                loadActivityFeed();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    // ==================== DEVOPS ACTIONS ====================
    async function triggerBuild() {
        try {
            runBuildBtn.disabled = true;
            const textEl = document.getElementById('build-text');
            const originalText = textEl.textContent;
            textEl.innerHTML = '<span class="loading-spinner"></span> Building...';

            const response = await fetch(`${ACTION_URL}/build`, { method: 'POST' });
            if (!response.ok) throw new Error('Build failed');

            const result = await response.json();
            console.log('Build triggered:', result);

            loadActivityFeed();

            setTimeout(() => {
                textEl.textContent = originalText;
                runBuildBtn.disabled = false;
                loadActivityFeed();
            }, 3500);
        } catch (error) {
            console.error('Error triggering build:', error);
            runBuildBtn.disabled = false;
        }
    }

    async function triggerDeploy() {
        try {
            triggerDeployBtn.disabled = true;
            const textEl = document.getElementById('deploy-text');
            const originalText = textEl.textContent;
            textEl.innerHTML = '<span class="loading-spinner"></span> Deploying...';

            const response = await fetch(`${ACTION_URL}/deploy`, { method: 'POST' });
            if (!response.ok) throw new Error('Deploy failed');

            const result = await response.json();
            console.log('Deploy triggered:', result);

            loadActivityFeed();

            setTimeout(() => {
                textEl.textContent = originalText;
                triggerDeployBtn.disabled = false;
                loadActivityFeed();
            }, 4500);
        } catch (error) {
            console.error('Error triggering deploy:', error);
            triggerDeployBtn.disabled = false;
        }
    }

    async function triggerDatabaseCheck() {
        try {
            checkDbBtn.disabled = true;
            const textEl = document.getElementById('db-text');
            const originalText = textEl.textContent;
            textEl.innerHTML = '<span class="loading-spinner"></span> Checking...';

            const response = await fetch(`${ACTION_URL}/database`, { method: 'POST' });
            if (!response.ok) throw new Error('Database check failed');

            await response.json();
            loadActivityFeed();

            setTimeout(() => {
                textEl.textContent = originalText;
                checkDbBtn.disabled = false;
                loadActivityFeed();
            }, 1200);
        } catch (error) {
            console.error('Error checking database:', error);
            checkDbBtn.disabled = false;
        }
    }

    async function triggerHealthCheck() {
        try {
            healthCheckBtn.disabled = true;
            const textEl = document.getElementById('health-text');
            const originalText = textEl.textContent;
            textEl.innerHTML = '<span class="loading-spinner"></span> Checking...';

            const response = await fetch(`${ACTION_URL}/health`, { method: 'POST' });
            if (!response.ok) throw new Error('Health check failed');

            await response.json();
            loadActivityFeed();

            setTimeout(() => {
                textEl.textContent = originalText;
                healthCheckBtn.disabled = false;
                loadActivityFeed();
            }, 1200);
        } catch (error) {
            console.error('Error checking system health:', error);
            healthCheckBtn.disabled = false;
        }
    }

    // ==================== EVENT LISTENERS ====================
    if (taskForm) {
        taskForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const input = document.getElementById('task-input');
            if (!input || !input.value.trim()) return;

            const success = await createTask(input.value.trim());
            if (success) input.value = '';
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('tm_token');
            window.location.href = 'login.html';
        });
    }

    if (refreshButton) {
        refreshButton.addEventListener('click', loadTasks);
    }

    if (runBuildBtn) {
        runBuildBtn.addEventListener('click', triggerBuild);
    }

    if (triggerDeployBtn) {
        triggerDeployBtn.addEventListener('click', triggerDeploy);
    }

    if (checkDbBtn) {
        checkDbBtn.addEventListener('click', triggerDatabaseCheck);
    }

    if (healthCheckBtn) {
        healthCheckBtn.addEventListener('click', triggerHealthCheck);
    }

    // ==================== INITIALIZATION ====================
    loadTasks();

    // Auto-refresh activity feed every 5 seconds
    activityRefreshInterval = setInterval(loadActivityFeed, 5000);

    // Cleanup on page unload
    window.addEventListener('unload', () => {
        if (activityRefreshInterval) clearInterval(activityRefreshInterval);
    });
});
