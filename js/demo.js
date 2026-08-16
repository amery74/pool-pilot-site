(() => {
  const root = document.querySelector('[data-poolpilot-demo]');
  if (!root) return;

  const $ = (selector) => root.querySelector(selector);
  const $$ = (selector) => [...root.querySelectorAll(selector)];

  const scenarios = {
    balanced: {
      air: '31,8 °C', uv: '7', water: '26,4 °C', ph: '7,20', orp: '690',
      phState: 'Bon', orpState: 'Bon', alertClass: 'is-ok',
      alertTitle: '✅ Eau équilibrée', alertText: 'Aucune correction immédiate n’est nécessaire.'
    },
    'high-ph': {
      air: '32,4 °C', uv: '8', water: '27,1 °C', ph: '7,82', orp: '655',
      phState: 'Trop haut', orpState: 'À surveiller', alertClass: 'is-warning',
      alertTitle: '⚠️ pH trop élevé', alertText: 'Pool Pilot recommande une correction progressive du pH avant d’ajuster la désinfection.'
    },
    'low-orp': {
      air: '30,9 °C', uv: '6', water: '26,8 °C', ph: '7,28', orp: '545',
      phState: 'Bon', orpState: 'Trop bas', alertClass: 'is-danger',
      alertTitle: '🧪 Désinfection insuffisante', alertText: 'Le niveau de désinfection simulé est insuffisant. Vérifiez le traitement et la production.'
    }
  };

  const state = { filter: true, heat: true, light: false, auto: true, boost: false, production: 65 };

  function renderEquipment(key) {
    $$(`[data-demo-toggle="${key}"]`).forEach((button) => {
      if (button.classList.contains('demo-equipment')) button.classList.toggle('is-on', !!state[key]);
      if (key === 'auto') button.classList.toggle('is-active', !!state.auto);
    });
    $$(`[data-demo-state="${key}"]`).forEach((el) => { el.textContent = state[key] ? 'ON' : 'OFF'; });
    const filterLabel = $('[data-demo-filter-label]');
    const autoLabel = $('[data-demo-auto-label]');
    const expertFilter = $('[data-demo-expert-filter]');
    if (filterLabel) filterLabel.textContent = state.filter ? 'En cours' : 'Arrêtée';
    if (autoLabel) autoLabel.textContent = state.auto ? 'Activé' : 'Désactivé';
    if (expertFilter) expertFilter.textContent = state.filter ? 'En cours' : 'Arrêtée';
  }

  function renderProduction() {
    $('[data-demo-production]').textContent = `${state.production} %`;
    $('[data-demo-expert-production]').textContent = `${state.production} %`;
    $('[data-demo-production-range]').value = state.production;
  }

  function applyScenario(name) {
    const data = scenarios[name] || scenarios.balanced;
    $('[data-demo-air]').textContent = data.air;
    $('[data-demo-uv]').textContent = data.uv;
    $('[data-demo-water]').textContent = data.water;
    $('[data-demo-expert-water]').textContent = data.water;
    $('[data-demo-ph]').textContent = data.ph;
    $('[data-demo-orp]').textContent = data.orp;
    $('[data-demo-ph-state]').textContent = data.phState;
    $('[data-demo-orp-state]').textContent = data.orpState;
    const alert = $('[data-demo-alert]');
    alert.classList.remove('is-ok', 'is-warning', 'is-danger');
    alert.classList.add(data.alertClass);
    $('[data-demo-alert-title]').textContent = data.alertTitle;
    $('[data-demo-alert-text]').textContent = data.alertText;
    $$('.demo-scenario').forEach((button) => button.classList.toggle('is-active', button.dataset.demoScenario === name));
  }

  $$('.demo-scenario').forEach((button) => button.addEventListener('click', () => applyScenario(button.dataset.demoScenario)));

  $$('[data-demo-tab]').forEach((button) => button.addEventListener('click', () => {
    $$('[data-demo-tab]').forEach((item) => item.classList.toggle('is-active', item === button));
    $$('[data-demo-panel]').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.demoPanel === button.dataset.demoTab));
  }));

  $$('[data-demo-toggle]').forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.demoToggle;
    state[key] = !state[key];
    renderEquipment(key);
  }));

  $('[data-demo-production-range]').addEventListener('input', (event) => {
    state.production = Number(event.target.value);
    renderProduction();
  });

  $('[data-demo-boost]').addEventListener('click', (event) => {
    state.boost = !state.boost;
    $('[data-demo-boost-label]').textContent = state.boost ? 'Actif' : 'Inactif';
    event.currentTarget.textContent = state.boost ? 'Arrêter Boost' : 'Activer Boost';
    event.currentTarget.classList.toggle('is-active', state.boost);
  });

  $('[data-demo-measure]').addEventListener('click', () => {
    const now = new Date();
    $('[data-demo-time]').textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  });

  const expertPanel = $('[data-demo-expert-panel]');
  $('[data-demo-expert]').addEventListener('click', () => { expertPanel.hidden = false; });
  $('[data-demo-expert-close]').addEventListener('click', () => { expertPanel.hidden = true; });

  $('[data-demo-reset]').addEventListener('click', () => {
    Object.assign(state, { filter: true, heat: true, light: false, auto: true, boost: false, production: 65 });
    ['filter', 'heat', 'light', 'auto'].forEach(renderEquipment);
    renderProduction();
    $('[data-demo-boost-label]').textContent = 'Inactif';
    $('[data-demo-boost]').textContent = 'Activer Boost';
    $('[data-demo-boost]').classList.remove('is-active');
    applyScenario('balanced');
  });

  ['filter', 'heat', 'light', 'auto'].forEach(renderEquipment);
  renderProduction();
  applyScenario('balanced');
})();
