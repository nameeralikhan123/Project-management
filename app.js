/* =============================================
   YACA PM - Main App Controller & Router
   ============================================= */

window.App = {
  currentPage: 'dashboard',

  init() {
    // Initialize DataStore
    DataStore.init();

    // Setup Theme & Event Listeners
    this.setupTheme();
    this.setupNavigation();
    this.setupSearch();
    this.setupQuickAdd();
    this.setupNotifications();
    this.setupSidebar();

    this.updateHeaderDate();

    // Modal Close Button
    const modalCloseBtn = document.getElementById('modal-close');
    if (modalCloseBtn) {
      modalCloseBtn.onclick = () => Modal.close();
    }

    // Modal Overlay Click outside
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) Modal.close();
      };
    }

    // Hash Change Listener
    window.addEventListener('hashchange', () => {
      const page = window.location.hash.slice(1);
      this.navigate(page || 'dashboard');
    });

    // Initial Routing based on URL hash
    const initialPage = window.location.hash.slice(1) || 'dashboard';
    this.navigate(initialPage);
  },

  navigate(page) {
    if (!page) page = 'dashboard';
    this.currentPage = page;

    // Update active state in sidebar nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-page') === page) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Render corresponding page module
    const contentArea = document.getElementById('page-content');
    if (!contentArea) return;

    contentArea.scrollTop = 0;

    switch (page) {
      case 'dashboard':
        Dashboard.render(contentArea);
        break;
      case 'projects':
        Projects.render(contentArea);
        break;
      case 'board':
        Board.render(contentArea);
        break;
      case 'gantt':
        Gantt.render(contentArea);
        break;
      case 'clients':
        Clients.render(contentArea);
        break;
      case 'risks':
        Risks.render(contentArea);
        break;
      case 'documents':
        Documents.render(contentArea);
        break;
      case 'finance':
        Finance.render(contentArea);
        break;
      case 'approvals':
        Approvals.render(contentArea);
        break;
      case 'team':
        Team.render(contentArea);
        break;
      case 'timesheets':
        Timesheets.render(contentArea);
        break;
      case 'reports':
        Reports.render(contentArea);
        break;
      case 'automations':
        Automations.render(contentArea);
        break;
      case 'portal':
        Portal.render(contentArea);
        break;
      case 'guide':
        this.renderGuide(contentArea);
        break;
      case 'settings':
        Settings.render(contentArea);
        break;
      default:
        Dashboard.render(contentArea);
    }

    // Re-initialize Lucide Icons for rendered content
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const page = item.getAttribute('data-page');
        if (page) {
          window.location.hash = page;
        }
      });
    });
  },

  setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const mobileBtn = document.getElementById('mobile-menu-toggle');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }
  },

  setupSearch() {
    const searchInput = document.getElementById('global-search');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value;
      if (!q || q.trim().length === 0) {
        searchResults.classList.remove('active');
        return;
      }

      const results = DataStore.search(q);
      let html = '';

      if (results.projects.length > 0) {
        html += `<div class="search-group-title">Engagements</div>`;
        results.projects.forEach(p => {
          html += `
            <div class="search-result-item" onclick="App.selectSearchResult('project', '${p.id}')">
              <div class="result-icon" style="background: var(--accent-blue-light); color: var(--accent-blue);">
                <i data-lucide="briefcase"></i>
              </div>
              <div class="result-info">
                <div class="result-title">${p.title}</div>
                <div class="result-meta">${p.status.toUpperCase()}</div>
              </div>
            </div>
          `;
        });
      }

      if (results.tasks.length > 0) {
        html += `<div class="search-group-title">Tasks</div>`;
        results.tasks.forEach(t => {
          html += `
            <div class="search-result-item" onclick="App.selectSearchResult('task', '${t.id}')">
              <div class="result-icon" style="background: var(--accent-gold-light); color: var(--accent-gold);">
                <i data-lucide="check-square"></i>
              </div>
              <div class="result-info">
                <div class="result-title">${t.title}</div>
                <div class="result-meta">${t.status.toUpperCase()}</div>
              </div>
            </div>
          `;
        });
      }

      if (results.clients.length > 0) {
        html += `<div class="search-group-title">Clients</div>`;
        results.clients.forEach(c => {
          html += `
            <div class="search-result-item" onclick="App.selectSearchResult('client', '${c.id}')">
              <div class="result-icon" style="background: var(--accent-purple-light); color: var(--accent-purple);">
                <i data-lucide="building-2"></i>
              </div>
              <div class="result-info">
                <div class="result-title">${c.name}</div>
                <div class="result-meta">${c.industry}</div>
              </div>
            </div>
          `;
        });
      }

      if (!html) {
        html = `<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No results found for "${q}"</div>`;
      }

      searchResults.innerHTML = html;
      searchResults.classList.add('active');

      if (window.lucide) window.lucide.createIcons();
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
      }
    });
  },

  selectSearchResult(type, id) {
    const searchResults = document.getElementById('search-results');
    if (searchResults) searchResults.classList.remove('active');
    document.getElementById('global-search').value = '';

    if (type === 'project') {
      window.location.hash = 'projects';
      setTimeout(() => Projects.openDetail(id), 100);
    } else if (type === 'task') {
      window.location.hash = 'board';
      setTimeout(() => Board.openTaskDetail(id), 100);
    } else if (type === 'client') {
      window.location.hash = 'clients';
      setTimeout(() => Clients.openDetail(id), 100);
    }
  },

  setupQuickAdd() {
    const btn = document.getElementById('quick-add-btn');
    const menu = document.getElementById('quick-add-menu');

    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      menu.classList.remove('active');
    });

    menu.querySelectorAll('.quick-add-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const action = opt.getAttribute('data-action');
        menu.classList.remove('active');
        if (action === 'new-project') Projects.openCreateModal();
        if (action === 'new-task') Board.openCreateTaskModal();
        if (action === 'new-client') Clients.openCreateModal();
        if (action === 'new-time-entry') Timesheets.openLogModal();
      });
    });
  },

  setupNotifications() {
    const btn = document.getElementById('notification-btn');
    const panel = document.getElementById('notification-panel');
    const list = document.getElementById('notification-list');
    const countBadge = document.getElementById('notification-count');

    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('active');
      this.renderNotifications();
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('active');
      }
    });

    const markReadBtn = document.getElementById('mark-all-read');
    if (markReadBtn) {
      markReadBtn.onclick = () => {
        const notifications = DataStore.getAll('notifications');
        notifications.forEach(n => n.read = true);
        DataStore.save();
        this.renderNotifications();
        Toast.show('All notifications marked as read.', 'info');
      };
    }
  },

  renderNotifications() {
    const list = document.getElementById('notification-list');
    const countBadge = document.getElementById('notification-count');
    const notifications = DataStore.getAll('notifications');

    const unread = notifications.filter(n => !n.read).length;
    if (countBadge) {
      countBadge.textContent = unread;
      countBadge.style.display = unread > 0 ? 'flex' : 'none';
    }

    if (!list) return;

    if (notifications.length === 0) {
      list.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);">No notifications</div>`;
      return;
    }

    list.innerHTML = notifications.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}">
        <div class="notif-icon" style="background: rgba(212, 168, 67, 0.1); color: var(--accent-gold);">
          <i data-lucide="bell"></i>
        </div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-message">${n.message}</div>
          <div class="notif-time">${Components.timeAgo(n.createdAt)}</div>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  updateHeaderDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  },

  setupTheme() {
    const savedTheme = localStorage.getItem('yaca_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      this.updateThemeIcon(savedTheme);
      themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('yaca_theme', newTheme);
        this.updateThemeIcon(newTheme);
        if (typeof Toast !== 'undefined') {
          Toast.show(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
        }
      });
    }
  },

  updateThemeIcon(theme) {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (!themeBtn) return;
    themeBtn.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    if (window.lucide) window.lucide.createIcons();
  },

  guideTab: 'simple',

  renderGuide(container) {
    container.innerHTML = Components.renderGuidePage(this.guideTab);
    if (window.lucide) window.lucide.createIcons();
  },

  switchGuideTab(tab) {
    this.guideTab = tab;
    const container = document.getElementById('page-content');
    if (container) this.renderGuide(container);
  },

  toggleAccordion(headerEl) {
    const item = headerEl.closest('.manual-item');
    if (item) {
      item.classList.toggle('active');
    }
  },

  filterGuideTopics(query) {
    const term = (query || '').toLowerCase().trim();
    const items = document.querySelectorAll('.topic-item');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (!term || text.includes(term)) {
        item.style.display = 'block';
        if (term) item.classList.add('active');
      } else {
        item.style.display = 'none';
      }
    });
  },

  toggleClientPortalMode() {
    if (this.currentPage === 'portal') {
      window.location.hash = 'dashboard';
    } else {
      window.location.hash = 'portal';
    }
  },

  showLoginScreen() {
    const loginEl = document.getElementById('login-screen');
    const appEl = document.getElementById('app');
    if (loginEl) {
      loginEl.style.display = 'block';
      Login.render(loginEl);
    }
    if (appEl) {
      appEl.style.display = 'none';
    }
  },

  showMainApp() {
    const loginEl = document.getElementById('login-screen');
    const appEl = document.getElementById('app');
    if (loginEl) {
      loginEl.style.display = 'none';
    }
    if (appEl) {
      appEl.style.display = 'flex';
    }

    // Update user profile info in top bar if present
    const user = DataStore.data.currentUser || { name: 'Muhammad Yousuf', role: 'Engagement Partner' };
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    if (userNameEl) userNameEl.innerText = user.name;
    if (userRoleEl) userRoleEl.innerText = user.role;

    // Navigate to current hash or dashboard
    const initialPage = window.location.hash.slice(1) || 'dashboard';
    this.navigate(initialPage);
  },

  logout() {
    DataStore.data.currentUser = null;
    Toast.show('Logged out from Yousuf Adil Enterprise Audit Portal.', 'info');
    this.showLoginScreen();
  }
};
