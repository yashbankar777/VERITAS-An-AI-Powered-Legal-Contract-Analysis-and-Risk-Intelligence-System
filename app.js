/* ============================================================
   VERITAS — app.js
   Vanilla JS — no frameworks, no build tools
   Full compatibility with Flask backend pipeline
   ============================================================ */

(function () {
  'use strict';

  // ── Section navigation ────────────────────────────────────
  window.showSection = function (name) {
    document.querySelectorAll('.page-section').forEach(el => {
      el.classList.remove('active');
    });
    const target = document.getElementById('section-' + name);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── DOM refs ──────────────────────────────────────────────
  const textarea      = document.getElementById('contract-text');
  const titleInput    = document.getElementById('contract-title');
  const charCount     = document.getElementById('char-count');
  const btnAnalyse    = document.getElementById('btn-analyse');
  const btnSample     = document.getElementById('btn-sample');
  const fileUpload    = document.getElementById('file-upload');
  const resultsEl     = document.getElementById('results');
  const errorBanner   = document.getElementById('error-banner');
  const errorMsg      = document.getElementById('error-msg');

  // pipeline steps
  const pipeSteps = {
    seg:  document.getElementById('pipe-seg'),
    cls:  document.getElementById('pipe-cls'),
    onto: document.getElementById('pipe-onto'),
    llm:  document.getElementById('pipe-llm'),
    rep:  document.getElementById('pipe-rep'),
  };

  // ── Character counter ─────────────────────────────────────
  textarea.addEventListener('input', () => {
    const n = textarea.value.length;
    charCount.textContent = n.toLocaleString() + ' character' + (n !== 1 ? 's' : '');
  });

  // ── File upload ───────────────────────────────────────────
  fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      textarea.value = ev.target.result;
      textarea.dispatchEvent(new Event('input'));
      const name = file.name.replace(/\.txt$/i, '').replace(/[_-]/g, ' ');
      if (name) titleInput.value = name;
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // ── Load sample ───────────────────────────────────────────
  btnSample.addEventListener('click', async () => {
    btnSample.disabled = true;
    btnSample.textContent = 'Loading…';
    try {
      const res  = await fetch('/sample');
      const data = await res.json();
      textarea.value = data.text;
      textarea.dispatchEvent(new Event('input'));
      titleInput.value = 'Software License Agreement';
    } catch (_) {
      showError('Could not load sample contract.');
    } finally {
      btnSample.disabled = false;
      btnSample.textContent = 'Sample';
    }
  });

  // ── Pipeline helpers ──────────────────────────────────────
  const STEP_KEYS = ['seg', 'cls', 'onto', 'llm', 'rep'];

  function resetPipeline() {
    STEP_KEYS.forEach(k => {
      pipeSteps[k].classList.remove('active', 'done');
    });
  }

  function activateStep(key) {
    pipeSteps[key].classList.add('active');
    pipeSteps[key].classList.remove('done');
  }

  function completeStep(key) {
    pipeSteps[key].classList.remove('active');
    pipeSteps[key].classList.add('done');
  }

  async function animatePipeline() {
    const delays = [0, 800, 1800, 3000];
    for (let i = 0; i < STEP_KEYS.length - 1; i++) {
      await delay(delays[i]);
      activateStep(STEP_KEYS[i]);
      if (i > 0) completeStep(STEP_KEYS[i - 1]);
    }
  }

  function completePipeline() {
    STEP_KEYS.slice(0, 4).forEach(k => completeStep(k));
    activateStep('rep');
    setTimeout(() => completeStep('rep'), 400);
  }

  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ── Error helpers ─────────────────────────────────────────
  function showError(msg) {
    errorMsg.textContent = msg;
    errorBanner.style.display = 'flex';
    resultsEl.style.display = 'block';
  }

  function clearError() {
    errorBanner.style.display = 'none';
    errorMsg.textContent = '';
  }

  // ── Risk helpers ──────────────────────────────────────────
  function riskClass(score) {
    if (score >= 0.4) return 'high';
    if (score >= 0.2) return 'medium';
    return 'low';
  }

  function riskLabel(score) {
    if (score >= 0.4) return 'HIGH';
    if (score >= 0.2) return 'MED';
    return 'LOW';
  }

  function pct(n) { return Math.round(n * 100) + '%'; }

  function extractRatingWord(text) {
    if (!text) return '';
    const m = text.match(/\b(CRITICAL|HIGH|MEDIUM|LOW)\b/i);
    return m ? m[1].toUpperCase() : '';
  }

  // ── HTML escape ───────────────────────────────────────────
  function escHtml(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#039;');
  }

  // ── Render results ────────────────────────────────────────
  function renderResults(data) {
    clearError();
    resultsEl.style.display = 'block';

    // Mode pill
    const modePill = document.getElementById('mode-pill');
    modePill.textContent = data.llm_mode === 'real_api'
      ? 'Anthropic API — Live'
      : 'Offline Analysis Mode';

    // ── Executive metrics ─────────────────────────────────
    document.getElementById('s-total').textContent = data.total_clauses;
    document.getElementById('s-mean').textContent  = pct(data.mean_risk_score);
    document.getElementById('s-high').textContent  = data.high_risk_clauses;

    const ratingRaw  = data.report.overall_risk_rating || '';
    const ratingWord = extractRatingWord(ratingRaw);
    const ratingEl   = document.getElementById('s-rating');
    ratingEl.textContent = ratingWord || '—';

    const ratingMetric = ratingEl.closest('.exec-metric--rating');
    ratingMetric.classList.remove('risk-high', 'risk-medium', 'risk-low');
    if (ratingWord === 'HIGH' || ratingWord === 'CRITICAL')
      ratingMetric.classList.add('risk-high');
    else if (ratingWord === 'MEDIUM')
      ratingMetric.classList.add('risk-medium');
    else if (ratingWord === 'LOW')
      ratingMetric.classList.add('risk-low');

    // ── Clause registry ───────────────────────────────────
    const clauseCount = document.getElementById('clause-count');
    if (clauseCount) clauseCount.textContent = data.clauses.length + ' clauses';

    const registryBody = document.getElementById('clause-table-body');
    registryBody.innerHTML = '';

    data.clauses.forEach((c, i) => {
      const rc = riskClass(c.risk_score);
      const confPct = Math.round(c.confidence * 100);
      const domainsHtml = (c.risk_domains || [])
        .slice(0, 3)
        .map(d => `<span class="domain-chip">${d.replace('_risk','')}</span>`)
        .join('');

      const row = document.createElement('div');
      row.className = 'registry-row';
      row.innerHTML = `
        <span class="rr-num">${i + 1}</span>
        <span class="rr-type">${escHtml(c.clause_type)}</span>
        <div class="rr-conf">
          <div class="conf-track"><div class="conf-fill" style="width:${confPct}%"></div></div>
          <span class="conf-pct">${confPct}%</span>
        </div>
        <div class="rr-risk">
          <span class="risk-badge ${rc}">${pct(c.risk_score)}</span>
        </div>
        <div class="rr-domains">${domainsHtml || '<span style="color:var(--text-dim);font-size:0.62rem;font-family:var(--font-mono)">—</span>'}</div>
        <div class="rr-action">
          <button class="row-detail-btn" onclick="scrollToCard(${i})">↓</button>
        </div>
      `;
      registryBody.appendChild(row);
    });

    // ── Clause detail cards ───────────────────────────────
    const cardsEl = document.getElementById('clause-cards');
    cardsEl.innerHTML = '';

    data.clauses.forEach((c, i) => {
      const rc = riskClass(c.risk_score);
      const card = document.createElement('div');
      card.className = 'clause-card';
      card.id = `card-${i}`;

      card.innerHTML = `
        <div class="clause-card-header" onclick="toggleCard(this)">
          <span class="card-idx">${String(i + 1).padStart(2, '0')}</span>
          <span class="rr-type" style="font-size:0.75rem">${escHtml(c.clause_type)}</span>
          <span class="risk-badge ${rc}" style="margin-left:0.25rem">${pct(c.risk_score)} ${riskLabel(c.risk_score)}</span>
          <span class="card-chevron">▼</span>
        </div>
        <div class="clause-card-body">
          <div class="clause-text-box">${escHtml(c.clause_text)}</div>
          <div class="intel-grid">
            <div class="intel-block">
              <p class="intel-block-label plain">Plain English</p>
              <p class="intel-block-text">${escHtml(c.plain_summary || '—')}</p>
            </div>
            <div class="intel-block">
              <p class="intel-block-label legal">Legal Implications</p>
              <p class="intel-block-text">${escHtml(c.legal_implications || '—')}</p>
            </div>
            <div class="intel-block">
              <p class="intel-block-label business">Business Implications</p>
              <p class="intel-block-text">${escHtml(c.business_implications || '—')}</p>
            </div>
            <div class="intel-block">
              <p class="intel-block-label risk">Risk Interpretation</p>
              <p class="intel-block-text">${escHtml(c.risk_interpretation || '—')}</p>
            </div>
          </div>
        </div>
      `;
      cardsEl.appendChild(card);
    });

    // ── Visualisations ─────────────────────────────────────
    tryLoadViz();

    // ── Intelligence report ────────────────────────────────
    const reportGrid = document.getElementById('report-grid');
    reportGrid.innerHTML = '';

    const reportSections = [
      { key: 'executive_summary',        label: 'Executive Summary' },
      { key: 'key_risk_areas',           label: 'Key Risk Areas' },
      { key: 'critical_dependencies',    label: 'Critical Dependencies' },
      { key: 'business_recommendations', label: 'Business Recommendations' },
    ];

    reportSections.forEach(({ key, label }) => {
      const val = data.report[key];
      if (!val) return;
      const block = document.createElement('div');
      block.className = 'report-section';
      block.innerHTML = `
        <p class="report-section-label">${label}</p>
        <p class="report-section-text">${escHtml(val)}</p>
      `;
      reportGrid.appendChild(block);
    });

    if (data.report.overall_risk_rating) {
      const block = document.createElement('div');
      block.className = 'report-section report-section--full';
      block.innerHTML = `
        <p class="report-section-label">Overall Risk Rating</p>
        <p class="report-section-text">${escHtml(data.report.overall_risk_rating)}</p>
      `;
      reportGrid.appendChild(block);
    }

    // Scroll results into view
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Visualisation loader ──────────────────────────────────
  function tryLoadViz() {
    const section   = document.getElementById('viz-section');
    const dashboard = document.getElementById('viz-dashboard');
    const heatmap   = document.getElementById('viz-heatmap');

    const dashSrc = '/outputs/contract_risk_dashboard.png?t=' + Date.now();
    const heatSrc = '/outputs/risk_domain_activation.png?t='  + Date.now();

    let loaded = 0;
    const tryShow = () => { if (++loaded === 2) section.style.display = 'block'; };

    const imgD = new Image();
    imgD.onload  = () => { dashboard.src = dashSrc; tryShow(); };
    imgD.onerror = tryShow;
    imgD.src     = dashSrc;

    const imgH = new Image();
    imgH.onload  = () => { heatmap.src = heatSrc; tryShow(); };
    imgH.onerror = tryShow;
    imgH.src     = heatSrc;
  }

  // ── Card interactions ─────────────────────────────────────
  window.toggleCard = function (header) {
    const card = header.closest('.clause-card');
    card.classList.toggle('open');
  };

  window.scrollToCard = function (i) {
    const card = document.getElementById(`card-${i}`);
    if (!card) return;
    card.classList.add('open');
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Analyse handler ───────────────────────────────────────
  btnAnalyse.addEventListener('click', async () => {
    const text  = textarea.value.trim();
    const title = titleInput.value.trim() || 'Contract';

    if (!text) {
      showError('Please paste or upload a contract before running analysis.');
      return;
    }
    if (text.length < 50) {
      showError('Contract text is too short — please provide a fuller document.');
      return;
    }

    // Ensure we are on the workspace section
    showSection('workspace');

    // Loading state
    btnAnalyse.disabled = true;
    btnAnalyse.classList.add('loading');
    clearError();
    resetPipeline();
    resultsEl.style.display = 'none';
    const vizSection = document.getElementById('viz-section');
    if (vizSection) vizSection.style.display = 'none';

    animatePipeline();

    try {
      const res = await fetch('/analyse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, title }),
      });

      const data = await res.json();

      completePipeline();
      await delay(300);

      if (!res.ok || data.error) {
        showError(data.error || 'Analysis failed. Check the Flask console for details.');
        return;
      }

      renderResults(data);

    } catch (err) {
      showError('Network error — is the Flask server running? (' + err.message + ')');
      resetPipeline();
    } finally {
      btnAnalyse.disabled = false;
      btnAnalyse.classList.remove('loading');
    }
  });

  // ── Nav scroll shadow ─────────────────────────────────────
  const nav = document.getElementById('site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.style.borderBottomColor = window.scrollY > 10
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(255,255,255,0.04)';
    }, { passive: true });
  }

})();