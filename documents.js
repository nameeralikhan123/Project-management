/* =============================================
   YACA PM - Working Paper Vault & Document Versioning
   ============================================= */

window.Documents = {
  render(container) {
    const documents = DataStore.getAll('documents');
    const projects = DataStore.getAll('projects');

    const actions = `
      <button class="btn btn-primary" onclick="Documents.openUploadModal()">
        <i data-lucide="upload-cloud"></i> Upload Working Paper
      </button>
    `;

    const html = `
      ${Components.pageHeader('Working Paper Vault & Document Control', 'Centralized audit working paper repository with WBS folder hierarchy, version control, and digital sign-offs.', actions)}

      <div class="stats-grid mb-20">
        ${Components.statCard('file-text', 'Total Working Papers', documents.length, 'Archived & Active', 'up', '#D4A843')}
        ${Components.statCard('check-circle-2', 'Signed Off Documents', documents.filter(d => d.status === 'approved').length, 'QC Approved', 'up', '#10b981')}
        ${Components.statCard('clock', 'Pending Partner Sign-Off', documents.filter(d => d.status === 'under-review').length, 'In Review Queue', 'up', '#f59e0b')}
        ${Components.statCard('shield-check', 'Assertion Tagged', '100%', 'ISA 500 Compliant', 'up', '#3b82f6')}
      </div>

      <div class="widget">
        <div class="widget-header">
          <div class="widget-title">Audit Working Paper File Inventory & Version Tree</div>
        </div>
        <div class="widget-body">
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>File Name & Version</th>
                  <th>WBS Folder</th>
                  <th>Engagement</th>
                  <th>Assertion Tags</th>
                  <th>Status</th>
                  <th>Digital Sign-Off</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${documents.map(d => {
      const prj = DataStore.getById('projects', d.projectId);
      const isApproved = d.status === 'approved';
      return `
                    <tr>
                      <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <i data-lucide="${d.name.endsWith('.pdf') ? 'file-text' : 'file-spreadsheet'}" style="color: var(--accent-gold);"></i>
                          <div>
                            <div style="font-weight: 600;">${d.name}</div>
                            <div style="font-size: 0.72rem; color: var(--text-muted);">Version ${d.version}</div>
                          </div>
                        </div>
                      </td>
                      <td><span class="badge badge-advisory">${d.wbsFolder}</span></td>
                      <td>${prj ? prj.title : 'General'}</td>
                      <td>
                        ${(d.assertionTags || []).map(t => `<span class="task-label tag-gold">${t}</span>`).join(' ')}
                      </td>
                      <td><span class="badge ${isApproved ? 'badge-completed' : 'badge-review'}">${d.status.toUpperCase()}</span></td>
                      <td>
                        ${isApproved ? `
                          <div style="font-size: 0.75rem; color: var(--accent-green);">
                            <i data-lucide="check" style="width: 12px;"></i> Signed by Partner
                            <div class="text-muted">${Components.formatDateTime(d.signedOffAt)}</div>
                          </div>
                        ` : `
                          <button class="btn btn-secondary btn-sm" onclick="Documents.triggerSignOff('${d.id}')">
                            <i data-lucide="pen-tool"></i> Partner Sign-Off
                          </button>
                        `}
                      </td>
                      <td>
                        <button class="btn btn-ghost btn-sm" onclick="Documents.downloadFile('${d.name}')">
                          <i data-lucide="download"></i>
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
  },

  openUploadModal() {
    const projects = DataStore.getAll('projects');

    const formHtml = `
      <form id="upload-doc-form" style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Document Title / File Name *</label>
          <input type="text" id="doc-name" class="form-input" placeholder="e.g. HBL_Cash_Verification_WP_2026.xlsx" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Audit Engagement *</label>
            <select id="doc-project-id" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              ${projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">WBS Folder Phase</label>
            <select id="doc-wbs-folder" class="form-select" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
              <option value="Planning Phase">Planning Phase</option>
              <option value="Fieldwork Phase" selected>Fieldwork Phase</option>
              <option value="Review Phase">Review Phase</option>
              <option value="Partner Review Phase">Partner Review Phase</option>
            </select>
          </div>
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Initial Version</label>
            <input type="text" id="doc-version" class="form-input" value="v1.0" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Assertion Tags (ISA 500)</label>
            <input type="text" id="doc-assertions" class="form-input" placeholder="e.g. Valuation, Accuracy, Completeness" value="Accuracy, Completeness" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-hover); color: #fff;">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; display: block;">Select Local Working Paper File</label>
          <input type="file" id="doc-file-input" style="padding: 6px; background: var(--bg-hover); border-radius: 6px; width: 100%;">
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
      <button class="btn btn-primary" onclick="Documents.saveUploadedDocument()">
        <i data-lucide="upload-cloud"></i> Upload & Register Working Paper
      </button>
    `;

    Modal.open('Upload Audit Working Paper', formHtml, footerHtml);
  },

  saveUploadedDocument() {
    const nameInput = document.getElementById('doc-name');
    const projInput = document.getElementById('doc-project-id');
    const folderInput = document.getElementById('doc-wbs-folder');
    const verInput = document.getElementById('doc-version');
    const tagInput = document.getElementById('doc-assertions');

    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      Toast.show('Please provide a document title or file name.', 'warning');
      return;
    }

    const tags = tagInput ? tagInput.value.split(',').map(t => t.trim()).filter(Boolean) : ['Accuracy'];

    DataStore.create('documents', {
      projectId: projInput ? projInput.value : 'prj_1',
      name,
      version: verInput ? verInput.value.trim() : 'v1.0',
      status: 'under-review',
      wbsFolder: folderInput ? folderInput.value : 'Fieldwork Phase',
      assertionTags: tags,
      uploadedBy: 'usr_3',
      signedOffBy: null,
      signedOffAt: null
    });

    Modal.close();
    Toast.show(`Working Paper "${name}" uploaded successfully!`, 'success');
    this.render(document.getElementById('page-content'));
  },

  triggerSignOff(docId) {
    DataStore.update('documents', docId, {
      status: 'approved',
      signedOffBy: 'usr_1',
      signedOffAt: new Date().toISOString()
    });
    Toast.show('Electronic Partner Sign-off registered successfully.', 'success');
    this.render(document.getElementById('page-content'));
  },

  downloadFile(fileName) {
    Toast.show(`Downloading ${fileName}...`, 'info');
  }
};
