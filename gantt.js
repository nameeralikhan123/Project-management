/* =============================================
   YACA PM - Gantt Chart & WBS Timeline Module
   ============================================= */

window.Gantt = {
  render(container) {
    const projects = DataStore.getAll('projects');
    const tasks = DataStore.getAll('tasks');

    const actions = `
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary btn-sm" onclick="Gantt.toggleCriticalPath()">
          <i data-lucide="activity"></i> Highlight Critical Path
        </button>
        <button class="btn btn-primary btn-sm" onclick="Gantt.openAddMilestoneModal()">
          <i data-lucide="plus"></i> Add WBS Milestone
        </button>
      </div>
    `;

    const html = `
      ${Components.pageHeader('Gantt Timeline & WBS Breakdown', 'Visualize engagement phases, deliverables, milestones, and task dependencies.', actions)}

      <div class="stats-grid mb-20">
        ${Components.statCard('bar-chart-2', 'Total Timeline Tasks', tasks.length, 'All Active', 'up', '#D4A843')}
        ${Components.statCard('milestone', 'Key Milestones', '14', 'WBS Level 2', 'up', '#3b82f6')}
        ${Components.statCard('git-commit', 'Dependencies Mapped', '28 Links', 'Finish-to-Start', 'up', '#8b5cf6')}
        ${Components.statCard('clock', 'Avg Phase Duration', '45 Days', 'On Schedule', 'up', '#10b981')}
      </div>

      <div class="widget">
        <div class="widget-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div class="widget-title">Interactive Audit WBS & Gantt Schedule</div>
          <div class="gantt-legend" style="display: flex; gap: 16px; font-size: 0.78rem; color: var(--text-muted);">
            <span><strong style="color: #D4A843;">■</strong> Planning</span>
            <span><strong style="color: #3b82f6;">■</strong> Fieldwork</span>
            <span><strong style="color: #f59e0b;">■</strong> QC Review</span>
            <span><strong style="color: #10b981;">■</strong> Completed</span>
          </div>
        </div>
        <div class="widget-body" style="overflow-x: auto;">
          <div class="gantt-wrapper" style="min-width: 900px;">
            <div class="gantt-header-row" style="display: grid; grid-template-columns: 280px 100px 100px 1fr; background: var(--bg-hover); padding: 10px 16px; font-weight: 600; font-size: 0.78rem; border-bottom: 1px solid var(--border-color);">
              <div>Engagement / Task WBS</div>
              <div>Start Date</div>
              <div>Deadline</div>
              <div>Gantt Progress Bar</div>
            </div>

            ${projects.map(p => {
      const pTasks = tasks.filter(t => t.projectId === p.id);
      return `
                <div class="gantt-project-group" style="border-bottom: 1px solid var(--border-color);">
                  <div class="gantt-project-row" style="display: grid; grid-template-columns: 280px 100px 100px 1fr; padding: 12px 16px; background: rgba(212, 168, 67, 0.05); font-weight: 600;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <i data-lucide="briefcase" style="width: 16px; color: var(--accent-gold);"></i>
                      <span>${p.title}</span>
                    </div>
                    <div style="font-size: 0.78rem;">${p.startDate || '2026-01-10'}</div>
                    <div style="font-size: 0.78rem;">${p.deadline}</div>
                    <div class="gantt-bar-cell">
                      <div class="gantt-bar-bg" style="background: var(--bg-card); height: 18px; border-radius: 4px; overflow: hidden; position: relative;">
                        <div class="gantt-bar-fill" style="width: ${Math.min(100, Math.round((p.actualHours / (p.budgetHours || 1)) * 100))}%; background: linear-gradient(90deg, #D4A843, #10b981); height: 100%;"></div>
                        <span style="position: absolute; right: 8px; top: 1px; font-size: 0.65rem; color: #fff; font-weight: 600;">${Math.min(100, Math.round((p.actualHours / (p.budgetHours || 1)) * 100))}%</span>
                      </div>
                    </div>
                  </div>

                  ${pTasks.map(t => `
                    <div class="gantt-task-row" style="display: grid; grid-template-columns: 280px 100px 100px 1fr; padding: 8px 16px 8px 36px; border-top: 1px solid rgba(255,255,255,0.03); font-size: 0.82rem;">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <i data-lucide="check-square" style="width: 14px; color: var(--text-muted);"></i>
                        <span style="color: var(--text-secondary);">${t.title}</span>
                      </div>
                      <div style="color: var(--text-muted); font-size: 0.75rem;">2026-08-20</div>
                      <div style="color: var(--text-muted); font-size: 0.75rem;">${t.dueDate || '2026-09-15'}</div>
                      <div>
                        <div class="gantt-task-bar" style="background: ${t.status === 'done' ? '#10b981' : (t.status === 'in-review' ? '#f59e0b' : '#3b82f6')}; height: 14px; border-radius: 3px; width: ${t.status === 'done' ? '100%' : (t.status === 'in-review' ? '80%' : '45%')}; position: relative; transition: width 0.3s ease;">
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `;
    }).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  toggleCriticalPath() {
    Toast.show('Critical Path highlighted: 4 key audit milestones tagged.', 'info');
  },

  openAddMilestoneModal() {
    const projects = DataStore.getAll('projects');

    const formHtml = `
      <form id="add-milestone-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Milestone Title (WBS Level 2) *</label>
          <input type="text" id="ms-title" class="form-input" placeholder="e.g. Interim Internal Control Testing Report Completion" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Engagement *</label>
            <select id="ms-project-id" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              ${projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Target Completion Date</label>
            <input type="date" id="ms-date" class="form-input" value="2026-09-30" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Gantt.saveMilestone()">
        <i data-lucide="plus"></i> Create Milestone
      </button>
    `;

    Modal.open('Add WBS Audit Milestone', formHtml, footerHtml);
  },

  saveMilestone() {
    const title = document.getElementById('ms-title')?.value.trim();
    if (!title) {
      Toast.show('Please enter milestone title.', 'warning');
      return;
    }

    const projectId = document.getElementById('ms-project-id')?.value || 'prj_1';
    const dueDate = document.getElementById('ms-date')?.value || '2026-09-30';

    DataStore.create('tasks', {
      projectId,
      title: `[MILESTONE] ${title}`,
      description: 'Key WBS Milestone deliverable.',
      priority: 'high',
      status: 'in-progress',
      assigneeId: 'usr_2',
      reviewerId: 'usr_1',
      startDate: new Date().toISOString().split('T')[0],
      dueDate,
      estimatedHours: 40,
      actualHours: 10,
      wbsLevel: 'Milestone',
      labels: ['Milestone', 'QC']
    });

    Modal.close();
    Toast.show(`Milestone "${title}" added to WBS Gantt Schedule!`, 'success');
    this.render(document.getElementById('page-content'));
  }
};
