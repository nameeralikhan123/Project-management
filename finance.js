/* =============================================
   YACA PM - Finance, Billing & PKR WIP Module
   ============================================= */

window.Finance = {
  render(container) {
    const invoices = DataStore.getAll('invoices');
    const expenses = DataStore.getAll('expenses');
    const projects = DataStore.getAll('projects');
    const timeEntries = DataStore.getAll('timeEntries');

    // Calculate PKR Financial Totals
    const totalBilledPKR = invoices.reduce((sum, inv) => sum + (inv.amountPKR || 0), 0);
    const totalCollectedPKR = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.amountPKR || 0), 0);
    const pendingInvoicesPKR = totalBilledPKR - totalCollectedPKR;

    // WIP (Work In Progress) calculation: Total Billable Hours logged * Avg PKR 14,000 / hr
    const billableHoursLogged = timeEntries.filter(te => te.billable).reduce((sum, te) => sum + (Number(te.hours) || 0), 0);
    const estimatedWIP_PKR = billableHoursLogged * 14000;

    const actions = `
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary btn-sm" onclick="Finance.openLogExpenseModal()">
          <i data-lucide="receipt"></i> Log Expense
        </button>
        <button class="btn btn-primary btn-sm" onclick="Finance.openGenerateInvoiceModal()">
          <i data-lucide="file-plus"></i> Generate PKR Invoice
        </button>
      </div>
    `;

    const html = `
      ${Components.pageHeader('Finance, Billing & WIP Realization (PKR)', 'Manage audit fee contracts, Work-In-Progress (WIP) valuations, invoicing, and expense recovery.', actions)}

      <div class="stats-grid mb-20">
        ${Components.statCard('pkr', 'Total Fee Realization', `PKR ${(totalCollectedPKR / 1000000).toFixed(2)}M`, 'Billed vs Collected', 'up', '#10b981')}
        ${Components.statCard('trending-up', 'Unbilled WIP Valuation', `PKR ${(estimatedWIP_PKR / 100000).toFixed(1)} Lacs`, `${billableHoursLogged} Billable Hours`, 'up', '#D4A843')}
        ${Components.statCard('clock', 'Pending Client Invoices', `PKR ${(pendingInvoicesPKR / 1000000).toFixed(2)}M`, `${invoices.filter(i => i.status === 'pending').length} Invoices`, 'up', '#f59e0b')}
        ${Components.statCard('dollar-sign', 'Out-of-Pocket Expenses', `PKR ${(expenses.reduce((s, e) => s + e.amountPKR, 0) / 1000).toFixed(0)}k`, 'Reimbursable', 'up', '#3b82f6')}
      </div>

      <!-- Invoices Section -->
      <div class="widget mb-20">
        <div class="widget-header">
          <div class="widget-title">Engagement Client Invoices & Fee Realization</div>
        </div>
        <div class="widget-body">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Client</th>
                  <th>Engagement</th>
                  <th>Fee Arrangement</th>
                  <th>Billed Amount (PKR)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${invoices.map(inv => {
      const client = DataStore.getById('clients', inv.clientId);
      const prj = DataStore.getById('projects', inv.projectId);
      return `
                    <tr>
                      <td><strong style="color: var(--accent-gold);">${inv.number}</strong></td>
                      <td>${client ? client.name : 'Client'}</td>
                      <td>${prj ? prj.title : 'General'}</td>
                      <td><span class="badge badge-advisory">${inv.feeType}</span></td>
                      <td><strong>PKR ${inv.amountPKR.toLocaleString()}</strong></td>
                      <td><span class="badge ${inv.status === 'paid' ? 'badge-completed' : 'badge-review'}">${inv.status.toUpperCase()}</span></td>
                      <td>
                        <button class="btn btn-ghost btn-sm" onclick="Finance.previewInvoice('${inv.id}')">
                          <i data-lucide="eye"></i> View Invoice
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

      <!-- Out-of-Pocket Expenses -->
      <div class="widget">
        <div class="widget-header">
          <div class="widget-title">Project Expenses Log</div>
        </div>
        <div class="widget-body">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Expense Description</th>
                  <th>Category</th>
                  <th>Engagement</th>
                  <th>Amount (PKR)</th>
                  <th>Billable</th>
                </tr>
              </thead>
              <tbody>
                ${expenses.map(exp => {
      const prj = DataStore.getById('projects', exp.projectId);
      return `
                    <tr>
                      <td>
                        <div style="font-weight: 500;">${exp.description}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${Components.formatDate(exp.date)}</div>
                      </td>
                      <td><span class="badge badge-tax">${exp.category}</span></td>
                      <td>${prj ? prj.title : 'General'}</td>
                      <td><strong>PKR ${exp.amountPKR.toLocaleString()}</strong></td>
                      <td>${exp.billable ? '<span class="text-green">Yes</span>' : '<span class="text-muted">No</span>'}</td>
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

  openGenerateInvoiceModal() {
    const clients = DataStore.getAll('clients');
    const projects = DataStore.getAll('projects');

    const formHtml = `
      <form id="generate-inv-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Invoice Number *</label>
            <input type="text" id="inv-num" class="form-input" value="INV-2026-005" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Client Organization *</label>
            <select id="inv-client-id" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Audit Engagement *</label>
            <select id="inv-project-id" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              ${projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Fee Arrangement</label>
            <select id="inv-fee-type" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              <option value="Fixed Audit Fee">Fixed Audit Fee</option>
              <option value="Time & Materials">Time & Materials</option>
              <option value="Milestone Retainer">Milestone Retainer</option>
            </select>
          </div>
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Billed Amount (PKR) *</label>
            <input type="number" id="inv-amount-pkr" class="form-input" placeholder="e.g. 3500000" value="3500000" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Billed Audit Hours</label>
            <input type="number" id="inv-hours" class="form-input" value="250" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
          </div>
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Issue Date</label>
            <input type="date" id="inv-issue-date" class="form-input" value="2026-09-05" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Payment Due Date</label>
            <input type="date" id="inv-due-date" class="form-input" value="2026-10-05" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Finance.saveInvoice()">
        <i data-lucide="file-plus"></i> Generate & Issue PKR Invoice
      </button>
    `;

    Modal.open('Generate Client Fee Invoice (PKR)', formHtml, footerHtml);
  },

  saveInvoice() {
    const num = document.getElementById('inv-num')?.value.trim() || 'INV-2026-005';
    const clientId = document.getElementById('inv-client-id')?.value || 'cli_1';
    const projectId = document.getElementById('inv-project-id')?.value || 'prj_1';
    const feeType = document.getElementById('inv-fee-type')?.value || 'Fixed Audit Fee';
    const amountPKR = Number(document.getElementById('inv-amount-pkr')?.value || 3500000);
    const billedHours = Number(document.getElementById('inv-hours')?.value || 200);

    DataStore.create('invoices', {
      number: num,
      clientId,
      projectId,
      amountPKR,
      currency: 'PKR',
      status: 'pending',
      feeType,
      issueDate: document.getElementById('inv-issue-date')?.value || '2026-09-05',
      dueDate: document.getElementById('inv-due-date')?.value || '2026-10-05',
      billedHours,
      hourlyRatePKR: Math.round(amountPKR / (billedHours || 1))
    });

    Modal.close();
    Toast.show(`PKR Invoice ${num} generated successfully! Amount: PKR ${amountPKR.toLocaleString()}`, 'success');
    this.render(document.getElementById('page-content'));
  },

  openLogExpenseModal() {
    const projects = DataStore.getAll('projects');

    const formHtml = `
      <form id="log-exp-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Expense Description *</label>
          <input type="text" id="exp-desc" class="form-input" placeholder="e.g. Travel & Accommodation for Plant Inventory Count" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Engagement *</label>
            <select id="exp-project-id" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              ${projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Category</label>
            <select id="exp-category" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              <option value="Travel & Outstation">Travel & Outstation</option>
              <option value="Legal & Retainer">Legal & Retainer</option>
              <option value="Printing & Binding">Printing & Binding</option>
              <option value="Valuation Expert Fee">Valuation Expert Fee</option>
            </select>
          </div>
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Amount (PKR) *</label>
            <input type="number" id="exp-amount" class="form-input" placeholder="e.g. 150000" value="150000" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Billable to Client?</label>
            <select id="exp-billable" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              <option value="true" selected>Yes - Reimbursable</option>
              <option value="false">No - Firm Internal Expense</option>
            </select>
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Finance.saveExpense()">
        <i data-lucide="receipt"></i> Log Project Expense
      </button>
    `;

    Modal.open('Log Out-of-Pocket Expense (PKR)', formHtml, footerHtml);
  },

  saveExpense() {
    const desc = document.getElementById('exp-desc')?.value.trim();
    if (!desc) {
      Toast.show('Please enter expense description.', 'warning');
      return;
    }

    const projectId = document.getElementById('exp-project-id')?.value || 'prj_1';
    const category = document.getElementById('exp-category')?.value || 'Travel & Outstation';
    const amountPKR = Number(document.getElementById('exp-amount')?.value || 150000);
    const billable = document.getElementById('exp-billable')?.value === 'true';

    DataStore.create('expenses', {
      projectId,
      description: desc,
      amountPKR,
      category,
      billable,
      date: new Date().toISOString().split('T')[0]
    });

    Modal.close();
    Toast.show(`Expense logged successfully! Amount: PKR ${amountPKR.toLocaleString()}`, 'success');
    this.render(document.getElementById('page-content'));
  },

  previewInvoice(invId) {
    const inv = DataStore.getById('invoices', invId);
    if (!inv) return;
    const client = DataStore.getById('clients', inv.clientId);

    const bodyHtml = `
      <div style="padding: 16px; border: 1px solid var(--border-color); border-radius: 8px; background: #111827; color: #fff;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--accent-gold); padding-bottom: 12px;">
          <div>
            <h2 style="color: var(--accent-gold); font-weight: 800; font-size: 1.2rem; margin: 0;">YOUSUF ADIL</h2>
            <div style="font-size: 0.75rem; color: #9ca3af;">Chartered Accountants</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; font-size: 1.1rem;">INVOICE</div>
            <div style="font-size: 0.8rem; color: var(--accent-gold);">${inv.number}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 16px; font-size: 0.82rem;">
          <div>
            <div style="color: #9ca3af;">BILL TO:</div>
            <strong style="font-size: 0.95rem;">${client ? client.name : ''}</strong>
            <div>Issue Date: ${inv.issueDate}</div>
          </div>
          <div style="text-align: right;">
            <div>Due Date: ${inv.dueDate}</div>
            <div>Fee Structure: ${inv.feeType}</div>
          </div>
        </div>

        <table style="width: 100%; margin-top: 20px; border-collapse: collapse; font-size: 0.85rem;">
          <thead>
            <tr style="background: rgba(212, 168, 67, 0.1); text-align: left;">
              <th style="padding: 8px;">Service Description</th>
              <th style="padding: 8px;">Hours</th>
              <th style="padding: 8px;">Rate (PKR)</th>
              <th style="padding: 8px; text-align: right;">Total Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #374151;">Professional Audit & Assurance Engagement Services</td>
              <td style="padding: 8px; border-bottom: 1px solid #374151;">${inv.billedHours} hrs</td>
              <td style="padding: 8px; border-bottom: 1px solid #374151;">PKR ${inv.hourlyRatePKR.toLocaleString()}</td>
              <td style="padding: 8px; border-bottom: 1px solid #374151; text-align: right;"><strong>PKR ${inv.amountPKR.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 20px; align-items: center;">
          <div style="font-size: 0.75rem; color: #9ca3af;">Thank you for your business. Payment due within 30 days.</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: var(--accent-gold);">
            Total: PKR ${inv.amountPKR.toLocaleString()}
          </div>
        </div>
      </div>
    `;

    Modal.open(`Invoice ${inv.number}`, bodyHtml, `<button class="btn btn-primary" onclick="Modal.close()">Print / Save PDF</button>`);
  }
};
