document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskList = document.getElementById('task-list');
  const logoutButton = document.getElementById('logout-button');

  if (!localStorage.getItem('tm_token')) {
    window.location.href = 'login.html';
    return;
  }

  const tasks = JSON.parse(localStorage.getItem('tm_tasks') || '[]');

  function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.textContent = task;
      li.addEventListener('click', () => {
        tasks.splice(index, 1);
        localStorage.setItem('tm_tasks', JSON.stringify(tasks));
        renderTasks();
      });
      taskList.appendChild(li);
    });
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
