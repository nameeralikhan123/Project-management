/* =============================================
   YACA PM - Engagements / Projects Module
   ============================================= */

window.Projects = {
  currentFilter: 'all',
  currentType: 'all',
  searchQuery: '',

  render(container) {
    let projects = DataStore.getAll('projects');

    if (this.currentFilter !== 'all') {
      projects = projects.filter(p => p.status === this.currentFilter);
    }
    if (this.currentType !== 'all') {
      projects = projects.filter(p => p.type === this.currentType);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      projects = projects.filter(p => p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }

    const actions = `
      <button class="btn btn-primary" onclick="Projects.openCreateModal()">
        <i data-lucide="plus"></i> New Engagement
      </button>
    `;

    const html = `
      ${Components.pageHeader('Audit & Client Engagements', 'Manage audit contracts, tax compliance workflows, and advisory projects.', actions)}

      <div class="filter-bar">
        <input type="text" class="filter-search" placeholder="Search engagements..." value="${this.searchQuery}" oninput="Projects.handleSearch(this.value)">
        <select class="filter-select" onchange="Projects.handleFilterChange('status', this.value)">
          <option value="all" ${this.currentFilter === 'all' ? 'selected' : ''}>All Statuses</option>
          <option value="planning" ${this.currentFilter === 'planning' ? 'selected' : ''}>Planning</option>
          <option value="fieldwork" ${this.currentFilter === 'fieldwork' ? 'selected' : ''}>Fieldwork</option>
          <option value="review" ${this.currentFilter === 'review' ? 'selected' : ''}>Manager Review</option>
          <option value="partner-review" ${this.currentFilter === 'partner-review' ? 'selected' : ''}>Partner Review</option>
          <option value="filing" ${this.currentFilter === 'filing' ? 'selected' : ''}>Filing Phase</option>
          <option value="completed" ${this.currentFilter === 'completed' ? 'selected' : ''}>Completed</option>
        </select>
        <select class="filter-select" onchange="Projects.handleFilterChange('type', this.value)">
          <option value="all" ${this.currentType === 'all' ? 'selected' : ''}>All Engagement Types</option>
          <option value="audit" ${this.currentType === 'audit' ? 'selected' : ''}>Audit & Assurance</option>
          <option value="tax" ${this.currentType === 'tax' ? 'selected' : ''}>Tax Compliance</option>
          <option value="advisory" ${this.currentType === 'advisory' ? 'selected' : ''}>Financial Advisory</option>
        </select>
      </div>

      ${projects.length === 0 ? Components.emptyState('briefcase', 'No Engagements Found', 'No engagements match your current filter criteria.', '<button class="btn btn-primary" onclick="Projects.openCreateModal()">Create Engagement</button>') : ''}

      <div class="projects-grid">
        ${projects.map(p => Components.projectCard(p)).join('')}
      </div>
    `;

    container.innerHTML = html;
  },

  handleFilterChange(type, val) {
    if (type === 'status') this.currentFilter = val;
    if (type === 'type') this.currentType = val;
    this.render(document.getElementById('page-content'));
  },

  handleSearch(val) {
    this.searchQuery = val;
    this.render(document.getElementById('page-content'));
  },

  openDetail(projectId) {
    const project = DataStore.getById('projects', projectId);
    if (!project) return;

    const client = DataStore.getById('clients', project.clientId);
    const partner = DataStore.getById('team', project.partnerId);
    const manager = DataStore.getById('team', project.managerId);
    const tasks = DataStore.getTasksByProject(projectId);

    const steps = ['planning', 'fieldwork', 'review', 'partner-review', 'filing', 'completed'];
    const currentStepIndex = steps.indexOf(project.status);

    const bodyHtml = `
      <div class="engagement-header-top">
        <div>
          <div class="text-muted" style="font-size: 0.8rem;">${client ? client.name : ''}</div>
          <h2 style="font-size: 1.3rem; margin-top: 2px;">${project.title}</h2>
        </div>
        <div style="display: flex; gap: 8px;">
          ${Components.statusBadge(project.status)}
          ${Components.priorityBadge(project.priority)}
        </div>
      </div>

      <div class="engagement-status-bar">
        ${steps.map((step, idx) => {
          let cls = '';
          if (idx < currentStepIndex) cls = 'completed';
          else if (idx === currentStepIndex) cls = 'current';
          return `<div class="engagement-status-step ${cls}">${step.replace('-', ' ').toUpperCase()}</div>`;
        }).join('')}
      </div>

      <div class="detail-panel">
        <div class="detail-main">
          <div class="detail-field">
            <div class="detail-field-label">Engagement Scope & Description</div>
            <div class="detail-field-value" style="color: var(--text-secondary); line-height: 1.5;">${project.description || 'No description provided.'}</div>
          </div>

          <div class="divider"></div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 1rem; font-weight: 600;">Audit Tasks (${tasks.length})</h3>
            <button class="btn btn-primary btn-sm" onclick="Board.openCreateTaskModal('${project.id}')">
              <i data-lucide="plus"></i> Add Task
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${tasks.length === 0 ? '<p class="text-muted">No tasks created yet for this engagement.</p>' : ''}
            ${tasks.map(t => {
              const assignee = DataStore.getById('team', t.assigneeId);
              return `
                <div class="card" style="padding: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="Board.openTaskDetail('${t.id}')">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    ${Components.priorityBadge(t.priority)}
                    <span style="font-weight: 500; font-size: 0.85rem;">${t.title}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    ${Components.statusBadge(t.status)}
                    ${assignee ? Components.avatar(assignee.name, 'sm') : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="detail-sidebar">
          <div class="detail-field">
            <div class="detail-field-label">Engagement Partner</div>
            <div class="detail-field-value" style="display: flex; align-items: center; gap: 8px;">
              ${partner ? Components.avatar(partner.name, 'sm') : ''}
              <span>${partner ? partner.name : 'Unassigned'}</span>
            </div>
          </div>

          <div class="detail-field">
            <div class="detail-field-label">Audit Manager</div>
            <div class="detail-field-value" style="display: flex; align-items: center; gap: 8px;">
              ${manager ? Components.avatar(manager.name, 'sm') : ''}
              <span>${manager ? manager.name : 'Unassigned'}</span>
            </div>
          </div>

          <div class="detail-field">
            <div class="detail-field-label">Key Dates</div>
            <div class="detail-field-value">Start: ${Components.formatDate(project.startDate)}</div>
            <div class="detail-field-value">Deadline: <strong style="color: var(--accent-gold);">${Components.formatDate(project.deadline)}</strong></div>
          </div>

          <div class="detail-field">
            <div class="detail-field-label">Hours Budget</div>
            <div class="detail-field-value">${project.actualHours} Executed / ${project.budgetHours} Budgeted</div>
          </div>

          <div class="divider"></div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn btn-secondary w-full" onclick="Projects.openEditModal('${project.id}')">Edit Engagement</button>
            <button class="btn btn-danger w-full" onclick="Projects.confirmDelete('${project.id}')">Delete Engagement</button>
          </div>
        </div>
      </div>
    `;

    Modal.open(project.title, bodyHtml, '', true);
  },

  openCreateModal() {
    const clients = DataStore.getAll('clients');
    const partners = DataStore.query('team', t => t.role === 'partner' || t.role === 'director');
    const managers = DataStore.query('team', t => t.role === 'manager' || t.role === 'senior');

    const bodyHtml = `
      <form id="create-project-form">
        <div class="form-group">
          <label>Engagement Title *</label>
          <input type="text" id="prj-title" class="form-control" placeholder="e.g. HBL Annual Statutory Audit FY2026" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Client *</label>
            <select id="prj-client" class="form-control" required>
              <option value="">Select Client...</option>
              ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Engagement Type *</label>
            <select id="prj-type" class="form-control" required>
              <option value="audit">Audit & Assurance</option>
              <option value="tax">Tax Compliance</option>
              <option value="advisory">Financial Advisory</option>
              <option value="special">Special Assignment</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Scope & Objective</label>
          <textarea id="prj-desc" class="form-control" placeholder="Audit scope, applicable accounting framework (IFRS/ISA)..."></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Engagement Partner</label>
            <select id="prj-partner" class="form-control">
              ${partners.map(p => `<option value="${p.id}">${p.name} (${p.role.toUpperCase()})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Audit Manager</label>
            <select id="prj-manager" class="form-control">
              ${managers.map(m => `<option value="${m.id}">${m.name} (${m.role.toUpperCase()})</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Priority</label>
            <select id="prj-priority" class="form-control">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="form-group">
            <label>Budget Hours</label>
            <input type="number" id="prj-budget" class="form-control" value="250">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Start Date</label>
            <input type="date" id="prj-start" class="form-control" value="${new Date().toISOString().slice(0, 10)}">
          </div>
          <div class="form-group">
            <label>Filing / Report Deadline *</label>
            <input type="date" id="prj-deadline" class="form-control" required>
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Projects.saveNewProject()">Create Engagement</button>
    `;

    Modal.open('Create Audit Engagement', bodyHtml, footerHtml);
  },

  saveNewProject() {
    const title = document.getElementById('prj-title').value;
    const clientId = document.getElementById('prj-client').value;
    const type = document.getElementById('prj-type').value;
    const description = document.getElementById('prj-desc').value;
    const partnerId = document.getElementById('prj-partner').value;
    const managerId = document.getElementById('prj-manager').value;
    const priority = document.getElementById('prj-priority').value;
    const budgetHours = Number(document.getElementById('prj-budget').value) || 200;
    const startDate = document.getElementById('prj-start').value;
    const deadline = document.getElementById('prj-deadline').value;

    if (!title || !clientId || !deadline) {
      Toast.show('Please fill in required fields.', 'error');
      return;
    }

    const newPrj = DataStore.create('projects', {
      title,
      clientId,
      type,
      description,
      partnerId,
      managerId,
      priority,
      status: 'planning',
      startDate,
      endDate: deadline,
      deadline,
      budgetHours,
      actualHours: 0,
      teamMembers: [partnerId, managerId],
      tags: [type.toUpperCase()]
    });

    DataStore.logActivity('project_created', 'usr_1', `created engagement "${title}"`, newPrj.id);
    Modal.close();
    Toast.show('Engagement created successfully!', 'success');
    this.render(document.getElementById('page-content'));
  },

  openEditModal(projectId) {
    const project = DataStore.getById('projects', projectId);
    if (!project) return;

    const clients = DataStore.getAll('clients');
    const partners = DataStore.query('team', t => t.role === 'partner' || t.role === 'director');
    const managers = DataStore.query('team', t => t.role === 'manager' || t.role === 'senior');

    const bodyHtml = `
      <form id="edit-project-form">
        <div class="form-group">
          <label>Engagement Title *</label>
          <input type="text" id="edit-prj-title" class="form-control" value="${project.title}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Status</label>
            <select id="edit-prj-status" class="form-control">
              <option value="planning" ${project.status === 'planning' ? 'selected' : ''}>Planning</option>
              <option value="fieldwork" ${project.status === 'fieldwork' ? 'selected' : ''}>Fieldwork</option>
              <option value="review" ${project.status === 'review' ? 'selected' : ''}>Manager Review</option>
              <option value="partner-review" ${project.status === 'partner-review' ? 'selected' : ''}>Partner Review</option>
              <option value="filing" ${project.status === 'filing' ? 'selected' : ''}>Filing Phase</option>
              <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
          <div class="form-group">
            <label>Priority</label>
            <select id="edit-prj-priority" class="form-control">
              <option value="low" ${project.priority === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${project.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high" ${project.priority === 'high' ? 'selected' : ''}>High</option>
              <option value="critical" ${project.priority === 'critical' ? 'selected' : ''}>Critical</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Scope & Objective</label>
          <textarea id="edit-prj-desc" class="form-control">${project.description || ''}</textarea>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Projects.saveEditProject('${project.id}')">Save Changes</button>
    `;

    Modal.open('Edit Engagement', bodyHtml, footerHtml);
  },

  saveEditProject(projectId) {
    const title = document.getElementById('edit-prj-title').value;
    const status = document.getElementById('edit-prj-status').value;
    const priority = document.getElementById('edit-prj-priority').value;
    const description = document.getElementById('edit-prj-desc').value;

    DataStore.update('projects', projectId, { title, status, priority, description });
    DataStore.logActivity('project_updated', 'usr_1', `updated engagement "${title}"`, projectId);
    Modal.close();
    Toast.show('Engagement updated.', 'success');
    this.render(document.getElementById('page-content'));
  },

  confirmDelete(projectId) {
    const project = DataStore.getById('projects', projectId);
    Modal.confirm('Delete Engagement', `Are you sure you want to delete "${project ? project.title : ''}"? This will also remove associated tasks.`, () => {
      DataStore.delete('projects', projectId);
      Toast.show('Engagement deleted.', 'info');
      Projects.render(document.getElementById('page-content'));
    });
  }
};
