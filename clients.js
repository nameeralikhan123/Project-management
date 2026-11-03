/* =============================================
   YACA PM - Clients Management Module
   ============================================= */

window.Clients = {
  searchQuery: '',

  render(container) {
    let clients = DataStore.getAll('clients');

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      clients = clients.filter(c => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
    }

    const actions = `
      <button class="btn btn-primary" onclick="Clients.openCreateModal()">
        <i data-lucide="plus"></i> New Client
      </button>
    `;

    const html = `
      ${Components.pageHeader('Client Management', 'Manage audit firm client profiles, regulatory details, and engagement histories.', actions)}

      <div class="filter-bar">
        <input type="text" class="filter-search" placeholder="Search clients by name or industry..." value="${this.searchQuery}" oninput="Clients.handleSearch(this.value)">
      </div>

      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Industry</th>
              <th>Contact Person</th>
              <th>Risk Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${clients.length === 0 ? '<tr><td colspan="6" class="text-center text-muted">No clients found.</td></tr>' : ''}
            ${clients.map(c => {
              const activeProjects = DataStore.getProjectsByClient(c.id).length;
              return `
                <tr>
                  <td>
                    <div class="table-cell-main">${c.name}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">${activeProjects} Engagements</div>
                  </td>
                  <td>${c.industry}</td>
                  <td>
                    <div>${c.contactPerson}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">${c.email}</div>
                  </td>
                  <td>${Components.riskBadge(c.riskRating)}</td>
                  <td><span class="badge ${c.status === 'active' ? 'badge-completed' : 'badge-on-hold'}">${c.status.toUpperCase()}</span></td>
                  <td>
                    <div class="table-cell-actions">
                      <button class="btn btn-secondary btn-sm" onclick="Clients.openDetail('${c.id}')">View Profile</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  },

  handleSearch(val) {
    this.searchQuery = val;
    this.render(document.getElementById('page-content'));
  },

  openDetail(clientId) {
    const client = DataStore.getById('clients', clientId);
    if (!client) return;

    const projects = DataStore.getProjectsByClient(clientId);

    const bodyHtml = `
      <div class="client-header">
        <div class="avatar avatar-xl" style="background: linear-gradient(135deg, #D4A843, #b8912e);">${Components.getInitials(client.name)}</div>
        <div class="client-info">
          <h2>${client.name}</h2>
          <div class="text-muted" style="margin-top: 4px;">${client.industry}</div>
          <div style="margin-top: 8px;">
            ${Components.riskBadge(client.riskRating)}
          </div>
        </div>
      </div>

      <div class="detail-panel">
        <div class="detail-main">
          <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 12px;">Active & Past Engagements (${projects.length})</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${projects.length === 0 ? '<p class="text-muted">No engagements registered for this client.</p>' : ''}
            ${projects.map(p => `
              <div class="card" style="padding: 12px; cursor: pointer;" onclick="Modal.close(); Projects.openDetail('${p.id}');">
                <div style="display: flex; justify-content: space-between;">
                  <div style="font-weight: 600; font-size: 0.9rem;">${p.title}</div>
                  ${Components.statusBadge(p.status)}
                </div>
                <div class="text-muted" style="font-size: 0.78rem; margin-top: 4px;">Deadline: ${Components.formatDate(p.deadline)} | Budget: ${p.budgetHours} Hrs</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="detail-sidebar">
          <div class="detail-field">
            <div class="detail-field-label">Primary Contact</div>
            <div class="detail-field-value">${client.contactPerson}</div>
            <div class="text-muted" style="font-size: 0.8rem;">${client.email}</div>
            <div class="text-muted" style="font-size: 0.8rem;">${client.phone}</div>
          </div>

          <div class="detail-field">
            <div class="detail-field-label">Registered Office</div>
            <div class="detail-field-value" style="font-size: 0.82rem; color: var(--text-secondary);">${client.address}</div>
          </div>

          <div class="detail-field">
            <div class="detail-field-label">Audit Notes & Risk Factors</div>
            <div class="detail-field-value" style="font-size: 0.82rem; color: var(--text-secondary);">${client.notes || 'No special notes.'}</div>
          </div>

          <div class="divider"></div>
          <button class="btn btn-secondary w-full" onclick="Clients.openEditModal('${client.id}')">Edit Client Profile</button>
        </div>
      </div>
    `;

    Modal.open(client.name, bodyHtml, '', true);
  },

  openCreateModal() {
    const bodyHtml = `
      <form id="create-client-form">
        <div class="form-group">
          <label>Company / Client Name *</label>
          <input type="text" id="cli-name" class="form-control" placeholder="e.g. Engro Polymer & Chemicals" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Industry Sector *</label>
            <input type="text" id="cli-industry" class="form-control" placeholder="e.g. Chemicals & Agrochemicals" required>
          </div>

          <div class="form-group">
            <label>Risk Rating</label>
            <select id="cli-risk" class="form-control">
              <option value="low">Low Risk</option>
              <option value="medium" selected>Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Contact Person</label>
            <input type="text" id="cli-contact" class="form-control" placeholder="e.g. Mr. Tariq Khan (CFO)">
          </div>

          <div class="form-group">
            <label>Official Email</label>
            <input type="email" id="cli-email" class="form-control" placeholder="cfo@company.com">
          </div>
        </div>

        <div class="form-group">
          <label>Phone / Extension</label>
          <input type="text" id="cli-phone" class="form-control" placeholder="+92 21 111 000 000">
        </div>

        <div class="form-group">
          <label>Address</label>
          <textarea id="cli-address" class="form-control" placeholder="Registered office address..."></textarea>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Clients.saveNewClient()">Register Client</button>
    `;

    Modal.open('Register New Client', bodyHtml, footerHtml);
  },

  saveNewClient() {
    const name = document.getElementById('cli-name').value;
    const industry = document.getElementById('cli-industry').value;
    const riskRating = document.getElementById('cli-risk').value;
    const contactPerson = document.getElementById('cli-contact').value;
    const email = document.getElementById('cli-email').value;
    const phone = document.getElementById('cli-phone').value;
    const address = document.getElementById('cli-address').value;

    if (!name || !industry) {
      Toast.show('Please enter client name and industry.', 'error');
      return;
    }

    DataStore.create('clients', {
      name,
      industry,
      riskRating,
      contactPerson,
      email,
      phone,
      address,
      status: 'active',
      notes: ''
    });

    Modal.close();
    Toast.show('Client registered successfully.', 'success');
    this.render(document.getElementById('page-content'));
  },

  openEditModal(clientId) {
    const client = DataStore.getById('clients', clientId);
    if (!client) return;

    const bodyHtml = `
      <form id="edit-client-form">
        <div class="form-group">
          <label>Company / Client Name *</label>
          <input type="text" id="edit-cli-name" class="form-control" value="${client.name}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Industry Sector *</label>
            <input type="text" id="edit-cli-industry" class="form-control" value="${client.industry}" required>
          </div>

          <div class="form-group">
            <label>Risk Rating</label>
            <select id="edit-cli-risk" class="form-control">
              <option value="low" ${client.riskRating === 'low' ? 'selected' : ''}>Low Risk</option>
              <option value="medium" ${client.riskRating === 'medium' ? 'selected' : ''}>Medium Risk</option>
              <option value="high" ${client.riskRating === 'high' ? 'selected' : ''}>High Risk</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Contact Person</label>
            <input type="text" id="edit-cli-contact" class="form-control" value="${client.contactPerson || ''}">
          </div>

          <div class="form-group">
            <label>Official Email</label>
            <input type="email" id="edit-cli-email" class="form-control" value="${client.email || ''}">
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Clients.saveEditClient('${client.id}')">Save Changes</button>
    `;

    Modal.open('Edit Client Profile', bodyHtml, footerHtml);
  },

  saveEditClient(clientId) {
    const name = document.getElementById('edit-cli-name').value;
    const industry = document.getElementById('edit-cli-industry').value;
    const riskRating = document.getElementById('edit-cli-risk').value;
    const contactPerson = document.getElementById('edit-cli-contact').value;
    const email = document.getElementById('edit-cli-email').value;

    DataStore.update('clients', clientId, { name, industry, riskRating, contactPerson, email });
    Modal.close();
    Toast.show('Client updated.', 'success');
    this.render(document.getElementById('page-content'));
  }
};
