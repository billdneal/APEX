// ============================================================================
// APEX TRAINING ENGINE - PART 3 OF 4: CONTROLLER ACTIONS & RUNTIME ENGINE
// Complete Production Release v4.6.5-PWA (Wizard & 1RM Engine Controllers)
// Includes: Full Integration with Part 2 31-Scheme Mathematical Periodization Engine,
//           Block Transition Wizard (openBlockWizard, commitBlockWizard),
//           Multi-Formula 1RM Selection Controller (setOneRmFormula),
//           Programming Builder Controllers (Save Changes, Recipe Updates, JSON I/O),
//           Strict 0.5 RPE Quantization Across All Inputs & Controllers,
//           Anticipated Workout Date Routing into BuildSets (opts.dateKey),
//           Universal Grounding Set (@9.0) & Skip Back-off Set Controllers,
//           Historical BW e1RM Tie-In & Calisthenics Load Summation,
//           Decoupled Readiness, Sparse BW Quick-Save, PR Ledger Controllers,
//           Dual-Bound Phase Rep Matrix & Lift Override Controllers,
//           Mid-Workout In-Flight Set Protection, Full Data Management Suite
// ============================================================================

(function() {
  const state = window.state || {};
  const core = window.apexCore || {};
  const extendRpeMatrix = window.extendRpeMatrix;
  const DEFAULT_HIGH_CAPACITY_BASE = window.DEFAULT_HIGH_CAPACITY_BASE || {};
const getE1RM = window.getE1RM || function() { return 0; };
const DEFAULT_SCHEME_BLUEPRINTS = window.DEFAULT_SCHEME_BLUEPRINTS || {};

  // State initialization safeguards
  if (!state.anchorE1rms) state.anchorE1rms = {};
  if (!state.settings) state.settings = {};
  if (!state.settings.e1rmBlending) state.settings.e1rmBlending = 'moderate';
  if (!state.schemeBlueprints) {
    state.schemeBlueprints = JSON.parse(JSON.stringify(state.schemeRecipes || DEFAULT_SCHEME_BLUEPRINTS));}
  if (!state.settings.oneRmFormula) state.settings.oneRmFormula = 'apex';
  if (!state.schemeRecipes) state.schemeRecipes = JSON.parse(JSON.stringify(core.defaultSchemeRecipes || {}));
  if (!state.activeRecipeScheme) state.activeRecipeScheme = 'Reverse Pyramid';
  if (!state.wizardModal) state.wizardModal = { open: false, data: null };
  if (!state.stagingContext) state.stagingContext = { mode: 'plan', phaseOverride: null, splitOverride: null, isDetour: false };
  if (state.activeWorkoutContext === undefined) state.activeWorkoutContext = null;
if (!state.rpeProfiles) {
  state.rpeProfiles = {
    high_capacity: {
      id: 'high_capacity',
      name: 'High Capacity',
      matrix: extendRpeMatrix(DEFAULT_HIGH_CAPACITY_BASE, 50)
    }
  };
}
if (!state.activeRpeProfileId) state.activeRpeProfileId = 'high_capacity';
if (!state.editingRpeProfile) {
  state.editingRpeProfile = JSON.parse(JSON.stringify(state.rpeProfiles[state.activeRpeProfileId]));
}
  const { 
    roundRpe = (v) => {
      const num = Number(v);
      if (isNaN(num) || num < 5.0) return 5.5;
      const clamped = Math.min(10.0, Math.max(5.5, num));
      return Math.round(clamped * 2) / 2;
    },
    roundLoad = (v) => Math.round(Number(v) / 5) * 5,
    getPct = (r, rpe, f) => Math.max(40, Math.round((100 - (r - 1 + (10 - rpe)) * 2.15) * 10) / 10),
    calcLoad = (e1, p) => roundLoad(Number(e1) * (Number(p) / 100)),
    fmtTime = (sec) => {
      const s = Math.max(0, Math.floor(Number(sec) || 0));
      return `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;
    },
    getCurKey = () => '',
    getCurLog = () => ({}),
    getDayFocus = () => 'Rest & Recovery',
    generateBlueprint = () => [],
    getLiftHistory = () => [],
    showToast = (msg) => console.log(msg),
    getExMeta = () => ({ w: true, r: true, t: false, rpe: true }),
    getLatestBodyweight = () => 196.2,
    getReadinessScore = () => 80,
    getReadinessBand = () => ({ name: 'Optimal', badge: '', desc: '', factor: 1.0, rpeCap: 10, setReduction: 0 }),
    getRollingReadiness = () => 80,
    getMesocyclePosition = () => ({ blockIdx: 0, week: 1, phase: 'Hypertrophy', block: { phase: 'Hypertrophy', weeks: 3 } }),
    syncMesocycleProgression = () => {},
    sanitizeModifiers = (m) => Array.isArray(m) ? m : [],
    getVariantKey = (ex, m) => ex,
    requestWakeLock = () => {},
    releaseWakeLock = () => {},
    normalizeRepBookends = (val, fbMin = 6, fbMax = 8) => {
      if (!val && val !== 0) return { min: fbMin, max: fbMax };
      if (typeof val === 'number') return { min: val, max: val };
      if (typeof val === 'object') {
        const min = Number(val.min !== undefined ? val.min : fbMin) || fbMin;
        const max = Number(val.max !== undefined ? val.max : min) || min;
        return { min: Math.min(min, max), max: Math.max(min, max) };
      }
      if (typeof val === 'string') {
        const parts = val.split(/[-–—]/).map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
        if (parts.length === 1) return { min: parts[0], max: parts[0] };
        if (parts.length >= 2) return { min: Math.min(parts[0], parts[1]), max: Math.max(parts[0], parts[1]) };
      }
      return { min: fbMin, max: fbMax };
    },
    monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'],
    programPresets = [],
    formatIsoDate = (y, m, d) => `${y}-${String(Number(m)+1).padStart(2,'0')}-${String(Number(d)).padStart(2,'0')}`,
    normalizeDateKey = (k) => k,
    normalizeSchemeName = (s) => s,
    analyzeBlockTransition = () => null
  } = core;

  const persist = window.persist || function() {};

  function safeRender() {
    if (typeof window.render === 'function') {
      window.render();
    }
  }

  function triggerCloudSync(delayMs = 2500) {
    if (typeof window.queueCloudSync === 'function') {
      window.queueCloudSync(delayMs);
    }
  }

  function triggerHaptic(duration = 40) {
    try {
      if (navigator.vibrate) navigator.vibrate(duration);
    } catch(e) {}
  }

  function playAudioBeep(freq = 880, duration = 0.15) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      }
    } catch(e) {}
  }

  // Resolves the Block-Locked Anchor e1RM for Prescriptions
  function getBaseAnchorE1rm(exName, cleanMods = []) {
    const vKey = getVariantKey(exName, cleanMods);
    if (state.anchorE1rms && state.anchorE1rms[vKey] !== undefined) {
      return state.anchorE1rms[vKey];
    }
    if (cleanMods.length && state.e1rms && state.e1rms[vKey] !== undefined) {
      return state.e1rms[vKey];
    }
    if (state.anchorE1rms && state.anchorE1rms[exName] !== undefined) {
      return state.anchorE1rms[exName];
    }
    return (state.e1rms && state.e1rms[exName]) ? state.e1rms[exName] : 135;
  }
  core.getBaseAnchorE1rm = getBaseAnchorE1rm;
  window.apexCore.getBaseAnchorE1rm = getBaseAnchorE1rm;

  // Biomechanical Load Resolver (BW + External Load for Calisthenics)
  function getExerciseLoad(exName, inputWeight = 0, targetDateKey = null) {
  const name = String(exName || '').trim();
  const lower = name.toLowerCase();
  const meta = getExMeta(name);
  const bw = getLatestBodyweight(targetDateKey);
  const w = Number(inputWeight) || 0;

  if (lower.includes('pull up') || lower.includes('pull-up') || lower.includes('chin up') || lower.includes('chin-up')) {
    return Math.round(bw * 1.0) + w;
  }
  if (lower === 'dips' || lower.startsWith('dips ') || lower.includes('bw dips') || lower.includes('weighted dips') || lower.includes('dip +') || lower.includes('dips +')) {
    return Math.round(bw * 0.90) + w;
  }
  if (lower.includes('push up') || lower.includes('push-up')) {
    return Math.round(bw * 0.65) + w;
  }
  if (lower.includes('ab wheel') || lower.includes('hanging leg raise')) {
    return Math.round(bw * 0.50) + w;
  }
  if (!meta.w && meta.r) {
    return Math.round(bw * 0.70) + w;
  }
  return w;
}
  core.getExerciseLoad = getExerciseLoad;
  window.apexCore.getExerciseLoad = getExerciseLoad;

  // e1RM Blending Calculator (Conservative 20% / Moderate 40% / Aggressive 60%)
  function blendE1rmValues(priorAnchor, testedValue, sensitivity = 'moderate') {
    const prior = Number(priorAnchor) || 135;
    const tested = Number(testedValue) || prior;
    const alphaMap = { conservative: 0.20, moderate: 0.40, aggressive: 0.60 };
    const alpha = alphaMap[sensitivity] || 0.40;

    if (tested < prior) {
      const rawBlended = (alpha * tested) + ((1 - alpha) * prior);
      const floorValue = prior * 0.975;
      return roundLoad(Math.max(floorValue, rawBlended));
    }
    return roundLoad((alpha * tested) + ((1 - alpha) * prior));
  }
  core.blendE1rmValues = blendE1rmValues;
  window.apexCore.blendE1rmValues = blendE1rmValues;

// ============================================================================
// Unified Multi-Engine e1RM Calculator
// Evaluates performance across APEX (RPE/RIR), Epley, Brzycki, Wathan, & Lombardi
// Incorporates biomechanical bodyweight factoring via getExerciseLoad
// ============================================================================
function getUnifiedE1RM(weight, reps, rpe = 10, exName = '', targetDateKey = null) {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  if (r <= 0) return 0;

  // 1. Resolve true biomechanical system load (e.g. +90% BW for Dips, +100% BW for Pull-Ups)
  const loadResolver = core.getExerciseLoad || window.apexCore?.getExerciseLoad;
  const effectiveLoad = typeof loadResolver === 'function' ? loadResolver(exName, w, targetDateKey) : w;
  if (effectiveLoad <= 0) return 0;

  // 2. Read user's chosen formula from Settings
  const formula = (state.settings?.oneRmFormula || 'apex').toLowerCase();

  // Mode A: APEX RPE / RIR Decay Engine
  if (formula === 'apex') {
    const pctResolver = core.getPct || window.apexCore?.getPct;
    const pct = typeof pctResolver === 'function' ? pctResolver(r, Number(rpe) || 10) : (100 - (r - 1 + (10 - (Number(rpe) || 10))) * 2.15);
    return Math.round(effectiveLoad / (Math.max(30, pct) / 100));
  }

  // Mode B: Classical formulas adjusted for Reps in Reserve (RIR)
  const rir = Math.max(0, 10 - (Number(rpe) || 10));
  const effectiveReps = r + rir;

  if (formula === 'brzycki') {
    return Math.round(effectiveLoad * (36 / Math.max(1, 37 - effectiveReps)));
  }
  if (formula === 'wathan') {
    return Math.round((100 * effectiveLoad) / (48.8 + 53.8 * Math.exp(-0.075 * effectiveReps)));
  }
  if (formula === 'lombardi') {
    return Math.round(effectiveLoad * Math.pow(effectiveReps, 0.10));
  }

  // Fallback: Epley
  return Math.round(effectiveLoad * (1 + (effectiveReps / 30)));
}

// Export to both internal core and global window scopes
core.getUnifiedE1RM = getUnifiedE1RM;
window.getUnifiedE1RM = getUnifiedE1RM;
if (window.apexCore) window.apexCore.getUnifiedE1RM = getUnifiedE1RM;

  // Alias legacy calls so all existing calculators automatically use the unified engine
function calculate1RmEquivalent(w, r, rpe = 10, ex = '') {
  return getUnifiedE1RM(w, r, rpe, ex);
}
core.calculate1RmEquivalent = calculate1RmEquivalent;
window.calculate1RmEquivalent = calculate1RmEquivalent;
if (window.apexCore) window.apexCore.calculate1RmEquivalent = calculate1RmEquivalent;

  // Dedicated execution router referencing Part 2's Mathematical Derivation Engine
  function dispatchBuildSets(scheme, e1rmVal, readyFactor = 1.0, tier = 'Main', exercise = 'Squat', mods = [], opts = {}) {
    const builder = core.buildSets || window.apexCore?.buildSets || window.buildSets;
    if (typeof builder === 'function') {
      const cleanScheme = normalizeSchemeName(scheme);
      return builder(cleanScheme, e1rmVal, readyFactor, tier, exercise, mods, opts);
    }
    console.error("Critical: Part 2 buildSets engine not detected.");
    return [];
  }

  function resumeStopwatch() {
    clearInterval(window.apexTimers.sInterval);
    if (state.sStart) {
      state.sessionSecs = Math.max(0, Math.floor((Date.now() - state.sStart) / 1000));
      window.apexTimers.sInterval = setInterval(() => {
        state.sessionSecs = Math.max(0, Math.floor((Date.now() - state.sStart) / 1000));
        const el = document.getElementById('workout-elapsed-time');
        if (el) el.innerText = fmtTime(state.sessionSecs);
      }, 1000);
    }
    clearInterval(window.apexTimers.restInterval);
    if (state.restStart) {
      state.restStopwatchSecs = Math.max(0, Math.floor((Date.now() - state.restStart) / 1000));
      window.apexTimers.restInterval = setInterval(() => {
        state.restStopwatchSecs = Math.max(0, Math.floor((Date.now() - state.restStart) / 1000));
        const rEl = document.getElementById('workout-rest-display');
        if (rEl) rEl.innerText = fmtTime(state.restStopwatchSecs);

        if (state.restCountdownTarget && state.restCountdownTarget > 0) {
          const rem = Math.max(0, Math.ceil((state.restCountdownTarget - Date.now()) / 1000));
          state.restCountdownSecs = rem;
          const cEl = document.getElementById('workout-rest-countdown');
          if (cEl) {
            cEl.innerText = rem > 0 ? fmtTime(rem) : 'GO!';
            if (rem === 0) {
              cEl.classList.remove('text-accent');
              cEl.classList.add('text-emerald-400', 'animate-pulse');
            }
          }
          if (rem === 0 && !state.restCountdownChimed) {
            state.restCountdownChimed = true;
            playAudioBeep(880, 0.25);
            triggerHaptic([60, 40, 60]);
          }
        }
      }, 1000);
    }
  }

  // Restore Active Timers from Persistent Storage Cache
  try {
    const savedActive = localStorage.getItem('apex_activeWorkout');
    if (savedActive) {
      const parsed = JSON.parse(savedActive);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.activeWorkout = parsed.map(ex => ({
          ...ex,
          scheme: normalizeSchemeName(ex.scheme),
          densityRunning: false,
          densityTimerObj: null,
          sets: (ex.sets || []).map(s => ({
            ...s,
            lapRunning: false,
            lapTimerObj: null
          }))
        }));
        state.activeWorkoutDay = localStorage.getItem('apex_activeWorkoutDay') || state.selectedDay;
        state.activeWorkoutDateKey = normalizeDateKey(localStorage.getItem('apex_activeWorkoutDateKey')) || getCurKey();
        state.sStart = Number(localStorage.getItem('apex_sStart') || Date.now());
        state.restStart = Number(localStorage.getItem('apex_restStart') || Date.now());
        resumeStopwatch();
      }
    }
  } catch(e) {}

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.activeWorkout && state.activeWorkout.length) {
      if (state.sStart) {
        state.sessionSecs = Math.max(0, Math.floor((Date.now() - state.sStart) / 1000));
        const el = document.getElementById('workout-elapsed-time');
        if (el) el.innerText = fmtTime(state.sessionSecs);
      }
      if (state.restStart) {
        state.restStopwatchSecs = Math.max(0, Math.floor((Date.now() - state.restStart) / 1000));
        const rEl = document.getElementById('workout-rest-display');
        if (rEl) rEl.innerText = fmtTime(state.restStopwatchSecs);
      }
      if (typeof core.hasActiveRunningTimers === 'function' && core.hasActiveRunningTimers()) {
        requestWakeLock();
      }
    }
  });

  // Detects earlier scheduled training splits in the same Mon-Sun week that were missed or bypassed by a detour
  function getMissedSplitsForWeek(targetDateKey) {
    try {
      const normKey = normalizeDateKey(targetDateKey);
      const [y, m, d] = normKey.split('-').map(Number);
      const targetDate = new Date(y, m - 1, d);
      targetDate.setHours(0, 0, 0, 0);

      const dow = targetDate.getDay();
      const diffToMon = (dow === 0 ? -6 : 1) - dow;
      const monDate = new Date(targetDate);
      monDate.setDate(targetDate.getDate() + diffToMon);

      // Collect all completed non-detour splits already logged this week (Mon..targetDate-1)
      const completedSplits = new Set();
      const completedDates = new Set();
      const cursor = new Date(monDate);
      while (cursor < targetDate) {
        const ck = formatIsoDate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
        const wk = state.dayLogs?.[ck]?.workout;
        if (wk && wk.done && !wk.isDetour) {
          completedDates.add(ck);
          if (wk.splitName) completedSplits.add(wk.splitName);
        }
        cursor.setDate(cursor.getDate() + 1);
      }

      const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const missed = [];
      const scan = new Date(monDate);
      while (scan < targetDate) {
        const sk = formatIsoDate(scan.getFullYear(), scan.getMonth(), scan.getDate());
        const scheduledSplit = state.weekdaySplit?.[scan.getDay()] || '';
        const isRest = !scheduledSplit || /rest|recovery/i.test(scheduledSplit);
        if (!isRest && !completedDates.has(sk) && !completedSplits.has(scheduledSplit)) {
          missed.push({
            dateKey: sk,
            dayName: dayShort[scan.getDay()],
            splitName: scheduledSplit
          });
        }
        scan.setDate(scan.getDate() + 1);
      }
      return missed;
    } catch (e) {
      return [];
    }
  }
  core.getMissedSplitsForWeek = getMissedSplitsForWeek;
  if (window.apexCore) window.apexCore.getMissedSplitsForWeek = getMissedSplitsForWeek;

  function rebuildStagedSlotSets(slots, targetDateKey, phaseOverride = null) {
    const r = getRollingReadiness(targetDateKey, 3);
    const readyBand = getReadinessBand(r);
    return (slots || []).map(s => {
      const cleanMods = sanitizeModifiers(s.modifiers);
      const normScheme = normalizeSchemeName(s.scheme);
      const anchorE1 = getBaseAnchorE1rm(s.exercise, cleanMods);
      const opts = {
        dateKey: targetDateKey,
        isGrounding: Boolean(s.isGrounding),
        skipBackoffs: Boolean(s.skipBackoffs)
      };
      if (phaseOverride) opts.phase = phaseOverride;
      return {
        ...s,
        tier: s.tier || 'Main',
        category: s.category || 'Logged',
        modifiers: cleanMods,
        scheme: normScheme,
        isGrounding: Boolean(s.isGrounding),
        skipBackoffs: Boolean(s.skipBackoffs),
        sets: dispatchBuildSets(normScheme, anchorE1, readyBand.factor, s.tier || 'Main', s.exercise, cleanMods, opts)
      };
    });
  }

  function getLastExerciseNote(exName) {
    if (!exName || !state.dayLogs) return '';
    const dates = Object.keys(state.dayLogs).sort().reverse();
    for (const dKey of dates) {
      const exs = state.dayLogs[dKey]?.workout?.exercises;
      if (!Array.isArray(exs)) continue;
      const match = exs.find(e => e && e.exercise === exName && e.notes && String(e.notes).trim());
      if (match) return String(match.notes).trim();
    }
    return '';
  }

  Object.assign(window.appActions, {
    // Equipment & Plate Inventory Controllers
    updateEquipmentSetting(category, field, val) {
      if (!state.equipment) state.equipment = JSON.parse(JSON.stringify(window.apexCore.getEquipmentConfig()));
      if (!state.equipment[category]) state.equipment[category] = {};
      state.equipment[category][field] = Number(val) || 0;
      persist();
      triggerCloudSync(1500);
      safeRender();
    },

    updateBarWeight(barName, val) {
      if (!state.equipment) state.equipment = JSON.parse(JSON.stringify(window.apexCore.getEquipmentConfig()));
      if (!state.equipment.bars) state.equipment.bars = {};
      state.equipment.bars[barName] = Math.max(0, Number(val) || 45);
      persist();
      triggerCloudSync(1500);
      safeRender();
    },

    syncLiveAnchor(exIdx) {
    const ex = state.activeWorkout[exIdx];
    if (!ex || !ex.liveAnchorSync) return;

    const newE1 = ex.liveAnchorSync.liveE1;
    ex.e1rm = newE1;

    if (typeof buildSets === 'function') {
      const freshSets = buildSets(ex.scheme, newE1, ex.factor || 1.0, ex.tier || 'Main', ex.exercise, ex.modifiers, { isGrounding: false });
      ex.sets = ex.sets.map((s, idx) => s.done ? s : (freshSets[idx] || s));
    }

    delete ex.liveAnchorSync;
    persist();
    safeRender();
  },
  

    // Navigation & Shell
    // --- Inline Load & Planner Calculators ---
 // --- Inline Load & e1RM Calculator Actions ---
  toggleExerciseCalc(exIdx) {
    if (state.openExerciseCalc === exIdx) {
      state.openExerciseCalc = null;
    } else {
      state.openExerciseCalc = exIdx;
      if (!state.exerciseCalcState) state.exerciseCalcState = {};
      if (!state.exerciseCalcState[exIdx]) {
        state.exerciseCalcState[exIdx] = { 
          calcMode: 'rpe', // 'rpe' | 'pct'
          reps: 8, 
          rpe: 8.0, 
          modPct: 0, 
          directPct: 75,
          customE1rm: null 
        };
      }
    }
    safeRender();
  },

  updateExerciseCalc(exIdx, field, val) {
    if (!state.exerciseCalcState) state.exerciseCalcState = {};
    if (!state.exerciseCalcState[exIdx]) {
      state.exerciseCalcState[exIdx] = { 
        calcMode: 'rpe', 
        reps: 8, 
        rpe: 8.0, 
        modPct: 0, 
        directPct: 75, 
        customE1rm: null 
      };
    }
    state.exerciseCalcState[exIdx][field] = val;
    safeRender();
  },

  updateCalcFromLoad(exIdx, loadVal) {
    if (!state.exerciseCalcState) state.exerciseCalcState = {};
    if (!state.exerciseCalcState[exIdx]) {
      state.exerciseCalcState[exIdx] = { 
        calcMode: 'rpe', 
        reps: 8, 
        rpe: 8.0, 
        modPct: 0, 
        directPct: 75, 
        customE1rm: null 
      };
    }
    const calc = state.exerciseCalcState[exIdx];
    const load = Number(loadVal) || 0;

    let effectiveDecimal = 0.75;
    if (calc.calcMode === 'pct') {
      effectiveDecimal = (Number(calc.directPct) || 75) / 100;
    } else {
      const rawPct = typeof getPct === 'function' ? getPct(Number(calc.reps) || 8, Number(calc.rpe) || 8.0) : 80.7;
      const basePct = rawPct <= 1 ? rawPct * 100 : rawPct;
      effectiveDecimal = (basePct + (Number(calc.modPct) || 0)) / 100;
    }

    if (load > 0 && effectiveDecimal > 0) {
      calc.customE1rm = Math.round(load / effectiveDecimal);
    }
    safeRender();
  },

  resetExerciseCalcE1rm(exIdx) {
    if (state.exerciseCalcState && state.exerciseCalcState[exIdx]) {
      state.exerciseCalcState[exIdx].customE1rm = null;
    }
    safeRender();
  },

  useHistoryInCalc(exIdx, weight, reps, rpe) {
    if (!state.exerciseCalcState) state.exerciseCalcState = {};
    if (!state.exerciseCalcState[exIdx]) {
      state.exerciseCalcState[exIdx] = { calcMode: 'rpe', reps: 8, rpe: 8.0, modPct: 0, directPct: 75, customE1rm: null };
    }
    const calc = state.exerciseCalcState[exIdx];
    calc.reps = Number(reps) || 8;
    calc.rpe = Number(rpe) || 8.0;
    calc.calcMode = 'rpe';

    if (weight && reps && rpe) {
      const rawPct = typeof getPct === 'function' ? getPct(calc.reps, calc.rpe) : 80.7;
      const decPct = (rawPct > 1 ? rawPct / 100 : rawPct) || 0.8;
      calc.customE1rm = Math.round(Number(weight) / decPct);
    }

    triggerHaptic(40);
    showToast(`Loaded ${weight} lbs × ${reps} @${Number(rpe).toFixed(1)} into calculator`);
    safeRender();
  },

  applyCalcToSet(exIdx, setIdx, targetLoad, targetReps) {
    const activeWorkout = state.activeWorkout || state.stagedWorkout;
    if (!activeWorkout) return;
    const exList = Array.isArray(activeWorkout) ? activeWorkout : activeWorkout.exercises;
    if (!exList || !exList[exIdx]) return;
    const targetSet = exList[exIdx].sets?.[setIdx];
    if (!targetSet) return;

    if (targetLoad !== undefined && targetLoad !== null) {
      targetSet.targetLoad = targetLoad;
      targetSet.actualWeight = targetLoad;
    }
    if (targetReps !== undefined && targetReps !== null) {
      targetSet.targetReps = targetReps;
      targetSet.actualReps = targetReps;
    }
    
    persist();
    triggerHaptic(50);
    showToast(`Applied ${targetLoad} lbs × ${targetReps} to S${setIdx + 1}`);
    safeRender();
  },

  togglePlannerCalc() {
    state.plannerCalcOpen = !state.plannerCalcOpen;
    if (!state.plannerCalcState) {
      state.plannerCalcState = { reps: 8, rpe: 8.0, modPct: 0, directPct: '' };
    }
    safeRender();
  },

  updatePlannerCalc(field, val) {
    if (!state.plannerCalcState) {
      state.plannerCalcState = { reps: 8, rpe: 8.0, modPct: 0, directPct: '' };
    }
    state.plannerCalcState[field] = val;
    safeRender();
  },

  applyPlannerCalc(load, reps) {
    if (!state.plannerModal) return;
    if (load) appActions.updatePlannerInput('weight', load);
    if (reps) appActions.updatePlannerInput('reps', reps);
    triggerHaptic(50);
    showToast(`Planner updated to ${load} lbs × ${reps}`);
  },
    toggleDrawer(e) { if (e?.stopPropagation) e.stopPropagation(); state.drawerOpen = !state.drawerOpen; safeRender(); },
    navigate(screen, e) { if (e?.stopPropagation) e.stopPropagation(); state.screen = screen; state.drawerOpen = false; safeRender(); },
    changeMonth(delta) { state.month += delta; if (state.month > 11) { state.month = 0; state.year++; } if (state.month < 0) { state.month = 11; state.year--; } safeRender(); },
    jumpToToday() { const t = new Date(); state.year = t.getFullYear(); state.month = t.getMonth(); state.selectedDay = t.getDate(); safeRender(); },
// RPE Chart Actions
  selectRpeProfile(id) {
    state.activeRpeProfileId = id;
    state.editingRpeProfile = JSON.parse(JSON.stringify(state.rpeProfiles[id]));
    persist();
    safeRender();
  },

  createNewRpeProfile() {
    const name = prompt("Enter profile name:", "New Profile");
    if (!name) return;
    const newId = 'rpe_' + Date.now();
    const newProf = {
      id: newId,
      name: name,
      matrix: extendRpeMatrix(DEFAULT_HIGH_CAPACITY_BASE, 50)
    };
    state.rpeProfiles[newId] = newProf;
    state.activeRpeProfileId = newId;
    state.editingRpeProfile = JSON.parse(JSON.stringify(newProf));
    persist();
    triggerCloudSync(1000);
    safeRender();
  },

  updateRpeProfileName(name) {
    if (state.editingRpeProfile) state.editingRpeProfile.name = name;
  },

  updateRpeCell(rep, rpe, val) {
    if (!state.editingRpeProfile.matrix[rep]) state.editingRpeProfile.matrix[rep] = {};
    state.editingRpeProfile.matrix[rep][rpe] = Number(val);
    safeRender();
  },

  autoExtendActiveChart() {
    state.editingRpeProfile.matrix = extendRpeMatrix(state.editingRpeProfile.matrix, 50);
    showToast("Extrapolated reps 13-50 based on 6-12 curve");
    safeRender();
  },

  saveCurrentRpeProfile() {
    const id = state.editingRpeProfile.id;
    state.rpeProfiles[id] = JSON.parse(JSON.stringify(state.editingRpeProfile));
    state.activeRpeProfileId = id;
    persist();
    triggerCloudSync(1000);
    showToast(`Updated "${state.editingRpeProfile.name}" RPE Chart`);
    safeRender();
  },

  saveNewRpeProfile() {
    const name = prompt("Name for new profile:", `${state.editingRpeProfile.name} (Copy)`);
    if (!name) return;
    const newId = 'rpe_' + Date.now();
    state.editingRpeProfile.id = newId;
    state.editingRpeProfile.name = name;
    state.rpeProfiles[newId] = JSON.parse(JSON.stringify(state.editingRpeProfile));
    state.activeRpeProfileId = newId;
    persist();
    triggerCloudSync(1000);
    showToast(`Created "${name}"`);
    safeRender();
  },

  deleteRpeProfile() {
    const id = state.editingRpeProfile.id;
    if (Object.keys(state.rpeProfiles).length <= 1) {
      showToast("Cannot delete the only remaining profile");
      return;
    }
    if (!confirm(`Delete profile "${state.editingRpeProfile.name}"?`)) return;
    delete state.rpeProfiles[id];
    state.activeRpeProfileId = Object.keys(state.rpeProfiles)[0];
    state.editingRpeProfile = JSON.parse(JSON.stringify(state.rpeProfiles[state.activeRpeProfileId]));
    persist();
    triggerCloudSync(1000);
    safeRender();
  },
    // Date Selection & Modal Activation
    selectDate(d) {
      state.selectedDay = Number(d);
      const k = formatIsoDate(state.year, state.month, state.selectedDay);
      const l = (state.dayLogs && state.dayLogs[k]) || {};
      
      state.formMetrics.weight = (l && l.weight !== undefined && l.weight !== null && l.weight !== '') ? Number(l.weight) : '';
      
      if (l && l.recovery && l.recovery.metrics) {
        state.formMetrics = {
          ...state.formMetrics,
          ...l.recovery.metrics
        };
      } else {
        state.formMetrics.sleep = 3;
        state.formMetrics.pushSoreness = 4;
        state.formMetrics.pullSoreness = 4;
        state.formMetrics.legSoreness = 4;
        state.formMetrics.energy = 4;
        state.formMetrics.stress = 4;
        state.formMetrics.motivation = 4;
      }

      state.dateActionModal = { open: true, d: state.selectedDay };
      safeRender();
    },

    closeDateActionModal() { state.dateActionModal.open = false; safeRender(); },

    // Bodyweight Controllers
    setFormWeight(val) { 
      state.formMetrics.weight = val === '' ? '' : Math.round(Number(val) * 10) / 10;
      persist();
      triggerCloudSync(2500);
    },

    quickSaveBw(dateKey, val) {
      const k = normalizeDateKey(dateKey);
      if (!state.dayLogs) state.dayLogs = {};
      if (!state.dayLogs[k]) state.dayLogs[k] = {};

      if (val === '' || val === null || val === undefined) {
        delete state.dayLogs[k].weight;
        state.formMetrics.weight = '';
        showToast(`Cleared weigh-in for ${k}`);
      } else {
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) return;
        const rounded = Math.round(num * 10) / 10;
        state.dayLogs[k].weight = rounded;
        state.formMetrics.weight = rounded;
        showToast(`Saved BW: ${rounded} lbs for ${k}`);
        triggerHaptic(50);
      }

      persist();
      triggerCloudSync(1500);
      safeRender();
    },

    // Readiness & Check-In
    setMetricValue(param, val) {
      state.formMetrics[param] = Number(val);
      persist();
      triggerCloudSync(2500);
      safeRender();
    },

    updateMetric(p, val) {
      state.formMetrics[p] = Number(val);
      const score = getReadinessScore();
      const band = getReadinessBand(score);

      const scoreEl = document.getElementById('readiness-score-text');
      if (scoreEl) scoreEl.innerText = `Readiness: ${score}% (${band.name})`;
      const valEl = document.getElementById(`val-${p}`);
      if (valEl) valEl.innerText = `${val}/5`;
      const descEl = document.getElementById(`desc-${p}`);
      if (descEl && core.metricDescs && core.metricDescs[p]) descEl.innerText = core.metricDescs[p][val];
      persist();
      triggerCloudSync(2500);
    },

    saveCheckin() {
      const k = formatIsoDate(state.year, state.month, state.selectedDay);
      if (!state.dayLogs[k]) state.dayLogs[k] = {};
      const score = getReadinessScore();
      const band = getReadinessBand(score);

      state.dayLogs[k].recovery = {
        score: score,
        band: band.name,
        metrics: {
          sleep: state.formMetrics.sleep,
          pushSoreness: state.formMetrics.pushSoreness,
          pullSoreness: state.formMetrics.pullSoreness,
          legSoreness: state.formMetrics.legSoreness,
          energy: state.formMetrics.energy,
          stress: state.formMetrics.stress,
          motivation: state.formMetrics.motivation
        }
      };

      persist();
      window.pushToCloud(false);
      showToast(`Logged Readiness: ${score}% (${band.name})`);
      triggerHaptic(60);
      state.screen = 'calendar';
      safeRender();
    },

    // Workout Staging & Templates (Supports Plan, Catch-Up, Custom Detour, and Blank Slate)
    initStaging(opts = {}) {
      if (state.activeWorkout && state.activeWorkout.length && Number(state.activeWorkoutDay) === Number(state.selectedDay) && !opts.forceNew) {
        state.screen = 'logger';
        safeRender();
        return;
      }
      const k = formatIsoDate(state.year, state.month, state.selectedDay);
      const mode = opts.mode || 'plan';
      const splitOverride = opts.splitName || (mode === 'blank' ? '__BLANK__' : null);
      const phaseOverride = opts.phase || null;
      const isDetour = (mode === 'custom' || mode === 'blank' || Boolean(phaseOverride));

      state.stagingContext = {
        mode,
        phaseOverride,
        splitOverride,
        isDetour
      };

      let rawSlots = [];
      if (mode === 'blank') {
        rawSlots = [];
      } else if (splitOverride && state.customSplitBlueprints?.[splitOverride]) {
        rawSlots = JSON.parse(JSON.stringify(state.customSplitBlueprints[splitOverride]));
      } else if (mode === 'plan' && state.savedStaged && state.savedStaged[k] && state.savedStaged[k].length > 0) {
        rawSlots = JSON.parse(JSON.stringify(state.savedStaged[k]));
      } else {
        rawSlots = generateBlueprint(state.selectedDay);
      }

      state.stagedSlots = rebuildStagedSlotSets(rawSlots, k, phaseOverride);
      persist();
      state.dateActionModal.open = false;
      state.screen = 'staging';
      state.drawerOpen = false;
      safeRender();
    },

    setStagingPhase(phaseVal) {
      const k = formatIsoDate(state.year, state.month, state.selectedDay);
      const activePos = getMesocyclePosition(k);
      if (!state.stagingContext) state.stagingContext = { mode: 'plan', phaseOverride: null, splitOverride: null, isDetour: false };

      const nextPhase = (!phaseVal || phaseVal === '__ACTIVE__') ? null : phaseVal;
      state.stagingContext.phaseOverride = nextPhase;
      state.stagingContext.isDetour = Boolean(nextPhase && nextPhase !== activePos.phase) || state.stagingContext.mode === 'custom' || state.stagingContext.mode === 'blank';

      state.stagedSlots = rebuildStagedSlotSets(state.stagedSlots, k, nextPhase);
      persist();
      showToast(nextPhase ? `Phase switched to ${nextPhase} (Active Block unchanged)` : `Restored Active Block phase (${activePos.phase})`);
      safeRender();
    },

    setStagingSplit(splitName) {
      const k = formatIsoDate(state.year, state.month, state.selectedDay);
      if (!state.stagingContext) state.stagingContext = { mode: 'plan', phaseOverride: null, splitOverride: null, isDetour: false };

      const phaseOverride = state.stagingContext.phaseOverride || null;
      if (splitName === '__BLANK__') {
        state.stagingContext.splitOverride = '__BLANK__';
        state.stagingContext.mode = 'blank';
        state.stagingContext.isDetour = true;
        state.stagedSlots = [];
      } else {
        state.stagingContext.splitOverride = splitName;
        const calendarFocus = getDayFocus(state.selectedDay);
        if (splitName !== calendarFocus && state.stagingContext.mode === 'plan') {
          state.stagingContext.mode = 'custom';
        }
        const tpl = state.customSplitBlueprints?.[splitName] ? JSON.parse(JSON.stringify(state.customSplitBlueprints[splitName])) : [];
        state.stagedSlots = rebuildStagedSlotSets(tpl, k, phaseOverride);
      }
      persist();
      showToast(splitName === '__BLANK__' ? 'Cleared to Blank Slate' : `Loaded split: ${splitName}`);
      safeRender();
    },

    saveCurrentStagedBlueprint() {
      const k = formatIsoDate(state.year, state.month, state.selectedDay);
      if (!state.savedStaged) state.savedStaged = {};
      state.stagedSlots.forEach(s => { 
        s.modifiers = sanitizeModifiers(s.modifiers);
        s.scheme = normalizeSchemeName(s.scheme);
      });
      state.savedStaged[k] = JSON.parse(JSON.stringify(state.stagedSlots));

      const isDetour = Boolean(state.stagingContext?.isDetour);
      const focus = (state.stagingContext?.splitOverride && state.stagingContext.splitOverride !== '__BLANK__')
        ? state.stagingContext.splitOverride
        : getDayFocus(state.selectedDay);

      if (!isDetour && focus) {
        if (!state.customSplitBlueprints) state.customSplitBlueprints = {};
        state.customSplitBlueprints[focus] = JSON.parse(JSON.stringify(state.stagedSlots));
      }

      persist();
      window.pushToCloud(false);
      showToast(isDetour ? `Saved custom session for ${k}` : `Saved plan and updated template for ${focus}!`);
      triggerHaptic(40);
      safeRender();
    },

    openCopyModal(sourceDateKey, slots) {
      const dKey = normalizeDateKey(sourceDateKey);
      const fallbackSlots = state.dayLogs?.[dKey]?.workout?.exercises || state.stagedSlots || [];
      state.copyModal = {
        open: true,
        sourceDateKey: dKey,
        targetYear: state.year,
        targetMonth: state.month,
        targetDay: state.selectedDay,
        sourceSlots: JSON.parse(JSON.stringify(slots || fallbackSlots))
      };
      safeRender();
    },

    closeCopyModal() { state.copyModal.open = false; safeRender(); },
    setCopyTarget(field, val) { state.copyModal[field] = Number(val); safeRender(); },

    confirmCopyTemplate() {
      const { targetYear, targetMonth, targetDay, sourceSlots } = state.copyModal;
      const targetKey = formatIsoDate(targetYear, targetMonth, targetDay);
      if (!state.savedStaged) state.savedStaged = {};
      sourceSlots.forEach(s => {
        s.tier = s.tier || 'Main';
        s.category = s.category || 'Logged';
        s.modifiers = sanitizeModifiers(s.modifiers);
        s.scheme = normalizeSchemeName(s.scheme);
      });
      state.savedStaged[targetKey] = JSON.parse(JSON.stringify(sourceSlots));
      persist();
      window.pushToCloud(false);
      state.copyModal.open = false;
      showToast(`Copied plan to ${monthNames[targetMonth]} ${targetDay}!`);
      triggerHaptic(50);
      safeRender();
    },

    moveStagedSlot(i, dir) {
      const target = i + dir;
      if (target < 0 || target >= state.stagedSlots.length) return;
      const temp = state.stagedSlots[i];
      state.stagedSlots[i] = state.stagedSlots[target];
      state.stagedSlots[target] = temp;
      persist();
      triggerCloudSync(2000);
      safeRender();
    },

    deleteStagedSlot(i) { state.stagedSlots.splice(i, 1); persist(); triggerCloudSync(2000); safeRender(); },

    changeSlotScheme(i, val) { 
      const cleanVal = normalizeSchemeName(val);
      state.stagedSlots[i].scheme = cleanVal; 
      const slot = state.stagedSlots[i];

      // Update recurring day template so next week automatically inherits this scheme
      const focus = getDayFocus(state.selectedDay);
      if (state.customSplitBlueprints && state.customSplitBlueprints[focus] && state.customSplitBlueprints[focus][i]) {
        state.customSplitBlueprints[focus][i].scheme = cleanVal;
      }

      const anchorE1 = getBaseAnchorE1rm(slot.exercise, slot.modifiers);
      const targetDateKey = formatIsoDate(state.year, state.month, state.selectedDay);
      const buildOpts = {
        dateKey: targetDateKey,
        isGrounding: slot.isGrounding,
        skipBackoffs: slot.skipBackoffs
      };
      if (state.stagingContext?.phaseOverride) buildOpts.phase = state.stagingContext.phaseOverride;
      slot.sets = dispatchBuildSets(cleanVal, anchorE1, 1.0, slot.tier, slot.exercise, slot.modifiers, buildOpts);
      persist(); 
      triggerCloudSync(2000); 
      safeRender(); 
    },

    toggleTopSingle() { state.settings.includeTopSingle = !state.settings.includeTopSingle; persist(); window.pushToCloud(false); safeRender(); },

    // In-Flight Grounding & Back-Off Toggles
    toggleGroundingSet(idx, isMid = false) {
      const target = isMid ? state.activeWorkout[idx] : state.stagedSlots[idx];
      if (!target) return;
      target.isGrounding = !target.isGrounding;

      const targetDateKey = isMid 
        ? (state.activeWorkoutDateKey || getCurKey()) 
        : formatIsoDate(state.year, state.month, state.selectedDay);

      const anchorE1 = getBaseAnchorE1rm(target.exercise, target.modifiers);
      const newSets = dispatchBuildSets(target.scheme, anchorE1, 1.0, target.tier, target.exercise, target.modifiers, {
        dateKey: targetDateKey,
        isGrounding: target.isGrounding,
        skipBackoffs: target.skipBackoffs
      });

      if (isMid && Array.isArray(target.sets) && target.sets.some(s => s && s.done)) {
        target.sets = target.sets.map((oldSet, sIdx) => {
          if (oldSet.done) return oldSet;
          const replacement = newSets[sIdx] || newSets[newSets.length - 1];
          return { ...oldSet, targetLoad: replacement.targetLoad, targetReps: replacement.targetReps, targetRpe: replacement.targetRpe, label: replacement.label };
        });
      } else {
        target.sets = newSets;
      }

      persist();
      showToast(target.isGrounding ? "🔥 Grounding Set Activated (@9.0 Top Set)" : "Standard Top Set Restored");
      safeRender();
    },

    toggleSkipBackoffs(idx, isMid = false) {
      const target = isMid ? state.activeWorkout[idx] : state.stagedSlots[idx];
      if (!target) return;
      target.skipBackoffs = !target.skipBackoffs;

      const targetDateKey = isMid 
        ? (state.activeWorkoutDateKey || getCurKey()) 
        : formatIsoDate(state.year, state.month, state.selectedDay);

      const anchorE1 = getBaseAnchorE1rm(target.exercise, target.modifiers);
      const newSets = dispatchBuildSets(target.scheme, anchorE1, 1.0, target.tier, target.exercise, target.modifiers, {
        dateKey: targetDateKey,
        isGrounding: target.isGrounding,
        skipBackoffs: target.skipBackoffs
      });

      if (isMid && Array.isArray(target.sets) && target.sets.some(s => s && s.done)) {
        if (target.skipBackoffs) {
          target.sets = target.sets.filter((s, sIdx) => s.done || sIdx === 0);
        } else {
          const loggedCount = target.sets.length;
          for (let i = loggedCount; i < newSets.length; i++) {
            target.sets.push(newSets[i]);
          }
        }
      } else {
        target.sets = newSets;
      }

      persist();
      showToast(target.skipBackoffs ? "⚡ Back-off Volume Skipped" : "Back-off Sets Included");
      safeRender();
    },

    // 1RM Prediction Engine Selector
    setOneRmFormula(formulaKey) {
      state.settings.oneRmFormula = formulaKey;
      persist();
      window.pushToCloud(false);
      triggerHaptic(40);
      showToast(`Active 1RM Engine: ${formulaKey.toUpperCase()}`);
      safeRender();
    },

    // Blending Sensitivity Controller
    setE1rmBlending(sensitivity) {
      state.settings.e1rmBlending = sensitivity;
      persist();
      window.pushToCloud(false);
      showToast(`e1RM Blending: ${sensitivity.toUpperCase()}`);
      safeRender();
    },

    // Mesocycle Grounding Reconciliation
    reconcileGroundingE1rms() {
      const sensitivity = state.settings.e1rmBlending || 'moderate';
      let reconciledCount = 0;

      Object.keys(state.e1rms || {}).forEach(vKey => {
        const tested = state.e1rms[vKey];
        const priorAnchor = state.anchorE1rms[vKey] || tested;
        const blended = blendE1rmValues(priorAnchor, tested, sensitivity);
        state.anchorE1rms[vKey] = blended;
        reconciledCount++;
      });

      persist();
      window.pushToCloud(false);
      showToast(`Reconciled ${reconciledCount} movement anchors with ${sensitivity.toUpperCase()} blending!`);
      safeRender();
    },

    // Block Transition Wizard Controllers
    openBlockWizard() {
      const analysis = analyzeBlockTransition(formatIsoDate(state.year, state.month, state.selectedDay));
      state.wizardModal = {
        open: true,
        data: analysis
      };
      safeRender();
    },

    closeBlockWizard() {
      state.wizardModal = { open: false, data: null };
      safeRender();
    },

    toggleWizardDelta(muscleIdx) {
      if (!state.wizardModal?.data?.recommendations?.[muscleIdx]) return;
      const rec = state.wizardModal.data.recommendations[muscleIdx];
      rec.applied = (rec.applied === undefined) ? false : !rec.applied;
      safeRender();
    },

    commitBlockWizard() {
      if (!state.wizardModal?.data) return;
      const { data } = state.wizardModal;

      // 1. Blend Tested Lifts into Anchor e1RMs
      const blending = data.suggestedBlending || state.settings.e1rmBlending || 'moderate';
      Object.keys(state.e1rms || {}).forEach(vKey => {
        const tested = state.e1rms[vKey];
        const priorAnchor = state.anchorE1rms[vKey] || tested;
        state.anchorE1rms[vKey] = blendE1rmValues(priorAnchor, tested, blending);
      });

      // 2. Advance to Next Mesocycle Block
      if (state.mesocycle && state.mesocycle.length) {
        state.activeBlockIdx = (state.activeBlockIdx + 1) % state.mesocycle.length;
        state.activeWeek = 1;
      }

      // 3. Clear Staged Drafts to Force Clean Regeneration
      state.savedStaged = {};
      state.stagedSlots = [];

      persist();
      window.pushToCloud(false);
      triggerHaptic([100, 50, 100]);
      showToast(`🚀 Block Transition Committed: Launched ${data.nextPhase}!`);
      state.wizardModal = { open: false, data: null };
      state.screen = 'blocks';
      safeRender();
    },

    // Programming Builder Controllers
    selectRecipeScheme(schemeName) {
      state.activeRecipeScheme = normalizeSchemeName(schemeName);
      safeRender();
    },

    updateSchemeRecipe(scheme, field, val) {
      const cleanScheme = normalizeSchemeName(scheme);
      if (!state.schemeRecipes) state.schemeRecipes = JSON.parse(JSON.stringify(core.defaultSchemeRecipes || {}));
      if (!state.schemeRecipes[cleanScheme]) state.schemeRecipes[cleanScheme] = {};
      
      let parsedVal = val;
      if (field === 'enableRpeProgression') {
        parsedVal = Boolean(val === true || val === 'true');
      } else if (typeof field === 'string' && field.toLowerCase().includes('rpe')) {
        parsedVal = roundRpe(val);
      } else if (!Array.isArray(val)) {
        const num = Number(val);
        parsedVal = isNaN(num) ? val : num;
      }
      
      state.schemeRecipes[cleanScheme][field] = parsedVal;

      // Pipe to blueprint updater to capture active phase scope overrides
      if (typeof window.appActions.updateSchemeBlueprint === 'function') {
        window.appActions.updateSchemeBlueprint(cleanScheme, field, parsedVal);
      }
      
      persist();
      triggerCloudSync(2000);
      safeRender();
    },

    saveCurrentRecipe(schemeName) {
      const scheme = normalizeSchemeName(schemeName || state.activeRecipeScheme);
      persist();
      window.pushToCloud(false);
      triggerHaptic(50);
      showToast(`✓ Saved recipe: ${scheme}`);
      safeRender();
    },

  
    exportProgrammingBuilderJson() {
      const chassisData = {
        version: window.apexCore?.APP_VERSION || 'v4.8.2-PWA',
        timestamp: new Date().toISOString(),
        phaseRepMatrix: state.phaseRepMatrix,
        schemeRecipes: state.schemeRecipes,
        exerciseRepOverrides: state.exerciseRepOverrides,
        customSplitBlueprints: state.customSplitBlueprints
      };
      const blob = new Blob([JSON.stringify(chassisData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `APEX_ProgrammingBuilder_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Exported Programming Builder rules to JSON");
    },

    importProgrammingBuilderJson(event) {
      const file = event?.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (imported && typeof imported === 'object') {
            if (imported.phaseRepMatrix) state.phaseRepMatrix = imported.phaseRepMatrix;
            if (imported.schemeRecipes) state.schemeRecipes = imported.schemeRecipes;
            if (imported.exerciseRepOverrides) state.exerciseRepOverrides = imported.exerciseRepOverrides;
            if (imported.customSplitBlueprints) state.customSplitBlueprints = imported.customSplitBlueprints;
            persist();
            window.pushToCloud(false);
            showToast("Programming Builder configuration restored!");
            safeRender();
          }
        } catch(err) {
          showToast("Failed to parse Programming Builder JSON.");
        }
      };
      reader.readAsText(file);
    },

    // Active Workout Runtime Execution
    startActiveWorkout() {
      const targetDateKey = formatIsoDate(state.year, state.month, state.selectedDay);
      syncMesocycleProgression(targetDateKey);
      const r = getRollingReadiness(targetDateKey, 3);
      const readyBand = getReadinessBand(r);
      const pos = getMesocyclePosition(targetDateKey);
      const w = pos.week || 1;
      const ctx = state.stagingContext || { mode: 'plan', phaseOverride: null, splitOverride: null, isDetour: false };
      const effectivePhase = ctx.phaseOverride || pos.phase || 'Hypertrophy';
      const effectiveSplit = (ctx.splitOverride && ctx.splitOverride !== '__BLANK__')
        ? ctx.splitOverride
        : (ctx.mode === 'blank' ? 'Blank Slate' : getDayFocus(state.selectedDay));

      state.activeWorkoutContext = {
        mode: ctx.mode || 'plan',
        phase: effectivePhase,
        week: w,
        splitName: effectiveSplit,
        isDetour: Boolean(ctx.isDetour)
      };

      state.sStart = Date.now();
      state.restStart = Date.now();
      state.sessionSecs = 0;
      state.restStopwatchSecs = 0;
      state.activeWorkoutDay = state.selectedDay;
      state.activeWorkoutDateKey = targetDateKey;
      state.isEditingHistorical = false;
      state.historicalDateKey = null;
      resumeStopwatch();

      state.activeWorkout = (state.stagedSlots || []).map(slot => {
        const cleanMods = sanitizeModifiers(slot.modifiers);
        const anchorE1 = getBaseAnchorE1rm(slot.exercise, cleanMods);
        const normScheme = normalizeSchemeName(slot.scheme);
        const bpObj = state.schemeBlueprints?.[normScheme] || DEFAULT_SCHEME_BLUEPRINTS[normScheme] || {};
        const recObj = state.schemeRecipes?.[normScheme] || {};
        const dPct = Number(bpObj.targetLoadPct || recObj.targetLoadPct) || (w <= 2 ? 65 : 75);
        const dMins = Number(bpObj.defaultMinutes || recObj.defaultMinutes) || 8;
        const dTotalSecs = Math.max(60, dMins * 60);
        return {
          tier: slot.tier || 'Main',
          category: slot.category || 'Logged',
          exercise: slot.exercise,
          modifiers: [...cleanMods],
          scheme: normScheme,
          isGrounding: Boolean(slot.isGrounding),
          skipBackoffs: Boolean(slot.skipBackoffs),
          notes: slot.notes !== undefined ? slot.notes : getLastExerciseNote(slot.exercise),
          fatigueWarning: false,
          densityLoad: calcLoad(anchorE1 * readyBand.factor, dPct),
          densitySec: dTotalSecs,
          densityTotalSec: dTotalSecs,
          densityRunning: false,
          densityTimerObj: null,
          densityReps: 0,
          sets: dispatchBuildSets(normScheme, anchorE1, readyBand.factor, slot.tier, slot.exercise, cleanMods, {
            dateKey: targetDateKey,
            phase: effectivePhase,
            isGrounding: slot.isGrounding,
            skipBackoffs: slot.skipBackoffs
          })
        };
      });

      state.collapsedCards = {};
      state.sessionPRs = {};
      state.screen = 'logger';
      persist();
      triggerHaptic(80);
      safeRender();
    },

    // Set Logging with Telemetry PR Recording
    logSet(exIdx, sIdx, event) {
      if (event?.stopPropagation) event.stopPropagation();
      const ex = state.activeWorkout[exIdx];
      const s = ex.sets[sIdx];
      const meta = getExMeta(ex.exercise);
      s.done = !s.done;

     // --- RANK 1: LIVE SET-1 AUTOREGULATED ANCHOR RE-CALIBRATION ---
      if (sIdx === 0 && s.done && meta.w && meta.r && Number(s.actualWeight) > 0 && Number(s.actualReps) > 0) {
        const actW = Number(s.actualWeight);
        const actR = Number(s.actualReps);
        const actRpe = roundRpe(s.actualRpe || s.targetRpe || 8.0);
        const rawPct = typeof getPct === 'function' ? getPct(actR, actRpe) : (100 / (1 + actR / 30));
        const pctDec = rawPct <= 1 ? rawPct : rawPct / 100;
        const liveE1 = Math.round(actW / pctDec);

        const cleanMods = sanitizeModifiers(ex.modifiers || []);
        const variantKey = typeof getVariantKey === 'function' ? getVariantKey(ex.exercise, cleanMods) : ex.exercise;
        const anchorE1 = Number(
          ex.e1rm ||
          (typeof getBaseAnchorE1rm === 'function' ? getBaseAnchorE1rm(ex.exercise, cleanMods) : null) ||
          state.anchorE1rms?.[variantKey] ||
          state.anchorE1rms?.[ex.exercise] ||
          state.e1rms?.[variantKey] ||
          state.e1rms?.[ex.exercise] ||
          liveE1
        );
        const pctDiff = anchorE1 > 0 ? ((liveE1 - anchorE1) / anchorE1) * 100 : 0;

        if (Math.abs(pctDiff) >= 2.5) {
          ex.liveAnchorSync = {
            liveE1,
            pctDiff: Math.round(pctDiff * 10) / 10
          };
        } else {
          delete ex.liveAnchorSync;
        }
      } else if (sIdx === 0 && !s.done) {
        delete ex.liveAnchorSync;
      }
      // -------------------------------------------------------------

      state.restStart = Date.now();
      state.restStopwatchSecs = 0;
      const rEl = document.getElementById('workout-rest-display');
      if (rEl) rEl.innerText = '0:00';

      if (s.done) {
        // Protocol-Driven Rest Countdown
        const bpObj = state.schemeBlueprints?.[ex.scheme] || DEFAULT_SCHEME_BLUEPRINTS?.[ex.scheme] || {};
        const protoRest = Number(s.targetTime) > 0
          ? Number(s.targetTime)
          : (Number(bpObj.restSeconds) || (ex.tier === 'Assistance' ? 90 : 120));
        state.restCountdownSecs = protoRest;
        state.restCountdownTarget = Date.now() + (protoRest * 1000);
        state.restCountdownChimed = false;
        triggerHaptic(40);
        if (s.lapRunning) {
          clearInterval(s.lapTimerObj);
          s.lapRunning = false;
          releaseWakeLock();
        }

        const sessionDate = state.isEditingHistorical ? state.historicalDateKey : (state.activeWorkoutDateKey || getCurKey());
        const effectiveWeight = getExerciseLoad(ex.exercise, s.actualWeight, sessionDate);

        if (effectiveWeight > 0 && meta.r && s.actualReps && s.actualRpe) {
          const cleanRpe = roundRpe(s.actualRpe);
          const ach = Math.round(effectiveWeight / (getPct(s.actualReps, cleanRpe) / 100));
          const cleanMods = sanitizeModifiers(ex.modifiers);
          const variantKey = getVariantKey(ex.exercise, cleanMods);
          
          const currentStored = state.e1rms[variantKey] !== undefined 
            ? state.e1rms[variantKey] 
            : (cleanMods.length ? 0 : (state.e1rms[ex.exercise] || 0));

          if (ach > currentStored) {
            const diff = currentStored === 0 ? ach : (ach - currentStored);
            state.e1rms[variantKey] = ach;
            state.sessionPRs[variantKey] = { oldVal: currentStored, newVal: ach, diff: diff };
            state.prLedger.unshift({
              date: sessionDate,
              lift: variantKey,
              oldVal: currentStored,
              newVal: ach,
              diff: diff
            });
            triggerHaptic([60, 40, 100]);
            playAudioBeep(1046, 0.25);
            window.pushToCloud(false);
          }
        }
        
        const rem = ex.sets.filter(x => !x.done).length;
        ex.fatigueWarning = (roundRpe(s.actualRpe) >= roundRpe(s.targetRpe) + 1.0 && rem >= 1);
        if (ex.fatigueWarning) {
          playAudioBeep(440, 0.3);
        }
      }
      persist();
      triggerCloudSync(1000);
      safeRender();
    },

    addSet(exIdx) {
      const ex = state.activeWorkout[exIdx];
      const l = ex.sets[ex.sets.length - 1];
      ex.sets.push({ ...l, label: `S${ex.sets.length + 1}`, done: false, actualTime: 0, lapRunning: false, lapTimerObj: null });
      persist();
      triggerCloudSync(2000);
      safeRender();
    },

    deleteSet(exIdx, sIdx) {
      const ex = state.activeWorkout[exIdx];
      if (ex.sets.length > 1) {
        clearInterval(ex.sets[sIdx].lapTimerObj);
        ex.sets.splice(sIdx, 1);
      }
      persist();
      triggerCloudSync(2000);
      safeRender();
    },

    deleteActiveEx(exIdx) {
      const ex = state.activeWorkout[exIdx];
      if (ex) {
        clearInterval(ex.densityTimerObj);
        (ex.sets || []).forEach(s => clearInterval(s.lapTimerObj));
        state.activeWorkout.splice(exIdx, 1);
        persist();
        triggerCloudSync(2000);
        safeRender();
      }
    },

    moveActiveEx(i, dir) {
      const target = i + dir;
      if (target < 0 || target >= state.activeWorkout.length) return;
      const temp = state.activeWorkout[i];
      state.activeWorkout[i] = state.activeWorkout[target];
      state.activeWorkout[target] = temp;
      state.cardMenuOpen = null;
      persist();
      triggerCloudSync(2000);
      safeRender();
    },

    updateSetInput(exIdx, sIdx, field, val) { 
      if (field === 'actualRpe' || field === 'targetRpe') val = roundRpe(val);
      state.activeWorkout[exIdx].sets[sIdx][field] = Number(val); 
      persist(); 
      triggerCloudSync(2500);
    },

    applyDrop(exIdx) {
    const ex = state.activeWorkout[exIdx];
    const doneSets = (ex.sets || []).filter(s => s.done);
    const lastDone = doneSets.length ? doneSets[doneSets.length - 1] : null;
    const anchorActual = lastDone ? (Number(lastDone.actualWeight) || Number(lastDone.weight) || Number(lastDone.targetLoad)) : 0;
    const anchorTarget = lastDone ? (Number(lastDone.targetLoad) || anchorActual) : 0;

    ex.sets.forEach(s => {
      if (!s.done) {
        // Anchor to actual logged weight: if remaining set had the same targetLoad as the overshot set,
        // drop 5% directly off anchorActual; if it's a scaled backoff set, scale proportionally from anchorActual * 0.95
        const baseLoad = (anchorActual > 0 && anchorTarget > 0)
          ? (s.targetLoad === anchorTarget ? anchorActual : (s.targetLoad * (anchorActual / anchorTarget)))
          : s.targetLoad;
        s.targetLoad = roundLoad(baseLoad * 0.95);
        s.actualWeight = s.targetLoad;
      }
    });
    ex.fatigueWarning = false;
    persist();
    triggerCloudSync(1500);
    showToast("Applied -5% load drop off logged weight");
    safeRender();
  },

    adjustRestCountdown(deltaSecs) {
      const now = Date.now();
      const base = (state.restCountdownTarget && state.restCountdownTarget > now) ? state.restCountdownTarget : now;
      const nextTarget = Math.max(now, base + (Number(deltaSecs) * 1000));
      state.restCountdownTarget = nextTarget;
      state.restCountdownSecs = Math.max(0, Math.ceil((nextTarget - now) / 1000));
      state.restCountdownChimed = state.restCountdownSecs === 0;
      const cEl = document.getElementById('workout-rest-countdown');
      if (cEl) {
        cEl.innerText = state.restCountdownSecs > 0 ? fmtTime(state.restCountdownSecs) : 'GO!';
        cEl.classList.remove('text-emerald-400', 'animate-pulse');
        cEl.classList.add('text-accent');
      }
      safeRender();
    },

    clearRestCountdown() {
      state.restCountdownTarget = 0;
      state.restCountdownSecs = 0;
      state.restCountdownChimed = true;
      safeRender();
    },

    dismissFatigueWarning(exIdx) {
      if (state.activeWorkout[exIdx]) {
        state.activeWorkout[exIdx].fatigueWarning = false;
        safeRender();
      }
    },

    // Lap & Density Timers
    toggleSetLap(exIdx, sIdx) {
      const ex = state.activeWorkout[exIdx];
      if (!ex?.sets?.[sIdx]) return;
      const s = ex.sets[sIdx];
      s.lapRunning = !s.lapRunning;
      if (s.lapRunning) {
        requestWakeLock();
        clearInterval(s.lapTimerObj);
        s.lapStart = Date.now();
        s.lapAccumulated = s.actualTime || 0;
        s.lapTimerObj = setInterval(() => {
          s.actualTime = s.lapAccumulated + Math.floor((Date.now() - s.lapStart) / 1000);
          const el = document.getElementById(`lap-display-${exIdx}-${sIdx}`);
          if (el) el.innerText = fmtTime(s.actualTime);
        }, 1000);
      } else {
        clearInterval(s.lapTimerObj);
        s.actualTime = (s.lapAccumulated || 0) + Math.floor((Date.now() - (s.lapStart || Date.now())) / 1000);
        s.lapAccumulated = s.actualTime;
        releaseWakeLock();
        persist();
        triggerCloudSync(3000);
      }
      safeRender();
    },

    resetSetLap(exIdx, sIdx) {
      const ex = state.activeWorkout[exIdx];
      if (!ex?.sets?.[sIdx]) return;
      const s = ex.sets[sIdx];
      clearInterval(s.lapTimerObj);
      s.lapRunning = false;
      s.actualTime = 0;
      s.lapAccumulated = 0;
      releaseWakeLock();
      persist();
      triggerCloudSync(3000);
      safeRender();
    },

    setDensityDuration(exIdx, mins) {
      const ex = state.activeWorkout[exIdx];
      if (!ex) return;
      ex.densityTotalSec = Number(mins) * 60;
      ex.densitySec = ex.densityTotalSec;
      clearInterval(ex.densityTimerObj);
      ex.densityRunning = false;
      ex.densityTargetEnd = null;
      releaseWakeLock();
      persist();
      triggerCloudSync(2500);
      safeRender();
    },

    toggleDensity(exIdx) {
      const ex = state.activeWorkout[exIdx];
      if (!ex) return;
      ex.densityRunning = !ex.densityRunning;
      if (ex.densityRunning) {
        requestWakeLock();
        clearInterval(ex.densityTimerObj);
        ex.densityTargetEnd = Date.now() + (ex.densitySec * 1000);
        ex.densityTimerObj = setInterval(() => {
          ex.densitySec = Math.max(0, Math.ceil((ex.densityTargetEnd - Date.now()) / 1000));
          const dEl = document.getElementById(`density-timer-disp-${exIdx}`);
          if (dEl) dEl.innerText = fmtTime(ex.densitySec);
          if (ex.densitySec <= 0) {
            clearInterval(ex.densityTimerObj);
            ex.densityRunning = false;
            releaseWakeLock();
            playAudioBeep(659, 0.4);
            safeRender();
          }
        }, 1000);
      } else {
        clearInterval(ex.densityTimerObj);
        releaseWakeLock();
      }
      safeRender();
    },

    resetDensity(exIdx) {
      const ex = state.activeWorkout[exIdx];
      if (!ex) return;
      clearInterval(ex.densityTimerObj);
      ex.densityRunning = false;
      ex.densitySec = ex.densityTotalSec || 480;
      ex.densityTargetEnd = null;
      releaseWakeLock();
      safeRender();
    },

    toggleCardCollapse(exIdx) { state.collapsedCards[exIdx] = !state.collapsedCards[exIdx]; safeRender(); },
    updateExerciseNotes(exIdx, val) {
      if (!state.activeWorkout || !state.activeWorkout[exIdx]) return;
      state.activeWorkout[exIdx].notes = String(val || '');
      persist();
      triggerCloudSync(2500);
    },

    openSchemeInfoModal(schemeName) {
      const clean = normalizeSchemeName(schemeName || 'Straight Sets');
      const bp = (state.schemeBlueprints && state.schemeBlueprints[clean]) || (DEFAULT_SCHEME_BLUEPRINTS && DEFAULT_SCHEME_BLUEPRINTS[clean]) || {};
      const desc = (core.schemeDescriptions && core.schemeDescriptions[clean]) || '';
      const text = bp.instructions || bp.directive || desc || 'No additional instructions configured for this protocol.';
      state.schemeInfoModal = {
        open: true,
        scheme: clean,
        pattern: bp.pattern || 'straight',
        restSeconds: bp.restSeconds || 120,
        text
      };
      safeRender();
    },

    closeSchemeInfoModal() {
      state.schemeInfoModal = { open: false, scheme: '', text: '' };
      safeRender();
    },

    toggleInstructionCollapse(exIdx) {
      if (!state.collapsedInstructions) state.collapsedInstructions = {};
      state.collapsedInstructions[exIdx] = !state.collapsedInstructions[exIdx];
      safeRender();
    },
    toggleCardMenu(exIdx, e) { if (e?.stopPropagation) e.stopPropagation(); state.cardMenuOpen = (state.cardMenuOpen === exIdx) ? null : exIdx; safeRender(); },
    closeCardMenu() { if (state.cardMenuOpen !== null) { state.cardMenuOpen = null; safeRender(); } },

    // PR Ledger Modal Controllers
    openPrLedgerModal() {
      state.prLedgerModal = { open: true, filterLift: 'All' };
      safeRender();
    },

    closePrLedgerModal() {
      if (state.prLedgerModal) state.prLedgerModal.open = false;
      safeRender();
    },

    setPrLedgerFilter(liftName) {
      if (!state.prLedgerModal) state.prLedgerModal = { open: true };
      state.prLedgerModal.filterLift = liftName;
      safeRender();
    },

    // Finish Workout & History Handling
    openFinishModal() {
      const calculatedMins = Math.max(1, Math.round(state.sessionSecs / 60));
      state.finishModal = { open: true, dur: calculatedMins, srpe: 7.5 };
      safeRender();
    },

    closeFinishModal() { state.finishModal.open = false; safeRender(); },
    adjFinishDur(delta) { state.finishModal.dur = Math.max(5, (state.finishModal.dur || 45) + delta); safeRender(); },
    setFinishDur(val) { state.finishModal.dur = Math.max(1, Number(val) || 1); },
    setFinishSrpe(val) { state.finishModal.srpe = roundRpe(val); safeRender(); },

    confirmFinishSession() {
      clearInterval(window.apexTimers.sInterval);
      clearInterval(window.apexTimers.restInterval);
      releaseWakeLock(true);

      state.activeWorkout.forEach(x => {
        clearInterval(x.densityTimerObj);
        (x.sets || []).forEach(s => clearInterval(s.lapTimerObj));
      });

      const rawTargetKey = state.isEditingHistorical
      ? state.historicalDateKey
      : (state.activeWorkoutDateKey || getCurKey());
    const targetKey = typeof normalizeDateKey === 'function' ? normalizeDateKey(rawTargetKey) : rawTargetKey;

      if (!state.dayLogs[targetKey]) state.dayLogs[targetKey] = {};
      const sessionPos = getMesocyclePosition(state.isEditingHistorical ? null : targetKey);
      const existingWorkout = state.dayLogs[targetKey].workout || {};
      const activeCtx = state.activeWorkoutContext || {};
      const stampedPhase = (state.isEditingHistorical && existingWorkout.phase)
        ? existingWorkout.phase
        : (activeCtx.phase || sessionPos.phase || 'Hypertrophy');
      const stampedWeek = (state.isEditingHistorical && existingWorkout.week)
        ? existingWorkout.week
        : (activeCtx.week || sessionPos.week || 1);
      const stampedSplit = (state.isEditingHistorical && existingWorkout.splitName)
        ? existingWorkout.splitName
        : (activeCtx.splitName || getDayFocus(state.activeWorkoutDay || state.selectedDay));
      const stampedDetour = (state.isEditingHistorical && existingWorkout.isDetour !== undefined)
        ? Boolean(existingWorkout.isDetour)
        : Boolean(activeCtx.isDetour);

      state.dayLogs[targetKey].workout = {
        done: true,
        phase: stampedPhase,
        week: stampedWeek,
        splitName: stampedSplit,
        isDetour: stampedDetour,
        isDeload: stampedPhase === 'Deload',
        dur: state.finishModal.dur,
        srpe: roundRpe(state.finishModal.srpe),
        exercises: state.activeWorkout.map(ex => {
          const completedSets = ex.sets.filter(s => s.done);
          const totalReps = completedSets.reduce((sum, s) => sum + (s.actualReps || 0), 0);
          const tonnage = completedSets.reduce((sum, s) => {
            const effW = getExerciseLoad(ex.exercise, s.actualWeight, targetKey);
            return sum + (effW * (s.actualReps || 0));
          }, 0);

          return {
            tier: ex.tier || 'Main',
            category: ex.category || 'Logged',
            exercise: ex.exercise,
            modifiers: sanitizeModifiers(ex.modifiers),
            scheme: normalizeSchemeName(ex.scheme),
            isGrounding: Boolean(ex.isGrounding),
            skipBackoffs: Boolean(ex.skipBackoffs),
            notes: ex.notes ? String(ex.notes).trim() : '',
            densityLoad: ex.densityLoad || 0,
            densitySec: ex.densitySec || 0,
            sets: ex.sets.map(s => ({ ...s, targetRpe: roundRpe(s.targetRpe), actualRpe: roundRpe(s.actualRpe), lapRunning: false, lapTimerObj: null })),
            totalReps,
            tonnage
          };
        })
      };

      // Keep legacy state.history in sync if this date exists there
      if (Array.isArray(state.history)) {
        const hIdx = state.history.findIndex(h => normalizeDateKey(h.date || h.dateKey) === targetKey);
        if (hIdx > -1) {
          state.history[hIdx] = {
            ...state.history[hIdx],
            date: targetKey,
            dur: state.dayLogs[targetKey].workout.dur,
            srpe: state.dayLogs[targetKey].workout.srpe,
            exercises: state.dayLogs[targetKey].workout.exercises,
            workout: state.dayLogs[targetKey].workout
          };
        }
      }
      if (rawTargetKey && rawTargetKey !== targetKey && state.dayLogs[rawTargetKey]?.workout) {
        delete state.dayLogs[rawTargetKey].workout;
      }

      const wasEditingHist = Boolean(state.isEditingHistorical);
      state.activeWorkout = [];
      state.activeWorkoutDay = null;
      state.activeWorkoutContext = null;
      state.activeWorkoutDateKey = null;
      state.sessionSecs = 0;
      state.restStopwatchSecs = 0;
      state.sStart = null;
      state.restStart = null;
      state.isEditingHistorical = false;
      state.historicalDateKey = null;
      state.finishModal.open = false;
      state.sessionPRs = {};
      persist();
      if (typeof window.pushToCloud === 'function') window.pushToCloud(wasEditingHist);
      if (wasEditingHist && typeof showToast === 'function') showToast(`Saved updates to ${targetKey}`);
      triggerHaptic([100, 50, 100]);
      state.screen = 'calendar';
      safeRender();
    },

    viewCompletedSession(dateKey) {
      state.reviewDateKey = normalizeDateKey(dateKey);
      state.dateActionModal.open = false;
      state.screenScrolls['history_review'] = 0;
      state.screen = 'history_review';
      safeRender();
    },

    editCompletedSession(dateKey) {
    const normKey = normalizeDateKey(dateKey);
    const dLog = state.dayLogs?.[normKey] || {};
    const histFallback = (Array.isArray(state.history) ? state.history.find(h => normalizeDateKey(h.date || h.dateKey) === normKey) : null) || {};
    const rawExs = dLog.workout?.exercises || dLog.exercises || histFallback.workout?.exercises || histFallback.exercises || [];

    state.activeWorkout = rawExs.map(ex => ({
      ...ex,
      sets: (ex.sets || []).map(s => {
        const w = s.actualWeight ?? s.weight ?? s.targetWeight ?? 0;
        const r = s.actualReps ?? s.reps ?? s.targetReps ?? 0;
        const rpe = s.actualRpe ?? s.rpe ?? s.targetRpe ?? 8;
        return {
          ...s,
          actualWeight: w,
          actualReps: r,
          actualRpe: roundRpe(rpe),
          targetRpe: roundRpe(s.targetRpe || rpe),
          done: s.done !== undefined ? s.done : true
        };
      })
    }));

    state.activeWorkoutDay = Number(normKey.split('-')[2]) || 1;
    state.activeWorkoutDateKey = normKey;
    state.isEditingHistorical = true;
    state.historicalDateKey = normKey;

    const durSecs = (dLog.workout?.dur || dLog.dur || histFallback.dur || 45) * 60;
    state.sessionSecs = durSecs;
    state.sStart = Date.now() - (state.sessionSecs * 1000);
    state.restStart = Date.now();
    resumeStopwatch();
    state.screen = 'logger';
    state.dateActionModal.open = false;
    persist();
    safeRender();
  },


    mergeLiftVariants(fromVariantKey, toVariantKey) {
      const fromKey = String(fromVariantKey || '').trim();
      const toKey = String(toVariantKey || '').trim();
      if (!fromKey || !toKey) {
        showToast('Select both a source and target variant.');
        return;
      }
      if (fromKey === toKey) {
        showToast('Source and target variants are identical.');
        return;
      }

      const parseV = (vKey) => {
        if (!vKey.includes(' [')) return { baseName: vKey, mods: [] };
        const parts = vKey.split(' [');
        return {
          baseName: parts[0],
          mods: parts[1].replace(/\]$/, '').split(', ').map(s => s.trim()).filter(Boolean)
        };
      };

      const target = parseV(toKey);
      let updatedExercises = 0;
      let updatedSessions = 0;

      // 1. Rewrite all matching exercises in state.dayLogs
      Object.keys(state.dayLogs || {}).forEach(dKey => {
        const wk = state.dayLogs[dKey]?.workout;
        if (!wk || !Array.isArray(wk.exercises)) return;
        let touched = false;
        wk.exercises.forEach(ex => {
          if (!ex || !ex.exercise) return;
          const curKey = getVariantKey(ex.exercise, sanitizeModifiers(ex.modifiers || []));
          if (curKey === fromKey) {
            ex.exercise = target.baseName;
            ex.modifiers = [...target.mods];
            updatedExercises++;
            touched = true;
          }
        });
        if (touched) updatedSessions++;
      });

      // 2. Rewrite legacy state.history if present
      if (Array.isArray(state.history)) {
        state.history.forEach(h => {
          const list = h?.workout?.exercises || h?.exercises;
          if (!Array.isArray(list)) return;
          list.forEach(ex => {
            if (!ex || !ex.exercise) return;
            const curKey = getVariantKey(ex.exercise, sanitizeModifiers(ex.modifiers || []));
            if (curKey === fromKey) {
              ex.exercise = target.baseName;
              ex.modifiers = [...target.mods];
            }
          });
        });
      }

      // 3. Rewrite state.prLedger
      if (Array.isArray(state.prLedger)) {
        state.prLedger.forEach(pr => {
          if (pr && pr.lift === fromKey) pr.lift = toKey;
        });
      }

      // 4. Merge e1rms & anchorE1rms
      if (state.e1rms && state.e1rms[fromKey] !== undefined) {
        state.e1rms[toKey] = Math.max(Number(state.e1rms[toKey]) || 0, Number(state.e1rms[fromKey]) || 0);
        delete state.e1rms[fromKey];
      }
      if (state.anchorE1rms && state.anchorE1rms[fromKey] !== undefined) {
        state.anchorE1rms[toKey] = Math.max(Number(state.anchorE1rms[toKey]) || 0, Number(state.anchorE1rms[fromKey]) || 0);
        delete state.anchorE1rms[fromKey];
      }

      if (state.analyticsSelectedLift === fromKey) {
        state.analyticsSelectedLift = toKey;
      }

      persist();
      if (typeof window.pushToCloud === 'function') window.pushToCloud(true);
      showToast(`Merged ${updatedExercises} log(s) across ${updatedSessions} session(s) into ${toKey}`);
      safeRender();
    },

    deleteHistoricalSession(dateKey) {
      const normKey = normalizeDateKey(dateKey);
      if (confirm("Are you sure you want to delete this completed workout record?")) {
        if (state.dayLogs[normKey] && state.dayLogs[normKey].workout) {
          delete state.dayLogs[normKey].workout;
          persist();
          window.pushToCloud(false);
          state.dateActionModal.open = false;
          state.screen = 'calendar';
          safeRender();
        }
      }
    },

    discardActiveWorkout() {
      if (confirm("Are you sure you want to discard this in-progress session? Changes will not be saved.")) {
        clearInterval(window.apexTimers.sInterval);
        clearInterval(window.apexTimers.restInterval);
        releaseWakeLock(true);
        if (Array.isArray(state.activeWorkout)) {
          state.activeWorkout.forEach(x => {
            clearInterval(x.densityTimerObj);
            (x.sets || []).forEach(s => clearInterval(s.lapTimerObj));
          });
        }
        state.activeWorkout = [];
        state.activeWorkoutDay = null;
        state.activeWorkoutDateKey = null;
        state.sessionSecs = 0;
        state.restStopwatchSecs = 0;
        state.sStart = null;
        state.restStart = null;
        state.isEditingHistorical = false;
        state.historicalDateKey = null;
        state.sessionPRs = {};
        persist();
        state.screen = 'calendar';
        safeRender();
      }
    },

    forceClearActiveWorkout(e) {
      if (e?.stopPropagation) e.stopPropagation();
      if (confirm("Purge and clear this active workout session? This will dismiss any stuck banner and unfreeze the app.")) {
        clearInterval(window.apexTimers.sInterval);
        clearInterval(window.apexTimers.restInterval);
        releaseWakeLock(true);
        if (Array.isArray(state.activeWorkout)) {
          state.activeWorkout.forEach(x => {
            clearInterval(x.densityTimerObj);
            (x.sets || []).forEach(s => clearInterval(s.lapTimerObj));
          });
        }
        state.activeWorkout = [];
        state.activeWorkoutDay = null;
        state.activeWorkoutDateKey = null;
        state.sessionSecs = 0;
        state.restStopwatchSecs = 0;
        state.sStart = null;
        state.restStart = null;
        state.isEditingHistorical = false;
        state.historicalDateKey = null;
        state.sessionPRs = {};
        localStorage.removeItem('apex_activeWorkout');
        localStorage.removeItem('apex_activeWorkoutDay');
        localStorage.removeItem('apex_activeWorkoutDateKey');
        localStorage.removeItem('apex_sStart');
        localStorage.removeItem('apex_restStart');
        persist();
        window.pushToCloud(false);
        showToast("Active workout state cleared successfully.");
        safeRender();
      }
    },

    // Planner & History
    openPlanner(exIdx) {
      const ex = state.activeWorkout[exIdx];
      const cleanMods = sanitizeModifiers(ex.modifiers);
      const e1 = getBaseAnchorE1rm(ex.exercise, cleanMods);
      state.plannerModal = { open: true, ex: ex.exercise, mods: [...cleanMods], exIdx: exIdx, weight: roundLoad(e1 * 0.8), reps: 5, rpe: 8.0, withMods: true, savedMsg: '' };
      state.cardMenuOpen = null;
      safeRender();
    },

    closePlanner() { state.plannerModal.open = false; safeRender(); },
    togglePlannerHistoryFilter() { state.plannerModal.withMods = !state.plannerModal.withMods; safeRender(); },

    updatePlannerInput(field, val) {
      state.plannerModal[field] = (field === 'rpe') ? roundRpe(val) : Number(val);
      state.plannerModal.savedMsg = '';
      const pct = getPct(state.plannerModal.reps, state.plannerModal.rpe);
      const pE1 = Math.round(state.plannerModal.weight / (pct / 100));
      const dispEl = document.getElementById('planner-e1-display');
      if (dispEl) dispEl.innerText = `${pE1} lbs e1RM`;
      const pctEl = document.getElementById('planner-pct-display');
      if (pctEl) pctEl.innerText = `${pct}%`;
    },

    savePlannerToLift(exIdx) {
      const { ex, mods, weight, reps, rpe } = state.plannerModal;
      const cleanMods = sanitizeModifiers(mods);
      const cleanRpe = roundRpe(rpe);
      const pct = getPct(reps, cleanRpe);
      const computedE1 = Math.round(weight / (pct / 100));
      if (computedE1 > 0) {
        const variantKey = getVariantKey(ex, cleanMods);
        state.anchorE1rms[variantKey] = computedE1;
        state.e1rms[variantKey] = Math.max(state.e1rms[variantKey] || 0, computedE1);
        const targetEx = state.activeWorkout[exIdx];
        if (targetEx) {
          const sessionDate = state.isEditingHistorical ? state.historicalDateKey : (state.activeWorkoutDateKey || getCurKey());
          targetEx.sets = dispatchBuildSets(targetEx.scheme, computedE1, 1.0, targetEx.tier, targetEx.exercise, targetEx.modifiers, {
            dateKey: sessionDate,
            isGrounding: targetEx.isGrounding,
            skipBackoffs: targetEx.skipBackoffs
          });
        }
        persist();
        window.pushToCloud(false);
        state.plannerModal.savedMsg = `Updated ${variantKey} anchor to ${computedE1} lbs and refreshed targets!`;
        safeRender();
      }
    },

    // Config / Add Movement Modal
    openConfig(idx, isMid) {
      const t = isMid ? state.activeWorkout[idx] : state.stagedSlots[idx];
      const cleanMods = sanitizeModifiers(t.modifiers || []);
      state.modal = { open: true, idx, isMid, isNew: false, isSplitEditor: false, cat: t.category, ex: t.exercise, mods: [...cleanMods], scheme: normalizeSchemeName(t.scheme || 'Straight Sets') };
      state.cardMenuOpen = null;
      safeRender();
    },

    openAdd(isMid) {
      state.modal = { open: true, idx: null, isMid, isNew: true, isSplitEditor: false, cat: 'Isolation', ex: 'Curls', mods: ['Dumbbell'], scheme: 'Straight Sets' };
      safeRender();
    },

    closeModal() { state.modal.open = false; safeRender(); },

    toggleMod(m) {
      const i = state.modal.mods.indexOf(m);
      if (i > -1) state.modal.mods.splice(i, 1); else state.modal.mods.push(m);
      safeRender();
    },

    onModalCatChange(cat) { state.modal.cat = cat; state.modal.ex = state.exercises[cat][0]; state.modal.mods = []; safeRender(); },
    setModalEx(val) { state.modal.ex = val; state.modal.mods = []; safeRender(); },
    setModalScheme(val) { state.modal.scheme = normalizeSchemeName(val); safeRender(); },

    applyConfig() {
      const tier = ['Knee Dominant', 'Hip Dominant', 'Horizontal Push'].includes(state.modal.cat) ? 'Main' : 'Assistance';
      const scheme = normalizeSchemeName(state.modal.scheme || 'Straight Sets');
      const cleanMods = sanitizeModifiers(state.modal.mods);
      const targetDateKey = state.modal.isMid 
        ? (state.activeWorkoutDateKey || getCurKey()) 
        : formatIsoDate(state.year, state.month, state.selectedDay);

      if (state.modal.isSplitEditor) {
        const blueprint = state.customSplitBlueprints[state.editingBlueprintName];
        if (blueprint) {
          blueprint.push({ tier, category: state.modal.cat, exercise: state.modal.ex, modifiers: [...cleanMods], scheme, isGrounding: false, skipBackoffs: false });
          persist();
        }
      } else if (state.modal.isNew) {
        const obj = { tier, category: state.modal.cat, exercise: state.modal.ex, modifiers: [...cleanMods], scheme, isGrounding: false, skipBackoffs: false };
        if (state.modal.isMid) {
          const anchorE1 = getBaseAnchorE1rm(obj.exercise, obj.modifiers);
          obj.sets = dispatchBuildSets(scheme, anchorE1, 1.0, tier, obj.exercise, obj.modifiers, { dateKey: targetDateKey });
          const bpObj = state.schemeBlueprints?.[scheme] || DEFAULT_SCHEME_BLUEPRINTS[scheme] || {};
          const recObj = state.schemeRecipes?.[scheme] || {};
          const dPct = Number(bpObj.targetLoadPct || recObj.targetLoadPct) || 65;
          const dMins = Number(bpObj.defaultMinutes || recObj.defaultMinutes) || 8;
          const dTotalSecs = Math.max(60, dMins * 60);
          obj.fatigueWarning = false;
          obj.densityLoad = calcLoad(anchorE1, dPct);
          obj.densitySec = dTotalSecs;
          obj.densityTotalSec = dTotalSecs;
          obj.densityRunning = false;
          obj.densityTimerObj = null;
          obj.densityReps = 0;
          state.activeWorkout.push(obj);
        } else {
          const anchorE1 = getBaseAnchorE1rm(obj.exercise, obj.modifiers);
          const buildOpts = { dateKey: targetDateKey };
          if (state.stagingContext?.phaseOverride) buildOpts.phase = state.stagingContext.phaseOverride;
          obj.sets = dispatchBuildSets(scheme, anchorE1, 1.0, tier, obj.exercise, obj.modifiers, buildOpts);
          state.stagedSlots.push(obj);
        }
      } else {
        const t = state.modal.isMid ? state.activeWorkout[state.modal.idx] : state.stagedSlots[state.modal.idx];
        const oldScheme = t.scheme;
        const oldEx = t.exercise;
        t.category = state.modal.cat;
        t.exercise = state.modal.ex;
        t.modifiers = [...cleanMods];
        t.scheme = scheme;
        if (state.modal.isMid) {
          const anchorE1 = getBaseAnchorE1rm(t.exercise, t.modifiers);
          const hasLoggedSets = (t.sets || []).some(s => s && s.done);
          if (!state.isEditingHistorical && !hasLoggedSets && (oldScheme !== scheme || oldEx !== t.exercise)) {
            t.sets = dispatchBuildSets(scheme, anchorE1, 1.0, t.tier, t.exercise, t.modifiers, {
              dateKey: targetDateKey,
              isGrounding: t.isGrounding,
              skipBackoffs: t.skipBackoffs
            });
          }
        }
    }
    // Auto-sync modifier/exercise edits directly to historical dayLogs if editing history
    if (state.isEditingHistorical && state.historicalDateKey && state.dayLogs?.[state.historicalDateKey]?.workout?.exercises) {
      const histEx = state.dayLogs[state.historicalDateKey].workout.exercises[state.modal.idx];
      const activeEx = state.activeWorkout?.[state.modal.idx];
      if (histEx && activeEx) {
        histEx.category = activeEx.category;
        histEx.exercise = activeEx.exercise;
        histEx.modifiers = [...(activeEx.modifiers || [])];
        histEx.scheme = activeEx.scheme;
      }
    }
    state.modal.open = false;
    persist();
    triggerCloudSync(1500);
    safeRender();
  },

    // Mesocycle & Blueprint Architecture
    setActiveBlock(idx) { state.activeBlockIdx = Number(idx) || 0; state.activeWeek = 1; persist(); window.pushToCloud(false); safeRender(); },
    setActiveMacroBlock(idx) { state.activeBlockIdx = Number(idx) || 0; state.activeWeek = 1; persist(); window.pushToCloud(false); safeRender(); },
    setActiveWeek(w) { state.activeWeek = Math.max(1, Number(w) || 1); persist(); window.pushToCloud(false); safeRender(); },
    stepMesocycleWeek(delta) {
      if (!state.mesocycle || !state.mesocycle.length) return;
      const curIdx = Math.min(Math.max(0, Number(state.activeBlockIdx) || 0), state.mesocycle.length - 1);
      const curBlock = state.mesocycle[curIdx];
      const maxW = Math.max(1, Number(curBlock?.weeks) || 3);
      const nextW = (Number(state.activeWeek) || 1) + Number(delta);
      if (nextW >= 1 && nextW <= maxW) {
        state.activeWeek = nextW;
      } else if (nextW > maxW && curIdx < state.mesocycle.length - 1) {
        state.activeBlockIdx = curIdx + 1;
        state.activeWeek = 1;
        showToast(`Advanced to Block ${state.activeBlockIdx + 1}: ${state.mesocycle[state.activeBlockIdx].phase} (Week 1)`);
      } else if (nextW < 1 && curIdx > 0) {
        state.activeBlockIdx = curIdx - 1;
        state.activeWeek = Math.max(1, Number(state.mesocycle[state.activeBlockIdx]?.weeks) || 3);
      }
      persist();
      window.pushToCloud(false);
      safeRender();
    },
    addMacroBlock() { state.mesocycle.push({ id: Date.now(), phase: state.newBlockPhase, weeks: Number(state.newBlockWeeks), progressionMode: (['Accumulation', 'Hypertrophy', 'Deload', 'Resensitization'].includes(state.newBlockPhase) ? 'load' : 'intensity') }); syncMesocycleProgression(); persist(); window.pushToCloud(false); safeRender(); },
    
    deleteMacroBlock(idx) {
      if (state.mesocycle.length <= 1) return;
      state.mesocycle.splice(idx, 1);
      syncMesocycleProgression();
      persist();
      window.pushToCloud(false);
      safeRender();
    },

    setBlockProgressionMode(idx, mode) {
      if (state.mesocycle && state.mesocycle[idx]) {
        state.mesocycle[idx].progressionMode = mode;
        persist();
        if (window.pushToCloud) window.pushToCloud(false);
        safeRender();
      }
    },
    
    moveMacroBlock(idx, dir) {
      const target = idx + dir;
      if (target < 0 || target >= state.mesocycle.length) return;
      const item = state.mesocycle.splice(idx, 1)[0];
      state.mesocycle.splice(target, 0, item);
      syncMesocycleProgression();
      persist();
      window.pushToCloud(false);
      safeRender();
    },

    setMesocycleStartDate(dateStr) {
      state.mesocycleStartDate = normalizeDateKey(dateStr);
      syncMesocycleProgression();
      persist();
      window.pushToCloud(false);
      safeRender();
    },

    setMesocycleStartToMonday() {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      state.mesocycleStartDate = formatIsoDate(monday.getFullYear(), monday.getMonth(), monday.getDate());
      syncMesocycleProgression();
      persist();
      window.pushToCloud(false);
      showToast("Set start date to current Monday!");
      safeRender();
    },

    setWeekdaySplit(dayIdx, splitValue) { state.weekdaySplit[dayIdx] = splitValue; persist(); window.pushToCloud(false); safeRender(); },
    selectEditingBlueprint(name) { state.editingBlueprintName = name; safeRender(); },

    createNewBlueprint() {
      if (!state.newBlueprintName.trim()) return;
      const name = state.newBlueprintName.trim();
      if (!state.customSplitBlueprints[name]) {
        state.customSplitBlueprints[name] = [{ tier: 'Main', category: 'Knee Dominant', exercise: 'Squat', modifiers: [], scheme: 'Top Set + Back-off', isGrounding: false, skipBackoffs: false }];
        state.editingBlueprintName = name;
        state.newBlueprintName = '';
        persist();
        safeRender();
      }
    },

    deleteBlueprint(name) {
      if (confirm(`Delete the "${name}" split template?`)) {
        delete state.customSplitBlueprints[name];
        const remaining = Object.keys(state.customSplitBlueprints);
        state.editingBlueprintName = remaining[0] || 'Squat & Push Focus';
        persist();
        safeRender();
      }
    },

    addSlotToBlueprint(blueprintName) {
      state.modal = { open: true, idx: null, isMid: false, isNew: true, isSplitEditor: true, cat: 'Horizontal Push', ex: 'Bench Press', mods: [], scheme: 'Straight Sets' };
      safeRender();
    },

    deleteBlueprintSlot(blueprintName, slotIdx) {
      if (state.customSplitBlueprints[blueprintName]) {
        state.customSplitBlueprints[blueprintName].splice(slotIdx, 1);
        persist();
        safeRender();
      }
    },
updateSplitSlotTier(splitName, slotIdx, newTier) {
      if (state.customSplitBlueprints?.[splitName]?.[slotIdx]) {
        state.customSplitBlueprints[splitName][slotIdx].tier = newTier;
        persist();
        safeRender();
      }
    },

    toggleSplitGppMode(splitName) {
      if (!state.customSplitBlueprints?.[splitName]) return;
      const slots = state.customSplitBlueprints[splitName];
      const isCurrentlyAllAssistance = slots.every(s => s.tier === 'Assistance');

      slots.forEach((s, idx) => {
        s.tier = isCurrentlyAllAssistance ? (idx === 0 ? 'Main' : 'Secondary') : 'Assistance';
      });

      persist();
      showToast(isCurrentlyAllAssistance ? `Restored standard tiers for ${splitName}` : `Set ${splitName} to GPP (All Assistance)`);
      safeRender();
    },
    selectProgramPreset(progId) { state.selectedProgramId = progId; safeRender(); },
    setProgramPresetDays(days) { state.selectedProgramDays = Number(days); safeRender(); },

    launchProgramPreset(progId, days) {
      const prog = programPresets.find(p => p.id === progId);
      if (!prog) return;
      state.mesocycle = JSON.parse(JSON.stringify(prog.macro));
      state.mesocycleStartDate = core.getTodayDateString ? core.getTodayDateString() : formatIsoDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
      syncMesocycleProgression();
      const assignedSplit = prog.splits[days] || prog.splits[4];
      state.weekdaySplit = { ...assignedSplit };
      persist();
      window.pushToCloud(false);
      showToast(`Loaded ${prog.name} (${days}-Day)!`);
      state.screen = 'calendar';
      safeRender();
    },

    // Settings & Personalization
    setSetting(k, v) { state.settings[k] = v; persist(); window.pushToCloud(false); safeRender(); },
    updateE1rm(k, v) { 
      state.e1rms[k] = Number(v); 
      if (!state.anchorE1rms[k]) state.anchorE1rms[k] = Number(v);
      persist(); 
      triggerCloudSync(2000); 
    },
    saveSettings() { persist(); window.pushToCloud(false); state.screen = 'calendar'; safeRender(); },
    setTheme(themeName) { state.settings.theme = themeName; persist(); window.pushToCloud(false); safeRender(); },
    setFontFamily(fontName) { state.settings.fontFamily = fontName; persist(); window.pushToCloud(false); safeRender(); },
    setUiScale(scaleKey) { state.settings.uiScale = scaleKey; persist(); window.pushToCloud(false); safeRender(); },
    setUiStyle(styleKey) { state.settings.uiStyle = styleKey; persist(); window.pushToCloud(false); safeRender(); },
    setCustomAccent(colorHex) { state.settings.customAccent = colorHex; persist(); window.pushToCloud(false); safeRender(); },
    updateProfile(field, val) { state.profile[field] = (field === 'age' || field === 'bodyweight') ? Number(val) : val; persist(); window.pushToCloud(false); safeRender(); },

    // Dual-Bound Rep Matrix & Override Controllers
    updatePhaseRepMatrix(phase, tier, bound, val) {
      if (!state.phaseRepMatrix) state.phaseRepMatrix = JSON.parse(JSON.stringify(core.defaultPhaseRepMatrix));
      if (!state.phaseRepMatrix[phase]) state.phaseRepMatrix[phase] = { Main: { min: 4, max: 6 }, Secondary: { min: 6, max: 8 }, Assistance: { min: 10, max: 15 } };
      if (!state.phaseRepMatrix[phase][tier]) state.phaseRepMatrix[phase][tier] = { min: 6, max: 8 };

      const num = Math.max(1, Math.min(30, Number(val) || 1));
      if (bound === 'min') {
        state.phaseRepMatrix[phase][tier].min = num;
        if (state.phaseRepMatrix[phase][tier].min > state.phaseRepMatrix[phase][tier].max) {
          state.phaseRepMatrix[phase][tier].max = num;
        }
      } else if (bound === 'max') {
        state.phaseRepMatrix[phase][tier].max = num;
        if (state.phaseRepMatrix[phase][tier].max < state.phaseRepMatrix[phase][tier].min) {
          state.phaseRepMatrix[phase][tier].min = num;
        }
      } else if (typeof bound === 'object') {
        state.phaseRepMatrix[phase][tier] = normalizeRepBookends(bound);
      }

      persist();
      triggerCloudSync(2000);
      safeRender();
    },

    resetPhaseRepMatrix() {
      state.phaseRepMatrix = JSON.parse(JSON.stringify(core.defaultPhaseRepMatrix));
      persist();
      triggerCloudSync(2000);
      showToast("Reset Phase Rep Matrix to defaults");
      safeRender();
    },

    setExerciseRepOverride(exName, phaseOrAll, minVal, maxVal) {
      if (!state.exerciseRepOverrides) state.exerciseRepOverrides = {};
      if (!state.exerciseRepOverrides[exName]) state.exerciseRepOverrides[exName] = {};

      if ((minVal === '' || minVal === null || minVal === undefined) && (maxVal === '' || maxVal === null || maxVal === undefined)) {
        delete state.exerciseRepOverrides[exName][phaseOrAll];
        if (Object.keys(state.exerciseRepOverrides[exName]).length === 0) {
          delete state.exerciseRepOverrides[exName];
        }
      } else {
        const norm = normalizeRepBookends({ min: minVal, max: maxVal !== undefined ? maxVal : minVal }, 6, 8);
        state.exerciseRepOverrides[exName][phaseOrAll] = norm;
      }

      persist();
      triggerCloudSync(2000);
      safeRender();
    },

    deleteExerciseRepOverride(exName, phaseOrAll) {
      if (state.exerciseRepOverrides && state.exerciseRepOverrides[exName]) {
        delete state.exerciseRepOverrides[exName][phaseOrAll];
        if (Object.keys(state.exerciseRepOverrides[exName]).length === 0) {
          delete state.exerciseRepOverrides[exName];
        }
        persist();
        triggerCloudSync(2000);
        safeRender();
      }
    },

    // Movement & Modifier Registry Management
    setResTab(tab) { state.resTab = tab; safeRender(); },
    toggleNewExMeta(field) { state.newExMeta[field] = !state.newExMeta[field]; safeRender(); },

    toggleExMeta(exName, field) {
      if (!state.exerciseMeta[exName]) state.exerciseMeta[exName] = { ...getExMeta(exName) };
      state.exerciseMeta[exName][field] = !state.exerciseMeta[exName][field];
      persist();
      window.pushToCloud(false);
      safeRender();
    },

    addCustomExercise() {
      if (!state.newExName.trim()) return;
      const name = state.newExName.trim();
      const cat = state.newExCat;
      if (!state.exercises[cat]) state.exercises[cat] = [];
      if (!state.exercises[cat].includes(name)) {
        state.exercises[cat].push(name);
        state.exerciseMeta[name] = { ...state.newExMeta };
        if (!state.e1rms[name]) state.e1rms[name] = 135;
        if (!state.anchorE1rms[name]) state.anchorE1rms[name] = 135;
        persist();
        window.pushToCloud(false);
      }
      state.newExName = '';
      safeRender();
    },

    deleteExercise(cat, ex) {
      state.exercises[cat] = state.exercises[cat].filter(x => x !== ex);
      delete state.exerciseMeta[ex];
      if (state.exerciseRepOverrides && state.exerciseRepOverrides[ex]) {
        delete state.exerciseRepOverrides[ex];
      }
      persist();
      window.pushToCloud(false);
      safeRender();
    },

    addCustomModifier() {
      if (!state.newModName.trim()) return;
      const name = state.newModName.trim();
      const catObj = state.modifierCats.find(c => c.name === state.newModCat);
      if (catObj && !catObj.opts.includes(name)) {
        catObj.opts.push(name);
        persist();
        window.pushToCloud(false);
      }
      state.newModName = '';
      safeRender();
    },

    deleteModifier(catName, mod) {
      const catObj = state.modifierCats.find(c => c.name === catName);
      if (catObj) catObj.opts = catObj.opts.filter(x => x !== mod);
      persist();
      window.pushToCloud(false);
      safeRender();
    },

    // Analytics Controllers
    setAnalyticsLift(lift) { state.analyticsSelectedLift = lift; safeRender(); },
    setAnalyticsCalc(field, val) { state[field] = Number(val); safeRender(); },
    setAnalyticsMicrocycle(val) { state.analyticsMicrocycle = val; safeRender(); },

    // Data Backup, Migration & CSV Export
    exportBackup() {
      const backupData = {
        version: window.apexCore?.APP_VERSION || 'v4.8.2-PWA',
        timestamp: new Date().toISOString(),
        settings: state.settings,
        profile: state.profile,
        mesocycle: state.mesocycle,
        mesocycleStartDate: state.mesocycleStartDate,
        weekdaySplit: state.weekdaySplit,
        customSplitBlueprints: state.customSplitBlueprints,
        exerciseMeta: state.exerciseMeta,
        exercises: state.exercises,
        phaseRepMatrix: state.phaseRepMatrix,
        schemeRecipes: state.schemeRecipes,
        exerciseRepOverrides: state.exerciseRepOverrides,
        modifierCats: state.modifierCats,
        dayLogs: state.dayLogs,
        e1rms: state.e1rms,
        anchorE1rms: state.anchorE1rms,
        prLedger: state.prLedger
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `APEX_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Data backup file exported successfully!");
    },

    importBackup(event) {
      const file = event?.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (imported && typeof imported === 'object') {
            if (imported.settings) state.settings = { ...state.settings, ...imported.settings };
            if (imported.profile) state.profile = { ...state.profile, ...imported.profile };
            if (imported.mesocycle) state.mesocycle = imported.mesocycle;
            if (imported.mesocycleStartDate) state.mesocycleStartDate = imported.mesocycleStartDate;
            if (imported.weekdaySplit) state.weekdaySplit = imported.weekdaySplit;
            if (imported.customSplitBlueprints) state.customSplitBlueprints = imported.customSplitBlueprints;
            if (imported.exerciseMeta) state.exerciseMeta = imported.exerciseMeta;
            if (imported.exercises) state.exercises = imported.exercises;
            if (imported.phaseRepMatrix) state.phaseRepMatrix = imported.phaseRepMatrix;
            if (imported.schemeRecipes) state.schemeRecipes = imported.schemeRecipes;
            if (imported.exerciseRepOverrides) state.exerciseRepOverrides = imported.exerciseRepOverrides;
            if (imported.modifierCats) state.modifierCats = imported.modifierCats;
            if (imported.dayLogs) state.dayLogs = imported.dayLogs;
            if (imported.e1rms) state.e1rms = imported.e1rms;
            if (imported.anchorE1rms) state.anchorE1rms = imported.anchorE1rms;
            else state.anchorE1rms = { ...imported.e1rms };
            if (imported.prLedger) state.prLedger = imported.prLedger;

            persist();
            window.pushToCloud(false);
            showToast("Backup restored successfully!");
            safeRender();
          }
        } catch(err) {
          showToast("Failed to parse backup JSON file.");
        }
      };
      reader.readAsText(file);
    },

    exportCsvSummary() {
      const rows = [["Date", "Weight", "ReadinessScore", "WorkoutDuration", "WorkoutSRPE", "ExercisesCount", "Calories", "Protein", "Carbs", "Fat"]];
      const dates = Object.keys(state.dayLogs || {}).sort();
      dates.forEach(dKey => {
        const log = state.dayLogs[dKey];
        const nut = log.nutrition?.totals || {};
        rows.push([
          dKey,
          log.weight || "",
          log.recovery?.score || "",
          log.workout?.dur || "",
          log.workout?.srpe || "",
          log.workout?.exercises?.length || 0,
          nut.kcal || "",
          nut.p || "",
          nut.c || "",
          nut.f || ""
        ]);
      });

      const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `APEX_Summary_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    // PWA & Supabase Cloud Auth
    promptInstallApp() {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') state.canInstall = false;
          window.deferredPrompt = null;
          safeRender();
        });
      } else {
        state.showInstallGuide = true;
        safeRender();
      }
    },

    closeInstallGuide() { state.showInstallGuide = false; safeRender(); },
    openAuthModal() { state.authModal.open = true; state.authModal.msg = ''; safeRender(); },
    closeAuthModal() { state.authModal.open = false; safeRender(); },
    setAuthMode(mode) { state.authModal.mode = mode; safeRender(); },
    setAuthEmail(val) { state.authModal.email = val; },
    setAuthPassword(val) { state.authModal.password = val; },

    async handleAuthSubmit() {
      if (!window.sbClient && typeof window.initSupabase === 'function') window.initSupabase();
      if (!window.supabase) { 
        state.authModal.msg = 'Supabase client library missing.'; 
        state.authModal.msgType = 'err'; 
        safeRender(); 
        return; 
      }
      const { email, password, mode } = state.authModal;
      if (!email || !password) { 
        state.authModal.msg = 'Please enter both an email and password.'; 
        state.authModal.msgType = 'err'; 
        safeRender(); 
        return; 
      }
      state.authModal.msg = 'Connecting to Supabase...'; 
      state.authModal.msgType = 'info'; 
      safeRender();

      try {
        const client = window.supabase.createClient(state.supabaseConfig.url, state.supabaseConfig.anonKey);
        if (mode === 'signup') {
          const { error } = await client.auth.signUp({ email, password });
          if (error) throw error;
          state.authModal.msg = 'Account created! Signing in...'; 
          state.authModal.msgType = 'ok'; 
          safeRender();
          const { data, error: inErr } = await client.auth.signInWithPassword({ email, password });
          if (!inErr && data.user) { 
            state.user = data.user; 
            state.authModal.open = false; 
            await window.pushToCloud(true); 
          }
        } else {
          const { data, error: inErr } = await client.auth.signInWithPassword({ email, password });
          if (inErr) throw inErr;
          state.user = data.user; 
          state.authModal.open = false; 
          await window.pullFromCloud(true); 
        }
      } catch (err) {
        state.authModal.msg = err.message; 
        state.authModal.msgType = 'err'; 
      }
      safeRender();
    },

    async handleSignOut() {
      try {
        const client = window.supabase.createClient(state.supabaseConfig.url, state.supabaseConfig.anonKey);
        await client.auth.signOut();
      } catch(e) {}
      state.user = null; 
      state.syncStatus = 'offline'; 
      state.authModal.open = false;
      showToast("Signed out of Supabase");
      safeRender();
    }
  });
})();
