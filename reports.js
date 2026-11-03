/* =============================================
   YACA PM - Reports & Analytics Module
   ============================================= */

window.Reports = {
  render(container) {
    const stats = DataStore.getStats();

    const actions = `
      <button class="btn btn-secondary" onclick="window.print()">
        <i data-lucide="printer"></i> Print Summary
      </button>
    `;

    const html = `
      ${Components.pageHeader('Audit Reports & Analytics', 'Firm-level engagement status, budget variance, and revenue metrics.', actions)}

      <div class="stats-grid">
        ${Components.statCard('bar-chart-2', 'Total Firm Engagements', stats.totalProjects, 'FY2026 Active', 'up', '#D4A843')}
        ${Components.statCard('clock', 'Budget Variance', '-4.2%', 'Under Budget', 'up', '#10b981')}
        ${Components.statCard('check-circle-2', 'On-Time Filing Rate', '94.8%', 'Target: 95%', 'up', '#3b82f6')}
        ${Components.statCard('shield-alert', 'Audit Risk Index', 'Moderate', '2 High Risk Clients', 'down', '#f59e0b')}
      </div>

      <div class="grid-2 mb-20">
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title">Engagements by Status Breakdown</div>
          </div>
          <div class="widget-body">
            <div class="chart-container">
              <canvas id="rptStatusChart"></canvas>
            </div>
          </div>
        </div>

        <div class="widget">
          <div class="widget-header">
            <div class="widget-title">Client Risk Rating Distribution</div>
          </div>
          <div class="widget-body">
            <div class="chart-container">
              <canvas id="rptRiskChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="widget">
        <div class="widget-header">
          <div class="widget-title">Engagement Budget vs. Actual Hours Summary</div>
        </div>
        <div class="widget-body">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Engagement</th>
                  <th>Client</th>
                  <th>Budget Hours</th>
                  <th>Actual Hours</th>
                  <th>Variance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${DataStore.getAll('projects').map(p => {
                  const client = DataStore.getById('clients', p.clientId);
                  const variance = p.budgetHours - p.actualHours;
                  const varColor = variance >= 0 ? 'text-green' : 'text-red';
                  return `
                    <tr>
                      <td class="font-medium">${p.title}</td>
                      <td>${client ? client.name : ''}</td>
                      <td>${p.budgetHours} hrs</td>
                      <td>${p.actualHours} hrs</td>
                      <td class="${varColor}">${variance >= 0 ? '+' : ''}${variance} hrs</td>
                      <td>${Components.statusBadge(p.status)}</td>
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
    this.initCharts();
  },

  initCharts() {
    // Status Pie Chart
    const ctxStatus = document.getElementById('rptStatusChart');
    if (ctxStatus) {
      const projects = DataStore.getAll('projects');
      const statuses = ['planning', 'fieldwork', 'review', 'partner-review', 'filing', 'completed'];
      const counts = statuses.map(s => projects.filter(p => p.status === s).length);

      new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
          labels: ['Planning', 'Fieldwork', 'Manager Review', 'Partner Review', 'Filing', 'Completed'],
          datasets: [{
            data: counts,
            backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#14b8a6', '#10b981']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: '#9ca3af' } } }
        }
      });
    }

    // Risk Rating Chart
    const ctxRisk = document.getElementById('rptRiskChart');
    if (ctxRisk) {
      const clients = DataStore.getAll('clients');
      const risks = ['low', 'medium', 'high'];
      const counts = risks.map(r => clients.filter(c => c.riskRating === r).length);

      new Chart(ctxRisk, {
        type: 'bar',
        data: {
          labels: ['Low Risk', 'Medium Risk', 'High Risk'],
          datasets: [{
            label: 'Number of Clients',
            data: counts,
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }
  }
};
