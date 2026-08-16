(() => {
  const root = document.querySelector('[data-poolpilot-official-demo]');
  if (!root) return;

  const CARD_URL = 'https://cdn.jsdelivr.net/gh/amery74/pool-pilot-dashboard@9dc98b5c2f23059c2a04c34b6904cf5ea173e404/pool-pilot-dashboard-card.js';

  class DemoHaCard extends HTMLElement {
    connectedCallback() {
      this.style.display = 'block';
      this.style.width = '100%';
      this.style.boxSizing = 'border-box';
      this.style.position = 'relative';
    }
  }
  if (!customElements.get('ha-card')) customElements.define('ha-card', DemoHaCard);

  class DemoHaIcon extends HTMLElement {
    static get observedAttributes() { return ['icon']; }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { this.render(); }
    render() {
      const icon = (this.getAttribute('icon') || 'mdi:circle-outline').replace(/^mdi:/, '');
      const url = `https://cdn.jsdelivr.net/npm/@mdi/svg@7.4.47/svg/${icon}.svg`;
      if (!this.shadowRoot) this.attachShadow({mode:'open'});
      this.shadowRoot.innerHTML = `<style>:host{display:inline-flex;width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px);color:inherit;vertical-align:middle}.i{display:block;width:100%;height:100%;background:currentColor;-webkit-mask:url("${url}") center/contain no-repeat;mask:url("${url}") center/contain no-repeat}</style><span class="i"></span>`;
    }
  }
  if (!customElements.get('ha-icon')) customElements.define('ha-icon', DemoHaIcon);

  const state = {
    scenario: 'balanced',
    pump: true,
    heatpump: true,
    counter: false,
    electrolyzer: true,
    production: 65,
    measure: new Date(),
  };

  const scenarios = {
    balanced: { air: 32.0, water: 26.4, ph: 7.19, orp: 626, uv: 8, alert: '', chemistry: 'good', bathing: 'good' },
    highph:   { air: 32.5, water: 27.0, ph: 7.82, orp: 610, uv: 8, alert: 'pH trop élevé', chemistry: 'warning', bathing: 'warning' },
    loworp:   { air: 31.6, water: 26.8, ph: 7.23, orp: 540, uv: 7, alert: 'Désinfection insuffisante', chemistry: 'warning', bathing: 'warning' },
  };

  const entity = (id, value, attrs={}) => ({ entity_id:id, state:String(value), attributes:attrs, last_changed:new Date().toISOString(), last_updated:new Date().toISOString() });

  function buildStates() {
    const s = scenarios[state.scenario];
    const d = state.measure;
    const local = d.toLocaleString('fr-FR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).replace(',', '');
    return {
      'sensor.demo_water': entity('sensor.demo_water', s.water, {unit_of_measurement:'°C'}),
      'sensor.demo_air': entity('sensor.demo_air', s.air, {unit_of_measurement:'°C'}),
      'sensor.demo_ph': entity('sensor.demo_ph', s.ph),
      'sensor.demo_orp': entity('sensor.demo_orp', s.orp, {unit_of_measurement:'mV'}),
      'sensor.demo_uv': entity('sensor.demo_uv', s.uv),
      'sensor.demo_last_measure': entity('sensor.demo_last_measure', local, {updated_at_local:local}),
      'sensor.demo_chemistry': entity('sensor.demo_chemistry', s.chemistry),
      'sensor.demo_bathing': entity('sensor.demo_bathing', s.bathing),
      'sensor.demo_alert': entity('sensor.demo_alert', s.alert || 'none'),
      'sensor.demo_filtration_duration': entity('sensor.demo_filtration_duration', '13.2', {unit_of_measurement:'h'}),
      'sensor.demo_smart_filtration': entity('sensor.demo_smart_filtration', state.pump ? 'running' : 'waiting'),
      'sensor.demo_electrolyzer_output': entity('sensor.demo_electrolyzer_output', state.production, {unit_of_measurement:'%'}),
      'switch.demo_pump': entity('switch.demo_pump', state.pump ? 'on' : 'off'),
      'switch.demo_counter': entity('switch.demo_counter', state.counter ? 'on' : 'off'),
      'switch.demo_electrolyzer': entity('switch.demo_electrolyzer', state.electrolyzer ? 'on' : 'off'),
      'climate.demo_heatpump': entity('climate.demo_heatpump', state.heatpump ? 'heat' : 'off', {temperature:28, current_temperature:s.water, hvac_modes:['off','heat','auto','cool']}),
      'weather.demo': entity('weather.demo', 'sunny', {temperature:s.air, forecast:[{condition:'sunny',temperature:s.air+1}]}),
    };
  }

  const hass = {
    states: buildStates(),
    language: 'fr',
    locale: { language:'fr', number_format:'comma_decimal', time_format:'24' },
    themes: { darkMode:false },
    config: { unit_system:{temperature:'°C'} },
    callWS: async (msg) => {
      if (msg?.type === 'weather/get_forecasts') return { 'weather.demo': { forecast:[{condition:'sunny',temperature:33}] } };
      return [];
    },
    callApi: async () => [],
    callService: async (domain, service, data={}) => {
      const id = data.entity_id;
      if (id === 'switch.demo_pump') state.pump = service === 'turn_on' ? true : service === 'turn_off' ? false : !state.pump;
      if (id === 'switch.demo_counter') state.counter = service === 'turn_on' ? true : service === 'turn_off' ? false : !state.counter;
      if (id === 'switch.demo_electrolyzer') state.electrolyzer = service === 'turn_on' ? true : service === 'turn_off' ? false : !state.electrolyzer;
      if (id === 'climate.demo_heatpump') {
        if (service === 'turn_off') state.heatpump = false;
        if (service === 'turn_on' || service === 'set_hvac_mode') state.heatpump = true;
      }
      if (id === 'button.demo_measure' || service === 'press') state.measure = new Date();
      hass.states = buildStates();
      updateCard();
      return {};
    },
    connection: { subscribeMessage: async () => () => {} },
  };

  const config = {
    title: 'Piscine',
    theme: 'analyseur_eau',
    show_weather: true,
    show_weather_alerts: true,
    show_recommendations: true,
    enable_filter_pump: true,
    enable_heatpump: true,
    enable_electrolyzer: false,
    enable_counter_current: true,
    enable_pool_house: true,
    enable_lighting: false,
    enable_aux1: false,
    enable_aux2: false,
    enable_cover: false,
    disinfection_mode: 'orp',
    water_temp_entity: 'sensor.demo_water',
    air_temp_entity: 'sensor.demo_air',
    ph_entity: 'sensor.demo_ph',
    orp_entity: 'sensor.demo_orp',
    uv_entity: 'sensor.demo_uv',
    weather_entity: 'weather.demo',
    last_measure_entity: 'sensor.demo_last_measure',
    chemistry_state_entity: 'sensor.demo_chemistry',
    bathing_state_entity: 'sensor.demo_bathing',
    alert_entity: 'sensor.demo_alert',
    pump_entity: 'switch.demo_pump',
    heatpump_entity: 'climate.demo_heatpump',
    heatpump_temp_entity: 'sensor.demo_water',
    counter_current_entity: 'switch.demo_counter',
    filtration_duration_entity: 'sensor.demo_filtration_duration',
    smart_filtration_entity: 'sensor.demo_smart_filtration',
    trigger_measure_entity: 'button.demo_measure',
  };

  let card;
  function updateCard() {
    if (!card) return;
    card.hass = hass;
  }

  function setScenario(name) {
    state.scenario = name;
    hass.states = buildStates();
    root.querySelectorAll('[data-demo-scenario]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.demoScenario === name));
    updateCard();
  }

  root.querySelectorAll('[data-demo-scenario]').forEach(btn => btn.addEventListener('click', () => setScenario(btn.dataset.demoScenario)));
  root.querySelector('[data-demo-reset]')?.addEventListener('click', () => {
    Object.assign(state, {scenario:'balanced', pump:true, heatpump:true, counter:false, electrolyzer:true, production:65, measure:new Date()});
    hass.states = buildStates();
    setScenario('balanced');
  });

  function loadOfficialCard() {
    if (customElements.get('pool-pilot-dashboard')) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CARD_URL;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  loadOfficialCard().then(async () => {
    await customElements.whenDefined('pool-pilot-dashboard');
    const host = root.querySelector('[data-official-card-host]');
    card = document.createElement('pool-pilot-dashboard');
    card.style.display = 'block';
    card.style.width = '100%';
    card.setConfig(config);
    card.hass = hass;
    host.replaceChildren(card);
    root.classList.add('is-ready');
  }).catch((err) => {
    console.error('Pool Pilot demo: impossible de charger la carte officielle', err);
    const host = root.querySelector('[data-official-card-host]');
    host.innerHTML = '<div class="demo-load-error">Impossible de charger la carte de démonstration. Réessayez dans quelques instants.</div>';
  });
})();
