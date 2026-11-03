/* =============================================
   YACA PM - Ultra Futuristic Motion Login Module
   ============================================= */

window.Login = {
    render(container) {
        const html = `
      <div class="futuristic-login-container">
        <!-- Animated Futuristic Office Background -->
        <div class="futuristic-login-bg"></div>
        <div class="futuristic-login-overlay"></div>
        <div class="grid-scanlines"></div>
        <div class="particle-drift-layer"></div>

        <!-- Central Futuristic Glassmorphism Auth Card -->
        <div class="futuristic-auth-card">
          <div class="auth-brand">
            <div class="logo-box">
              <div class="diamond d1"></div>
              <div class="diamond d2"></div>
              <div class="diamond d3"></div>
            </div>
            <div class="brand-text-wrap">
              <div class="brand-title">YOUSUF ADIL</div>
              <div class="brand-subtitle">CHARTERED ACCOUNTANTS</div>
            </div>
          </div>

          <div class="auth-header">
            <div class="auth-tag">ISQM 1 / ISA 220 COMPLIANT PLATFORM</div>
            <h2>Enterprise Audit & Project Control Portal</h2>
            <p>Authenticate with your engagement credentials or partner passkey to access working papers, audit risks, and financial valuations.</p>
          </div>

          <form id="login-form" onsubmit="Login.handleAuth(event)" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label style="font-size: 0.78rem; font-weight: 600; color: var(--accent-gold); letter-spacing: 0.5px; display: flex; align-items: center; justify-content: space-between;">
                <span>PARTNER / AUDITOR EMAIL</span>
                <i data-lucide="shield-check" style="width: 14px; color: #10b981;"></i>
              </label>
              <div style="position: relative;">
                <i data-lucide="user" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-muted);"></i>
                <input type="email" id="login-email" class="form-input futuristic-input" value="muhammad.yousuf@yousufadil.com" required style="padding-left: 38px;">
              </div>
            </div>

            <div class="form-group">
              <label style="font-size: 0.78rem; font-weight: 600; color: var(--accent-gold); letter-spacing: 0.5px; display: flex; align-items: center; justify-content: space-between;">
                <span>ENCRYPTED PASSKEY</span>
                <i data-lucide="lock" style="width: 14px; color: #3b82f6;"></i>
              </label>
              <div style="position: relative;">
                <i data-lucide="key-round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-muted);"></i>
                <input type="password" id="login-password" class="form-input futuristic-input" value="••••••••••••" required style="padding-left: 38px;">
              </div>
            </div>

            <div class="form-group">
              <label style="font-size: 0.78rem; font-weight: 600; color: var(--accent-gold); letter-spacing: 0.5px;">ENGAGEMENT ROLE</label>
              <select id="login-role" class="form-select futuristic-input">
                <option value="Engagement Partner">Engagement Partner (Muhammad Yousuf, FCA)</option>
                <option value="Audit Manager">Audit Manager (Zain Abbasi, ACA)</option>
                <option value="Senior Auditor">Senior Auditor (Sara Ahmed)</option>
                <option value="Client CFO">Client CFO (Lucky Cement Portal)</option>
              </select>
            </div>

            <!-- Quick One-Click Demo Role Login Shortcuts -->
            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <button type="button" class="btn btn-ghost btn-sm quick-role-btn" onclick="Login.setRole('partner')">
                <i data-lucide="user-check"></i> Partner Demo
              </button>
              <button type="button" class="btn btn-ghost btn-sm quick-role-btn" onclick="Login.setRole('manager')">
                <i data-lucide="users"></i> Manager Demo
              </button>
              <button type="button" class="btn btn-ghost btn-sm quick-role-btn" onclick="Login.setRole('client')">
                <i data-lucide="globe"></i> Client CFO Demo
              </button>
            </div>

            <!-- Animated Biometric Auth Button -->
            <button type="submit" id="auth-btn" class="btn-futuristic-submit mb-10">
              <span class="btn-scan-line"></span>
              <i data-lucide="fingerprint" class="auth-icon-pulse"></i>
              <span id="auth-btn-text">INITIALIZE BIOMETRIC SIGN-IN</span>
            </button>
          </form>

          <!-- Security Footprint -->
          <div class="auth-footer-security">
            <div class="sec-badge"><i data-lucide="shield"></i> ISQM 1 SECURED</div>
            <div class="sec-badge"><i data-lucide="lock"></i> 256-BIT ENCRYPTED</div>
            <div class="sec-badge"><i data-lucide="badge-check"></i> ICAP REGISTERED</div>
          </div>
        </div>
      </div>
    `;

        container.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    },

    setRole(type) {
        const emailEl = document.getElementById('login-email');
        const roleEl = document.getElementById('login-role');

        if (type === 'partner') {
            if (emailEl) emailEl.value = 'muhammad.yousuf@yousufadil.com';
            if (roleEl) roleEl.value = 'Engagement Partner';
        } else if (type === 'manager') {
            if (emailEl) emailEl.value = 'zain.abbasi@yousufadil.com';
            if (roleEl) roleEl.value = 'Audit Manager';
        } else if (type === 'client') {
            if (emailEl) emailEl.value = 'cfo@lucky-cement.com';
            if (roleEl) roleEl.value = 'Client CFO';
        }
        Toast.show(`Preset loaded: ${type.toUpperCase()} Credentials`, 'info');
    },

    handleAuth(e) {
        e.preventDefault();
        const btn = document.getElementById('auth-btn');
        const text = document.getElementById('auth-btn-text');
        const role = document.getElementById('login-role').value;

        if (btn) btn.classList.add('authenticating');
        if (text) text.innerText = 'VERIFYING ISQM 1 CREDENTIALS...';

        setTimeout(() => {
            if (text) text.innerText = 'BIOMETRIC SIGN-IN GRANTED';
            Toast.show(`Welcome back! Authenticated as ${role}`, 'success');

            // Store current user session
            DataStore.data.currentUser = {
                name: role.includes('Partner') ? 'Muhammad Yousuf' : (role.includes('Manager') ? 'Zain Abbasi' : 'Client CFO'),
                role: role,
                email: document.getElementById('login-email').value
            };

            setTimeout(() => {
                App.showMainApp();
            }, 600);
        }, 1200);
    }
};
