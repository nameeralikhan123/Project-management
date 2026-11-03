/* =============================================
   YACA PM - Dashboard Module
   ============================================= */

window.Dashboard = {
  render(container) {
    const stats = DataStore.getStats();
    const projects = DataStore.getAll('projects');
    const tasks = DataStore.getAll('tasks');
    const activities = DataStore.getActivities(6);

    const activeEngagements = projects.filter(p => p.status !== 'completed').slice(0, 4);

    const upcomingDeadlines = tasks
      .filter(t => t.status !== 'done' && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    const html = `
      ${Components.pageHeader('Executive Dashboard', 'Overview of Yousuf Adil Chartered Accountants engagements, utilization, and critical tasks.')}

      <div class="stats-grid">
        ${Components.statCard('briefcase', 'Active Engagements', stats.activeProjects, `${stats.completedProjects} Completed`, 'up', '#D4A843')}
        ${Components.statCard('file-check', 'Pending Reviews', stats.pendingReviews, 'Quality Control', 'up', '#f59e0b')}
        ${Components.statCard('alert-circle', 'Overdue Audit Tasks', stats.overdueTasks, 'Requires Attention', 'down', '#ef4444')}
        ${Components.statCard('users', 'Team Utilization', `${stats.utilizationRate}%`, 'Target: 85%', 'up', '#10b981')}
      </div>

      <div class="content-grid">
        <div class="main-column">
          <!-- Active Engagements Widget -->
          <div class="widget mb-20">
            <div class="widget-header">
              <div class="widget-title">Active Audit & Advisory Engagements</div>
              <button class="btn btn-ghost btn-sm" onclick="window.location.hash='#projects'">View All (${stats.activeProjects})</button>
            </div>
            <div class="widget-body">
              <div class="projects-grid">
                ${activeEngagements.map(p => Components.projectCard(p)).join('')}
              </div>
            </div>
          </div>

          <!-- Workload & Utilization Chart -->
          <div class="widget">
            <div class="widget-header">
              <div class="widget-title">Department Hours & Workload Distribution</div>
            </div>
            <div class="widget-body">
              <div class="chart-container">
                <canvas id="dashboardWorkloadChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="side-column">
          <!-- Upcoming Deadlines -->
          <div class="widget mb-20">
            <div class="widget-header">
              <div class="widget-title">Upcoming Task Deadlines</div>
            </div>
            <div class="widget-body">
              ${upcomingDeadlines.length === 0 ? '<p class="text-muted">No upcoming deadlines</p>' : ''}
              ${upcomingDeadlines.map(t => {
                const dateObj = new Date(t.dueDate);
                const month = dateObj.toLocaleString('en-US', { month: 'short' });
                const day = dateObj.getDate();
                const project = DataStore.getById('projects', t.projectId);
                return `
                  <div class="deadline-item" onclick="Board.openTaskDetail('${t.id}')" style="cursor: pointer;">
                    <div class="deadline-date">
                      <span class="deadline-date-month">${month}</span>
                      <span class="deadline-date-day">${day}</span>
                    </div>
                    <div class="deadline-info">
                      <div class="deadline-title">${t.title}</div>
                      <div class="deadline-client">${project ? project.title : ''}</div>
                    </div>
                    ${Components.priorityBadge(t.priority)}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="widget">
            <div class="widget-header">
              <div class="widget-title">Audit Activity Trail</div>
            </div>
            <div class="widget-body">
              <div class="activity-feed">
                ${activities.map(a => {
                  const user = DataStore.getById('team', a.userId);
                  const userName = user ? user.name : 'System';
                  const userAvatar = Components.avatar(userName, 'sm');
                  return `
                    <div class="activity-item">
                      ${userAvatar}
                      <div class="activity-content">
                        <div class="activity-text"><strong>${userName}</strong> ${a.description}</div>
                        <div class="activity-time">${Components.timeAgo(a.createdAt)}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.initCharts();
  },

  initCharts() {
    const ctx = document.getElementById('dashboardWorkloadChart');
    if (!ctx) return;

    const team = DataStore.getAll('team');
    const depts = ['Audit', 'Tax', 'Advisory'];
    const deptHours = depts.map(d => {
      const deptMembers = team.filter(m => m.department.toLowerCase() === d.toLowerCase());
      return deptMembers.length * 40;
    });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Audit & Assurance', 'Tax Compliance', 'Financial Advisory'],
        datasets: [
          {
            label: 'Budget Hours Allocated',
            data: [1350, 460, 650],
            backgroundColor: '#D4A843'
          },
          {
            label: 'Hours Executed',
            data: [990, 135, 545],
            backgroundColor: '#3b82f6'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#9ca3af', font: { family: 'Inter' } } }
        },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }
};
