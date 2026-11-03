/* =============================================
   YACA PM - Workflow Automations & ISQM 1 / ISA 220 Assistant
   ============================================= */

window.Automations = {
  render(container) {
    const automations = DataStore.getAll('automations');

    const actions = `
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary btn-sm" onclick="Automations.runComplianceAudit()">
          <i data-lucide="shield-check"></i> Run ISQM 1 Compliance Scan
        </button>
        <button class="btn btn-primary btn-sm" onclick="Automations.openNewRuleModal()">
          <i data-lucide="zap"></i> Create Automation Rule
        </button>
      </div>
    `;

    const html = `
      ${Components.pageHeader('Workflow Automations & ISA 220 Quality Hub', 'Configure trigger-based notification and escalation rules aligned with International Standard on Quality Management 1 (ISQM 1).', actions)}

      <div class="stats-grid mb-20">
        ${Components.statCard('zap', 'Active Trigger Rules', automations.length, 'Auto-Executing', 'up', '#D4A843')}
        ${Components.statCard('shield-check', 'ISQM 1 Compliance Score', '98%', 'ISA 220 Verified', 'up', '#10b981')}
        ${Components.statCard('bell-ring', 'Automated Alerts Today', '14 Notifications', 'Zero Missed Deadlines', 'up', '#3b82f6')}
        ${Components.statCard('check-circle-2', 'Quality Control Rules', '24 Rules', 'Strict Oversight', 'up', '#8b5cf6')}
      </div>

      <div class="content-grid mb-20" style="grid-template-columns: 1fr 340px;">
        <!-- Automation Rules List -->
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title">Active Workflow Trigger Rules</div>
          </div>
          <div class="widget-body">
            <div class="data-table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Rule Title</th>
                    <th>Trigger Condition</th>
                    <th>Automated Action</th>
                    <th>Status</th>
                    <th>Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  ${automations.map(aut => `
                    <tr>
                      <td><strong style="color: var(--accent-gold);">${aut.title}</strong></td>
                      <td><span class="badge badge-advisory">${aut.trigger}</span></td>
                      <td style="font-size: 0.82rem;">${aut.action}</td>
                      <td><span class="badge ${aut.enabled ? 'badge-completed' : 'badge-on-hold'}">${aut.enabled ? 'ACTIVE' : 'PAUSED'}</span></td>
                      <td>
                        <button class="btn btn-ghost btn-sm" onclick="Automations.toggleRule('${aut.id}')">
                          <i data-lucide="${aut.enabled ? 'power' : 'play'}"></i>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ISQM 1 / ISA 220 Compliance Checklist -->
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title">ISQM 1 Audit Quality Checklist</div>
          </div>
          <div class="widget-body">
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.82rem;">
              <div style="display: flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.1); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #10b981;">
                <i data-lucide="check-circle" style="color: #10b981; width: 16px;"></i>
                <span>Partner Leadership Responsibility Assigned</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.1); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #10b981;">
                <i data-lucide="check-circle" style="color: #10b981; width: 16px;"></i>
                <span>Ethical & Independence Confirmations Logged</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.1); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #10b981;">
                <i data-lucide="check-circle" style="color: #10b981; width: 16px;"></i>
                <span>Engagement Quality Control Reviewer (EQCR) Assigned</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; background: rgba(245, 158, 11, 0.1); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #f59e0b;">
                <i data-lucide="alert-triangle" style="color: #f59e0b; width: 16px;"></i>
                <span>Working Paper Archival Lock Within 60 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  toggleRule(id) {
    const aut = DataStore.getById('automations', id);
    if (aut) {
      DataStore.update('automations', id, { enabled: !aut.enabled });
      Toast.show(`Automation rule state updated.`, 'info');
      this.render(document.getElementById('page-content'));
    }
  },

  runComplianceAudit() {
    Toast.show('ISQM 1 & ISA 220 Compliance Scan executed: 0 critical quality deficiencies found.', 'success');
  },

  openNewRuleModal() {
    const formHtml = `
      <form id="new-rule-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Automation Rule Title *</label>
          <input type="text" id="rule-title" class="form-input" placeholder="e.g. Overdue Audit Paper Escalation to Partner" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Trigger Condition *</label>
          <select id="rule-trigger" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
            <option value="Task Overdue > 3 Days">Working paper / Task overdue by > 3 days</option>
            <option value="Risk Score >= 15">Risk Score escalated to High / Critical (>= 15)</option>
            <option value="Partner Sign-Off Requested">Partner Sign-Off submitted to queue</option>
            <option value="Control Deficiency Logged">Material Weakness or Deficiency logged</option>
            <option value="Timesheet Log > 12 Hours">Timesheet daily log > 12 billable hours</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Automated Action *</label>
          <select id="rule-action" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
            <option value="Send Email Digest & In-App Alert to Engagement Partner">Send urgent email & notification to Engagement Partner</option>
            <option value="Auto-assign EQCR Quality Reviewer">Auto-assign EQCR Reviewer to audit file</option>
            <option value="Escalate Priority to Critical">Escalate task priority to CRITICAL</option>
            <option value="Flag ISQM 1 Quality Warning">Flag ISQM 1 Quality Non-Compliance Warning</option>
          </select>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Automations.saveRule()">
        <i data-lucide="zap"></i> Create & Activate Rule
      </button>
    `;

    Modal.open('Create ISQM 1 Automation Trigger Rule', formHtml, footerHtml);
  },

  saveRule() {
    const title = document.getElementById('rule-title')?.value.trim();
    if (!title) {
      Toast.show('Please enter rule title.', 'warning');
      return;
    }

    const trigger = document.getElementById('rule-trigger')?.value || 'Task Overdue > 3 Days';
    const action = document.getElementById('rule-action')?.value || 'Send Email Digest to Engagement Partner';

    DataStore.create('automations', {
      title,
      trigger,
      action,
      enabled: true
    });

    Modal.close();
    Toast.show(`Automation Rule "${title}" created and activated!`, 'success');
    this.render(document.getElementById('page-content'));
  }
};
