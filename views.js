// ============================================================================
// APEX TRAINING ENGINE - PART 4 OF 4: VIEW LAYER, RENDER PIPELINE & BOOTSTRAP
// Complete Unabridged Production Release v4.6.5-PWA (Full View Architecture)
// Includes: On-Demand Block Transition Wizard (Tier Routing & Telemetry Analysis),
//           Multi-Engine 1RM Selection UI (APEX, Epley, Brzycki, Wathan, Lombardi),
//           1RM Mathematical Breakdown in System Codex Screen,
//           Neutral Scheme Nomenclature Display Engine with Backward Aliasing,
//           Dedicated Programming Builder (Chassis Editor & "Save Changes" Controls),
//           Anticipated Target Date Staging (Dynamic Phase & Week Resolution),
//           Discrete 0.5 RPE Increment Dropdowns & Input Formatting,
//           Full-Width Mobile Calendar Grid, 3 Compact Micro-Square Badges,
//           Decoupled Readiness Screen (Discrete Pills, Zero Bodyweight Stamping),
//           Live In-Session Lift Metrics (e1RM, Reps, Fatigue Decay % next to Add Set),
//           Multi-Attempt Resilient DOM Bootstrapper & Mobile Blank-Screen Guard
// ============================================================================

(function() {
  const state = window.state || {};
  const core = window.apexCore || {};
  const renderCustomRpeTool = window.renderCustomRpeTool || function() { return ''; };
const extendRpeMatrix = window.extendRpeMatrix;
  const generateSetsFromBlueprint = window.generateSetsFromBlueprint;
const getE1RM = window.getE1RM || function() { return 0; };
const DEFAULT_SCHEME_BLUEPRINTS = window.DEFAULT_SCHEME_BLUEPRINTS || {};

  const { 
    fmtTime = (sec) => {
      const s = Math.max(0, Math.floor(Number(sec) || 0));
      return `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;
    },
    getCurKey = () => '',
    getCurLog = () => ({}),
    getDayFocus = () => 'Rest & Recovery',
    monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'],
    availableThemes = ['Midnight', 'Onyx', 'Slate', 'Forest', 'Crimson', 'Nordic', 'Amber', 'Cyberpunk'],
    availableFonts = ['JetBrains Mono', 'Inter', 'Roboto', 'Geist', 'Cinzel'],
    availablePhases = ['Accumulation','Hypertrophy','Intensification','Powerbuilding','Strength','Realization / Peaking','Resensitization','DUP','Deload','GPP'],
    hypertrophySchemes = [],
    strengthSchemes = [],
    phaseDescriptions = {},
    schemeDescriptions = {},
    landmarkThresholds = {},
    muscleGroupTaxonomy = [],
    getReadinessScore = () => 80,
    getReadinessBand = () => ({ name: 'Optimal', badge: '', desc: '', factor: 1.0, rpeCap: 10, setReduction: 0 }),
    getLatestBodyweight = () => 196.2,
    getMesocyclePosition = () => ({ blockIdx: 0, week: 1, phase: 'Hypertrophy', block: { phase: 'Hypertrophy', weeks: 3 } }),
    metricDescs = {},
    programPresets = [],
    getLiftHistory = () => [],
    getPct = (r, rpe, f) => Math.max(40, Math.round((100 - (r - 1 + (10 - rpe)) * 2.15) * 10) / 10),
    roundLoad = (v) => Math.round(v / 5) * 5,
    roundRpe = (v) => {
      const num = Number(v);
      if (isNaN(num) || num < 5.0) return 5.5;
      const clamped = Math.min(10.0, Math.max(5.5, num));
      return Math.round(clamped * 2) / 2;
    },
    sanitizeModifiers = (m) => Array.isArray(m) ? m : [],
    formatIsoDate = (y, m, d) => `${y}-${String(Number(m)+1).padStart(2,'0')}-${String(Number(d)).padStart(2,'0')}`,
    normalizeDateKey = (k) => k,
    normalizeSchemeName = (s) => s,
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
    getExerciseLoad = (exName, w, dKey) => {
      const num = Number(w) || 0;
      const bw = getLatestBodyweight(dKey);
      if (exName === 'BW Pull Up' || exName === 'Pull Up' || exName === 'BW Chin Up') return Math.round(bw * 1.0) + num;
      if (exName === 'BW Dips' || exName === 'Dips') return Math.round(bw * 0.90) + num;
      if (exName === 'Push Up') return Math.round(bw * 0.65) + num;
      if (exName === 'Ab Wheel' || exName === 'Hanging Leg Raise') return Math.round(bw * 0.50) + num;
      return num;
    },
    calculate1RmEquivalent = (w, r, f) => Math.round(w * (1 + (r / 30)))
  } = core;

  const defaultPhaseRepMatrix = core.defaultPhaseRepMatrix || {
    'Strength':              { Main: { min: 2, max: 4 },  Secondary: { min: 4, max: 6 },  Assistance: { min: 8, max: 12 } },
    'Realization / Peaking': { Main: { min: 1, max: 3 },  Secondary: { min: 3, max: 5 },  Assistance: { min: 8, max: 10 } },
    'Intensification':       { Main: { min: 3, max: 5 },  Secondary: { min: 5, max: 7 },  Assistance: { min: 8, max: 12 } },
    'Powerbuilding':         { Main: { min: 3, max: 5 },  Secondary: { min: 6, max: 8 },  Assistance: { min: 10, max: 12 } },
    'Hypertrophy':           { Main: { min: 6, max: 8 },  Secondary: { min: 8, max: 10 }, Assistance: { min: 10, max: 15 } },
    'Accumulation':          { Main: { min: 8, max: 10 }, Secondary: { min: 10, max: 12 }, Assistance: { min: 12, max: 15 } },
    'Resensitization':       { Main: { min: 5, max: 7 },  Secondary: { min: 7, max: 9 },  Assistance: { min: 10, max: 12 } },
    'Deload':                { Main: { min: 4, max: 6 },  Secondary: { min: 6, max: 8 },  Assistance: { min: 8, max: 10 } },
    'DUP':                   { Main: { min: 3, max: 6 },  Secondary: { min: 6, max: 10 }, Assistance: { min: 10, max: 12 } },
    'GPP':                   { Main: { min: 8, max: 12 }, Secondary: { min: 10, max: 14 }, Assistance: { min: 12, max: 20 } }
  };

  const defaultMuscleMap = {
    'Squat': { 'Quads': 1.0, 'Glutes': 0.75 },
    'Belt Squat': { 'Quads': 1.0, 'Glutes': 0.5 },
    'Front Squat': { 'Quads': 1.0, 'Core': 0.5 },
    'Bulgarian Split Squat': { 'Quads': 1.0, 'Glutes': 0.75 },
    'Leg Extensions': { 'Quads': 1.0 },
    'Hack Squat': { 'Quads': 1.0, 'Glutes': 0.5 },
    'Lunges': { 'Quads': 1.0, 'Glutes': 0.75 },
    'Deadlift (conv)': { 'Hamstrings': 1.0, 'Glutes': 1.0, 'Back / Lats': 0.5, 'Traps': 0.5 },
    'Deadlift (sumo)': { 'Hamstrings': 0.75, 'Glutes': 1.0, 'Quads': 0.5 },
    'RDL': { 'Hamstrings': 1.0, 'Glutes': 1.0 },
    'SLDL': { 'Hamstrings': 1.0, 'Glutes': 0.75 },
    'Hip Thrust': { 'Glutes': 1.0, 'Hamstrings': 0.5 },
    'Leg Curls': { 'Hamstrings': 1.0 },
    'Bench Press': { 'Chest': 1.0, 'Triceps': 0.5, 'Front Delts': 0.5 },
    'Incline Bench': { 'Chest': 1.0, 'Front Delts': 0.75, 'Triceps': 0.5 },
    'Floor Press': { 'Chest': 0.75, 'Triceps': 1.0 },
    'Spoto Press': { 'Chest': 1.0, 'Triceps': 0.5 },
    'Larsen Bench': { 'Chest': 1.0, 'Triceps': 0.5 },
    'Push Up': { 'Chest': 1.0, 'Triceps': 0.5, 'Core': 0.5 },
    'Dips': { 'Chest': 0.75, 'Triceps': 1.0, 'Front Delts': 0.5 },
    'BW Dips': { 'Chest': 0.75, 'Triceps': 1.0 },
    'Standing Military': { 'Front Delts': 1.0, 'Triceps': 0.75, 'Side/Rear Delts': 0.5 },
    'Seated Military': { 'Front Delts': 1.0, 'Triceps': 0.75 },
    'Row': { 'Back / Lats': 1.0, 'Biceps': 0.5, 'Traps': 0.5 },
    'Chest Supported Row': { 'Back / Lats': 1.0, 'Biceps': 0.5, 'Traps': 0.5 },
    'Cable Row': { 'Back / Lats': 1.0, 'Biceps': 0.5 },
    'Pendlay Row': { 'Back / Lats': 1.0, 'Traps': 0.75, 'Hamstrings': 0.5 },
    'T-Bar Row': { 'Back / Lats': 1.0, 'Biceps': 0.5, 'Traps': 0.5 },
    'Face Pull': { 'Side/Rear Delts': 1.0, 'Traps': 0.75 },
    'Pull Down': { 'Back / Lats': 1.0, 'Biceps': 0.5 },
    'Pull Up': { 'Back / Lats': 1.0, 'Biceps': 0.75 },
    'BW Pull Up': { 'Back / Lats': 1.0, 'Biceps': 0.75 },
    'Shrugs': { 'Traps': 1.0 },
    'Upright Row': { 'Side/Rear Delts': 1.0, 'Traps': 0.75, 'Biceps': 0.5 },
    'Ab Wheel': { 'Core': 1.0 },
    'Hanging Leg Raise': { 'Core': 1.0 },
    'Plank': { 'Core': 1.0 },
    'Suitcase Carry': { 'Core': 1.0, 'Traps': 0.5 },
    'Curls': { 'Biceps': 1.0 },
    'Hammer Curl': { 'Biceps': 1.0 },
    'Incline Curl': { 'Biceps': 1.0 },
    'Lateral Raise': { 'Side/Rear Delts': 1.0 },
    'Lu Raise': { 'Side/Rear Delts': 1.0, 'Traps': 0.5 },
    'Tricep Extension': { 'Triceps': 1.0 },
    'Tricep Pushdowns': { 'Triceps': 1.0 },
    'Calf Raise': { 'Calves': 1.0 }
  };

  const exerciseMuscleMap = core.exerciseMuscleMap || defaultMuscleMap;

  if (!state.analyticsTimeframe) state.analyticsTimeframe = '3M';
  if (!state.analyticsTab) state.analyticsTab = 'lifts';
  if (!state.analyticsBwView) state.analyticsBwView = 'graph';
  if (!state.analyticsVolumeMicrocycle) state.analyticsVolumeMicrocycle = 'cur_cal_week';
  if (!state.activeRepOverrideEx) state.activeRepOverrideEx = null;
  if (!state.overrideDraft) state.overrideDraft = { phase: 'All', minReps: 8, maxReps: 12 };
  if (!state.activeRecipeScheme) state.activeRecipeScheme = 'Reverse Pyramid';
  if (!state.wizardModal) state.wizardModal = { open: false, data: null };
if (!state.rpeMatrixModal) {
  state.rpeMatrixModal = { open: false, exName: '', sets: [{ weight: 225, reps: 5, rpe: 8 }] };
}
window.appActions.openRpeMatrixModal = function(exName) {
  let initialSets = [{ weight: 225, reps: 5, rpe: 8 }];
  if (exName && typeof getLiftHistory === 'function') {
    const history = getLiftHistory(exName, false, []) || [];
    const latest = history[0];
    if (latest && latest.sets && latest.sets.length > 0) {
      initialSets = latest.sets
        .filter(s => s && s.done && s.actualWeight)
        .slice(0, 3)
        .map(s => ({
          weight: parseFloat(s.actualWeight) || 0,
          reps: parseFloat(s.actualReps) || 0,
          rpe: parseFloat(s.actualRpe || s.rpe) || 8
        }));
    }
  }
  state.rpeMatrixModal = { open: true, exName: exName || 'Custom Matrix', sets: initialSets };
  window.render();
};

window.appActions.closeRpeMatrixModal = function() {
  state.rpeMatrixModal.open = false;
  window.render();
};

window.appActions.updateRpeMatrixSet = function(idx, field, val) {
  if (state.rpeMatrixModal.sets[idx]) {
    state.rpeMatrixModal.sets[idx][field] = parseFloat(val) || 0;
    window.render();
  }
};

window.appActions.addRpeMatrixSet = function() {
  state.rpeMatrixModal.sets.push({ weight: 225, reps: 5, rpe: 8 });
  window.render();
};

window.appActions.removeRpeMatrixSet = function(idx) {
  if (state.rpeMatrixModal.sets.length > 1) {
    state.rpeMatrixModal.sets.splice(idx, 1);
    window.render();
  }
};
  if (!window.appActions) window.appActions = {};

  window.appActions.setAnalyticsTimeframe = function(tf) { 
    state.analyticsTimeframe = tf; 
    window.render(); 
  };
  window.appActions.setAnalyticsTab = function(tab) { 
    state.analyticsTab = tab; 
    window.render(); 
  };
  window.appActions.toggleBwView = function() { 
    state.analyticsBwView = (state.analyticsBwView === 'table') ? 'graph' : 'table'; 
    window.render(); 
  };
  window.appActions.setVolumeMicrocycle = function(val) { 
    state.analyticsVolumeMicrocycle = val; 
    window.render(); 
  };
  window.appActions.toggleExRepOverride = function(exName) {
    state.activeRepOverrideEx = (state.activeRepOverrideEx === exName) ? null : exName;
    state.overrideDraft = { phase: 'All', minReps: 8, maxReps: 12 };
    window.render();
  };

  function applyGlobalThemeAndFont() {
    const activeTheme = (state.settings?.theme || 'Midnight').toLowerCase();
    const activeStyle = state.settings?.uiStyle || 'glass';
    document.body.className = `theme-${activeTheme} style-${activeStyle}`;
    
    const themeColors = {
      onyx: { bg: '#000000', card: '#0f0f10', input: '#19191b', border: '#2b2b2f' },
      graphite: { bg: '#0d0e11', card: '#16181d', input: '#22252c', border: '#31353f' },
      midnight: { bg: '#070b12', card: '#0e1524', input: '#162238', border: '#263756' },
      abyss: { bg: '#04090e', card: '#0b141e', input: '#132130', border: '#1f354c' },
      slate: { bg: '#0f172a', card: '#1e293b', input: '#334155', border: '#475569' },
      vapor: { bg: '#0a0a0c', card: '#141418', input: '#1d1d24', border: '#2e2e38' },
      espresso: { bg: '#0d0a09', card: '#191412', input: '#271f1d', border: '#3d322f' }
    };

    const curThemeObj = themeColors[activeTheme] || themeColors.midnight;
    document.documentElement.style.setProperty('--bg-main', curThemeObj.bg);
    document.documentElement.style.setProperty('--card-bg', curThemeObj.card);
    document.documentElement.style.setProperty('--input-bg', curThemeObj.input);
    document.documentElement.style.setProperty('--border-sub', curThemeObj.border);

    const font = state.settings?.fontFamily || 'JetBrains Mono';
    
    let fontLink = document.getElementById('apex-webfonts-link');
    if (!fontLink) {
      fontLink = document.createElement('link');
      fontLink.id = 'apex-webfonts-link';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Geist:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap';
      document.head.appendChild(fontLink);
    }

    let fontStyle = document.getElementById('apex-font-override');
    if (!fontStyle) {
      fontStyle = document.createElement('style');
      fontStyle.id = 'apex-font-override';
      document.head.appendChild(fontStyle);
    }
    fontStyle.textContent = `
      html, body, #app, #app *, .font-mono {
        font-family: '${font}', monospace, sans-serif !important;
      }
      #app main::after {
        content: '';
        display: block;
        height: 6.5rem;
        width: 100%;
        flex-shrink: 0;
      }
      @media (min-width: 768px) {
        #app main::after {
          height: 1.5rem !important;
        }
      }
    `;
    document.documentElement.style.fontFamily = `'${font}', monospace, sans-serif`;

    let styleOverride = document.getElementById('apex-style-override');
    if (!styleOverride) {
      styleOverride = document.createElement('style');
      styleOverride.id = 'apex-style-override';
      document.head.appendChild(styleOverride);
    }
    styleOverride.textContent = `
      /* Spring micro-physics */
      .tactile {
        transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.12s ease !important;
      }
      .tactile:active {
        transform: scale(0.96) !important;
        filter: brightness(1.1) !important;
      }

      /* 1. Acrylic Glass: Layered blur, soft depth, specular edge light */
      body.style-glass .bg-card,
      body.style-glass .bg-card-sub {
        background-color: var(--card-bg) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.08) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
      }
      body.style-glass .bg-input,
      body.style-glass input[type="number"],
      body.style-glass input[type="text"] {
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.35) !important;
      }

      /* 2. Tactical Matte: Solid high contrast, sharp technical borders */
      body.style-tactical .bg-card,
      body.style-tactical .bg-card-sub {
        background-color: var(--card-bg) !important;
        border: 1px solid rgba(255, 255, 255, 0.18) !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      body.style-tactical .bg-input,
      body.style-tactical input[type="number"],
      body.style-tactical input[type="text"] {
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5) !important;
      }

      /* 3. Neo-Onyx: Minimalist flush panels */
      body.style-minimal .bg-card,
      body.style-minimal .bg-card-sub {
        background-color: var(--card-bg) !important;
        border: 1px solid rgba(255, 255, 255, 0.04) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6) !important;
      }
      body.style-minimal .bg-input,
      body.style-minimal input[type="number"],
      body.style-minimal input[type="text"] {
        border: 1px solid transparent !important;
        background-color: rgba(0, 0, 0, 0.35) !important;
      }

      /* Global Amber Neutralization: Converts amber highlights to clean slate & chosen accent */
      [class*="text-amber-300"],
      [class*="text-amber-400"] {
        color: #cbd5e1 !important;
      }
      select [class*="text-amber"],
      input[class*="text-amber"] {
        color: var(--accent-primary) !important;
      }
      [class*="border-amber"] {
        border-color: rgba(255, 255, 255, 0.08) !important;
      }
    `;

    const scaleMap = { xs: '13px', s: '14.5px', m: '16px', l: '18px' };
    const activeScale = scaleMap[state.settings?.uiScale] || '16px';
    document.documentElement.style.setProperty('--ui-scale', activeScale);
    document.documentElement.style.fontSize = activeScale;

    if (state.settings?.customAccent) {
      document.documentElement.style.setProperty('--accent-primary', state.settings.customAccent);
      document.documentElement.style.setProperty('--accent-glow', state.settings.customAccent + '55');
      document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${state.settings.customAccent} 0%, #0284c7 100%)`);
    }
  }

  function dateKeyToEpoch(dKey) {
    if (!dKey || typeof dKey !== 'string') return 0;
    const parts = dKey.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return 0;
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getTime();
  }

  function getTimeframeCutoff(tf) {
  const now = Date.now();
  const dayMs = 86400000; // 24 hours in milliseconds

  if (tf === '1M') return now - (30 * dayMs);
  if (tf === '3M') return now - (90 * dayMs);
  if (tf === '6M') return now - (180 * dayMs);
  if (tf === '1Y') return now - (365 * dayMs);
  if (tf === '3Y') return now - (1095 * dayMs);
  if (tf === '5Y') return now - (1825 * dayMs);
  if (tf === 'All') return 0;

  // Default fallback (3 months)
  return now - (90 * dayMs);
}

  function getEverUsedLiftVariants() {
    const variants = new Set();
    Object.keys(state.dayLogs || {}).forEach(dKey => {
      const workout = state.dayLogs[dKey]?.workout;
      if (workout && Array.isArray(workout.exercises)) {
        workout.exercises.forEach(exObj => {
          if (exObj && exObj.exercise) {
            const cleanMods = sanitizeModifiers(exObj.modifiers || []);
            const vKey = core.getVariantKey ? core.getVariantKey(exObj.exercise, cleanMods) : exObj.exercise;
            const hasDoneSet = (exObj.sets || []).some(s => s && s.done);
            if (hasDoneSet || (exObj.sets && exObj.sets.length > 0)) {
              variants.add(vKey);
            }
          }
        });
      }
    });

    if (Array.isArray(state.prLedger)) {
      state.prLedger.forEach(item => {
        if (item && item.lift) variants.add(item.lift);
      });
    }

    const list = Array.from(variants).sort();
    return list.length ? list : ['Squat', 'Bench Press', 'Deadlift (conv)'];
  }

  function parseVariantKey(vKey) {
    if (!vKey || !vKey.includes(' [')) return { baseName: vKey || 'Squat', mods: [] };
    const parts = vKey.split(' [');
    const baseName = parts[0];
    const mods = parts[1].replace(/\]$/, '').split(', ').map(s => s.trim()).filter(Boolean);
    return { baseName, mods };
  }

  function getCalendarWeekBounds(offsetWeeks = 0) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    
    const mon = new Date(now);
    mon.setDate(now.getDate() + diffToMon + (offsetWeeks * 7));
    mon.setHours(0, 0, 0, 0);

    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    sun.setHours(23, 59, 59, 999);

    const monLabel = `${mon.getMonth() + 1}/${mon.getDate()}`;
    const sunLabel = `${sun.getMonth() + 1}/${sun.getDate()}`;

    return {
      monTime: mon.getTime(),
      sunTime: sun.getTime(),
      rangeLabel: `${monLabel} - ${sunLabel}`
    };
  }

  function getCalendarMicrocycleVolume(modeKey = 'cur_cal_week') {
    const totals = {};
    muscleGroupTaxonomy.forEach(m => totals[m] = 0);

    let startEpoch = 0;
    let endEpoch = Infinity;

    if (modeKey === 'cur_cal_week') {
      const b = getCalendarWeekBounds(0);
      startEpoch = b.monTime;
      endEpoch = b.sunTime;
    } else if (modeKey === 'prev_cal_week') {
      const b = getCalendarWeekBounds(-1);
      startEpoch = b.monTime;
      endEpoch = b.sunTime;
    } else if (modeKey === 'two_wks_ago') {
      const b = getCalendarWeekBounds(-2);
      startEpoch = b.monTime;
      endEpoch = b.sunTime;
    } else if (modeKey === 'last_30') {
      startEpoch = Date.now() - (30 * 86400000);
      endEpoch = Date.now();
    }

    Object.keys(state.dayLogs || {}).forEach(dKey => {
      const epoch = dateKeyToEpoch(dKey);
      if (epoch < startEpoch || epoch > endEpoch) return;
      
      const workout = state.dayLogs[dKey]?.workout;
      if (workout && Array.isArray(workout.exercises)) {
        workout.exercises.forEach(exObj => {
          const completedSets = (exObj.sets || []).filter(s => s && s.done).length;
          if (completedSets > 0) {
            const attribution = exerciseMuscleMap[exObj.exercise] || { 'Back / Lats': 1.0 };
            Object.keys(attribution).forEach(muscle => {
              if (totals[muscle] !== undefined) {
                totals[muscle] += completedSets * (attribution[muscle] || 0);
              }
            });
          }
        });
      }
    });

    return totals;
  }

  function renderRichChartSvg(dataPoints, unit = 'lbs', strokeColor = null) {
  strokeColor = 'var(--accent-primary, var(--accent, ' + (state.settings?.customAccent || '#ff4d00') + '))';
    const cleanPoints = (dataPoints || []).filter(p => p && typeof p.val === 'number' && !isNaN(p.val) && isFinite(p.val));
    if (cleanPoints.length < 2) {
      return `<div class="text-slate-500 text-xs text-center py-10 font-mono">Need at least 2 recorded sessions in this timeframe to plot trend curve.</div>`;
    }

    const vals = cleanPoints.map(p => p.val);
    let minV = Math.min(...vals);
    let maxV = Math.max(...vals);
    let span = maxV - minV;

    if (span <= 0) {
      minV = Math.max(0, minV - 5);
      maxV += 5;
      span = maxV - minV;
    } else {
      const pad = span * 0.10;
      minV = Math.max(0, Math.floor((minV - pad) * 10) / 10);
      maxV = Math.ceil((maxV + pad) * 10) / 10;
      span = maxV - minV;
    }

    const midV = Math.round(((minV + maxV) / 2) * 10) / 10;

    const svgW = 340;
    const svgH = 155;
    const padL = 46;
    const padR = 14;
    const padT = 16;
    const padB = 26;

    const plotW = svgW - padL - padR;
    const plotH = svgH - padT - padB;

    const n = cleanPoints.length;
    const coords = cleanPoints.map((p, idx) => {
      const x = padL + (idx * (plotW / (n - 1)));
      const y = padT + plotH - (((p.val - minV) / (span || 1)) * plotH);
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, p };
    });

    const ptsStr = coords.map(c => `${c.x},${c.y}`).join(' ');

    let xTicks = '';
    const step = Math.max(1, Math.floor((n - 1) / 3));
    const tickIndices = new Set([0, n - 1]);
    for (let i = step; i < n - 1; i += step) tickIndices.add(i);

    Array.from(tickIndices).sort((a, b) => a - b).forEach(idx => {
      const c = coords[idx];
      if (c) {
        xTicks += `
          <line x1="${c.x}" y1="${padT + plotH}" x2="${c.x}" y2="${padT + plotH + 4}" stroke="#64748b" stroke-width="1" />
          <text x="${c.x}" y="${padT + plotH + 14}" fill="#94a3b8" font-size="8" text-anchor="middle">${c.p.label || ''}</text>
        `;
      }
    });

    const latestPt = cleanPoints[cleanPoints.length - 1];
    return `
      <div class="apex-chart-wrap w-full space-y-1">
        <div class="flex justify-between items-center px-1 text-[9px] font-mono">
          <span class="text-slate-500">Tap/hover point to inspect</span>
          <span class="apex-chart-readout text-accent font-bold">${latestPt.date || latestPt.label}: ${latestPt.val}${unit}</span>
        </div>
        <svg class="w-full h-40 overflow-visible font-mono select-none" viewBox="0 0 ${svgW} ${svgH}">
        <line x1="${padL}" y1="${padT}" x2="${svgW - padR}" y2="${padT}" stroke="#334155" stroke-dasharray="3,3" stroke-width="1" />
        <line x1="${padL}" y1="${padT + plotH / 2}" x2="${svgW - padR}" y2="${padT + plotH / 2}" stroke="#334155" stroke-dasharray="3,3" stroke-width="1" />
        <line x1="${padL}" y1="${padT + plotH}" x2="${svgW - padR}" y2="${padT + plotH}" stroke="#475569" stroke-width="1.5" />
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#475569" stroke-width="1.5" />

        <text x="${padL - 6}" y="${padT + 4}" fill="#94a3b8" font-size="8" text-anchor="end">${Math.round(maxV)}${unit}</text>
        <text x="${padL - 6}" y="${padT + (plotH / 2) + 3}" fill="#64748b" font-size="8" text-anchor="end">${Math.round(midV)}${unit}</text>
        <text x="${padL - 6}" y="${padT + plotH + 3}" fill="#94a3b8" font-size="8" text-anchor="end">${Math.round(minV)}${unit}</text>

        <polyline fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsStr}" />
        ${coords.map(c => `
          <circle cx="${c.x}" cy="${c.y}" r="3.5" fill="var(--card-bg, #0e1524)" stroke="${strokeColor}" stroke-width="2" class="cursor-pointer"
            onclick="const r=this.closest('.apex-chart-wrap')?.querySelector('.apex-chart-readout'); if(r) r.innerText='${c.p.date || c.p.label}: ${c.p.val}${unit}';"
            onmouseenter="const r=this.closest('.apex-chart-wrap')?.querySelector('.apex-chart-readout'); if(r) r.innerText='${c.p.date || c.p.label}: ${c.p.val}${unit}';">
            <title>${c.p.date || c.p.label}: ${c.p.val}${unit}</title>
          </circle>
        `).join('')}
        ${xTicks}
        </svg>
      </div>
    `;
  }

  window.renderSyncIndicator = function() {
    const btn = document.getElementById('cloud-sync-btn');
    if (!btn) return;
    if (state.user) {
      btn.innerHTML = state.syncStatus === 'synced'
        ? '☁️ <span class="text-emerald-400 font-bold">Synced</span>'
        : (state.syncStatus === 'syncing' ? '☁️ <span class="text-amber-400">Syncing...</span>' : '☁️ <span class="text-red-400">Sync Err</span>');
    } else {
      btn.innerHTML = '☁️ <span class="text-blue-400 font-bold">Cloud Sync</span>';
    }
  };
  function generateRpeMatrix(performances, roundTo = 5) {
  const valid = (performances || []).filter(p => p.weight > 0 && p.reps > 0);
  if (!valid.length) return null;

  const e1rms = valid.map(p => {
    const cleanRpe = p.rpe && !isNaN(p.rpe) ? Math.min(Math.max(p.rpe, 6), 10) : 10;
    const rEff = p.reps + (10 - cleanRpe);
    return p.weight * (1 + rEff / 30);
  });
  const avgE1RM = e1rms.reduce((a, b) => a + b, 0) / e1rms.length;

  const repsList = [1, 2, 3, 4, 5, 6, 8, 10];
  const rpeList = [10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5];

  const rows = rpeList.map(rpe => {
    const row = { rpe, loads: {} };
    repsList.forEach(reps => {
      const rEff = reps + (10 - rpe);
      const rawLoad = avgE1RM / (1 + rEff / 30);
      row.loads[reps] = Math.round(rawLoad / roundTo) * roundTo;
    });
    return row;
  });

  return { avgE1RM, repsList, rows };
}

function renderRpeMatrixComponent(config) {
  const { title, sets, isModal = false } = config;
  const matrix = generateRpeMatrix(sets);
  const avgE1RM = matrix ? Math.round(matrix.avgE1RM) : 0;

  return `
    <div class="space-y-3">
      <!-- Input Samples Row -->
      <div class="bg-input/60 p-2.5 rounded-xl border border-sub space-y-2">
        <div class="flex justify-between items-center text-[11px] font-mono text-slate-400">
          <span>ANCHOR PERFORMANCES</span>
          <span class="text-accent font-bold">Base e1RM: ${avgE1RM} lbs</span>
        </div>
        <div class="space-y-1.5">
          ${sets.map((s, idx) => `
            <div class="flex items-center space-x-1.5 text-xs font-mono">
              <input type="number" step="5" value="${s.weight}" onchange="appActions.updateRpeMatrixSet(${idx}, 'weight', this.value)" class="w-16 bg-card border border-sub rounded px-1.5 py-1 text-center text-white" placeholder="lbs">
              <span class="text-slate-500">lbs ×</span>
              <input type="number" step="1" value="${s.reps}" onchange="appActions.updateRpeMatrixSet(${idx}, 'reps', this.value)" class="w-12 bg-card border border-sub rounded px-1.5 py-1 text-center text-white" placeholder="reps">
              <span class="text-slate-500">@</span>
              <input type="number" step="0.5" value="${s.rpe}" onchange="appActions.updateRpeMatrixSet(${idx}, 'rpe', this.value)" class="w-12 bg-card border border-sub rounded px-1.5 py-1 text-center text-white" placeholder="RPE">
              ${sets.length > 1 ? `<button type="button" onclick="appActions.removeRpeMatrixSet(${idx})" class="text-rose-400 hover:text-rose-300 px-1">✕</button>` : ''}
            </div>
          `).join('')}
        </div>
        <button type="button" onclick="appActions.addRpeMatrixSet()" class="text-[10px] font-mono text-accent hover:underline">+ Add Calibration Set</button>
      </div>

      <!-- Target Load Matrix Table -->
      <div class="overflow-x-auto rounded-xl border border-sub bg-card">
        <table class="w-full text-center text-xs font-mono">
          <thead>
            <tr class="text-slate-400 border-b border-sub bg-input/40">
              <th class="py-1.5 px-2 text-left text-[10px]">RPE</th>
              ${(matrix ? matrix.repsList : [1, 2, 3, 4, 5, 6, 8, 10]).map(r => `<th class="py-1.5 px-1 text-[10px]">${r}r</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-sub/20">
            ${matrix ? matrix.rows.map(row => `
              <tr class="hover:bg-input/30">
                <td class="py-1.5 px-2 text-left font-bold text-accent text-[11px]">${row.rpe}</td>
                ${matrix.repsList.map(r => `<td class="py-1.5 px-1 text-slate-200 text-[11px]">${row.loads[r]}</td>`).join('')}
              </tr>
            `).join('') : `<tr><td colspan="9" class="py-4 text-slate-500 text-xs">Enter valid set data above</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
function renderBottomNav() {
  const cur = state.screen;
  const isWkActive = state.activeWorkout && state.activeWorkout.length > 0;
  const targetWorkoutScreen = isWkActive ? 'logger' : 'staging';

  const navItems = [
    {
      id: 'calendar',
      label: 'Home',
      action: "appActions.navigate('calendar', event)",
      active: cur === 'calendar',
      icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
    },
    {
      id: 'workout',
      label: isWkActive ? 'Active' : 'Stage',
      action: `appActions.navigate('${targetWorkoutScreen}', event)`,
      active: cur === 'logger' || cur === 'staging',
      badge: isWkActive,
      icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M5 8v8"/><path d="M7 6v12"/><path d="M9 5v14"/><path d="M15 5v14"/><path d="M17 6v12"/><path d="M19 8v8"/></svg>`
    },
    {
      id: 'builder',
      label: 'Protocols',
      action: "appActions.navigate('programming_builder', event)",
      active: cur === 'programming_builder',
      icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
    },
    {
      id: 'analytics',
      label: 'Analytics',
      action: "appActions.navigate('analytics', event)",
      active: cur === 'analytics',
      icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="20" x2="6" y2="16"></line><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line></svg>`
    },
    {
        id: 'nutrition',
        label: 'Nutrition',
        action: "appActions.navigate('nutrition', event)",
        active: cur === 'nutrition',
        icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`
      },
      {
        id: 'coach',
        label: 'Coach',
        action: "appActions.toggleCoachDrawer(event)",
        active: !!state.coachDrawerOpen,
        badge: !!getApexCoachConfig().apiKey,
        icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>`
      }
    ];

  return `
    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-sub px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-around items-center max-w-lg mx-auto shadow-2xl md:hidden">
      ${navItems.map(item => `
        <button type="button" onclick="${item.action}" class="flex-1 flex flex-col items-center justify-center space-y-1 relative tactile transition ${item.active ? 'text-accent font-bold' : 'text-slate-400 hover:text-slate-200'}">
          <div class="relative">
            ${item.icon}
            ${item.badge ? `<span class="absolute -top-1 -right-1.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span><span class="absolute -top-1 -right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>` : ''}
          </div>
          <span class="text-[9px] font-mono tracking-tight">${item.label}</span>
          ${item.active ? `<span class="w-3.5 h-0.5 bg-accent rounded-full"></span>` : '<span class="w-3.5 h-0.5 bg-transparent"></span>'}
        </button>
      `).join('')}
    </nav>
  `;
}
  window.render = function() {
    try {
      const app = document.getElementById('app');
      if (!app) return;

      const validScreens = [
        'calendar', 'logger', 'staging', 'checkin', 'blocks', 'resources', 
        'profile', 'history_review', 'settings', 'about', 'library', 'splits', 
        'analytics', 'programming_builder', 'prs', 'guide', 'nutrition'
      ];
      if (!validScreens.includes(state.screen)) {
        state.screen = 'calendar';
      }

      const prevMain = app.querySelector('main');
      if (prevMain && state.screen) {
        state.screenScrolls[state.screen] = prevMain.scrollTop;
      }

      applyGlobalThemeAndFont();
      
      // Real-time position for app header bar
      const currentRealTimePos = getMesocyclePosition(new Date());
      const isWorkoutActive = state.activeWorkout && state.activeWorkout.length > 0;

      let syncBtnContent = state.user 
        ? (state.syncStatus === 'synced' ? '☁️ <span class="text-emerald-400 font-bold">Synced</span>' : (state.syncStatus === 'syncing' ? '☁️ <span class="text-amber-400">Syncing...</span>' : '☁️ <span class="text-red-400">Sync Err</span>'))
        : '☁️ <span class="text-blue-400 font-bold">Cloud Sync</span>';

      let html = `
        <header class="flex justify-between items-center pb-2.5 border-b border-sub relative shrink-0 gap-2">
          <!-- Left: Logo & Mobile Hamburger -->
          <div class="flex items-center space-x-2.5 shrink-0">
            <button type="button" onclick="appActions.toggleDrawer(event)" class="p-1.5 rounded-xl bg-card-sub border border-sub text-slate-300 hover:text-white flex flex-col justify-center items-center space-y-1 w-8 h-8 tactile shadow-sm">
              <span class="w-4 h-0.5 bg-slate-300 rounded"></span>
              <span class="w-4 h-0.5 bg-slate-300 rounded"></span>
              <span class="w-4 h-0.5 bg-slate-300 rounded"></span>
            </button>
            <div class="flex items-center space-x-1.5 cursor-pointer" onclick="appActions.navigate('calendar', event)">
              <span class="font-black tracking-wider text-base text-white font-mono">APEX</span>
              <span class="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-input border border-sub text-accent font-bold">PRO</span>
            </div>
            <button type="button" onclick="appActions.navigate('blocks', event)" class="text-[10px] font-mono bg-card-sub px-2.5 py-1 rounded-lg border border-sub text-slate-300 truncate max-w-[160px] tactile">
              ${currentRealTimePos.phase} (W${currentRealTimePos.week}/${currentRealTimePos.block.weeks})
            </button>
          </div>

          <!-- Center: Desktop Navigation Bar (Visible on Laptop >= 768px) -->
          <nav class="hidden md:flex items-center space-x-1 font-mono text-xs flex-wrap justify-center">
            ${[
              { id: 'calendar', label: 'Home' },
              { id: isWorkoutActive ? 'logger' : 'staging', label: isWorkoutActive ? 'Active Workout 🔥' : 'Stage' },
              { id: 'programming_builder', label: 'Protocols' },
              { id: 'splits', label: 'Splits' },
              { id: 'blocks', label: 'Blocks' },
              { id: 'nutrition', label: 'Nutrition' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'guide', label: 'Guide' },
              { id: 'settings', label: 'Settings' }
            ].map(tab => {
              const isActive = (tab.id === 'logger' || tab.id === 'staging') 
                ? (state.screen === 'logger' || state.screen === 'staging') 
                : (state.screen === tab.id);
              return `
                <button type="button" 
                  onclick="appActions.navigate('${tab.id}', event)" 
                  class="px-2.5 py-1 rounded-xl font-bold transition tactile ${isActive ? 'bg-accent/20 text-accent border border-accent/40 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-input border border-transparent'}">
                  ${tab.label}
                </button>
              `;
            }).join('')}
          </nav>

          <!-- Right: Sync Status -->
          <div class="flex items-center space-x-2 font-mono text-xs shrink-0">
            <button type="button" id="cloud-sync-btn" onclick="appActions.openAuthModal()" class="px-2.5 py-1 bg-card-sub border border-sub hover:border-blue-600 rounded-xl text-[11px] font-semibold text-slate-300 flex items-center space-x-1 tactile shadow-sm">
              ${syncBtnContent}
            </button>
          </div>
        </header>

        ${(isWorkoutActive && state.screen !== 'logger') ? `
          <div class="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-600/60 p-2.5 rounded-2xl flex justify-between items-center text-xs font-mono shadow-xl backdrop-blur-md shrink-0">
            <div class="flex items-center space-x-2.5">
              <span class="text-base animate-bounce">🏋️</span>
              <div>
                <span class="font-bold text-white">Active Session in Progress</span>
                <div class="text-[10px] text-blue-300">Started: ${state.activeWorkoutDateKey || 'Current'} • ${state.activeWorkout.length} Movements Active</div>
              </div>
            </div>
            <div class="flex items-center space-x-1.5">
              <button type="button" onclick="appActions.navigate('logger', event)" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white text-[11px] shadow tactile">
                Resume &rarr;
              </button>
              <button type="button" onclick="appActions.forceClearActiveWorkout(event)" title="Clear stuck session" class="px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 rounded-xl font-bold text-[11px] tactile">
                Clear ✕
              </button>
            </div>
          </div>
        ` : ''}

        ${state.drawerOpen ? `
          <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex" onclick="appActions.toggleDrawer(event)">
            <div class="w-64 bg-card border-r border-sub h-full p-4 flex flex-col justify-between shadow-2xl space-y-4" onclick="event.stopPropagation()">
              <div class="space-y-4">
                <div class="flex justify-between items-center pb-2 border-b border-sub">
                  <span class="font-black tracking-wider text-white font-mono">APEX PRO</span>
                  <button type="button" onclick="appActions.toggleDrawer(event)" class="text-slate-400 hover:text-white text-base">✕</button>
                </div>
                <nav class="space-y-1 font-mono text-xs overflow-y-auto max-h-[70vh] pr-0.5">
                  <div class="text-[9px] text-slate-500 uppercase font-bold tracking-wider px-1 pt-1">Training</div>
                  <button type="button" onclick="appActions.navigate('calendar', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'calendar' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg></span><span>Schedule</span>
                  </button>
                  <button type="button" onclick="appActions.toggleCoachDrawer(event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center gap-2.5 transition ${state.coachDrawerOpen ? 'bg-accent text-white font-bold' : 'bg-card text-slate-200 hover:bg-card-sub'}">
                    <span class="w-4 h-4 shrink-0 inline-flex items-center justify-center ${state.coachDrawerOpen ? 'text-white' : 'text-accent'}">✦</span><span>AI Performance Coach</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('nutrition', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'nutrition' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg></span><span>Nutrition & Macros</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('analytics', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'analytics' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg></span><span>Performance Analytics</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('prs', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'prs' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:text-white hover:bg-slate-800 font-semibold'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></span><span>Personal Records</span>
                  </button>

                  <div class="text-[9px] text-slate-500 uppercase font-bold tracking-wider px-1 pt-2">Program Design</div>
                  <button type="button" onclick="appActions.navigate('blocks', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'blocks' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 10 5-10 5-10-5Z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/></svg></span><span>Training Blocks</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('splits', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'splits' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg></span><span>Weekly Splits</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('programming_builder', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'programming_builder' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:text-white hover:bg-slate-800 font-semibold'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span><span>Progression Protocols</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('library', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'library' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span><span>Program Templates</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('resources', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'resources' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg></span><span>Exercise Catalog</span>
                  </button>

                  <div class="text-[9px] text-slate-500 uppercase font-bold tracking-wider px-1 pt-2">Account & Preferences</div>
                  <button type="button" onclick="appActions.navigate('profile', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'profile' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg></span><span>Athlete Profile</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('settings', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'settings' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></span><span>Preferences</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('guide', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'guide' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:text-white hover:bg-slate-800 font-semibold'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span>Training Guide</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('about', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'about' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg></span><span>Methodology & Formulas</span>
                  </button>
                </nav>
              </div>

              <div class="space-y-2 border-t border-sub pt-3 font-mono text-xs">
                <button type="button" onclick="appActions.promptInstallApp()" class="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold flex items-center justify-center space-x-2 shadow-lg tactile">
                  <span>📲</span><span>Install Standalone App</span>
                </button>
                <div class="text-[10px] text-slate-500 text-center">
                  <div>APEX Engine ${window.apexCore?.APP_VERSION || ''}</div>
                  <div class="text-slate-400 mt-0.5 truncate">${state.user ? 'User: ' + state.user.email : 'Offline Local Mode'}</div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      `;

      // 1. CALENDAR SCREEN
      if (state.screen === 'calendar') {
        const firstDay = new Date(state.year, state.month, 1).getDay();
        const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
        const prevDays = new Date(state.year, state.month, 0).getDate();

        let cellsHtml = '';
        for (let i = firstDay - 1; i >= 0; i--) {
          cellsHtml += `<div class="min-h-[58px] sm:min-h-[64px] md:min-h-[85px] rounded-xl p-1 flex flex-col justify-between bg-card-sub/20 opacity-20 border border-sub"><span class="text-[10px] font-mono text-slate-500">${prevDays - i}</span></div>`;
        }
        for (let d = 1; d <= daysInMonth; d++) {
          const k = formatIsoDate(state.year, state.month, d);
          const log = state.dayLogs?.[k];
          const isSelected = state.selectedDay === d;
          const isToday = (d === core.TODAY_DATE && state.month === core.TODAY_MONTH && state.year === core.TODAY_YEAR);
          const hasSavedStaged = state.savedStaged && state.savedStaged[k] && state.savedStaged[k].length > 0;
          const hasWorkoutEntry = Boolean(log?.workout?.done || hasSavedStaged || (isWorkoutActive && state.activeWorkoutDateKey === k));

          let badges = '';
            const badgeItems = [];
            if (log?.weight !== undefined && log?.weight !== null && log?.weight !== '') {
              badgeItems.push(`
                <span class="w-4 h-4 sm:w-5 sm:h-5 rounded bg-slate-800/95 border border-slate-700/80 flex items-center justify-center text-slate-400 shrink-0" title="Bodyweight: ${log.weight}">
                  <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect x="3" y="3" width="18" height="18" rx="4" />
                    <rect x="8" y="6" width="8" height="3" rx="1" fill="currentColor" />
                  </svg>
                </span>
              `);
            }
            if (log?.recovery?.score) {
              badgeItems.push(`
                <span class="w-4 h-4 sm:w-5 sm:h-5 rounded bg-slate-800/95 border border-slate-700/80 flex items-center justify-center text-slate-400 shrink-0" title="Readiness: ${log.recovery.score}%">
                  <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </span>
              `);
            }
            if (hasWorkoutEntry) {
              badgeItems.push(`
                <span class="w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center shrink-0 shadow-sm" style="background-color: var(--accent-primary); color: #000000;" title="Workout Session">
                  <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12h20M6 8v8M18 8v8M4 10v4M20 10v4"/>
                  </svg>
                </span>
              `);
            }
            if (log?.nutrition?.totals?.kcal > 0) {
              badgeItems.push(`
                <span class="w-4 h-4 sm:w-5 sm:h-5 rounded bg-slate-800/95 border border-slate-700/80 flex items-center justify-center text-slate-400 shrink-0" title="Nutrition: ${log.nutrition.totals.kcal} kcal (${log.nutrition.totals.p || 0}g P)">
                  <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                  </svg>
                </span>
              `);
            }

            if (badgeItems.length > 0) {
              const gridCols = badgeItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2';
              badges = `
                <div class="grid ${gridCols} gap-0.5 place-items-center mx-auto my-auto">
                  ${badgeItems.join('')}
                </div>
              `;
            }

            cellsHtml += `
            <div onclick="appActions.selectDate(${d})" class="min-h-[58px] sm:min-h-[64px] md:min-h-[85px] rounded-xl p-1 sm:p-1.5 flex flex-col justify-between cursor-pointer transition bg-card-sub hover:border-blue-400 tactile ${isSelected ? 'ring-2 ring-blue-500 shadow-accent' : (isToday ? 'border-2 border-accent shadow-sm' : 'border border-sub')}">
              <div class="flex justify-between items-center w-full">
                <span class="text-xs md:text-sm font-mono font-bold ${isToday ? 'text-accent font-black' : 'text-slate-300'}">${d}</span>
                ${isToday ? `<span class="w-1.5 h-1.5 rounded-full bg-accent animate-ping"></span>` : ''}
              </div>
              <div class="flex flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 overflow-hidden">${badges}</div>
            </div>
          `;
        }
        const totalCells = firstDay + daysInMonth;
        const rem = (7 - (totalCells % 7)) % 7;
        for (let n = 1; n <= rem; n++) {
          cellsHtml += `<div class="min-h-[58px] sm:min-h-[64px] md:min-h-[85px] rounded-xl p-1 flex flex-col justify-between bg-card-sub/20 opacity-20 border border-sub"><span class="text-[10px] font-mono text-slate-500">${n}</span></div>`;
        }

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 w-full px-0 sm:px-1" onclick="appActions.closeCardMenu()">
            <div class="w-full bg-card-sub/40 p-2 sm:p-3.5 rounded-2xl sm:rounded-3xl border border-sub space-y-2.5 backdrop-blur-md">
              <div class="flex justify-between items-center px-1 sm:px-2 py-0.5">
                <button type="button" onclick="appActions.changeMonth(-1)" class="w-8 h-8 rounded-xl bg-card-sub border border-sub flex items-center justify-center text-xs text-slate-300 hover:text-white tactile">&lsaquo;</button>
                <div class="flex items-center space-x-2">
                  <h1 class="text-base md:text-lg font-black text-white font-mono">${monthNames[state.month]} ${state.year}</h1>
                  <button type="button" onclick="appActions.jumpToToday()" class="text-[10px] font-mono bg-blue-600/30 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-lg hover:bg-blue-600 hover:text-white tactile">
                    Today
                  </button>
                </div>
                <button type="button" onclick="appActions.changeMonth(1)" class="w-8 h-8 rounded-xl bg-card-sub border border-sub flex items-center justify-center text-xs text-slate-300 hover:text-white tactile">&rsaquo;</button>
              </div>
              <div class="grid grid-cols-7 gap-1 text-center text-xs font-mono text-slate-400 py-1 font-bold">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              <div class="grid grid-cols-7 gap-1 sm:gap-1.5 w-full">${cellsHtml}</div>
              
              <div class="pt-2 border-t border-sub/50 flex flex-wrap gap-3 text-[10px] font-mono text-slate-400 justify-center">
                <div class="flex items-center gap-1.5">
            <span class="w-4 h-4 rounded-md bg-slate-800/95 border border-slate-700/80 flex items-center justify-center text-slate-400">
              <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <rect x="8" y="6" width="8" height="3" rx="1" fill="currentColor" />
              </svg>
            </span>
            <span>Bodyweight</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-4 h-4 rounded-md bg-slate-800/95 border border-slate-700/80 flex items-center justify-center text-slate-400">
              <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </span>
            <span>Readiness</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-4 h-4 rounded-md flex items-center justify-center shadow-sm" style="background-color: var(--accent-primary); color: #000000;">
              <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12h20M6 8v8M18 8v8M4 10v4M20 10v4"/>
              </svg>
            </span>
            <span>Workout</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-4 h-4 rounded-md bg-slate-800/95 border border-slate-700/80 flex items-center justify-center text-slate-400">
              <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
              </svg>
            </span>
            <span>Nutrition</span>
          </div>
              </div>
            </div>
          </main>
        `;
      }

      // 2. PROGRAMMING BUILDER SCREEN (Chassis Editor with "Save Changes")
      else if (state.screen === 'programming_builder') {
        const curScheme = normalizeSchemeName(state.activeRecipeScheme || 'Reverse Pyramid');
        const recipe = state.schemeRecipes?.[curScheme] || {};
        const recipeKeys = Object.keys(recipe);

        const fieldLabels = {
          setsCount: 'Default Sets Count',
          enableRpeProgression: 'Weekly RPE Ramp (+0.5/Wk)',
          minReps: 'Minimum Reps (0 = Inherit Matrix)',
          maxReps: 'Maximum Reps (0 = Inherit Matrix)',
          targetRpe: 'Target Working RPE',
          topRpe: 'Top Set RPE',
          backoffRpe: 'Back-off Sets RPE',
          backoffDropPct: 'Back-off Drop (% of Top)',
          backoffSets: 'Back-off Set Count',
          actRpe: 'Activation Set RPE',
          miniRpe: 'Mini-Set RPE',
          miniSets: 'Mini-Set Bursts',
          intraRestSec: 'Intra-Set Rest (Seconds)',
          clusterRpe: 'Cluster RPE',
          clusters: 'Cluster Sets Count',
          dropPct: 'Fatigue Drop (% Load)',
          drop1Pct: 'Drop 1 Offset (%)',
          drop2Pct: 'Drop 2 Offset (%)',
          drop3Pct: 'Drop 3 Offset (%)',
          targetLoadPct: 'Prescribed Intensity (% e1RM)',
          defaultMinutes: 'Countdown Timer (Minutes)',
          singleRpe: 'Top Single RPE',
          singlePct: 'Top Single Intensity (% e1RM)',
          benchRpe: 'Benchmark Set RPE',
          densityDropPct: 'Density Set Drop (%)',
          densitySets: 'Density Waves Count',
          anchorReps: 'Anchor Probe Target Reps',
          anchorRpe: 'Anchor Probe RPE',
          anchorPct: 'Anchor Probe Intensity (% e1RM)',
          repeatReps: 'Volume Repeat Reps',
          repeatRpe: 'Volume Repeat RPE',
          repeatPct: 'Volume Repeat Intensity (% e1RM)',
          stopRpe: 'Fatigue Stop Threshold RPE',
          basePct: 'Base Wave Intensity (% e1RM)',
          speedStepPct: 'Weekly Speed Ramp (%/Wk)',
          reps: 'Prescribed Rep Target',
          loadPct: 'Target Load Intensity (% e1RM)',
          wave1TopRpe: 'Wave 1 Top Set RPE',
          wave2TopRpe: 'Wave 2 Top Set RPE',
          peakRpe: 'Apex Peak RPE',
          rampStepPct: 'Pyramid Ramp Step (%)',
          apexRpe: 'Pyramid Apex Peak RPE',
          midRpe: 'Pyramid Mid-Step RPE',
          baseRpe: 'Pyramid Base Load RPE',
          forceRpe: 'Force Effort RPE',
          metaRpe: 'Metabolic Effort RPE',
          metaReps: 'Metabolic Target Reps',
          workRpe: 'Working Set RPE',
          clusterLoadPct: 'Cluster Target Intensity (% e1RM)',
          clusterReps: 'Reps Per Cluster',
          startRpe: 'Ascending Ladder Start RPE',
          heavyRpe: 'Heavy Sawtooth RPE',
          repRpe: 'Capacity Sawtooth RPE',
          primer1Pct: 'Primer 1 Load (% e1RM)',
          primer2Pct: 'Primer 2 Load (% e1RM)',
          backoffLoadPct: 'Taper Capacity (% of Opener)',
          openerRpe: 'Opener Set Target RPE'
        };

    if (!state.schemeBlueprints) {
      state.schemeBlueprints = JSON.parse(JSON.stringify(state.schemeRecipes || DEFAULT_SCHEME_BLUEPRINTS));
    }
    const activeScope = state.builderPhaseScope || 'Global';
    const simWeek = state.builderSimWeek || 1;
    const simPhase = activeScope === 'Global' ? 'Hypertrophy' : activeScope;

    const rawBp = state.schemeBlueprints[curScheme] || DEFAULT_SCHEME_BLUEPRINTS[curScheme] || DEFAULT_SCHEME_BLUEPRINTS['Straight Sets'];
    const bp = (typeof resolveBlueprintForPhase === 'function') 
      ? resolveBlueprintForPhase(rawBp, activeScope) 
      : rawBp;
    const hasOverride = Boolean(rawBp.phaseOverrides?.[activeScope]);
    const customSchemeKeys = Object.keys(state.schemeBlueprints || {}).filter(k => 
      !hypertrophySchemes.includes(k) && !strengthSchemes.includes(k)
    );
    const repDisplayVal = Array.isArray(bp.reps) ? bp.reps.join(', ') : (bp.reps || 8);
    const rpeOpts = [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];

    // Resolve active execution pattern and Rep Source lock state
    const curPattern = bp.pattern || (curScheme === 'Double Progression' ? 'double_progression' : (curScheme === 'Density Block' ? 'density_block' : 'straight'));
    const isRepLocked = bp.repLockMode === 'locked' || (bp.repLockMode !== 'phase' && Number(recipe?.minReps) > 0 && Number(recipe?.maxReps) > 0);
    const activePhaseBounds = (state.phaseRepMatrix && state.phaseRepMatrix[simPhase]) || defaultPhaseRepMatrix[simPhase] || defaultPhaseRepMatrix['Hypertrophy'];
    const phaseMatrixSummary = `Main: ${activePhaseBounds.Main.min}-${activePhaseBounds.Main.max}r • Sec: ${activePhaseBounds.Secondary.min}-${activePhaseBounds.Secondary.max}r • Asst: ${activePhaseBounds.Assistance.min}-${activePhaseBounds.Assistance.max}r`;

    const targetRpeVal = roundRpe(bp.targetRpe || recipe?.targetRpe || recipe?.topRpe || recipe?.actRpe || 8.0);
    let targetRpeOptionsHtml = '';
    (rpeOpts || [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0]).forEach(r => {
      targetRpeOptionsHtml += `<option value="${r}" ${targetRpeVal === r ? 'selected' : ''}>@${r.toFixed(1)}</option>`;
    });

    let patternFieldsHtml = '';
    if (curPattern === 'double_progression' || curScheme === 'Double Progression') {
      const curStepLbs = Number(bp.stepLbs || recipe?.stepLbs) || 5;
      const curDpMode = bp.dpMode || recipe?.dpMode || 'all';
      const curBackoffStep = Boolean(bp.backoffStep || recipe?.backoffStep);
      const curDeloadPct = Number(bp.deloadPct || recipe?.deloadPct) || 90;

      patternFieldsHtml = `
        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Load Step Increment (lbs)</label>
          <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'stepLbs', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-accent font-bold text-xs focus:outline-none">
            ${[2.5, 5, 10, 15, 20].map(st => `
              <option value="${st}" ${curStepLbs === st ? 'selected' : ''}>+${st} lbs when ceiling cleared</option>
            `).join('')}
          </select>
        </div>

        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Graduation Trigger</label>
          <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'dpMode', this.value)" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-xs focus:outline-none">
            <option value="all" ${curDpMode === 'all' ? 'selected' : ''}>All Sets Hit Rep Ceiling (Strict)</option>
            <option value="first" ${curDpMode === 'first' ? 'selected' : ''}>Set 1 Hits Rep Ceiling (Top-Set)</option>
            <option value="independent" ${curDpMode === 'independent' ? 'selected' : ''}>Independent Per-Set Graduation</option>
          </select>
        </div>

        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Set Load Structure</label>
          <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'backoffStep', this.value === 'true')" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-slate-200 font-bold text-xs focus:outline-none">
            <option value="false" ${!curBackoffStep ? 'selected' : ''}>Uniform Straight Weight Across Sets</option>
            <option value="true" ${curBackoffStep ? 'selected' : ''}>Reverse Step Wave (-1 Step/Set)</option>
          </select>
        </div>

        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">2-Session Stall Reset</label>
          <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'deloadPct', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-slate-200 font-bold text-xs focus:outline-none">
            <option value="100" ${curDeloadPct === 100 ? 'selected' : ''}>100% (Hold Load Until Cleared)</option>
            <option value="95" ${curDeloadPct === 95 ? 'selected' : ''}>95% (-5% Micro-Reset)</option>
            <option value="90" ${curDeloadPct === 90 ? 'selected' : ''}>90% (-10% Deload Reset)</option>
          </select>
        </div>
      `;
    } else if (curPattern === 'density_block' || curScheme === 'Density Block') {
      const dMins = Number(bp.defaultMinutes || recipe?.defaultMinutes) || 8;
      const dPct = Number(bp.targetLoadPct || recipe?.targetLoadPct) || 65;
      const dRest = Number(bp.intraSetRest !== undefined ? bp.intraSetRest : (bp.restSeconds || recipe?.intraRestSec || 45));
      const dGoal = Number(bp.repGoal || recipe?.repGoal) || 35;

      patternFieldsHtml = `
        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Block Countdown Duration</label>
          <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'defaultMinutes', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-accent font-bold text-xs focus:outline-none">
            ${Array.from({ length: 20 }, (_, i) => i + 1).map(m => `
              <option value="${m}" ${dMins === m ? 'selected' : ''}>${m}:00 (${m} Min Block)</option>
            `).join('')}
          </select>
        </div>

        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Prescribed Load (% e1RM)</label>
          <input type="number" step="1" min="40" max="90" value="${dPct}" onchange="appActions.updateSchemeBlueprint('${curScheme}', 'targetLoadPct', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-center text-xs focus:outline-none">
        </div>

        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Intra-Block Interval Rest (Sec)</label>
          <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'intraSetRest', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-xs focus:outline-none">
            ${[15, 20, 30, 45, 60, 90].map(sec => `
              <option value="${sec}" ${dRest === sec ? 'selected' : ''}>${sec} Seconds Pacing</option>
            `).join('')}
          </select>
        </div>

        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Block Rep Overload Goal</label>
          <input type="number" step="5" min="10" max="150" value="${dGoal}" onchange="appActions.updateSchemeBlueprint('${curScheme}', 'repGoal', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-teal-300 font-bold text-center text-xs focus:outline-none">
        </div>
      `;
    } else if (curPattern === 'load_drop' || curPattern === 'reverse_pyramid') {
      const rawDropVal = bp.fatigueDropPct !== undefined ? Number(bp.fatigueDropPct) : ((Number(recipe?.backoffDropPct || recipe?.drop1Pct || recipe?.dropPct) || 10) / 100);
      const dropValDec = rawDropVal > 1 ? rawDropVal / 100 : rawDropVal;
      const drop2Val = Number(bp.drop2Pct || recipe?.drop2Pct) || 20;
      const drop3Val = Number(bp.drop3Pct || recipe?.drop3Pct) || 30;

      patternFieldsHtml = `
        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Top / Opener Sets Count</label>
          <input type="number" min="1" max="4" value="${bp.topSetCount || 1}" onchange="appActions.updateSchemeBlueprint('${curScheme}', 'topSetCount', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-center text-xs focus:outline-none">
        </div>
        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Primary Load Drop %</label>
          <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'fatigueDropPct', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-accent font-bold text-xs focus:outline-none">
            ${[0.03, 0.05, 0.075, 0.10, 0.12, 0.14, 0.15, 0.20].map(d => `
              <option value="${d}" ${(Math.abs(dropValDec - d) < 0.005) ? 'selected' : ''}>-${Math.round(d * 100)}% Load Drop</option>
            `).join('')}
          </select>
        </div>
        ${curPattern === 'reverse_pyramid' || curScheme === 'Drop Set' ? `
          <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
            <label class="text-[9px] text-slate-400 font-bold uppercase">Step 2 Drop Offset (%)</label>
            <input type="number" step="5" min="5" max="50" value="${drop2Val}" onchange="appActions.updateSchemeBlueprint('${curScheme}', 'drop2Pct', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-slate-200 font-bold text-center text-xs focus:outline-none">
          </div>
          <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
            <label class="text-[9px] text-slate-400 font-bold uppercase">Step 3 Drop Offset (%)</label>
            <input type="number" step="5" min="10" max="60" value="${drop3Val}" onchange="appActions.updateSchemeBlueprint('${curScheme}', 'drop3Pct', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-slate-200 font-bold text-center text-xs focus:outline-none">
          </div>
        ` : ''}
      `;
    } else if (curPattern === 'ramp' || curPattern === 'wave') {
      const stepDelta = bp.rpeStepDelta !== undefined ? Number(bp.rpeStepDelta) : 0.5;
      const rampPct = Number(bp.rampStepPct || recipe?.rampStepPct) || 9;
      const w2Rpe = roundRpe(bp.wave2TopRpe || recipe?.wave2TopRpe || 9.0);

      patternFieldsHtml = `
        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">RPE Step Delta Per Set</label>
          <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'rpeStepDelta', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-indigo-300 font-bold text-xs focus:outline-none">
            ${[0.0, 0.5, 1.0].map(step => `
              <option value="${step}" ${(stepDelta === step) ? 'selected' : ''}>+${step.toFixed(1)} RPE per Set</option>
            `).join('')}
          </select>
        </div>
        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">${curPattern === 'wave' ? 'Wave 2 Peak RPE' : 'Load Ramp Step (%)'}</label>
          ${curPattern === 'wave' ? `
            <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'wave2TopRpe', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-accent font-bold text-xs focus:outline-none">
              ${[8.0, 8.5, 9.0, 9.5, 10.0].map(r => `<option value="${r}" ${w2Rpe === r ? 'selected' : ''}>@${r.toFixed(1)} Peak</option>`).join('')}
            </select>
          ` : `
            <input type="number" step="1" min="2" max="20" value="${rampPct}" onchange="appActions.updateSchemeBlueprint('${curScheme}', 'rampStepPct', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-center text-xs focus:outline-none">
          `}
        </div>
      `;
    } else if (curPattern === 'rep_goal') {
      const goalVal = Number(bp.repGoal || recipe?.repGoal) || 50;
      const pctVal = Number(bp.targetLoadPct || recipe?.targetLoadPct) || 58;
      patternFieldsHtml = `
        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Cumulative Rep Goal Target</label>
          <input type="number" step="5" value="${goalVal}" onchange="appActions.updateSchemeBlueprint('${curScheme}', 'repGoal', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-teal-300 font-bold text-center text-xs focus:outline-none">
        </div>
        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Prescribed Load (% e1RM)</label>
          <input type="number" step="1" min="40" max="85" value="${pctVal}" onchange="appActions.updateSchemeBlueprint('${curScheme}', 'targetLoadPct', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-center text-xs focus:outline-none">
        </div>
      `;
    } else if (curPattern === 'rest_pause' || curPattern === 'cluster') {
      const clusterPct = bp.targetLoadPct !== undefined ? bp.targetLoadPct : (recipe?.targetLoadPct || recipe?.loadPct || recipe?.clusterLoadPct || 75);
      const clusterIntraRest = Number(bp.intraSetRest !== undefined ? bp.intraSetRest : (bp.intraRestSec || recipe?.intraRestSec || 20));
      const penalty = Number(bp.densityPenalty || 1.0);
      const miniCount = Number(bp.miniSets || bp.clusters || recipe?.miniSets || recipe?.clusters || bp.baseSets || 4);

      patternFieldsHtml = `
        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Prescribed Load (% e1RM)</label>
          <input type="number" step="0.5" min="40" max="95" value="${clusterPct}" 
            onchange="appActions.updateSchemeBlueprint('${curScheme}', 'targetLoadPct', Number(this.value))" 
            class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-blue-300 font-bold text-center text-xs focus:outline-none">
        </div>

        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Intra-Cluster / Mini-Set Rest</label>
          <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'intraSetRest', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-xs focus:outline-none">
            ${[10, 15, 20, 25, 30, 45].map(sec => `
              <option value="${sec}" ${clusterIntraRest === sec ? 'selected' : ''}>${sec} Seconds</option>
            `).join('')}
          </select>
        </div>

        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">${curPattern === 'rest_pause' ? 'Mini-Sets / Failure Clusters' : 'Cluster Bursts'}</label>
          <input type="number" min="1" max="8" value="${miniCount}" onchange="appActions.updateSchemeBlueprint('${curScheme}', '${curScheme === 'Myo-reps' ? 'miniSets' : (curScheme === 'Rest-Pause (Dogcrapp)' ? 'clusters' : 'baseSets')}', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-center text-xs focus:outline-none">
        </div>

        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Density Load Penalty</label>
          <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'densityPenalty', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-xs focus:outline-none">
            <option value="1.0" ${penalty === 1.0 ? 'selected' : ''}>1.00x (Standard Load)</option>
            <option value="0.95" ${penalty === 0.95 ? 'selected' : ''}>0.95x (-5% Density)</option>
            <option value="0.90" ${penalty === 0.90 ? 'selected' : ''}>0.90x (-10% Density)</option>
            <option value="0.85" ${penalty === 0.85 ? 'selected' : ''}>0.85x (-15% Density)</option>
          </select>
        </div>
      `;
    } else if (curPattern === 'repeats') {
      const stopCap = Number(bp.fatigueStopRpe || recipe?.stopRpe) || 9.0;
      patternFieldsHtml = `
        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1 sm:col-span-2">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Fatigue Stop Cap</label>
          <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'fatigueStopRpe', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-rose-300 font-bold text-xs focus:outline-none">
            <option value="8.5" ${stopCap === 8.5 ? 'selected' : ''}>Stop Set Ladder at @8.5 RPE</option>
            <option value="9.0" ${stopCap === 9.0 ? 'selected' : ''}>Stop Set Ladder at @9.0 RPE</option>
            <option value="9.5" ${stopCap === 9.5 ? 'selected' : ''}>Stop Set Ladder at @9.5 RPE</option>
            <option value="10.0" ${stopCap === 10.0 ? 'selected' : ''}>Stop at @10.0 (Failure)</option>
          </select>
        </div>
      `;
    }

    const previewSets = (typeof buildSets === 'function')
      ? buildSets(curScheme, 200, 1.0, 'Main', 'Squat', [], { 
          dateKey: null, 
          phase: simPhase, 
          week: simWeek,
          isPreview: true
        })
      : ((typeof generateSetsFromBlueprint === 'function')
          ? generateSetsFromBlueprint({
              schemeName: curScheme,
              meta: { w: true, r: true },
              e1rm: 200,
              baseWorkingSets: Number(bp.baseSets) || 3,
              phase: simPhase,
              weekRpeBump: (simWeek - 1) * 0.5,
              tier: 'Main'
            })
          : []);

    const strainInfo = (typeof calculateSchemeStrain === 'function')
      ? calculateSchemeStrain(previewSets)
      : { score: 180, level: 'Moderate', badge: 'bg-blue-500/20 text-blue-300 border-blue-500' };

    const simulationPreviewHtml = previewSets.map(s => {
      const restNote = s.targetTime ? `⏱ ${s.targetTime}s rest` : '';
      const rpeNum = Number(s.targetRpe || 8.0);
      const rpeLabel = rpeNum <= 5.5 ? '<6.0' : rpeNum.toFixed(1);

      return `
        <div class="bg-input/70 p-2 rounded-xl border border-sub/60 flex items-center justify-between text-[10px] font-mono">
          <div class="flex items-center space-x-1.5 min-w-0">
            <span class="font-bold text-white truncate">${s.label}</span>
            ${restNote ? `<span class="text-[8px] bg-card px-1.5 py-0.5 rounded border border-sub text-slate-300 font-semibold shrink-0">${restNote}</span>` : ''}
          </div>
          <div class="flex items-center space-x-3 shrink-0">
            <span class="text-accent font-bold">${s.targetReps} reps @${rpeLabel}</span>
            <span class="text-slate-300 font-bold bg-card-sub px-1.5 py-0.5 rounded border border-sub/50">${s.targetLoad} lbs</span>
          </div>
        </div>
      `;
    }).join('');

    const enableRpeProg = (bp.enableRpeProgression !== undefined) ? Boolean(bp.enableRpeProgression) : Boolean(recipe?.enableRpeProgression);

    const parametersGridHtml = `
      <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
        <label class="text-[9px] text-slate-400 font-bold uppercase">Execution Pattern</label>
        <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'pattern', this.value)" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-xs focus:outline-none">
          <option value="straight" ${curPattern === 'straight' ? 'selected' : ''}>Straight Sets (Uniform)</option>
          <option value="double_progression" ${curPattern === 'double_progression' ? 'selected' : ''}>Double Progression (Step Loading)</option>
          <option value="density_block" ${curPattern === 'density_block' ? 'selected' : ''}>Density Block (Timed EDT / Interval)</option>
          <option value="load_drop" ${curPattern === 'load_drop' ? 'selected' : ''}>Top Set + Back-off (Load Drop)</option>
          <option value="reverse_pyramid" ${curPattern === 'reverse_pyramid' ? 'selected' : ''}>Reverse Pyramid (Descending Load)</option>
          <option value="ramp" ${curPattern === 'ramp' ? 'selected' : ''}>Ascending Ramp / RPE Ladder</option>
          <option value="wave" ${curPattern === 'wave' ? 'selected' : ''}>Undulating Wave / Sawtooth</option>
          <option value="rest_pause" ${curPattern === 'rest_pause' ? 'selected' : ''}>Rest-Pause / Myo-reps (Failure Mini-Sets)</option>
          <option value="cluster" ${curPattern === 'cluster' ? 'selected' : ''}>Intra-Set Velocity Cluster</option>
          <option value="rep_goal" ${curPattern === 'rep_goal' ? 'selected' : ''}>Rep-Goal System (Accumulation)</option>
          <option value="repeats" ${curPattern === 'repeats' ? 'selected' : ''}>Repeats (Autoregulated Fatigue Stop)</option>
        </select>
      </div>

      <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
        <label class="text-[9px] text-slate-400 font-bold uppercase">Total Working Sets</label>
        <input type="number" min="1" max="12" value="${bp.baseSets || recipe?.setsCount || 3}" onchange="appActions.updateSchemeBlueprint('${curScheme}', 'baseSets', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-center text-xs focus:outline-none">
      </div>

      <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1 sm:col-span-2">
        <div class="flex flex-wrap items-center justify-between gap-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Prescribed Reps / Array & Rep Source</label>
          <button type="button" onclick="appActions.toggleSchemeRepLock('${curScheme}')" class="px-2 py-0.5 rounded-lg border text-[9px] font-bold transition tactile ${isRepLocked ? 'bg-blue-600/30 border-blue-500 text-blue-300' : 'bg-card-sub border-sub text-slate-300 hover:text-white'}">
            ${isRepLocked ? '🔒 Locked to Blueprint (Tap to Inherit Phase)' : '🔄 Inheriting Phase Matrix (Tap to Lock)'}
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center pt-0.5">
          <input type="text" value="${repDisplayVal}" placeholder="e.g. 8, 8-12, or 4, 6, 8" onchange="appActions.updateSchemeBlueprint('${curScheme}', 'reps', this.value)" class="sm:col-span-5 bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-center text-xs focus:outline-none">
          <div class="sm:col-span-7 text-[9.5px] font-mono px-2.5 py-1.5 rounded-xl bg-card-sub/60 border border-sub/50 text-slate-300 truncate">
            ${isRepLocked
              ? `Enforcing Blueprint Lock (<b class="text-accent">${repDisplayVal}r</b>) across all phases`
              : `Active ${simPhase} Matrix: <b class="text-accent">${phaseMatrixSummary}</b>`}
          </div>
        </div>
      </div>

      <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
        <label class="text-[9px] text-slate-400 font-bold uppercase">Target Effort Anchor</label>
        <select onchange="appActions.updateSchemeBlueprint('${curScheme}', 'targetRpe', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-accent font-bold text-xs focus:outline-none">
          ${targetRpeOptionsHtml}
        </select>
      </div>

      <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
        <label class="text-[9px] text-slate-400 font-bold uppercase">Inter-Set Rest (Sec)</label>
        <input type="number" step="15" value="${bp.restSeconds || 120}" onchange="appActions.updateSchemeBlueprint('${curScheme}', 'restSeconds', Number(this.value))" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-slate-200 font-bold text-center text-xs focus:outline-none">
      </div>

      ${patternFieldsHtml}

      <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1 sm:col-span-2 flex items-center justify-between">
        <div>
          <label class="text-[10px] text-slate-300 font-bold uppercase">Weekly RPE Ramp (+0.5 RPE / Wk)</label>
          <div class="text-[9px] text-slate-500">Automatically steps up target effort across weeks when block is in Intensity Wave mode</div>
        </div>
        <input type="checkbox" ${enableRpeProg ? 'checked' : ''} 
          onchange="appActions.updateSchemeBlueprint('${curScheme}', 'enableRpeProgression', this.checked)" 
          class="w-4 h-4 accent-blue-600 rounded cursor-pointer">
      </div>
    `;
        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono w-full">
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                Progression Protocols
              </span>
              <div class="flex items-center space-x-3">
                <button type="button" onclick="appActions.resetSchemeRecipes()" class="text-[10px] text-slate-400 hover:text-white underline">Restore Defaults</button>
                <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Schedule</button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start font-mono text-xs w-full">
              <div class="md:col-span-4 bg-card-sub p-3 rounded-2xl border border-sub space-y-2">
                <div class="flex items-center justify-between pb-1">
  <span class="text-[10px] text-accent font-bold uppercase">Protocol Library</span>
  <button type="button"
    onclick="appActions.createCustomBlueprint()"
    class="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow">
    + New Protocol
  </button>
</div>
                <div class="space-y-1 max-h-96 overflow-y-auto pr-1">
                  ${customSchemeKeys.length ? `
                    <div class="text-[9px] text-emerald-400 uppercase font-bold pt-1">Custom Protocols</div>
                    ${customSchemeKeys.map(k => `
                      <button type="button" onclick="appActions.selectRecipeScheme('${k}')" class="w-full text-left p-2 rounded-xl border transition truncate tactile ${curScheme === k ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow' : 'bg-input text-emerald-300 border-sub hover:bg-slate-800'}">
                        ${state.schemeBlueprints[k]?.name || k}
                      </button>
                    `).join('')}
                  ` : ''}
                  <div class="text-[9px] text-slate-500 uppercase font-bold pt-1">Hypertrophy Schemes</div>
                  ${(hypertrophySchemes || []).map(s => `
                    <button type="button" onclick="appActions.selectRecipeScheme('${s}')" class="w-full text-left p-2 rounded-xl border transition truncate tactile ${curScheme === s ? 'bg-blue-600 text-white font-bold border-blue-500 shadow' : 'bg-input text-slate-300 border-sub hover:bg-slate-800'}">
                      ${s}
                    </button>
                  `).join('')}
                  <div class="text-[9px] text-slate-500 uppercase font-bold pt-2">Strength & Neuromuscular Schemes</div>
                  ${(strengthSchemes || []).map(s => `
                    <button type="button" onclick="appActions.selectRecipeScheme('${s}')" class="w-full text-left p-2 rounded-xl border transition truncate tactile ${curScheme === s ? 'bg-blue-600 text-white font-bold border-blue-500 shadow' : 'bg-input text-slate-300 border-sub hover:bg-slate-800'}">
                      ${s}
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="md:col-span-8 bg-card-sub p-4 rounded-3xl border border-sub space-y-3.5 shadow-xl">
  <div class="border-b border-sub pb-2 flex justify-between items-start">
    <div>
      <span class="text-[9px] text-accent font-bold uppercase tracking-wider">Protocol Configuration</span>
      <h3 class="text-sm font-bold text-white mt-0.5">${curScheme}</h3>
      <div class="text-[10px] text-slate-400 mt-0.5">${bp.category || 'Dynamic'} • Pattern: <b class="text-slate-200 capitalize">${(bp.pattern || 'straight').replace('_', ' ')}</b></div>
    </div>
    <div class="flex items-center space-x-1.5">
      <button type="button" onclick="appActions.duplicateSchemeBlueprint('${curScheme}')" class="px-2.5 py-1.5 bg-input hover:bg-slate-700 border border-sub text-slate-200 rounded-xl text-xs font-bold tactile shadow-md" title="Clone scheme into a new custom blueprint">
        📋 Duplicate
      </button>
      ${(curScheme.startsWith('custom_') || !DEFAULT_SCHEME_BLUEPRINTS[curScheme]) ? `
        <button type="button" onclick="appActions.deleteCustomBlueprint('${curScheme}')" class="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 font-bold rounded-xl text-xs tactile shadow-md">
          ✕ Delete
        </button>
      ` : ''}
      <button type="button" onclick="appActions.saveSchemeBlueprint('${curScheme}')" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tactile shadow-md">
        Save Protocol
      </button>
    </div>
  </div>

 <!-- Phase Scope & Simulation Lens Bar -->
  <div class="p-3 bg-input/70 rounded-2xl border border-sub/80 space-y-2">
    <div class="flex flex-wrap items-center justify-between gap-2">
      
      <!-- Phase Scope Selector -->
      <div class="flex items-center space-x-2">
        <span class="text-[9px] font-mono uppercase text-slate-400 font-bold">Scope:</span>
        <select onchange="appActions.setBuilderPhaseScope(this.value)" class="bg-card border border-sub rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-accent focus:outline-none">
          <option value="Global" ${activeScope === 'Global' ? 'selected' : ''}>🌐 Global Default (All Phases)</option>
          <optgroup label="Phase-Specific Overrides">
            ${(availablePhases || []).map(ph => `
              <option value="${ph}" ${activeScope === ph ? 'selected' : ''}>
                ${ph} ${rawBp.phaseOverrides?.[ph] ? '★ (Overridden)' : ''}
              </option>
            `).join('')}
          </optgroup>
        </select>
      </div>

      <!-- Simulation Week Selector -->
      <div class="flex items-center space-x-2">
        <span class="text-[9px] font-mono uppercase text-slate-400 font-bold">Sim Week:</span>
        <div class="flex bg-card p-0.5 rounded-xl border border-sub text-xs font-mono">
          ${[1, 2, 3, 4].map(w => `
            <button type="button" onclick="appActions.setBuilderSimWeek(${w})" class="px-2 py-0.5 rounded-lg font-bold transition tactile ${simWeek === w ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}">
              W${w}
            </button>
          `).join('')}
        </div>
      </div>

    </div>

    <!-- Override Status Indicator -->
    ${activeScope !== 'Global' ? `
      <div class="flex justify-between items-center text-[10px] font-mono pt-1 border-t border-sub/40">
        <span class="${hasOverride ? 'text-accent font-bold' : 'text-slate-400'}">
          ${hasOverride ? `⚡ Customizing ${activeScope} rules` : `🔗 Inheriting Global defaults for ${activeScope}`}
        </span>
        ${hasOverride ? `
          <button type="button" onclick="appActions.clearPhaseOverride('${curScheme}', '${activeScope}')" class="text-rose-400 hover:text-rose-300 underline font-semibold">
            Revert ${activeScope} to Global
          </button>
        ` : ''}
      </div>
    ` : ''}
  </div> 

  <!-- Parameters Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
    ${parametersGridHtml}
  </div>

  <!-- Strain & Overload Directives Header (Clean / Slate & Indigo) -->
  <div class="pt-2 border-t border-sub/50 space-y-2">
    <div class="flex flex-wrap items-center justify-between gap-2 bg-input/40 p-2.5 rounded-2xl border border-sub/60">
      <div class="flex items-center space-x-2">
        <span class="text-[9px] font-mono uppercase text-slate-400 font-bold">Session Fatigue:</span>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded-lg border font-bold ${strainInfo.badge}">
          ${strainInfo.score} • ${strainInfo.level}
        </span>
      </div>
      <div class="text-[10px] font-mono text-slate-400">
        SFR: <b class="text-accent">${bp.sfrRating || 'Standard'}</b>
      </div>
    </div>

    <!-- Scheme Instructions (Slate Text / Clean) -->
    <div class="bg-input/70 p-2.5 rounded-2xl border border-sub space-y-1">
      <div class="flex justify-between items-center text-[9px] font-mono uppercase font-bold text-slate-400">
        <span>Instructions</span>
      </div>
      <input type="text" 
        value="${bp.instructions || bp.directive || ''}" 
        placeholder="e.g. Add 5 lbs when all sets hit top rep ceiling at target RPE"
        onchange="appActions.updateSchemeInstructions('${curScheme}', this.value)" 
        class="w-full bg-card border border-sub rounded-xl px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-accent">
    </div>

    <!-- Live Simulation Preview -->
    <div class="space-y-1 pt-1">
      <div class="flex justify-between items-center text-[9px] text-slate-400 uppercase font-bold px-1">
        <span>Simulation Preview (${previewSets.length} Sets Total)</span>
        <span class="text-accent">200 lbs Anchor Load</span>
      </div>
      <div class="space-y-1">
        ${simulationPreviewHtml}
      </div>
    </div>
  </div>

                <div class="pt-2 border-t border-sub/50 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Rep window locks (e.g. 8-8r) override Global Matrix bookends.</span>
                  <button type="button" onclick="appActions.navigate('settings', event)" class="text-accent underline font-bold">
                    View Phase Matrix &rarr;
                  </button>
                </div>

                <button type="button" onclick="appActions.saveCurrentRecipe('${curScheme}')" class="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-bold text-white transition tactile shadow-lg font-mono">
                  Save Changes
                </button>
              </div>
            </div>
          </main>
        `;
      }

      // 3. ACTIVE LOGGER SCREEN
      else if (state.screen === 'logger') {
        const exercisesHtml = (state.activeWorkout || []).map((ex, exIdx) => {
          const meta = core.getExMeta ? core.getExMeta(ex.exercise) : { w: true, r: true, t: false, rpe: true };
          const isCollapsed = state.collapsedCards[exIdx];
          const cleanMods = sanitizeModifiers(ex.modifiers);
          const variantKey = core.getVariantKey ? core.getVariantKey(ex.exercise, cleanMods) : ex.exercise;
          const prEvent = state.sessionPRs[variantKey];

          const exBpObj = state.schemeBlueprints?.[ex.scheme] || DEFAULT_SCHEME_BLUEPRINTS?.[ex.scheme] || {};
          const isDensity = (ex.scheme === 'Density Block' || exBpObj.pattern === 'density_block');
          const isDensityRunning = ex.densityRunning;

          const sessionDateKey = state.isEditingHistorical ? state.historicalDateKey : (state.activeWorkoutDateKey || getCurKey());
          const completedSets = (ex.sets || []).filter(s => s && s.done);
          const liveReps = completedSets.reduce((sum, s) => sum + (Number(s.actualReps) || 0), 0);

          let livePeakE1 = 0;
          let liveLastE1 = 0;
         completedSets.forEach(s => {
  const rawW = Number(s.actualWeight) || 0;
  if (s.actualReps && s.actualRpe) {
    const cleanRpe = roundRpe(s.actualRpe);
    const c = getUnifiedE1RM(rawW, s.actualReps, cleanRpe, ex.exercise, sessionDateKey);
    if (c > 0) {
      if (c > livePeakE1) livePeakE1 = c;
      liveLastE1 = c;
    }
  }
});
          const liveFatiguePct = (livePeakE1 > 0 && liveLastE1 > 0)
            ? Math.max(0, Math.round(((livePeakE1 - liveLastE1) / livePeakE1) * 100))
            : 0;

          const nextOpenSet = (ex.sets || []).find(s => s && !s.done) || (ex.sets || [])[0] || {};
          const ghostPacer = (meta.w && meta.r && core.getGhostPacerForLift)
            ? core.getGhostPacerForLift(ex.exercise, cleanMods, nextOpenSet.actualWeight || nextOpenSet.targetLoad || 0, nextOpenSet.targetRpe || 8.5, livePeakE1)
            : null;

          const setRows = (ex.sets || []).map((s, sIdx) => {
         const isLapActive = s.lapRunning;
const targetRpenum = roundRpe(s.targetRpe);
const displayTargetRpe = targetRpenum <= 5.5 ? '&lt;6.0' : targetRpenum.toFixed(1);
const actualRpenum = (s.actualRpe !== undefined && s.actualRpe !== null && s.actualRpe !== '') ? Number(s.actualRpe) : 0;


          const hasCustomLabel = s.label && !/^Set \d+$/i.test(s.label);

            return `
              <div id="set-row-${exIdx}-${sIdx}" class="px-2 py-1.5 rounded-lg border transition-colors ${s.done ? 'bg-emerald-950/20 border-emerald-600/40' : 'bg-input border-sub'}">
                <div class="grid grid-cols-12 gap-1.5 items-center text-center">
                  
                  <!-- Col 1-2: Delete & Wrapped, Taller Set Label -->
                  <div class="col-span-2 flex items-center space-x-1 text-left min-w-0">
                    <button type="button" onclick="appActions.deleteSet(${exIdx},${sIdx})" class="text-[10px] text-slate-500 hover:text-rose-400 p-0.5 shrink-0" title="Remove Set">✕</button>
                    <span class="w-full min-h-[30px] px-1 py-0.5 rounded bg-card-sub border border-sub font-mono text-[9px] font-bold text-slate-300 leading-[1.1] whitespace-normal break-words flex items-center justify-center text-center">${hasCustomLabel ? s.label : `Set ${sIdx + 1}`}</span>
                  </div>

                  <!-- Col 3-5: Target Prescription (Wrapped & Full Text on Mobile) -->
                  <span class="col-span-3 font-mono text-[10px] md:text-xs font-semibold text-slate-300 text-left pl-0.5 leading-[1.15] whitespace-normal break-words">
                    ${(s.targetLoad !== undefined && s.targetLoad !== null && s.targetLoad !== '' && Number(s.targetLoad) > 0) ? s.targetLoad + 'x' : ''}${s.targetReps || ''}${meta.r ? 'r' : ''} <span class="text-slate-400 whitespace-nowrap">@${displayTargetRpe}</span>
                  </span>

                  <!-- Col 6-10: Actual Inputs (Lbs, Reps, Wider RPE) -->
                  <div class="col-span-5 grid grid-cols-[1fr_0.85fr_1.25fr] gap-1 items-center">
                    ${meta.w ? `
                      <input type="number" step="2.5" inputmode="decimal" placeholder="lbs" value="${s.actualWeight !== undefined && s.actualWeight !== null && s.actualWeight !== '' ? s.actualWeight : (s.targetLoad || '')}" onchange="appActions.updateSetInput(${exIdx}, ${sIdx}, 'actualWeight', this.value)" class="w-full h-8 bg-card-sub border border-sub rounded text-center font-mono text-xs font-bold text-white px-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                    ` : `
                      <div class="w-full h-8 bg-card-sub/40 border border-sub/50 rounded flex items-center justify-center font-mono text-xs font-bold text-slate-400">—</div>
                    `}

                    <input type="number" step="1" inputmode="numeric" placeholder="Reps" value="${s.actualReps !== undefined && s.actualReps !== null ? s.actualReps : ''}" onchange="appActions.updateSetInput(${exIdx}, ${sIdx}, 'actualReps', this.value)" class="w-full h-8 bg-card-sub border border-sub rounded text-center font-mono text-xs font-bold text-white px-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">

                    <select onchange="appActions.updateSetInput(${exIdx}, ${sIdx}, 'actualRpe', this.value)" style="background-image: none;" class="w-full h-8 bg-card-sub border border-sub rounded text-center font-mono text-xs font-bold text-accent px-1 appearance-none cursor-pointer">
                      <option value="">RPE</option>
                      <option value="5.5" ${actualRpenum > 0 && actualRpenum <= 5.5 ? 'selected' : ''}>&lt;6.0</option>
                      <option value="6.0" ${actualRpenum === 6 ? 'selected' : ''}>6.0</option>
                      <option value="6.5" ${actualRpenum === 6.5 ? 'selected' : ''}>6.5</option>
                      <option value="7.0" ${actualRpenum === 7 ? 'selected' : ''}>7.0</option>
                      <option value="7.5" ${actualRpenum === 7.5 ? 'selected' : ''}>7.5</option>
                      <option value="8.0" ${actualRpenum === 8 ? 'selected' : ''}>8.0</option>
                      <option value="8.5" ${actualRpenum === 8.5 ? 'selected' : ''}>8.5</option>
                      <option value="9.0" ${actualRpenum === 9 ? 'selected' : ''}>9.0</option>
                      <option value="9.5" ${actualRpenum === 9.5 ? 'selected' : ''}>9.5</option>
                      <option value="10.0" ${actualRpenum === 10 ? 'selected' : ''}>10.0</option>
                    </select>
                  </div>

                  <!-- Col 11-12: Log Button -->
                  <div class="col-span-2 flex justify-end">
                    <button type="button" id="set-btn-${exIdx}-${sIdx}" onclick="appActions.logSet(${exIdx}, ${sIdx}, event)" class="w-full h-8 rounded font-bold text-xs transition-all flex items-center justify-center ${s.done ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' : 'bg-card-sub border border-sub text-slate-400 hover:text-white'}">
                      ${s.done ? '✓' : 'Log'}
                    </button>
                  </div>

                </div>

                ${meta.t ? `
                  <div class="pt-1.5 mt-1 border-t border-sub/50 flex items-center justify-between text-xs font-mono">
                    <span class="text-[9px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                      <span>⏱️</span><span>Timer / Lap:</span>
                    </span>
                    <div class="flex items-center space-x-1.5">
                      <button type="button" onclick="appActions.toggleSetLap(${exIdx}, ${sIdx})" class="px-2 py-0.5 rounded font-mono text-[10px] font-bold ${isLapActive ? 'bg-amber-600 text-white animate-pulse' : 'bg-card-sub border border-sub text-slate-400'}">
                        ${isLapActive ? '⏸️' : '▶️'} <span id="lap-display-${exIdx}-${sIdx}">${fmtTime(s.actualTime || 0)}</span>
                      </button>
                      <input type="number" placeholder="sec" value="${s.actualTime || ''}" onchange="appActions.updateSetInput(${exIdx}, ${sIdx}, 'actualTime', this.value)" class="w-14 h-7 text-center bg-card-sub border border-sub/50 rounded text-white text-xs font-mono">
                      <button type="button" onclick="appActions.resetSetLap(${exIdx}, ${sIdx})" class="px-1.5 py-0.5 bg-card-sub border border-sub rounded text-slate-400 hover:text-white text-xs">↺</button>
                    </div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('');

// Build Inline Load Calculator Drawer
   // --- Inline Load & e1RM Calculator Actions ---
 // Build Inline Load & e1RM Calculator Drawer
    let calcDrawerHtml = '';
    if (state.openExerciseCalc === exIdx) {
      const calcState = (state.exerciseCalcState && state.exerciseCalcState[exIdx]) || { 
        calcMode: 'rpe', reps: 8, rpe: 8.0, modPct: 0, directPct: 75, customE1rm: null 
      };
      const isPctMode = calcState.calcMode === 'pct';

      const cleanMods = sanitizeModifiers(ex.modifiers || []);
      const variantKey = typeof getVariantKey === 'function' ? getVariantKey(ex.exercise, cleanMods) : ex.exercise;
      const baseAnchor = Number(
        (typeof getBaseAnchorE1rm === 'function' ? getBaseAnchorE1rm(ex.exercise, cleanMods) : null) || 
        state.anchorE1rms?.[variantKey] || 
        state.anchorE1rms?.[ex.exercise] || 
        state.e1rms?.[variantKey] || 
        state.e1rms?.[ex.exercise] || 0
      );
      
      const prVal = Number(state.e1rms?.[variantKey] || state.e1rms?.[ex.exercise] || baseAnchor || 0);
      const activeE1rm = calcState.customE1rm !== null && calcState.customE1rm !== undefined 
        ? Number(calcState.customE1rm) 
        : baseAnchor;

      const rounding = Number(state.settings?.rounding) || 5;
      const firstOpenSetIdx = (ex.sets || []).findIndex(s => !s.done);
      const targetSetIdx = firstOpenSetIdx !== -1 ? firstOpenSetIdx : 0;

      // Calculate Effective Percentage based on mode
      let effectivePct = 75.0;
      if (isPctMode) {
        effectivePct = Number(calcState.directPct) || 75.0;
      } else {
        const rawPct = typeof getPct === 'function' ? getPct(Number(calcState.reps) || 8, Number(calcState.rpe) || 8.0) : 80.7;
        const basePct = rawPct <= 1 ? rawPct * 100 : rawPct;
        effectivePct = Math.round((basePct + (Number(calcState.modPct) || 0)) * 10) / 10;
      }

      // Recommended Load calculation
      const recommendedLoad = activeE1rm > 0 
        ? (typeof roundLoad === 'function' ? roundLoad(activeE1rm * (effectivePct / 100), rounding) : Math.round((activeE1rm * (effectivePct / 100)) / rounding) * rounding) 
        : 0;

      // Delta against movement anchor
      const isCustomE1rm = calcState.customE1rm !== null && calcState.customE1rm !== undefined && calcState.customE1rm !== baseAnchor;
      const e1rmDiff = activeE1rm - baseAnchor;
      const diffColor = e1rmDiff > 0 ? 'text-emerald-400' : (e1rmDiff < 0 ? 'text-rose-400' : 'text-slate-400');
      const diffSign = e1rmDiff > 0 ? '+' : '';

      // Pre-build RPE dropdown options
      let rpeOptions = '';
      [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0].forEach(r => {
        rpeOptions += `<option value="${r}" ${Number(calcState.rpe) === r ? 'selected' : ''}>@${r.toFixed(1)}</option>`;
      });

      // Fetch recent history for this exercise (up to 10 prior sessions)
      const liftHistory = (typeof getLiftHistory === 'function' 
        ? getLiftHistory(ex.exercise, false, cleanMods) 
        : (core.getLiftHistory ? core.getLiftHistory(ex.exercise, false, cleanMods) : [])) || [];

      const recentSets = [];
      for (const h of liftHistory) {
        if (!h.sets || !h.sets.length) continue;
        const validSets = h.sets.filter(s => s && s.done && s.actualWeight && s.actualReps);
        if (validSets.length) {
          const topSet = validSets.reduce((prev, cur) => (cur.actualWeight > prev.actualWeight) ? cur : prev, validSets[0]);
          recentSets.push({
            date: h.date,
            weight: topSet.actualWeight,
            reps: topSet.actualReps,
            rpe: topSet.actualRpe || topSet.rpe || 8.0,
            e1rm: h.topE1 || Math.round(topSet.actualWeight / ((typeof getPct === 'function' ? getPct(topSet.actualReps, topSet.actualRpe || 8) : 80) / 100))
          });
        }
        if (recentSets.length >= 10) break;
      }

      let historyRowsHtml = '';
      if (recentSets.length) {
        historyRowsHtml = recentSets.map(h => {
          let formattedDate = h.date.slice(5);
          if (h.date.includes('-')) {
            const parts = h.date.split('-');
            const mIdx = Number(parts[1]) - 1;
            const shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            if (shortMonths[mIdx]) formattedDate = `${shortMonths[mIdx]} ${Number(parts[2])}`;
          }

          return `
            <div class="flex items-center justify-between py-1.5 text-[10px] hover:bg-card-sub/40 transition-colors px-1 rounded-lg">
              <span class="text-slate-400 font-medium w-16 shrink-0">${formattedDate}</span>
              <span class="text-white font-bold flex-1 text-left pl-1">
                ${h.weight} lbs × ${h.reps} <span class="text-accent font-normal">@${Number(h.rpe).toFixed(1)}</span>
              </span>
              <span class="text-slate-400 font-mono text-[9px] pr-2 shrink-0">${h.e1rm} e1RM</span>
              <button type="button" 
                onclick="appActions.useHistoryInCalc(${exIdx}, ${h.weight}, ${h.reps}, ${h.rpe})"
                class="px-2 py-0.5 bg-input hover:bg-accent hover:text-black border border-sub text-slate-300 rounded text-[9px] font-bold transition-all tactile shrink-0">
                Use
              </button>
            </div>
          `;
        }).join('');
      } else {
        historyRowsHtml = `<div class="text-[10px] text-slate-500 py-3 text-center">No prior completed sessions logged</div>`;
      }

      calcDrawerHtml = `
        <div class="mb-2 p-3 rounded-2xl bg-card-sub/95 border border-amber-500/30 font-mono space-y-3 text-xs shadow-xl" onclick="event.stopPropagation()">
          
          <!-- Top Row: Editable e1RM + Reset & PR -->
          <div class="flex justify-between items-center pb-2 border-b border-sub/50">
            <div class="flex items-center space-x-1.5">
              <span class="text-[9px] uppercase font-bold text-slate-400">e1RM</span>
              <div class="flex items-center bg-input border border-sub rounded-lg px-2 py-0.5">
                <input type="number" step="2.5" value="${activeE1rm}" 
                  onchange="appActions.updateExerciseCalc(${exIdx}, 'customE1rm', Number(this.value))"
                  class="w-14 bg-transparent text-white font-bold text-center text-xs focus:outline-none" />
                <span class="text-[9px] text-slate-400 ml-1">lbs</span>
              </div>
              <button type="button" 
                onclick="appActions.resetExerciseCalcE1rm(${exIdx})" 
                title="Reset to Anchor (${baseAnchor} lbs)" 
                class="text-slate-400 hover:text-accent p-1 text-sm transition-colors">
                ↺
              </button>
              ${isCustomE1rm ? `
                <span class="${diffColor} text-[10px] font-bold">
                  (${diffSign}${e1rmDiff} lbs)
                </span>
              ` : ''}
            </div>

            <div class="text-[10px] text-slate-400">
              PR: <span class="text-white font-bold">${prVal > 0 ? prVal + ' lbs' : 'None'}</span>
            </div>
          </div>

          <!-- Section: Inputs + RPE/% Toggle Switch -->
          <div class="space-y-1.5">
            <div class="flex justify-between items-center">
              <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Inputs</span>
              
              <!-- Segmented RPE vs % Switch -->
              <div class="flex items-center space-x-1.5 bg-input px-2 py-0.5 rounded-lg border border-sub">
                <span class="text-[8.5px] font-bold ${!isPctMode ? 'text-accent' : 'text-slate-500'}">RPE</span>
                <button type="button" 
                  onclick="appActions.updateExerciseCalc(${exIdx}, 'calcMode', '${isPctMode ? 'rpe' : 'pct'}')"
                  class="w-7 h-3.5 bg-card-sub border border-sub rounded-full p-0.5 transition-colors relative flex items-center">
                  <span class="w-2.5 h-2.5 rounded-full transition-transform transform ${isPctMode ? 'translate-x-3 bg-accent' : 'translate-x-0 bg-slate-400'}"></span>
                </button>
                <span class="text-[8.5px] font-bold ${isPctMode ? 'text-accent' : 'text-slate-500'}">%</span>
              </div>
            </div>

            ${!isPctMode ? `
              <!-- RPE Mode: Reps, RPE, % Mod -->
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-[8px] uppercase text-slate-400 mb-0.5">Reps</label>
                  <input type="number" min="1" max="30" value="${calcState.reps}" 
                    onchange="appActions.updateExerciseCalc(${exIdx}, 'reps', Number(this.value))"
                    class="w-full bg-input border border-sub rounded-xl py-1.5 text-center text-white text-xs font-bold focus:outline-none focus:border-accent">
                </div>
                <div>
                  <label class="block text-[8px] uppercase text-slate-400 mb-0.5">RPE</label>
                  <select onchange="appActions.updateExerciseCalc(${exIdx}, 'rpe', Number(this.value))"
                    class="w-full bg-input border border-sub rounded-xl py-1.5 text-center text-accent text-xs font-bold focus:outline-none focus:border-accent">
                    ${rpeOptions}
                  </select>
                </div>
                <div>
                  <label class="block text-[8px] uppercase text-slate-400 mb-0.5">Percent Mod</label>
                  <input type="number" step="0.5" value="${calcState.modPct || 0}" placeholder="±%" 
                    onchange="appActions.updateExerciseCalc(${exIdx}, 'modPct', Number(this.value))"
                    class="w-full bg-input border border-sub rounded-xl py-1.5 text-center text-amber-400 text-xs font-bold focus:outline-none focus:border-accent">
                </div>
              </div>
            ` : `
              <!-- Percent Mode: Direct Percent Input -->
              <div>
                <label class="block text-[8px] uppercase text-slate-400 mb-0.5">Percent</label>
                <input type="number" step="0.5" min="10" max="120" value="${calcState.directPct || 75}" placeholder="e.g. 75" 
                  onchange="appActions.updateExerciseCalc(${exIdx}, 'directPct', Number(this.value))"
                  class="w-full bg-input border border-sub rounded-xl py-1.5 text-center text-accent text-xs font-bold focus:outline-none focus:border-accent">
              </div>
            `}
          </div>

          <!-- Section: Recommendation -->
          <div class="space-y-1 pt-1 border-t border-sub/40">
            <div class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Recommendation</div>
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center space-x-2">
                <div class="bg-input border border-sub rounded-xl px-2 py-1 text-center min-w-[70px]">
                  <span class="block text-[8px] uppercase text-slate-400">Load</span>
                  <input type="number" step="2.5" value="${recommendedLoad}" 
                    onchange="appActions.updateCalcFromLoad(${exIdx}, this.value)"
                    title="Edit to reverse-project e1RM"
                    class="w-full bg-transparent text-sm font-black text-white text-center focus:outline-none focus:text-accent">
                </div>
                <div class="bg-input border border-sub rounded-xl px-2 py-1 text-center min-w-[50px]">
                  <span class="block text-[8px] uppercase text-slate-400">Reps</span>
                  <input type="number" min="1" max="30" value="${calcState.reps}"
                    onchange="appActions.updateExerciseCalc(${exIdx}, 'reps', Number(this.value))"
                    title="Target reps for this set"
                    class="w-full bg-transparent text-sm font-bold text-slate-200 text-center focus:outline-none focus:text-accent">
                </div>
                <div class="text-[10px] text-slate-400 pl-1 leading-tight">
                  <span class="text-amber-300 font-bold text-xs">${effectivePct.toFixed(1)}%</span><br>of e1RM
                </div>
              </div>

              <button type="button" 
                onclick="appActions.applyCalcToSet(${exIdx}, ${targetSetIdx}, ${recommendedLoad}, ${Number(calcState.reps) || 8})"
                class="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold shadow-md transition-colors whitespace-nowrap tactile">
                ↳ Apply to S${targetSetIdx + 1}
              </button>
            </div>
          </div>

          <!-- Section: Recent History (Scrollable Window) -->
          <div class="pt-2 border-t border-sub/40 space-y-1.5">
            <div class="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-400">
              <span class="flex items-center gap-1">
                <span>Recent History</span>
                <span class="text-[8px] bg-input border border-sub px-1.5 py-0.2 rounded text-slate-300 font-mono">${recentSets.length}</span>
              </span>
              <span class="text-[8px] text-slate-500 font-normal">Scroll for past entries</span>
            </div>

            <div class="bg-input/40 rounded-xl p-1 border border-sub/30 max-h-32 overflow-y-auto divide-y divide-sub/20 space-y-0.5" style="scrollbar-width: thin;">
              ${historyRowsHtml}
            </div>
          </div>

        </div>
      `;
    }

          return `
            <div id="active-ex-card-${exIdx}" class="bg-card-sub rounded-2xl border ${isDensity ? 'border-blue-700/80 shadow-lg' : 'border-sub'} p-3 space-y-2 relative shadow-md scroll-mt-24">
              <div class="flex justify-between items-start border-b border-sub pb-1.5 cursor-pointer" onclick="appActions.toggleCardCollapse(${exIdx})">
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-slate-400">${isCollapsed ? '▶' : '▼'}</span>
                  <div>
                    <div class="flex items-center space-x-1.5">
                      <span class="text-[9px] font-mono uppercase text-slate-400">${ex.tier} • <b class="text-accent">${ex.scheme}</b></span>
                      ${prEvent ? `<span class="text-[8px] font-mono bg-amber-500/20 text-slate-300 border border-amber-500 px-1 py-0.2 rounded font-bold animate-pulse">🔥 
                      PR +${prEvent.diff}lbs</span>` : ''}
                    </div>
                    <div class="flex items-center space-x-2 mt-0.5">
                      <h3 class="text-xs md:text-sm font-bold text-white">${ex.exercise}</h3>
                      </div>

                    <div class="flex flex-wrap gap-1 mt-1 cursor-pointer" onclick="event.stopPropagation(); appActions.openConfig(${exIdx}, true)" title="Tap to adjust modifiers">
                      ${cleanMods.length ? cleanMods.map(m => `<span class="text-[8px] font-mono bg-input text-slate-300 hover:text-white px-1.5 py-0.2 rounded border border-sub">${m}</span>`).join('') : `<span class="text-[8px] font-mono text-slate-500 hover:text-accent">+ Add Modifiers</span>`}
                    </div>
                  </div>
                </div>

                <div class="relative flex items-center gap-1.5" onclick="event.stopPropagation()">
      <!-- Protocol Instructions Info Icon -->
      <button type="button"
        onclick="appActions.openSchemeInfoModal('${String(ex.scheme || '').replace(/'/g, "\\'")}')"
        title="Protocol Instructions"
        class="p-1 rounded-xl border transition-colors flex items-center justify-center bg-input text-slate-400 hover:text-accent border-sub tactile">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>

      <!-- Load Calculator Bolt Icon -->
      <button type="button" 
        onclick="appActions.toggleExerciseCalc(${exIdx})" 
        title="Load Calculator"
        class="p-1 rounded-xl border transition-colors flex items-center justify-center ${state.openExerciseCalc === exIdx ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm' : 'bg-input text-slate-400 hover:text-slate-200 border-sub'}">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </button>

                        <button type="button" onclick="appActions.toggleCardMenu(${exIdx}, event)" class="p-1 rounded-xl bg-input border border-sub text-slate-300 hover:text-white text-xs w-7 h-7 flex items-center justify-center font-bold tactile">⋮</button>
                  ${state.cardMenuOpen === exIdx ? `
        <div class="absolute right-0 top-8 w-48 bg-card border border-sub rounded-2xl shadow-2xl z-40 p-1.5 font-mono text-[11px] space-y-0.5">
          <button type="button" onclick="appActions.openConfig(${exIdx}, true)" class="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-200">Edit Modifiers / Lift</button>
          <button type="button" onclick="appActions.moveActiveEx(${exIdx}, -1)" class="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center space-x-1.5 text-slate-200"><span>↑</span><span>Move Up</span></button>
          <button type="button" onclick="appActions.moveActiveEx(${exIdx}, 1)" class="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center space-x-1.5 text-slate-200"><span>↓</span><span>Move Down</span></button>
          <button type="button" onclick="appActions.openPlanner(${exIdx})" class="w-full text-left p-1.5 rounded-lg hover:bg-blue-600 hover:text-white text-slate-200">Planner & History</button>
          <button type="button" onclick="appActions.deleteActiveEx(${exIdx})" class="w-full text-left p-1.5 rounded-lg hover:bg-red-950 text-red-400 flex items-center space-x-1.5 border-t border-sub mt-0.5"><span>✕</span><span>Remove Movement</span></button>
        </div>
      ` : ''}
                </div>
              </div>

              ${calcDrawerHtml}

              ${ex.tier === 'Main' ? `
                <div class="flex items-center space-x-1.5 pt-0.5 font-mono">
                  <button type="button" onclick="appActions.toggleGroundingSet(${exIdx}, true)" class="px-2 py-0.5 rounded-lg text-[9px] font-bold border transition tactile ${ex.isGrounding ? 'bg-amber-600 text-white border-amber-400 shadow-sm' : 'bg-input text-slate-400 border-sub'}">
                    ${ex.isGrounding ? '🔥 Top Calibration Set (@9.0)' : 'Calibration Set'}
                  </button>
                  <button type="button" onclick="appActions.toggleSkipBackoffs(${exIdx}, true)" class="px-2 py-0.5 rounded-lg text-[9px] font-bold border transition tactile ${ex.skipBackoffs ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm' : 'bg-input text-slate-400 border-sub'}">
                    ${ex.skipBackoffs ? '⚡ Skip Back-offs (ON)' : 'Skip Back-offs'}
                  </button>
                </div>
              ` : ''}

              ${ex.fatigueWarning ? `
                <div class="bg-amber-950/70 border border-amber-600/80 p-2.5 rounded-xl flex items-center justify-between text-xs font-mono animate-pulse">
                  <div class="flex items-center space-x-2">
                    <span class="text-base">⚠️</span>
                    <div>
                      <div class="text-amber-200 font-bold">Fatigue Overshoot Detected</div>
                      <div class="text-[10px] text-amber-300/80">RPE exceeded target by ≥1.0. Recommend -5% back-off.</div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-1">
                    <button type="button" onclick="appActions.applyDrop(${exIdx})" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-[10px] uppercase shadow tactile">
                      Apply -5% Drop
                    </button>
                    <button type="button" onclick="appActions.dismissFatigueWarning(${exIdx})" class="px-2 py-1 bg-input text-slate-400 hover:text-white rounded-lg text-[10px] tactile">✕</button>
                  </div>
                </div>
              ` : ''}

              ${!isCollapsed ? `
                <div class="space-y-2">
                  ${isDensity ? `
                    <div class="bg-input/90 p-2.5 rounded-xl border border-blue-800/60 space-y-2 font-mono">
                      <div class="flex flex-wrap justify-between items-center gap-2">
                        <div class="flex items-center space-x-2">
                          <span class="text-[8px] uppercase bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700 font-bold">⏱ Density Block</span>
                          <div id="density-timer-disp-${exIdx}" class="text-base font-black tracking-wider ${isDensityRunning ? 'text-emerald-400 animate-pulse' : 'text-accent'}">
                            ${fmtTime(ex.densitySec !== undefined ? ex.densitySec : 480)}
                          </div>
                        </div>
                        <div class="flex items-center space-x-1.5">
                          <button type="button" onclick="appActions.setDensityDuration(${exIdx}, Math.max(1, Math.round((ex.densityTotalSec || 480) / 60) - 1))" class="w-6 h-6 bg-card-sub border border-sub rounded-lg text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center tactile" title="-1 Minute">−</button>
                          <select onchange="appActions.setDensityDuration(${exIdx}, Number(this.value))" class="bg-card-sub border border-sub rounded-lg px-2 py-1 text-[10px] font-bold text-white focus:outline-none focus:border-accent">
                            ${Array.from({ length: 20 }, (_, i) => i + 1).map(m => `
                              <option value="${m}" ${Math.round((ex.densityTotalSec || 480) / 60) === m ? 'selected' : ''}>${m}:00 (${m}m)</option>
                            `).join('')}
                          </select>
                          <button type="button" onclick="appActions.setDensityDuration(${exIdx}, Math.min(20, Math.round((ex.densityTotalSec || 480) / 60) + 1))" class="w-6 h-6 bg-card-sub border border-sub rounded-lg text-xs font-bold text-accent hover:text-white flex items-center justify-center tactile" title="+1 Minute">+</button>
                          <button type="button" onclick="appActions.toggleDensity(${exIdx})" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition tactile shadow ${isDensityRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}">
                            ${isDensityRunning ? '⏸ Pause' : '▶ Start'}
                          </button>
                          <button type="button" onclick="appActions.resetDensity(${exIdx})" class="px-2 py-1 bg-card-sub border border-sub rounded-lg text-[10px] font-bold text-slate-300 hover:text-white tactile">
                            ↺
                          </button>
                        </div>
                      </div>
                    </div>
                  ` : ''}

                  <div class="space-y-1.5">
                    <div class="grid grid-cols-12 gap-1 px-2 text-[9px] md:text-[10px] font-mono text-slate-400 font-bold items-end pb-1">
      <div class="col-span-2 flex items-end justify-center pb-0.5">SET</div>
      <div class="col-span-3 flex items-end justify-center pb-0.5">TARGET</div>
      
      <!-- Stacked Actual + Sub-columns -->
      <div class="col-span-5 flex flex-col items-center">
        <span class="text-[7.5px] md:text-[8px] uppercase tracking-widest text-slate-500 font-semibold mb-0.5">
          ${meta.t ? 'LOAD' : 'ACTUAL'}
        </span>
        <div class="w-full grid grid-cols-[1fr_0.85fr_1.25fr] gap-1 text-center text-[9px] md:text-[10px] text-slate-400">
          <span>LBS</span>
          <span>REPS</span>
          <span>RPE</span>
        </div>
      </div>

      <div class="col-span-2 flex items-end justify-center pb-0.5">LOG</div>
    </div>
    ${ex.liveAnchorSync ? `
                <div class="mb-2 p-2 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center justify-between font-mono text-xs">
                  <span class="text-amber-300">⚡ Set 1 Drift: <b>${ex.liveAnchorSync.pctDiff > 0 ? '+' : ''}${ex.liveAnchorSync.pctDiff}%</b> (Live e1RM: <b>${ex.liveAnchorSync.liveE1} lbs</b>)</span>
                  <button type="button" onclick="appActions.syncLiveAnchor(${exIdx})" class="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-sm transition tactile">
                    Sync Remaining Sets
                  </button>
                </div>
              ` : ''}
                    <div class="space-y-1">
                  ${setRows}
                </div>
                    
                    ${ghostPacer ? `
                      <div class="px-2.5 py-1.5 mt-1 rounded-xl bg-input/70 border border-sub/70 flex items-center justify-between text-[9.5px] font-mono">
                        <span class="text-slate-400 font-bold uppercase tracking-wider shrink-0">👻 Ghost Pacer</span>
                        <span class="${ghostPacer.deltaVs90 !== null && ghostPacer.deltaVs90 > 0 ? 'text-emerald-400 font-bold' : 'text-accent font-semibold'} text-right truncate ml-2">${ghostPacer.cue}</span>
                      </div>
                    ` : ''}

                    <div class="mt-1.5">
                      <input type="text" placeholder="Note (e.g. J-cup hole 11, bench notch 3, elbow cue)..."
                        value="${String(ex.notes || '').replace(/"/g, '&quot;')}"
                        onchange="appActions.updateExerciseNotes(${exIdx}, this.value)"
                        class="w-full bg-input/60 border border-sub/60 rounded-xl px-2.5 py-1 text-[10px] font-mono text-slate-300 placeholder-slate-500 focus:outline-none focus:border-accent" />
                    </div>

                    <div class="flex justify-between items-center pt-2 mt-1 border-t border-sub/40 font-mono text-[10px]">
                      <button type="button" onclick="appActions.addSet(${exIdx})" class="text-[9px] md:text-xs font-mono text-slate-300 bg-input px-2.5 py-1 rounded-xl border border-sub font-semibold hover:text-white tactile">+ Add Set</button>
                      <div class="flex items-center space-x-2 text-[10px] text-slate-400">
                        <span>e1RM: <b class="text-accent">${livePeakE1 > 0 ? livePeakE1 + 'lbs' : '—'}</b></span>
                        <span>•</span>
                        <span>Reps: <b class="text-slate-200">${liveReps}</b></span>
                        <span>•</span>
                        <span>Drop: <b class="${liveFatiguePct >= 5 ? 'text-amber-400' : 'text-slate-200'}">${liveFatiguePct}%</b></span>
                      </div>
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('');

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 max-w-6xl mx-auto w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="sticky top-0 z-30 bg-card/95 backdrop-blur-md border border-sub p-2.5 rounded-2xl space-y-2 text-[10px] md:text-xs font-mono shadow-xl w-full">
              <div class="flex flex-wrap justify-between items-center gap-2">
                <div class="flex items-center space-x-2">
                  <span class="text-slate-400 font-semibold">Session:</span>
                  <span id="workout-elapsed-time" class="text-slate-200 font-bold">${fmtTime(state.sessionSecs)}</span>
                </div>
                <div class="flex items-center space-x-2.5">
                  ${state.restCountdownTarget > 0 ? `
                    <div class="flex items-center space-x-1 bg-input px-2 py-0.5 rounded-xl border border-accent/50">
                      <span class="text-[9px] text-slate-400 uppercase">Target:</span>
                      <span id="workout-rest-countdown" class="font-black text-xs ${state.restCountdownSecs > 0 ? 'text-accent' : 'text-emerald-400 animate-pulse'}">${state.restCountdownSecs > 0 ? fmtTime(state.restCountdownSecs) : 'GO!'}</span>
                      <button type="button" onclick="appActions.adjustRestCountdown(-15)" class="px-1 text-[9px] text-slate-400 hover:text-white">-15</button>
                      <button type="button" onclick="appActions.adjustRestCountdown(15)" class="px-1 text-[9px] text-slate-400 hover:text-white">+15</button>
                      <button type="button" onclick="appActions.clearRestCountdown()" class="px-1 text-[9px] text-slate-500 hover:text-rose-400">✕</button>
                    </div>
                  ` : ''}
                  <div class="flex items-center space-x-1.5">
                    <span class="text-slate-400 font-semibold">Rest:</span>
                    <span id="workout-rest-display" class="text-amber-400 font-bold text-sm">${fmtTime(state.restStopwatchSecs)}</span>
                  </div>
                </div>
              </div>

              ${(state.activeWorkout || []).length > 1 ? `
                <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 border-t border-sub/50 pt-1.5" style="scrollbar-width: none;">
                  ${(state.activeWorkout || []).map((ex, idx) => {
                    const allDone = (ex.sets || []).length > 0 && (ex.sets || []).every(s => s && s.done);
                    return `
                      <button type="button" onclick="document.getElementById('active-ex-card-${idx}')?.scrollIntoView({ behavior: 'smooth', block: 'start' })"
                        class="px-2 py-0.5 rounded-lg border text-[9.5px] font-bold whitespace-nowrap shrink-0 tactile ${allDone ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-300' : 'bg-input border-sub text-slate-300 hover:border-accent hover:text-white'}">
                        ${allDone ? '✓ ' : ''}${ex.exercise}
                      </button>
                    `;
                  }).join('')}
                </div>
              ` : ''}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full items-start">${exercisesHtml}</div>
            <button type="button" onclick="appActions.openAdd(true)" class="w-full py-2.5 bg-card-sub rounded-2xl text-xs font-bold text-slate-300 border border-sub hover:text-white tactile font-mono">+ Add Movement</button>
            
            <div class="space-y-2 pt-1.5 border-t border-sub/50 font-mono w-full">
              <button type="button" onclick="appActions.openFinishModal()" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-2xl text-xs text-white transition shadow-lg tactile">
                ${state.isEditingHistorical ? 'Update & Save Changes \u2192' : 'Finish Session \u2192'}
              </button>
              <button type="button" onclick="appActions.discardActiveWorkout()" class="w-full py-2 bg-input hover:bg-red-950/40 text-red-400 border border-sub rounded-2xl text-xs font-bold font-mono tactile">
                🗑 Discard Active Session
              </button>
            </div>
          </main>
        `;
      }

      // 4. STAGING SCREEN
      else if (state.screen === 'staging') {
        const targetDateKey = formatIsoDate(state.year, state.month, state.selectedDay);
        const totalPlannedStrain = (state.stagedSlots || []).reduce((acc, slot) => {
          const sets = slot.sets || [];
          return acc + (typeof calculateSchemeStrain === 'function' ? calculateSchemeStrain(sets).score : 0);
        }, 0);

        const curReadinessScore = typeof getReadinessScore === 'function' ? getReadinessScore() : 80;
        const ceiling = typeof getReadinessStrainCeiling === 'function' 
          ? getReadinessStrainCeiling(curReadinessScore) 
          : { max: 800, label: 'Optimal Capacity', badge: 'text-blue-400' };

        const strainPct = Math.min(100, Math.round((totalPlannedStrain / ceiling.max) * 100));
        const isOverCeiling = totalPlannedStrain > ceiling.max;
        const stagedPos = getMesocyclePosition(targetDateKey);
        const stagingCtx = state.stagingContext || { mode: 'plan', phaseOverride: null, splitOverride: null, isDetour: false };
        const curPhase = stagingCtx.phaseOverride || stagedPos.phase;
        const curWeek = stagedPos.week;
        const curBlockWeeks = stagedPos.block.weeks || 3;
        const calendarFocus = getDayFocus(state.selectedDay);
        const activeSplitLabel = stagingCtx.splitOverride === '__BLANK__'
          ? 'Blank Slate'
          : (stagingCtx.splitOverride || calendarFocus);
        const splitTemplateNames = Object.keys(state.customSplitBlueprints || {});

        const rollingReady = core.getRollingReadiness ? core.getRollingReadiness(targetDateKey, 3) : 85;
        const readyBand = getReadinessBand(rollingReady);
        const lifterType = state.profile?.lifterType || 'Natural';
        const volumeLandmarkLabel = curPhase === 'Deload' ? 'MV (Taper)' : (curWeek === 1 ? 'MEV (Intro)' : (curWeek === 2 ? 'MAV (Accretion)' : 'MRV (Overload Peak)'));

        const slotsHtml = (state.stagedSlots || []).map((slot, i) => {
          const cleanMods = sanitizeModifiers(slot.modifiers || []);
          return `
          <div class="bg-card-sub p-3.5 rounded-2xl border border-sub space-y-2 shadow-md">
            <div class="flex justify-between items-start">
              <div>
                <span class="text-[9px] font-mono text-accent uppercase font-bold">${slot.tier} • ${slot.category}</span>
                <div class="text-xs md:text-sm font-bold text-white mt-1">${slot.exercise}</div>
              </div>
              <div class="flex items-center space-x-1">
                <button type="button" onclick="appActions.moveStagedSlot(${i}, -1)" class="w-6 h-6 rounded-lg bg-input border border-sub text-xs text-slate-300 hover:text-white flex items-center justify-center tactile">↑</button>
                <button type="button" onclick="appActions.moveStagedSlot(${i}, 1)" class="w-6 h-6 rounded-lg bg-input border border-sub text-xs text-slate-300 hover:text-white flex items-center justify-center tactile">↓</button>
                <button type="button" onclick="appActions.openConfig(${i}, false)" class="text-[10px] bg-input px-2 py-0.5 rounded-lg border border-sub text-slate-300 font-mono tactile">Edit</button>
                <button type="button" onclick="appActions.deleteStagedSlot(${i})" class="text-[10px] bg-input text-slate-400 hover:text-red-400 px-2 py-0.5 rounded-lg border border-sub tactile">✕</button>
              </div>
            </div>
            ${cleanMods.length ? `
              <div class="flex flex-wrap gap-1">
                ${cleanMods.map(m => `<span class="text-[8px] font-mono bg-input px-2 py-0.5 rounded-md text-accent border border-sub">${m}</span>`).join('')}
              </div>
            ` : ''}

            ${slot.tier === 'Main' ? `
              <div class="flex items-center space-x-1.5 pt-0.5 font-mono">
                <button type="button" onclick="appActions.toggleGroundingSet(${i}, false)" class="px-2 py-0.5 rounded-lg text-[9px] font-bold border transition tactile ${slot.isGrounding ? 'bg-amber-600 text-white border-amber-400 shadow-sm' : 'bg-input text-slate-400 border-sub'}">
                  ${slot.isGrounding ? '🔥 Top Calibration Set (@9.0)' : 'Calibration Set'}
                </button>
                <button type="button" onclick="appActions.toggleSkipBackoffs(${i}, false)" class="px-2 py-0.5 rounded-lg text-[9px] font-bold border transition tactile ${slot.skipBackoffs ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm' : 'bg-input text-slate-400 border-sub'}">
                  ${slot.skipBackoffs ? '⚡ Skip Back-offs (ON)' : 'Skip Back-offs'}
                </button>
              </div>
            ` : ''}

            <div class="space-y-1.5 pt-1 border-t border-sub/50">
              <div class="flex justify-between items-center text-[10px] font-mono">
                <span class="text-slate-400 font-semibold">Rep Scheme:</span>
                <select onchange="appActions.changeSlotScheme(${i}, this.value)" class="bg-input border border-sub rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none max-w-[240px] truncate font-bold">
                  <optgroup label="Hypertrophy Schemes">
                    ${(hypertrophySchemes || []).map(s => `<option value="${s}" ${slot.scheme === s ? 'selected' : ''}>${s}</option>`).join('')}
                  </optgroup>
                  <optgroup label="Strength & Force Schemes">
                    ${(strengthSchemes || []).map(s => `<option value="${s}" ${slot.scheme === s ? 'selected' : ''}>${s}</option>`).join('')}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
        `;
        }).join('');

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="space-y-3 w-full">
              <div class="flex justify-between items-center">
                <div>
                  <div class="flex items-center space-x-2">
                    <h2 class="text-base font-bold text-white font-mono">Stage Workout (Day ${state.selectedDay})</h2>
                    ${stagingCtx.isDetour ? `<span class="text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-600/70 text-indigo-300 font-bold">Detour</span>` : (stagingCtx.mode === 'catchup' ? `<span class="text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 font-bold">Catch-Up</span>` : '')}
                  </div>
                  <p class="text-[10px] text-slate-400 font-mono">${activeSplitLabel} • ${curPhase} ${stagingCtx.phaseOverride ? '(Custom Phase)' : `(W${curWeek}/${curBlockWeeks})`}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-[10px] font-mono text-slate-400">3D Ready: <b class="text-accent">${rollingReady}%</b></span>
                  <button type="button" onclick="appActions.navigate('calendar', event)" class="text-xs text-slate-400 underline font-mono">Calendar</button>
                </div>
              </div>

              <!-- Session Context Bar (Phase & Split Building Blocks) -->
              <div class="p-3 bg-card-sub rounded-2xl border border-sub space-y-2 font-mono text-xs shadow-sm">
                <div class="flex justify-between items-center">
                  <span class="text-[9.5px] text-accent font-bold uppercase">Session Building Blocks</span>
                  <span class="text-[9px] text-slate-400">${stagingCtx.isDetour ? 'Active training block stays untouched' : 'Synced to active training block'}</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div class="space-y-0.5">
                    <label class="text-[8.5px] text-slate-400 uppercase font-bold">Phase (Rep & RPE Targets)</label>
                    <select onchange="appActions.setStagingPhase(this.value)" class="w-full bg-input border border-sub rounded-xl px-2.5 py-1.5 text-white font-bold text-[11px] focus:outline-none focus:border-accent">
                      <option value="__ACTIVE__" ${!stagingCtx.phaseOverride ? 'selected' : ''}>Active Block: ${stagedPos.phase} (W${curWeek})</option>
                      <optgroup label="Detour / Override Phase">
                        ${(availablePhases || []).map(ph => `<option value="${ph}" ${stagingCtx.phaseOverride === ph ? 'selected' : ''}>${ph}</option>`).join('')}
                      </optgroup>
                    </select>
                  </div>
                  <div class="space-y-0.5">
                    <label class="text-[8.5px] text-slate-400 uppercase font-bold">Split Template</label>
                    <select onchange="appActions.setStagingSplit(this.value)" class="w-full bg-input border border-sub rounded-xl px-2.5 py-1.5 text-white font-bold text-[11px] focus:outline-none focus:border-accent">
                      <option value="__BLANK__" ${stagingCtx.splitOverride === '__BLANK__' ? 'selected' : ''}>Blank Slate (Empty Session)</option>
                      <optgroup label="Weekly Split Templates">
                        ${splitTemplateNames.map(sp => `<option value="${sp}" ${activeSplitLabel === sp ? 'selected' : ''}>${sp}${sp === calendarFocus ? ' (Scheduled)' : ''}</option>`).join('')}
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>
            <div class="bg-card-sub p-3 rounded-2xl border ${isOverCeiling ? 'border-rose-500/80' : 'border-sub'} font-mono space-y-1.5 shadow-sm">
      <div class="flex justify-between items-center text-xs">
        <span class="text-[10px] uppercase font-bold text-slate-400">Planned Workout Fatigue:</span>
        <span class="font-bold ${isOverCeiling ? 'text-rose-400 animate-pulse' : 'text-slate-200'}">
          ${totalPlannedStrain} / ${ceiling.max} (${ceiling.label})
        </span>
      </div>
      <div class="w-full bg-input rounded-full h-2 overflow-hidden border border-sub">
        <div class="h-full rounded-full transition-all duration-300 ${isOverCeiling ? 'bg-rose-500' : (strainPct > 80 ? 'bg-indigo-500' : 'bg-blue-500')}" style="width: ${strainPct}%"></div>
      </div>
      ${isOverCeiling ? `
        <div class="text-[9.5px] text-rose-300 font-semibold pt-0.5">
          ⚠️ High Fatigue Warning: Planned density exceeds your recovery threshold (${curReadinessScore}% Readiness). Consider substituting high-SFR clusters or trimming set volume.
        </div>
      ` : ''}
    </div>
              <div class="p-3 bg-card-sub rounded-2xl border border-sub flex justify-between items-center text-xs font-mono shadow-sm">
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="text-slate-300 font-bold">Landmark: <span class="text-accent">${volumeLandmarkLabel}</span></span>
                    <span class="text-[9px] px-2 py-0.5 rounded-md font-bold border ${readyBand.badge}">${readyBand.desc}</span>
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">${lifterType} Lifter • ${state.settings?.baseOnLastWorkout ? 'Anchored to Last Log' : 'Static Baseline'}</div>
                </div>
                <button type="button" onclick="appActions.toggleTopSingle()" class="px-3 py-1 rounded-xl text-[11px] font-bold tactile ${state.settings.includeTopSingle ? 'bg-blue-600 text-white shadow' : 'bg-input text-slate-400 border border-sub'}">
                  1@8: ${state.settings.includeTopSingle ? 'ON' : 'OFF'}
                </button>
              </div>

              <div class="space-y-2.5">
                ${(state.stagedSlots && state.stagedSlots.length > 0) ? slotsHtml : `
                  <div class="p-6 bg-card-sub/70 rounded-2xl border border-dashed border-sub text-center space-y-2.5 font-mono">
                    <div class="text-xs font-bold text-slate-200">Blank Slate Session Ready</div>
                    <div class="text-[10px] text-slate-400">Add movements below, or pick a Split Template above to pre-populate.</div>
                    <button type="button" onclick="appActions.openAdd(false)" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow tactile">
                      + Add First Movement
                    </button>
                  </div>
                `}
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                <button type="button" onclick="appActions.openAdd(false)" class="py-2.5 bg-card-sub rounded-2xl text-slate-300 font-semibold border border-sub hover:text-white tactile">+ Movement</button>
                <button type="button" onclick="appActions.saveCurrentStagedBlueprint()" class="py-2.5 bg-indigo-950/70 text-indigo-300 border border-indigo-700 rounded-2xl font-bold hover:bg-indigo-900 tactile">💾 Save Plan</button>
                <button type="button" onclick="appActions.openCopyModal('${targetDateKey}', state.stagedSlots)" class="py-2.5 bg-card-sub text-slate-300 rounded-2xl font-semibold border border-sub hover:text-white tactile">📋 Copy To...</button>
                <button type="button" onclick="appActions.navigate('calendar', event)" class="py-2.5 bg-input text-slate-400 rounded-2xl border border-sub tactile">Cancel</button>
              </div>
            </div>
            <button type="button" onclick="appActions.startActiveWorkout()" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-2xl text-xs text-white transition shadow-lg tactile font-mono">
              Lock In Targets & Start Workout &rarr;
            </button>
          </main>
        `;
      }

      // 5. PHYSIOLOGICAL CHECK-IN SCREEN
      else if (state.screen === 'checkin') {
        const metricTitles = {
          sleep: '1. Sleep Duration & Restfulness',
          pushSoreness: '2. Push Movers (Chest, Front Delts, Triceps)',
          pullSoreness: '3. Pull Movers (Lats, Upper Back, Biceps)',
          legSoreness: '4. Leg Movers (Quads, Hamstrings, Glutes)',
          energy: '5. CNS Drive & Energy Level',
          stress: '6. External Life & Cognitive Stress',
          motivation: '7. Motivation / Appetite to Train'
        };

        const score = getReadinessScore();
        const band = getReadinessBand(score);

        const metricPills = ['sleep', 'pushSoreness', 'pullSoreness', 'legSoreness', 'energy', 'stress', 'motivation'].map(p => {
          const val = state.formMetrics[p] !== undefined ? state.formMetrics[p] : 4;
          const pillOptions = (p === 'motivation') ? [0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5];

          const pills = pillOptions.map(pt => `
            <button type="button" onclick="appActions.setMetricValue('${p}', ${pt})" class="flex-1 py-1.5 rounded-xl font-mono text-xs font-bold border transition tactile ${val === pt ? 'bg-blue-600 text-white border-blue-400 shadow' : 'bg-input text-slate-400 border-sub'}">
              ${pt === 0 ? 'Rest' : pt}
            </button>
          `).join('');

          return `
            <div class="bg-card-sub p-3 rounded-2xl border border-sub space-y-2">
              <div class="flex justify-between items-center text-xs font-mono">
                <span class="text-slate-200 font-bold">${metricTitles[p]}</span>
                <span class="text-accent font-bold">${val === 0 ? 'Rest Day' : val + '/5'}</span>
              </div>
              <div class="flex gap-1.5">${pills}</div>
              <div class="text-[10px] text-slate-400 font-mono">${metricDescs[p] && metricDescs[p][val] ? metricDescs[p][val] : ''}</div>
            </div>
          `;
        }).join('');

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center font-mono w-full">
              <div>
                <h2 class="text-base font-bold text-white">${monthNames[state.month]} ${state.selectedDay} Readiness Intake</h2>
                <p class="text-[10px] text-slate-400">Autoregulated CNS & recovery metrics</p>
              </div>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-xs text-slate-400 hover:text-white underline">Back</button>
            </div>

            <div class="bg-card-sub p-3.5 rounded-2xl border border-sub space-y-3 shadow-md font-mono w-full">
              <div class="flex justify-between items-center text-xs border-b border-sub pb-2">
                <span class="font-bold uppercase tracking-wider text-slate-200">
                  Readiness: ${score}% (${band.name})
                </span>
                <span class="text-[9px] px-2 py-0.5 rounded-md font-bold border ${band.badge}">${band.desc}</span>
              </div>
              <div class="space-y-2">${metricPills}</div>
            </div>

            <button type="button" onclick="appActions.saveCheckin()" class="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-2xl text-xs text-white transition tactile shadow-lg font-mono">
              Save Readiness & Return &rarr;
            </button>
          </main>
        `;
      }

      // 6. HISTORICAL REVIEW SCREEN
      else if (state.screen === 'history_review') {
       const dKey = normalizeDateKey(state.reviewDateKey || getCurKey());
      const curLog = state.dayLogs?.[dKey] || state.dayLogs?.[state.reviewDateKey] || {};
      const histFallback = (Array.isArray(state.history) ? state.history.find(h => normalizeDateKey(h.date || h.dateKey) === dKey) : null) || {};
      const baseWorkout = curLog.workout || histFallback.workout || histFallback || {};
      const resolvedExercises = (
        (Array.isArray(baseWorkout.exercises) && baseWorkout.exercises.length ? baseWorkout.exercises : null) ||
        (Array.isArray(curLog.exercises) && curLog.exercises.length ? curLog.exercises : null) ||
        (Array.isArray(histFallback.exercises) && histFallback.exercises.length ? histFallback.exercises : null) ||
        []
      );
      const workout = {
        dur: baseWorkout.dur || curLog.dur || histFallback.dur || 45,
        srpe: baseWorkout.srpe || curLog.srpe || histFallback.srpe || 7.5,
        exercises: resolvedExercises
      };
      const srpeNum = roundRpe(workout.srpe);
      const displaySrpe = srpeNum <= 5.5 ? '&lt;6.0' : srpeNum.toFixed(1);

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center border-b border-sub pb-2 font-mono w-full">
              <div>
                <span class="text-[9px] text-emerald-400 uppercase font-bold">✓ Historical Record</span>
                <h2 class="text-base font-bold text-white">${dKey} Completed Session</h2>
              </div>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-xs text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <div class="grid grid-cols-2 gap-2 text-center font-mono w-full">
              <div class="bg-card-sub p-2.5 rounded-2xl border border-sub">
                <div class="text-[9px] text-slate-400 uppercase">Duration</div>
                <div class="text-sm font-bold text-white">${workout.dur || 45} Mins</div>
              </div>
              <div class="bg-card-sub p-2.5 rounded-2xl border border-sub">
                <div class="text-[9px] text-slate-400 uppercase">Session RPE</div>
                <div class="text-sm font-bold text-blue-400">${displaySrpe} / 10</div>
              </div>
            </div>

            <div class="space-y-2">
              ${(workout.exercises || []).map(ex => {
          const exName = ex.exercise || ex.name || 'Exercise';
          const cleanMods = sanitizeModifiers(ex.modifiers || []);
          const setDetails = (ex.sets || []).map((s, idx) => {
            const rawW = s.actualWeight ?? s.weight ?? s.targetWeight ?? 0;
            const rawR = s.actualReps ?? s.reps ?? s.targetReps ?? 0;
            const rawRpe = s.actualRpe ?? s.rpe ?? s.targetRpe ?? 8;
            const effectiveW = getExerciseLoad(exName, rawW, dKey);
            const cleanRpe = roundRpe(rawRpe);
            const displayRpe = cleanRpe <= 5.5 ? '&lt;6.0' : cleanRpe.toFixed(1);
            return `${idx + 1}. ${effectiveW}lbs × ${rawR}r @${displayRpe}`;
          }).join(' • ');

                return `
                  <div class="bg-card-sub p-3 rounded-2xl border border-sub space-y-1.5 font-mono text-xs shadow-sm">
                    <div class="flex justify-between items-start">
                      <div>
                        <span class="text-[9px] text-accent uppercase font-bold">${ex.tier || 'Main'} • ${ex.scheme || 'Straight Sets'}</span>
                        <h4 class="text-xs font-bold text-white">${ex.exercise}</h4>
                      </div>
                      <span class="text-[9px] text-slate-400 font-mono">${Math.round(ex.tonnage || 0).toLocaleString()} lbs vol</span>
                    </div>
                    ${cleanMods.length ? `
                      <div class="flex flex-wrap gap-1">
                        ${cleanMods.map(m => `<span class="text-[8px] bg-input text-accent px-1.5 py-0.2 rounded border border-sub">${m}</span>`).join('')}
                      </div>
                    ` : ''}
                    <div class="text-[10px] text-slate-300 pt-1 border-t border-sub/50 leading-relaxed">
                      ${setDetails || 'No completed sets recorded.'}
                    </div>
                    ${ex.notes ? `<div class="text-[9.5px] text-slate-400 italic pt-0.5">Note: ${ex.notes}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1.5 border-t border-sub/60 font-mono text-xs w-full">
              <button type="button" onclick="appActions.deleteHistoricalSession('${dKey}')" class="py-2.5 bg-input hover:bg-red-950/40 text-red-400 border border-sub rounded-2xl font-bold tactile">Delete Log</button>
              <button type="button" onclick="appActions.openCopyModal('${dKey}')" class="py-2.5 bg-card-sub text-slate-300 rounded-2xl font-semibold border border-sub hover:text-white tactile">📋 Copy To...</button>
              <button type="button" onclick="appActions.editCompletedSession('${dKey}')" class="py-2.5 bg-amber-600 hover:bg-amber-500 rounded-2xl text-black font-bold tactile">✏️ Edit</button>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="py-2.5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-white transition tactile">&larr; Calendar</button>
            </div>
          </main>
        `;
      }

      // 7. MESOCYCLE BLOCKS SCREEN (With On-Demand Wizard Launcher)
      else if (state.screen === 'blocks') {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const splitOptions = Object.keys(state.customSplitBlueprints || {});
        
        const splitMatrixHtml = [1, 2, 3, 4, 5, 6, 0].map(dayIdx => `
          <div class="bg-input p-2 rounded-xl border border-sub flex items-center justify-between gap-2 text-xs font-mono w-full">
            <span class="text-slate-300 font-bold w-16 shrink-0">${dayNames[dayIdx].slice(0, 3)}</span>
            <select onchange="appActions.setWeekdaySplit(${dayIdx}, this.value)" class="flex-1 bg-card-sub border border-sub rounded-lg px-2 py-1 text-slate-200 text-[11px] focus:outline-none truncate font-bold">
              ${splitOptions.map(opt => `<option value="${opt}" ${state.weekdaySplit[dayIdx] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
          </div>
        `).join('');

        const blockCards = (state.mesocycle || []).map((b, idx) => {
          const isActive = idx === state.activeBlockIdx;
          return `
            <div class="p-3 rounded-2xl border transition ${isActive ? 'bg-blue-950/40 border-blue-600 ring-1 ring-blue-500 shadow-accent' : 'bg-card-sub border-sub'} space-y-2 font-mono">
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                  <span class="w-5 h-5 rounded-full bg-input border border-sub flex items-center justify-center text-[10px] text-slate-400 font-bold">${idx + 1}</span>
                  <span class="text-xs font-bold ${isActive ? 'text-blue-300' : 'text-white'}">${b.phase}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <button type="button" onclick="appActions.moveMacroBlock(${idx}, -1)" class="w-6 h-6 rounded-lg bg-input border border-sub text-xs text-slate-300 flex items-center justify-center tactile">↑</button>
                  <button type="button" onclick="appActions.moveMacroBlock(${idx}, 1)" class="w-6 h-6 rounded-lg bg-input border border-sub text-xs text-slate-300 flex items-center justify-center tactile">↓</button>
                  <button type="button" onclick="appActions.deleteMacroBlock(${idx})" class="w-6 h-6 rounded-lg bg-input border border-sub text-xs text-slate-400 hover:text-red-400 flex items-center justify-center tactile">✕</button>
                </div>
              </div>
             <div class="flex justify-between items-center text-[11px] flex-wrap gap-2">
                  <div class="flex items-center space-x-1.5">
                    <span class="text-slate-400">Weeks:</span>
                    <button type="button" onclick="appActions.adjustBlockWeeks(${idx}, -1)" class="w-6 h-6 bg-input hover:bg-slate-800 border border-sub rounded flex items-center justify-center text-slate-300 hover:text-white font-bold tactile" title="Shorten by 1 week">−</button>
                    <input type="number" id="blockWeeksInput_${idx}" min="1" max="16" value="${b.weeks}" onchange="appActions.setBlockWeeksExact(${idx}, this.value)" class="w-10 h-6 bg-input border border-sub rounded text-center text-white font-bold text-[11px] focus:outline-none focus:border-accent" />
                    <button type="button" onclick="appActions.adjustBlockWeeks(${idx}, 1)" class="w-6 h-6 bg-input hover:bg-slate-800 border border-sub rounded flex items-center justify-center text-accent hover:text-white font-bold tactile" title="Extend by 1 week">+</button>
                    <button type="button" id="saveBlockBtn_${idx}" onclick="appActions.saveBlockDuration(${idx})" class="px-2 py-1 bg-accent text-black font-bold rounded text-[9px] uppercase tracking-wider tactile">Save</button>
                  </div>
                  ${isActive ? `<span class="text-[9px] px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold uppercase tracking-wider">Active</span>` : `<button type="button" onclick="appActions.setActiveMacroBlock(${idx})" class="text-[9px] px-2 py-0.5 rounded-md bg-blue-950/60 text-blue-300 border border-blue-800 hover:bg-blue-900 tactile">Set Active</button>`}
                </div>
              <!-- Per-Block Progression Mode Toggle -->
              <div class="flex items-center justify-between pt-2 border-t border-sub/50 text-[10px] font-mono">
                <span class="text-slate-400">Progression:</span>
                <div class="flex items-center space-x-1 bg-input p-0.5 rounded-lg border border-sub">
                  <button type="button" 
                    onclick="appActions.setBlockProgressionMode(${idx}, 'intensity')" 
                    class="px-2 py-0.5 rounded text-[9px] font-bold transition tactile ${(!b.progressionMode || b.progressionMode === 'intensity') ? 'bg-accent text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
                    ⚡ Intensity (Wave)
                  </button>
                  <button type="button" 
                    onclick="appActions.setBlockProgressionMode(${idx}, 'load')" 
                    class="px-2 py-0.5 rounded text-[9px] font-bold transition tactile ${(b.progressionMode === 'load') ? 'bg-accent text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
                    📈 Load (Static)
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');

        const curWeeks = currentRealTimePos.block.weeks || 3;

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono w-full">
              <span class="flex items-center gap-1.5">
  <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 10 5-10 5-10-5Z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/></svg>
  Training Blocks</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <!-- On-Demand Block Transition Wizard Button -->
            <div class="p-3.5 bg-gradient-to-r from-blue-950/80 to-indigo-950/80 rounded-2xl border border-blue-600/60 flex justify-between items-center text-xs font-mono shadow-xl">
              <div>
                <span class="text-[10px] text-accent font-bold uppercase">End-of-Block Review</span>
                <div class="text-[9px] text-slate-300 mt-0.5">Analyze completed block volume, e1RM adaptation, and localized fatigue.</div>
              </div>
              <button type="button" onclick="appActions.openBlockWizard()" class="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tactile shadow-lg">
                🧙 Block Review & Transition &rarr;
              </button>
            </div>

            <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2.5 font-mono text-xs shadow-md">
              <div class="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <span class="text-[10px] text-accent font-bold uppercase">Active Block & Week Control</span>
                  <div class="text-[9px] text-slate-400">Advance weeks or transition blocks manually as your schedule adapts</div>
                </div>
                <div class="bg-input px-3 py-1.5 rounded-xl border border-sub text-center shrink-0">
                  <div class="text-[8px] text-slate-400 uppercase">Active State</div>
                  <div class="text-xs font-black text-accent">Block ${(state.activeBlockIdx || 0) + 1}: ${currentRealTimePos.phase} • Week ${state.activeWeek} of ${curWeeks}</div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2 pt-1">
                <button type="button" onclick="appActions.stepMesocycleWeek(-1)" class="py-2 px-2.5 bg-input hover:bg-slate-800 border border-sub rounded-xl text-[10px] font-bold text-slate-200 tactile">
                  ◀ Prev Week
                </button>
                <button type="button" onclick="appActions.stepMesocycleWeek(1)" class="py-2 px-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold shadow tactile">
                  Next Week ▶
                </button>
                <button type="button" onclick="appActions.openBlockWizard()" class="py-2 px-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/60 text-emerald-300 rounded-xl text-[10px] font-bold tactile">
                  Complete Block →
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-xs w-full">
              <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2">
                <div class="text-[10px] text-accent font-bold uppercase border-b border-sub/50 pb-1">Weekday Split Assignments</div>
                <div class="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">${splitMatrixHtml}</div>
              </div>

              <div class="space-y-3">
                <div class="p-3 bg-card-sub rounded-2xl border border-sub space-y-2">
                  <div class="flex justify-between text-[10px] text-accent font-bold uppercase">
                    <span>Active Block: Week ${state.activeWeek} of ${curWeeks}</span>
                  </div>
                  <div class="flex gap-1.5 pt-0.5">
                    ${Array.from({ length: curWeeks }, (_, i) => i + 1).map(w => `
                      <button type="button" onclick="appActions.setActiveWeek(${w})" class="flex-1 py-1 rounded-xl text-center font-bold text-xs transition tactile ${state.activeWeek === w ? 'bg-blue-600 text-white shadow-lg' : 'bg-input text-slate-400 border border-sub'}">
                        W${w}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div class="space-y-2 max-h-44 overflow-y-auto pr-1">${blockCards}</div>

                <div class="p-3 bg-card-sub rounded-2xl border border-sub space-y-2">
                  <div class="text-[10px] text-accent font-bold uppercase">+ Add Phase</div>
                  <div class="grid grid-cols-12 gap-1.5">
                    <select onchange="state.newBlockPhase = this.value" class="col-span-6 bg-input border border-sub rounded-xl p-1.5 text-white text-xs focus:outline-none">
                      ${availablePhases.map(p => `<option value="${p}" ${state.newBlockPhase === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                    <select onchange="state.newBlockWeeks = Number(this.value)" class="col-span-4 bg-input border border-sub rounded-xl p-1.5 text-white text-xs focus:outline-none">
                      ${[1, 2, 3, 4, 5, 6].map(w => `<option value="${w}" ${state.newBlockWeeks === w ? 'selected' : ''}>${w} Wks</option>`).join('')}
                    </select>
                    <button type="button" onclick="appActions.addMacroBlock()" class="col-span-2 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center tactile">+</button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        `;
      }

      // 8. MOVEMENT & MODIFIER REGISTRY SCREEN
      else if (state.screen === 'resources') {
        const catKeys = Object.keys(state.exercises || {});
        const activeTab = state.resTab;

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3.5 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono w-full">
              <span class="flex items-center gap-1.5">
  <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
  Exercise Catalog</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <div class="grid grid-cols-3 gap-1.5 p-1 bg-input rounded-2xl border border-sub font-mono text-xs w-full">
            <button type="button" onclick="appActions.setResTab('exercises')" class="py-2 rounded-xl font-bold transition tactile ${activeTab === 'exercises' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}">Movements (${catKeys.length})</button>
            <button type="button" onclick="appActions.setResTab('modifiers')" class="py-2 rounded-xl font-bold transition tactile ${activeTab === 'modifiers' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}">Modifiers (${(state.modifierCats || []).length})</button>
            <button type="button" onclick="appActions.setResTab('equipment')" class="py-2 rounded-xl font-bold transition tactile ${activeTab === 'equipment' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}">⚙️ Gym Inventory</button>
          </div>

            ${activeTab === 'exercises' ? `
              <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2.5 text-xs font-mono shadow-sm w-full">
                <div class="text-[10px] text-accent font-bold uppercase">Add Movement with Tracking Schema</div>
                <div class="grid grid-cols-12 gap-1.5">
                  <select onchange="state.newExCat = this.value" class="col-span-5 bg-input border border-sub rounded-xl p-2 text-white text-xs focus:outline-none">
                    ${catKeys.map(c => `<option value="${c}" ${state.newExCat === c ? 'selected' : ''}>${c}</option>`).join('')}
                  </select>
                  <input type="text" placeholder="Movement name..." value="${state.newExName || ''}" oninput="state.newExName = this.value" class="col-span-5 bg-input border border-sub rounded-xl p-2 text-white text-xs focus:outline-none">
                  <button type="button" onclick="appActions.addCustomExercise()" class="col-span-2 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center tactile shadow">+</button>
                </div>
                <div class="flex items-center justify-between pt-1 border-t border-sub/50 text-[10px] text-slate-300">
                  <span class="text-slate-400">Schema Fields:</span>
                  <label class="flex items-center space-x-1 cursor-pointer"><input type="checkbox" ${state.newExMeta.w ? 'checked' : ''} onchange="appActions.toggleNewExMeta('w')"><span>Weight</span></label>
                  <label class="flex items-center space-x-1 cursor-pointer"><input type="checkbox" ${state.newExMeta.r ? 'checked' : ''} onchange="appActions.toggleNewExMeta('r')"><span>Reps</span></label>
                  <label class="flex items-center space-x-1 cursor-pointer"><input type="checkbox" ${state.newExMeta.t ? 'checked' : ''} onchange="appActions.toggleNewExMeta('t')"><span>Time</span></label>
                  <label class="flex items-center space-x-1 cursor-pointer"><input type="checkbox" ${state.newExMeta.rpe ? 'checked' : ''} onchange="appActions.toggleNewExMeta('rpe')"><span>RPE</span></label>
                </div>
              </div>

              <div class="space-y-2.5 w-full pb-4">
                ${catKeys.map(cat => `
                  <div class="p-3 bg-card-sub rounded-2xl border border-sub space-y-2">
                    <div class="text-[10px] font-mono font-bold uppercase text-slate-400 border-b border-sub/60 pb-1 flex justify-between">
                      <span>${cat}</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-0.5">
                      ${(state.exercises[cat] || []).map(ex => {
                        const overrides = state.exerciseRepOverrides?.[ex] || {};
                        const overrideKeys = Object.keys(overrides);
                        const isExpanded = state.activeRepOverrideEx === ex;

                        const badgesHtml = overrideKeys.map(k => {
                          const ov = normalizeRepBookends(overrides[k], 8, 12);
                          const str = (ov.min === ov.max) ? `${ov.min}r` : `${ov.min}-${ov.max}r`;
                          return `
                            <span class="inline-flex items-center space-x-1 bg-card-sub border border-blue-800/80 px-1.5 py-0.2 rounded text-[8px] text-accent font-bold">
                              <span>${k}: ${str}</span>
                              <button type="button" onclick="event.stopPropagation(); appActions.deleteExerciseRepOverride('${ex}', '${k}')" class="text-slate-500 hover:text-red-400 ml-0.5">×</button>
                            </span>
                          `;
                        }).join('');

                        return `
                          <div class="bg-input border border-sub p-2.5 rounded-xl space-y-1.5 text-[11px] font-mono">
                            <div class="flex items-center justify-between">
                              <span class="text-slate-200 font-bold truncate max-w-[170px]">${ex}</span>
                              <div class="flex items-center space-x-1">
                                <button type="button" onclick="appActions.toggleExRepOverride('${ex}')" class="px-2 py-0.5 rounded-lg border text-[10px] font-bold tactile ${isExpanded ? 'bg-blue-600 text-white border-blue-500' : 'bg-card-sub text-slate-300 border-sub hover:text-white'}">
                                  🎯 Reps
                                </button>
                                <button type="button" onclick="appActions.deleteExercise('${cat}', '${ex}')" class="text-slate-500 hover:text-red-400 text-xs px-1 font-bold tactile">×</button>
                              </div>
                            </div>

                            ${overrideKeys.length ? `
                              <div class="flex flex-wrap gap-1 items-center pt-0.5">
                                <span class="text-[8px] text-slate-500 uppercase font-bold">Overrides:</span>
                                ${badgesHtml}
                              </div>
                            ` : ''}

                            ${isExpanded ? `
                              <div class="mt-2 pt-2 border-t border-sub/60 space-y-2 bg-card-sub/90 p-2 rounded-xl border border-blue-900/50">
                                <div class="text-[9px] text-accent font-bold uppercase">Assign Custom Low-High Rep Bookends</div>
                                <div class="grid grid-cols-12 gap-1.5 items-center">
                                  <select onchange="state.overrideDraft.phase = this.value" class="col-span-5 bg-input border border-sub rounded-lg p-1.5 text-white text-[10px] focus:outline-none font-bold">
                                    <option value="All" ${state.overrideDraft.phase === 'All' ? 'selected' : ''}>All Phases / Locked</option>
                                    ${availablePhases.map(ph => `<option value="${ph}" ${state.overrideDraft.phase === ph ? 'selected' : ''}>${ph}</option>`).join('')}
                                  </select>
                                  <div class="col-span-4 flex items-center space-x-1">
                                    <input type="number" min="1" max="30" placeholder="Min" value="${state.overrideDraft.minReps || 8}" oninput="state.overrideDraft.minReps = this.value" class="w-1/2 bg-input border border-sub rounded-lg p-1 text-center text-white text-[10px] focus:outline-none font-bold">
                                    <span class="text-slate-400">-</span>
                                    <input type="number" min="1" max="30" placeholder="Max" value="${state.overrideDraft.maxReps || 12}" oninput="state.overrideDraft.maxReps = this.value" class="w-1/2 bg-input border border-sub rounded-lg p-1 text-center text-white text-[10px] focus:outline-none font-bold">
                                  </div>
                                  <button type="button" onclick="appActions.setExerciseRepOverride('${ex}', state.overrideDraft.phase, state.overrideDraft.minReps, state.overrideDraft.maxReps); state.overrideDraft = { phase: 'All', minReps: 8, maxReps: 12 };" class="col-span-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold tactile shadow">
                                    Save
                                  </button>
                                </div>
                              </div>
                            ` : ''}
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : activeTab === 'modifiers' ? `
              <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2.5 text-xs font-mono shadow-sm w-full">
                <div class="text-[10px] text-accent font-bold uppercase">Add New Modifier Tag</div>
                <div class="grid grid-cols-12 gap-1.5">
                  <select onchange="state.newModCat = this.value" class="col-span-5 bg-input border border-sub rounded-xl p-2 text-white text-xs focus:outline-none">
                    ${(state.modifierCats || []).map(c => `<option value="${c.name}" ${state.newModCat === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                  </select>
                  <input type="text" placeholder="Tag name (e.g. 2ct Pause)..." value="${state.newModName || ''}" oninput="state.newModName = this.value" class="col-span-5 bg-input border border-sub rounded-xl p-2 text-white text-xs focus:outline-none">
                  <button type="button" onclick="appActions.addCustomModifier()" class="col-span-2 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center tactile shadow">+</button>
                </div>
              </div>

              <div class="space-y-2.5 w-full pb-4">
                ${(state.modifierCats || []).map(cat => `
                  <div class="p-3 bg-card-sub rounded-2xl border border-sub space-y-2">
                    <div class="text-[10px] font-mono font-bold uppercase text-slate-400 border-b border-sub/60 pb-1 flex justify-between">
                      <span>${cat.name}</span>
                      <span class="text-slate-500 text-[9px]">${cat.opts.length} tags</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5 pt-0.5">
                      ${cat.opts.map(opt => `
                        <span class="text-[10px] font-mono bg-input border border-sub px-2.5 py-1 rounded-xl text-slate-200 flex items-center space-x-1.5">
                          <span>${opt}</span>
                          <button type="button" onclick="appActions.deleteModifier('${cat.name}', '${opt}')" class="text-slate-500 hover:text-red-400 text-xs font-bold tactile">×</button>
                        </span>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
        
            ${activeTab === 'equipment' ? (() => {
              const eq = window.apexCore.getEquipmentConfig();
              return `
                <div class="space-y-3 font-mono text-xs pb-6">
                  <!-- 1. Dumbbell & Cable Pulley Constraints -->
                  <div class="p-4 bg-card-sub rounded-3xl border border-sub space-y-3 shadow-md">
                    <div>
                      <span class="text-[10px] text-accent font-bold uppercase">Dumbbell & Cable Pulley Constraints</span>
                      <div class="text-[9px] text-slate-400">Drives automatic per-hand load caps, unilateral handle swaps, and 2:1 pin math</div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      <div class="bg-input p-3 rounded-2xl border border-sub space-y-1">
                        <label class="text-[9px] text-slate-400 font-bold uppercase">Paired DB Max (Per Hand)</label>
                        <div class="flex items-center space-x-1.5">
                          <input type="number" step="5" min="5" max="200" value="${eq.dumbbells?.pairedMax ?? 90}" onchange="appActions.updateEquipmentSetting('dumbbells', 'pairedMax', this.value)" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-center text-white font-bold text-xs">
                          <span class="text-slate-400 text-[10px]">lbs</span>
                        </div>
                        <div class="text-[8.5px] text-slate-500">Bilateral presses, flyes & curls</div>
                      </div>

                      <div class="bg-input p-3 rounded-2xl border border-sub space-y-1">
                        <label class="text-[9px] text-slate-400 font-bold uppercase">Heavy Row Handle Max</label>
                        <div class="flex items-center space-x-1.5">
                          <input type="number" step="5" min="25" max="300" value="${eq.dumbbells?.singleHandleMax ?? 185}" onchange="appActions.updateEquipmentSetting('dumbbells', 'singleHandleMax', this.value)" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-center text-accent font-bold text-xs">
                          <span class="text-slate-400 text-[10px]">lbs</span>
                        </div>
                        <div class="text-[8.5px] text-slate-500">Auto-used on DB Rows, Shrugs & 1-Arm</div>
                      </div>

                      <div class="bg-input p-3 rounded-2xl border border-sub space-y-1">
                        <label class="text-[9px] text-slate-400 font-bold uppercase">Row Handle Empty Tare</label>
                        <div class="flex items-center space-x-1.5">
                          <input type="number" step="2.5" min="0" max="25" value="${eq.dumbbells?.singleHandleTare ?? 5}" onchange="appActions.updateEquipmentSetting('dumbbells', 'singleHandleTare', this.value)" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-center text-white font-bold text-xs">
                          <span class="text-slate-400 text-[10px]">lbs</span>
                        </div>
                        <div class="text-[8.5px] text-slate-500">Empty handle + collars for plate math</div>
                      </div>

                      <div class="bg-input p-3 rounded-2xl border border-sub space-y-1">
                        <label class="text-[9px] text-slate-400 font-bold uppercase">Cable Pulley Ratio</label>
                        <select onchange="appActions.updateEquipmentSetting('cable', 'ratio', this.value)" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-white font-bold text-xs">
                          <option value="0.5" ${Number(eq.cable?.ratio) === 0.5 ? 'selected' : ''}>2:1 Ratio (50% Felt Load)</option>
                          <option value="1" ${Number(eq.cable?.ratio) === 1.0 ? 'selected' : ''}>1:1 Ratio (True Weight)</option>
                        </select>
                        <div class="text-[8.5px] text-slate-500">Calculates physical pin weight</div>
                      </div>
                    </div>
                  </div>



                  <!-- 3. Specialty Bar Tare Weights -->
                  <div class="p-4 bg-card-sub rounded-3xl border border-sub space-y-3 shadow-md">
                    <div>
                      <span class="text-[10px] text-accent font-bold uppercase">Barbell & Specialty Bar Tare Weights</span>
                      <div class="text-[9px] text-slate-400">Automatically subtracted before calculating plates per sleeve</div>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      ${Object.entries(eq.bars || {}).map(([barName, bWeight]) => `
                        <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1 text-center">
                          <div class="text-[9.5px] font-bold text-slate-200 truncate">${barName}</div>
                          <div class="flex items-center justify-center space-x-1">
                            <input type="number" step="2.5" value="${bWeight}" onchange="appActions.updateBarWeight('${barName}', this.value)" class="w-16 bg-card-sub border border-sub rounded-lg py-1 text-center text-accent font-bold text-xs">
                            <span class="text-[9px] text-slate-400">lb</span>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              `;
            })() : ''}
          </main>
        `;
      }

      // 9. PROFILE SCREEN
      else if (state.screen === 'profile') {
        const skills = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
        const skillDesc = {
          'Beginner': 'Linear progression (+2.5-5 lbs/wk), lower volume (2-3 sets), 2-3 RIR buffer.',
          'Intermediate': 'Wave periodization, progressive overload, 3-4 working sets, 1.5-2 RIR buffer.',
          'Advanced': 'High density & volume modulation, tight autoregulation, small progression steps.',
          'Elite': 'Undulating (DUP) intensity waves, cluster/myo autoregulation, reactive deloads.'
        };

        const curLifter = state.profile?.lifterType || 'Natural';

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono w-full">
              <span class="flex items-center gap-1.5">
  <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
  Profile</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <div class="bg-card-sub p-4 rounded-2xl border border-sub space-y-2.5 text-xs font-mono shadow-md w-full">
              <div class="text-[10px] text-accent font-bold uppercase">Basic Athlete Metrics</div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[9px] text-slate-400 uppercase">Age</label>
                  <input type="number" value="${state.profile?.age || 40}" onchange="appActions.updateProfile('age', this.value)" class="w-full bg-input border border-sub rounded-xl p-2 text-white font-mono focus:outline-none mt-0.5">
                </div>
                <div>
                  <label class="text-[9px] text-slate-400 uppercase">Bodyweight (lbs)</label>
                  <input type="number" step="0.1" value="${state.profile?.bodyweight || 196.2}" onchange="appActions.updateProfile('bodyweight', this.value)" class="w-full bg-input border border-sub rounded-xl p-2 text-white font-mono focus:outline-none mt-0.5">
                </div>
              </div>
            </div>

            <div class="bg-card-sub p-4 rounded-2xl border border-sub space-y-2.5 text-xs font-mono shadow-md w-full">
              <div class="text-[10px] text-accent font-bold uppercase">Physiology & Recovery Profile</div>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" onclick="appActions.updateProfile('lifterType', 'Natural')" class="py-2.5 px-2 rounded-xl text-center font-bold text-xs transition tactile ${curLifter === 'Natural' ? 'bg-blue-600 text-white shadow-lg' : 'bg-input text-slate-400 border border-sub hover:text-white'}">
                  Natural Lifter
                </button>
                <button type="button" onclick="appActions.updateProfile('lifterType', 'Enhanced')" class="py-2.5 px-2 rounded-xl text-center font-bold text-xs transition tactile ${curLifter === 'Enhanced' ? 'bg-blue-600 text-white shadow-lg' : 'bg-input text-slate-400 border border-sub hover:text-white'}">
                  Enhanced Lifter
                </button>
              </div>
              <div class="p-3 bg-input rounded-xl border border-sub text-[11px] text-slate-300 mt-2 leading-relaxed">
                <span class="font-bold text-accent">Volume Baseline:</span> ${curLifter === 'Natural' ? 'MEV: 2-3 sets, MAV: 3-4 sets, tighter MRV ceilings with autoregulated deloads.' : 'Higher recovery capacity (MAV: 4-5 sets, MRV: 5+ sets) with aggressive weekly volume progression.'}
              </div>
            </div>

            <div class="bg-card-sub p-4 rounded-2xl border border-sub space-y-2.5 text-xs font-mono shadow-md w-full">
              <div class="text-[10px] text-accent font-bold uppercase">Experience Tier</div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                ${skills.map(sk => `
                  <button type="button" onclick="appActions.updateProfile('skillLevel', '${sk}')" class="py-2.5 px-2 rounded-xl text-center font-bold text-xs transition tactile ${state.profile?.skillLevel === sk ? 'bg-blue-600 text-white shadow-lg' : 'bg-input text-slate-400 border border-sub hover:text-white'}">
                    ${sk}
                  </button>
                `).join('')}
              </div>
              <div class="p-3 bg-input rounded-xl border border-sub text-[11px] text-slate-300 mt-2 leading-relaxed">
                <span class="font-bold text-accent">Target Rule:</span> ${skillDesc[state.profile?.skillLevel || 'Advanced']}
              </div>
            </div>
          </main>
        `;
      }

      // 10. SETTINGS SCREEN
      else if (state.screen === 'settings') {
        const curTheme = state.settings?.theme || 'Midnight';
        const curFont = state.settings?.fontFamily || 'JetBrains Mono';
        const curScale = state.settings?.uiScale || 'm';
        const curBlending = state.settings?.e1rmBlending || 'moderate';

        const matrix = state.phaseRepMatrix || defaultPhaseRepMatrix;

        const phaseMatrixRows = availablePhases.map(ph => {
          const mNorm = normalizeRepBookends(matrix[ph]?.Main, defaultPhaseRepMatrix[ph]?.Main?.min || 4, defaultPhaseRepMatrix[ph]?.Main?.max || 6);
          const sNorm = normalizeRepBookends(matrix[ph]?.Secondary, defaultPhaseRepMatrix[ph]?.Secondary?.min || 6, defaultPhaseRepMatrix[ph]?.Secondary?.max || 8);
          const aNorm = normalizeRepBookends(matrix[ph]?.Assistance, defaultPhaseRepMatrix[ph]?.Assistance?.min || 10, defaultPhaseRepMatrix[ph]?.Assistance?.max || 15);

          return `
            <tr class="border-b border-sub/40 hover:bg-card-sub/50">
              <td class="py-2 px-1 text-slate-200 font-bold truncate max-w-[120px]">${ph}</td>
              <td class="py-1 px-1 text-center">
                <div class="flex items-center justify-center space-x-1">
                  <input type="number" min="1" max="30" value="${mNorm.min}" onchange="appActions.updatePhaseRepMatrix('${ph}', 'Main', 'min', this.value)" class="w-8 bg-input border border-sub rounded-lg py-1 text-center text-white font-bold text-xs focus:outline-none">
                  <span class="text-slate-500">-</span>
                  <input type="number" min="1" max="30" value="${mNorm.max}" onchange="appActions.updatePhaseRepMatrix('${ph}', 'Main', 'max', this.value)" class="w-8 bg-input border border-sub rounded-lg py-1 text-center text-white font-bold text-xs focus:outline-none">
                </div>
              </td>
              <td class="py-1 px-1 text-center">
                <div class="flex items-center justify-center space-x-1">
                  <input type="number" min="1" max="30" value="${sNorm.min}" onchange="appActions.updatePhaseRepMatrix('${ph}', 'Secondary', 'min', this.value)" class="w-8 bg-input border border-sub rounded-lg py-1 text-center text-white font-bold text-xs focus:outline-none">
                  <span class="text-slate-500">-</span>
                  <input type="number" min="1" max="30" value="${sNorm.max}" onchange="appActions.updatePhaseRepMatrix('${ph}', 'Secondary', 'max', this.value)" class="w-8 bg-input border border-sub rounded-lg py-1 text-center text-white font-bold text-xs focus:outline-none">
                </div>
              </td>
              <td class="py-1 px-1 text-center">
                <div class="flex items-center justify-center space-x-1">
                  <input type="number" min="1" max="30" value="${aNorm.min}" onchange="appActions.updatePhaseRepMatrix('${ph}', 'Assistance', 'min', this.value)" class="w-8 bg-input border border-sub rounded-lg py-1 text-center text-white font-bold text-xs focus:outline-none">
                  <span class="text-slate-500">-</span>
                  <input type="number" min="1" max="30" value="${aNorm.max}" onchange="appActions.updatePhaseRepMatrix('${ph}', 'Assistance', 'max', this.value)" class="w-8 bg-input border border-sub rounded-lg py-1 text-center text-white font-bold text-xs focus:outline-none">
                </div>
              </td>
            </tr>
          `;
        }).join('');

        const e1rmInputs = Object.keys(state.e1rms || {}).map(k => `
          <div class="bg-input p-2 rounded-xl border border-sub flex justify-between items-center text-xs">
            <div>
              <div class="text-slate-300 truncate max-w-[170px] font-mono text-[11px] font-bold">${k}</div>
              <div class="text-[9px] text-slate-500">Anchor: ${state.anchorE1rms?.[k] || state.e1rms[k]}lbs • Best: ${state.e1rms[k]}lbs</div>
            </div>
            <input type="number" value="${state.anchorE1rms?.[k] || state.e1rms[k]}" onchange="appActions.updateE1rm('${k}', this.value)" class="w-16 bg-card-sub border border-sub rounded-lg text-right px-2 py-0.5 text-accent font-bold focus:outline-none font-mono text-xs">
          </div>
        `).join('');

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3.5 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center text-xs font-bold border-b border-sub pb-2 text-slate-200 font-mono w-full">
              <span class="flex items-center gap-1.5">
  <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  Settings</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white">✕</button>
            </div>

            ${renderApexCoachSettingsCard()}

            <!-- Global Phase Rep Matrix Table -->
            <div class="p-4 bg-card-sub rounded-3xl border border-sub space-y-3 shadow-md font-mono text-xs w-full">
              <div class="flex justify-between items-center border-b border-sub pb-2">
                <div>
                  <span class="text-[10px] text-accent font-bold uppercase">Phase Target Rep Ranges</span>
                  <div class="text-[9px] text-slate-400">Default rep targets assigned automatically by training phase and movement tier</div>
                </div>
                <button type="button" onclick="appActions.resetPhaseRepMatrix()" class="px-2.5 py-1 bg-input border border-sub rounded-xl text-[10px] text-slate-300 hover:text-white font-bold tactile">
                  ↺ Reset Defaults
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="text-[9px] text-slate-400 uppercase border-b border-sub">
                      <th class="py-1 px-1">Phase</th>
                      <th class="py-1 px-1 text-center">Main (T1)</th>
                      <th class="py-1 px-1 text-center">Secondary (T2)</th>
                      <th class="py-1 px-1 text-center">Assistance (T3)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${phaseMatrixRows}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- e1RM Blending Sensitivity Model -->
            <div class="p-4 bg-card-sub rounded-3xl border border-sub space-y-2.5 shadow-md font-mono text-xs w-full">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-[10px] text-accent font-bold uppercase">Strength Anchor Calibration</span>
                  <div class="text-[9px] text-slate-400">Adjusts how strongly recent top sets update your working 1RM baseline</div>
                </div>
                <button type="button" onclick="appActions.reconcileGroundingE1rms()" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold tactile shadow">
                  ⚡ Re-blend Anchors Now
                </button>
              </div>
              <div class="grid grid-cols-3 gap-2 pt-1">
                <button type="button" onclick="appActions.setE1rmBlending('conservative')" class="py-2 px-1 rounded-xl text-center font-bold text-[10px] border transition tactile ${curBlending === 'conservative' ? 'bg-blue-600 text-white border-blue-400 shadow-md' : 'bg-input text-slate-400 border-sub'}">
                  <div>Conservative</div>
                  <div class="text-[8px] opacity-80 mt-0.5">20% New / 80% Prior</div>
                </button>
                <button type="button" onclick="appActions.setE1rmBlending('moderate')" class="py-2 px-1 rounded-xl text-center font-bold text-[10px] border transition tactile ${curBlending === 'moderate' ? 'bg-blue-600 text-white border-blue-400 shadow-md' : 'bg-input text-slate-400 border-sub'}">
                  <div>Moderate</div>
                  <div class="text-[8px] opacity-80 mt-0.5">40% New / 60% Prior</div>
                </button>
                <button type="button" onclick="appActions.setE1rmBlending('aggressive')" class="py-2 px-1 rounded-xl text-center font-bold text-[10px] border transition tactile ${curBlending === 'aggressive' ? 'bg-blue-600 text-white border-blue-400 shadow-md' : 'bg-input text-slate-400 border-sub'}">
                  <div>Aggressive</div>
                  <div class="text-[8px] opacity-80 mt-0.5">60% New / 40% Prior</div>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start font-mono text-xs w-full">
              <div class="space-y-3">
                <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2 shadow-md">
                  <div class="text-[10px] text-accent font-bold uppercase">Base Surface Canvas Theme</div>
                  <div class="grid grid-cols-4 gap-1.5">
                    ${availableThemes.map(th => `
                      <button type="button" onclick="appActions.setTheme('${th}')" class="py-2 rounded-xl text-center font-bold text-[10px] transition tactile ${curTheme === th ? 'bg-blue-600 text-white shadow-lg' : 'bg-input text-slate-400 border border-sub hover:text-white'}">
                        ${th}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2 shadow-md">
                  <div class="text-[10px] text-accent font-bold uppercase">Typography Style</div>
                  <div class="grid grid-cols-3 gap-1.5">
                    ${availableFonts.map(fn => `
                      <button type="button" onclick="appActions.setFontFamily('${fn}')" class="py-2 rounded-xl text-center font-bold text-[10px] transition tactile ${curFont === fn ? 'bg-blue-600 text-white shadow-lg' : 'bg-input text-slate-400 border border-sub hover:text-white'}">
                        ${fn}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2 shadow-md">
                  <div class="text-[10px] text-accent font-bold uppercase">Global UI & Font Scaling</div>
                  <div class="grid grid-cols-4 gap-1.5">
                    ${['xs', 's', 'm', 'l'].map(sc => `
                      <button type="button" onclick="appActions.setUiScale('${sc}')" class="py-2 rounded-xl text-center font-bold text-[10px] uppercase transition tactile ${curScale === sc ? 'bg-blue-600 text-white shadow-lg' : 'bg-input text-slate-400 border border-sub hover:text-white'}">
                        ${sc}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2 shadow-md">
                <div class="text-[10px] text-accent font-bold uppercase">Visual Style</div>
                <select onchange="appActions.setUiStyle(this.value)" class="w-full bg-input border border-sub rounded-xl p-2 text-xs font-mono text-white focus:outline-none">
                  <option value="glass" ${state.settings?.uiStyle === 'glass' ? 'selected' : ''}>Acrylic Glass (Depth & Blur)</option>
                  <option value="tactical" ${state.settings?.uiStyle === 'tactical' ? 'selected' : ''}>Tactical Matte (Crisp / Contrast)</option>
                  <option value="minimal" ${state.settings?.uiStyle === 'minimal' ? 'selected' : ''}>Neo-Onyx (Flush / Minimal)</option>
                </select>
              </div>

                <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2 shadow-md">
                  <div class="flex justify-between items-center text-[10px] text-accent font-bold uppercase">
                    <span>Custom Accent Glow Color</span>
                    <span class="text-slate-400 font-mono">${state.settings?.customAccent || '#38bdf8'}</span>
                  </div>
                  <div class="flex items-center space-x-3 pt-1">
                    <input type="color" value="${state.settings?.customAccent || '#38bdf8'}" onchange="appActions.setCustomAccent(this.value)" class="w-10 h-10 rounded-xl bg-input border border-sub cursor-pointer">
                    <div class="text-[10px] text-slate-400 leading-tight">Applied to badges, accents, and graphs.</div>
                  </div>
                </div>

                <!-- Complete Data Management Engine -->
                <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2 shadow-md">
                  <div class="text-[10px] text-accent font-bold uppercase">Data & Protocol Backup</div>
                  <div class="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button type="button" onclick="appActions.exportBackup()" class="py-2 bg-input border border-sub hover:border-blue-500 rounded-xl text-slate-200 font-bold text-[10px] tactile">
                      ⬇ Export JSON
                    </button>
                    <label class="py-2 bg-input border border-sub hover:border-blue-500 rounded-xl text-slate-200 font-bold text-[10px] text-center cursor-pointer tactile">
                      ⬆ Restore JSON
                      <input type="file" accept=".json" onchange="appActions.importBackup(event)" class="hidden">
                    </label>
                  </div>
                  <button type="button" onclick="appActions.exportCsvSummary()" class="w-full py-2 bg-input border border-sub text-slate-300 hover:text-white rounded-xl font-bold text-[10px] tactile">
                    📊 Export Summary CSV
                  </button>
                  <div class="grid grid-cols-2 gap-1.5 pt-1 border-t border-sub/40">
                    <button type="button" onclick="appActions.exportProgrammingBuilderJson()" class="py-1.5 bg-input border border-sub hover:border-blue-500 rounded-xl text-slate-300 font-bold text-[9.5px] tactile">
                      ⬇ Export Protocols
                    </button>
                    <label class="py-1.5 bg-input border border-sub hover:border-blue-500 rounded-xl text-slate-300 font-bold text-[9.5px] text-center cursor-pointer tactile">
                      ⬆ Import Protocols
                      <input type="file" accept=".json" onchange="appActions.importProgrammingBuilderJson(event)" class="hidden">
                    </label>
                  </div>
                </div>

                <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2 shadow-md">
                  <div class="text-[10px] text-red-400 font-bold uppercase">Session Reset</div>
                  <p class="text-[10px] text-slate-400">Clear background workouts or stuck resume banners freezing the interface.</p>
                  <button type="button" onclick="appActions.forceClearActiveWorkout(event)" class="w-full py-2.5 bg-input hover:bg-red-950/60 text-red-400 border border-sub rounded-xl font-bold tactile">
                    Reset Active Workout
                  </button>
                </div>
              </div>

              <div class="space-y-3">
                <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2 shadow-md">
                  <div class="text-[10px] text-accent font-bold uppercase">Load Rounding Precision</div>
                  <div class="grid grid-cols-2 gap-1.5">
                    <button type="button" onclick="appActions.setSetting('rounding', 2.5)" class="py-2 rounded-xl font-bold tactile ${Number(state.settings.rounding) === 2.5 ? 'bg-blue-600 text-white shadow' : 'bg-input text-slate-400 border border-sub'}">2.5 lbs (Precision)</button>
                    <button type="button" onclick="appActions.setSetting('rounding', 5.0)" class="py-2 rounded-xl font-bold tactile ${Number(state.settings.rounding) === 5.0 ? 'bg-blue-600 text-white shadow' : 'bg-input text-slate-400 border border-sub'}">5.0 lbs (Standard)</button>
                  </div>
                </div>

                <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2 shadow-md">
                  <div class="text-[10px] text-accent font-bold uppercase">Weekly Overload Progression Model</div>
                  <div class="grid grid-cols-2 gap-1.5">
                    <button type="button" onclick="appActions.setSetting('progressionType', 'percent')" class="py-2 rounded-xl font-bold tactile ${state.settings.progressionType === 'percent' ? 'bg-blue-600 text-white shadow' : 'bg-input text-slate-400 border border-sub'}">% Intensity (+1.5%/wk)</button>
                    <button type="button" onclick="appActions.setSetting('progressionType', 'absolute')" class="py-2 rounded-xl font-bold tactile ${state.settings.progressionType === 'absolute' ? 'bg-blue-600 text-white shadow' : 'bg-input text-slate-400 border border-sub'}">Absolute Load (+5 lbs/wk)</button>
                  </div>
                </div>

                <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-1.5 shadow-md">
                  <div class="text-[10px] text-accent font-bold uppercase">Movement Anchors & Best (${Object.keys(state.e1rms || {}).length} Variants)</div>
                  <div class="max-h-56 overflow-y-auto space-y-1.5 pr-1">${e1rmInputs}</div>
                </div>
              </div>
            </div>

            <button type="button" onclick="appActions.saveSettings()" class="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-bold text-white transition tactile shadow-lg font-mono">
              Save System Settings & Sync &rarr;
            </button>
          </main>
        `;
      }

      // 11. SYSTEM CODEX SCREEN (Neutral Concepts & 1RM Math Breakdown)
      else if (state.screen === 'about') {
        const phasesList = availablePhases.map(ph => `
          <div class="bg-input p-3 rounded-2xl border border-sub space-y-1">
            <div class="text-xs font-bold text-white flex justify-between items-center">
              <span>${ph}</span>
              ${currentRealTimePos.phase === ph ? `<span class="text-[8px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-black">CURRENT</span>` : ''}
            </div>
            <p class="text-[10px] text-slate-400 leading-relaxed">${phaseDescriptions[ph] || 'Mesocycle training block'}</p>
          </div>
        `).join('');

        const hSchemesList = (hypertrophySchemes || []).map(s => `
          <div class="bg-input p-2.5 rounded-xl border border-sub space-y-1">
            <span class="text-xs font-bold text-accent">${s}</span>
            <p class="text-[10px] text-slate-400 leading-tight">${schemeDescriptions[s] || 'Autoregulated training prescription'}</p>
          </div>
        `).join('');

        const sSchemesList = (strengthSchemes || []).map(s => `
          <div class="bg-input p-2.5 rounded-xl border border-sub space-y-1">
            <span class="text-xs font-bold text-indigo-400">${s}</span>
            <p class="text-[10px] text-slate-400 leading-tight">${schemeDescriptions[s] || 'Autoregulated training prescription'}</p>
          </div>
        `).join('');

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3.5 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono w-full">
              <span class="flex items-center gap-1.5">
  <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
  System</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <div class="p-3.5 bg-card-sub rounded-3xl border border-sub space-y-2 font-mono text-xs shadow-md">
              <span class="text-[10px] text-accent font-bold uppercase">Technical Integrity Heuristic (80% Execution Rule)</span>
              <p class="text-[10px] text-slate-300 leading-relaxed">
                Rate perceived exertion based on the hardest positional deviation rather than mere bar completion. If lumbar flexion occurs, bar velocity abruptly stalls, or knees collapse inward, the repetition has reached technical failure. Grade sets based on technical integrity to safeguard connective tissue and preserve accurate e1RM metrics.
              </p>
            </div>

            <!-- 1RM Mathematical Prediction Models -->
            <div class="p-3.5 bg-card-sub rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-md">
              <span class="text-[10px] text-accent font-bold uppercase">1RM Prediction Mathematical Models</span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                <div class="bg-input p-3 rounded-2xl border border-sub space-y-1">
                  <div class="text-xs font-bold text-accent">APEX RPE Engine</div>
                  <div class="text-[9px] text-slate-300 font-mono">Formula: % = 100 - (Reps - 1 + RIR) &times; 2.15</div>
                  <p class="text-[10px] text-slate-400 leading-relaxed">
                    A multi-point autoregulated table correlating Reps In Reserve (10.0 - RPE) directly with neurological motor unit recruitment. Most accurate across all rep ranges.
                  </p>
                </div>
                <div class="bg-input p-3 rounded-2xl border border-sub space-y-1">
                  <div class="text-xs font-bold text-blue-400">Epley Formula (1985)</div>
                  <div class="text-[9px] text-slate-300 font-mono">Formula: 1RM = Weight &times; (1 + Reps / 30)</div>
                  <p class="text-[10px] text-slate-400 leading-relaxed">
                    The international competitive standard for powerlifting. Assumes a linear 3.33% strength drop per repetition; optimal between 1 and 10 reps.
                  </p>
                </div>
                <div class="bg-input p-3 rounded-2xl border border-sub space-y-1">
                  <div class="text-xs font-bold text-indigo-400">Brzycki Formula (1993)</div>
                  <div class="text-[9px] text-slate-300 font-mono">Formula: 1RM = Weight &times; (36 / (37 - Reps))</div>
                  <p class="text-[10px] text-slate-400 leading-relaxed">
                    Slightly more conservative than Epley on intermediate rep ranges. Highly reliable between 3 and 8 reps; caps asymptote at 36 reps.
                  </p>
                </div>
                <div class="bg-input p-3 rounded-2xl border border-sub space-y-1">
                  <div class="text-xs font-bold text-emerald-400">Wathan Formula (1994)</div>
                  <div class="text-[9px] text-slate-300 font-mono">Formula: 1RM = (100 &times; W) / (48.8 + 53.8 &times; e^(-0.075 &times; Reps))</div>
                  <p class="text-[10px] text-slate-400 leading-relaxed">
                    Exponential decay function preventing 1RM overestimation during high-repetition metabolic endurance efforts (>10 reps).
                  </p>
                </div>
                <div class="bg-input p-3 rounded-2xl border border-sub space-y-1 md:col-span-2">
                  <div class="text-xs font-bold style="color: var(--accent-primary)"">Lombardi Power Law (1989)</div>
                  <div class="text-[9px] text-slate-300 font-mono">Formula: 1RM = Weight &times; Reps^0.10</div>
                  <p class="text-[10px] text-slate-400 leading-relaxed">
                    Non-linear geometric power function. Provides a gentle decay curve that models fatigue resistance on high mechanical tension efforts.
                  </p>
                </div>
              </div>
            </div>

            <div class="p-3.5 bg-card-sub rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-md">
              <span class="text-[10px] text-accent font-bold uppercase">Tension Continuum & Rep Range Architecture</span>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                <div class="bg-input p-2.5 rounded-xl border border-sub space-y-1">
                  <div class="text-xs font-bold text-indigo-300">1 - 5 Reps (High Tension / Neural)</div>
                  <p class="text-[9px] text-slate-400 leading-tight">
                    &gt;85% 1RM. High-threshold motor unit recruitment and maximal rate coding. Pure strength and myofibrillar force development with minimal intra-set metabolic waste.
                  </p>
                </div>
                <div class="bg-input p-2.5 rounded-xl border border-sub space-y-1">
                  <div class="text-xs font-bold text-accent">6 - 12 Reps (Hypertrophic Optimal)</div>
                  <p class="text-[9px] text-slate-400 leading-tight">
                    70-82% 1RM. Optimal balance between mechanical tension, effective repetition volume, and manageable joint shear. High stimulus-to-fatigue ratio across compound lifts.
                  </p>
                </div>
                <div class="bg-input p-2.5 rounded-xl border border-sub space-y-1">
                  <div class="text-xs font-bold text-emerald-300">12 - 20+ Reps (Metabolic Accumulation)</div>
                  <p class="text-[9px] text-slate-400 leading-tight">
                    50-68% 1RM. Traps metabolic byproducts (lactate, H+), causing cellular swelling and sarcoplasmic expansion. Ideal for calves, arms, and trunk without axial fatigue.
                  </p>
                </div>
              </div>
            </div>

            <div class="p-3.5 bg-card-sub rounded-3xl border border-sub space-y-2 font-mono text-xs shadow-md">
              <span class="text-[10px] text-accent font-bold uppercase">Autoregulated Overload & Fatigue Stop Architecture</span>
              <ul class="text-[10px] text-slate-400 space-y-1 list-disc pl-4 pt-1">
                <li><b>Double Progression</b>: Work within phase rep range at a fixed load. Step up weight and reset reps when the ceiling is reached (supports independent per-set progression and back-off wave loading).</li>
                <li><b>Autoregulated Load Drops & RPE Stops</b>: Ramp to top intensity (e.g. 4@8.0 or 6@9.0). Calculate down sets as a strict percentage reduction (-5% to -14%) or repeat until RPE 9.0 is hit.</li>
                <li><b>Non-Specific GPP Work Capacity</b>: Dedicated 20-30 minute circuits (loaded carries, sled medleys, core, arms) 1-2 times weekly to promote systemic recovery and work capacity without competing with axial spinal recovery.</li>
              </ul>
            </div>

            <div class="p-3.5 bg-card-sub rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-md">
              <span class="text-[10px] text-accent font-bold uppercase">Mesocycle Periodization Blocks</span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">${phasesList}</div>
            </div>

            <div class="p-3.5 bg-card-sub rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-md">
              <span class="text-[10px] text-accent font-bold uppercase">Hypertrophy & Metabolic Density Schemes (${hypertrophySchemes.length})</span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">${hSchemesList}</div>
            </div>

            <div class="p-3.5 bg-card-sub rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-md">
              <span class="text-[10px] text-indigo-400 font-bold uppercase">Strength, Force & Neuromuscular Schemes (${strengthSchemes.length})</span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">${sSchemesList}</div>
            </div>
          </main>
        `;
      }

      // 12. PROGRAM LIBRARY SCREEN
      else if (state.screen === 'library') {
        const selectedProg = programPresets.find(p => p.id === state.selectedProgramId) || programPresets[0] || { splits: { 4: {} }, macro: [] };
        const availableDays = Object.keys(selectedProg.splits || {}).map(Number);
        const selectedDays = availableDays.includes(state.selectedProgramDays) ? state.selectedProgramDays : (availableDays[0] || 4);
        const assignedSplit = selectedProg.splits?.[selectedDays] || selectedProg.splits?.[availableDays[0]] || {};
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const scheduleCards = [1, 2, 3, 4, 5, 6, 0].map(dIdx => `
          <div class="bg-input p-2.5 rounded-xl border border-sub flex justify-between items-center text-xs font-mono">
            <span class="font-bold text-slate-400 w-12">${dayLabels[dIdx]}</span>
            <span class="text-slate-200 font-bold text-right truncate max-w-[200px]">${assignedSplit[dIdx] || 'Rest & Recovery'}</span>
          </div>
        `).join('');

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono">
              <span class="flex items-center gap-1.5">
  <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  Program Templates</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-1.5 font-mono text-xs">
              ${programPresets.map(p => `
                <button type="button" onclick="appActions.selectProgramPreset('${p.id}')" class="p-2 rounded-xl border transition text-left tactile ${state.selectedProgramId === p.id ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-lg' : 'bg-card-sub text-slate-300 border-sub hover:bg-slate-800'}">
                  <div class="truncate text-[11px] font-bold">${p.name}</div>
                  <div class="text-[9px] text-slate-400">${p.author}</div>
                </button>
              `).join('')}
            </div>

            <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 text-xs font-mono shadow-xl w-full">
              <div class="flex justify-between items-start border-b border-sub pb-2">
                <div>
                  <h2 class="text-sm md:text-base font-bold text-white">${selectedProg.name}</h2>
                  <p class="text-[10px] text-slate-400">${selectedProg.author} • ${selectedProg.desc}</p>
                </div>
                <div class="flex items-center space-x-1 bg-input p-1 rounded-xl border border-sub">
                  ${availableDays.map(d => `
                    <button type="button" onclick="appActions.setProgramPresetDays(${d})" class="px-2.5 py-1 rounded-lg text-xs font-bold transition tactile ${selectedDays === d ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}">
                      ${d}D
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                <div class="space-y-2">
                  <div class="text-[10px] text-accent font-bold uppercase">Mesocycle Periodization Sequence</div>
                  <div class="space-y-1.5">
                    ${(selectedProg.macro || []).map((m, idx) => `
                      <div class="bg-input p-2 rounded-xl border border-sub flex justify-between items-center text-xs">
                        <span class="text-slate-300 font-bold">${idx + 1}. ${m.phase}</span>
                        <span class="text-slate-400">${m.weeks} Weeks</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <div class="space-y-2">
                  <div class="text-[10px] text-accent font-bold uppercase">${selectedDays}-Day Weekly Split Schedule</div>
                  <div class="space-y-1.5">${scheduleCards}</div>
                </div>
              </div>

              <button type="button" onclick="appActions.launchProgramPreset('${selectedProg.id}', ${selectedDays})" class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl text-xs font-bold text-white shadow-xl tactile">
                ⚡ Apply ${selectedDays}-Day Blueprint to Calendar &rarr;
              </button>
            </div>
          </main>
        `;
      }

      // 13. SPLIT BLUEPRINT BUILDER SCREEN
      else if (state.screen === 'splits') {
        const blueprintNames = Object.keys(state.customSplitBlueprints || {});
        const activeBlueprintName = state.editingBlueprintName || blueprintNames[0];
        const activeSlots = state.customSplitBlueprints?.[activeBlueprintName] || [];

        const slotsHtml = activeSlots.map((slot, idx) => {
          const cleanMods = sanitizeModifiers(slot.modifiers);
          return `
            <div class="bg-input p-3 rounded-2xl border border-sub space-y-1.5 shadow-sm">
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center space-x-1.5 font-mono mb-0.5">
  <span class="text-[9px] text-accent uppercase font-bold mr-1">${slot.category}</span>${['Main', 'Secondary', 'Assistance'].map(t => `
    <button type="button" 
      onclick="appActions.updateSplitSlotTier('${activeBlueprintName}', ${idx}, '${t}')" 
      class="px-1.5 py-0.5 rounded text-[8.5px] border font-bold transition tactile ${slot.tier === t ? 'bg-accent/20 text-accent border-accent' : 'bg-input text-slate-400 border-sub hover:text-white'}">
      ${t}
    </button>
  `).join('')}
</div>
                  <h4 class="text-xs font-bold text-white mt-0.5">${slot.exercise}</h4>
                </div>
                <button type="button" onclick="appActions.deleteBlueprintSlot('${activeBlueprintName}', ${idx})" class="text-slate-400 hover:text-red-400 text-xs font-bold px-2 py-1 bg-card-sub rounded-lg border border-sub tactile">✕</button>
              </div>
              ${cleanMods.length ? `
                <div class="flex flex-wrap gap-1">
                  ${cleanMods.map(m => `<span class="text-[8px] bg-card-sub text-accent px-1.5 py-0.2 rounded-md border border-sub">${m}</span>`).join('')}
                </div>
              ` : ''}
              <div class="text-[10px] text-slate-400 pt-1 border-t border-sub/50 flex justify-between">
                <span>Prescription: <b class="text-slate-200">${slot.scheme}</b></span>
              </div>
            </div>
          `;
        }).join('');

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono">
              <span class="flex items-center gap-1.5">
  <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
  Weekly Splits</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start w-full">
              <div class="md:col-span-4 bg-card-sub p-3 rounded-2xl border border-sub space-y-2 font-mono text-xs">
                <div class="text-[10px] text-accent font-bold uppercase">Workout Split Templates</div>
                <div class="space-y-1 max-h-56 overflow-y-auto pr-1">
                  ${blueprintNames.map(bName => `
                    <button type="button" onclick="appActions.selectEditingBlueprint('${bName}')" class="w-full text-left p-2 rounded-xl border transition truncate tactile ${activeBlueprintName === bName ? 'bg-blue-600 text-white font-bold border-blue-500 shadow' : 'bg-input text-slate-300 border-sub hover:bg-slate-800'}">
                      ${bName}
                    </button>
                  `).join('')}
                </div>
                
                <div class="pt-2 border-t border-sub/50 space-y-1.5">
                  <input type="text" placeholder="New template name..." value="${state.newBlueprintName || ''}" oninput="state.newBlueprintName = this.value" class="w-full bg-input border border-sub rounded-xl p-2 text-xs text-white focus:outline-none">
                  <button type="button" onclick="appActions.createNewBlueprint()" class="w-full py-2 bg-blue-600 text-white rounded-xl font-bold tactile">+ Create Template</button>
                </div>
              </div>

              <div class="md:col-span-8 bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-xl">
                <div class="flex justify-between items-center border-b border-sub pb-2">
                  <div>
                    <span class="text-[9px] text-accent font-bold uppercase">Active Split</span>
                    <h3 class="text-sm font-bold text-white">${activeBlueprintName}</h3>
                  </div>
                  <div class="flex items-center space-x-1.5">
                  <button type="button" 
  onclick="appActions.toggleSplitGppMode('${activeBlueprintName}')" 
  class="px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition tactile ${activeSlots.every(s => s.tier === 'Assistance') && activeSlots.length > 0 ? 'bg-accent/20 text-accent border-accent' : 'bg-input text-slate-400 border-sub hover:text-white'}">
  🏃 GPP Mode
</button>
<button type="button" onclick="appActions.addSlotToBlueprint('${state.editingBlueprintName}')" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-xs tactile">
  + Add Slot
</button>
                  <button type="button" onclick="appActions.deleteBlueprint('${activeBlueprintName}')" class="px-2.5 py-1.5 bg-input text-slate-400 hover:text-red-400 border border-sub rounded-xl tactile">Delete</button>
                  </div>
                </div>

                <div class="space-y-2">
                  ${slotsHtml.length ? slotsHtml : `<div class="text-center py-8 text-slate-500">No movement slots in this blueprint. Tap "+ Slot" to add.</div>`}
                </div>
              </div>
            </div>
          </main>
        `;
      }

      // 14. ANALYTICS SCREEN (With 1RM Prediction Formula Selector)
      else if (state.screen === 'analytics') {
        const activeTf = state.analyticsTimeframe || '3M';
        const activeTab = state.analyticsTab || 'lifts';
        const cutoffEpoch = getTimeframeCutoff(activeTf);

        const everUsedVariants = getEverUsedLiftVariants();
        if (!everUsedVariants.includes(state.analyticsSelectedLift)) {
          state.analyticsSelectedLift = everUsedVariants[0];
        }
        const selectedVariant = state.analyticsSelectedLift;
        const { baseName, mods } = parseVariantKey(selectedVariant);

        const rawLiftHistory = getLiftHistory(baseName, true, mods);
        const filteredLiftHistory = rawLiftHistory
          .filter(h => dateKeyToEpoch(h.date) >= cutoffEpoch && h.topE1 > 0)
          .reverse();

        const liftPoints = filteredLiftHistory.map(h => {
          const parts = (h.date || '').split('-');
          const label = parts.length >= 3 ? `${Number(parts[1])}/${Number(parts[2])}` : h.date;
          return { date: h.date, label, val: h.topE1 };
        });

        const allBwDates = Object.keys(state.dayLogs || {})
          .filter(k => state.dayLogs[k]?.weight && dateKeyToEpoch(k) >= cutoffEpoch)
          .sort();

        const bwRecords = [];
        let prevWeight = null;
        allBwDates.forEach((dKey) => {
          const w = Number(state.dayLogs[dKey].weight);
          if (isNaN(w) || w <= 0) return;
          const parts = dKey.split('-');
          const epoch = dateKeyToEpoch(dKey);
          
          const windowWeights = allBwDates
            .filter(k => {
              const e = dateKeyToEpoch(k);
              return e <= epoch && e >= (epoch - (6 * 86400000));
            })
            .map(k => Number(state.dayLogs[k].weight))
            .filter(v => !isNaN(v) && v > 0);
          
          const rollingAvg = windowWeights.length 
            ? Math.round((windowWeights.reduce((a, b) => a + b, 0) / windowWeights.length) * 10) / 10 
            : w;

          const delta = prevWeight !== null ? Math.round((w - prevWeight) * 10) / 10 : 0.0;
          prevWeight = w;

          bwRecords.push({
            date: dKey,
            label: parts.length >= 3 ? `${Number(parts[1])}/${Number(parts[2])}` : dKey,
            val: w,
            delta: delta,
            rollingAvg: rollingAvg
          });
        });

        const allWorkoutDates = Object.keys(state.dayLogs || {})
          .filter(k => state.dayLogs[k]?.workout?.done && dateKeyToEpoch(k) >= cutoffEpoch)
          .sort();

        const fatigueRecords = allWorkoutDates.map(dKey => {
          const w = state.dayLogs[dKey].workout;
          const dur = Number(w.dur) || 45;
          const srpeNum = roundRpe(w.srpe || 7.5);
          const au = Math.round(dur * srpeNum);
          const ready = state.dayLogs[dKey]?.recovery?.score || 75;
          const parts = dKey.split('-');
          return {
            date: dKey,
            label: parts.length >= 3 ? `${Number(parts[1])}/${Number(parts[2])}` : dKey,
            val: au,
            dur: dur,
            srpe: srpeNum,
            ready: ready
          };
        });

        const curCalBounds = getCalendarWeekBounds(0);
        const prevCalBounds = getCalendarWeekBounds(-1);
        const twoWksBounds = getCalendarWeekBounds(-2);

        const activeVolumeMode = state.analyticsVolumeMicrocycle || 'cur_cal_week';
        const volScores = getCalendarMicrocycleVolume(activeVolumeMode);

        const lifterType = state.profile?.lifterType || 'Natural';
        const thresholds = landmarkThresholds[lifterType] || landmarkThresholds.Natural || {};
        const calMod = core.getCalorieAwareVolumeMultiplier
          ? core.getCalorieAwareVolumeMultiplier()
          : { factor: 1.0, state: 'Maintenance', label: 'Maintenance Baseline', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/50', bwVelocity: 0 };

        const volumeBarsHtml = muscleGroupTaxonomy.map(m => {
          const sets = Math.round((volScores[m] || 0) * 10) / 10;
          const baseT = thresholds[m] || { mv: 4, mev: 8, mav: 16, mrv: 22 };
          const mv = baseT.mv;
          const mev = baseT.mev;
          const mav = Math.max(mev + 2, Math.round(baseT.mav * calMod.factor));
          const mrv = Math.max(mav + 2, Math.round(baseT.mrv * calMod.factor));
          
          let statusBadge = '';
          let barColor = 'bg-blue-500';
          if (sets < mv) {
            statusBadge = `<span class="text-slate-400">Below MV (${mv})</span>`;
            barColor = 'bg-slate-600';
          } else if (sets < mev) {
            statusBadge = `<span class="text-amber-400 font-bold">MV &rarr; MEV</span>`;
            barColor = 'bg-amber-500';
          } else if (sets <= mav) {
            statusBadge = `<span class="text-emerald-400 font-bold">Optimal MAV</span>`;
            barColor = 'bg-emerald-500';
          } else if (sets <= mrv) {
            statusBadge = `<span class="text-indigo-400 font-bold">MAV &rarr; MRV</span>`;
            barColor = 'bg-indigo-500';
          } else {
            statusBadge = `<span class="text-red-400 font-bold animate-pulse">Over MRV (${mrv})</span>`;
            barColor = 'bg-red-500';
          }

          const pctOfMrv = Math.min(100, Math.round((sets / (mrv || 25)) * 100));

          return `
            <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1.5 font-mono text-xs">
              <div class="flex justify-between items-center">
                <span class="font-bold text-white">${m}</span>
                <div class="text-[10px] space-x-2">
                  <span class="text-slate-300 font-bold text-xs">${sets} <span class="text-[9px] text-slate-500 font-normal">sets</span></span>
                  ${statusBadge}
                </div>
              </div>
              <div class="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex border border-sub/60 relative">
                <div class="h-full ${barColor} rounded-full transition-all duration-500" style="width: ${pctOfMrv}%"></div>
              </div>
              <div class="flex justify-between text-[8px] text-slate-500 pt-0.5">
                <span>MV: ${mv}</span>
                <span>MEV: ${mev}</span>
                <span>MAV: ${mav}</span>
                <span>MRV: ${mrv}</span>
              </div>
            </div>
          `;
        }).join('');

        const cWeight = state.analyticsCalcWeight || 315;
        const cReps = state.analyticsCalcReps || 5;
        const brzycki = calculate1RmEquivalent(cWeight, cReps, 'brzycki');
        const epley = calculate1RmEquivalent(cWeight, cReps, 'epley');
        const wathan = calculate1RmEquivalent(cWeight, cReps, 'wathan');
        const lombardi = calculate1RmEquivalent(cWeight, cReps, 'lombardi');
        const apexCalc = calculate1RmEquivalent(cWeight, cReps, 'apex');
        const activeFormula = state.settings?.oneRmFormula || 'apex';

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3.5 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono">
              <span class="flex items-center gap-1.5">
  <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
  Analytics</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <div class="bg-card-sub p-2 rounded-2xl border border-sub flex items-center justify-between font-mono text-xs shadow-sm">
              <span class="text-[10px] text-slate-400 font-bold uppercase pl-1">Horizon:</span>
              <div class="flex gap-1">
                ${['1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'].map(tf => `
                  <button type="button" onclick="appActions.setAnalyticsTimeframe('${tf}')" class="px-2.5 py-1 rounded-xl text-[10px] font-bold transition tactile ${activeTf === tf ? 'bg-blue-600 text-white shadow' : 'bg-input text-slate-400 border border-sub'}">
                    ${tf}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="grid grid-cols-5 gap-1 p-1 bg-input rounded-2xl border border-sub font-mono text-[11px]">
        <button type="button" onclick="appActions.setAnalyticsTab('lifts')" class="py-1.5 rounded-xl font-bold transition ${activeTab === 'lifts' ? 'bg-accent text-black shadow' : 'text-slate-400 hover:text-slate-200'}">Lifts</button>
        <button type="button" onclick="appActions.setAnalyticsTab('bodyweight')" class="py-1.5 rounded-xl font-bold transition ${activeTab === 'bodyweight' ? 'bg-accent text-black shadow' : 'text-slate-400 hover:text-slate-200'}">BW</button>
        <button type="button" onclick="appActions.setAnalyticsTab('fatigue')" class="py-1.5 rounded-xl font-bold transition ${activeTab === 'fatigue' ? 'bg-accent text-black shadow' : 'text-slate-400 hover:text-slate-200'}">Fatigue</button>
        <button type="button" onclick="appActions.setAnalyticsTab('volume')" class="py-1.5 rounded-xl font-bold transition ${activeTab === 'volume' ? 'bg-accent text-black shadow' : 'text-slate-400 hover:text-slate-200'}">Volume</button>
        <button type="button" onclick="appActions.setAnalyticsTab('tools')" class="py-1.5 rounded-xl font-bold transition ${activeTab === 'tools' ? 'bg-accent text-black shadow' : 'text-slate-400 hover:text-slate-200'}">Tools</button>
      </div>
            ${activeTab === 'lifts' ? `
              <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-xl">
                <div class="flex justify-between items-center border-b border-sub pb-2">
                  <div>
                    <span class="text-[10px] text-accent font-bold uppercase">e1RM Performance Trajectory</span>
                    <div class="text-[9px] text-slate-400">Ever-used movement variants with attached modifiers</div>
                  </div>
                  <div class="flex items-center space-x-1.5">
                    <button type="button" onclick="appActions.openPrLedgerModal()" class="px-2.5 py-1 bg-amber-500/20 border border-amber-500/50 text-amber-300 rounded-xl text-[10px] font-bold tactile shadow-sm">
                      🔥 PR Ledger
                    </button>
                    <select onchange="state.analyticsSelectedLift = this.value; window.render();" class="bg-input border border-sub rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:outline-none max-w-[160px] truncate font-bold">
                      ${everUsedVariants.map(v => `<option value="${v}" ${selectedVariant === v ? 'selected' : ''}>${v}</option>`).join('')}
                    </select>
                  </div>
                </div>

                ${liftPoints.length > 0 ? `
                  <div class="grid grid-cols-3 gap-2 text-center text-xs">
                    <div class="bg-input p-2 rounded-xl border border-sub">
                      <div class="text-[9px] text-slate-400 uppercase">Current e1RM</div>
                      <div class="text-sm font-black text-accent mt-0.5">${liftPoints[liftPoints.length - 1].val} lbs</div>
                    </div>
                    <div class="bg-input p-2 rounded-xl border border-sub">
                      <div class="text-[9px] text-slate-400 uppercase">Window Peak</div>
                      <div class="text-sm font-bold text-white mt-0.5">${Math.max(...liftPoints.map(p => p.val))} lbs</div>
                    </div>
                    <div class="bg-input p-2 rounded-xl border border-sub">
                      <div class="text-[9px] text-slate-400 uppercase">Net &Delta; (${activeTf})</div>
                      <div class="text-sm font-bold ${liftPoints[liftPoints.length - 1].val >= liftPoints[0].val ? 'text-emerald-400' : 'text-red-400'} mt-0.5">
                        ${liftPoints[liftPoints.length - 1].val >= liftPoints[0].val ? '+' : ''}${liftPoints[liftPoints.length - 1].val - liftPoints[0].val} lbs
                      </div>
                    </div>
                  </div>
                ` : ''}

                <div class="w-full bg-input rounded-2xl border border-sub p-2 flex items-center justify-center">
                  ${renderRichChartSvg(liftPoints, 'lbs', '#38bdf8')}
                </div>

                <div class="space-y-1.5 pt-2 border-t border-sub/50">
                  <span class="text-[10px] text-accent font-bold uppercase">Completed Performance Sessions (${filteredLiftHistory.length})</span>
                  <div class="space-y-1 max-h-48 overflow-y-auto pr-1">
                    ${filteredLiftHistory.length ? filteredLiftHistory.slice().reverse().map(h => {
                      const setDetails = (h.sets || []).filter(s => s && s.done).map(s => `${s.actualWeight}lbs×${s.actualReps}`).join(', ');
                      return `
                        <div class="bg-input p-2 rounded-xl border border-sub flex justify-between items-center text-[10px]">
                          <div>
                            <span class="font-bold text-white">${h.date}</span>
                            <span class="text-slate-400 ml-1">(${h.scheme})</span>
                            <div class="text-[9px] text-slate-400 mt-0.5">${setDetails || `${h.totalReps} total reps`}</div>
                          </div>
                          <div class="text-right">
                            <span class="text-accent font-bold text-xs">${h.topE1} lbs</span>
                            <div class="text-[9px] text-slate-500">${Math.round(h.tonnage || 0).toLocaleString()} lbs vol</div>
                          </div>
                        </div>
                      `;
                    }).join('') : `<div class="text-center text-slate-500 py-4 text-xs">No sessions logged for ${selectedVariant} in the past ${activeTf}.</div>`}
                  </div>
                </div>
              </div>

              <!-- Lift-Specific Time-to-Peak (TTP) Tracker -->
              ${(() => {
                const ttp = core.computeLiftTimeToPeak ? core.computeLiftTimeToPeak(baseName, mods) : null;
                if (!ttp) return '';
                return `
                  <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-xl">
                    <div class="flex justify-between items-center border-b border-sub pb-2">
                      <div>
                        <span class="text-[10px] text-accent font-bold uppercase">Lift-Specific Time-to-Peak (TTP)</span>
                        <div class="text-[9px] text-slate-400">Average e1RM by block week for ${selectedVariant} (${ttp.sampleSessions} sessions)</div>
                      </div>
                      ${ttp.peakWeek ? `<span class="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">Peaks W${ttp.peakWeek}</span>` : ''}
                    </div>
                    ${ttp.weekProfile.length ? `
                      <div class="grid grid-cols-${Math.min(6, Math.max(2, ttp.weekProfile.length))} gap-1.5 text-center">
                        ${ttp.weekProfile.map(wp => `
                          <div class="bg-input p-2 rounded-xl border ${wp.week === ttp.peakWeek ? 'border-emerald-500/70 ring-1 ring-emerald-500/40' : 'border-sub'}">
                            <div class="text-[8.5px] text-slate-400 uppercase font-bold">Week ${wp.week}</div>
                            <div class="text-xs font-black ${wp.week === ttp.peakWeek ? 'text-emerald-300' : 'text-white'} mt-0.5">${wp.avgE1} lbs</div>
                            <div class="text-[8px] text-slate-500">${wp.count}x logged</div>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}
                    <div class="text-[10px] text-slate-300 bg-input/60 px-3 py-2 rounded-xl border border-sub/60">
                      ${ttp.recommendation}
                    </div>
                  </div>
                `;
              })()}

              <!-- Personal Stimulus-to-Fatigue (SFR) Leaderboard -->
              ${(() => {
                const sfrList = core.computePersonalSfrLeaderboard ? core.computePersonalSfrLeaderboard(cutoffEpoch) : [];
                return `
                  <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-xl">
                    <div class="flex justify-between items-center border-b border-sub pb-2">
                      <div>
                        <span class="text-[10px] text-accent font-bold uppercase">Personal Stimulus-to-Fatigue (SFR) Leaderboard</span>
                        <div class="text-[9px] text-slate-400">Ranks movement ROI: e1RM progression vs. next-day localized soreness & sRPE</div>
                      </div>
                      <span class="text-[9px] text-slate-400 font-bold">${sfrList.length} Ranked</span>
                    </div>
                    ${sfrList.length ? `
                      <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                        ${sfrList.slice(0, 10).map((item, idx) => `
                          <div class="bg-input p-2.5 rounded-xl border border-sub flex justify-between items-center text-[10px]">
                            <div class="min-w-0 pr-2">
                              <div class="flex items-center space-x-1.5">
                                <span class="text-slate-500 font-bold">#${idx + 1}</span>
                                <span class="font-bold text-white truncate">${item.variant}</span>
                              </div>
                              <div class="text-[9px] text-slate-400 mt-0.5">
                                ${item.sessions} sessions • e1RM: <b class="${item.gainLbs >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${item.gainLbs >= 0 ? '+' : ''}${item.gainLbs} lbs</b> • Next-Day Recovery: <b>${item.avgNextDaySoreness}/5</b>
                              </div>
                            </div>
                            <div class="flex items-center space-x-2 shrink-0">
                              <span class="text-xs font-black text-white">${item.sfrScore}</span>
                              <span class="px-2 py-0.5 rounded-lg border text-[10px] font-black ${item.badge}">${item.grade}</span>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    ` : `<div class="text-center py-4 text-slate-500 text-[10px]">Log at least 2 sessions of a movement within ${activeTf} to generate your personal SFR rankings.</div>`}
                  </div>
                `;
              })()}

              <!-- Interactive 1RM Prediction Engine Section -->
              <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-xl w-full">
                <div class="flex justify-between items-center border-b border-sub pb-2">
                  <div>
                    <span class="text-[10px] text-accent font-bold uppercase">1RM Prediction Engine Selection</span>
                    <div class="text-[9px] text-slate-400">Select which formula drives target load derivation in the app</div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input type="number" step="5" value="${cWeight}" oninput="appActions.setAnalyticsCalc('analyticsCalcWeight', this.value)" class="w-16 bg-input border border-sub rounded-lg p-1 text-center text-white font-bold">
                    <span>lbs ×</span>
                    <input type="number" min="1" max="20" value="${cReps}" oninput="appActions.setAnalyticsCalc('analyticsCalcReps', this.value)" class="w-12 bg-input border border-sub rounded-lg p-1 text-center text-white font-bold">
                    <span>reps</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
                  <div class="bg-input p-2.5 rounded-2xl border ${activeFormula === 'apex' ? 'border-accent ring-1 ring-accent' : 'border-sub'} flex flex-col justify-between space-y-1.5">
                    <div>
                      <div class="text-[9px] text-slate-400 font-bold uppercase">APEX RPE Engine</div>
                      <div class="text-sm font-black text-accent mt-0.5">${apexCalc} lbs</div>
                    </div>
                    <button type="button" onclick="appActions.setOneRmFormula('apex')" class="py-1 rounded-lg text-[9px] font-bold tactile ${activeFormula === 'apex' ? 'bg-accent text-black' : 'bg-card-sub text-slate-300 border border-sub'}">
                      ${activeFormula === 'apex' ? '✓ Active' : 'Select'}
                    </button>
                  </div>

                  <div class="bg-input p-2.5 rounded-2xl border ${activeFormula === 'epley' ? 'border-blue-400 ring-1 ring-blue-400' : 'border-sub'} flex flex-col justify-between space-y-1.5">
                    <div>
                      <div class="text-[9px] text-slate-400 font-bold uppercase">Epley Formula</div>
                      <div class="text-sm font-bold text-white mt-0.5">${epley} lbs</div>
                    </div>
                    <button type="button" onclick="appActions.setOneRmFormula('epley')" class="py-1 rounded-lg text-[9px] font-bold tactile ${activeFormula === 'epley' ? 'bg-blue-600 text-white' : 'bg-card-sub text-slate-300 border border-sub'}">
                      ${activeFormula === 'epley' ? '✓ Active' : 'Select'}
                    </button>
                  </div>

                  <div class="bg-input p-2.5 rounded-2xl border ${activeFormula === 'brzycki' ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-sub'} flex flex-col justify-between space-y-1.5">
                    <div>
                      <div class="text-[9px] text-slate-400 font-bold uppercase">Brzycki Formula</div>
                      <div class="text-sm font-bold text-white mt-0.5">${brzycki} lbs</div>
                    </div>
                    <button type="button" onclick="appActions.setOneRmFormula('brzycki')" class="py-1 rounded-lg text-[9px] font-bold tactile ${activeFormula === 'brzycki' ? 'bg-indigo-600 text-white' : 'bg-card-sub text-slate-300 border border-sub'}">
                      ${activeFormula === 'brzycki' ? '✓ Active' : 'Select'}
                    </button>
                  </div>

                  <div class="bg-input p-2.5 rounded-2xl border ${activeFormula === 'wathan' ? 'border-emerald-400 ring-1 ring-emerald-400' : 'border-sub'} flex flex-col justify-between space-y-1.5">
                    <div>
                      <div class="text-[9px] text-slate-400 font-bold uppercase">Wathan Curve</div>
                      <div class="text-sm font-bold text-white mt-0.5">${wathan} lbs</div>
                    </div>
                    <button type="button" onclick="appActions.setOneRmFormula('wathan')" class="py-1 rounded-lg text-[9px] font-bold tactile ${activeFormula === 'wathan' ? 'bg-emerald-600 text-white' : 'bg-card-sub text-slate-300 border border-sub'}">
                      ${activeFormula === 'wathan' ? '✓ Active' : 'Select'}
                    </button>
                  </div>

                  <div class="bg-input p-2.5 rounded-2xl border ${activeFormula === 'lombardi' ? 'border-pink-400 ring-1 ring-pink-400' : 'border-sub'} flex flex-col justify-between space-y-1.5">
                    <div>
                      <div class="text-[9px] text-slate-400 font-bold uppercase">Lombardi Power</div>
                      <div class="text-sm font-bold text-white mt-0.5">${lombardi} lbs</div>
                    </div>
                    <button type="button" onclick="appActions.setOneRmFormula('lombardi')" class="py-1 rounded-lg text-[9px] font-bold tactile ${activeFormula === 'lombardi' ? 'bg-pink-600 text-white' : 'bg-card-sub text-slate-300 border border-sub'}">
                      ${activeFormula === 'lombardi' ? '✓ Active' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>
            ` : ''}

            ${activeTab === 'bodyweight' ? `
              <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-xl">
                <div class="flex justify-between items-center border-b border-sub pb-2">
                  <div>
                    <span class="text-[10px] style="color: var(--accent-primary) font-bold uppercase">Bodyweight Telemetry</span>
                    <div class="text-[9px] text-slate-400">${bwRecords.length} check-ins recorded in ${activeTf}</div>
                  </div>
                  <button type="button" onclick="appActions.toggleBwView()" class="px-3 py-1.5 bg-input border border-sub text-slate-200 rounded-xl font-bold tactile hover:text-white text-xs">
                    ${state.analyticsBwView === 'table' ? '📈 Graph View' : '📋 Table View'}
                  </button>
                </div>

                ${bwRecords.length > 0 ? `
                  <div class="grid grid-cols-4 gap-1.5 text-center text-xs">
                    <div class="bg-input p-2 rounded-xl border border-sub">
                      <div class="text-[8px] text-slate-400 uppercase">Current</div>
                      <div class="text-xs md:text-sm font-black style="color: var(--accent-primary) mt-0.5">${bwRecords[bwRecords.length - 1].val}lbs</div>
                    </div>
                    <div class="bg-input p-2 rounded-xl border border-sub">
                      <div class="text-[8px] text-slate-400 uppercase">Low / High</div>
                      <div class="text-xs font-bold text-white mt-0.5">${Math.min(...bwRecords.map(b => b.val))} / ${Math.max(...bwRecords.map(b => b.val))}</div>
                    </div>
                    <div class="bg-input p-2 rounded-xl border border-sub">
                      <div class="text-[8px] text-slate-400 uppercase">Net &Delta;</div>
                      <div class="text-xs font-bold ${bwRecords[bwRecords.length - 1].val - bwRecords[0].val >= 0 ? 'style="color: var(--accent-primary)' : 'text-amber-400'} mt-0.5">
                        ${bwRecords[bwRecords.length - 1].val - bwRecords[0].val >= 0 ? '+' : ''}${Math.round((bwRecords[bwRecords.length - 1].val - bwRecords[0].val) * 10) / 10}lbs
                      </div>
                    </div>
                    <div class="bg-input p-2 rounded-xl border border-sub">
                      <div class="text-[8px] text-slate-400 uppercase">7D Rolling Avg</div>
                      <div class="text-xs md:text-sm font-black text-white mt-0.5">${bwRecords[bwRecords.length - 1].rollingAvg}lbs</div>
                    </div>
                  </div>
                ` : ''}

                ${state.analyticsBwView === 'graph' ? `
                  <div class="w-full bg-input rounded-2xl border border-sub p-2 flex items-center justify-center">
                    ${renderRichChartSvg(bwRecords, 'lbs', '#14b8a6')}
                  </div>
                ` : `
                  <div class="space-y-1.5">
                    <div class="grid grid-cols-12 gap-1 text-[9px] text-slate-400 uppercase font-bold px-2">
                      <span class="col-span-4 text-left">Date</span>
                      <span class="col-span-3 text-right">Weigh-In</span>
                      <span class="col-span-2 text-right">Daily &Delta;</span>
                      <span class="col-span-3 text-right">7D Avg</span>
                    </div>
                    <div class="space-y-1 max-h-56 overflow-y-auto pr-1">
                      ${bwRecords.slice().reverse().map(r => `
                        <div class="bg-input p-2 rounded-xl border border-sub grid grid-cols-12 gap-1 items-center text-[10px]">
                          <span class="col-span-4 text-white font-bold">${r.date}</span>
                          <span class="col-span-3 text-right font-black text-teal-300">${r.val.toFixed(1)} lbs</span>
                          <span class="col-span-2 text-right ${r.delta > 0 ? 'text-emerald-400' : (r.delta < 0 ? 'text-amber-400' : 'text-slate-500')}">
                            ${r.delta > 0 ? '+' : ''}${r.delta ? r.delta.toFixed(1) : '0.0'}
                          </span>
                          <span class="col-span-3 text-right text-slate-400">${r.rollingAvg.toFixed(1)} lbs</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `}
              </div>
              ${typeof window.renderAdaptiveTdeeCard === 'function' ? window.renderAdaptiveTdeeCard() : ''}
            ` : ''}

            ${activeTab === 'fatigue' ? `
              <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-xl">
                <div class="flex justify-between items-center border-b border-sub pb-2">
                  <div>
                    <span class="text-[10px] font-bold uppercase" style="color: var(--accent-primary)">Training Stress & Load</span>
                    <div class="text-[9px] text-slate-400">Workload impulse = Session Duration (min) × Session RPE</div>
                  </div>
                  <span class="text-xs font-bold text-white">${fatigueRecords.length} Sessions</span>
                </div>

                ${fatigueRecords.length > 0 ? `
                  <div class="grid grid-cols-3 gap-2 text-center text-xs">
                    <div class="bg-input p-2 rounded-xl border border-sub">
                      <div class="text-[9px] text-slate-400 uppercase">Latest Load</div>
                      <div class="text-sm font-black text-pink-300 mt-0.5">${fatigueRecords[fatigueRecords.length - 1].val} AU</div>
                    </div>
                    <div class="bg-input p-2 rounded-xl border border-sub">
                      <div class="text-[9px] text-slate-400 uppercase">Average Session Load</div>
                      <div class="text-sm font-bold text-white mt-0.5">${Math.round(fatigueRecords.reduce((a, b) => a + b.val, 0) / fatigueRecords.length)} AU</div>
                    </div>
                    <div class="bg-input p-2 rounded-xl border border-sub">
                      <div class="text-[9px] text-slate-400 uppercase">Peak Session Spike</div>
                      <div class="text-sm font-bold text-amber-400 mt-0.5">${Math.max(...fatigueRecords.map(f => f.val))} AU</div>
                    </div>
                  </div>
                ` : ''}

                <div class="w-full bg-input rounded-2xl border border-sub p-2 flex items-center justify-center">
                  ${renderRichChartSvg(fatigueRecords, ' AU', '#ec4899')}
                </div>

                <div class="space-y-1 max-h-48 overflow-y-auto pr-1 pt-1 border-t border-sub/50">
                  <span class="text-[10px] font-bold uppercase" style="color: var(--accent-primary)">Completed Stress Load</span>
                  ${fatigueRecords.slice().reverse().map(f => `
                    <div class="bg-input p-2 rounded-xl border border-sub flex justify-between items-center text-[10px]">
                      <div>
                        <span class="font-bold text-white">${f.date}</span>
                        <span class="text-slate-400 ml-1.5">${f.dur}m @ sRPE ${f.srpe <= 5.5 ? '&lt;6.0' : f.srpe.toFixed(1)}</span>
                      </div>
                      <div class="text-right">
                        <span class="text-pink-300 font-bold text-xs">${f.val} AU</span>
                        <span class="text-[9px] text-slate-400 ml-1.5">(${f.ready}% Ready)</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${activeTab === 'volume' ? `
              <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-xl w-full">
                <div class="flex justify-between items-center border-b border-sub pb-2">
                  <div>
                    <div class="flex flex-wrap items-center gap-1.5">
                      <span class="text-[10px] text-accent font-bold uppercase">Microcycle Volume Landmarks</span>
                      <span class="text-[8.5px] px-2 py-0.5 rounded-md border font-bold ${calMod.badge}">${calMod.label}</span>
                    </div>
                    <div class="text-[9px] text-slate-400 mt-0.5">Calendar week (Mon-Sun) aggregated sets vs. calorie-adjusted thresholds (${lifterType})</div>
                  </div>
                  <select onchange="appActions.setVolumeMicrocycle(this.value)" class="bg-input border border-sub rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:outline-none font-bold">
                    <option value="cur_cal_week" ${activeVolumeMode === 'cur_cal_week' ? 'selected' : ''}>Current Microcycle (${curCalBounds.rangeLabel})</option>
                    <option value="prev_cal_week" ${activeVolumeMode === 'prev_cal_week' ? 'selected' : ''}>Previous Microcycle (${prevCalBounds.rangeLabel})</option>
                    <option value="two_wks_ago" ${activeVolumeMode === 'two_wks_ago' ? 'selected' : ''}>2 Wks Ago (${twoWksBounds.rangeLabel})</option>
                    <option value="last_30" ${activeVolumeMode === 'last_30' ? 'selected' : ''}>Last 30 Calendar Days</option>
                  </select>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  ${volumeBarsHtml}
                </div>
              </div>
            ` : ''}
          ${activeTab === 'tools' ? `
            <div class="space-y-4 font-mono">
              ${renderCustomRpeTool()}
            </div>
          ` : ''}
            </main>
        `;
      }
// 15. USER GUIDE SCREEN
      else if (state.screen === 'guide') {
        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3.5 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono w-full">
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                APEX User Guide
              </span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <!-- Overview Banner -->
            <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-1.5 font-mono text-xs shadow-sm">
              <span class="text-[10px] text-accent font-bold uppercase tracking-wider">System Overview</span>
              <p class="text-[10px] text-slate-300 leading-relaxed">
                APEX is an autoregulated periodization engine designed to prescribe loads, manage systemic fatigue, and decay rep targets across training mesocycles. Tap any topic below for quick operational guidelines.
              </p>
            </div>

            <div class="space-y-2.5 font-mono text-xs">
              
              <!-- Topic 1: Mesocycles & Block Periodization -->
              <details class="bg-card-sub rounded-2xl border border-sub p-3 cursor-pointer group shadow-sm">
                <summary class="font-bold text-white text-xs flex justify-between items-center select-none">
                  <span class="flex items-center gap-2">
                    <span class="text-accent">01.</span>
                    <span>Mesocycles & Block Periodization</span>
                  </span>
                  <span class="text-accent group-open:rotate-90 transition-transform">▸</span>
                </summary>
                <div class="pt-2 text-slate-300 text-[11px] leading-relaxed space-y-2 border-t border-sub/50 mt-2.5">
                  <p>• <b>Timeline Anchor:</b> Set your start date in the Training Blocks. APEX calculates the active week (W1 intro through W3 overload) automatically based on calendar dates.</p>
                  <p>• <b>Linear Rep Decay:</b> The Phase Rep Matrix governs rep targets week to week. Across a 3-week block, targets naturally decay from high-rep ceilings down to low-rep floors for Main and Secondary compound movements.</p>
                  <p>• <b>Transition Wizard:</b> At the end of a mesocycle, launch the Wizard from the Mesocycle screen. It audits completed set volumes against landmark thresholds (MEV/MAV/MRV), calculates muscle fatigue, and blends tested grounding e1RMs into your new baseline anchor.</p>
                </div>
              </details>

              <!-- Topic 2: Daily Staging & Readiness -->
              <details class="bg-card-sub rounded-2xl border border-sub p-3 cursor-pointer group shadow-sm">
                <summary class="font-bold text-white text-xs flex justify-between items-center select-none">
                  <span class="flex items-center gap-2">
                    <span class="text-accent">02.</span>
                    <span>Daily Staging & Readiness</span>
                  </span>
                  <span class="text-accent group-open:rotate-90 transition-transform">▸</span>
                </summary>
                <div class="pt-2 text-slate-300 text-[11px] leading-relaxed space-y-2 border-t border-sub/50 mt-2.5">
                  <p>• <b>Readiness Check-In:</b> Logging morning bodyweight and rating the 7 physiological markers generates a rolling 3-day readiness score (Primed, Optimal, Guarded, Fatigued).</p>
                  <p>• <b>Staging Screen:</b> Selecting a date lets you preview planned movements, customize rep schemes, and inspect planned session strain against your recovery ceiling before heading onto the floor.</p>
                  <p>• <b>Top Single (1@8):</b> Enabling the top single toggle injects an un-fatigued neural primer set prior to working volume to gauge true daily neuromuscular readiness.</p>
                </div>
              </details>

              <!-- Topic 3: Active Workout Logger -->
              <details class="bg-card-sub rounded-2xl border border-sub p-3 cursor-pointer group shadow-sm">
                <summary class="font-bold text-white text-xs flex justify-between items-center select-none">
                  <span class="flex items-center gap-2">
                    <span class="text-accent">03.</span>
                    <span>Active Workout Logger & Set Controls</span>
                  </span>
                  <span class="text-accent group-open:rotate-90 transition-transform">▸</span>
                </summary>
                <div class="pt-2 text-slate-300 text-[11px] leading-relaxed space-y-2 border-t border-sub/50 mt-2.5">
                  <p>• <b>Prescriptions:</b> Set targets read as <code>[Load]x[Reps]r @[Target RPE]</code>. Enter actual weight, reps completed, and actual RPE in discrete 0.5 increments, then tap ✓ to log.</p>
                  <p>• <b>Inline Load Calculator (⚡ Bolt Icon):</b> Tapping the bolt on any exercise card opens the load drawer to reverse-calculate e1RMs, inspect past lift performances, or project target weights directly onto open sets.</p>
                  <p>• <b>Calibration Set (🔥):</b> Flags a top working set to push to @9.0. If you outperform your current anchor, it writes a new e1RM baseline into the system.</p>
                  <p>• <b>Skip Back-Offs (⚡):</b> Truncates remaining down-sets if systemic fatigue spikes or time runs short.</p>
                  <p>• <b>Fatigue Safeguard:</b> If an actual set overshoots target RPE by ≥1.0, APEX trips an overshoot warning with a one-tap <code>-5%</code> load reduction button.</p>
                </div>
              </details>

              <!-- Topic 4: Tiers, Schemes & Microcycles -->
              <details class="bg-card-sub rounded-2xl border border-sub p-3 cursor-pointer group shadow-sm">
                <summary class="font-bold text-white text-xs flex justify-between items-center select-none">
                  <span class="flex items-center gap-2">
                    <span class="text-accent">04.</span>
                    <span>Tiers, Schemes & Microcycle Blueprints</span>
                  </span>
                  <span class="text-accent group-open:rotate-90 transition-transform">▸</span>
                </summary>
                <div class="pt-2 text-slate-300 text-[11px] leading-relaxed space-y-2 border-t border-sub/50 mt-2.5">
                  <p>• <b>Movement Tiers:</b> <code>Main</code> receives primary compound loading with full periodization and grounding controls; <code>Secondary</code> receives supplemental compound volume; <code>Assistance</code> receives accessory hypertrophy rep windows.</p>
                  <p>• <b>GPP Session Mode:</b> Tapping the GPP button in the Weekly Splits instantly switches all movement slots in a blueprint to Assistance tier.</p>
                  <p>• <b>Rep Scheme Builder:</b> Configure working set counts, down-set drops, cluster intra-set rests, and RPE ramps globally or scoped strictly to specific phases.</p>
                </div>
              </details>

            </div>
          </main>
        `;
      }
      // 16. NUTRITION & MACROS SCREEN (Rendered by nutrition.js)
      else if (state.screen === 'nutrition') {
        html += (typeof window.renderNutritionScreen === 'function')
          ? window.renderNutritionScreen()
          : `<main class="flex-1 p-6 text-center font-mono text-xs text-slate-400">Nutrition module (nutrition.js) not loaded in index.html.</main>`;
      }

      // ======================================================================
      // MODAL PORTALS (Always Mounted Outside Main Scroller)
      // ======================================================================

      // Modal Portal: On-Demand Block Transition Wizard
      if (state.wizardModal && state.wizardModal.open && state.wizardModal.data) {
        const d = state.wizardModal.data;
        const recRows = (d.recommendations || []).map((rec, idx) => {
          const isApplied = rec.applied !== false;
          let badgeColor = 'text-slate-400 bg-input border-sub';
          if (rec.delta > 0) badgeColor = 'text-emerald-300 bg-emerald-950/60 border-emerald-700';
          else if (rec.delta < 0) badgeColor = 'text-amber-300 bg-amber-950/60 border-amber-700';

          return `
            <div class="bg-input p-3 rounded-2xl border border-sub space-y-1.5 font-mono text-xs">
              <div class="flex justify-between items-start">
                <div class="flex items-center space-x-2">
                  <input type="checkbox" ${isApplied ? 'checked' : ''} onchange="appActions.toggleWizardDelta(${idx})" class="w-4 h-4 rounded bg-card-sub border border-sub text-accent focus:ring-0 cursor-pointer">
                  <span class="font-bold text-white text-xs">${rec.muscle}</span>
                </div>
                <div class="flex items-center space-x-1.5">
                  <span class="text-[9px] px-2 py-0.5 rounded border ${badgeColor} font-bold">
                    ${rec.delta > 0 ? `+${rec.delta} Sets` : (rec.delta < 0 ? `${rec.delta} Sets` : 'Hold Volume')}
                  </span>
                  <span class="text-[9px] text-slate-400 font-bold">${rec.targetTier}</span>
                </div>
              </div>

              <div class="flex justify-between text-[9px] text-slate-400 pt-0.5 pl-6">
                <span>Avg: <b class="text-slate-200">${rec.weeklySets} sets/wk</b></span>
                <span>Soreness: <b class="${rec.avgSoreness <= 2.0 ? 'text-red-400' : 'text-slate-200'}">${rec.avgSoreness}/5</b></span>
                <span>MAV Range: ${rec.landmarks.mev}-${rec.landmarks.mav}</span>
              </div>

              <div class="text-[10px] text-slate-300 pl-6 leading-tight pt-0.5">
                ↳ ${rec.reason}
              </div>
            </div>
          `;
        }).join('');

        html += `
          <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto" onclick="event.stopPropagation()">
            <div class="bg-card border border-sub rounded-3xl w-full max-w-xl p-4 space-y-3.5 shadow-2xl my-auto text-xs font-mono max-h-[90vh] flex flex-col">
              <div class="flex justify-between items-start border-b border-sub pb-2">
                <div>
                  <span class="text-[9px] text-accent font-bold uppercase">🧙 End-of-Block Review & Transition</span>
                  <h3 class="text-sm font-bold text-white mt-0.5">Review ${d.currentPhase} Block &rarr; Advance to ${d.nextPhase}</h3>
                </div>
                <button type="button" onclick="appActions.closeBlockWizard()" class="text-slate-400 hover:text-white p-1 text-sm font-bold">✕</button>
              </div>

              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-input p-2 rounded-xl border border-sub">
                  <div class="text-[8px] text-slate-400 uppercase">Avg Readiness</div>
                  <div class="text-xs font-bold text-white mt-0.5">${d.avgReadiness}%</div>
                </div>
                <div class="bg-input p-2 rounded-xl border border-sub">
                  <div class="text-[8px] text-slate-400 uppercase">Foster Load</div>
                  <div class="text-xs font-bold text-pink-300 mt-0.5">${d.avgFosterLoad} AU</div>
                </div>
                <div class="bg-input p-2 rounded-xl border border-sub">
                  <div class="text-[8px] text-slate-400 uppercase">Bodyweight Trajectory</div>
                  <div class="text-xs font-bold ${d.bwVelocity >= 0 ? 'text-teal-300' : 'text-amber-300'} mt-0.5">
                    ${d.bwVelocity > 0 ? '+' : ''}${d.bwVelocity} lbs/wk
                  </div>
                </div>
              </div>

              <div class="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
                <span class="text-[10px] text-accent font-bold uppercase">Granular Tier Recommendations</span>
                ${recRows}
              </div>

              <div class="p-3 bg-input rounded-2xl border border-sub flex justify-between items-center">
                <div>
                  <div class="text-[10px] font-bold text-slate-200 uppercase">Suggested Anchor Blending</div>
                  <div class="text-[9px] text-slate-400">Re-seeds starting e1RMs for next mesocycle</div>
                </div>
                <select onchange="state.wizardModal.data.suggestedBlending = this.value" class="bg-card-sub border border-sub rounded-xl px-2.5 py-1 text-accent font-bold text-xs focus:outline-none">
                  <option value="conservative" ${d.suggestedBlending === 'conservative' ? 'selected' : ''}>Conservative (20% New / 80% Prior)</option>
                  <option value="moderate" ${d.suggestedBlending === 'moderate' ? 'selected' : ''}>Moderate (40% New / 60% Prior)</option>
                  <option value="aggressive" ${d.suggestedBlending === 'aggressive' ? 'selected' : ''}>Aggressive (60% New / 40% Prior)</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-1 border-t border-sub/60">
                <button type="button" onclick="appActions.closeBlockWizard()" class="py-2.5 bg-card-sub border border-sub rounded-xl text-slate-300 font-bold tactile">Cancel</button>
                <button type="button" onclick="appActions.commitBlockWizard()" class="py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-white font-bold tactile shadow-lg">
                  Commit & Launch Next Block &rarr;
                </button>
              </div>
            </div>
          </div>
        `;
      }

      // Date Action 3-Module Modal
      if (state.dateActionModal.open) {
        const d = state.dateActionModal.d;
        const k = formatIsoDate(state.year, state.month, d);
        const log = state.dayLogs?.[k] || {};
        const focus = getDayFocus(d);
        const hasExplicitBw = (log.weight !== undefined && log.weight !== null && log.weight !== '');
        const curWeightVal = hasExplicitBw ? log.weight : '';
        const hasLoggedWorkout = Boolean(log.workout?.done);
        const isCurrentActiveDay = (isWorkoutActive && state.activeWorkoutDateKey === k);
        const missedSplits = (!isCurrentActiveDay && !hasLoggedWorkout && core.getMissedSplitsForWeek)
          ? core.getMissedSplitsForWeek(k)
          : [];
        const firstMissed = missedSplits.length > 0 ? missedSplits[0] : null;

        html += `
          <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto" onclick="event.stopPropagation()">
            <div class="bg-card border border-sub rounded-3xl w-full max-w-sm p-4 space-y-3.5 shadow-2xl my-auto text-xs font-mono">
              <div class="flex justify-between items-center border-b border-sub pb-2">
                <div>
                  <span class="text-[9px] text-accent font-bold uppercase">${monthNames[state.month]} ${d}, ${state.year}</span>
                  <h3 class="text-sm font-bold text-white">${focus}</h3>
                </div>
                <button type="button" onclick="appActions.closeDateActionModal()" class="text-slate-400 hover:text-white p-1 text-sm font-bold">✕</button>
              </div>

              <div class="space-y-2.5">
                <div class="bg-input p-3 rounded-2xl border border-sub space-y-1.5">
                  <div class="flex justify-between items-center text-[10px]">
                    <span class="text-teal-300 font-bold uppercase flex items-center space-x-1.5">
                      <span class="w-4 h-4 rounded bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                        <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="4"/><rect x="8" y="6" width="8" height="3" rx="1" fill="currentColor"/></svg>
                      </span>
                      <span>Morning Bodyweight</span>
                    </span>
                    <span class="text-slate-400 text-[9px]">${hasExplicitBw ? '✓ Logged' : 'Not Logged'}</span>
                  </div>
                  <div class="flex items-center space-x-2 pt-0.5">
                    <input type="number" step="0.1" inputmode="decimal" placeholder="e.g. 196.2" id="modal-quick-bw-input" value="${curWeightVal}" class="flex-1 bg-card-sub border border-sub rounded-xl px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none">
                    <span class="text-slate-400 text-[10px] font-bold">lbs</span>
                    <button type="button" onclick="appActions.quickSaveBw('${k}', document.getElementById('modal-quick-bw-input').value)" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-[10px] tactile shadow">
                      Save
                    </button>
                  </div>
                </div>

                <div class="bg-input p-3 rounded-2xl border border-sub space-y-1.5">
                  <div class="flex justify-between items-center text-[10px]">
                    <span class="text-pink-300 font-bold uppercase flex items-center space-x-1.5">
                      <span class="w-4 h-4 rounded bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300">
                        <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      </span>
                      <span>Physiological Readiness</span>
                    </span>
                    <span class="text-slate-300 font-bold text-[10px]">${log.recovery?.score ? log.recovery.score + '% (' + (log.recovery.band || 'Optimal') + ')' : 'Pending'}</span>
                  </div>
                  <button type="button" onclick="state.selectedDay=${d}; appActions.closeDateActionModal(); appActions.navigate('checkin')" class="w-full py-2 bg-card-sub hover:bg-slate-900 border border-sub text-pink-300 rounded-xl font-bold text-[10px] flex items-center justify-center space-x-1.5 tactile">
                    <span>${log.recovery?.score ? 'Update Check-In' : 'Complete 7-Point Intake'}</span>
                    <span>&rarr;</span>
                  </button>
                </div>

                <div class="bg-input p-3 rounded-2xl border border-sub space-y-1.5">
                  <div class="flex justify-between items-center text-[10px]">
                    <span class="text-indigo-300 font-bold uppercase flex items-center space-x-1.5">
                      <span class="w-4 h-4 rounded bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                        <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12h20M6 8v8M18 8v8M4 10v4M20 10v4"/></svg>
                      </span>
                      <span>Workout Session</span>
                    </span>
                    <span class="text-[9px] text-slate-400 font-bold">${isCurrentActiveDay ? 'In Progress' : (hasLoggedWorkout ? 'Completed' : 'Scheduled')}</span>
                  </div>

                  ${isCurrentActiveDay ? `
                    <button type="button" onclick="appActions.closeDateActionModal(); appActions.navigate('logger')" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[10px] flex items-center justify-center space-x-1.5 tactile shadow">
                      <span>Resume Active Workout</span>
                      <span>&rarr;</span>
                    </button>
                  ` : (hasLoggedWorkout ? `
                    <div class="grid grid-cols-2 gap-1.5 pt-0.5">
                      <button type="button" onclick="appActions.viewCompletedSession('${k}')" class="py-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl font-bold text-[10px] tactile">
                        Review Log
                      </button>
                      <button type="button" onclick="appActions.editCompletedSession('${k}')" class="py-2 bg-card-sub border border-sub text-slate-200 rounded-xl font-bold text-[10px] tactile">
                        Edit Sets
                      </button>
                    </div>
                  ` : `
                    <div class="space-y-1.5 pt-0.5">
                      ${firstMissed ? `
                        <div class="grid grid-cols-2 gap-1.5">
                          <button type="button" onclick="state.selectedDay=${d}; appActions.initStaging({ mode: 'catchup', splitName: '${firstMissed.splitName.replace(/'/g, "\\'")}' })" class="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[9.5px] leading-tight text-center tactile shadow">
                            <div class="text-[8px] uppercase opacity-80">Catch Up (${firstMissed.dayName})</div>
                            <div class="truncate">${firstMissed.splitName}</div>
                          </button>
                          <button type="button" onclick="state.selectedDay=${d}; appActions.initStaging({ mode: 'plan' })" class="py-2 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-[9.5px] leading-tight text-center tactile shadow">
                            <div class="text-[8px] uppercase opacity-80">Today's Split</div>
                            <div class="truncate">${focus}</div>
                          </button>
                        </div>
                      ` : `
                        <button type="button" onclick="state.selectedDay=${d}; appActions.initStaging({ mode: 'plan' })" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-[10px] flex items-center justify-center space-x-1.5 tactile shadow">
                          <span>Continue Plan</span>
                          <span>&rarr;</span>
                        </button>
                      `}
                      <div class="grid grid-cols-2 gap-1.5">
                        <button type="button" onclick="state.selectedDay=${d}; appActions.initStaging({ mode: 'custom' })" class="py-1.5 bg-card-sub hover:bg-slate-800 border border-sub text-slate-200 rounded-xl font-bold text-[9.5px] tactile">
                          Custom Session
                        </button>
                        <button type="button" onclick="state.selectedDay=${d}; appActions.initStaging({ mode: 'blank' })" class="py-1.5 bg-card-sub hover:bg-slate-800 border border-sub text-slate-300 rounded-xl font-bold text-[9.5px] tactile">
                          Blank Slate
                        </button>
                      </div>
                    </div>
                  `)}
                </div>

                <div class="bg-input p-3 rounded-2xl border border-sub space-y-1.5">
                  <div class="flex justify-between items-center text-[10px]">
                    <span class="text-emerald-300 font-bold uppercase flex items-center space-x-1.5">
                      <span class="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300"><svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg></span>
                      <span>Nutrition & Macros</span>
                    </span>
                    <span class="text-slate-300 font-bold text-[10px]">${log.nutrition?.totals?.kcal ? log.nutrition.totals.kcal + ' kcal (' + (log.nutrition.totals.p || 0) + 'g P)' : 'Not Logged'}</span>
                  </div>
                  <button type="button" onclick="appActions.openNutritionForDate('${k}')" class="w-full py-2 bg-card-sub hover:bg-slate-900 border border-sub text-emerald-300 rounded-xl font-bold text-[10px] flex items-center justify-center space-x-1.5 tactile">
                    <span>${log.nutrition?.totals?.kcal ? 'View / Add Foods' : 'Log Meals & Macros'}</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Planner Modal
      if (state.plannerModal.open) {
        const { ex, mods, exIdx, weight, reps, rpe, withMods, savedMsg } = state.plannerModal;
        const cleanRpe = roundRpe(rpe);
        const pE1 = getE1RM(weight, reps, cleanRpe);
        const pPct = (pE1 && Number(weight)) ? Math.round((Number(weight) / pE1) * 1000) / 10 : getPct(reps, cleanRpe);
        const history = getLiftHistory(ex, withMods, mods);

        const historyHtml = history.length ? history.map(h => {
          const modText = h.modifiers && h.modifiers.length ? `[${h.modifiers.join(', ')}]` : 'Standard';
          const setDetails = (h.sets || [])
            .filter(s => s && s.done)
            .map(s => `${s.actualWeight}x${s.actualReps}${s.actualRpe || s.rpe ? `@${s.actualRpe || s.rpe}` : ''}`)
            .join(', ');

          return `
            <div class="bg-input p-2 rounded-xl border border-sub space-y-1">
              <div class="flex justify-between items-center text-[10px]">
                <span class="font-bold text-white">${h.date}</span>
                <span class="text-accent font-bold">${h.topE1 ? h.topE1 + ' lbs e1RM' : ''}</span>
              </div>
              <div class="flex justify-between items-center text-[9px] text-slate-400">
                <span class="truncate max-w-[170px]">${modText} • ${h.scheme}</span>
                <span class="text-slate-300 font-mono">${setDetails || `${h.totalReps} reps`}</span>
              </div>
            </div>
          `;
        }).join('') : `<div class="text-center py-4 text-slate-500 text-[10px]">No completed sessions found for this ${withMods ? 'variant tag' : 'movement'}.</div>`;
// Build Planner Load Calculator Drawer
    let plannerCalcHtml = '';
    if (state.plannerCalcOpen) {
      const calc = state.plannerCalcState || { reps: 8, rpe: 8.0, modPct: 0, directPct: '' };
      const baseE1rm = Number(pE1 || 0);
      const rounding = Number(state.settings?.rounding) || 5;

      let effectivePct = 0;
      if (calc.directPct !== '' && !isNaN(Number(calc.directPct))) {
        effectivePct = Number(calc.directPct);
      } else {
  const rawPct = typeof getPct === 'function' ? getPct(Number(calc.reps) || 8, Number(calc.rpe) || 8.0) : 80.7;
  const basePct = rawPct <= 1 ? rawPct * 100 : rawPct;
  effectivePct = Math.round((basePct + (Number(calc.modPct) || 0)) * 10) / 10;
}

      const calculatedLoad = baseE1rm > 0 
        ? (typeof roundLoad === 'function' ? roundLoad(baseE1rm * (effectivePct / 100), rounding) : Math.round((baseE1rm * (effectivePct / 100)) / rounding) * rounding) 
        : 0;

      let rpeOptions = '';
      [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0].forEach(r => {
        rpeOptions += `<option value="${r}" ${Number(calc.rpe) === r ? 'selected' : ''}>@${r.toFixed(1)}</option>`;
      });

      plannerCalcHtml = `
        <div class="mb-3 p-2.5 rounded-xl bg-card-sub border border-amber-500/30 font-mono space-y-2 text-xs" onclick="event.stopPropagation()">
          <div class="flex justify-between items-center text-[10px]">
            <span class="text-slate-400 uppercase tracking-wider">
              Planner e1RM: <strong class="text-accent">${baseE1rm > 0 ? baseE1rm + ' lbs' : 'None'}</strong>
            </span>
            <span class="text-xs font-bold text-amber-300">
              Result: <span class="text-white text-sm font-bold">${calculatedLoad} lbs</span> @ ${effectivePct.toFixed(1)}%
            </span>
          </div>

          <div class="grid grid-cols-4 gap-1.5">
            <div>
              <label class="block text-[8px] uppercase text-slate-400 mb-0.5">Reps</label>
              <input type="number" min="1" max="30" value="${calc.reps}" 
                onchange="appActions.updatePlannerCalc('reps', Number(this.value))"
                class="w-full bg-input border border-sub rounded-lg py-1 text-center text-white text-xs font-bold focus:outline-none">
            </div>
            <div>
              <label class="block text-[8px] uppercase text-slate-400 mb-0.5">RPE</label>
              <select onchange="appActions.updatePlannerCalc('rpe', Number(this.value))"
                class="w-full bg-input border border-sub rounded-lg py-1 text-center text-accent text-xs font-bold focus:outline-none">
                ${rpeOptions}
              </select>
            </div>
            <div>
              <label class="block text-[8px] uppercase text-slate-400 mb-0.5">% Mod</label>
              <input type="number" step="0.5" value="${calc.modPct || 0}" placeholder="±%" 
                onchange="appActions.updatePlannerCalc('modPct', Number(this.value))"
                class="w-full bg-input border border-sub rounded-lg py-1 text-center text-amber-400 text-xs font-bold focus:outline-none">
            </div>
            <div>
              <label class="block text-[8px] uppercase text-slate-400 mb-0.5">Direct %</label>
              <input type="number" step="1" value="${calc.directPct}" placeholder="Auto" 
                oninput="appActions.updatePlannerCalc('directPct', this.value)"
                class="w-full bg-input border border-sub rounded-lg py-1 text-center text-blue-300 text-xs font-bold focus:outline-none">
            </div>
          </div>

          <div class="flex justify-between items-center pt-1 border-t border-sub/50">
            <span class="text-[9px] text-slate-500">
              ${calc.directPct ? 'Direct % active' : `${calc.reps}r @${Number(calc.rpe).toFixed(1)} ${Number(calc.modPct) >= 0 ? '+' : ''}${calc.modPct}%`}
            </span>
            <button type="button" 
              onclick="appActions.applyPlannerCalc(${calculatedLoad}, ${Number(calc.reps) || 8})"
              class="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold shadow-sm transition-colors">
              ↳ Apply to Planner Input
            </button>
          </div>
        </div>
      `;
    }
        html += `
        <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto" onclick="event.stopPropagation()">
          <div class="bg-card border border-sub rounded-3xl w-full max-w-sm p-4 space-y-3 shadow-2xl my-auto text-xs font-mono max-h-[88vh] flex flex-col">
            
            <div class="flex justify-between items-center border-b border-sub pb-2">
              <div>
                <span class="font-bold text-accent text-sm">📊 Planner: ${ex}</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <button type="button" onclick="appActions.openRpeMatrixModal('${ex}')" class="p-1.5 rounded-lg bg-input border border-sub text-slate-300 hover:text-accent tactile" title="RPE Matrix">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </button>
                <button type="button" onclick="appActions.togglePlannerCalc()" title="Load Calculator" class="p-1.5 rounded-lg border transition-colors flex items-center justify-center tactile ${state.plannerCalcOpen ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm' : 'bg-input text-slate-300 hover:text-amber-400 border-sub'}">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </button>
                <button type="button" onclick="appActions.closePlanner()" class="p-1.5 rounded-lg bg-input border border-sub text-slate-400 hover:text-white leading-none tactile">✕</button>
              </div>
            </div>

              ${plannerCalcHtml}

              ${savedMsg ? `
                <div class="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-[10px] text-center font-bold animate-pulse">
                  ${savedMsg}
                </div>
              ` : ''}

              <div class="grid grid-cols-12 gap-1.5">
                <div class="col-span-4">
                  <label class="text-[9px] text-slate-400 uppercase">Weight</label>
                  <input type="number" step="2.5" value="${weight}" oninput="appActions.updatePlannerInput('weight', this.value)" class="w-full bg-input border border-sub rounded-xl p-2 text-white text-center font-bold mt-0.5 focus:outline-none">
                </div>
                <div class="col-span-4">
                  <label class="text-[9px] text-slate-400 uppercase">Reps</label>
                  <input type="number" min="1" max="25" value="${reps}" oninput="appActions.updatePlannerInput('reps', this.value)" class="w-full bg-input border border-sub rounded-xl p-2 text-white text-center font-bold mt-0.5 focus:outline-none">
                </div>
                <div class="col-span-4">
                  <label class="text-[9px] text-slate-400 uppercase">RPE</label>
                  <select onchange="appActions.updatePlannerInput('rpe', this.value)" class="w-full bg-input border border-sub rounded-xl p-2 text-white text-xs mt-0.5 focus:outline-none font-bold">
                    <option value="5.5" ${cleanRpe <= 5.5 ? 'selected' : ''}>&lt;6.0</option>
                    ${[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0].map(r => `<option value="${r}" ${cleanRpe === r ? 'selected' : ''}>@${r.toFixed(1)}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="p-2.5 bg-input rounded-2xl border border-sub flex justify-between items-center">
                <div class="text-[10px] text-slate-400">Intensity: <b id="planner-pct-display" class="text-slate-200">${pPct}%</b></div>
                <div id="planner-e1-display" class="text-base font-black text-accent">${pE1} lbs e1RM</div>
              </div>

              <button type="button" onclick="appActions.savePlannerToLift(${exIdx})" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-white text-xs tactile shadow-lg">
                Set ${pE1} lbs as e1RM & Update Targets
              </button>

              <div class="pt-2 border-t border-sub space-y-2 flex-1 min-h-0 flex flex-col">
                <div class="flex justify-between items-center">
                  <span class="text-[10px] text-accent font-bold uppercase">Performance History</span>
                  <button type="button" onclick="appActions.togglePlannerHistoryFilter()" class="text-[9px] bg-input px-2 py-0.5 rounded-lg border border-sub text-slate-300 hover:text-white transition tactile font-bold">
                    ${withMods ? 'Filter: Exact Modifiers' : 'Filter: Base Lift'}
                  </button>
                </div>
                <div class="space-y-1.5 overflow-y-auto max-h-44 pr-1 flex-1">
                  ${historyHtml}
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Copy Modal
      if (state.copyModal.open) {
        const { sourceDateKey, targetYear, targetMonth, targetDay } = state.copyModal;
        html += `
          <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto" onclick="event.stopPropagation()">
            <div class="bg-card border border-sub rounded-3xl w-full max-w-sm p-4 space-y-3 shadow-2xl my-auto text-xs font-mono">
              <div class="flex justify-between items-center border-b border-sub pb-2">
                <span class="font-bold text-white text-sm">📋 Copy Workout Plan</span>
                <button type="button" onclick="appActions.closeCopyModal()" class="text-slate-400 hover:text-white p-1">✕</button>
              </div>
              <div class="space-y-2">
                <div class="text-[11px] text-slate-300">Copy slots from <b class="text-accent">${sourceDateKey}</b> to:</div>
                <div class="grid grid-cols-3 gap-1.5">
                  <input type="number" value="${targetYear}" onchange="appActions.setCopyTarget('targetYear', this.value)" class="bg-input border border-sub rounded-xl p-2 text-white text-center">
                  <select onchange="appActions.setCopyTarget('targetMonth', this.value)" class="bg-input border border-sub rounded-xl p-2 text-white text-xs">
                    ${monthNames.map((m, idx) => `<option value="${idx}" ${targetMonth === idx ? 'selected' : ''}>${m.slice(0,3)}</option>`).join('')}
                  </select>
                  <input type="number" min="1" max="31" value="${targetDay}" onchange="appActions.setCopyTarget('targetDay', this.value)" class="bg-input border border-sub rounded-xl p-2 text-white text-center">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 pt-2">
                <button type="button" onclick="appActions.closeCopyModal()" class="py-2.5 bg-card-sub border border-sub rounded-xl text-slate-300 font-bold tactile">Cancel</button>
                <button type="button" onclick="appActions.confirmCopyTemplate()" class="py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold tactile shadow-lg">Confirm Copy</button>
              </div>
            </div>
          </div>
        `;
      }

      // Finish Modal
      if (state.finishModal.open) {
        const curDur = state.finishModal.dur || 45;
        const curSrpe = roundRpe(state.finishModal.srpe || 7.5);
        const srpePills = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0].map(r => {
          const isSelected = (curSrpe === r) || (r === 5.5 && curSrpe <= 5.5);
          return `
            <button type="button" onclick="appActions.setFinishSrpe(${r})" class="py-2 rounded-xl text-xs font-bold border font-mono transition tactile ${isSelected ? 'bg-blue-600 text-white border-blue-400 shadow' : 'bg-input text-slate-300 border-sub'}">
              ${r === 5.5 ? '&lt;6.0' : r.toFixed(1)}
            </button>
          `;
        }).join('');

        html += `
          <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto" onclick="event.stopPropagation()">
            <div class="bg-card border border-sub rounded-3xl w-full max-w-sm p-4 space-y-3.5 shadow-2xl my-auto text-xs font-mono">
              <div class="flex justify-between items-center border-b border-sub pb-2">
                <span class="font-bold text-white text-sm">🏁 Finish & Save Session</span>
                <button type="button" onclick="appActions.closeFinishModal()" class="text-slate-400 hover:text-white p-1">✕</button>
              </div>
              
              <div class="space-y-3">
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-[10px] uppercase text-slate-400 font-bold">Session Duration</label>
                    <span class="text-xs font-bold text-accent font-mono">${curDur} Minutes</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button type="button" onclick="appActions.adjFinishDur(-5)" class="px-3 py-2 bg-input border border-sub rounded-xl text-slate-300 font-bold tactile hover:text-white">-5m</button>
                    <input type="number" value="${curDur}" oninput="appActions.setFinishDur(this.value)" class="flex-1 bg-input border border-sub rounded-xl p-2 text-white font-mono text-center text-sm focus:outline-none font-bold">
                    <button type="button" onclick="appActions.adjFinishDur(5)" class="px-3 py-2 bg-input border border-sub rounded-xl text-slate-300 font-bold tactile hover:text-white">+5m</button>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <div class="flex justify-between items-center">
                    <span class="text-[10px] uppercase text-slate-400 font-bold">Session Foster RPE (sRPE)</span>
                    <span class="font-bold text-accent text-xs">${curSrpe <= 5.5 ? '&lt;6.0' : curSrpe.toFixed(1)} / 10</span>
                  </div>
                  <div class="grid grid-cols-5 gap-1.5 pt-0.5">
                    ${srpePills}
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-1 border-t border-sub/60">
                <button type="button" onclick="appActions.closeFinishModal()" class="py-2.5 bg-card-sub border border-sub rounded-xl text-slate-300 font-bold tactile">Resume</button>
                <button type="button" onclick="appActions.confirmFinishSession()" class="py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold tactile shadow-lg">Confirm & Save</button>
              </div>
            </div>
          </div>
        `;
      }

      // Supabase Auth Modal
      if (state.authModal.open) {
        html += `
          <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto" onclick="event.stopPropagation()">
            <div class="bg-card border border-sub rounded-3xl w-full max-w-sm p-4 space-y-3 shadow-2xl my-auto max-h-[88vh] overflow-y-auto font-mono text-xs">
              <div class="flex justify-between items-center border-b border-sub pb-2">
                <span class="text-xs font-bold text-white">☁️ Supabase Cloud Sync</span>
                <button type="button" onclick="appActions.closeAuthModal()" class="text-slate-400 hover:text-white p-1">✕</button>
              </div>

              ${state.authModal.msg ? `
                <div class="p-2.5 rounded-xl text-[11px] leading-tight ${state.authModal.msgType === 'err' ? 'bg-red-950/60 border border-red-800 text-red-300' : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'}">
                  ${state.authModal.msg}
                </div>
              ` : ''}

              ${state.user ? `
                <div class="space-y-2">
                  <div class="p-2.5 bg-input rounded-2xl border border-sub">
                    <div class="text-[10px] text-slate-400">Account Logged In:</div>
                    <div class="text-emerald-400 font-bold truncate">${state.user.email}</div>
                    <div class="text-[9px] text-blue-400 mt-0.5">⚡ Realtime Sync Active</div>
                  </div>
                  <button type="button" onclick="window.pushToCloud(true)" class="w-full py-2.5 bg-emerald-600 font-bold rounded-2xl text-white tactile shadow-md">
                    Force Sync to Cloud &rarr;
                  </button>
                  <button type="button" onclick="window.pullFromCloud(true)" class="w-full py-2.5 bg-blue-600 font-bold rounded-2xl text-white tactile shadow-md">
                    Pull Latest Data &rarr;
                  </button>
                  <button type="button" onclick="appActions.handleSignOut()" class="w-full py-2 bg-card-sub text-red-400 rounded-2xl border border-sub tactile">
                    Log Out
                  </button>
                </div>
              ` : `
                <div class="space-y-2.5">
                  <div class="flex justify-between items-center text-[10px] text-slate-400 pb-1">
                    <span class="text-emerald-400 font-semibold">✓ Anon Public Key Embedded</span>
                  </div>

                  <div class="grid grid-cols-2 gap-1 p-1 bg-input rounded-2xl border border-sub">
                    <button type="button" onclick="appActions.setAuthMode('login')" class="py-1.5 rounded-xl text-center font-bold tactile ${state.authModal.mode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}">Sign In</button>
                    <button type="button" onclick="appActions.setAuthMode('signup')" class="py-1.5 rounded-xl text-center font-bold tactile ${state.authModal.mode === 'signup' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}">Sign Up</button>
                  </div>
                  <div>
                    <label class="text-[9px] text-slate-400 uppercase">Email</label>
                    <input type="email" value="${state.authModal.email || ''}" oninput="appActions.setAuthEmail(this.value)" class="w-full bg-input border border-sub rounded-xl p-2 text-white focus:outline-none mt-0.5 font-mono">
                  </div>
                  <div>
                    <label class="text-[9px] text-slate-400 uppercase">Password</label>
                    <input type="password" value="${state.authModal.password || ''}" oninput="appActions.setAuthPassword(this.value)" class="w-full bg-input border border-sub rounded-xl p-2 text-white focus:outline-none mt-0.5 font-mono">
                  </div>
                  <button type="button" onclick="appActions.handleAuthSubmit()" class="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-2xl text-white text-xs transition tactile shadow-lg">
                    ${state.authModal.mode === 'login' ? 'Sign In & Connect' : 'Create Account'}
                  </button>
                </div>
              `}
            </div>
          </div>
        `;
      }

      // Movement Config / Add Modal
      if (state.modal.open) {
        const catOptions = Object.keys(state.exercises || {}).map(c => `
          <option value="${c}" ${state.modal.cat === c ? 'selected' : ''}>${c}</option>
        `).join('');

        const exOptions = (state.exercises[state.modal.cat] || []).map(e => `
          <option value="${e}" ${state.modal.ex === e ? 'selected' : ''}>${e}</option>
        `).join('');

        const cleanModalMods = sanitizeModifiers(state.modal.mods);
        const modifierSections = (state.modifierCats || []).map(cat => `
          <div class="space-y-1">
            <span class="text-[8px] font-mono uppercase text-slate-400 font-bold">${cat.name}</span>
            <div class="flex flex-wrap gap-1">
              ${cat.opts.map(opt => `
                <button type="button" onclick="appActions.toggleMod('${opt}')" class="text-[9px] px-2 py-0.5 rounded-lg font-mono transition tactile ${cleanModalMods.includes(opt) ? 'bg-slate-200 text-black font-bold shadow' : 'bg-input text-slate-400 border border-sub'}">
                  ${opt}
                </button>
              `).join('')}
            </div>
          </div>
        `).join('');

        html += `
          <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto" onclick="event.stopPropagation()">
            <div class="bg-card border border-sub rounded-3xl w-full max-w-sm p-4 space-y-3 shadow-2xl my-auto max-h-[88vh] overflow-y-auto font-mono text-xs">
              <div class="flex justify-between font-bold border-b border-sub pb-2 text-slate-200">
                <span>${state.modal.isSplitEditor ? '+ Add Slot to Blueprint' : (state.modal.isNew ? '+ Add Movement' : 'Configure Movement')}</span>
                <button type="button" onclick="appActions.closeModal()" class="text-slate-400 hover:text-white p-1">✕</button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[9px] text-slate-400 uppercase">Category</label>
                  <select onchange="appActions.onModalCatChange(this.value)" class="w-full bg-input border border-sub rounded-xl p-1.5 text-white mt-0.5 focus:outline-none">
                    ${catOptions}
                  </select>
                </div>
                <div>
                  <label class="text-[9px] text-slate-400 uppercase">Exercise</label>
                  <select onchange="appActions.setModalEx(this.value)" class="w-full bg-input border border-sub rounded-xl p-1.5 text-white mt-0.5 focus:outline-none">
                    ${exOptions}
                  </select>
                </div>
              </div>

              <div class="space-y-1.5 pt-1 border-t border-sub/60">
                <div class="flex justify-between items-center text-[10px]">
                  <span class="text-slate-400 font-semibold uppercase">Prescription Scheme:</span>
                  <select onchange="appActions.setModalScheme(this.value)" class="bg-input border border-sub rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none max-w-[210px] truncate font-bold text-xs">
                    <optgroup label="Hypertrophy Schemes">
                      ${(hypertrophySchemes || []).map(s => `<option value="${s}" ${state.modal.scheme === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </optgroup>
                    <optgroup label="Strength & Force Schemes">
                      ${(strengthSchemes || []).map(s => `<option value="${s}" ${state.modal.scheme === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div class="space-y-2 max-h-40 overflow-y-auto pr-1 border-t border-sub/50 pt-1.5">${modifierSections}</div>
              <button type="button" onclick="appActions.applyConfig()" class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-bold text-white transition tactile shadow-lg">
                ${state.modal.isSplitEditor ? 'Add Slot to Blueprint' : (state.modal.isNew ? 'Add Movement & Build Sets' : 'Apply Configuration')}
              </button>
            </div>
          </div>
        `;
      }

      // PR Ledger Modal
     if (state.screen === 'prs') {
  const filterLift = state.prLedgerModal?.filterLift || 'All';
        const allPrLifts = Array.from(new Set((state.prLedger || []).map(p => p.lift))).sort();
        const filteredPRs = (state.prLedger || []).filter(p => filterLift === 'All' || p.lift === filterLift);

        html += `
        <main class="flex-1 min-h-0 overflow-y-auto space-y-3 w-full pr-0.5" onclick="appActions.closeCardMenu()">
      <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono w-full">
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          PR Tracking
        </span>
        <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
      </div>

              <div class="flex justify-between items-center">
                <span class="text-[10px] text-slate-400 uppercase font-bold">Filter Lift:</span>
                <select onchange="appActions.setPrLedgerFilter(this.value)" class="bg-input border border-sub rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:outline-none max-w-[200px] truncate font-bold">
                  <option value="All" ${filterLift === 'All' ? 'selected' : ''}>All Achievements (${state.prLedger?.length || 0})</option>
                  ${allPrLifts.map(l => `<option value="${l}" ${filterLift === l ? 'selected' : ''}>${l}</option>`).join('')}
                </select>
              </div>

              <div class="space-y-1.5 pr-1 pb-24">
                ${filteredPRs.length ? filteredPRs.map(pr => `
                  <div class="bg-input p-2.5 rounded-xl border border-sub flex justify-between items-center">
                    <div>
                      <div class="font-bold text-white text-xs">${pr.lift}</div>
                      <div class="text-[9px] text-slate-400 mt-0.5">${pr.date} • Prior: ${pr.oldVal}lbs</div>
                    </div>
                    <div class="text-right">
                      <div class="text-amber-300 font-black text-sm">${pr.newVal}lbs</div>
                      <span class="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/50 px-1 py-0.2 rounded font-bold">+${pr.diff}lbs PR</span>
                    </div>
                  </div>
                `).join('') : `<div class="text-center py-6 text-slate-500">No PR records logged yet.</div>`}
              </div>
            </main>
        `;
      }

      html += `
        <footer class="pt-2 border-t border-sub/50 flex justify-between items-center text-[9px] font-mono text-slate-500 shrink-0" onclick="appActions.closeCardMenu()">
          <span>APEX Training Engine ${core.APP_VERSION || 'v4.6.5-PWA'}</span>
          <span>${state.user ? '☁️ Connected (' + state.user.email.split('@')[0] + ')' : '⚡ Offline PWA Mode'}</span>
        </footer>
      `;
      if (state.rpeMatrixModal && state.rpeMatrixModal.open) {
  html += `
    <div class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 backdrop-blur-sm animate-fade">
      <div class="bg-card border border-sub rounded-2xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-3 shadow-2xl">
        <div class="flex justify-between items-center border-b border-sub pb-2">
          <span class="font-bold text-sm text-white font-mono">${state.rpeMatrixModal.exName}</span>
          <button type="button" onclick="appActions.closeRpeMatrixModal()" class="text-slate-400 hover:text-white text-base">✕</button>
        </div>
        ${renderRpeMatrixComponent({ title: state.rpeMatrixModal.exName, sets: state.rpeMatrixModal.sets, isModal: true })}
      </div>
    </div>
  `;
}
      if (state.schemeInfoModal && state.schemeInfoModal.open) {
        html += `
          <div class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 backdrop-blur-sm" onclick="appActions.closeSchemeInfoModal()">
            <div class="bg-card border border-sub rounded-3xl p-4 w-full max-w-sm space-y-3 shadow-2xl font-mono text-xs" onclick="event.stopPropagation()">
              <div class="flex justify-between items-center border-b border-sub pb-2">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span class="font-bold text-sm text-white">${state.schemeInfoModal.scheme}</span>
                </div>
                <button type="button" onclick="appActions.closeSchemeInfoModal()" class="text-slate-400 hover:text-white text-base">✕</button>
              </div>
              <div class="flex items-center justify-between text-[10px] text-slate-400 bg-input px-3 py-1.5 rounded-xl border border-sub">
                <span>Pattern: <b class="text-slate-200 capitalize">${String(state.schemeInfoModal.pattern || 'straight').replace('_', ' ')}</b></span>
                <span>Target Rest: <b class="text-accent">${state.schemeInfoModal.restSeconds || 120}s</b></span>
              </div>
              <div class="p-3 bg-input/70 rounded-2xl border border-sub text-[11px] text-slate-200 leading-relaxed">
                ${state.schemeInfoModal.text}
              </div>
              <button type="button" onclick="appActions.closeSchemeInfoModal()" class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tactile">
                Got It
              </button>
            </div>
          </div>
        `;
      }
html += renderBottomNav();
      app.innerHTML = html;

      const nextMain = app.querySelector('main');
      if (nextMain && state.screen && state.screenScrolls[state.screen] !== undefined) {
        nextMain.scrollTop = state.screenScrolls[state.screen];
      }
    } catch (renderErr) {
      console.error("Critical render error in APEX Engine:", renderErr);
      const app = document.getElementById('app') || document.body;
      if (app) {
        app.innerHTML = `
          <div class="p-6 text-center space-y-3 font-mono">
            <div class="text-amber-400 font-bold text-sm">Telemetry Calculation Safeguard Tripped</div>
            <div class="text-slate-400 text-xs">${renderErr.message || 'Error processing historical session data.'}</div>
            <button onclick="state.screen='calendar'; window.render();" class="px-4 py-2 bg-blue-600 text-white rounded-2xl text-xs font-bold tactile shadow-lg">
              Return to Calendar
            </button>
          </div>
        `;
      }
    }
  };

  // Multi-Attempt Mobile DOM Bootstrapper
  let bootAttempts = 0;
  function bootApex() {
    bootAttempts++;
    const app = document.getElementById('app');
    if (!app) {
      if (bootAttempts < 20) {
        setTimeout(bootApex, 50);
      } else {
        console.warn("APEX Engine: '#app' container not found after 20 attempts.");
      }
      return;
    }
    try {
      if (typeof window.initSupabase === 'function') window.initSupabase();
      window.render();
    } catch (err) {
      console.error("APEX Engine Part 4 render failure:", err);
      app.innerHTML = `
        <div class="p-6 text-center space-y-3 font-mono">
          <div class="text-amber-400 font-bold text-sm">Engine State Suspended</div>
          <div class="text-slate-400 text-xs">${err.message || 'Session conflict detected.'}</div>
          <button onclick="localStorage.removeItem('apex_activeWorkout'); location.reload();" class="px-4 py-2 bg-blue-600 text-white rounded-2xl text-xs font-bold tactile shadow-lg">
            Dismiss Active Session & Launch
          </button>
        </div>
      `;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootApex);
  } else {
    bootApex();
  }
})();

/* ================================================================= */
/* APEX AI COACH: ENGINE, DOCTRINES & SETTINGS UI                    */
/* ================================================================= */

const COACH_DOCTRINES = {
  adaptive: {
    title: "Adaptive Intelligence",
    subtitle: "Bottom-Up • Time-to-Peak & Empirical ROI",
    prompt: "You are the APEX Adaptive Intelligence Coach. Be extremely direct and concise. Analyze historical Time-to-Peak (TTP) and session loads. If readiness is compressed (<70%), give precise, uncompromising autoregulation directives (e.g. cut working volume by 2 sets or cap RPE at 8.0). NEVER use LaTeX formatting or math symbols like \\rightarrow—use plain text arrows (->) or bullet points."
  },
  phased: {
    title: "Phased Potentiation",
    subtitle: "Top-Down • Sequential Funnel",
    prompt: "You are the APEX Phased Potentiation Coach. Enforce strict block architecture (Accumulation -> Transmutation -> Realization). Give precise, concise volume/intensity adjustments. NEVER use LaTeX formatting or math symbols like \\rightarrow."
  },
  concurrent: {
    title: "Concurrent Matrix",
    subtitle: "Parallel • Multi-Quality & Variation Rotation",
    prompt: "You are the APEX Concurrent Matrix Coach. Focus on simultaneous force and hypertrophy expression with strategic variation rotation. Keep responses brief, tactical, and data-backed. NEVER use LaTeX formatting or math symbols like \\rightarrow."
  },
  minimalist: {
    title: "High-Output Minimalist",
    subtitle: "Intensity-Driven • Neural Efficiency & Low Volume",
    prompt: "You are the APEX High-Output Minimalist Coach. Zero tolerance for junk volume. Demand high-intensity top sets and immediate backoff set trimming when fatigue accumulates. Keep it ultra-concise. NEVER use LaTeX formatting or math symbols like \\rightarrow."
  }
};

const FALLBACK_GEMINI_MODELS = [
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Deep Reasoning & Math)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Fast Production Default)' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite (Ultra-Low Latency)' }
];

function getApexCoachConfig() {
  let cachedModels = null;
  try {
    cachedModels = JSON.parse(localStorage.getItem('apex_gemini_models_cache'));
  } catch (e) {}

  const modelsList = (Array.isArray(cachedModels) && cachedModels.length) ? cachedModels : FALLBACK_GEMINI_MODELS;
  let savedModel = localStorage.getItem('apex_gemini_model');
  const legacyOrInvalid = !savedModel || /gemini-1\.|gemini-2\.0|gemini-3\.8|gemini-4-argon/i.test(savedModel);

  if (legacyOrInvalid) {
    savedModel = modelsList[0]?.id || 'gemini-2.5-flash';
    localStorage.setItem('apex_gemini_model', savedModel);
  }

  return {
    apiKey: localStorage.getItem('apex_gemini_key') || state.profile?.geminiApiKey || '',
    model: savedModel,
    doctrine: localStorage.getItem('apex_coach_doctrine') || 'adaptive',
    modelsList
  };
}

async function fetchDynamicGeminiModels() {
  const config = getApexCoachConfig();
  if (!config.apiKey) return FALLBACK_GEMINI_MODELS;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`);
    const data = await res.json();
    if (!res.ok || !data.models) throw new Error(data.error?.message || 'Failed to fetch live model list');

    const excludedPattern = /(embedding|imagen|veo|tts|aqa|bison|gecko|vision|learnlm|gemma|robotics|computer-use|-\d{3}$|-\d{4}$)/i;
    const legacyPattern = /^gemini-(1\.0|1\.5|2\.0)/i;

    const validModels = data.models
      .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
      .map(m => {
        const id = m.name.replace('models/', '');
        return { id, name: `${m.displayName || id} (${id})` };
      })
      .filter(m => /^gemini-/i.test(m.id) && !legacyPattern.test(m.id) && !excludedPattern.test(m.id))
      .sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));

    if (validModels.length > 0) {
      localStorage.setItem('apex_gemini_models_cache', JSON.stringify(validModels));
      const curModel = localStorage.getItem('apex_gemini_model');
      if (!validModels.some(m => m.id === curModel)) {
        const preferred = validModels.find(m => /2\.5-flash$/i.test(m.id)) || validModels[0];
        localStorage.setItem('apex_gemini_model', preferred.id);
      }
      return validModels;
    }
    return FALLBACK_GEMINI_MODELS;
  } catch (err) {
    console.warn('Using fallback model list:', err);
    return FALLBACK_GEMINI_MODELS;
  }
}

function buildCoachTelemetryContext() {
  const recentDates = Object.keys(state.dayLogs || {}).sort().slice(-14);
  const recentSummary = recentDates.map(d => {
    const log = state.dayLogs[d] || {};
    const wk = log.workout || {};
    const exList = wk.exercises || log.exercises || [];
    const exSummary = exList.map(ex => {
      const doneSets = (ex.sets || []).filter(s => s && (s.done || s.completed));
      if (!doneSets.length) return null;
      const top = doneSets.reduce((best, cur) => (Number(cur.actualWeight) > Number(best.actualWeight) ? cur : best), doneSets[0]);
      return `${ex.exercise || ex.name}: ${doneSets.length}s (Top: ${top.actualWeight}x${top.actualReps}r @${top.actualRpe})`;
    }).filter(Boolean).join('; ');
    return `${d}: BW=${log.weight || '-'} | Rdy=${log.recovery?.score ? log.recovery.score + '%' : '-'} | sRPE=${wk.srpe || '-'} (${wk.dur || '-'}m) | ${exSummary || 'Rest/No sets'}`;
  }).join('\n');

  const pos = window.apexCore?.getMesocyclePosition ? window.apexCore.getMesocyclePosition(new Date()) : { phase: 'Hypertrophy', week: 1, block: { weeks: 3 } };
  const e1rmSnap = Object.entries(state.e1rms || {}).map(([k, v]) => `${k}: ${v} lbs`).join(', ');

  // Active Phase Rep Targets
  const phaseMatrix = (state.phaseRepMatrix && state.phaseRepMatrix[pos.phase]) || null;
  const repTargetsStr = phaseMatrix
    ? `Main: ${phaseMatrix.Main.min}-${phaseMatrix.Main.max}r | Secondary: ${phaseMatrix.Secondary.min}-${phaseMatrix.Secondary.max}r | Assistance: ${phaseMatrix.Assistance.min}-${phaseMatrix.Assistance.max}r`
    : 'Standard Phase Matrix';

  // 7-Day Bodyweight Trend
  const bwEntries = recentDates.slice(-7).map(d => Number(state.dayLogs[d]?.weight)).filter(w => w > 0);
  const bwTrendStr = bwEntries.length >= 2
    ? `${bwEntries[0]} lbs -> ${bwEntries[bwEntries.length - 1]} lbs (${(bwEntries[bwEntries.length - 1] - bwEntries[0] >= 0 ? '+' : '')}${(bwEntries[bwEntries.length - 1] - bwEntries[0]).toFixed(1)} lbs over ${bwEntries.length} weigh-ins)`
    : `${window.apexCore?.getLatestBodyweight ? window.apexCore.getLatestBodyweight() : '-'} lbs`;

  // Double Progression Status for Active/Staged Movements
  const activeList = (state.activeWorkout && state.activeWorkout.length) ? state.activeWorkout : (state.stagedSlots || []);
  const dpStatusLines = activeList
    .filter(ex => ex && (ex.scheme === 'Double Progression' || state.schemeBlueprints?.[ex.scheme]?.pattern === 'double_progression'))
    .map(ex => {
      const exName = ex.exercise || ex.name;
      const tier = ex.tier || 'Main';
      const bracket = phaseMatrix?.[tier] ? `${phaseMatrix[tier].min}-${phaseMatrix[tier].max}` : '8-12';
      const ev = typeof evaluateDoubleProgression === 'function' ? evaluateDoubleProgression(exName, bracket, 0) : null;
      return ev ? `- ${exName} (${bracket}r): ${ev.status} -> ${ev.coachingCue}` : null;
    }).filter(Boolean).join('\n');

  // 7-Day Nutrition & Adaptive TDEE Summary
  const nut7 = recentDates.slice(-7)
    .map(d => state.dayLogs[d]?.nutrition?.totals)
    .filter(t => t && Number(t.kcal) >= 500);
  const avg7Kcal = nut7.length ? Math.round(nut7.reduce((s, t) => s + Number(t.kcal), 0) / nut7.length) : 0;
  const avg7P = nut7.length ? Math.round(nut7.reduce((s, t) => s + Number(t.p || 0), 0) / nut7.length) : 0;
  const tdeeSnap = window.apexCore?.computeAdaptiveTdee ? window.apexCore.computeAdaptiveTdee(21) : null;
  const nutLine = (avg7Kcal > 0 || tdeeSnap?.ready)
    ? `NUTRITION & ENERGY BALANCE (7D): Avg Intake=${avg7Kcal || '-'} kcal/day, Avg Protein=${avg7P || '-'}g/day${tdeeSnap?.ready ? ` | Adaptive TDEE=${tdeeSnap.estimatedTdee} kcal/day (BW ${tdeeSnap.weeklyBwDelta >= 0 ? '+' : ''}${tdeeSnap.weeklyBwDelta} lbs/wk)` : ''}`
    : '';

  return [
    `LIFTER PROFILE: Age ${state.profile?.age || 40}, Skill: ${state.profile?.skillLevel || 'Advanced'}, 7D BW Trend: ${bwTrendStr}`,
    nutLine,
    `ANCHOR e1RMs: ${e1rmSnap || 'None'}`,
    `ACTIVE BLOCK: Phase: ${pos.phase} | Week ${pos.week} of ${pos.block?.weeks || 3} (Mode: ${pos.block?.progressionMode || 'intensity'})`,
    `PHASE TARGET REP RANGES (${pos.phase}): ${repTargetsStr}`,
    dpStatusLines ? `DOUBLE PROGRESSION STATUS:\n${dpStatusLines}` : '',
    window.getHardwareCoachContext ? window.getHardwareCoachContext() : '',
    `RECENT 14-DAY LOGGED WORKOUTS:\n${recentSummary || 'No recent logs found.'}`
  ].filter(Boolean).join('\n');
}

function formatCoachMarkdown(rawText) {
  if (!rawText) return '';
  let safe = String(rawText)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings (### or ##)
  safe = safe.replace(/^###\s+(.+)$/gm, '<div class="text-accent font-bold text-xs uppercase tracking-wider mt-2.5 mb-1">$1</div>');
  safe = safe.replace(/^##\s+(.+)$/gm, '<div class="text-white font-bold text-xs uppercase tracking-wider border-b border-sub/50 pb-0.5 mt-3 mb-1.5">$1</div>');
  // Bold (**text**)
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
  // Inline code (`text`)
  safe = safe.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-card-sub text-accent border border-sub/60 text-[10px]">$1</code>');
  // Bullet items (* or -)
  safe = safe.replace(/^\s*[-*]\s+(.+)$/gm, '<div class="pl-3 relative before:content-[\'•\'] before:absolute before:left-0 before:text-accent my-0.5">$1</div>');
  // Numbered items (1. )
  safe = safe.replace(/^\s*(\d+\.)\s+(.+)$/gm, '<div class="pl-4 relative my-0.5"><span class="absolute left-0 text-accent font-bold">$1</span>$2</div>');
  // Line breaks
  safe = safe.replace(/\n\n+/g, '<div class="h-2"></div>').replace(/\n/g, '<br>');
  return safe;
}

function renderApexCoachSettingsCard() {
  const config = getApexCoachConfig();
  const activeDoc = COACH_DOCTRINES[config.doctrine] || COACH_DOCTRINES.adaptive;
  const models = config.modelsList || FALLBACK_GEMINI_MODELS;
  const hasCurrentInList = models.some(m => m.id === config.model);

  return `
    <!-- APEX AI Coach Engine Card -->
    <div class="p-4 bg-card-sub rounded-3xl border border-sub space-y-3 shadow-md font-mono text-xs w-full">
      <div class="flex justify-between items-center border-b border-sub pb-2">
        <div>
          <span class="text-[10px] text-accent font-bold uppercase">APEX AI Coach Engine</span>
          <div class="text-[9px] text-slate-400">Bring-your-own-key telemetry analysis & autoregulated block orchestration</div>
        </div>
        <button type="button" onclick="appActions.refreshCoachModels()" class="px-2.5 py-1 bg-input border border-sub rounded-xl text-[10px] text-slate-200 hover:border-accent tactile">
          ↻ Sync Models
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Gemini API Key Input -->
        <div class="space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Gemini API Key (Local Device Only)</label>
          <input type="password" id="apexApiKeyInput" value="${config.apiKey}" placeholder="AIzaSy..."
            class="w-full bg-input border border-sub rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-accent"
            onchange="localStorage.setItem('apex_gemini_key', this.value.trim()); showToast('Gemini API Key Saved');" />
        </div>

        <!-- Live-Fetching Model Dropdown -->
        <div class="space-y-1">
          <label class="text-[9px] text-slate-400 font-bold uppercase">Active Gemini Model (${models.length} Available)</label>
          <select id="apexModelSelect" class="w-full bg-input border border-sub rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-accent"
            onchange="localStorage.setItem('apex_gemini_model', this.value); showToast('Model set to ' + this.value);">
            ${!hasCurrentInList ? `<option value="${config.model}" selected>${config.model} (Active)</option>` : ''}
            ${models.map(m => `<option value="${m.id}" ${m.id === config.model ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Coaching Doctrine Selector -->
      <div class="space-y-1.5 pt-1">
        <label class="text-[9px] text-slate-400 font-bold uppercase">Coaching Philosophy Doctrine</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${Object.entries(COACH_DOCTRINES).map(([key, doc]) => {
            const isSelected = config.doctrine === key;
            return `
              <button type="button" onclick="appActions.setCoachDoctrine('${key}')"
                class="text-left p-2.5 rounded-2xl border transition tactile ${isSelected ? 'bg-accent/15 border-accent text-white shadow-sm' : 'bg-input border-sub text-slate-300 hover:border-slate-500'}">
                <div class="font-bold text-xs flex items-center justify-between">
                  <span>${doc.title}</span>${isSelected ? '<span class="text-accent text-[10px]">● ACTIVE</span>' : ''}
                </div>
                <div class="text-[9px] text-slate-400 mt-0.5">${doc.subtitle}</div>
              </button>
            `;
          }).join('')}
        </div>
        <div class="p-2.5 bg-input rounded-xl border border-sub text-[10px] text-slate-300 leading-relaxed mt-1">
          <span class="font-bold text-accent">${activeDoc.title} Rule:</span> ${activeDoc.prompt.replace(/^You are the APEX [^.]+\.\s*/, '')}
        </div>
      </div>
    </div>
  `;
}

window.appActions = window.appActions || {};
window.appActions.setCoachDoctrine = (doctrineKey) => {
  localStorage.setItem('apex_coach_doctrine', doctrineKey);
  safeCoachToast(`Doctrine: ${COACH_DOCTRINES[doctrineKey]?.title || doctrineKey}`);
  if (typeof window.render === 'function') window.render();
};

/* ================================================================= */
/* APEX AI COACH: SLIDE-UP COMMAND DRAWER & PIPELINE TRIGGERS        */
/* ================================================================= */

state.coachDrawerOpen = false;
state.coachLoading = false;
state.coachHistory = state.coachHistory || [];

const COACH_PIPELINES = [
  {
    id: 'stage_audit',
    label: '⚡ Audit Today\'s Workout',
    desc: 'Check Readiness & Training Load vs. today\'s staged sets',
    buildPrompt: () => {
      const sourceList = (state.activeWorkout && state.activeWorkout.length) ? state.activeWorkout : (state.stagedSlots || []);
      const activeEx = sourceList.map(ex => {
        const exName = ex.exercise || ex.name || 'Movement';
        const sets = (ex.sets || []).map(s => `${s.targetLoad || s.actualWeight || 0}x${s.targetReps || s.actualReps || 0}r @${s.targetRpe || ''}`).join(', ');
        return `- ${exName} (${ex.tier || 'Main'} / ${ex.scheme || 'Straight Sets'}): [${sets || 'Pending set generation'}]`;
      }).join('\n');
      return `Run a Daily Readiness & Stage Audit for today's session.\nSTAGED WORKOUT:\n${activeEx || 'No exercises staged yet.'}\n\nProvide:\n1. **Bottom-Line Action Plan** (exact load/RPE caps or backoff set trims for today).\n2. **Readiness & Fatigue Verdict** (cite my recent sRPE/training load & readiness %).`;
    }
  },
  {
    id: 'overshoot_check',
    label: '🎯 Overshoot & Fatigue Check',
    desc: 'Evaluate logged sets & prescribe exact backoff adjustments',
    buildPrompt: () => {
      const liveEx = (state.activeWorkout || []).map(ex => {
        const exName = ex.exercise || ex.name || 'Movement';
        const done = (ex.sets || []).filter(s => s.done).map((s, i) => `Set ${i+1} DONE: ${s.actualWeight}x${s.actualReps}r @${s.actualRpe} (Target: ${s.targetLoad}x${s.targetReps}r @${s.targetRpe})`).join(' | ');
        const rem = (ex.sets || []).filter(s => !s.done).length;
        return `- ${exName}: ${done || 'None logged'} (${rem} sets remaining)`;
      }).join('\n');
      return `Analyze my live intra-workout performance so far:\n${liveEx || 'No sets completed yet.'}\n\nGive me an immediate **Action Plan** for my remaining sets: keep current backoff weights, apply a -5% load drop off logged weight, or trim a remaining set to protect recovery.`;
    }
  },
  {
    id: 'block_report',
    label: '📊 Run Block Diagnostic Report',
    desc: 'Time-to-Peak (TTP), e1RM deltas & Stimulus-to-Fatigue audit',
    buildPrompt: () => {
      return `Run an End-of-Block Executive Diagnostic Report based on my telemetry.\nStructure with:\n1. **Verdict & Next Move** (extend block, trigger a 1-week deload/pivot, or transition phases).\n2. **e1RM & Progression Audit** (highlight strongest gainers and stalled lifts).\n3. **Fatigue & Readiness Efficiency** (how session RPE/duration correlated with readiness & BW trend).`;
    }
  },
  {
    id: 'architect_block',
    label: '🏗️ Architect Next Mesocycle Block',
    desc: 'Generate a block blueprint using your active Doctrine & Protocols',
    buildPrompt: () => {
      const schemes = Object.keys(state.schemeBlueprints || DEFAULT_SCHEME_BLUEPRINTS || {}).join(', ');
      return `Architect my next 4-week Mesocycle Block strictly following my active Coaching Philosophy Doctrine.\nAVAILABLE PROGRESSION PROTOCOLS: ${schemes}\n\nOutput a concise blueprint with:\n1. **Block Phase & Progression Mode** (Load vs Intensity Wave).\n2. **Primary & Secondary Slots** tailored to my home gym hardware constraints.\n3. **Assigned Protocol, Rep Range, and Target RPE** (in 0.5 increments) for each slot.`;
    }
  }
];

async function askApexCoach(userPrompt, taskType = 'general') {
  const config = getApexCoachConfig();
  if (!config.apiKey) {
    safeCoachToast('Please add your Gemini API Key in Settings first.');
    return '⚠️ Missing Gemini API Key. Open Preferences → APEX AI Coach Engine and paste your API key.';
  }

  const doctrineObj = COACH_DOCTRINES[config.doctrine] || COACH_DOCTRINES.adaptive;
  const systemInstruction = `${doctrineObj.prompt}

OUTPUT RULES:
- Lead immediately with a **Bottom-Line Action Plan** (exact weights, rep targets like \`295x8r @8.0\`, or set trims) before brief rationale.
- Use clean Markdown headers (## / ###), bold callouts, and concise bullet points.
- Use "lbs" for weights, "295x8r" format for sets, and strict 0.5 RPE increments.
- NEVER use LaTeX math mode or backslashes; use plain text arrows (->).`;
  
  let telemetry = '';
  try {
    telemetry = buildCoachTelemetryContext();
  } catch (tErr) {
    console.warn('Telemetry build warning:', tErr);
    telemetry = 'Telemetry snapshot unavailable.';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{
          role: 'user',
          parts: [{ text: `LIFTER TELEMETRY:\n${telemetry}\n\nTASK: ${taskType}\nDIRECTIVE:\n${userPrompt}` }]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2500 }
      })
    });

    clearTimeout(timeoutId);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `HTTP ${res.status}: Failed to call model "${config.model}"`);
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Coach Error:', err);
    if (err.name === 'AbortError') {
      return `⚠️ Request timed out after 45s. Google's API took too long to respond. Try clicking the pipeline button again.`;
    }
    return `⚠️ Coach Error (${config.model}): ${err.message}`;
  }
}

function syncCoachDrawerDOM() {
  let portal = document.getElementById('apexCoachPortal');
  if (!state.coachDrawerOpen) {
    if (portal) portal.remove();
    return;
  }
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'apexCoachPortal';
    document.body.appendChild(portal);
  }

  const config = getApexCoachConfig();
  const docObj = COACH_DOCTRINES[config.doctrine] || COACH_DOCTRINES.adaptive;

  const historyHtml = state.coachHistory.length === 0
    ? `<div class="p-4 bg-input/60 rounded-2xl border border-sub text-slate-400 text-[11px] leading-relaxed text-center">
         Select a one-tap telemetry pipeline above or ask a tactical programming question below.
       </div>`
    : state.coachHistory.map(item => `
        <div class="space-y-1.5 pb-2 border-b border-sub/50">
          <div class="text-[10px] text-accent font-bold uppercase tracking-wider">${item.title}</div>
          <div class="p-3 bg-input rounded-2xl border border-sub text-slate-200 text-[11px] leading-relaxed font-mono">${formatCoachMarkdown(item.response)}</div>
        </div>
      `).join('');

  portal.innerHTML = `
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end" onclick="appActions.toggleCoachDrawer(event)">
      <div class="bg-card border-t border-sub rounded-t-3xl p-3.5 sm:p-5 max-h-[92vh] sm:max-h-[86vh] flex flex-col space-y-2.5 shadow-2xl font-mono text-xs w-full max-w-2xl mx-auto" onclick="event.stopPropagation()">
        
        <!-- Drawer Header -->
        <div class="flex justify-between items-center border-b border-sub pb-2 shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-accent font-bold text-sm">✦ APEX AI COACH</span>
              <span class="text-[9px] px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/40 font-bold uppercase">${docObj.title}</span>
            </div>
            <div class="text-[9px] text-slate-400 mt-0.5">Model: ${config.model} • Live Telemetry Connected</div>
          </div>
          <div class="flex items-center gap-2">
            ${state.coachHistory.length ? `<button type="button" onclick="appActions.clearCoachHistory()" class="px-2 py-1 bg-input border border-sub rounded-lg text-[9px] text-slate-400 hover:text-white">Clear</button>` : ''}
            <button type="button" onclick="appActions.toggleCoachDrawer(event)" class="p-1.5 bg-input border border-sub rounded-xl text-slate-300 hover:text-white">✕</button>
          </div>
        </div>

        <!-- One-Tap Telemetry Pipelines -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0 max-h-[28vh] overflow-y-auto">
          ${COACH_PIPELINES.map(p => `
            <button type="button" onclick="appActions.runCoachPipeline('${p.id}')" ${state.coachLoading ? 'disabled' : ''}
              class="text-left p-2.5 bg-card-sub hover:bg-input border border-sub hover:border-accent rounded-2xl transition tactile group">
              <div class="font-bold text-white text-[11px] group-hover:text-accent transition">${p.label}</div>
              <div class="text-[9px] text-slate-400 truncate mt-0.5">${p.desc}</div>
            </button>
          `).join('')}
        </div>

        <!-- Scrollable Output Feed -->
        <div id="apexCoachFeed" class="flex-1 min-h-[180px] overflow-y-auto space-y-3 pr-1">
          ${state.coachLoading && !state.coachHistory.length ? `
            <div class="p-4 bg-input rounded-2xl border border-accent/40 text-accent text-xs flex items-center justify-center gap-2 animate-pulse">
              <span>✦ Analyzing 14-day telemetry & active block...</span>
            </div>
          ` : ''}
          ${historyHtml}
        </div>

        <!-- Custom Prompt Bar -->
        <div class="flex gap-2 pt-2 border-t border-sub shrink-0">
          <input type="text" id="apexCoachCustomInput" placeholder="Ask about exercise swaps, fatigue, or block tweaks..."
            class="flex-1 bg-input border border-sub rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-accent"
            onkeydown="if(event.key==='Enter') appActions.sendCustomCoachPrompt()" />
          <button type="button" onclick="appActions.sendCustomCoachPrompt()" ${state.coachLoading ? 'disabled' : ''}
            class="px-4 py-2 bg-accent text-black font-bold rounded-xl text-xs tactile">
            Send
          </button>
        </div>

      </div>
    </div>
  `;
}

window.appActions.runCoachPipeline = async (pipelineId) => {
  const pipe = COACH_PIPELINES.find(p => p.id === pipelineId);
  if (!pipe || state.coachLoading) return;

  state.coachLoading = true;
  syncCoachDrawerDOM();

  const reply = await askApexCoach(pipe.buildPrompt(), pipelineId);
  state.coachLoading = false;

  if (reply) {
    state.coachHistory.unshift({ title: pipe.label, response: reply });
  }
  syncCoachDrawerDOM();
};

window.appActions.sendCustomCoachPrompt = async () => {
  const inputEl = document.getElementById('apexCoachCustomInput');
  const text = inputEl ? inputEl.value.trim() : '';
  if (!text || state.coachLoading) return;

  inputEl.value = '';
  state.coachLoading = true;
  
  state.coachHistory.unshift({ title: `Q: ${text}`, response: 'Analyzing telemetry & generating response...' });
  syncCoachDrawerDOM();

  try {
    const reply = await askApexCoach(text, 'custom_query');
    if (reply) {
      state.coachHistory[0] = { title: `Q: ${text}`, response: reply };
    }
  } catch (err) {
    state.coachHistory[0] = { title: `Q: ${text}`, response: `⚠️ Error: ${err.message}` };
  } finally {
    state.coachLoading = false;
    syncCoachDrawerDOM();
  }
};

function safeCoachToast(msg) {
  if (typeof showToast === 'function') {
    showToast(msg);
  } else if (window.apexCore && typeof window.apexCore.showToast === 'function') {
    window.apexCore.showToast(msg);
  } else {
    console.log('[APEX Coach]:', msg);
  }
}

window.appActions.refreshCoachModels = async () => {
  safeCoachToast('Syncing current Gemini models...');
  const models = await fetchDynamicGeminiModels();
  safeCoachToast(`Synced ${models.length} current Gemini models`);
  if (typeof window.render === 'function') window.render();
  if (state.coachDrawerOpen) syncCoachDrawerDOM();
};

window.appActions = window.appActions || {};

window.appActions.toggleCoachDrawer = (e) => {
  if (e && e.stopPropagation) e.stopPropagation();
  state.coachDrawerOpen = !state.coachDrawerOpen;
  syncCoachDrawerDOM();
  if (typeof window.render === 'function') window.render();
};

window.appActions.clearCoachHistory = () => {
  state.coachHistory = [];
  syncCoachDrawerDOM();
};

window.appActions.adjustBlockWeeks = (blockIndex, delta) => {
  const blocks = Array.isArray(state.mesocycle) ? state.mesocycle : [];
  const targetBlock = blocks[blockIndex];
  if (!targetBlock) return;

  const curWeeks = Number(targetBlock.weeks || targetBlock.durationWeeks || 3);
  const nextWeeks = Math.max(1, Math.min(16, curWeeks + delta));
  targetBlock.weeks = nextWeeks;
  targetBlock.durationWeeks = nextWeeks;

  const inputEl = document.getElementById(`blockWeeksInput_${blockIndex}`);
  if (inputEl) inputEl.value = nextWeeks;

  const saveBtn = document.getElementById(`saveBlockBtn_${blockIndex}`);
  if (saveBtn) {
    saveBtn.textContent = 'Save*';
    saveBtn.classList.add('ring-2', 'ring-white');
  }
};

window.appActions.setBlockWeeksExact = (blockIndex, val) => {
  const blocks = Array.isArray(state.mesocycle) ? state.mesocycle : [];
  const targetBlock = blocks[blockIndex];
  if (!targetBlock) return;

  const nextWeeks = Math.max(1, Math.min(16, parseInt(val, 10) || 1));
  targetBlock.weeks = nextWeeks;
  targetBlock.durationWeeks = nextWeeks;

  const saveBtn = document.getElementById(`saveBlockBtn_${blockIndex}`);
  if (saveBtn) {
    saveBtn.textContent = 'Save*';
    saveBtn.classList.add('ring-2', 'ring-white');
  }
};

window.appActions.saveBlockDuration = (blockIndex) => {
  const blocks = Array.isArray(state.mesocycle) ? state.mesocycle : [];
  const targetBlock = blocks[blockIndex];
  if (!targetBlock) return;

  const inputEl = document.getElementById(`blockWeeksInput_${blockIndex}`);
  if (inputEl) {
    const nextWeeks = Math.max(1, Math.min(16, parseInt(inputEl.value, 10) || targetBlock.weeks || 3));
    targetBlock.weeks = nextWeeks;
    targetBlock.durationWeeks = nextWeeks;
  }

  // Persist to localStorage & Supabase sync if available, and recalculate timeline
  if (typeof syncMesocycleTimeline === 'function') syncMesocycleTimeline();
  if (typeof saveState === 'function') saveState();
  if (typeof saveStateToStorage === 'function') saveStateToStorage();
  localStorage.setItem('apex_state', JSON.stringify(state));

  const saveBtn = document.getElementById(`saveBlockBtn_${blockIndex}`);
  if (saveBtn) {
    saveBtn.textContent = '✓ Saved';
    saveBtn.classList.remove('ring-2', 'ring-white');
  }

  if (typeof safeCoachToast === 'function') {
    safeCoachToast(`${targetBlock.phase || 'Block'} saved (${targetBlock.weeks} weeks).`);
  }

  setTimeout(() => {
    if (typeof safeRender === 'function') safeRender();
  }, 600);
};

// ==========================================
// APEX TRAINING ENGINE - MASTER EXPORT BLOCK
// ==========================================
window.apexCore = window.apexCore || {};
window.apexCore.getExerciseLoad = typeof getExerciseLoad === 'function' 
  ? getExerciseLoad 
  : (window.apexCore.getExerciseLoad || function(exName, rawWeight, dateKey) {
      const w = Number(rawWeight) || 0;
      if (!exName) return w;
      const name = String(exName).toLowerCase();
      const bw = Number(window.state?.settings?.bodyweight || window.state?.profile?.bodyweight) || 200;
      // Hardware-aware bodyweight scaling for home gym setup (90% BW for Dips, 100% BW for Pull-Ups)
      if (/\b(dip|dips)\b/.test(name)) return Math.round(w + (bw * 0.9));
      if (/\b(pull-up|pullup|chin-up|chinup)\b/.test(name)) return Math.round(w + bw);
      return w;
    });

// Bind unified global calculators to both window and apexCore
window.getUnifiedE1RM = typeof getUnifiedE1RM === 'function' ? getUnifiedE1RM : function(w, r, rpe, ex) {
  return Number(w) || 0;
};
window.calculate1RmEquivalent = typeof calculate1RmEquivalent === 'function' ? calculate1RmEquivalent : window.getUnifiedE1RM;
window.getPct = typeof getPct === 'function' ? getPct : function(r, rpe) { return 100 - ((r + Math.max(0, 10 - rpe)) - 1) * 2.15; };

window.apexCore.getUnifiedE1RM = window.getUnifiedE1RM;
window.apexCore.calculate1RmEquivalent = window.calculate1RmEquivalent;
window.apexCore.getPct = window.getPct;

console.log("APEX Training Engine: Master Engine Block Initialized Successfully.");

// ============================================================================
// 6. HARDWARE-AWARE EQUIPMENT INVENTORY, DOUBLE PROGRESSION & AI COACH BRIDGE
// ============================================================================

window.APEX_HARDWARE_PROFILE = {
  dumbbells: { maxLoad: 90, minLoad: 5, increment: 5, unit: 'lbs' },
  cablePulley: { ratio: 0.5, increment: 2.5, notes: 'Plate-loaded 2:1 pulley ratio' },
  specialtyBars: ['Safety Squat Bar (SSB)', 'Trap Bar', 'Neutral Grip Swiss Bar', 'EZ Curl Bar'],
  stations: ['Folding Squat Rack', 'Dip Bar Station', 'Adjustable Bench']
};

/**
 * Resolves hardware profile and constraints for a specific movement
 */
function getMovementHardwareBounds(exName = '') {
  const name = String(exName).toLowerCase();
  const isDB = /\b(db|dumbbell|dumbbells)\b/.test(name);
  const isCable = /\b(cable|pulley|pushdown|tricep extension|lat pulldown|face pull)\b/.test(name);
  const isDip = /\b(dip|dips)\b/.test(name);

  return {
    isDB,
    isCable,
    isDip,
    maxLoad: isDB ? window.APEX_HARDWARE_PROFILE.dumbbells.maxLoad : Infinity,
    step: isDB ? 5 : (isCable ? 2.5 : 5)
  };
}

/**
 * Historical Lookback Double Progression Engine
 * Respects existing Exercise Catalog / Phase Builder rep ranges (`repRangeStr`).
 * Locks weight until all logged sets clear the rep ceiling, or pivots at the 90lb DB cap.
 */
function evaluateDoubleProgression(exName, repRangeStr = '8-12', fallbackWeight = 0) {
  const bounds = getMovementHardwareBounds(exName);

  // 1. Parse the active Phase / Library rep bracket (e.g. "8-12" or "10-15r")
  const cleanStr = String(repRangeStr || '8-12').replace(/[^0-9-]/g, '');
  const parts = cleanStr.split('-').map(Number).filter(Boolean);
  const repFloor = parts[0] || 8;
  const repCeiling = parts[1] || parts[0] || 12;

  // 2. Scan Deload-safe workout history via getLiftHistory
  let lastSessionSets = null;
  if (typeof window.apexCore?.getLiftHistory === 'function') {
    const hist = window.apexCore.getLiftHistory(exName, false, [], true);
    const valid = (hist || []).find(h => Array.isArray(h.sets) && h.sets.some(s => s && s.done && Number(s.actualReps) > 0));
    if (valid) {
      lastSessionSets = valid.sets.filter(s => s && s.done && Number(s.actualReps) > 0);
    }
  }

  if (!lastSessionSets) {
    return {
      load: fallbackWeight,
      repTarget: `${repFloor}-${repCeiling}`,
      status: 'BASELINE',
      coachingCue: 'Establish baseline working load within target bracket.'
    };
  }

  // 3. Evaluate previous working load & whether all sets cleared the rep ceiling
  const lastLoad = Math.max(...lastSessionSets.map(s => Number(s.actualWeight) || 0));
  const allClearedCeiling = lastSessionSets.every(
    s => (Number(s.actualReps) || 0) >= repCeiling && (Number(s.actualRpe) || 10) <= 9.5
  );

  if (allClearedCeiling) {
    const proposedLoad = lastLoad + bounds.step;

    // Hardware Cap Check: 90 lb Dumbbell Ceiling
    if (bounds.isDB && proposedLoad > bounds.maxLoad) {
      const expandedFloor = repFloor + 2;
      const expandedCeiling = repCeiling + 3;
      return {
        load: bounds.maxLoad,
        repTarget: `${expandedFloor}-${expandedCeiling}`,
        status: 'HARDWARE_CAP_PIVOT',
        coachingCue: `90lb DB ceiling reached. Locking at 90 lbs and shifting bracket to ${expandedFloor}-${expandedCeiling} reps (or pause/tempo density).`
      };
    }

    return {
      load: proposedLoad,
      repTarget: `${repFloor}-${repCeiling}`,
      status: 'LOAD_INCREASE',
      coachingCue: `Cleared ${repCeiling} reps across all sets last session. Bump load +${bounds.step} lbs and build from ${repFloor} reps.`
    };
  }

  // 4. Default Double Progression Hold: Keep load locked until ceiling is cleared
  return {
    load: lastLoad || fallbackWeight,
    repTarget: `${repFloor}-${repCeiling}`,
    status: 'HOLD_LOAD_BUILD_REPS',
    coachingCue: `Hold at ${lastLoad} lbs until all sets hit ${repCeiling} reps.`
  };
}

/**
 * Generates the Hardware & Progression Context Prompt for the AI Coach
 */
function getHardwareCoachContext() {
  const eq = window.apexCore?.getEquipmentConfig ? window.apexCore.getEquipmentConfig() : {};
  const pairedMax = eq.dumbbells?.pairedMax ?? 90;
  const singleMax = eq.dumbbells?.singleHandleMax ?? 185;
  const ratio = Number(eq.cable?.ratio) === 0.5 ? '2:1 mechanical ratio (effective resistance is 50% of loaded plate weight)' : '1:1 ratio';
  const barsList = Object.entries(eq.bars || {}).map(([k, v]) => `${k} (${v}lb)`).join(', ');

  return [
    `[HOME GYM HARDWARE & PROGRESSION CONSTRAINTS]`,
    `- Paired Dumbbells: Capped at ${pairedMax} lbs max per hand for bilateral presses/flyes/curls.`,
    `- Heavy Loadable Single Dumbbell Handle: Capped at ${singleMax} lbs for DB Rows, Shrugs, Carries, and Single-Arm work.`,
    `- Cable Pulley System: Plate-loaded with a ${ratio}.`,
    `- Owned Bars: ${barsList}.`,
    `- Progression Logic: Double Progression is active. Hold working weight constant across sessions until the top of the assigned rep range is hit on all sets.`
  ].join('\n');
}

// Bind to global and apexCore namespaces
window.apexCore = window.apexCore || {};
window.apexCore.hardwareProfile = window.APEX_HARDWARE_PROFILE;
window.apexCore.getMovementHardwareBounds = getMovementHardwareBounds;
window.apexCore.evaluateDoubleProgression = evaluateDoubleProgression;
window.apexCore.getHardwareCoachContext = getHardwareCoachContext;

window.getMovementHardwareBounds = getMovementHardwareBounds;
window.evaluateDoubleProgression = evaluateDoubleProgression;
window.getHardwareCoachContext = getHardwareCoachContext;

// ==========================================
// SVG PATH SANITIZER & MOBILE CLICK GUARD
// ==========================================
window.sanitizeSvgPath = function(pathStr) {
  if (!pathStr || typeof pathStr !== 'string') return 'M0 0H24V24H0z';
  // Check if string contains NaN or invalid number tokens
  if (pathStr.includes('NaN') || pathStr.includes('undefined')) {
    return 'M0 0H24V24H0z';
  }
  return pathStr;
};
