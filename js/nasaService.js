(() => {
  // =========================================================================
  // NASA DATA ENGINEERING SERVICE
  // Pipeline: Extract (DONKI API / JSON) -> Normalize -> Fallback Guarantee
  // =========================================================================
  const NASA_API_KEY = 'DEMO_KEY';
  const DONKI_CME_ENDPOINT = 'https://api.nasa.gov/DONKI/CME';
  const API_TIMEOUT_MS = 2500;

  const serviceState = {
    missions: [],
    feedStatus: 'INITIALIZING', // 'LIVE NASA DONKI API' | 'NASA ARCHIVE DATASET'
    liveCmeEvent: null,
    ready: false
  };

  // Formata data YYYY-MM-DD para consulta na API da NASA
  function formatDateISO(dateObj) {
    return dateObj.toISOString().split('T')[0];
  }

  // Normaliza velocidade real da tempestade solar (km/s) em dano de escudo (%)
  function normalizeCmeToGameplay(cmeRaw) {
    const analysis =
      Array.isArray(cmeRaw.cmeAnalyses) && cmeRaw.cmeAnalyses.length > 0
        ? cmeRaw.cmeAnalyses[0]
        : null;

    const speed = analysis && analysis.speed ? Math.round(analysis.speed) : 1150;
    const eventDate = cmeRaw.startTime ? cmeRaw.startTime.slice(0, 10) : 'RECENT';
    const activityId = cmeRaw.activityID || 'DONKI-CME';

    // Fórmula física calibrada: velocidades entre 600 e 2000 km/s drenam 12% a 30%
    const shieldDrain = Math.min(30, Math.max(12, Math.round(speed / 58)));

    return {
      activityId,
      eventDate,
      speed,
      shieldDrain,
      note: cmeRaw.note || 'Coronal Mass Ejection detected by NASA heliophysics fleet.'
    };
  }

  // Consulta ao vivo na API NASA DONKI com AbortController (timeout de 2.5s)
  async function fetchLiveDonkiCme() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    const url = `${DONKI_CME_ENDPOINT}?startDate=${formatDateISO(start)}&endDate=${formatDateISO(end)}&api_key=${NASA_API_KEY}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`NASA API HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No CME events in last 30 days');
      }

      // Seleciona o evento mais intenso (maior velocidade km/s) da janela
      const sorted = data
        .map(normalizeCmeToGameplay)
        .sort((a, b) => b.speed - a.speed);

      return sorted[0];
    } catch (err) {
      clearTimeout(timeoutId);
      console.info('[NasaService] Fallback to curated archive dataset:', err.message);
      return null;
    }
  }

  // Injeta o dado real da API DONKI no Turno 2 da Expedição Marte (Modo 2)
  function injectLiveTelemetryIntoMars(missions, liveCme) {
    const marsMission = missions.find((m) => m.id === 'mars_expedition');
    if (!marsMission || !liveCme) return;

    const stormTurn = marsMission.turns[1]; // Turno 2: Tempestade Solar em Marte
    if (!stormTurn) return;

    stormTurn.nasaValue = liveCme.speed;
    stormTurn.nasaUnit = 'km/s (LIVE CME)';
    stormTurn.environmentDrain.shield = -liveCme.shieldDrain;
    stormTurn.nasaInsight = {
      en: `LIVE NASA DONKI (${liveCme.eventDate}): Real ${liveCme.speed} km/s CME hitting Mars! Shield drain calibrated to -${liveCme.shieldDrain}%.`,
      pt: `NASA DONKI AO VIVO (${liveCme.eventDate}): CME real de ${liveCme.speed} km/s atingindo Marte! Dreno no escudo calibrado para -${liveCme.shieldDrain}%.`
    };
  }

  // Carrega o JSON local (com fallback caso aberto via file:// sem servidor)
  async function loadBaseDataset() {
    try {
      const res = await fetch('data/missionsData.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.missions || [];
    } catch (err) {
      console.warn('[NasaService] Could not fetch data/missionsData.json directly:', err.message);
      return [];
    }
  }

  // Inicialização principal do pipeline de dados
  async function init() {
    const [missions, liveCme] = await Promise.all([loadBaseDataset(), fetchLiveDonkiCme()]);

    serviceState.missions = missions;
    if (liveCme && missions.length > 0) {
      injectLiveTelemetryIntoMars(serviceState.missions, liveCme);
      serviceState.liveCmeEvent = liveCme;
      serviceState.feedStatus = 'LIVE NASA DONKI API';
    } else {
      serviceState.feedStatus = 'NASA ARCHIVE DATASET';
    }

    serviceState.ready = true;
    window.dispatchEvent(
      new CustomEvent('nasaDataReady', {
        detail: {
          feedStatus: serviceState.feedStatus,
          missionCount: serviceState.missions.length,
          liveCme: serviceState.liveCmeEvent
        }
      })
    );

    return serviceState;
  }

  // API pública para o motor do jogo (simulation.js e canvasEngine.js)
  window.NasaService = {
    init,
    getState: () => serviceState,
    getMissionsByMode: (mode) => serviceState.missions.filter((m) => m.mode === mode),
    getMissionById: (id) => serviceState.missions.find((m) => m.id === id) || null,
    getFeedStatus: () => serviceState.feedStatus
  };

  // Dispara a ingestão assim que o script é carregado
  init();
})();