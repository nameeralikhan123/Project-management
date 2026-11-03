/* =============================================
   YACA PM - Kanban Board Module (JIRA-style)
   ============================================= */

window.Board = {
  selectedProject: 'all',
  selectedAssignee: 'all',
  selectedPriority: 'all',
  draggedTaskId: null,

  render(container) {
    let tasks = DataStore.getAll('tasks');
    const projects = DataStore.getAll('projects');
    const team = DataStore.getAll('team');

    if (this.selectedProject !== 'all') {
      tasks = tasks.filter(t => t.projectId === this.selectedProject);
    }
    if (this.selectedAssignee !== 'all') {
      tasks = tasks.filter(t => t.assigneeId === this.selectedAssignee);
    }
    if (this.selectedPriority !== 'all') {
      tasks = tasks.filter(t => t.priority === this.selectedPriority);
    }

    const columns = [
      { id: 'backlog', title: 'Backlog', icon: 'archive' },
      { id: 'todo', title: 'To Do', icon: 'list-todo' },
      { id: 'in-progress', title: 'In Progress', icon: 'loader' },
      { id: 'in-review', title: 'In Manager Review', icon: 'eye' },
      { id: 'approved', title: 'Partner Approved', icon: 'shield-check' },
      { id: 'done', title: 'Done', icon: 'check-circle-2' }
    ];

    const actions = `
      <button class="btn btn-primary" onclick="Board.openCreateTaskModal()">
        <i data-lucide="plus"></i> New Task
      </button>
    `;

    const html = `
      ${Components.pageHeader('Audit Kanban Workflow', 'Track audit procedures, review cycles, and sign-offs in real time.', actions)}

      <div class="filter-bar">
        <select class="filter-select" onchange="Board.handleFilterChange('project', this.value)">
          <option value="all" ${this.selectedProject === 'all' ? 'selected' : ''}>All Engagements</option>
          ${projects.map(p => `<option value="${p.id}" ${this.selectedProject === p.id ? 'selected' : ''}>${p.title}</option>`).join('')}
        </select>

        <select class="filter-select" onchange="Board.handleFilterChange('assignee', this.value)">
          <option value="all" ${this.selectedAssignee === 'all' ? 'selected' : ''}>All Team Members</option>
          ${team.map(m => `<option value="${m.id}" ${this.selectedAssignee === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
        </select>

        <select class="filter-select" onchange="Board.handleFilterChange('priority', this.value)">
          <option value="all" ${this.selectedPriority === 'all' ? 'selected' : ''}>All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div class="kanban-board">
        ${columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return `
            <div class="kanban-column" id="col-${col.id}"
                 ondragover="Board.handleDragOver(event)"
                 ondragleave="Board.handleDragLeave(event)"
                 ondrop="Board.handleDrop(event, '${col.id}')">

              <div class="kanban-column-header">
                <div class="kanban-column-title">
                  <i data-lucide="${col.icon}" style="width: 16px; height: 16px; color: var(--accent-gold);"></i>
                  <span>${col.title}</span>
                </div>
                <div class="kanban-column-count">${colTasks.length}</div>
              </div>

              <div class="kanban-column-body">
                ${colTasks.map(t => Components.taskCard(t)).join('')}
              </div>

              <button class="kanban-add-task" onclick="Board.openCreateTaskModal(null, '${col.id}')">
                <i data-lucide="plus"></i> Add Task
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.innerHTML = html;
  },

  handleFilterChange(filterType, val) {
    if (filterType === 'project') this.selectedProject = val;
    if (filterType === 'assignee') this.selectedAssignee = val;
    if (filterType === 'priority') this.selectedPriority = val;
    this.render(document.getElementById('page-content'));
  },

  // Drag and drop handlers
  handleDragStart(e, taskId) {
    this.draggedTaskId = taskId;
    e.dataTransfer.setData('text/plain', taskId);
    e.currentTarget.classList.add('dragging');
  },

  handleDragOver(e) {
    e.preventDefault();
    const columnBody = e.currentTarget.querySelector('.kanban-column-body');
    if (columnBody) columnBody.classList.add('drag-over');
  },

  handleDragLeave(e) {
    const columnBody = e.currentTarget.querySelector('.kanban-column-body');
    if (columnBody) columnBody.classList.remove('drag-over');
  },

  handleDrop(e, newStatus) {
    e.preventDefault();
    const columnBody = e.currentTarget.querySelector('.kanban-column-body');
    if (columnBody) columnBody.classList.remove('drag-over');

    const taskId = this.draggedTaskId || e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = DataStore.getById('tasks', taskId);
    if (task && task.status !== newStatus) {
      const oldStatus = task.status;
      DataStore.update('tasks', taskId, { status: newStatus });
      DataStore.logActivity('status_changed', 'usr_1', `moved task "${task.title}" from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`, task.projectId, taskId);
      Toast.show(`Task moved to ${newStatus.replace('-', ' ').toUpperCase()}`, 'info');
      this.render(document.getElementById('page-content'));
    }
  },

  openTaskDetail(taskId) {
    const task = DataStore.getById('tasks', taskId);
    if (!task) return;

    const project = DataStore.getById('projects', task.projectId);
    const assignee = DataStore.getById('team', task.assigneeId);
    const reporter = DataStore.getById('team', task.reporterId);
    const teamMembers = DataStore.getAll('team');

    const bodyHtml = `
      <div class="detail-panel">
        <div class="detail-main">
          <div class="text-muted" style="font-size: 0.8rem;">${project ? project.title : 'Engagement'}</div>
          <h2 style="font-size: 1.2rem; margin-bottom: 12px;">${task.title}</h2>

          <div class="detail-field">
            <div class="detail-field-label">Description & Instructions</div>
            <div class="detail-field-value" style="color: var(--text-secondary); line-height: 1.5;">${task.description || 'No detailed instructions provided.'}</div>
          </div>

          <div class="divider"></div>

          <!-- Comments Section -->
          <div class="comment-section">
            <h3 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 12px;">Audit Notes & Comments</h3>
            
            <div class="comment-input-area">
              ${Components.avatar('Muhammad Yousuf', 'sm')}
              <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                <textarea id="task-new-comment" placeholder="Add audit note, query, or review response..."></textarea>
                <div style="text-align: right;">
                  <button class="btn btn-primary btn-sm" onclick="Board.postComment('${task.id}')">Post Comment</button>
                </div>
              </div>
            </div>

            <div class="comment-list" style="margin-top: 16px;">
              ${(task.comments || []).length === 0 ? '<p class="text-muted" style="font-size: 0.8rem;">No comments yet.</p>' : ''}
              ${(task.comments || []).map(c => {
                const author = DataStore.getById('team', c.userId);
                const authorName = author ? author.name : 'Team Member';
                return `
                  <div class="comment-item">
                    ${Components.avatar(authorName, 'sm')}
                    <div class="comment-content">
                      <div class="comment-author">${authorName}</div>
                      <div class="comment-text">${c.text}</div>
                      <div class="comment-time">${Components.timeAgo(c.createdAt)}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="detail-sidebar">
          <div class="detail-field">
            <div class="detail-field-label">Status</div>
            <select class="form-control" onchange="Board.updateTaskStatus('${task.id}', this.value)">
              <option value="backlog" ${task.status === 'backlog' ? 'selected' : ''}>Backlog</option>
              <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
              <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="in-review" ${task.status === 'in-review' ? 'selected' : ''}>In Manager Review</option>
              <option value="approved" ${task.status === 'approved' ? 'selected' : ''}>Partner Approved</option>
              <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
            </select>
          </div>

          <div class="detail-field">
            <div class="detail-field-label">Assignee</div>
            <select class="form-control" onchange="Board.updateTaskAssignee('${task.id}', this.value)">
              ${teamMembers.map(m => `<option value="${m.id}" ${task.assigneeId === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
            </select>
          </div>

          <div class="detail-field">
            <div class="detail-field-label">Priority</div>
            <div class="detail-field-value">${Components.priorityBadge(task.priority)}</div>
          </div>

          <div class="detail-field">
            <div class="detail-field-label">Due Date</div>
            <div class="detail-field-value">${Components.formatDate(task.dueDate)}</div>
          </div>

          <div class="detail-field">
            <div class="detail-field-label">Estimated Hours</div>
            <div class="detail-field-value">${task.loggedHours || 0} / ${task.estimatedHours || 0} Hours</div>
          </div>

          <div class="divider"></div>
          <button class="btn btn-danger w-full" onclick="Board.confirmDeleteTask('${task.id}')">Delete Task</button>
        </div>
      </div>
    `;

    Modal.open('Task Details', bodyHtml, '', true);
  },

  postComment(taskId) {
    const input = document.getElementById('task-new-comment');
    if (!input || !input.value.trim()) return;

    DataStore.addComment(taskId, 'usr_1', input.value.trim());
    Toast.show('Comment posted.', 'success');
    this.openTaskDetail(taskId);
  },

  updateTaskStatus(taskId, status) {
    DataStore.update('tasks', taskId, { status });
    Toast.show(`Task status updated to ${status.toUpperCase()}`, 'success');
    this.render(document.getElementById('page-content'));
  },

  updateTaskAssignee(taskId, assigneeId) {
    DataStore.update('tasks', taskId, { assigneeId });
    Toast.show('Assignee updated.', 'success');
    this.render(document.getElementById('page-content'));
  },

  openCreateTaskModal(projectId = null, initialStatus = 'todo') {
    const projects = DataStore.getAll('projects');
    const team = DataStore.getAll('team');

    const bodyHtml = `
      <form id="create-task-form">
        <div class="form-group">
          <label>Task Title *</label>
          <input type="text" id="tsk-title" class="form-control" placeholder="e.g. Verify Bank Confirmations" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Engagement / Project *</label>
            <select id="tsk-project" class="form-control" required>
              ${projects.map(p => `<option value="${p.id}" ${projectId === p.id ? 'selected' : ''}>${p.title}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Initial Status</label>
            <select id="tsk-status" class="form-control">
              <option value="backlog" ${initialStatus === 'backlog' ? 'selected' : ''}>Backlog</option>
              <option value="todo" ${initialStatus === 'todo' ? 'selected' : ''}>To Do</option>
              <option value="in-progress" ${initialStatus === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="in-review" ${initialStatus === 'in-review' ? 'selected' : ''}>In Review</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Detailed Description</label>
          <textarea id="tsk-desc" class="form-control" placeholder="Audit test procedure details, sampling criteria..."></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Assignee</label>
            <select id="tsk-assignee" class="form-control">
              ${team.map(m => `<option value="${m.id}">${m.name} (${m.role.toUpperCase()})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Priority</label>
            <select id="tsk-priority" class="form-control">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Due Date</label>
            <input type="date" id="tsk-due" class="form-control" value="${new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)}">
          </div>

          <div class="form-group">
            <label>Estimated Hours</label>
            <input type="number" id="tsk-hours" class="form-control" value="20">
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Board.saveNewTask()">Create Task</button>
    `;

    Modal.open('Create Audit Task', bodyHtml, footerHtml);
  },

  saveNewTask() {
    const title = document.getElementById('tsk-title').value;
    const projectId = document.getElementById('tsk-project').value;
    const status = document.getElementById('tsk-status').value;
    const description = document.getElementById('tsk-desc').value;
    const assigneeId = document.getElementById('tsk-assignee').value;
    const priority = document.getElementById('tsk-priority').value;
    const dueDate = document.getElementById('tsk-due').value;
    const estimatedHours = Number(document.getElementById('tsk-hours').value) || 10;

    if (!title || !projectId) {
      Toast.show('Please fill required fields.', 'error');
      return;
    }

    const newTask = DataStore.create('tasks', {
      title,
      projectId,
      status,
      description,
      assigneeId,
      reporterId: 'usr_1',
      priority,
      dueDate,
      estimatedHours,
      loggedHours: 0,
      labels: ['Audit Procedure'],
      comments: []
    });

    DataStore.logActivity('task_created', 'usr_1', `created task "${title}"`, projectId, newTask.id);
    Modal.close();
    Toast.show('Task created successfully.', 'success');
    this.render(document.getElementById('page-content'));
  },

  confirmDeleteTask(taskId) {
    Modal.confirm('Delete Task', 'Are you sure you want to delete this task?', () => {
      DataStore.delete('tasks', taskId);
      Modal.close();
      Toast.show('Task deleted.', 'info');
      Board.render(document.getElementById('page-content'));
    });
  }
};
