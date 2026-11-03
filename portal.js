/* =============================================
   YACA PM - Client & External Stakeholder Portal View
   ============================================= */

window.Portal = {
    render(container) {
        const projects = DataStore.getAll('projects');
        const clientProjects = projects.filter(p => p.clientId === 'cli_1' || p.clientId === 'cli_4');
        const documents = DataStore.getAll('documents');

        const html = `
      <div class="client-portal-banner" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15)); border: 1px solid var(--accent-green); padding: 16px 20px; border-radius: var(--border-radius); margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="background: var(--accent-green); color: #000; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: space-between; align-items: center; justify-content: center;">
            <i data-lucide="globe"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1rem; color: #fff;">Client & External Stakeholder Portal Mode</h3>
            <div style="font-size: 0.78rem; color: var(--text-muted);">Simulating view seen by corporate clients (e.g. Habib Bank Limited / K-Electric). Internal billing rates & audit notes hidden.</div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="App.toggleClientPortalMode()">
          <i data-lucide="arrow-left"></i> Return to Firm Internal View
        </button>
      </div>

      ${Components.pageHeader('Corporate Client Collaboration Hub', 'Track engagement milestones, deliverable progress, and sign off shared audit working papers.')}

      <div class="stats-grid mb-20">
        ${Components.statCard('briefcase', 'Active Engagements', clientProjects.length, 'In Progress', 'up', '#D4A843')}
        ${Components.statCard('check-circle', 'Completed Deliverables', '18 Shared Files', 'Signed Off', 'up', '#10b981')}
        ${Components.statCard('clock', 'Pending Client Sign-Offs', '2 Requests', 'Action Needed', 'up', '#f59e0b')}
        ${Components.statCard('shield-check', 'Security & Access Level', 'Restricted Portal', 'AES-256 Encrypted', 'up', '#3b82f6')}
      </div>

      <div class="content-grid mb-20">
        <!-- Client Engagements Grid -->
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title">Your Audit & Advisory Engagements</div>
          </div>
          <div class="widget-body">
            <div class="projects-grid">
              ${clientProjects.map(p => Components.projectCard(p)).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Shared Documents & Deliverables -->
      <div class="widget">
        <div class="widget-header">
          <div class="widget-title">Shared Client Documents & Sign-Off Requests</div>
        </div>
        <div class="widget-body">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Deliverable Document</th>
                  <th>Engagement</th>
                  <th>Status</th>
                  <th>Client Action</th>
                </tr>
              </thead>
              <tbody>
                ${documents.map(d => {
            const prj = DataStore.getById('projects', d.projectId);
            return `
                    <tr>
                      <td>
                        <div style="font-weight: 600;">${d.name}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${d.wbsFolder} • ${d.version}</div>
                      </td>
                      <td>${prj ? prj.title : 'General'}</td>
                      <td><span class="badge badge-completed">SHARED WITH CLIENT</span></td>
                      <td>
                        <button class="btn btn-primary btn-sm" onclick="Toast.show('Client Sign-Off registered.', 'success')">
                          <i data-lucide="check"></i> Sign & Approve
                        </button>
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
    }
};
