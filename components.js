/* =============================================
   YACA PM - UI Components & Helper Utilities
   ============================================= */

window.Modal = {
  open(title, bodyHtml, footerHtml = '', isLarge = false) {
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-footer').innerHTML = footerHtml;

    if (isLarge) {
      container.classList.add('modal-lg');
    } else {
      container.classList.remove('modal-lg');
    }

    overlay.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
  },

  close() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('active');
  },

  confirm(title, message, onConfirm) {
    const bodyHtml = `<p class="confirm-message">${message}</p>`;
    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-danger" id="confirm-btn-action">Confirm</button>
    `;
    this.open(title, bodyHtml, footerHtml);
    document.getElementById('confirm-btn-action').onclick = () => {
      onConfirm();
      Modal.close();
    };
  }
};

window.Toast = {
  show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    const id = 'toast_' + Date.now();

    const icons = {
      success: 'check-circle',
      error: 'alert-circle',
      warning: 'alert-triangle',
      info: 'info'
    };

    const iconName = icons[type] || 'info';

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.id = id;
    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="document.getElementById('${id}').remove()">
        <i data-lucide="x"></i>
      </button>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      if (document.getElementById(id)) {
        document.getElementById(id).remove();
      }
    }, duration);
  }
};

window.Components = {
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const past = new Date(dateStr);
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
    return this.formatDate(dateStr);
  },

  getInitials(name) {
    if (!name) return 'YA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  },

  getAvatarColor(name) {
    const colors = [
      'linear-gradient(135deg, #D4A843, #b8912e)',
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #10b981, #047857)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      'linear-gradient(135deg, #f59e0b, #b45309)',
      'linear-gradient(135deg, #ec4899, #be185d)',
      'linear-gradient(135deg, #14b8a6, #0f766e)'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  },

  avatar(name, size = 'md') {
    const initials = this.getInitials(name);
    const bg = this.getAvatarColor(name);
    return `<div class="avatar avatar-${size}" style="background: ${bg}" title="${name}">${initials}</div>`;
  },

  statusBadge(status) {
    const labels = {
      'planning': 'Planning',
      'fieldwork': 'In Fieldwork',
      'review': 'In Review',
      'partner-review': 'Partner Review',
      'filing': 'Filing Phase',
      'completed': 'Completed',
      'on-hold': 'On Hold',
      'backlog': 'Backlog',
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'in-review': 'In Review',
      'approved': 'Approved',
      'done': 'Done'
    };
    const label = labels[status] || status;
    return `<span class="badge badge-${status}">${label}</span>`;
  },

  priorityBadge(priority) {
    const labels = {
      'critical': 'Critical',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return `<span class="badge priority-${priority}">${labels[priority] || priority}</span>`;
  },

  riskBadge(risk) {
    const labels = { 'high': 'High Risk', 'medium': 'Medium Risk', 'low': 'Low Risk' };
    return `<span class="badge badge-risk-${risk}">${labels[risk] || risk}</span>`;
  },

  typeBadge(type) {
    const labels = { 'audit': 'Audit & Assurance', 'tax': 'Tax Compliance', 'advisory': 'Advisory', 'special': 'Special Assignment' };
    return `<span class="badge badge-${type}">${labels[type] || type}</span>`;
  },

  statCard(icon, label, value, trend = null, trendDirection = 'up', accentColor = '#D4A843') {
    let trendHtml = '';
    if (trend) {
      const iconName = trendDirection === 'up' ? 'trending-up' : 'trending-down';
      trendHtml = `<div class="stat-trend ${trendDirection}"><i data-lucide="${iconName}"></i> ${trend}</div>`;
    }
    const isCurrency = icon === 'pkr' || icon === 'dollar-sign' || icon === 'dollar';
    const iconInnerHtml = isCurrency
      ? `<span class="stat-pkr-badge">PKR</span>`
      : `<i data-lucide="${icon}"></i>`;

    return `
      <div class="stat-card" style="--card-accent: ${accentColor}">
        <div class="stat-icon" style="background: ${accentColor}20; color: ${accentColor}">
          ${iconInnerHtml}
        </div>
        <div class="stat-info">
          <div class="stat-value">${value}</div>
          <div class="stat-label">${label}</div>
          ${trendHtml}
        </div>
      </div>
    `;
  },

  projectCard(project) {
    const client = DataStore.getById('clients', project.clientId);
    const clientName = client ? client.name : 'Unknown Client';
    const percent = project.budgetHours > 0 ? Math.min(100, Math.round((project.actualHours / project.budgetHours) * 100)) : 0;

    const teamHtml = (project.teamMembers || []).slice(0, 3).map(id => {
      const member = DataStore.getById('team', id);
      return member ? this.avatar(member.name, 'sm') : '';
    }).join('');

    const moreCount = (project.teamMembers || []).length > 3 ? (project.teamMembers.length - 3) : 0;
    const moreHtml = moreCount > 0 ? `<div class="avatar avatar-sm avatar-more">+${moreCount}</div>` : '';

    return `
      <div class="project-card" onclick="Projects.openDetail('${project.id}')">
        <div class="project-card-header">
          <div>
            <div class="project-card-title">${project.title}</div>
            <div class="project-card-client">${clientName}</div>
          </div>
          ${this.statusBadge(project.status)}
        </div>
        <div style="margin-top: 8px;">
          ${this.typeBadge(project.type)}
          ${this.priorityBadge(project.priority)}
        </div>
        <div class="project-progress">
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${percent}%"></div>
          </div>
          <div class="progress-text">${project.actualHours} / ${project.budgetHours} Budget Hours (${percent}%)</div>
        </div>
        <div class="project-card-meta">
          <div class="meta-item">
            <i data-lucide="calendar"></i>
            <span>Due ${this.formatDate(project.deadline)}</span>
          </div>
          <div class="avatar-stack" style="margin-left: auto;">
            ${teamHtml}
            ${moreHtml}
          </div>
        </div>
      </div>
    `;
  },

  taskCard(task) {
    const assignee = DataStore.getById('team', task.assigneeId);
    const assigneeAvatar = assignee ? this.avatar(assignee.name, 'sm') : `<div class="avatar avatar-sm" style="background: #4b5563">?</div>`;
    const commentCount = (task.comments || []).length;
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

    const labelsHtml = (task.labels || []).map(l => `<span class="task-label tag-gold">${l}</span>`).join('');

    return `
      <div class="task-card" draggable="true" ondragstart="Board.handleDragStart(event, '${task.id}')" onclick="Board.openTaskDetail('${task.id}')">
        <div class="task-card-priority ${task.priority}"></div>
        <div class="task-card-labels">${labelsHtml}</div>
        <div class="task-card-title">${task.title}</div>
        <div class="task-card-footer">
          <div class="task-card-meta">
            ${commentCount > 0 ? `<div class="meta-item"><i data-lucide="message-square"></i> ${commentCount}</div>` : ''}
            ${task.dueDate ? `
              <div class="task-due-date ${isOverdue ? 'overdue' : 'upcoming'}">
                <i data-lucide="clock"></i> ${this.formatDate(task.dueDate)}
              </div>
            ` : ''}
          </div>
          ${assigneeAvatar}
        </div>
      </div>
    `;
  },

  pageHeader(title, subtitle, actionsHtml = '') {
    return `
      <div class="page-header">
        <div class="page-header-info">
          <h1>${title}</h1>
          <div class="subtitle">${subtitle}</div>
        </div>
        <div class="page-header-actions">
          ${actionsHtml}
        </div>
      </div>
    `;
  },

  emptyState(icon, title, subtitle, actionBtnHtml = '') {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i data-lucide="${icon}"></i>
        </div>
        <div class="empty-state-title">${title}</div>
        <div class="empty-state-subtitle">${subtitle}</div>
        ${actionBtnHtml}
      </div>
    `;
  },

  renderGuidePage(activeTab = 'simple') {
    const isSimple = activeTab === 'simple';

    return `
      ${this.pageHeader('Platform User Guide & Help Center', 'Learn how to use Yousuf Adil Chartered Accountants Project Management Workflows', `
        <div class="guide-tab-buttons">
          <button class="btn ${isSimple ? 'btn-primary' : 'btn-secondary'}" onclick="App.switchGuideTab('simple')">
            <i data-lucide="zap"></i> Simple Quick-Start
          </button>
          <button class="btn ${!isSimple ? 'btn-primary' : 'btn-secondary'}" onclick="App.switchGuideTab('detailed')">
            <i data-lucide="book-open"></i> Detailed Manual
          </button>
        </div>
      `)}

      <div class="guide-container">
        ${isSimple ? this.renderSimpleGuide() : this.renderDetailedGuide()}
      </div>
    `;
  },

  renderSimpleGuide() {
    return `
      <div class="guide-banner">
        <div class="banner-content">
          <h2><i data-lucide="compass"></i> Quick-Start Guide (3-Step Overview)</h2>
          <p>Get up and running with Yousuf Adil PM workflows in under 2 minutes.</p>
        </div>
      </div>

      <div class="guide-steps-grid">
        <div class="guide-step-card">
          <div class="step-number">1</div>
          <div class="step-icon"><i data-lucide="briefcase"></i></div>
          <h3>Select & Create Engagements</h3>
          <p>Navigate to <strong>Engagements</strong> to create Audit & Assurance, Tax Compliance, or Advisory assignments. Set budget hours, deadlines, and assign audit teams.</p>
        </div>

        <div class="guide-step-card">
          <div class="step-number">2</div>
          <div class="step-icon"><i data-lucide="trello"></i></div>
          <h3>Manage Audit Working Papers on Board</h3>
          <p>Use the drag-and-drop <strong>Board</strong> to move working paper tasks from <em>Backlog</em> to <em>Fieldwork</em>, <em>Manager Review</em>, and <em>Partner Sign-Off</em>.</p>
        </div>

        <div class="guide-step-card">
          <div class="step-number">3</div>
          <div class="step-icon"><i data-lucide="clock"></i></div>
          <h3>Track Timesheets & Export Reports</h3>
          <p>Log your daily audit working hours in <strong>Timesheets</strong> and generate executive compliance reports under <strong>Reports</strong> with one click.</p>
        </div>
      </div>

      <div class="guide-roles-section" style="margin-top: 30px;">
        <h3 class="section-title"><i data-lucide="shield"></i> Role-Based Quick Functions</h3>
        <div class="roles-grid">
          <div class="role-card">
            <div class="role-header">
              <span class="badge badge-partner">Partner</span>
              <h4>Partner Sign-Off & Review</h4>
            </div>
            <ul>
              <li><i data-lucide="check"></i> Review final audit working paper files</li>
              <li><i data-lucide="check"></i> Authorize engagement finalization</li>
              <li><i data-lucide="check"></i> Monitor utilization & partner sign-off queues</li>
            </ul>
          </div>

          <div class="role-card">
            <div class="role-header">
              <span class="badge badge-manager">Engagement Manager</span>
              <h4>Engagement & Budget Control</h4>
            </div>
            <ul>
              <li><i data-lucide="check"></i> Track actual vs budgeted audit hours</li>
              <li><i data-lucide="check"></i> Reassign audit staff & resolve overdue warnings</li>
              <li><i data-lucide="check"></i> Approve team weekly timesheet logs</li>
            </ul>
          </div>

          <div class="role-card">
            <div class="role-header">
              <span class="badge badge-fieldwork">Audit Senior / Staff</span>
              <h4>Fieldwork & Task Execution</h4>
            </div>
            <ul>
              <li><i data-lucide="check"></i> Update task statuses on Kanban Board</li>
              <li><i data-lucide="check"></i> Log billable audit hours daily</li>
              <li><i data-lucide="check"></i> Upload compliance & audit evidence files</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  },

  renderDetailedGuide() {
    return `
      <div class="guide-banner detailed">
        <div class="banner-content">
          <h2><i data-lucide="book-open"></i> Detailed Module & Functionality Reference Manual</h2>
          <p>Comprehensive guide explaining every function, workflow stage, and quality control rule.</p>
        </div>
      </div>

      <div class="manual-search-box">
        <i data-lucide="search"></i>
        <input type="text" id="guide-manual-search" placeholder="Search guide topics (e.g. Audit Stages, Timesheets, Partner Sign-off...)" onkeyup="App.filterGuideTopics(this.value)">
      </div>

      <div class="manual-accordion-list" id="guide-topics">
        <!-- Module 1: Dashboard -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="layout-dashboard"></i>
              <span>1. Executive Dashboard</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>The <strong>Executive Dashboard</strong> provides real-time visibility into all firm engagements, pending review queues, and utilization metrics.</p>
            <ul>
              <li><strong>Active Engagements KPI:</strong> Counts active Audit, Tax, and Advisory assignments currently in progress.</li>
              <li><strong>Pending Reviews:</strong> Displays working paper files waiting for Manager or Partner sign-off.</li>
              <li><strong>Overdue Audit Tasks:</strong> Highlights tasks past deadline requiring immediate escalation.</li>
              <li><strong>Active Engagements Grid:</strong> Displays budget consumption bars and target delivery dates.</li>
            </ul>
          </div>
        </div>

        <!-- Module 2: Engagements -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="briefcase"></i>
              <span>2. Engagement & Audit Workflows</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>The <strong>Engagements module</strong> enforces structured accounting firm workflow stages:</p>
            <ol>
              <li><strong>Planning Phase:</strong> Client onboarding, risk rating (High/Medium/Low), team assignment, and budget allocation.</li>
              <li><strong>Fieldwork Phase:</strong> Audit testing, internal control evaluations, and working paper preparation.</li>
              <li><strong>Review Phase:</strong> Quality control review by Senior Auditor and Engagement Manager.</li>
              <li><strong>Partner Sign-Off:</strong> Mandatory final approval before issuing auditor reports.</li>
              <li><strong>Finalization / Filing:</strong> ICAP & regulatory filing completion.</li>
            </ol>
          </div>
        </div>

        <!-- Module 3: Kanban Board -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="trello"></i>
              <span>3. Interactive Board & Working Papers</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>The <strong>Board</strong> allows visual task tracking with drag-and-drop support across 4 key columns:</p>
            <ul>
              <li><strong>Backlog:</strong> Upcoming audit procedures and compliance tasks.</li>
              <li><strong>In Progress:</strong> Active audit fieldwork being performed.</li>
              <li><strong>In Review:</strong> Work submitted for Manager or Quality Control review.</li>
              <li><strong>Done:</strong> Fully reviewed and signed-off audit tasks.</li>
            </ul>
          </div>
        </div>

        <!-- Module 4: Clients -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="building-2"></i>
              <span>4. Client Directory & Compliance Details</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>Maintain complete corporate client profiles including tax registration, financial year-ends, entity types (Listed Public, Private, Banking, Power Sector), and assigned engagement partners.</p>
          </div>
        </div>

        <!-- Module 5: WBS & Gantt Timeline -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="bar-chart-2"></i>
              <span>5. WBS & Interactive Gantt Timeline</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>Deconstruct engagements into 4 Work Breakdown Structure (WBS) levels: <strong>Phase → Milestone → Task → Subtask</strong> with timeline bars, completion percentages, and critical path highlights.</p>
          </div>
        </div>

        <!-- Module 6: Risk Register & 5x5 Heat Map -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="shield-alert"></i>
              <span>6. Audit Risk Register & 5x5 Heat Map Matrix</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>Log financial statement and engagement risks, compute Likelihood (1-5) × Impact (1-5) scores, visualize risk concentration on a <strong>5x5 Heat Map Matrix</strong>, and assign residual risk mitigation plans.</p>
          </div>
        </div>

        <!-- Module 7: Audit Findings & Deficiencies -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="alert-triangle"></i>
              <span>7. Internal Control Deficiencies & Findings Log</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>Track control deficiencies, material weaknesses, and audit observations. Record client management responses and target resolution dates.</p>
          </div>
        </div>

        <!-- Module 8: Working Paper Vault & Versioning -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="file-text"></i>
              <span>8. Working Paper Vault & Version Control</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>Centralized document repository with version history (v1.0, v1.1, v2.0), WBS folder organization, ISA 500 financial statement assertion tagging (Existence, Rights, Valuation, Completeness), and electronic sign-offs.</p>
          </div>
        </div>

        <!-- Module 9: PKR Billing & WIP Realization -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="coins"></i>
              <span>9. PKR Billing, WIP Tracking & Invoicing</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>Standardized PKR billing module calculating real-time Work-In-Progress (WIP) valuations, printable fee invoices, out-of-pocket project expense recovery, and billable time realization metrics.</p>
          </div>
        </div>

        <!-- Module 10: Partner Approvals -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="check-square"></i>
              <span>10. Partner Sign-Off & Quality Review Queue</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>Multi-level review pipeline (Preparer → Reviewer → Engagement Partner). Execute digital partner sign-offs with immutable timestamp logs before audit report issuance.</p>
          </div>
        </div>

        <!-- Module 11: ISQM 1 Automations -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="zap"></i>
              <span>11. ISQM 1 / ISA 220 Automations & Quality Hub</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>Trigger-based workflow rules (overdue escalation, automatic reviewer assignment) and ISQM 1 quality management audit compliance checks.</p>
          </div>
        </div>

        <!-- Module 12: Client Portal -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="globe"></i>
              <span>12. Client & External Stakeholder Portal</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>Simulate client-facing access mode where external client CFOs or Finance Leads can view shared milestones, upload requested audit schedules, and sign off client deliverables while internal notes and billable rates remain securely hidden.</p>
          </div>
        </div>

        <!-- Module 13: Timesheets -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="clock"></i>
              <span>13. Team Timesheets & Billable Hours Log</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>Track billable audit hours per assignment in PKR to calculate budget utilization, staff efficiency, and fee recovery ratios accurately.</p>
          </div>
        </div>

        <!-- Module 14: Reports, Audit Trail & System Settings -->
        <div class="manual-item topic-item">
          <div class="manual-header" onclick="App.toggleAccordion(this)">
            <div class="manual-title">
              <i data-lucide="bar-chart-3"></i>
              <span>14. Reports, Audit Trail & System Settings</span>
            </div>
            <i data-lucide="chevron-down" class="accordion-icon"></i>
          </div>
          <div class="manual-body">
            <p>Generate summary PDF/CSV audit reports, inspect immutable action audit trails, and configure firm defaults under System Settings.</p>
          </div>
        </div>
      </div>
    `;
  }
};
