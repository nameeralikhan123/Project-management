/* =============================================
   YACA PM - Data Store & Seed Data
   ============================================= */

window.DataStore = {
  STORAGE_KEY: 'yaca_pm_data',

  data: {
    clients: [],
    projects: [],
    tasks: [],
    team: [],
    timeEntries: [],
    activities: [],
    notifications: [],
    risks: [],
    findings: [],
    invoices: [],
    expenses: [],
    documents: [],
    approvals: [],
    automations: []
  },

  init() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.data = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored data, re-seeding...', e);
        this.seedData();
      }
    } else {
      this.seedData();
    }
  },

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  },

  resetData() {
    this.seedData();
  },

  // CRUD Helpers
  getAll(collection) {
    return this.data[collection] || [];
  },

  getById(collection, id) {
    return (this.data[collection] || []).find(item => item.id === id);
  },

  create(collection, item) {
    if (!this.data[collection]) this.data[collection] = [];
    const newItem = {
      id: collection.slice(0, 3) + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    this.data[collection].unshift(newItem);
    this.save();
    return newItem;
  },

  update(collection, id, updates) {
    const items = this.data[collection] || [];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return items[index];
    }
    return null;
  },

  delete(collection, id) {
    if (!this.data[collection]) return false;
    const initialLen = this.data[collection].length;
    this.data[collection] = this.data[collection].filter(item => item.id !== id);
    if (this.data[collection].length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  },

  query(collection, filterFn) {
    return (this.data[collection] || []).filter(filterFn);
  },

  // Specific Queries
  getProjectsByClient(clientId) {
    return this.query('projects', p => p.clientId === clientId);
  },

  getTasksByProject(projectId) {
    return this.query('tasks', t => t.projectId === projectId);
  },

  getTasksByAssignee(userId) {
    return this.query('tasks', t => t.assigneeId === userId);
  },

  getTimeEntriesByUser(userId, startDate, endDate) {
    return this.query('timeEntries', te => {
      const isUser = te.userId === userId;
      if (!startDate || !endDate) return isUser;
      return isUser && te.date >= startDate && te.date <= endDate;
    });
  },

  getTimeEntriesByProject(projectId) {
    return this.query('timeEntries', te => te.projectId === projectId);
  },

  getActivities(limit = 15) {
    return (this.data.activities || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  logActivity(type, userId, description, projectId = null, taskId = null) {
    return this.create('activities', {
      type,
      userId,
      description,
      projectId,
      taskId
    });
  },

  addComment(taskId, userId, text) {
    const task = this.getById('tasks', taskId);
    if (task) {
      if (!task.comments) task.comments = [];
      const newComment = {
        id: 'cmt_' + Date.now(),
        userId,
        text,
        createdAt: new Date().toISOString()
      };
      task.comments.push(newComment);
      this.save();
      const user = this.getById('team', userId);
      this.logActivity('comment_added', userId, `commented on task "${task.title}"`, task.projectId, task.id);
      return newComment;
    }
    return null;
  },

  getStats() {
    const projects = this.getAll('projects');
    const tasks = this.getAll('tasks');
    const team = this.getAll('team');

    const activeProjects = projects.filter(p => p.status !== 'completed');
    const completedProjects = projects.filter(p => p.status === 'completed');
    const pendingReviews = tasks.filter(t => t.status === 'in-review');
    const overdueTasks = tasks.filter(t => {
      if (t.status === 'done' || !t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    });

    const totalCapacity = team.reduce((acc, m) => acc + (m.weeklyCapacity || 40), 0);
    const totalLoggedThisWeek = this.getAll('timeEntries').reduce((acc, te) => acc + (Number(te.hours) || 0), 0);
    const utilizationRate = Math.min(100, Math.round((totalLoggedThisWeek / (totalCapacity || 1)) * 100));

    return {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      pendingReviews: pendingReviews.length,
      overdueTasks: overdueTasks.length,
      totalTeam: team.length,
      utilizationRate
    };
  },

  search(queryStr) {
    if (!queryStr || queryStr.trim().length === 0) return { projects: [], tasks: [], clients: [] };
    const q = queryStr.toLowerCase().trim();

    const projects = this.getAll('projects').filter(p =>
      p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    ).slice(0, 5);

    const tasks = this.getAll('tasks').filter(t =>
      t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
    ).slice(0, 5);

    const clients = this.getAll('clients').filter(c =>
      c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
    ).slice(0, 5);

    return { projects, tasks, clients };
  },

  // Seed Data Generator
  seedData() {
    const team = [
      { id: 'usr_1', name: 'Muhammad Yousuf', email: 'yousuf@yousufadil.com', role: 'partner', department: 'audit', phone: '+92 300 8219001', skills: ['Audit & Assurance', 'IFRS', 'Corporate Governance'], status: 'available', weeklyCapacity: 40, avatar: 'MY' },
      { id: 'usr_2', name: 'Ahmed Raza', email: 'araza@yousufadil.com', role: 'director', department: 'audit', phone: '+92 300 8219002', skills: ['Financial Audit', 'Banking & Finance', 'ISA'], status: 'available', weeklyCapacity: 40, avatar: 'AR' },
      { id: 'usr_3', name: 'Fatima Khan', email: 'fkhan@yousufadil.com', role: 'manager', department: 'audit', phone: '+92 300 8219003', skills: ['Risk Assessment', 'Group Audits', 'IFRS 9'], status: 'busy', weeklyCapacity: 45, avatar: 'FK' },
      { id: 'usr_4', name: 'Hassan Ali', email: 'hali@yousufadil.com', role: 'manager', department: 'tax', phone: '+92 300 8219004', skills: ['Corporate Tax', 'Transfer Pricing', 'Sales Tax'], status: 'available', weeklyCapacity: 40, avatar: 'HA' },
      { id: 'usr_5', name: 'Sara Malik', email: 'smalik@yousufadil.com', role: 'senior', department: 'audit', phone: '+92 300 8219005', skills: ['Substantive Testing', 'Sampling', 'Fixed Assets'], status: 'busy', weeklyCapacity: 50, avatar: 'SM' },
      { id: 'usr_6', name: 'Usman Tariq', email: 'utariq@yousufadil.com', role: 'senior', department: 'tax', phone: '+92 300 8219006', skills: ['Income Tax Returns', 'Withholding Tax', 'FBR Appeals'], status: 'available', weeklyCapacity: 40, avatar: 'UT' },
      { id: 'usr_7', name: 'Ayesha Noor', email: 'anoor@yousufadil.com', role: 'senior', department: 'advisory', phone: '+92 300 8219007', skills: ['Valuation', 'Due Diligence', 'M&A'], status: 'available', weeklyCapacity: 40, avatar: 'AN' },
      { id: 'usr_8', name: 'Bilal Ahmed', email: 'bahmed@yousufadil.com', role: 'staff', department: 'audit', phone: '+92 300 8219008', skills: ['Vouching', 'Bank Reconciliations', 'Inventory Count'], status: 'busy', weeklyCapacity: 40, avatar: 'BA' },
      { id: 'usr_9', name: 'Zainab Hussain', email: 'zhussain@yousufadil.com', role: 'staff', department: 'tax', phone: '+92 300 8219009', skills: ['Tax Compliance', 'Challan Preparation'], status: 'available', weeklyCapacity: 40, avatar: 'ZH' },
      { id: 'usr_10', name: 'Omar Farooq', email: 'ofarooq@yousufadil.com', role: 'intern', department: 'audit', phone: '+92 300 8219010', skills: ['Data Verification', 'Audit Documentation'], status: 'on-leave', weeklyCapacity: 35, avatar: 'OF' },
      { id: 'usr_11', name: 'Hina Shahid', email: 'hshahid@yousufadil.com', role: 'manager', department: 'advisory', phone: '+92 300 8219011', skills: ['Risk Advisory', 'Internal Controls', 'SOX Compliance'], status: 'available', weeklyCapacity: 40, avatar: 'HS' },
      { id: 'usr_12', name: 'Kamran Javed', email: 'kjaved@yousufadil.com', role: 'staff', department: 'audit', phone: '+92 300 8219012', skills: ['Receivables Circularization', 'Payables Testing'], status: 'available', weeklyCapacity: 40, avatar: 'KJ' }
    ];

    const clients = [
      { id: 'cli_1', name: 'Habib Bank Limited (HBL)', industry: 'Banking & Financial Institutions', contactPerson: 'Mr. Salman Jamil (CFO)', email: 'salman.jamil@hbl.com', phone: '+92 21 111 111 425', address: 'HBL Tower, I.I. Chundrigar Road, Karachi', riskRating: 'high', status: 'active', notes: 'Top tier banking client. Requires Partner sign-off.' },
      { id: 'cli_2', name: 'Pakistan State Oil (PSO)', industry: 'Energy & Oil/Gas', contactPerson: 'Tariq Mehmood (Finance Director)', email: 'tariq.m@pso.com.pk', phone: '+92 21 99201301', address: 'PSO House, Khayaban-e-Iqbal, Clifton, Karachi', riskRating: 'high', status: 'active', notes: 'Government entity client. Complex regulatory disclosures.' },
      { id: 'cli_3', name: 'Engro Corporation', industry: 'Conglomerate & Fertilizer', contactPerson: 'Zubair Raza (VP Finance)', email: 'zraza@engro.com', phone: '+92 21 111 211 211', address: 'The Harbour Front Building, Clifton, Karachi', riskRating: 'medium', status: 'active', notes: 'IFRS 9 and IFRS 16 compliance focus areas.' },
      { id: 'cli_4', name: 'K-Electric Limited', industry: 'Power & Utilities', contactPerson: 'Imran Zafar (Group Controller)', email: 'imran.zafar@ke.com.pk', phone: '+92 21 38370000', address: 'KE House, Elander Road, Karachi', riskRating: 'high', status: 'active', notes: 'Quarterly review deadlines strictly enforced.' },
      { id: 'cli_5', name: 'Packages Limited', industry: 'Packaging & Manufacturing', contactPerson: 'Syed Ali Asghar (General Manager Finance)', email: 'aliasghar@packages.com.pk', phone: '+92 42 35811541', address: 'Shahrah-e-Roomi, P.O. Amer Sidhu, Lahore', riskRating: 'low', status: 'active', notes: 'Long-standing manufacturing audit.' },
      { id: 'cli_6', name: 'Dawood Hercules Corporation', industry: 'Investment & Chemicals', contactPerson: 'Noman Bashir (Finance Manager)', email: 'nbashir@dawoodhercules.com', phone: '+92 21 35632200', address: 'Dawood Centre, M.T. Khan Road, Karachi', riskRating: 'medium', status: 'active', notes: 'Tax advisory retainer contract.' },
      { id: 'cli_7', name: 'Fauji Fertilizer Company (FFC)', industry: 'Agrochemicals', contactPerson: 'Major (R) Asad Khan (Internal Auditor)', email: 'akhan@ffc.com.pk', phone: '+92 51 8450001', address: 'SONA Tower, 156-The Mall, Rawalpindi', riskRating: 'low', status: 'active', notes: 'Annual statutory audit completed for FY25.' },
      { id: 'cli_8', name: 'Indus Motor Company (Toyota)', industry: 'Automotive Manufacturing', contactPerson: 'Fahad Qadir (Finance Lead)', email: 'fahad.qadir@toyota-indus.com', phone: '+92 21 34721100', address: 'Plot No. N.W.Z/1/P-1, Port Qasim Authority, Karachi', riskRating: 'medium', status: 'active', notes: 'Advisory engagement for internal control framework.' }
    ];

    const projects = [
      {
        id: 'prj_1',
        title: 'HBL Annual Audit FY2026',
        description: 'Comprehensive financial statement audit for Habib Bank Limited for the financial year ending December 31, 2026 in accordance with International Standards on Auditing (ISA) and State Bank of Pakistan guidelines.',
        type: 'audit',
        clientId: 'cli_1',
        status: 'fieldwork',
        priority: 'critical',
        startDate: '2026-01-10',
        endDate: '2026-03-31',
        deadline: '2026-03-31',
        budgetHours: 650,
        actualHours: 320,
        partnerId: 'usr_1',
        managerId: 'usr_3',
        teamMembers: ['usr_3', 'usr_5', 'usr_8', 'usr_12'],
        tags: ['Statutory Audit', 'Banking', 'SBP Regulated'],
        createdAt: '2026-01-05T09:00:00Z',
        updatedAt: '2026-09-02T14:30:00Z'
      },
      {
        id: 'prj_2',
        title: 'PSO Annual Tax Return FY2026',
        description: 'Preparation, verification, and filing of Corporate Income Tax Returns and Sales Tax reconciliation for Pakistan State Oil Company Limited.',
        type: 'tax',
        clientId: 'cli_2',
        status: 'planning',
        priority: 'high',
        startDate: '2026-08-15',
        endDate: '2026-10-31',
        deadline: '2026-10-31',
        budgetHours: 280,
        actualHours: 45,
        partnerId: 'usr_1',
        managerId: 'usr_4',
        teamMembers: ['usr_4', 'usr_6', 'usr_9'],
        tags: ['FBR Filing', 'Income Tax', 'Corporate Tax'],
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: '2026-09-01T11:00:00Z'
      },
      {
        id: 'prj_3',
        title: 'Engro IFRS 17 Implementation Advisory',
        description: 'Gap analysis, policy design, and reporting framework implementation for IFRS 17 compliance across Engro subsidiaries.',
        type: 'advisory',
        clientId: 'cli_3',
        status: 'review',
        priority: 'high',
        startDate: '2026-05-01',
        endDate: '2026-09-30',
        deadline: '2026-09-30',
        budgetHours: 400,
        actualHours: 310,
        partnerId: 'usr_1',
        managerId: 'usr_11',
        teamMembers: ['usr_11', 'usr_7'],
        tags: ['IFRS 17', 'Financial Advisory', 'Gap Analysis'],
        createdAt: '2026-04-20T12:00:00Z',
        updatedAt: '2026-09-03T09:15:00Z'
      },
      {
        id: 'prj_4',
        title: 'K-Electric Q3 Review FY2026',
        description: 'Quarterly review of condensed interim financial statements of K-Electric Limited for the period ended September 30, 2026.',
        type: 'audit',
        clientId: 'cli_4',
        status: 'partner-review',
        priority: 'critical',
        startDate: '2026-08-01',
        endDate: '2026-09-15',
        deadline: '2026-09-15',
        budgetHours: 200,
        actualHours: 185,
        partnerId: 'usr_1',
        managerId: 'usr_3',
        teamMembers: ['usr_3', 'usr_5', 'usr_8'],
        tags: ['Quarterly Review', 'Public Listed', 'PSX Compliance'],
        createdAt: '2026-07-25T08:30:00Z',
        updatedAt: '2026-09-03T16:00:00Z'
      },
      {
        id: 'prj_5',
        title: 'Packages Ltd Financial Audit FY2025',
        description: 'Statutory audit of Packages Limited consolidated and standalone financial statements for the ended year.',
        type: 'audit',
        clientId: 'cli_5',
        status: 'completed',
        priority: 'medium',
        startDate: '2025-11-01',
        endDate: '2026-02-28',
        deadline: '2026-02-28',
        budgetHours: 500,
        actualHours: 485,
        partnerId: 'usr_1',
        managerId: 'usr_2',
        teamMembers: ['usr_2', 'usr_5', 'usr_12'],
        tags: ['Completed', 'Manufacturing', 'PSX Listed'],
        createdAt: '2025-10-15T09:00:00Z',
        updatedAt: '2026-02-28T17:00:00Z'
      },
      {
        id: 'prj_6',
        title: 'Dawood Hercules Transfer Pricing Study',
        description: 'Comprehensive Transfer Pricing documentation and benchmark report for inter-company transactions for Tax Year 2026.',
        type: 'tax',
        clientId: 'cli_6',
        status: 'fieldwork',
        priority: 'medium',
        startDate: '2026-07-01',
        endDate: '2026-10-15',
        deadline: '2026-10-15',
        budgetHours: 180,
        actualHours: 90,
        partnerId: 'usr_1',
        managerId: 'usr_4',
        teamMembers: ['usr_4', 'usr_6'],
        tags: ['Transfer Pricing', 'FBR Documentation'],
        createdAt: '2026-06-20T10:00:00Z',
        updatedAt: '2026-08-28T14:20:00Z'
      },
      {
        id: 'prj_7',
        title: 'Toyota IMC Internal Controls Assessment',
        description: 'Independent evaluation of internal financial controls (ICFR) across manufacturing and procurement processes.',
        type: 'advisory',
        clientId: 'cli_8',
        status: 'filing',
        priority: 'medium',
        startDate: '2026-06-15',
        endDate: '2026-09-10',
        deadline: '2026-09-10',
        budgetHours: 250,
        actualHours: 235,
        partnerId: 'usr_1',
        managerId: 'usr_11',
        teamMembers: ['usr_11', 'usr_7', 'usr_10'],
        tags: ['ICFR', 'Internal Audit', 'Process Mapping'],
        createdAt: '2026-06-01T11:30:00Z',
        updatedAt: '2026-09-02T16:45:00Z'
      }
    ];

    const tasks = [
      {
        id: 'tsk_1',
        projectId: 'prj_1',
        title: 'Perform Bank Confirmation Circularization',
        description: 'Send standardized bank confirmation letters to all 42 corresponding financial institution branches where HBL holds accounts and reconcile responses.',
        status: 'in-progress',
        priority: 'critical',
        assigneeId: 'usr_8',
        reporterId: 'usr_3',
        labels: ['Audit Testing', 'Substantive'],
        dueDate: '2026-09-10',
        estimatedHours: 40,
        loggedHours: 22,
        comments: [
          { id: 'cmt_1', userId: 'usr_3', text: 'Ensure all 42 confirmations strictly follow SBP circular 4 format.', createdAt: '2026-09-01T10:00:00Z' },
          { id: 'cmt_2', userId: 'usr_8', text: 'Received 28 confirmations so far. 14 follow-ups dispatched today.', createdAt: '2026-09-02T15:30:00Z' }
        ],
        createdAt: '2026-08-20T09:00:00Z'
      },
      {
        id: 'tsk_2',
        projectId: 'prj_1',
        title: 'Test Expected Credit Loss (ECL) Model - IFRS 9',
        description: 'Review loss given default (LGD) and probability of default (PD) statistical models for corporate loan portfolio in accordance with IFRS 9.',
        status: 'in-review',
        priority: 'critical',
        assigneeId: 'usr_5',
        reporterId: 'usr_3',
        labels: ['IFRS 9', 'Complex Accounting'],
        dueDate: '2026-09-08',
        estimatedHours: 60,
        loggedHours: 58,
        comments: [
          { id: 'cmt_3', userId: 'usr_5', text: 'Working paper ready for Manager review. Reconciled macro-economic factors with SBP data.', createdAt: '2026-09-02T18:00:00Z' }
        ],
        createdAt: '2026-08-15T11:00:00Z'
      },
      {
        id: 'tsk_3',
        projectId: 'prj_1',
        title: 'IT General Controls (ITGC) Audit',
        description: 'Evaluate user access management, change management, and backup procedures for HBL core banking system (MISYS).',
        status: 'approved',
        priority: 'high',
        assigneeId: 'usr_12',
        reporterId: 'usr_3',
        labels: ['IT Audit', 'Controls'],
        dueDate: '2026-08-30',
        estimatedHours: 35,
        loggedHours: 35,
        comments: [],
        createdAt: '2026-08-10T10:00:00Z'
      },
      {
        id: 'tsk_4',
        projectId: 'prj_1',
        title: 'Verify Capital Adequacy Ratio (CAR) Computation',
        description: 'Check calculation of Tier 1 and Tier 2 capital against Basel III regulatory guidelines.',
        status: 'todo',
        priority: 'high',
        assigneeId: 'usr_5',
        reporterId: 'usr_3',
        labels: ['Regulatory', 'Basel III'],
        dueDate: '2026-09-18',
        estimatedHours: 25,
        loggedHours: 0,
        comments: [],
        createdAt: '2026-08-25T14:00:00Z'
      },
      {
        id: 'tsk_5',
        projectId: 'prj_4',
        title: 'Partner Final Review of Q3 Interim Financials',
        description: 'Final review of review report, financial statements disclosures, and audit summary memo with Engagement Partner.',
        status: 'in-review',
        priority: 'critical',
        assigneeId: 'usr_1',
        reporterId: 'usr_3',
        labels: ['Partner Review', 'Sign-Off'],
        dueDate: '2026-09-05',
        estimatedHours: 10,
        loggedHours: 6,
        comments: [
          { id: 'cmt_4', userId: 'usr_3', text: 'All audit notes addressed. Highlights on tariff adjustment submitted.', createdAt: '2026-09-03T11:00:00Z' }
        ],
        createdAt: '2026-09-01T09:00:00Z'
      },
      {
        id: 'tsk_6',
        projectId: 'prj_4',
        title: 'Tariff Differential Subsidy (TDS) Verification',
        description: 'Reconcile receivable from Ministry of Energy against tariff determination orders issued by NEPRA.',
        status: 'done',
        priority: 'high',
        assigneeId: 'usr_5',
        reporterId: 'usr_3',
        labels: ['Subsidy', 'NEPRA'],
        dueDate: '2026-08-28',
        estimatedHours: 30,
        loggedHours: 28,
        comments: [],
        createdAt: '2026-08-10T12:00:00Z'
      },
      {
        id: 'tsk_7',
        projectId: 'prj_2',
        title: 'Gather Withholding Tax Statements (165 FBR)',
        description: 'Collect bi-annual withholding tax statements and match with general ledger withholding tax accounts.',
        status: 'in-progress',
        priority: 'medium',
        assigneeId: 'usr_6',
        reporterId: 'usr_4',
        labels: ['Tax Compliance', 'FBR'],
        dueDate: '2026-09-15',
        estimatedHours: 40,
        loggedHours: 18,
        comments: [],
        createdAt: '2026-08-20T10:00:00Z'
      },
      {
        id: 'tsk_8',
        projectId: 'prj_2',
        title: 'Prepare Corporate Income Tax Computation Sheet',
        description: 'Draft taxable income computation adjusting accounting profit for inadmissible expenses under Income Tax Ordinance 2001.',
        status: 'todo',
        priority: 'high',
        assigneeId: 'usr_6',
        reporterId: 'usr_4',
        labels: ['Tax Computation', 'ITO 2001'],
        dueDate: '2026-09-25',
        estimatedHours: 50,
        loggedHours: 0,
        comments: [],
        createdAt: '2026-08-22T11:00:00Z'
      },
      {
        id: 'tsk_9',
        projectId: 'prj_3',
        title: 'Draft IFRS 17 Accounting Policy Document',
        description: 'Formulate formal accounting policy draft covering contractual service margin (CSM) and discount rate methodologies.',
        status: 'in-review',
        priority: 'high',
        assigneeId: 'usr_7',
        reporterId: 'usr_11',
        labels: ['Advisory', 'IFRS 17 Policy'],
        dueDate: '2026-09-06',
        estimatedHours: 45,
        loggedHours: 42,
        comments: [],
        createdAt: '2026-08-12T09:30:00Z'
      },
      {
        id: 'tsk_10',
        projectId: 'prj_6',
        title: 'Comparable Uncontrolled Price (CUP) Benchmark Search',
        description: 'Perform TP benchmark search on global database for manufacturing licensing agreements.',
        status: 'in-progress',
        priority: 'medium',
        assigneeId: 'usr_6',
        reporterId: 'usr_4',
        labels: ['Benchmarking', 'Transfer Pricing'],
        dueDate: '2026-09-20',
        estimatedHours: 35,
        loggedHours: 15,
        comments: [],
        createdAt: '2026-08-28T15:00:00Z'
      },
      {
        id: 'tsk_11',
        projectId: 'prj_7',
        title: 'Finalize Internal Controls Evaluation Report',
        description: 'Compile management recommendations, control deficiency matrix, and executive summary.',
        status: 'approved',
        priority: 'medium',
        assigneeId: 'usr_7',
        reporterId: 'usr_11',
        labels: ['Reporting', 'Management Letter'],
        dueDate: '2026-09-04',
        estimatedHours: 30,
        loggedHours: 30,
        comments: [],
        createdAt: '2026-08-25T16:00:00Z'
      },
      {
        id: 'tsk_12',
        projectId: 'prj_1',
        title: 'Physical Inventory Counting Attendance - Cash Vaults',
        description: 'Attend surprise cash vault count at HBL Main Treasury Branch Karachi.',
        status: 'done',
        priority: 'critical',
        assigneeId: 'usr_8',
        reporterId: 'usr_3',
        labels: ['Physical Count', 'Cash'],
        dueDate: '2026-08-15',
        estimatedHours: 12,
        loggedHours: 12,
        comments: [],
        createdAt: '2026-08-05T09:00:00Z'
      }
    ];

    const timeEntries = [
      { id: 'te_1', userId: 'usr_8', projectId: 'prj_1', taskId: 'tsk_1', date: '2026-09-01', hours: 7.5, description: 'Dispatched bank confirmation letters for Karachi branches.', billable: true, status: 'approved' },
      { id: 'te_2', userId: 'usr_5', projectId: 'prj_1', taskId: 'tsk_2', date: '2026-09-01', hours: 8.0, description: 'Reviewed ECL impairment provisioning matrix.', billable: true, status: 'approved' },
      { id: 'te_3', userId: 'usr_3', projectId: 'prj_4', taskId: 'tsk_5', date: '2026-09-02', hours: 6.0, description: 'Prepared audit summary memorandum for Partner review.', billable: true, status: 'submitted' },
      { id: 'te_4', userId: 'usr_6', projectId: 'prj_2', taskId: 'tsk_7', date: '2026-09-02', hours: 7.0, description: 'Collected tax withholding receipts from client finance portal.', billable: true, status: 'approved' },
      { id: 'te_5', userId: 'usr_7', projectId: 'prj_3', taskId: 'tsk_9', date: '2026-09-03', hours: 8.0, description: 'Drafted discount rate transition rules under IFRS 17.', billable: true, status: 'submitted' },
      { id: 'te_6', userId: 'usr_8', projectId: 'prj_1', taskId: 'tsk_1', date: '2026-09-03', hours: 6.5, description: 'Follow-up calls on pending bank confirmation responses.', billable: true, status: 'submitted' }
    ];

    const activities = [
      { id: 'act_1', userId: 'usr_3', description: 'submitted audit working paper for K-Electric Q3 Review for Partner sign-off', projectId: 'prj_4', taskId: 'tsk_5', createdAt: '2026-09-03T11:00:00Z' },
      { id: 'act_2', userId: 'usr_5', description: 'updated status of ECL Model Test to "In Review"', projectId: 'prj_1', taskId: 'tsk_2', createdAt: '2026-09-02T18:00:00Z' },
      { id: 'act_3', userId: 'usr_8', description: 'added comment to Bank Confirmations task', projectId: 'prj_1', taskId: 'tsk_1', createdAt: '2026-09-02T15:30:00Z' },
      { id: 'act_4', userId: 'usr_11', description: 'approved Internal Controls Evaluation Report', projectId: 'prj_7', taskId: 'tsk_11', createdAt: '2026-09-02T14:00:00Z' },
      { id: 'act_5', userId: 'usr_1', description: 'created new engagement "HBL Annual Audit FY2026"', projectId: 'prj_1', taskId: null, createdAt: '2026-08-20T09:00:00Z' }
    ];

    const notifications = [
      { id: 'not_1', userId: 'usr_1', title: 'Partner Review Required', message: 'K-Electric Q3 Review financial report is ready for final sign-off.', type: 'warning', read: false, createdAt: '2026-09-03T11:00:00Z' },
      { id: 'not_2', userId: 'usr_3', title: 'Task Updated', message: 'Fatima Khan marked "Test ECL Model - IFRS 9" as In Review.', type: 'info', read: false, createdAt: '2026-09-02T18:00:00Z' },
      { id: 'not_3', userId: 'usr_5', title: 'Deadline Approaching', message: 'HBL Bank Confirmation task is due in 7 days.', type: 'warning', read: true, createdAt: '2026-09-01T09:00:00Z' }
    ];

    const risks = [
      { id: 'rsk_1', projectId: 'prj_1', title: 'Credit Risk Model Understatement', category: 'Financial Reporting', likelihood: 4, impact: 5, score: 20, ownerId: 'usr_3', mitigation: 'Independent statistical re-performance of IFRS 9 ECL model parameters and SBP macroeconomic stress testing.', residualRisk: 'medium', status: 'open' },
      { id: 'rsk_2', projectId: 'prj_1', title: 'Unconfirmed Out-of-State Bank Balances', category: 'Audit Existence', likelihood: 3, impact: 4, score: 12, ownerId: 'usr_8', mitigation: 'Direct physical verification and secondary confirmation dispatch via swift protocol.', residualRisk: 'low', status: 'mitigated' },
      { id: 'rsk_3', projectId: 'prj_4', title: 'Government Subsidy Tariff Adjustments', category: 'Regulatory Compliance', likelihood: 5, impact: 4, score: 20, ownerId: 'usr_3', mitigation: 'Direct verification with NEPRA gazette notifications and Ministry of Energy correspondence.', residualRisk: 'high', status: 'open' },
      { id: 'rsk_4', projectId: 'prj_2', title: 'Transfer Pricing Tax Exposure', category: 'Taxation', likelihood: 3, impact: 3, score: 9, ownerId: 'usr_4', mitigation: 'Comprehensive CUP benchmark study and local FBR master file preparation.', residualRisk: 'low', status: 'accepted' }
    ];

    const findings = [
      { id: 'fnd_1', projectId: 'prj_1', title: 'Inadequate Access Controls on Core Banking Ledger', type: 'Material Weakness', controlRef: 'ITGC-AC-04', managementResponse: 'Management agreed to revoke superuser rights by Q4 2026.', status: 'open', followUpDate: '2026-10-15' },
      { id: 'fnd_2', projectId: 'prj_4', title: 'Delay in Monthly Bank Reconciliation Signing', type: 'Control Deficiency', controlRef: 'FIN-REC-02', managementResponse: 'Automated workflow introduced to enforce manager sign-off.', status: 'mitigated', followUpDate: '2026-09-30' },
      { id: 'fnd_3', projectId: 'prj_7', title: 'Unsegregated Duties in Procurement Requisitions', type: 'Observation', controlRef: 'PROC-SOD-01', managementResponse: 'Dual approval threshold reduced to PKR 500,000.', status: 'closed', followUpDate: '2026-08-31' }
    ];

    const invoices = [
      { id: 'inv_101', number: 'YA-INV-2026-089', clientId: 'cli_1', projectId: 'prj_1', feeType: 'Time & Material', amountPKR: 4850000, billedHours: 320, hourlyRatePKR: 15000, issueDate: '2026-08-15', dueDate: '2026-09-15', status: 'paid', paidDate: '2026-08-28' },
      { id: 'inv_102', number: 'YA-INV-2026-094', clientId: 'cli_4', projectId: 'prj_4', feeType: 'Fixed Fee', amountPKR: 2500000, billedHours: 185, hourlyRatePKR: 13500, issueDate: '2026-09-01', dueDate: '2026-09-30', status: 'pending', paidDate: null },
      { id: 'inv_103', number: 'YA-INV-2026-098', clientId: 'cli_3', projectId: 'prj_3', feeType: 'Retainer', amountPKR: 3600000, billedHours: 240, hourlyRatePKR: 15000, issueDate: '2026-09-02', dueDate: '2026-10-02', status: 'pending', paidDate: null }
    ];

    const expenses = [
      { id: 'exp_1', projectId: 'prj_1', category: 'Out-of-Pocket Audit Travel', description: 'Flight & lodging for vault count at HBL Treasury Branch', amountPKR: 85000, date: '2026-08-16', billable: true, loggedBy: 'usr_8' },
      { id: 'exp_2', projectId: 'prj_4', category: 'Legal Advice & NEPRA Gazette Verification', description: 'Consultation fee for utility tariff regulation lawyer', amountPKR: 120000, date: '2026-08-25', billable: true, loggedBy: 'usr_3' }
    ];

    const documents = [
      { id: 'doc_1', projectId: 'prj_1', name: 'HBL_Audit_Planning_Memorandum_2026.pdf', version: 'v2.0', status: 'approved', wbsFolder: 'Planning Phase', assertionTags: ['Completeness', 'Accuracy'], uploadedBy: 'usr_3', signedOffBy: 'usr_1', signedOffAt: '2026-08-12T14:30:00Z' },
      { id: 'doc_2', projectId: 'prj_1', name: 'IFRS9_ECL_Impairment_Testing_WP.xlsx', version: 'v1.2', status: 'under-review', wbsFolder: 'Fieldwork Phase', assertionTags: ['Valuation', 'Accuracy'], uploadedBy: 'usr_5', signedOffBy: null, signedOffAt: null },
      { id: 'doc_3', projectId: 'prj_4', name: 'K-Electric_Q3_Auditor_Report_Draft.docx', version: 'v3.0', status: 'under-review', wbsFolder: 'Partner Review Phase', assertionTags: ['Presentation', 'Existence'], uploadedBy: 'usr_3', signedOffBy: null, signedOffAt: null }
    ];

    const approvals = [
      { id: 'app_1', projectId: 'prj_4', documentId: 'doc_3', title: 'Partner Final Sign-Off on K-Electric Q3 Interim Audit Report', preparerId: 'usr_5', reviewerId: 'usr_3', partnerId: 'usr_1', status: 'pending-partner', comments: 'Pending Partner digital signature.', createdAt: '2026-09-03T11:00:00Z' },
      { id: 'app_2', projectId: 'prj_7', documentId: 'doc_1', title: 'Internal Control Evaluation Report Approval', preparerId: 'usr_7', reviewerId: 'usr_11', partnerId: 'usr_1', status: 'approved', comments: 'Fully signed off by Partner.', createdAt: '2026-09-02T14:00:00Z' }
    ];

    const automations = [
      { id: 'aut_1', title: 'Partner Escalation Rule', trigger: 'Task Overdue > 3 Days', action: 'Notify Engagement Partner + Set Tag #Escalated', enabled: true },
      { id: 'aut_2', title: 'Reviewer Routing Rule', trigger: 'Working Paper Moved to In Review', action: 'Notify Manager + Set Due Date +2 Days', enabled: true },
      { id: 'aut_3', title: 'ISQM 1 Quality Check', trigger: 'Engagement Sign-Off Triggered', action: 'Run ISA 220 Checklist & Verify Risk Register Completion', enabled: true }
    ];

    this.data = { clients, projects, tasks, team, timeEntries, activities, notifications, risks, findings, invoices, expenses, documents, approvals, automations };
    this.save();
  }
};
