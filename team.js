/* =============================================
   YACA PM - Team Management Module
   ============================================= */

window.Team = {
  currentDept: 'all',

  render(container) {
    let team = DataStore.getAll('team');

    if (this.currentDept !== 'all') {
      team = team.filter(m => m.department.toLowerCase() === this.currentDept.toLowerCase());
    }

    const actions = `
      <button class="btn btn-primary" onclick="Team.openCreateModal()">
        <i data-lucide="plus"></i> Add Team Member
      </button>
    `;

    const html = `
      ${Components.pageHeader('Firm Hierarchy & Team Management', 'Manage audit staff, managers, partners, capacity allocation, and skill profiles.', actions)}

      <div class="filter-bar">
        <select class="filter-select" onchange="Team.handleDeptChange(this.value)">
          <option value="all" ${this.currentDept === 'all' ? 'selected' : ''}>All Departments</option>
          <option value="audit" ${this.currentDept === 'audit' ? 'selected' : ''}>Audit & Assurance</option>
          <option value="tax" ${this.currentDept === 'tax' ? 'selected' : ''}>Tax Compliance</option>
          <option value="advisory" ${this.currentDept === 'advisory' ? 'selected' : ''}>Financial Advisory</option>
        </select>
      </div>

      <div class="team-grid">
        ${team.map(m => {
          const assignedTasks = DataStore.getTasksByAssignee(m.id);
          const activeTasksCount = assignedTasks.filter(t => t.status !== 'done').length;
          return `
            <div class="team-card" onclick="Team.openDetail('${m.id}')">
              ${Components.avatar(m.name, 'lg')}
              <div class="team-card-name">${m.name}</div>
              <div class="team-card-role">${m.role.toUpperCase()}</div>
              <div class="team-card-dept">${m.department.toUpperCase()} DEPT</div>

              <div class="team-status">
                <span class="team-status-dot ${m.status}"></span>
                <span style="text-transform: capitalize; color: var(--text-secondary);">${m.status.replace('-', ' ')}</span>
              </div>

              <div class="team-card-stats">
                <div class="team-card-stat">
                  <div class="team-card-stat-value">${activeTasksCount}</div>
                  <div class="team-card-stat-label">Active Tasks</div>
                </div>
                <div class="team-card-stat">
                  <div class="team-card-stat-value" style="color: var(--accent-gold);">${m.weeklyCapacity}h</div>
                  <div class="team-card-stat-label">Weekly Cap</div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.innerHTML = html;
  },

  handleDeptChange(dept) {
    this.currentDept = dept;
    this.render(document.getElementById('page-content'));
  },

  openDetail(memberId) {
    const member = DataStore.getById('team', memberId);
    if (!member) return;

    const tasks = DataStore.getTasksByAssignee(memberId);

    const bodyHtml = `
      <div class="client-header">
        ${Components.avatar(member.name, 'xl')}
        <div class="client-info">
          <h2>${member.name}</h2>
          <div class="text-muted">${member.role.toUpperCase()} • ${member.department.toUpperCase()}</div>
          <div style="margin-top: 6px;">
            <span class="badge ${member.status === 'available' ? 'badge-completed' : (member.status === 'busy' ? 'badge-review' : 'badge-on-hold')}">
              ${member.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div class="detail-panel">
        <div class="detail-main">
          <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 12px;">Assigned Audit Tasks (${tasks.length})</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${tasks.length === 0 ? '<p class="text-muted">No active task assignments.</p>' : ''}
            ${tasks.map(t => `
              <div class="card" style="padding: 12px; cursor: pointer;" onclick="Modal.close(); Board.openTaskDetail('${t.id}');">
                <div style="display: flex; justify-content: space-between;">
                  <div style="font-weight: 500;">${t.title}</div>
                  ${Components.statusBadge(t.status)}
                </div>
                <div class="text-muted" style="font-size: 0.75rem; margin-top: 4px;">Due: ${Components.formatDate(t.dueDate)} | Est: ${t.estimatedHours} Hrs</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="detail-sidebar">
          <div class="detail-field">
            <div class="detail-field-label">Email Address</div>
            <div class="detail-field-value">${member.email}</div>
          </div>

          <div class="detail-field">
            <div class="detail-field-label">Phone Contact</div>
            <div class="detail-field-value">${member.phone}</div>
          </div>

          <div class="detail-field">
            <div class="detail-field-label">Weekly Capacity</div>
            <div class="detail-field-value">${member.weeklyCapacity} Hours / Week</div>
          </div>

          <div class="detail-field">
            <div class="detail-field-label">Skills & Specializations</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
              ${(member.skills || []).map(s => `<span class="tag tag-gold">${s}</span>`).join('')}
            </div>
          </div>

          <div class="divider"></div>
          <button class="btn btn-secondary w-full" onclick="Team.openEditModal('${member.id}')">Edit Member Profile</button>
        </div>
      </div>
    `;

    Modal.open(member.name, bodyHtml, '', true);
  },

  openCreateModal() {
    const bodyHtml = `
      <form id="create-team-form">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="tm-name" class="form-control" placeholder="e.g. Tariq Mehmood" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Official Email *</label>
            <input type="email" id="tm-email" class="form-control" placeholder="tmehmood@yousufadil.com" required>
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" id="tm-phone" class="form-control" placeholder="+92 300 0000000">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Role / Position *</label>
            <select id="tm-role" class="form-control" required>
              <option value="staff">Staff Senior / Audit Senior</option>
              <option value="senior">Senior Auditor</option>
              <option value="manager">Manager</option>
              <option value="director">Director</option>
              <option value="partner">Partner</option>
              <option value="intern">Intern / Trainee</option>
            </select>
          </div>

          <div class="form-group">
            <label>Department *</label>
            <select id="tm-dept" class="form-control" required>
              <option value="audit">Audit & Assurance</option>
              <option value="tax">Tax Compliance</option>
              <option value="advisory">Financial Advisory</option>
              <option value="admin">Admin / QC</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Weekly Capacity (Hours)</label>
            <input type="number" id="tm-cap" class="form-control" value="40">
          </div>

          <div class="form-group">
            <label>Current Status</label>
            <select id="tm-status" class="form-control">
              <option value="available">Available</option>
              <option value="busy">Busy / On Audit Engagement</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Team.saveNewMember()">Add Member</button>
    `;

    Modal.open('Add Team Member', bodyHtml, footerHtml);
  },

  saveNewMember() {
    const name = document.getElementById('tm-name').value;
    const email = document.getElementById('tm-email').value;
    const phone = document.getElementById('tm-phone').value;
    const role = document.getElementById('tm-role').value;
    const department = document.getElementById('tm-dept').value;
    const weeklyCapacity = Number(document.getElementById('tm-cap').value) || 40;
    const status = document.getElementById('tm-status').value;

    if (!name || !email) {
      Toast.show('Please enter name and email.', 'error');
      return;
    }

    DataStore.create('team', {
      name,
      email,
      phone,
      role,
      department,
      weeklyCapacity,
      status,
      skills: ['Audit Procedures', 'Documentation'],
      avatar: Components.getInitials(name)
    });

    Modal.close();
    Toast.show('Team member added.', 'success');
    this.render(document.getElementById('page-content'));
  },

  openEditModal(memberId) {
    const member = DataStore.getById('team', memberId);
    if (!member) return;

    const bodyHtml = `
      <form id="edit-team-form">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="edit-tm-name" class="form-control" value="${member.name}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Role</label>
            <select id="edit-tm-role" class="form-control">
              <option value="staff" ${member.role === 'staff' ? 'selected' : ''}>Staff Senior / Audit Senior</option>
              <option value="senior" ${member.role === 'senior' ? 'selected' : ''}>Senior Auditor</option>
              <option value="manager" ${member.role === 'manager' ? 'selected' : ''}>Manager</option>
              <option value="director" ${member.role === 'director' ? 'selected' : ''}>Director</option>
              <option value="partner" ${member.role === 'partner' ? 'selected' : ''}>Partner</option>
              <option value="intern" ${member.role === 'intern' ? 'selected' : ''}>Intern / Trainee</option>
            </select>
          </div>

          <div class="form-group">
            <label>Current Status</label>
            <select id="edit-tm-status" class="form-control">
              <option value="available" ${member.status === 'available' ? 'selected' : ''}>Available</option>
              <option value="busy" ${member.status === 'busy' ? 'selected' : ''}>Busy</option>
              <option value="on-leave" ${member.status === 'on-leave' ? 'selected' : ''}>On Leave</option>
            </select>
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Team.saveEditMember('${member.id}')">Save Changes</button>
    `;

    Modal.open('Edit Team Member', bodyHtml, footerHtml);
  },

  saveEditMember(memberId) {
    const name = document.getElementById('edit-tm-name').value;
    const role = document.getElementById('edit-tm-role').value;
    const status = document.getElementById('edit-tm-status').value;

    DataStore.update('team', memberId, { name, role, status });
    Modal.close();
    Toast.show('Team member updated.', 'success');
    this.render(document.getElementById('page-content'));
  }
};
