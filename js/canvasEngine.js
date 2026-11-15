(() => {
  // =========================================================================
  // 1. DICIONÁRIO BILÍNGUE DA INTERFACE BASE (EN / PT)
  // =========================================================================
  const I18N = {
    en: {
      langBtn: 'LANG: EN',
      introSkip: 'SKIP >>',
      introNext: 'NEXT >',
      introFinish: 'START SETUP >>',
      introSpeaker: (step, total) => `APOLLO COPILOT // TRANSMISSION ${step}/${total}`,
      introSlides: [
        'Greetings, Cadet! I am APOLLO, your onboard AI copilot. Earth needs commanders trained in real NASA space telemetry.',
        'MODE 1 (Lunar Station): Clear all 3 real crisis phases to unlock MODE 2 (Mars) and the EVA suit. [Judges: use JUDGE PASS at the top to test Mode 2 anytime!]',
        'Walk to the 3 physical servers—Reactor, Bio-Dome, and Defense—to balance Energy, Life Support, and Shield. Ready?'
      ],
      setupTitle: 'COMMANDER REGISTRATION',
      setupDesc: 'Customize your profile before taking command of the station.',
      nameLabel: 'COMMANDER NAME:',
      namePlaceholder: 'Ex: Maya, Lucas...',
      avatarLabel: 'SELECT AVATAR:',
      avatarFemale: 'COMMANDER (F)',
      avatarMale: 'COMMANDER (M)',
      enterBtn: 'ENTER STATION >>',
      subtitleM1: '// MODE 1: LUNAR STATION',
      subtitleM2: '// MODE 2: JEZERO CRATER (MARS)',
      btnBriefing: 'NASA DATA BRIEF',
      btnSuitM1: 'JUDGE PASS: M1 (STATION)',
      btnSuitM2: 'JUDGE PASS: M2 (EVA MARS)',
      resEnergy: 'ENERGY',
      resLife: 'LIFE SUPPORT',
      resShield: 'SHIELD',
      controlsHint: 'MOVE: [WASD / ARROWS] OR CLICK FLOOR  |  INTERACT WITH SERVER: [SPACE]',
      interactPrompt: '[SPACE]',
      statusNominal: '// STATUS: NOMINAL',
      statusAlert: '// STATUS: CAUTION - LOW RESOURCE',
      statusCritical: '// STATUS: CRITICAL ALERT!'
    },
    pt: {
      langBtn: 'IDIOMA: PT',
      introSkip: 'PULAR >>',
      introNext: 'PRÓXIMO >',
      introFinish: 'INICIAR >>',
      introSpeaker: (step, total) => `COPILOTO APOLLO // TRANSMISSÃO ${step}/${total}`,
      introSlides: [
        'Saudações, Cadete! Sou APOLLO, seu computador de bordo copiloto. A Terra precisa de comandantes treinados com dados reais da NASA.',
        'MODO 1 (Estação Lunar): Vença as 3 crises reais para liberar o MODO 2 (Marte) e o traje EVA. [Juízes: usem PASSE JUIZ no topo para testar o Modo 2!]',
        'Caminhe até os 3 servidores físicos—Reator, Bio-Estufa e Defesa—para equilibrar Energia, Suporte de Vida e Escudo. Vamos começar?'
      ],
      setupTitle: 'REGISTRO DE COMANDANTE',
      setupDesc: 'Personalize seu perfil antes de assumir o controle da estação.',
      nameLabel: 'NOME DO(A) COMANDANTE:',
      namePlaceholder: 'Ex: Maya, Lucas...',
      avatarLabel: 'ESCOLHA SEU AVATAR:',
      avatarFemale: 'COMANDANTE (F)',
      avatarMale: 'COMANDANTE (M)',
      enterBtn: 'ENTRAR NA ESTAÇÃO >>',
      subtitleM1: '// MODO 1: ESTAÇÃO LUNAR',
      subtitleM2: '// MODO 2: CRATERA JEZERO (MARTE)',
      btnBriefing: 'DADOS NASA (BRIEF)',
      btnSuitM1: 'PASSE JUIZ: M1 (ESTAÇÃO)',
      btnSuitM2: 'PASSE JUIZ: M2 (EVA MARTE)',
      resEnergy: 'ENERGIA',
      resLife: 'SUPORTE DE VIDA',
      resShield: 'ESCUDO',
      controlsHint: 'MOVER: [WASD / SETAS] OU CLIQUE NO PISO  |  INTERAGIR NO SERVIDOR: [ESPAÇO]',
      interactPrompt: '[ESPAÇO]',
      statusNominal: '// STATUS: NOMINAL',
      statusAlert: '// STATUS: ALERTA - RECURSO BAIXO',
      statusCritical: '// STATUS: PERIGO CRÍTICO!'
    }
  };

  // =========================================================================
  // 2. ESTADO VISUAL E ESPACIAL
  // =========================================================================
  const state = {
    lang: 'en',
    screen: 'intro', // 'intro' | 'setup' | 'station'
    introIndex: 0,
    introCharIndex: 0,
    introTypingTimer: null,
    commanderName: 'Margaret',
    gender: 'female',
    mode: 1,
    judgePassActive: false,
    modalOpen: false,
    resources: {
      energy: 70,
      life: 70,
      shield: 70
    },
    apolloTalkTicks: 0,
    player: {
      x: 400,
      y: 265,
      targetX: 400,
      targetY: 265,
      speed: 4.2,
      facing: 1,
      walkFrame: 0,
      frameTimer: 0
    },
    keys: {},
    nearbyServer: null
  };

  const servers = [
    {
      id: 'reactor',
      shortEn: 'REACTOR',
      shortPt: 'REATOR',
      resourceKey: 'energy',
      x: 155,
      y: 190,
      color: '#facc15'
    },
    {
      id: 'greenhouse',
      shortEn: 'BIO-DOME',
      shortPt: 'ESTUFA',
      resourceKey: 'life',
      x: 400,
      y: 190,
      color: '#4ade80'
    },
    {
      id: 'console',
      shortEn: 'DEFENSE',
      shortPt: 'DEFESA',
      resourceKey: 'shield',
      x: 645,
      y: 190,
      color: '#38bdf8'
    }
  ];

  // =========================================================================
  // 3. TRANSIÇÃO RETRÔ & IDIOMA
  // =========================================================================
  function transitionToScreen(hideId, showId, afterCallback) {
    const fader = document.getElementById('screen-fader');
    fader.classList.add('active');

    setTimeout(() => {
      if (hideId) document.getElementById(hideId).classList.add('hidden');
      if (showId) document.getElementById(showId).classList.remove('hidden');
      if (afterCallback) afterCallback();

      requestAnimationFrame(() => {
        fader.classList.remove('active');
      });
    }, 460);
  }

  function applyLanguage(newLang) {
    state.lang = newLang;
    const dict = I18N[state.lang];
    document.documentElement.lang = newLang === 'en' ? 'en' : 'pt-BR';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) el.setAttribute('placeholder', dict[key]);
    });

    document.getElementById('btn-lang').textContent = dict.langBtn;
    document.getElementById('btn-lang-intro').textContent = dict.langBtn;
    document.getElementById('btn-toggle-suit').textContent =
      state.mode === 1 ? dict.btnSuitM1 : dict.btnSuitM2;
    document.getElementById('mission-subtitle').textContent =
      state.mode === 1 ? dict.subtitleM1 : dict.subtitleM2;

    if (state.screen === 'intro') {
      startIntroSlide(state.introIndex);
    } else {
      updateApolloStatusHeader();
      if (window.Simulation) {
        window.Simulation.onLanguageChange(newLang);
      }
    }
  }

  // =========================================================================
  // 4. CENA 1: ABERTURA ESPACIAL
  // =========================================================================
  const introCanvas = document.getElementById('intro-canvas');
  const introCtx = introCanvas.getContext('2d');
  introCtx.imageSmoothingEnabled = false;

  const stars = Array.from({ length: 55 }, () => ({
    x: Math.random() * introCanvas.width,
    y: Math.random() * introCanvas.height,
    speed: 0.4 + Math.random() * 1.4,
    size: Math.random() > 0.75 ? 3 : 2
  }));

  function startIntroSlide(index) {
    const dict = I18N[state.lang];
    state.introIndex = index;
    const slides = dict.introSlides;
    const fullText = slides[index];

    document.getElementById('intro-speaker').textContent = dict.introSpeaker(index + 1, slides.length);
    document.getElementById('btn-intro-next').textContent =
      index === slides.length - 1 ? dict.introFinish : dict.introNext;

    clearInterval(state.introTypingTimer);
    state.introCharIndex = 0;
    const textEl = document.getElementById('intro-text');
    textEl.textContent = '';

    state.introTypingTimer = setInterval(() => {
      state.introCharIndex++;
      textEl.textContent = fullText.slice(0, state.introCharIndex);
      if (state.introCharIndex >= fullText.length) {
        clearInterval(state.introTypingTimer);
      }
    }, 20);
  }

  function finishIntro() {
    clearInterval(state.introTypingTimer);
    transitionToScreen('intro-overlay', 'setup-overlay', () => {
      state.screen = 'setup';
    });
  }

  let introFrame = 0;
  function renderIntroScene() {
    if (state.screen !== 'intro') return;
    introFrame++;

    introCtx.fillStyle = '#03060f';
    introCtx.fillRect(0, 0, introCanvas.width, introCanvas.height);

    stars.forEach((s) => {
      s.x -= s.speed;
      if (s.x < 0) {
        s.x = introCanvas.width;
        s.y = Math.random() * introCanvas.height;
      }
      introCtx.fillStyle = s.size === 3 ? '#bae6fd' : '#64748b';
      introCtx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
    });

    introCtx.fillStyle = '#475569';
    introCtx.fillRect(75, 55, 44, 44);
    introCtx.fillStyle = '#64748b';
    introCtx.fillRect(83, 63, 10, 10);
    introCtx.fillRect(98, 78, 12, 8);

    introCtx.fillStyle = '#b45309';
    introCtx.fillRect(515, 48, 52, 52);
    introCtx.fillStyle = '#d97706';
    introCtx.fillRect(524, 58, 18, 8);
    introCtx.fillRect(535, 78, 20, 10);

    const bobY = Math.round(Math.sin(introFrame * 0.08) * 4);
    const rx = 288;
    const ry = 36 + bobY;

    introCtx.fillStyle = '#94a3b8';
    introCtx.fillRect(rx + 30, ry - 12, 4, 12);
    introCtx.fillStyle = introFrame % 30 < 15 ? '#facc15' : '#38bdf8';
    introCtx.fillRect(rx + 28, ry - 18, 8, 6);

    introCtx.fillStyle = '#cbd5e1';
    introCtx.fillRect(rx, ry, 64, 54);
    introCtx.fillStyle = '#090d16';
    introCtx.fillRect(rx + 8, ry + 10, 48, 32);

    introCtx.fillStyle = '#22d3ee';
    introCtx.fillRect(rx + 16, ry + 18, 8, 8);
    introCtx.fillRect(rx + 40, ry + 18, 8, 8);
    const mouthH = introFrame % 12 < 6 ? 6 : 3;
    introCtx.fillRect(rx + 24, ry + 32, 16, mouthH);

    introCtx.fillStyle = '#475569';
    introCtx.fillRect(rx + 14, ry + 56, 36, 14);
    introCtx.fillStyle = '#38bdf8';
    introCtx.fillRect(rx + 22, ry + 72, 20, introFrame % 10 < 5 ? 8 : 4);

    requestAnimationFrame(renderIntroScene);
  }

  // =========================================================================
  // 5. ROSTO PIXELADO DO COMPUTADOR DE BORDO APOLLO
  // =========================================================================
  const apolloCanvas = document.getElementById('apollo-face');
  const apolloCtx = apolloCanvas.getContext('2d');
  apolloCtx.imageSmoothingEnabled = false;

  const APOLLO_FACES = {
    normal: [
      '................',
      '.......CC.......',
      '.......CC.......',
      '..MMMMMMMMMMMM..',
      '.MSSSSSSSSSSSSM.',
      '.MS..........SM.',
      '.MS..CC..CC..SM.',
      '.MS..CC..CC..SM.',
      '.MS..........SM.',
      '.MS..C....C..SM.',
      '.MS...CCCC...SM.',
      '.MSSSSSSSSSSSSM.',
      '..MMMMMMMMMMMM..',
      '....MMMMMMMM....',
      '................',
      '................'
    ],
    talking: [
      '................',
      '.......CC.......',
      '.......CC.......',
      '..MMMMMMMMMMMM..',
      '.MSSSSSSSSSSSSM.',
      '.MS..........SM.',
      '.MS..CC..CC..SM.',
      '.MS..CC..CC..SM.',
      '.MS..........SM.',
      '.MS...CCCC...SM.',
      '.MS...C..C...SM.',
      '.MSSSSSSSSSSSSM.',
      '..MMMMMMMMMMMM..',
      '....MMMMMMMM....',
      '................',
      '................'
    ],
    alert: [
      '................',
      '.......YY.......',
      '.......YY.......',
      '..MMMMMMMMMMMM..',
      '.MSSSSSSSSSSSSM.',
      '.MS.Y......Y.SM.',
      '.MS..YY..YY..SM.',
      '.MS..........SM.',
      '.MS..........SM.',
      '.MS..YYYYYY..SM.',
      '.MS..........SM.',
      '.MSSSSSSSSSSSSM.',
      '..MMMMMMMMMMMM..',
      '....MMMMMMMM....',
      '................',
      '................'
    ],
    critical: [
      '................',
      '.......RR.......',
      '.......RR.......',
      '..MMMMMMMMMMMM..',
      '.MSSSSSSSSSSSSM.',
      '.MS.R.R..R.R.SM.',
      '.MS..R....R..SM.',
      '.MS.R.R..R.R.SM.',
      '.MS..........SM.',
      '.MS...RRRR...SM.',
      '.MS..R....R..SM.',
      '.MSSSSSSSSSSSSM.',
      '..MMMMMMMMMMMM..',
      '....MMMMMMMM....',
      '................',
      '................'
    ]
  };

  const APOLLO_PALETTE = {
    M: '#94a3b8',
    S: '#060b14',
    C: '#22d3ee',
    Y: '#facc15',
    R: '#ef4444'
  };

  function getLowestResource() {
    return Math.min(state.resources.energy, state.resources.life, state.resources.shield);
  }

  function updateApolloStatusHeader() {
    const dict = I18N[state.lang];
    const minVal = getLowestResource();
    const statusEl = document.getElementById('apollo-status-line');

    if (minVal < 25) {
      statusEl.textContent = dict.statusCritical;
      statusEl.style.color = '#ef4444';
    } else if (minVal < 50) {
      statusEl.textContent = dict.statusAlert;
      statusEl.style.color = '#facc15';
    } else {
      statusEl.textContent = dict.statusNominal;
      statusEl.style.color = '#4ade80';
    }
  }

  function sayApollo(message) {
    document.getElementById('apollo-text').textContent = message;
    state.apolloTalkTicks = 55;
  }

  let globalTick = 0;
  function drawApolloFace() {
    globalTick++;
    const minVal = getLowestResource();
    let mood = 'normal';

    if (minVal < 25) {
      mood = 'critical';
    } else if (minVal < 50) {
      mood = 'alert';
    } else if (state.apolloTalkTicks > 0) {
      mood = globalTick % 14 < 7 ? 'talking' : 'normal';
    }

    if (state.apolloTalkTicks > 0) state.apolloTalkTicks--;

    const matrix = APOLLO_FACES[mood];
    const px = 4;

    apolloCtx.fillStyle = '#030712';
    apolloCtx.fillRect(0, 0, 64, 64);

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        const ch = matrix[r][c];
        if (ch !== '.' && APOLLO_PALETTE[ch]) {
          if (mood === 'critical' && ch === 'R' && globalTick % 20 < 8) {
            apolloCtx.fillStyle = '#fca5a5';
          } else {
            apolloCtx.fillStyle = APOLLO_PALETTE[ch];
          }
          apolloCtx.fillRect(c * px, r * px, px, px);
        }
      }
    }
  }

  // =========================================================================
  // 6. CENA 3: ESTAÇÃO ESPACIAL E MOVIMENTAÇÃO
  // =========================================================================
  const canvas = document.getElementById('station-canvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const PLAYER_PALETTE = {
    H: '#3b2314',
    S: '#f1c27d',
    E: '#0f172a',
    B: '#2563eb',
    L: '#93c5fd',
    W: '#f8fafc',
    G: '#fbbf24',
    P: '#94a3b8',
    D: '#1e293b'
  };

  const PLAYER_SPRITES = {
    female: [
      '...HHHHHH...',
      '..HHHHHHHH..',
      '.HHSSSSSSHH.',
      '.HSSESSSESH.',
      '.HSSSSSSSSHH',
      '..SSSSSSSS.H',
      '...BBBBBB...',
      '..BBLBBLBB..',
      '.BBBLLLLBBB.',
      '.S.BBBBBB.S.',
      '...DDDDDD...',
      '...BB..BB...',
      '...BB..BB...',
      '..DD....DD..'
    ],
    male: [
      '...HHHHHH...',
      '..HHHHHHHH..',
      '..SSSSSSSS..',
      '..SSESSSES..',
      '..SSSSSSSS..',
      '...SSSSSS...',
      '...BBBBBB...',
      '..BBLBBLBB..',
      '.BBBLLLLBBB.',
      '.S.BBBBBB.S.',
      '...DDDDDD...',
      '...BB..BB...',
      '...BB..BB...',
      '..DD....DD..'
    ],
    evaSuit: [
      '...WWWWWW...',
      '..WWWWWWWW..',
      '.PWWGGGGWW..',
      '.PWWGGGGWW..',
      '.PWWWWWWWW..',
      '..WWWWWWWW..',
      '.PWWWWWWWWW.',
      '.PWWLWWLWWW.',
      '.WWWWWWWWWW.',
      '.W.WWWWWW.W.',
      '...DDDDDD...',
      '...WW..WW...',
      '...WW..WW...',
      '..DD....DD..'
    ]
  };

  function setAllResources(stats) {
    ['energy', 'life', 'shield'].forEach((key) => {
      const clamped = Math.max(0, Math.min(100, Math.round(stats[key])));
      state.resources[key] = clamped;

      const box = document.getElementById(`res-${key}`);
      box.querySelector('.bar-fill').style.width = `${clamped}%`;
      box.querySelector('.bar-trail').style.width = `${clamped}%`;
      box.querySelector('.res-value').textContent = `${clamped}%`;
    });
    updateApolloStatusHeader();
  }

  function setMode(newMode) {
    state.mode = newMode;
    const dict = I18N[state.lang];
    document.getElementById('btn-toggle-suit').textContent =
      state.mode === 1 ? dict.btnSuitM1 : dict.btnSuitM2;
    document.getElementById('mission-subtitle').textContent =
      state.mode === 1 ? dict.subtitleM1 : dict.subtitleM2;
  }

  window.addEventListener('keydown', (e) => {
    if (state.screen !== 'station' || state.modalOpen) return;
    state.keys[e.key.toLowerCase()] = true;

    if (e.code === 'Space' && state.nearbyServer) {
      e.preventDefault();
      if (window.Simulation) {
        window.Simulation.openServerModal(state.nearbyServer.id);
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    state.keys[e.key.toLowerCase()] = false;
  });

  canvas.addEventListener('click', (e) => {
    if (state.screen !== 'station' || state.modalOpen) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Se clicou diretamente em um servidor e já está perto dele, abre o modal
    for (const srv of servers) {
      const clickDistToSrv = Math.hypot(clickX - srv.x, clickY - srv.y);
      const playerDistToSrv = Math.hypot(state.player.x - srv.x, state.player.y - (srv.y + 35));
      if (clickDistToSrv < 52 && playerDistToSrv < 78 && window.Simulation) {
        window.Simulation.openServerModal(srv.id);
        return;
      }
    }

    state.player.targetX = Math.max(60, Math.min(740, clickX));
    state.player.targetY = Math.max(220, Math.min(315, clickY));
  });

  function updateStation() {
    if (state.screen !== 'station' || state.modalOpen) return;

    const p = state.player;
    let dx = 0;
    let dy = 0;

    if (state.keys['arrowleft'] || state.keys['a']) dx -= 1;
    if (state.keys['arrowright'] || state.keys['d']) dx += 1;
    if (state.keys['arrowup'] || state.keys['w']) dy -= 1;
    if (state.keys['arrowdown'] || state.keys['s']) dy += 1;

    if (dx !== 0 || dy !== 0) {
      p.x += dx * p.speed;
      p.y += dy * p.speed;
      p.targetX = p.x;
      p.targetY = p.y;
    } else {
      const distX = p.targetX - p.x;
      const distY = p.targetY - p.y;
      const dist = Math.hypot(distX, distY);
      if (dist > 3) {
        dx = distX / dist;
        dy = distY / dist;
        p.x += dx * p.speed;
        p.y += dy * p.speed;
      }
    }

    p.x = Math.max(60, Math.min(740, p.x));
    p.y = Math.max(220, Math.min(315, p.y));

    if (dx < -0.1) p.facing = -1;
    if (dx > 0.1) p.facing = 1;

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      p.frameTimer++;
      if (p.frameTimer > 8) {
        p.walkFrame = p.walkFrame === 0 ? 1 : 0;
        p.frameTimer = 0;
      }
    } else {
      p.walkFrame = 0;
    }

    state.nearbyServer = null;
    for (const srv of servers) {
      const d = Math.hypot(p.x - srv.x, p.y - (srv.y + 35));
      if (d < 72) {
        state.nearbyServer = srv;
        break;
      }
    }
  }

  function drawStation() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, 210);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 145, canvas.width, 12);

    ctx.fillStyle = '#03060f';
    ctx.fillRect(220, 18, 360, 112);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.strokeRect(220, 18, 360, 112);

    ctx.fillStyle = '#ffffff';
    [
      [245, 38],
      [310, 32],
      [475, 45],
      [540, 30],
      [385, 52],
      [275, 65]
    ].forEach(([sx, sy]) => {
      ctx.fillRect(sx, sy, 3, 3);
    });

    ctx.fillStyle = state.mode === 1 ? '#64748b' : '#b45309';
    ctx.fillRect(222, 92, 356, 36);
    ctx.fillStyle = state.mode === 1 ? '#475569' : '#92400e';
    ctx.fillRect(250, 102, 42, 10);
    ctx.fillRect(460, 98, 56, 12);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 210, canvas.width, 140);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    for (let gx = 0; gx < canvas.width; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 210);
      ctx.lineTo(gx, 350);
      ctx.stroke();
    }
    for (let gy = 210; gy <= 350; gy += 35) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(canvas.width, gy);
      ctx.stroke();
    }

    const dict = I18N[state.lang];
    servers.forEach((srv) => {
      const val = state.resources[srv.resourceKey];
      const isNear = state.nearbyServer && state.nearbyServer.id === srv.id;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(srv.x - 34, srv.y - 46, 68, 72);
      ctx.strokeStyle = isNear ? '#facc15' : '#64748b';
      ctx.lineWidth = 3;
      ctx.strokeRect(srv.x - 34, srv.y - 46, 68, 72);

      ctx.fillStyle = val < 30 ? '#ef4444' : srv.color;
      ctx.fillRect(srv.x - 24, srv.y - 36, 48, 24);

      ctx.fillStyle = '#090d16';
      ctx.fillRect(srv.x - 20, srv.y - 30, 16, 4);
      ctx.fillRect(srv.x - 20, srv.y - 22, 28, 4);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(state.lang === 'en' ? srv.shortEn : srv.shortPt, srv.x, srv.y + 12);

      if (isNear) {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(srv.x - 42, srv.y - 72, 84, 20);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(srv.x - 42, srv.y - 72, 84, 20);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText(dict.interactPrompt, srv.x, srv.y - 58);
      }
    });

    const p = state.player;
    const matrix = state.mode === 2 ? PLAYER_SPRITES.evaSuit : PLAYER_SPRITES[state.gender];
    const scale = 3;
    const width = 12 * scale;
    const height = 14 * scale;

    ctx.save();
    ctx.translate(Math.round(p.x), Math.round(p.y - height));
    if (p.facing === -1) ctx.scale(-1, 1);

    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      const walkOffset = p.walkFrame === 1 && r >= 12 ? -3 : 0;
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch !== '.' && PLAYER_PALETTE[ch]) {
          ctx.fillStyle = PLAYER_PALETTE[ch];
          ctx.fillRect(c * scale - width / 2, r * scale + walkOffset, scale, scale);
        }
      }
    }
    ctx.restore();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state.commanderName, Math.round(p.x), Math.round(p.y - height - 10));
  }

  function mainLoop() {
    updateStation();
    drawStation();
    drawApolloFace();
    requestAnimationFrame(mainLoop);
  }

  // =========================================================================
  // 7. EVENTOS DE INTERFACE
  // =========================================================================
  document.getElementById('btn-intro-next').addEventListener('click', () => {
    const dict = I18N[state.lang];
    const fullText = dict.introSlides[state.introIndex];

    if (state.introCharIndex < fullText.length) {
      clearInterval(state.introTypingTimer);
      state.introCharIndex = fullText.length;
      document.getElementById('intro-text').textContent = fullText;
      return;
    }

    if (state.introIndex < dict.introSlides.length - 1) {
      startIntroSlide(state.introIndex + 1);
    } else {
      finishIntro();
    }
  });

  document.getElementById('btn-intro-skip').addEventListener('click', finishIntro);

  document.querySelectorAll('.gender-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gender-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.gender = btn.dataset.gender;
    });
  });

  document.getElementById('btn-start-station').addEventListener('click', () => {
    const inputName = document.getElementById('commander-name').value.trim();
    if (inputName) state.commanderName = inputName;

    transitionToScreen('setup-overlay', null, () => {
      state.screen = 'station';
      if (window.Simulation) {
        window.Simulation.startCampaign();
      }
    });
  });

  document.getElementById('btn-open-briefing').addEventListener('click', () => {
    if (window.Simulation) {
      window.Simulation.openBriefingModal(false);
    }
  });

  document.getElementById('btn-toggle-suit').addEventListener('click', () => {
    state.judgePassActive = state.mode === 1;
    const targetMode = state.judgePassActive ? 2 : 1;
    setMode(targetMode);

    if (window.Simulation) {
      window.Simulation.jumpToMode(targetMode, state.judgePassActive);
    }
  });

  function toggleLang() {
    applyLanguage(state.lang === 'en' ? 'pt' : 'en');
  }

  document.getElementById('btn-lang').addEventListener('click', toggleLang);
  document.getElementById('btn-lang-intro').addEventListener('click', toggleLang);

  // Ponte pública para o Simulation Engine (Etapa 3)
  window.GameBridge = {
    getLang: () => state.lang,
    getCommanderName: () => state.commanderName,
    getGender: () => state.gender,
    getResources: () => ({ ...state.resources }),
    setAllResources,
    setMode,
    setModalOpen: (isOpen) => {
      state.modalOpen = isOpen;
      state.keys = {};
    },
    sayApollo
  };

  applyLanguage('en');
  renderIntroScene();
  mainLoop();
})();