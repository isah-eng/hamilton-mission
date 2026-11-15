(() => {
  // =========================================================================
  // MOTOR DE SIMULAÇÃO & SISTEMAS ACOPLADOS
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
      citizenBtn: 'OPEN NASA CITIZEN SCIENCE >>',
      nextPhaseBtn: 'NEXT LUNAR PHASE (KEEP BARS) >>',
      unlockMarsBtn: 'UNLOCK MODE 2: MARS (KEEP BARS) >>',
      replayCampaignBtn: 'PLAY AGAIN FROM PHASE 01 >>',
      marsVictoryTitle: 'MARS EXPEDITION ACCOMPLISHED!',
      marsVictoryNote: (name) =>
        `Outstanding work, Commander ${name}! You survived Martian dust storms and solar radiation using real NASA telemetry. (Downloadable Certificate coming in Stage 4!)`,
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
      citizenBtn: 'ACESSAR CIÊNCIA CIDADÃ DA NASA >>',
      nextPhaseBtn: 'PRÓXIMA FASE LUNAR (MANTER BARRAS) >>',
      unlockMarsBtn: 'LIBERAR MODO 2: MARTE (MANTER BARRAS) >>',
      replayCampaignBtn: 'JOGAR NOVAMENTE DESDE A FASE 01 >>',
      marsVictoryTitle: 'EXPEDIÇÃO MARTE CONCLUÍDA!',
      marsVictoryNote: (name) =>
        `Excelente comando, ${name}! Você superou tempestades de poeira e radiação solar usando dados reais da NASA. (Certificado baixável entra na Etapa 4!)`,
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

  // Calcula exatamente como ficarão as 3 barras se o jogador executar esta ação
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
  // MODAL 1: BRIEFING DA FASE (HISTÓRIA REAL DA NASA + OBJETIVOS + RESERVAS)
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
  // MODAL 2: INTERAÇÃO COM SERVIDOR + PREVISÃO LÍQUIDA ANTES -> DEPOIS
  // =========================================================================
  function openServerModal(serverId) {
    const mission = getMission();
    const turn = getTurn();
    if (!mission || !turn) return;

    const lang = window.GameBridge.getLang();
    const dict = UI_STRINGS[lang];
    const action = turn.actions.find((a) => a.server === serverId);
    if (!action) return;

    const currentStats = window.GameBridge.getResources();
    const projectedStats = computeProjectedStats(currentStats, turn, action);

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

    document.getElementById('btn-close-server').addEventListener('click', closeModal);
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

    // 1. Efeito dominó herdado do turno anterior
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

    // 2. Drenagem ambiental real da NASA neste turno
    nextStats.energy += turn.environmentDrain.energy || 0;
    nextStats.life += turn.environmentDrain.life || 0;
    nextStats.shield += turn.environmentDrain.shield || 0;

    // 3. Impacto imediato do protocolo escolhido
    nextStats.energy += action.immediate.energy || 0;
    nextStats.life += action.immediate.life || 0;
    nextStats.shield += action.immediate.shield || 0;

    // 4. Registra cascata para o próximo turno
    sim.pendingCascade = action.cascade ? { ...action.cascade } : null;

    window.GameBridge.setAllResources(nextStats);
    closeModal();

    const updatedStats = window.GameBridge.getResources();
    const failedKey = ['energy', 'life', 'shield'].find((k) => updatedStats[k] <= 0);

    if (failedKey) {
      openGameOverModal(failedKey);
      return;
    }

    if (sim.turnIndex < mission.turns.length - 1) {
      sim.turnIndex++;
      syncTelemetryUI(cascadeNote);
    } else {
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
      loadMissionByIndex(0, { useFade: true, preserveStats: false });
    });
  }

  // =========================================================================
  // MODAL 4: FIM DE FASE, CLASSIFICAÇÃO DE DESEMPENHO & CIÊNCIA CIDADÃ
  // =========================================================================
  function evaluateCommandRank(stats, lang) {
    const dict = UI_STRINGS[lang];
    const minStat = Math.min(stats.energy, stats.life, stats.shield);

    if (minStat >= 40) {
      return { label: dict.rankDistinction, cssClass: 'distinction' };
    }
    if (minStat < 20) {
      return { label: dict.rankEmergency, cssClass: 'emergency' };
    }
    return { label: dict.rankStandard, cssClass: '' };
  }

  function openDebriefModal() {
    const mission = getMission();
    const lang = window.GameBridge.getLang();
    const dict = UI_STRINGS[lang];
    const commander = window.GameBridge.getCommanderName();
    const finalStats = window.GameBridge.getResources();
    const rank = evaluateCommandRank(finalStats, lang);

    const isFinalMars = mission.mode === 2;
    const isLastLunar = mission.mode === 1 && sim.currentMissionIndex === 2;

    const nextBtnLabel = isFinalMars
      ? dict.replayCampaignBtn
      : isLastLunar
      ? dict.unlockMarsBtn
      : dict.nextPhaseBtn;

    const victoryExtra = isFinalMars
      ? `<p class="modal-body-text">${dict.marsVictoryNote(commander)}</p>`
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

      ${victoryExtra}

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

    document.getElementById('btn-next-mission').addEventListener('click', () => {
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