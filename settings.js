/* =============================================
   YACA PM - Settings Module
   ============================================= */

window.Settings = {
  render(container) {
    const html = `
      ${Components.pageHeader('System Settings & Firm Profile', 'Manage Yousuf Adil Chartered Accountants organization profile, workflow rules, and data resets.')}

      <div class="settings-section">
        <div class="settings-section-title">Firm Organization Details</div>
        <div class="widget">
          <div class="widget-body">
            <div class="form-group">
              <label>Firm Legal Name</label>
              <input type="text" class="form-control" value="Yousuf Adil Chartered Accountants" readonly>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Affiliation / Network</label>
                <input type="text" class="form-control" value="Independent Member Firm" readonly>
              </div>
              <div class="form-group">
                <label>Regulator Registration</label>
                <input type="text" class="form-control" value="ICAP (Institute of Chartered Accountants of Pakistan)" readonly>
              </div>
            </div>
            <div class="form-group">
              <label>Head Office Address</label>
              <input type="text" class="form-control" value="Cavendish House, 16-A, Block 6, PECHS, Shahrah-e-Faisal, Karachi, Pakistan" readonly>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Quality Control & Audit Workflow Defaults</div>
        <div class="widget">
          <div class="widget-body">
            <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div class="font-medium">Mandatory Partner Sign-Off</div>
                <div class="text-muted" style="font-size: 0.78rem;">Enforce mandatory Partner sign-off before marking audit engagements as Completed.</div>
              </div>
              <input type="checkbox" checked style="width: 20px; height: 20px;">
            </div>

            <div class="divider"></div>

            <div class="form-group" style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div class="font-medium">Automatic Overdue Task Reminders</div>
                <div class="text-muted" style="font-size: 0.78rem;">Send daily email digest to Engagement Managers for overdue audit working papers.</div>
              </div>
              <input type="checkbox" checked style="width: 20px; height: 20px;">
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Database Management</div>
        <div class="widget">
          <div class="widget-body" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="font-medium">Reset Demo Seed Data</div>
              <div class="text-muted" style="font-size: 0.78rem;">Reset all projects, tasks, clients, and time entries to original initial seed state.</div>
            </div>
            <button class="btn btn-danger" onclick="Settings.confirmReset()">Reset Database</button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  confirmReset() {
    Modal.confirm('Reset Database', 'Are you sure you want to reset all data to default seed data? All custom entries will be lost.', () => {
      DataStore.resetData();
      Toast.show('Data store reset to initial seed state.', 'success');
      App.navigate('dashboard');
    });
  }
};
