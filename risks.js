/* =============================================
   YACA PM - Audit Risk Register & 5x5 Heatmap
   ============================================= */

window.Risks = {
  render(container) {
    const risks = DataStore.getAll('risks');
    const findings = DataStore.getAll('findings');
    const projects = DataStore.getAll('projects');

    const highRisksCount = risks.filter(r => r.score >= 15).length;
    const medRisksCount = risks.filter(r => r.score >= 8 && r.score < 15).length;
    const lowRisksCount = risks.filter(r => r.score < 8).length;

    const actions = `
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary btn-sm" onclick="Risks.openAddFindingModal()">
          <i data-lucide="alert-triangle"></i> Log Audit Finding
        </button>
        <button class="btn btn-primary btn-sm" onclick="Risks.openAddRiskModal()">
          <i data-lucide="shield-alert"></i> New Audit Risk
        </button>
      </div>
    `;

    const html = `
      ${Components.pageHeader('Audit Risk Register & Findings Log', 'Identify financial statement risks, evaluate Likelihood x Impact matrix, and track control deficiencies.', actions)}

      <div class="stats-grid mb-20">
        ${Components.statCard('shield-alert', 'Total Logged Risks', risks.length, 'ISQM 1 Aligned', 'up', '#D4A843')}
        ${Components.statCard('alert-octagon', 'Critical/High Risks', highRisksCount, 'Score 15-25', 'down', '#ef4444')}
        ${Components.statCard('alert-triangle', 'Medium Risk Exposures', medRisksCount, 'Score 8-14', 'up', '#f59e0b')}
        ${Components.statCard('check-circle', 'Mitigated / Accepted', lowRisksCount, 'Residual Low', 'up', '#10b981')}
      </div>

      <div class="content-grid mb-20" style="grid-template-columns: 1fr 340px;">
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title">Engagement Audit Risk Register</div>
          </div>
          <div class="widget-body">
            <div class="data-table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Risk Title</th>
                    <th>Category</th>
                    <th>L × I</th>
                    <th>Risk Score</th>
                    <th>Residual</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${risks.map(r => {
      const prj = DataStore.getById('projects', r.projectId);
      const scoreColor = r.score >= 15 ? 'badge-risk-high' : (r.score >= 8 ? 'badge-review' : 'badge-completed');
      return `
                      <tr>
                        <td>
                          <div style="font-weight: 600;">${r.title}</div>
                          <div class="text-muted" style="font-size: 0.75rem;">${prj ? prj.title : 'General'}</div>
                        </td>
                        <td>${r.category}</td>
                        <td><strong>L${r.likelihood} × I${r.impact}</strong></td>
                        <td><span class="badge ${scoreColor}">Score: ${r.score}</span></td>
                        <td><span style="text-transform: capitalize;">${r.residualRisk}</span></td>
                        <td><span class="badge ${r.status === 'open' ? 'priority-critical' : 'badge-completed'}">${r.status.toUpperCase()}</span></td>
                      </tr>
                    `;
    }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 5x5 Heat Map Grid Widget -->
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title">5x5 Risk Heat Map Matrix</div>
          </div>
          <div class="widget-body">
            <div class="risk-heatmap-container" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; padding: 4px; background: rgba(255,255,255,0.02); border-radius: 8px;">
              ${this.renderHeatMapGrid(risks)}
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 0.72rem; color: var(--text-muted);">
              <span>Low Impact → High</span>
              <span>Low Likelihood ↑ High</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Audit Findings & Control Deficiencies -->
      <div class="widget">
        <div class="widget-header">
          <div class="widget-title">Audit Findings & Internal Control Deficiencies Log</div>
        </div>
        <div class="widget-body">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Finding & Control Ref</th>
                  <th>Classification</th>
                  <th>Management Response</th>
                  <th>Follow-up Date</th>
                  <th>Resolution Status</th>
                </tr>
              </thead>
              <tbody>
                ${findings.map(f => `
                  <tr>
                    <td>
                      <div style="font-weight: 600;">${f.title}</div>
                      <div style="font-size: 0.75rem; color: var(--accent-gold);">Ref: ${f.controlRef}</div>
                    </td>
                    <td><span class="badge ${f.type === 'Material Weakness' ? 'priority-critical' : 'badge-review'}">${f.type}</span></td>
                    <td style="font-size: 0.8rem; max-width: 250px;">${f.managementResponse}</td>
                    <td>${Components.formatDate(f.followUpDate)}</td>
                    <td><span class="badge ${f.status === 'open' ? 'priority-critical' : 'badge-completed'}">${f.status.toUpperCase()}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  renderHeatMapGrid(risks) {
    let cells = '';
    for (let l = 5; l >= 1; l--) {
      for (let i = 1; i <= 5; i++) {
        const score = l * i;
        const count = risks.filter(r => r.likelihood === l && r.impact === i).length;
        let bg = 'rgba(16, 185, 129, 0.2)';
        if (score >= 15) bg = 'rgba(239, 68, 68, 0.4)';
        else if (score >= 8) bg = 'rgba(245, 158, 11, 0.3)';

        cells += `
          <div style="background: ${bg}; height: 42px; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: #fff; position: relative;">
            <span>${score}</span>
            ${count > 0 ? `<span style="background: #000; padding: 1px 4px; border-radius: 10px; font-size: 0.6rem; margin-top: 2px;">${count}</span>` : ''}
          </div>
        `;
      }
    }
    return cells;
  },

  openAddRiskModal() {
    const projects = DataStore.getAll('projects');
    const team = DataStore.getAll('team');

    const formHtml = `
      <form id="add-risk-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Audit Risk Title *</label>
          <input type="text" id="risk-title" class="form-input" placeholder="e.g. Valuation of Complex Derivatives & Swaps" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Engagement *</label>
            <select id="risk-project-id" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              ${projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Risk Category</label>
            <select id="risk-category" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              <option value="Financial Reporting">Financial Reporting</option>
              <option value="Audit Existence">Audit Existence</option>
              <option value="Regulatory Compliance">Regulatory Compliance</option>
              <option value="Taxation">Taxation</option>
              <option value="Internal Controls">Internal Controls</option>
            </select>
          </div>
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Likelihood (1 to 5)</label>
            <select id="risk-likelihood" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              <option value="1">1 - Rare</option>
              <option value="2">2 - Unlikely</option>
              <option value="3">3 - Possible</option>
              <option value="4" selected>4 - Likely</option>
              <option value="5">5 - Almost Certain</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Impact (1 to 5)</label>
            <select id="risk-impact" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              <option value="1">1 - Negligible</option>
              <option value="2">2 - Minor</option>
              <option value="3">3 - Moderate</option>
              <option value="4">4 - Major</option>
              <option value="5" selected>5 - Catastrophic</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Audit Mitigation Plan</label>
          <textarea id="risk-mitigation" class="form-textarea" rows="2" placeholder="Detail substantive testing and sampling procedures to mitigate this risk..." style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;"></textarea>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Risks.saveRisk()">
        <i data-lucide="shield-alert"></i> Register Audit Risk
      </button>
    `;

    Modal.open('Log Audit Risk', formHtml, footerHtml);
  },

  saveRisk() {
    const title = document.getElementById('risk-title')?.value.trim();
    if (!title) {
      Toast.show('Please enter a risk title.', 'warning');
      return;
    }

    const prjId = document.getElementById('risk-project-id')?.value;
    const cat = document.getElementById('risk-category')?.value;
    const l = Number(document.getElementById('risk-likelihood')?.value || 3);
    const i = Number(document.getElementById('risk-impact')?.value || 3);
    const mit = document.getElementById('risk-mitigation')?.value || 'Substantive testing to be executed.';

    DataStore.create('risks', {
      projectId: prjId,
      title,
      category: cat,
      likelihood: l,
      impact: i,
      score: l * i,
      ownerId: 'usr_3',
      mitigation: mit,
      residualRisk: l * i >= 15 ? 'high' : (l * i >= 8 ? 'medium' : 'low'),
      status: 'open'
    });

    Modal.close();
    Toast.show(`Audit Risk "${title}" registered successfully! Score: ${l * i}`, 'success');
    this.render(document.getElementById('page-content'));
  },

  openAddFindingModal() {
    const projects = DataStore.getAll('projects');

    const formHtml = `
      <form id="add-finding-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Finding Description *</label>
          <input type="text" id="finding-title" class="form-input" placeholder="e.g. Failure to obtain dual authorization on high-value wire transfers" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Engagement *</label>
            <select id="finding-project-id" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              ${projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Classification</label>
            <select id="finding-type" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              <option value="Material Weakness">Material Weakness</option>
              <option value="Control Deficiency" selected>Control Deficiency</option>
              <option value="Observation">Observation</option>
            </select>
          </div>
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Internal Control Reference</label>
            <input type="text" id="finding-ref" class="form-input" value="FIN-AUTH-08" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Target Follow-up Date</label>
            <input type="date" id="finding-date" class="form-input" value="2026-10-15" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Client Management Response</label>
          <textarea id="finding-response" class="form-textarea" rows="2" placeholder="Record official management response or remediation commitment..." style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;"></textarea>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Risks.saveFinding()">
        <i data-lucide="alert-triangle"></i> Log Audit Finding
      </button>
    `;

    Modal.open('Log Audit Finding & Control Deficiency', formHtml, footerHtml);
  },

  saveFinding() {
    const title = document.getElementById('finding-title')?.value.trim();
    if (!title) {
      Toast.show('Please enter a finding description.', 'warning');
      return;
    }

    DataStore.create('findings', {
      projectId: document.getElementById('finding-project-id')?.value || 'prj_1',
      title,
      type: document.getElementById('finding-type')?.value || 'Control Deficiency',
      controlRef: document.getElementById('finding-ref')?.value || 'FIN-REC-01',
      managementResponse: document.getElementById('finding-response')?.value || 'Management committed to rectifying control by Q4.',
      status: 'open',
      followUpDate: document.getElementById('finding-date')?.value || '2026-10-15'
    });

    Modal.close();
    Toast.show(`Control Finding logged successfully!`, 'success');
    this.render(document.getElementById('page-content'));
  }
};
