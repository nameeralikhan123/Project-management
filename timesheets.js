/* =============================================
   YACA PM - Timesheets Module
   ============================================= */

window.Timesheets = {
  currentWeekStart: '2026-09-01',

  render(container) {
    const timeEntries = DataStore.getAll('timeEntries');
    const projects = DataStore.getAll('projects');
    const user = DataStore.getById('team', 'usr_1'); // Current user context

    const userEntries = timeEntries.filter(te => te.userId === 'usr_1');

    const totalHours = userEntries.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);
    const billableHours = userEntries.filter(e => e.billable).reduce((sum, e) => sum + (Number(e.hours) || 0), 0);

    const actions = `
      <button class="btn btn-primary" onclick="Timesheets.openLogModal()">
        <i data-lucide="plus"></i> Log Time Entry
      </button>
    `;

    const html = `
      ${Components.pageHeader('Timesheets & Billable Hours', 'Track daily engagement hours, client billing, and submission status.', actions)}

      <div class="stats-grid">
        ${Components.statCard('clock', 'Total Logged Hours', `${totalHours} hrs`, 'This Period', 'up', '#D4A843')}
        ${Components.statCard('pkr', 'Billable Hours', `${billableHours} hrs`, `${Math.round((billableHours / (totalHours || 1)) * 100)}% Billable Ratio`, 'up', '#10b981')}
        ${Components.statCard('check-circle', 'Timesheet Status', 'Submitted', 'Pending Manager Approval', 'up', '#3b82f6')}
      </div>

      <div class="widget mb-20">
        <div class="widget-header">
          <div class="widget-title">Weekly Timesheet Grid</div>
          <button class="btn btn-primary btn-sm" onclick="Timesheets.submitWeek()">Submit Weekly Timesheet</button>
        </div>
        <div class="widget-body">
          <div class="timesheet-grid">
            <div class="timesheet-header">Engagement / Client</div>
            <div class="timesheet-header">Mon</div>
            <div class="timesheet-header">Tue</div>
            <div class="timesheet-header">Wed</div>
            <div class="timesheet-header">Thu</div>
            <div class="timesheet-header">Fri</div>
            <div class="timesheet-header">Sat</div>
            <div class="timesheet-header">Sun</div>
            <div class="timesheet-header">Total</div>

            ${projects.slice(0, 4).map(p => {
      const pEntries = userEntries.filter(e => e.projectId === p.id);
      const pTotal = pEntries.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);
      return `
                <div class="timesheet-project">${p.title}</div>
                <div class="timesheet-cell"><input type="number" step="0.5" value="${this.getHoursForDay(pEntries, 1)}" onchange="Timesheets.updateCell('${p.id}', 1, this.value)"></div>
                <div class="timesheet-cell"><input type="number" step="0.5" value="${this.getHoursForDay(pEntries, 2)}" onchange="Timesheets.updateCell('${p.id}', 2, this.value)"></div>
                <div class="timesheet-cell"><input type="number" step="0.5" value="${this.getHoursForDay(pEntries, 3)}" onchange="Timesheets.updateCell('${p.id}', 3, this.value)"></div>
                <div class="timesheet-cell"><input type="number" step="0.5" value="${this.getHoursForDay(pEntries, 4)}" onchange="Timesheets.updateCell('${p.id}', 4, this.value)"></div>
                <div class="timesheet-cell"><input type="number" step="0.5" value="${this.getHoursForDay(pEntries, 5)}" onchange="Timesheets.updateCell('${p.id}', 5, this.value)"></div>
                <div class="timesheet-cell"><input type="number" step="0.5" value="${this.getHoursForDay(pEntries, 6)}" onchange="Timesheets.updateCell('${p.id}', 6, this.value)"></div>
                <div class="timesheet-cell"><input type="number" step="0.5" value="${this.getHoursForDay(pEntries, 0)}" onchange="Timesheets.updateCell('${p.id}', 0, this.value)"></div>
                <div class="timesheet-total">${pTotal} hrs</div>
              `;
    }).join('')}
          </div>
        </div>
      </div>

      <div class="widget">
        <div class="widget-header">
          <div class="widget-title">Detailed Time Entry Log</div>
        </div>
        <div class="widget-body">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Engagement</th>
                  <th>Description</th>
                  <th>Hours</th>
                  <th>Billable</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${userEntries.length === 0 ? '<tr><td colspan="6" class="text-center text-muted">No time entries logged yet.</td></tr>' : ''}
                ${userEntries.map(e => {
      const prj = DataStore.getById('projects', e.projectId);
      return `
                    <tr>
                      <td>${Components.formatDate(e.date)}</td>
                      <td>${prj ? prj.title : 'General'}</td>
                      <td>${e.description}</td>
                      <td><strong>${e.hours} hrs</strong></td>
                      <td>${e.billable ? '<span class="text-green">Yes</span>' : '<span class="text-muted">No</span>'}</td>
                      <td><span class="badge ${e.status === 'approved' ? 'badge-completed' : 'badge-review'}">${e.status.toUpperCase()}</span></td>
                    </tr>
                  `;
    }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  getHoursForDay(entries, dayOfWeek) {
    const match = entries.find(e => new Date(e.date).getDay() === dayOfWeek);
    return match ? match.hours : 0;
  },

  updateCell(projectId, dayOfWeek, value) {
    const val = Number(value) || 0;
    Toast.show(`Updated ${val} hours for engagement`, 'info');
    // In real app, create or update time entry record
  },

  openLogModal() {
    const projects = DataStore.getAll('projects');

    const bodyHtml = `
      <form id="log-time-form">
        <div class="form-group">
          <label>Engagement / Project *</label>
          <select id="te-project" class="form-control" required>
            ${projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Date *</label>
            <input type="date" id="te-date" class="form-control" value="${new Date().toISOString().slice(0, 10)}" required>
          </div>

          <div class="form-group">
            <label>Hours Spent *</label>
            <input type="number" step="0.5" id="te-hours" class="form-control" value="7.5" required>
          </div>
        </div>

        <div class="form-group">
          <label>Description of Audit Work Done *</label>
          <textarea id="te-desc" class="form-control" placeholder="Describe procedure executed, sample checked, client query answered..." required></textarea>
        </div>

        <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="te-billable" checked style="width: 18px; height: 18px;">
          <label for="te-billable" style="margin-bottom: 0;">Billable to Client</label>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Timesheets.saveLogEntry()">Log Time Entry</button>
    `;

    Modal.open('Log Time Entry', bodyHtml, footerHtml);
  },

  saveLogEntry() {
    const projectId = document.getElementById('te-project').value;
    const date = document.getElementById('te-date').value;
    const hours = Number(document.getElementById('te-hours').value);
    const description = document.getElementById('te-desc').value;
    const billable = document.getElementById('te-billable').checked;

    if (!projectId || !date || !hours || !description) {
      Toast.show('Please fill in all required fields.', 'error');
      return;
    }

    DataStore.create('timeEntries', {
      userId: 'usr_1',
      projectId,
      date,
      hours,
      description,
      billable,
      status: 'submitted'
    });

    Modal.close();
    Toast.show('Time entry logged.', 'success');
    this.render(document.getElementById('page-content'));
  },

  submitWeek() {
    Toast.show('Weekly timesheet submitted to Partner for review.', 'success');
  }
};
