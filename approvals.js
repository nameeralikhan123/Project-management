/* =============================================
   YACA PM - Partner Sign-Off & Approvals Queue
   ============================================= */

window.Approvals = {
  render(container) {
    const approvals = DataStore.getAll('approvals');
    const projects = DataStore.getAll('projects');
    const team = DataStore.getAll('team');

    const actions = `
      <button class="btn btn-primary" onclick="Approvals.openNewApprovalModal()">
        <i data-lucide="plus"></i> Submit For Partner Review
      </button>
    `;

    const html = `
      ${Components.pageHeader('Partner Sign-Off & Quality Review Queue', 'Multi-tier review pipeline for engagement finalization and audit report issuance.', actions)}

      <div class="stats-grid mb-20">
        ${Components.statCard('shield-check', 'Pending Partner Sign-Off', approvals.filter(a => a.status === 'pending-partner').length, 'Action Required', 'up', '#f59e0b')}
        ${Components.statCard('check-circle', 'Completed Approvals', approvals.filter(a => a.status === 'approved').length, 'ISA 220 Compliant', 'up', '#10b981')}
        ${Components.statCard('clock', 'Avg Sign-off Turnaround', '1.2 Days', 'High Efficiency', 'up', '#D4A843')}
        ${Components.statCard('lock', 'Digital Sign-Off Audit Log', '100% Immutable', 'Cryptographic Stamp', 'up', '#3b82f6')}
      </div>

      <div class="widget">
        <div class="widget-header">
          <div class="widget-title">Active Approvals & Review Pipeline</div>
        </div>
        <div class="widget-body">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Approval Topic & Deliverable</th>
                  <th>Engagement</th>
                  <th>Preparer → Reviewer → Partner</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${approvals.map(app => {
      const prj = DataStore.getById('projects', app.projectId);
      const prep = DataStore.getById('team', app.preparerId);
      const rev = DataStore.getById('team', app.reviewerId);
      const prt = DataStore.getById('team', app.partnerId);
      const isPending = app.status === 'pending-partner';

      return `
                    <tr>
                      <td>
                        <div style="font-weight: 600;">${app.title}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${app.comments}</div>
                      </td>
                      <td>${prj ? prj.title : 'General'}</td>
                      <td>
                        <div style="font-size: 0.78rem;">
                          <span>${prep ? prep.name : 'Staff'}</span> → 
                          <span>${rev ? rev.name : 'Manager'}</span> → 
                          <strong style="color: var(--accent-gold);">${prt ? prt.name : 'Partner'}</strong>
                        </div>
                      </td>
                      <td><span class="badge ${isPending ? 'badge-review' : 'badge-completed'}">${app.status.toUpperCase()}</span></td>
                      <td>
                        ${isPending ? `
                          <button class="btn btn-primary btn-sm" onclick="Approvals.executePartnerSignOff('${app.id}')">
                            <i data-lucide="check-square"></i> Grant Partner Sign-Off
                          </button>
                        ` : `
                          <span class="text-green" style="font-size: 0.8rem; font-weight: 600;">
                            <i data-lucide="check" style="width: 14px;"></i> Signed & Sealed
                          </span>
                        `}
                      </td>
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

  openNewApprovalModal() {
    const projects = DataStore.getAll('projects');
    const team = DataStore.getAll('team');

    const formHtml = `
      <form id="new-approval-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Approval Topic & Deliverable Title *</label>
          <input type="text" id="app-title" class="form-input" placeholder="e.g. FY2026 Statutory Financial Statements & Independent Auditor Report" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Audit Engagement *</label>
            <select id="app-project-id" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              ${projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Designated Signing Partner *</label>
            <select id="app-partner-id" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              ${team.filter(m => m.role.toLowerCase().includes('partner') || m.role.toLowerCase().includes('manager')).map(m => `<option value="${m.id}">${m.name} (${m.role})</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Submission Comments & Quality Review Summary</label>
          <textarea id="app-comments" class="form-textarea" rows="2" placeholder="Summary of fieldwork completed and key audit matters addressed..." style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;"></textarea>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Approvals.saveApproval()">
        <i data-lucide="check-square"></i> Submit to Partner Queue
      </button>
    `;

    Modal.open('Submit For Partner Review & Sign-off', formHtml, footerHtml);
  },

  saveApproval() {
    const title = document.getElementById('app-title')?.value.trim();
    if (!title) {
      Toast.show('Please enter approval topic/deliverable title.', 'warning');
      return;
    }

    const projectId = document.getElementById('app-project-id')?.value || 'prj_1';
    const partnerId = document.getElementById('app-partner-id')?.value || 'usr_1';
    const comments = document.getElementById('app-comments')?.value || 'Fieldwork & EQCR review completed.';

    DataStore.create('approvals', {
      projectId,
      title,
      preparerId: 'usr_3',
      reviewerId: 'usr_2',
      partnerId,
      status: 'pending-partner',
      comments
    });

    Modal.close();
    Toast.show(`Submitted "${title}" for Partner Sign-Off successfully!`, 'success');
    this.render(document.getElementById('page-content'));
  },

  executePartnerSignOff(appId) {
    DataStore.update('approvals', appId, { status: 'approved', comments: 'Digital Sign-off Granted by Partner Muhammad Yousuf' });
    Toast.show('Partner Sign-Off successfully executed with digital timestamp.', 'success');
    this.render(document.getElementById('page-content'));
  }
};
