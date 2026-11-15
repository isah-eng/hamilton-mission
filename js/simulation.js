(() => {
  // =========================================================================
  // MOTOR DE SIMULAÇÃO, GRÁFICO DE TELEMETRIA NASA & CERTIFICADO (ETAPA 4)
  // =========================================================================
  const sim = {
    missions: [],
    currentMissionIndex: 0,
    turnIndex: 0,
    selectedLandingSite: 'jezero',
    phaseBaseStats: { energy: 70, life: 70, shield: 75 },
    pendingCascade: null,
    activeModal: null
  };

  const UI_STRINGS = {
    en: {
      turnWord: 'TURN',
      solWord: 'SOL',
      autonomousTag: '[EARTH SIGNAL DELAY: ~20 MIN // AUTONOMOUS MODE] ',
      nasaArchiveHeader: 'REAL NASA MISSION ARCHIVE',
      objectiveTitle: 'SHIFT OBJECTIVE & TRADE-OFF RULE',
      objectiveBody:
        'Both the NASA Space Hazard and your Protocol apply together each turn. Inspect all 3 servers before choosing—your bars carry over to the next phase, and hitting 0% restarts from Phase 01!',
      objectiveBodyMars:
        '20-MIN COMMUNICATION DELAY: Earth cannot send real-time advice, so APOLLO disables guided hints! Your objective: interpret the raw NASA sensor values yourself, compare all 3 servers, and survive 3 Sols without letting any bar hit 0%.',
      carriedStatsTitle: 'CARRIED-OVER RESERVES FROM PREVIOUS PHASE:',
      initialStatsTitle: 'INITIAL STATION RESERVES:',
      nasaSourceLabel: 'NASA TELEMETRY SOURCE',
      landingTitle: 'SELECT MARS LANDING ZONE (MODIFIES YOUR RESERVES)',
      startMissionBtn: 'LAUNCH SHIFT >>',
      resumeMissionBtn: 'RESUME COMMAND >>',
      serverHeader: {
        reactor: 'SERVER 01 // POWER REACTOR',
        greenhouse: 'SERVER 02 // BIO-DOME LIFE SUPPORT',
        console: 'SERVER 03 // DEFENSE & NASA TELEMETRY'
      },
      chartTitle: 'NASA SENSOR TELEMETRY CURVE (THIS PHASE)',
      envHazardTitle: '1. NASA SPACE HAZARD (APPLIES THIS TURN):',
      actionEffectTitle: '2. YOUR PROTOCOL TRADE-OFF (APPLIES THIS TURN):',
      netResultTitle: '3. PROJECTED BAR RESULT (CURRENT + HAZARD + PROTOCOL):',
      cascadePrefix: 'NEXT TURN CASCADE EFFECT:',
      executeBtn: 'EXECUTE PROTOCOL >>',
      walkOtherBtn: 'INSPECT OTHER SERVERS',
      gameOverTitle: 'STATION COLLAPSE // MISSION FAILED!',
      gameOverBody: (name, resName) =>
        `Commander ${name}, ${resName} dropped to 0% and life-critical systems shut down. In space engineering, reserves must be balanced across every phase—try again from Phase 01!`,
      restartGameBtn: '<< RESTART CAMPAIGN FROM PHASE 01',
      debriefTitle: 'SHIFT COMPLETED!',
      medalEarnedLabel: 'DECORATION EARNED',
      rankDistinction: 'GRADE: FLIGHT DIRECTOR DISTINCTION (ALL >= 40%)',
      rankStandard: 'GRADE: MISSION COMMANDER STANDARD',
      rankEmergency: 'GRADE: EMERGENCY SURVIVAL (BARELY INTACT < 20%)',
      rankShortDistinction: 'FLIGHT DIRECTOR DISTINCTION',
      rankShortStandard: 'MISSION COMMANDER STANDARD',
      rankShortEmergency: 'EMERGENCY SURVIVAL',
      citizenBtn: 'OPEN NASA CITIZEN SCIENCE >>',
      downloadCertBtn: 'DOWNLOAD OFFICIAL CERTIFICATE (PNG) >>',
      nextPhaseBtn: 'NEXT LUNAR PHASE (KEEP BARS) >>',
      unlockMarsBtn: 'UNLOCK MODE 2: MARS (KEEP BARS) >>',
      replayCampaignBtn: 'PLAY AGAIN FROM PHASE 01 >>',
      marsVictoryTitle: 'MARS EXPEDITION ACCOMPLISHED!',
      marsVictoryNote: (name) =>
        `Outstanding work, Commander ${name}! Download your official NASA Space Apps mission certificate below and continue exploring real space science.`,
      resLabels: {
        energy: 'ENERGY',
        life: 'LIFE SUPPORT',
        shield: 'SHIELD'
      },
      cascadeApplied: (reason, resName, delta) =>
        `[CASCADE APPLIED] ${reason} (${resName} ${delta > 0 ? '+' : ''}${delta}%). `
    },
    pt: {
      turnWord: 'TURNO',
      solWord: 'SOL',
      autonomousTag: '[ATRASO DE SINAL TERRA-MARTE: ~20 MIN // MODO AUTÔNOMO] ',
      nasaArchiveHeader: 'ARQUIVO REAL DE MISSÃO NASA',
      objectiveTitle: 'OBJETIVO DA FASE E REGRA DE TRADE-OFF',
      objectiveBody:
        'O Impacto Ambiental da NASA e o seu Protocolo são somados juntos a cada turno. Visite os 3 servidores antes de decidir—suas barras continuam na próxima fase e zerar qualquer barra reinicia o jogo da Fase 01!',
      objectiveBodyMars:
        'ATRASO DE COMUNICAÇÃO DE 20 MIN: A Terra não consegue enviar ajuda em tempo real, por isso o APOLLO desativa as dicas guiadas! Seu objetivo: interpretar os sensores brutos da NASA sozinho, comparar os 3 servidores e sobreviver a 3 Sóis sem zerar nenhuma barra.',
      carriedStatsTitle: 'RESERVAS HERDADAS DA FASE ANTERIOR:',
      initialStatsTitle: 'RESERVAS INICIAIS DA ESTAÇÃO:',
      nasaSourceLabel: 'FONTE DE TELEMETRIA NASA',
      landingTitle: 'ESCOLHA A ZONA DE POUSO EM MARTE (ALTERA SUAS RESERVAS)',
      startMissionBtn: 'INICIAR TURNO >>',
      resumeMissionBtn: 'VOLTAR AO COMANDO >>',
      serverHeader: {
        reactor: 'SERVIDOR 01 // REATOR DE ENERGIA',
        greenhouse: 'SERVIDOR 02 // BIO-ESTUFA (SUPORTE DE VIDA)',
        console: 'SERVIDOR 03 // DEFESA & TELEMETRIA NASA'
      },
      chartTitle: 'CURVA DE TELEMETRIA DOS SENSORES NASA (ESTA FASE)',
      envHazardTitle: '1. IMPACTO AMBIENTAL DA NASA (APLICA NESTE TURNO):',
      actionEffectTitle: '2. TRADE-OFF DO SEU PROTOCOLO (APLICA NESTE TURNO):',
      netResultTitle: '3. PREVISÃO FINAL DAS BARRAS (ATUAL + NASA + PROTOCOLO):',
      cascadePrefix: 'EFEITO DOMINÓ NO PRÓXIMO TURNO:',
      executeBtn: 'EXECUTAR PROTOCOLO >>',
      walkOtherBtn: 'VER OUTROS SERVIDORES',
      gameOverTitle: 'COLAPSO DA ESTAÇÃO // FIM DE JOGO!',
      gameOverBody: (name, resName) =>
        `Comandante ${name}, ${resName} chegou a 0% e os sistemas vitais desligaram. Na engenharia espacial, as reservas precisam ser equilibradas em todas as fases—tente novamente desde a Fase 01!`,
      restartGameBtn: '<< REINICIAR JOGO DESDE A FASE 01',
      debriefTitle: 'MISSÃO CONCLUÍDA!',
      medalEarnedLabel: 'CONDECORAÇÃO CONQUISTADA',
      rankDistinction: 'GRAU: DISTINÇÃO DE DIRETOR DE VOO (TUDO >= 40%)',
      rankStandard: 'GRAU: COMANDANTE DE MISSÃO PADRÃO',
      rankEmergency: 'GRAU: SOBREVIVÊNCIA DE EMERGÊNCIA (NO LIMITE < 20%)',
      rankShortDistinction: 'DISTINÇÃO DE DIRETOR DE VOO',
      rankShortStandard: 'COMANDANTE DE MISSÃO PADRÃO',
      rankShortEmergency: 'SOBREVIVÊNCIA DE EMERGÊNCIA',
      citizenBtn: 'ACESSAR CIÊNCIA CIDADÃ DA NASA >>',
      downloadCertBtn: 'BAIXAR CERTIFICADO OFICIAL (PNG) >>',
      nextPhaseBtn: 'PRÓXIMA FASE LUNAR (MANTER BARRAS) >>',
      unlockMarsBtn: 'LIBERAR MODO 2: MARTE (MANTER BARRAS) >>',
      replayCampaignBtn: 'JOGAR NOVAMENTE DESDE A FASE 01 >>',
      marsVictoryTitle: 'EXPEDIÇÃO MARTE CONCLUÍDA!',
      marsVictoryNote: (name) =>
        `Excelente comando, ${name}! Baixe abaixo seu certificado oficial da missão NASA Space Apps e continue explorando a ciência espacial.`,
      resLabels: {
        energy: 'ENERGIA',
        life: 'SUPORTE DE VIDA',
        shield: 'ESCUDO'
      },
      cascadeApplied: (reason, resName, delta) =>
        `[EFEITO DOMINÓ] ${reason} (${resName} ${delta > 0 ? '+' : ''}${delta}%). `
    }
  };

  function getMission() {
    return sim.missions[sim.currentMissionIndex] || null;
  }

  function getTurn() {
    const m = getMission();
    return m ? m.turns[sim.turnIndex] : null;
  }

  function formatDeltaPills(deltaObj, lang) {
    const labels = UI_STRINGS[lang].resLabels;
    const keys = ['energy', 'life', 'shield'];
    const html = keys
      .filter((k) => deltaObj[k] && deltaObj[k] !== 0)
      .map((k) => {
        const val = deltaObj[k];
        const cls = val > 0 ? 'pos' : 'neg';
        const sign = val > 0 ? '+' : '';
        return `<span class="stat-pill ${cls}">${labels[k]}: ${sign}${val}%</span>`;
      })
      .join('');

    return html || `<span class="stat-pill">0%</span>`;
  }

  function formatAbsolutePills(statsObj, lang) {
    const labels = UI_STRINGS[lang].resLabels;
    return ['energy', 'life', 'shield']
      .map((k) => {
        const val = Math.max(0, Math.min(100, Math.round(statsObj[k])));
        const cls = val < 30 ? 'neg' : 'pos';
        return `<span class="stat-pill ${cls}">${labels[k]}: ${val}%</span>`;
      })
      .join('');
  }

  function computeProjectedStats(currentStats, turn, action) {
    const projected = { ...currentStats };

    if (sim.pendingCascade) {
      projected[sim.pendingCascade.target] += sim.pendingCascade.delta;
    }

    ['energy', 'life', 'shield'].forEach((k) => {
      projected[k] += (turn.environmentDrain[k] || 0) + (action.immediate[k] || 0);
      projected[k] = Math.max(0, Math.min(100, Math.round(projected[k])));
    });

    return projected;
  }

  function formatProjectedPills(currentStats, projectedStats, lang) {
    const labels = UI_STRINGS[lang].resLabels;
    return ['energy', 'life', 'shield']
      .map((k) => {
        const before = currentStats[k];
        const after = projectedStats[k];
        const diff = after - before;
        const sign = diff > 0 ? '+' : '';
        const isDanger = after <= 20;
        const cls = isDanger ? 'neg' : diff >= 0 ? 'pos' : '';
        const alertTag = after === 0 ? ' [0% FAIL!]' : '';
        return `<span class="stat-pill ${cls}">${labels[k]}: ${before}% -> ${after}% (${sign}${diff}%)${alertTag}</span>`;
      })
      .join('');
  }

  function computeEffectiveMarsStats(mission) {
    const stats = { ...sim.phaseBaseStats };
    if (mission.mode === 2 && Array.isArray(mission.landingSites)) {
      const chosenSite = mission.landingSites.find((s) => s.id === sim.selectedLandingSite);
      if (chosenSite && chosenSite.statBonus) {
        stats.energy = Math.max(5, Math.min(100, stats.energy + (chosenSite.statBonus.energy || 0)));
        stats.life = Math.max(5, Math.min(100, stats.life + (chosenSite.statBonus.life || 0)));
        stats.shield = Math.max(5, Math.min(100, stats.shield + (chosenSite.statBonus.shield || 0)));
      }
    }
    return stats;
  }

  function syncTelemetryUI(prefixNote = '') {
    const mission = getMission();
    const turn = getTurn();
    if (!mission || !turn) return;

    const lang = window.GameBridge.getLang();
    const dict = UI_STRINGS[lang];
    const stepLabel = mission.mode === 2 ? dict.solWord : dict.turnWord;
    const unit = turn.nasaUnit || mission.nasaUnit;
    const sensorName = mission.telemetryLabel[lang].toUpperCase();

    document.getElementById('tele-phase-title').textContent =
      `${mission.title[lang]} // ${stepLabel} ${turn.turn}/${mission.turns.length}`;
    document.getElementById('tele-sensor-reading').textContent =
      `${sensorName}: ${turn.nasaValue} ${unit}`;

    const feedStatus = window.NasaService ? window.NasaService.getFeedStatus() : 'NASA ARCHIVE DATASET';
    const feedBadge = document.getElementById('tele-feed-badge');
    feedBadge.textContent = feedStatus;
    feedBadge.classList.toggle('live', feedStatus.includes('LIVE'));

    const modeTag = mission.mode === 2 ? dict.autonomousTag : '';
    window.GameBridge.sayApollo(`${prefixNote}${modeTag}${turn.nasaInsight[lang]} ${turn.apolloPrompt[lang]}`);
  }

  // =========================================================================
  // VISUALIZAÇÃO DE DADOS REAIS DA NASA EM CANVAS (GRÁFICO POR TURNO)
  // =========================================================================
  function renderNasaTelemetryChart(mission, currentTurnIdx, lang) {
    const chartCanvas = document.getElementById('nasa-telemetry-canvas');
    if (!chartCanvas || !mission) return;

    const c = chartCanvas.getContext('2d');
    c.imageSmoothingEnabled = false;
    const w = chartCanvas.width;
    const h = chartCanvas.height;

    c.fillStyle = '#03060f';
    c.fillRect(0, 0, w, h);

    // Linhas de grade horizontais
    c.strokeStyle = '#1e293b';
    c.lineWidth = 1;
    [22, 55, 88].forEach((gy) => {
      c.beginPath();
      c.moveTo(40, gy);
      c.lineTo(w - 30, gy);
      c.stroke();
    });

    const values = mission.turns.map((t) => Number(t.nasaValue) || 0);
    const maxVal = Math.max(...values, 1);
    const stepLabel = mission.mode === 2 ? 'SOL' : 'T';

    const points = mission.turns.map((t, idx) => {
      const px = 85 + idx * 185;
      const norm = (Number(t.nasaValue) || 0) / maxVal;
      const py = Math.round(86 - norm * 58);
      return {
        x: px,
        y: py,
        val: t.nasaValue,
        unit: t.nasaUnit || mission.nasaUnit,
        label: `${stepLabel} 0${t.turn}`
      };
    });

    // Linha conectando os 3 pontos de telemetria
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 3;
    c.beginPath();
    points.forEach((pt, idx) => {
      if (idx === 0) c.moveTo(pt.x, pt.y);
      else c.lineTo(pt.x, pt.y);
    });
    c.stroke();

    // Marcadores pixelados e rótulos de cada turno
    points.forEach((pt, idx) => {
      const isCurrent = idx === currentTurnIdx;
      const isPast = idx < currentTurnIdx;

      // Coluna guia vertical
      c.fillStyle = isCurrent ? 'rgba(250, 204, 21, 0.14)' : 'rgba(56, 189, 248, 0.05)';
      c.fillRect(pt.x - 28, 12, 56, 80);

      // Ponto quadrado pixel art
      c.fillStyle = isCurrent ? '#facc15' : isPast ? '#4ade80' : '#38bdf8';
      const boxSize = isCurrent ? 10 : 8;
      c.fillRect(pt.x - boxSize / 2, pt.y - boxSize / 2, boxSize, boxSize);

      // Valor numérico da NASA acima do ponto
      c.fillStyle = isCurrent ? '#facc15' : '#e2e8f0';
      c.font = '8px "Press Start 2P", monospace';
      c.textAlign = 'center';
      c.fillText(`${pt.val}`, pt.x, Math.max(12, pt.y - 10));

      // Rótulo do Turno/Sol no rodapé
      c.fillStyle = isCurrent ? '#facc15' : '#94a3b8';
      c.fillText(isCurrent ? `[${pt.label}]` : pt.label, pt.x, 104);
    });
  }

  // =========================================================================
  // GERADOR DE CERTIFICADO OFICIAL EM PNG (EXPEDIÇÃO MARTE)
  // =========================================================================
  function renderMarsCertificateCanvas(commanderName, gender, landingSiteId, finalStats, rankShort, feedStatus) {
    const certCanvas = document.getElementById('certificate-canvas');
    if (!certCanvas) return;

    const c = certCanvas.getContext('2d');
    c.imageSmoothingEnabled = false;
    const w = certCanvas.width;
    const h = certCanvas.height;

    // Fundo espacial profundo
    c.fillStyle = '#050811';
    c.fillRect(0, 0, w, h);

    // Moldura dupla estilo diploma RPG 16-bit
    c.strokeStyle = '#facc15';
    c.lineWidth = 6;
    c.strokeRect(10, 10, w - 20, h - 20);

    c.strokeStyle = '#38bdf8';
    c.lineWidth = 2;
    c.strokeRect(20, 20, w - 40, h - 40);

    // Estrelas decorativas
    c.fillStyle = '#bae6fd';
    [
      [42, 42],
      [630, 46],
      [58, 370],
      [620, 365],
      [560, 110],
      [115, 315]
    ].forEach(([sx, sy]) => c.fillRect(sx, sy, 3, 3));

    // Cabeçalho institucional
    c.fillStyle = '#1d4ed8';
    c.fillRect(150, 32, 380, 24);
    c.fillStyle = '#ffffff';
    c.font = '9px "Press Start 2P", monospace';
    c.textAlign = 'center';
    c.fillText('TEAM HAMILTON // NASA SPACE APPS CHALLENGE', w / 2, 48);

    // Título do certificado
    c.fillStyle = '#facc15';
    c.font = '13px "Press Start 2P", monospace';
    c.fillText('MARS COMMANDER CERTIFICATE', w / 2, 86);

    c.fillStyle = '#94a3b8';
    c.font = '8px "Press Start 2P", monospace';
    c.fillText('THIS CERTIFIES THAT', w / 2, 114);

    // Nome do(a) Comandante em destaque
    c.fillStyle = '#38bdf8';
    c.font = '18px "Press Start 2P", monospace';
    c.fillText(`CMDR. ${commanderName.toUpperCase()}`, w / 2, 146);

    // Linha divisória dourada
    c.fillStyle = '#facc15';
    c.fillRect(140, 158, 400, 2);

    // Descrição da conquista
    const zoneLabel =
      landingSiteId === 'elysium'
        ? 'ELYSIUM PLANITIA (4.50 N, 135.62 E)'
        : 'JEZERO CRATER (18.38 N, 77.58 E)';

    c.fillStyle = '#e2e8f0';
    c.font = '8px "Press Start 2P", monospace';
    c.fillText('SUCCESSFULLY COMPLETED THE LUNAR & MARS', w / 2, 184);
    c.fillText('TELEMETRY SURVIVAL CAMPAIGN AT:', w / 2, 200);

    c.fillStyle = '#fbbf24';
    c.fillText(zoneLabel, w / 2, 220);

    // Sprite pixelado do Comandante em Traje EVA à esquerda
    const evaMatrix = [
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
    ];
    const pal = {
      W: '#f8fafc',
      G: '#fbbf24',
      P: '#94a3b8',
      L: '#93c5fd',
      D: '#1e293b'
    };

    const sprScale = 5;
    const startX = 62;
    const startY = 236;
    for (let r = 0; r < evaMatrix.length; r++) {
      for (let col = 0; col < evaMatrix[r].length; col++) {
        const ch = evaMatrix[r][col];
        if (ch !== '.' && pal[ch]) {
          c.fillStyle = pal[ch];
          c.fillRect(startX + col * sprScale, startY + r * sprScale, sprScale, sprScale);
        }
      }
    }

    // Painel de telemetria final à direita do avatar
    c.fillStyle = '#0f172a';
    c.fillRect(155, 240, 455, 74);
    c.strokeStyle = '#4ade80';
    c.lineWidth = 2;
    c.strokeRect(155, 240, 455, 74);

    c.fillStyle = '#4ade80';
    c.font = '8px "Press Start 2P", monospace';
    c.textAlign = 'left';
    c.fillText(`RANK: ${rankShort}`, 170, 260);

    c.fillStyle = '#f8fafc';
    c.fillText(
      `FINAL RESERVES: EN ${finalStats.energy}% | LIFE ${finalStats.life}% | SHD ${finalStats.shield}%`,
      170,
      280
    );

    c.fillStyle = '#38bdf8';
    c.fillText(`DATA FEED: ${feedStatus}`, 170, 300);

    // Rodapé do diploma
    const todayStr = new Date().toISOString().split('T')[0];
    c.fillStyle = '#94a3b8';
    c.font = '7px "Press Start 2P", monospace';
    c.textAlign = 'center';
    c.fillText(
      `ISSUED BY APOLLO AGC ONBOARD SYSTEM // DATE: ${todayStr}`,
      w / 2,
      348
    );
    c.fillStyle = '#facc15';
    c.fillText(
      'CITIZEN SCIENCE READY: GLOBE OBSERVER | SUNGRAZER | AURORASAURUS | AI4MARS',
      w / 2,
      368
    );
  }

  function openModal(htmlContent, modalMeta) {
    sim.activeModal = modalMeta;
    const overlay = document.getElementById('game-modal-overlay');
    const card = document.getElementById('game-modal-card');
    card.innerHTML = htmlContent;
    overlay.classList.remove('hidden');
    window.GameBridge.setModalOpen(true);
  }

  function closeModal() {
    sim.activeModal = null;
    document.getElementById('game-modal-overlay').classList.add('hidden');
    window.GameBridge.setModalOpen(false);
  }

  // =========================================================================
  // MODAL 1: BRIEFING DA FASE
  // =========================================================================
  function openBriefingModal(isNewMissionStart = true, isCarriedOver = false) {
    const mission = getMission();
    if (!mission) return;

    const lang = window.GameBridge.getLang();
    const dict = UI_STRINGS[lang];

    const previewStats =
      isNewMissionStart
        ? mission.mode === 2
          ? computeEffectiveMarsStats(mission)
          : sim.phaseBaseStats
        : window.GameBridge.getResources();

    let landingHtml = '';
    if (mission.mode === 2 && isNewMissionStart && Array.isArray(mission.landingSites)) {
      const options = mission.landingSites
        .map((site) => {
          const isSelected = sim.selectedLandingSite === site.id ? 'selected' : '';
          return `
            <button type="button" class="landing-option ${isSelected}" data-site="${site.id}">
              <strong>${site.name[lang]}</strong>
              <span>${site.desc[lang]}</span>
            </button>
          `;
        })
        .join('');

      landingHtml = `
        <div class="nasa-source-box">
          <small>${dict.landingTitle}</small>
          <div class="landing-grid">${options}</div>
        </div>
      `;
    }

    const html = `
      <div class="modal-header">
        <h2>${mission.title[lang]}</h2>
        <span class="badge-nasa">MODE ${mission.mode}</span>
      </div>

      <div class="history-story-box">
        <small>${dict.nasaArchiveHeader}</small>
        <p>${mission.historyRef[lang]}</p>
      </div>

      <div class="objective-box">
        <small>${dict.objectiveTitle}</small>
        <p>${mission.mode === 2 ? dict.objectiveBodyMars : dict.objectiveBody}</p>
      </div>

      <div class="nasa-source-box">
        <small>${dict.nasaSourceLabel}</small>
        <p>${mission.source}</p>
      </div>

      ${landingHtml}

      <div class="nasa-source-box">
        <small>${isCarriedOver ? dict.carriedStatsTitle : dict.initialStatsTitle}</small>
        <div class="stat-pills" id="briefing-res-preview">${formatAbsolutePills(previewStats, lang)}</div>
      </div>

      <div class="modal-actions">
        <button id="btn-confirm-briefing" class="btn-pixel btn-primary">
          ${isNewMissionStart ? dict.startMissionBtn : dict.resumeMissionBtn}
        </button>
      </div>
    `;

    openModal(html, { type: 'briefing', isNewMissionStart, isCarriedOver });

    document.querySelectorAll('.landing-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.AudioEngine) window.AudioEngine.playClick();
        document.querySelectorAll('.landing-option').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        sim.selectedLandingSite = btn.dataset.site;

        const updatedPreview = computeEffectiveMarsStats(mission);
        const previewContainer = document.getElementById('briefing-res-preview');
        if (previewContainer) {
          previewContainer.innerHTML = formatAbsolutePills(updatedPreview, lang);
        }
      });
    });

    document.getElementById('btn-confirm-briefing').addEventListener('click', () => {
      if (window.AudioEngine) window.AudioEngine.playClick();
      if (isNewMissionStart) {
        const finalStartStats =
          mission.mode === 2 ? computeEffectiveMarsStats(mission) : { ...sim.phaseBaseStats };
        window.GameBridge.setAllResources(finalStartStats);
      }
      closeModal();
      syncTelemetryUI();
    });
  }

  // =========================================================================
  // MODAL 2: INTERAÇÃO COM SERVIDOR + GRÁFICO NASA + PREVISÃO LÍQUIDA
  // =========================================================================
  function openServerModal(serverId) {
    const mission = getMission();
    const turn = getTurn();
    if (!mission || !turn) return;

    if (window.AudioEngine) window.AudioEngine.playOpen();

    const lang = window.GameBridge.getLang();
    const dict = UI_STRINGS[lang];
    const action = turn.actions.find((a) => a.server === serverId);
    if (!action) return;

    const currentStats = window.GameBridge.getResources();
    const projectedStats = computeProjectedStats(currentStats, turn, action);
    const unit = turn.nasaUnit || mission.nasaUnit;

    const cascadeHtml = action.cascade
      ? `<div class="cascade-warning">
          <strong>${dict.cascadePrefix}</strong>
          ${action.cascade.reason[lang]}
          (${dict.resLabels[action.cascade.target]} ${action.cascade.delta > 0 ? '+' : ''}${action.cascade.delta}%)
        </div>`
      : '';

    const html = `
      <div class="modal-header">
        <h2>${dict.serverHeader[serverId]}</h2>
        <span class="badge-nasa">${mission.mode === 2 ? dict.solWord : dict.turnWord} ${turn.turn}/3</span>
      </div>

      <div class="telemetry-chart-box">
        <div class="telemetry-chart-header">
          <small>${dict.chartTitle}</small>
          <small style="color: #facc15;">${mission.telemetryLabel[lang].toUpperCase()} (${unit})</small>
        </div>
        <canvas id="nasa-telemetry-canvas" width="540" height="114"></canvas>
      </div>

      <div class="drain-preview">
        <div class="drain-preview-title">${dict.envHazardTitle}</div>
        <div class="stat-pills">${formatDeltaPills(turn.environmentDrain, lang)}</div>
      </div>

      <div class="action-panel">
        <h3>${action.title[lang]}</h3>
        <p class="modal-body-text">${action.desc[lang]}</p>
        <div class="drain-preview-title">${dict.actionEffectTitle}</div>
        <div class="stat-pills">${formatDeltaPills(action.immediate, lang)}</div>
        ${cascadeHtml}
      </div>

      <div class="result-preview">
        <div class="result-preview-title">${dict.netResultTitle}</div>
        <div class="stat-pills">${formatProjectedPills(currentStats, projectedStats, lang)}</div>
      </div>

      <div class="modal-actions">
        <button id="btn-close-server" class="btn-pixel btn-secondary">${dict.walkOtherBtn}</button>
        <button id="btn-exec-action" class="btn-pixel btn-primary">${dict.executeBtn}</button>
      </div>
    `;

    openModal(html, { type: 'server', serverId });
    renderNasaTelemetryChart(mission, sim.turnIndex, lang);

    document.getElementById('btn-close-server').addEventListener('click', () => {
      if (window.AudioEngine) window.AudioEngine.playClick();
      closeModal();
    });
    document.getElementById('btn-exec-action').addEventListener('click', () => {
      executeTurnDecision(action);
    });
  }

  // =========================================================================
  // LÓGICA DE RESOLUÇÃO DO TURNO
  // =========================================================================
  function executeTurnDecision(action) {
    const mission = getMission();
    const turn = getTurn();
    const lang = window.GameBridge.getLang();
    const dict = UI_STRINGS[lang];

    const currentStats = window.GameBridge.getResources();
    const nextStats = { ...currentStats };
    let cascadeNote = '';

    if (sim.pendingCascade) {
      const target = sim.pendingCascade.target;
      const delta = sim.pendingCascade.delta;
      nextStats[target] += delta;
      cascadeNote = dict.cascadeApplied(
        sim.pendingCascade.reason[lang],
        dict.resLabels[target],
        delta
      );
    }

    nextStats.energy += turn.environmentDrain.energy || 0;
    nextStats.life += turn.environmentDrain.life || 0;
    nextStats.shield += turn.environmentDrain.shield || 0;

    nextStats.energy += action.immediate.energy || 0;
    nextStats.life += action.immediate.life || 0;
    nextStats.shield += action.immediate.shield || 0;

    sim.pendingCascade = action.cascade ? { ...action.cascade } : null;

    window.GameBridge.setAllResources(nextStats);
    closeModal();

    const updatedStats = window.GameBridge.getResources();
    const failedKey = ['energy', 'life', 'shield'].find((k) => updatedStats[k] <= 0);

    if (failedKey) {
      if (window.AudioEngine) window.AudioEngine.playGameOver();
      openGameOverModal(failedKey);
      return;
    }

    const lowestNow = Math.min(updatedStats.energy, updatedStats.life, updatedStats.shield);
    if (lowestNow < 25) {
      if (window.AudioEngine) window.AudioEngine.playAlert();
    } else {
      if (window.AudioEngine) window.AudioEngine.playExecute();
    }

    if (sim.turnIndex < mission.turns.length - 1) {
      sim.turnIndex++;
      syncTelemetryUI(cascadeNote);
    } else {
      if (window.AudioEngine) window.AudioEngine.playVictory();
      openDebriefModal();
    }
  }

  // =========================================================================
  // MODAL 3: GAME OVER -> REINICIAR O JOGO DESDE A FASE 01
  // =========================================================================
  function openGameOverModal(failedKey) {
    const lang = window.GameBridge.getLang();
    const dict = UI_STRINGS[lang];
    const commander = window.GameBridge.getCommanderName();
    const resName = dict.resLabels[failedKey];

    const html = `
      <div class="modal-header">
        <h2 style="color: #ef4444;">${dict.gameOverTitle}</h2>
        <span class="badge-nasa">SYSTEM OFFLINE</span>
      </div>
      <p class="modal-body-text">${dict.gameOverBody(commander, resName)}</p>
      <div class="modal-actions">
        <button id="btn-restart-campaign" class="btn-pixel btn-primary">${dict.restartGameBtn}</button>
      </div>
    `;

    openModal(html, { type: 'gameover', failedKey });

    document.getElementById('btn-restart-campaign').addEventListener('click', () => {
      if (window.AudioEngine) window.AudioEngine.playClick();
      loadMissionByIndex(0, { useFade: true, preserveStats: false });
    });
  }

  // =========================================================================
  // MODAL 4: FIM DE FASE, MEDALHA, CERTIFICADO PNG & CIÊNCIA CIDADÃ
  // =========================================================================
  function evaluateCommandRank(stats, lang) {
    const dict = UI_STRINGS[lang];
    const minStat = Math.min(stats.energy, stats.life, stats.shield);

    if (minStat >= 40) {
      return {
        label: dict.rankDistinction,
        shortEn: UI_STRINGS.en.rankShortDistinction,
        cssClass: 'distinction'
      };
    }
    if (minStat < 20) {
      return {
        label: dict.rankEmergency,
        shortEn: UI_STRINGS.en.rankShortEmergency,
        cssClass: 'emergency'
      };
    }
    return {
      label: dict.rankStandard,
      shortEn: UI_STRINGS.en.rankShortStandard,
      cssClass: ''
    };
  }

  function openDebriefModal() {
    const mission = getMission();
    const lang = window.GameBridge.getLang();
    const dict = UI_STRINGS[lang];
    const commander = window.GameBridge.getCommanderName();
    const gender = window.GameBridge.getGender();
    const finalStats = window.GameBridge.getResources();
    const rank = evaluateCommandRank(finalStats, lang);

    const isFinalMars = mission.mode === 2;
    const isLastLunar = mission.mode === 1 && sim.currentMissionIndex === 2;

    const nextBtnLabel = isFinalMars
      ? dict.replayCampaignBtn
      : isLastLunar
      ? dict.unlockMarsBtn
      : dict.nextPhaseBtn;

    const certificateBlock = isFinalMars
      ? `
        <p class="modal-body-text">${dict.marsVictoryNote(commander)}</p>
        <div class="cert-preview-box">
          <canvas id="certificate-canvas" width="680" height="390"></canvas>
          <button id="btn-download-cert" class="btn-pixel btn-primary">
            ${dict.downloadCertBtn}
          </button>
        </div>
      `
      : '';

    const html = `
      <div class="modal-header">
        <h2>${isFinalMars ? dict.marsVictoryTitle : dict.debriefTitle}</h2>
        <span class="badge-nasa">${mission.title[lang]}</span>
      </div>

      <div class="medal-banner">
        <span>${dict.medalEarnedLabel}</span>
        <strong>${mission.medal[lang]}</strong>
        <div><span class="rank-badge ${rank.cssClass}">${rank.label}</span></div>
        <div class="stat-pills" style="justify-content: center; margin-top: 10px;">
          <span class="stat-pill">${dict.resLabels.energy}: ${finalStats.energy}%</span>
          <span class="stat-pill">${dict.resLabels.life}: ${finalStats.life}%</span>
          <span class="stat-pill">${dict.resLabels.shield}: ${finalStats.shield}%</span>
        </div>
      </div>

      ${certificateBlock}

      <div class="citizen-card">
        <strong>${mission.citizenScience.project}</strong>
        <p>${mission.citizenScience.pitch[lang]}</p>
        <a href="${mission.citizenScience.url}" target="_blank" rel="noopener noreferrer" class="btn-pixel btn-small" style="align-self: flex-start; text-decoration: none;">
          ${dict.citizenBtn}
        </a>
      </div>

      <div class="modal-actions">
        <button id="btn-next-mission" class="btn-pixel btn-primary">${nextBtnLabel}</button>
      </div>
    `;

    openModal(html, { type: 'debrief' });

    if (isFinalMars) {
      const feedStatus = window.NasaService ? window.NasaService.getFeedStatus() : 'NASA ARCHIVE DATASET';
      renderMarsCertificateCanvas(
        commander,
        gender,
        sim.selectedLandingSite,
        finalStats,
        rank.shortEn,
        feedStatus
      );

      document.getElementById('btn-download-cert').addEventListener('click', () => {
        if (window.AudioEngine) window.AudioEngine.playExecute();
        const certCanvas = document.getElementById('certificate-canvas');
        if (!certCanvas) return;

        const safeName = commander.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Commander';
        const link = document.createElement('a');
        link.download = `Hamiltons_Mission_Certificate_${safeName}.png`;
        link.href = certCanvas.toDataURL('image/png');
        link.click();
      });
    }

    document.getElementById('btn-next-mission').addEventListener('click', () => {
      if (window.AudioEngine) window.AudioEngine.playClick();
      if (isFinalMars) {
        loadMissionByIndex(0, { useFade: true, preserveStats: false });
      } else {
        loadMissionByIndex(sim.currentMissionIndex + 1, { useFade: true, preserveStats: true });
      }
    });
  }

  // =========================================================================
  // NAVEGAÇÃO ENTRE FASES COM FADE-TO-BLACK E ACÚMULO DE RECURSOS
  // =========================================================================
  function loadMissionByIndex(index, options = {}) {
    if (!sim.missions.length) return;
    const { useFade = true, preserveStats = false } = options;
    const carriedStats = preserveStats ? window.GameBridge.getResources() : null;

    const applyMissionSetup = () => {
      closeModal();
      sim.currentMissionIndex = Math.max(0, Math.min(sim.missions.length - 1, index));
      sim.turnIndex = 0;
      sim.pendingCascade = null;

      const mission = getMission();
      window.GameBridge.setMode(mission.mode);
      window.GameBridge.resetPlayerPosition();

      sim.phaseBaseStats = preserveStats ? { ...carriedStats } : { ...mission.initialStats };
      window.GameBridge.setAllResources(sim.phaseBaseStats);

      openBriefingModal(true, preserveStats);
    };

    if (useFade && window.GameBridge.fadeTransition) {
      window.GameBridge.fadeTransition(applyMissionSetup);
    } else {
      applyMissionSetup();
    }
  }

  function jumpToMode(targetMode, isJudgePass) {
    if (!sim.missions.length) return;
    const targetIdx =
      targetMode === 2
        ? sim.missions.findIndex((m) => m.mode === 2)
        : 0;

    if (targetIdx !== -1) {
      loadMissionByIndex(targetIdx, { useFade: true, preserveStats: false });
      if (isJudgePass) {
        setTimeout(() => {
          const lang = window.GameBridge.getLang();
          window.GameBridge.sayApollo(
            lang === 'en'
              ? 'JUDGE PASS active: Mode 2 (Mars) unlocked early and EVA Space Suit equipped!'
              : 'PASSE DE JUIZ ativo: Modo 2 (Marte) liberado e Traje Espacial EVA equipado!'
          );
        }, 500);
      }
    }
  }

  function startCampaign() {
    if (window.NasaService && window.NasaService.getState().ready) {
      sim.missions = window.NasaService.getState().missions;
      loadMissionByIndex(0, { useFade: false, preserveStats: false });
    }
  }

  window.addEventListener('nasaDataReady', () => {
    if (window.NasaService) {
      sim.missions = window.NasaService.getState().missions;
    }
  });

  if (window.NasaService && window.NasaService.getState().ready) {
    sim.missions = window.NasaService.getState().missions;
  }

  window.Simulation = {
    startCampaign,
    openBriefingModal,
    openServerModal,
    jumpToMode,
    onLanguageChange: () => {
      syncTelemetryUI();
      if (!sim.activeModal) return;
      if (sim.activeModal.type === 'briefing') {
        openBriefingModal(sim.activeModal.isNewMissionStart, sim.activeModal.isCarriedOver);
      } else if (sim.activeModal.type === 'server') {
        openServerModal(sim.activeModal.serverId);
      } else if (sim.activeModal.type === 'gameover') {
        openGameOverModal(sim.activeModal.failedKey);
      } else if (sim.activeModal.type === 'debrief') {
        openDebriefModal();
      }
    }
  };
})();