// ============================================================================
// APEX TRAINING ENGINE - PART 1 OF 4: CORE ARCHITECTURE & FOUNDATIONS
// Production Release v4.6.0-PWA (Neutral Schemes / Multi-Engine / Block Wizard)
// Includes: Strict ISO-8601 Date Standard, Supabase Realtime Channel Sync,
//           Ghost Timer Sanitization, Multi-Variable Block Transition Heuristics,
//           Multi-Formula 1RM Prediction Engine (APEX, Epley, Brzycki, Wathan, Lombardi),
//           Neutral Scheme Nomenclature with Backward Compatibility Aliasing,
//           Strict 0.5 RPE Quantization Engine (<6 / 5.5 to 10.0),
//           Anticipated Target Date Macrocycle Resolver (getMacrocyclePosition),
//           Dual-Bound Phase Rep Matrix & Lift Override Architecture,
//           Resilient Database-Safe Settings Mirroring
// ============================================================================

(function() {
  try {
    const APP_VERSION = 'v4.6.1-PWA';
    const now = new Date();
    const TODAY_YEAR = now.getFullYear();
    const TODAY_MONTH = now.getMonth();
    const TODAY_DATE = now.getDate();

    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];

    const availablePhases = [
      'Accumulation','Hypertrophy','Intensification','Powerbuilding',
      'Strength','Realization / Peaking','Resensitization','DUP','Deload','GPP'
    ];
    
    const availableThemes = ['Midnight', 'Onyx', 'Slate', 'Forest', 'Crimson', 'Nordic', 'Amber', 'Cyberpunk'];
    const availableFonts = ['JetBrains Mono', 'Inter', 'Roboto', 'Geist', 'Cinzel'];

    // Neutralized Scheme Definitions
    const hypertrophySchemes = [
      'Straight Sets',
      'Dynamic Double Progression (Rep Range)',
      'Myo-reps',
      'Rest-Pause (Dogcrapp)',
      'Step Loading (Double Progression)',
      'Density Block',
      'Rep Goal System (Metabolic 50)',
      'Reverse Pyramid',
      'Tapered',
      'Ascending Pyramid',
      'Volume Pyramid',
      'Force/Metabolic Interleave',
      'Drop Set',
      'Hypertrophy Cluster',
      'Ascending Triplet + Load Drop',
      'Ascending RPE Ladder',
      'Intensity Matched'
    ];

    const strengthSchemes = [
      'Top Set + Back-off',
      'Primer Single + % Back-offs',
      'Benchmark + Density Back-Off',
      'Submaximal AMRAP Calibration',
      'Autoregulated Fatigue Stop',
      'Dynamic Effort (Speed Waves)',
      'Intra-Set Cluster (4x[2+2+2])',
      'Autoregulated Fatigue Drop (-5%)',
      'Prescription Table',
      'Wave Loading',
      'Double Pyramid',
      'Sawtooth',
      'Strength Cluster',
      'e1RM Grounding AMRAP',
      'Intensity Matched'
    ];

    // Backward-Compatibility Aliases
    const schemeAliases = {
      'BBM Top Single + % Back-offs': 'Primer Single + % Back-offs',
      'BBM Ascending Ladder': 'Ascending RPE Ladder',
      'RTS Ascending Triplet + Load Drop': 'Ascending Triplet + Load Drop',
      'RTS Benchmark + Density Back-Off': 'Benchmark + Density Back-Off',
      'RTS AMRAP Calibration': 'Submaximal AMRAP Calibration'
    };

    function normalizeSchemeName(rawName) {
      if (!rawName) return 'Straight Sets';
      const clean = String(rawName).trim();
      return schemeAliases[clean] || clean;
    }
function getIcon(name, cls = 'w-4 h-4') {
  const paths = {
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
    builder: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    programs: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    splits: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    periodization: '<path d="m12 2 10 5-10 5-10-5Z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>',
    analytics: '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
    prs: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    movements: '<path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>',
    profile: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    system: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>'
  };

  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
}
    const phaseDescriptions = {
      'Accumulation': 'High-volume base building (8-14 reps) focused on work capacity, connective tissue resilience, and hypertrophy priming.',
      'Hypertrophy': 'Targeted muscle mass accretion (6-12 reps) operating at 2-3 RIR with high mechanical tension and density clusters.',
      'Intensification': 'Load ramping (4-8 reps) bridging hypertrophy to maximal force production while volume systematically tapers.',
      'Powerbuilding': 'Hybrid split balancing heavy compound neural strength openers (1-5 reps) with high-density hypertrophy back-offs.',
      'Strength': 'Maximal neuromuscular recruitment and neural drive (2-5 reps) prioritizing bar velocity and motor unit firing rate.',
      'Realization / Peaking': 'Tapering fatigue to express peak 1RM capability (1-3 reps) with heavy singles and autoregulated anchor AMRAPs.',
      'Resensitization': 'Low-volume, submaximal reset block (6-10 reps) to clear systemic fatigue and restore anabolic sensitivity.',
      'DUP': 'Daily Undulating Periodization alternating strength, power, and hypertrophy focus within each training week.',
      'Deload': 'Active recovery block cutting volume by 40-50% and capping RPE at 6.5 to facilitate supercompensation.',
      'GPP': 'General Physical Preparedness incorporating complexes, core stability, sled medleys, and aerobic base capacity.'
    };

    const schemeDescriptions = {
      'Straight Sets': 'Phase-calibrated sets with consistent baseline volume and autoregulated load.',
      'Dynamic Double Progression (Rep Range)': 'Fixed load across sets; work within a rep window (e.g., 6-8r or 10-12r). Add reps each week; add weight once upper rep limit is achieved across all sets.',
      'Myo-reps': '1 activation set (12-15r @ RPE 9.0) followed by short mini-sets (3-5r) on strict 15-20s rest intervals.',
      'Rest-Pause (Dogcrapp)': '1 all-out activation set followed by two 15-second rest-pause failure clusters.',
      'Step Loading (Double Progression)': 'Fixed weight across sets; reps increase weekly before adding bar weight.',
      'Density Block': 'Target countdown block (7-10 min). Complete as many high-quality sets as possible within the timer.',
      'Rep Goal System (Metabolic 50)': 'Target 50 total accumulated reps across as few sets as possible (1-2 RIR). Optimal for core, calves, and isolation.',
      'Reverse Pyramid': 'Heaviest set first (RPE 8.5-9.0), systematically tapering load (-10% to -15%) as rep targets expand.',
      'Tapered': 'High-intensity opener followed by higher-volume back-off capacity sets (-15% load).',
      'Ascending Pyramid': 'Progressive load ramp across working sets building toward top target intensity.',
      'Volume Pyramid': 'Ascending and descending volume curve peaking intensity midway through sets.',
      'Force/Metabolic Interleave': 'Alternating heavy force-focused efforts with metabolic pump sets.',
      'Drop Set': 'Heavy work sets followed immediately by stripped-load metabolic drop sets.',
      'Hypertrophy Cluster': 'Cluster sets with intra-set density pacing to sustain movement velocity.',
      'Ascending Triplet + Load Drop': 'Ascending effort ramp (x@7.0, x@8.0, x@9.0) followed by a single -5% to -10% down set.',
      'Ascending RPE Ladder': 'Progressive work sets across working RPEs (e.g., 8@6.0, 8@7.0, 8@8.0) building volume and motor unit recruitment.',
      'Top Set + Back-off': '1 primed heavy top set followed by multiple volume back-off sets.',
      'Primer Single + % Back-offs': '1@8.0 primer single calibrating neuromuscular readiness, followed by repeat sets across at -10% to -15% load.',
      'Benchmark + Density Back-Off': 'Benchmark set (1-4@8.0) establishing baseline e1RM, followed by 6x5 @ 70% (-14%) on strict 30-60s rest.',
      'Submaximal AMRAP Calibration': '70% submaximal probe set (10@9.0) directly calibrating 2-4 back-off volume sets of 12 reps at 62%.',
      'Autoregulated Fatigue Stop': 'Repeat sets at target load until RPE crosses the fatigue stop threshold (RPE 9.0).',
      'Dynamic Effort (Speed Waves)': 'Sub-maximal explosive sets (60-70% e1RM) on strict 45-60s rest to train RFD.',
      'Intra-Set Cluster (4x[2+2+2])': 'Short 15-20s pauses within each set to maintain bar velocity with heavy loads.',
      'Autoregulated Fatigue Drop (-5%)': 'Repeat sets at target weight until fatigue triggers an automated -5% load drop.',
      'Prescription Table': 'Technical precision sets focused on acceleration and sub-maximal bar velocity.',
      'Wave Loading': 'Undulating waves building neural drive and post-activation potentiation.',
      'Double Pyramid': 'Ascending and descending load curve across sets peaking at high intensity.',
      'Sawtooth': 'Alternating rep efforts at constant intensity across working sets.',
      'Strength Cluster': 'Intra-cluster rest pauses to sustain maximal force production.',
      'e1RM Grounding AMRAP': 'Warmup ramping into 1 max-rep anchor AMRAP set to ground estimated 1RM.',
      'Intensity Matched': 'Target reps and RPE are fixed; athlete freely selects load on the bar.'
    };

    // Default Dual-Bound Rep Range Matrix (Low/High Bookends)
    const defaultPhaseRepMatrix = {
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

    // Declarative Programming Builder Scheme Recipes (Neutral Names & Strict 0.5 RPE)
    const defaultSchemeRecipes = {
      'Straight Sets': { targetRpe: 7.5, setsCount: 3, enableRpeProgression: true, minReps: 0, maxReps: 0 },
      'Dynamic Double Progression (Rep Range)': { targetRpe: 7.5, setsCount: 3, enableRpeProgression: true, minReps: 0, maxReps: 0 },
      'Myo-reps': { actRpe: 9.0, miniRpe: 9.5, miniSets: 4, intraRestSec: 15, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Rest-Pause (Dogcrapp)': { actRpe: 9.5, clusterRpe: 10.0, clusters: 2, intraRestSec: 15, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Step Loading (Double Progression)': { targetRpe: 8.0, setsCount: 3, enableRpeProgression: true, minReps: 0, maxReps: 0 },
      'Density Block': { targetLoadPct: 65, defaultMinutes: 8, setsCount: 3, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Rep Goal System (Metabolic 50)': { targetLoadPct: 58, repTargets: [15, 13, 12, 10], enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Reverse Pyramid': { topRpe: 8.5, drop1Pct: 10, drop2Pct: 20, drop3Pct: 30, enableRpeProgression: true, minReps: 0, maxReps: 0 },
      'Tapered': { openerRpe: 8.5, backoffRpe: 8.0, backoffLoadPct: 85, enableRpeProgression: true, minReps: 0, maxReps: 0 },
      'Ascending Pyramid': { peakRpe: 8.5, rampStepPct: 9, enableRpeProgression: true, minReps: 0, maxReps: 0 },
      'Volume Pyramid': { apexRpe: 8.5, midRpe: 8.0, baseRpe: 7.5, enableRpeProgression: true, minReps: 0, maxReps: 0 },
      'Force/Metabolic Interleave': { forceRpe: 8.5, metaRpe: 8.5, metaReps: 15, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Drop Set': { workRpe: 8.0, drop1Pct: 20, drop2Pct: 40, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Hypertrophy Cluster': { clusterLoadPct: 75, intraRestSec: 20, setsCount: 3, clusterReps: 6, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Ascending Triplet + Load Drop': { topRpe: 9.0, dropPct: 7, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Ascending RPE Ladder': { startRpe: 5.5, midRpe: 7.0, topRpe: 8.0, enableRpeProgression: false, minReps: 8, maxReps: 8 },
      'Top Set + Back-off': { topRpe: 8.5, backoffRpe: 8.0, backoffDropPct: 10, backoffSets: 3, enableRpeProgression: true, minReps: 0, maxReps: 0 },
      'Primer Single + % Back-offs': { singleRpe: 8.0, singlePct: 92, backoffDropPct: 12, backoffSets: 3, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Benchmark + Density Back-Off': { benchRpe: 8.0, densityDropPct: 14, densitySets: 6, intraRestSec: 45, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Submaximal AMRAP Calibration': { anchorReps: 10, anchorRpe: 9.0, anchorPct: 70, repeatReps: 12, repeatRpe: 7.5, repeatPct: 62, backoffSets: 3, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Autoregulated Fatigue Stop': { targetRpe: 8.0, stopRpe: 9.0, setsCount: 3, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Dynamic Effort (Speed Waves)': { basePct: 65, speedStepPct: 2.5, setsCount: 6, reps: 3, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Intra-Set Cluster (4x[2+2+2])': { loadPct: 85, intraRestSec: 15, setsCount: 3, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Autoregulated Fatigue Drop (-5%)': { topRpe: 8.5, dropPct: 5, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Prescription Table': { targetRpe: 7.5, setsCount: 3, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Wave Loading': { wave1TopRpe: 8.5, wave2TopRpe: 9.0, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Double Pyramid': { peakRpe: 8.5, enableRpeProgression: true, minReps: 0, maxReps: 0 },
      'Sawtooth': { heavyRpe: 8.5, repRpe: 8.0, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Strength Cluster': { loadPct: 88, intraRestSec: 30, setsCount: 4, reps: 2, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'e1RM Grounding AMRAP': { primer1Pct: 65, primer2Pct: 75, anchorRpe: 9.5, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Intensity Matched': { targetRpe: 8.0, setsCount: 3, enableRpeProgression: false, minReps: 0, maxReps: 0 }
    };

    const defaultModifierCats = [
      { name: 'Implement', opts: ['Barbell', 'Swiss Bar', 'Safety Bar', 'Trap Bar', 'Dumbbell', 'Cable', 'EZ Bar'] },
      { name: 'Kit', opts: ['Belt', 'Knee Sleeves', 'Wrist Wraps', 'Lifting Straps', 'BFR Cuffs', 'Chalk', 'Belt Squat Belt'] },
      { name: 'Stance / Grip', opts: ['Close Grip', 'Wide Grip', 'Neutral Grip', 'Hook Grip', 'Mixed Grip', 'Narrow Stance', 'Sumo Stance', 'Wide Stance', 'Heels Elevated'] },
      { name: 'Tempo & Pause', opts: ['1ct Pause', '2ct Pause', '3ct Pause', '300 Tempo', '303 Tempo', 'Speed'] },
      { name: 'Range / Elevation', opts: ['2” Deficit', 'Decline', 'High Pin', 'Low Pin', 'Box', '2 Board'] },
      { name: 'Other', opts: ['Bands', 'Chains', 'Single Arm', 'Single Leg', 'Feet Up'] }
    ];

    const muscleGroupTaxonomy = [
      'Chest', 'Back / Lats', 'Quads', 'Hamstrings', 'Glutes', 
      'Side/Rear Delts', 'Front Delts', 'Triceps', 'Biceps', 'Traps', 'Calves', 'Core'
    ];

    const exerciseMuscleMap = {
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

    const landmarkThresholds = {
      Natural: {
        'Chest': { mv: 4, mev: 8, mav: 16, mrv: 22 },
        'Back / Lats': { mv: 6, mev: 10, mav: 18, mrv: 25 },
        'Quads': { mv: 4, mev: 8, mav: 16, mrv: 22 },
        'Hamstrings': { mv: 3, mev: 6, mav: 14, mrv: 20 },
        'Glutes': { mv: 2, mev: 4, mav: 12, mrv: 18 },
        'Side/Rear Delts': { mv: 6, mev: 10, mav: 20, mrv: 28 },
        'Front Delts': { mv: 0, mev: 0, mav: 8, mrv: 14 },
        'Triceps': { mv: 2, mev: 4, mav: 12, mrv: 18 },
        'Biceps': { mv: 2, mev: 4, mav: 14, mrv: 20 },
        'Traps': { mv: 0, mev: 4, mav: 12, mrv: 20 },
        'Calves': { mv: 4, mev: 6, mav: 14, mrv: 20 },
        'Core': { mv: 0, mev: 4, mav: 12, mrv: 18 }
      },
      Enhanced: {
        'Chest': { mv: 6, mev: 10, mav: 22, mrv: 30 },
        'Back / Lats': { mv: 8, mev: 12, mav: 24, mrv: 34 },
        'Quads': { mv: 6, mev: 10, mav: 20, mrv: 28 },
        'Hamstrings': { mv: 4, mev: 8, mav: 18, mrv: 24 },
        'Glutes': { mv: 4, mev: 6, mav: 16, mrv: 22 },
        'Side/Rear Delts': { mv: 8, mev: 14, mav: 26, mrv: 36 },
        'Front Delts': { mv: 0, mev: 2, mav: 12, mrv: 18 },
        'Triceps': { mv: 4, mev: 6, mav: 16, mrv: 24 },
        'Biceps': { mv: 4, mev: 6, mav: 18, mrv: 26 },
        'Traps': { mv: 2, mev: 6, mav: 16, mrv: 26 },
        'Calves': { mv: 6, mev: 8, mav: 18, mrv: 26 },
        'Core': { mv: 2, mev: 6, mav: 16, mrv: 24 }
      }
    };

    const metricDescs = {
      sleep: { 
        1: '<5 hrs, restless or woke exhausted', 
        2: '5-6 hrs, broken rest', 
        3: '6-7 hrs, manageable baseline', 
        4: '7-8 hrs, solid uninterrupted recovery', 
        5: '>8 hrs, deeply refreshed' 
      },
      pushSoreness: { 
        1: 'Severe chest/delt/tricep soreness', 
        2: 'Heavy stiffness, painful to press', 
        3: 'Moderate tightness, pliable with warmup', 
        4: 'Mild localized tightness', 
        5: 'Zero soreness, fully recovered' 
      },
      pullSoreness: { 
        1: 'Severe back/lat/bicep stiffness', 
        2: 'Heavy stiffness, restricted reach', 
        3: 'Moderate soreness in lats/traps', 
        4: 'Mild fatigue, clears easily', 
        5: 'Zero soreness, primed and fluid' 
      },
      legSoreness: { 
        1: 'Crippling quad/hamstring/glute DOMS', 
        2: 'Heavy soreness, mobility restricted', 
        3: 'Noticeable tightness, manageable', 
        4: 'Mild tightness, pliable', 
        5: 'Legs fresh and explosive' 
      },
      energy: { 
        1: 'Lethargic, flat central drive', 
        2: 'Sluggish, morning brain fog', 
        3: 'Baseline energy, normal focus', 
        4: 'High energy, locked in & primed', 
        5: 'Peak central nervous drive' 
      },
      stress: { 
        1: 'Overwhelmed, severe cognitive friction', 
        2: 'Elevated mental/work pressure', 
        3: 'Moderate background demands', 
        4: 'Low friction, routine under control', 
        5: 'Zero stress, completely calm' 
      },
      motivation: { 
        0: 'No training planned (Scheduled rest day)',
        1: 'Dreading training, zero appetite', 
        2: 'Apathetic, going through the motions', 
        3: 'Neutral, ready to execute plan', 
        4: 'Eager to train, locked in', 
        5: 'Aggressive drive, hungry to load bar' 
      }
    };

    const defaultSplitBlueprints = {
      'Squat & Push Focus': [
        { tier: 'Main', category: 'Knee Dominant', exercise: 'Squat', modifiers: ['2ct Pause'], scheme: 'Top Set + Back-off' },
        { tier: 'Secondary', category: 'Horizontal Push', exercise: 'Incline Bench', modifiers: ['Dumbbell'], scheme: 'Straight Sets' },
        { tier: 'Assistance', category: 'Isolation', exercise: 'Curls', modifiers: ['Cable'], scheme: 'Density Block' }
      ],
      'Bench & Pull Focus': [
        { tier: 'Main', category: 'Horizontal Push', exercise: 'Bench Press', modifiers: ['1ct Pause'], scheme: 'Top Set + Back-off' },
        { tier: 'Secondary', category: 'Horizontal Pull', exercise: 'Chest Supported Row', modifiers: ['Dumbbell'], scheme: 'Reverse Pyramid' },
        { tier: 'Assistance', category: 'Vertical Push', exercise: 'Dips', modifiers: [], scheme: 'Myo-reps' }
      ],
      'Deadlift & Power Focus': [
        { tier: 'Main', category: 'Hip Dominant', exercise: 'Deadlift (conv)', modifiers: ['Trap Bar'], scheme: 'Top Set + Back-off' },
        { tier: 'Secondary', category: 'Vertical Pull', exercise: 'Pull Down', modifiers: ['Cable'], scheme: 'Ascending Pyramid' },
        { tier: 'Assistance', category: 'Isolation', exercise: 'Lateral Raise', modifiers: ['Dumbbell'], scheme: 'Density Block' }
      ],
      'Upper Density Focus': [
        { tier: 'Main', category: 'Horizontal Push', exercise: 'Bench Press', modifiers: ['Swiss Bar'], scheme: 'Ascending Pyramid' },
        { tier: 'Secondary', category: 'Vertical Pull', exercise: 'Pull Down', modifiers: ['Cable'], scheme: 'Density Block' },
        { tier: 'Assistance', category: 'Isolation', exercise: 'Lateral Raise', modifiers: ['Dumbbell'], scheme: 'Myo-reps' }
      ],
      'Lower Hypertrophy Focus': [
        { tier: 'Main', category: 'Knee Dominant', exercise: 'Hack Squat', modifiers: [], scheme: 'Dynamic Double Progression (Rep Range)' },
        { tier: 'Secondary', category: 'Hip Dominant', exercise: 'RDL', modifiers: ['Dumbbell'], scheme: 'Reverse Pyramid' },
        { tier: 'Assistance', category: 'Isolation', exercise: 'Calf Raise', modifiers: [], scheme: 'Rep Goal System (Metabolic 50)' }
      ],
      'GPP & Conditioning': [
        { tier: 'Main GPP', category: 'Core', exercise: 'Ab Wheel', modifiers: [], scheme: 'Rep Goal System (Metabolic 50)' },
        { tier: 'Secondary GPP', category: 'Isolation', exercise: 'Curls', modifiers: ['Dumbbell'], scheme: 'Myo-reps' },
        { tier: 'Conditioning Circuit', category: 'Circuits & GPP', exercise: 'Barbell Complex (RDL+Row+FSq+Press)', modifiers: ['Barbell'], scheme: 'Density Block' }
      ],
      'Rest & Recovery': [
        { tier: 'Active Recovery', category: 'Core', exercise: 'Plank', modifiers: [], scheme: 'Straight Sets' },
        { tier: 'Joint Mobility', category: 'Isolation', exercise: 'Calf Raise', modifiers: [], scheme: 'Straight Sets' }
      ]
    };

    const programPresets = [
      {
        id: 'rts_hyp',
        name: 'RTS 7-Week Hypertrophy',
        author: 'Mike Tuchscherer (RTS)',
        desc: 'Ascending effort ramp-ups (x@7.0, x@8.0, x@9.0) with percentage down sets; 6s down to 4s with Week 4 fatigue-stripped pivot.',
        macro: [
          { id: 1, phase: 'Hypertrophy', weeks: 3 },
          { id: 2, phase: 'Deload', weeks: 1 },
          { id: 3, phase: 'Intensification', weeks: 3 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'GPP & Conditioning', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' }
        }
      },
      {
        id: 'rts_pb',
        name: 'RTS 8-Week Powerbuild',
        author: 'Mike Tuchscherer (RTS)',
        desc: 'Benchmark sets (1-4@8.0) establishing baseline e1RM followed by 70-84% density volume back-offs (30-60s rest) and 70% AMRAP supplemental slots.',
        macro: [
          { id: 1, phase: 'Powerbuilding', weeks: 3 },
          { id: 2, phase: 'Deload', weeks: 1 },
          { id: 3, phase: 'Strength', weeks: 3 },
          { id: 4, phase: 'Deload', weeks: 1 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'GPP & Conditioning', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' }
        }
      },
      {
        id: 'bbm_pb',
        name: 'BBM Powerbuilding I (Gen 2)',
        author: 'Barbell Medicine',
        desc: '1@8.0 Over-warmup singles, -10% to -15% back-offs, RPE 6/7/8 ramping, rep range double progression, and timed non-specific GPP circuits.',
        macro: [
          { id: 1, phase: 'Accumulation', weeks: 4 },
          { id: 2, phase: 'Intensification', weeks: 4 },
          { id: 3, phase: 'Realization / Peaking', weeks: 2 },
          { id: 4, phase: 'Deload', weeks: 1 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'GPP & Conditioning', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' }
        }
      },
      {
        id: 'bbm_bb',
        name: 'BBM Bodybuilding Specialization',
        author: 'Barbell Medicine',
        desc: 'High-density hypertrophy split, RPE 7-8 straight sets, superset pairings, myo-reps, and metabolic trunk/arm circuits.',
        macro: [
          { id: 1, phase: 'Hypertrophy', weeks: 4 },
          { id: 2, phase: 'Accumulation', weeks: 4 },
          { id: 3, phase: 'Resensitization', weeks: 2 },
          { id: 4, phase: 'Deload', weeks: 1 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Lower Hypertrophy Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'GPP & Conditioning', 4: 'Lower Hypertrophy Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' }
        }
      },
      {
        id: 'gzcl',
        name: 'GZCL / GZCLP Powerbuilder',
        author: 'Cody Lefever',
        desc: '3-Tier methodology (T1 Heavy Strength 85-100%, T2 Supplemental 65-85%, T3 Density & Accessories <65%).',
        macro: [
          { id: 1, phase: 'Hypertrophy', weeks: 3 },
          { id: 2, phase: 'Intensification', weeks: 3 },
          { id: 3, phase: 'Strength', weeks: 3 },
          { id: 4, phase: 'Deload', weeks: 1 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'GPP & Conditioning', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' }
        }
      },
      {
        id: 'sbs',
        name: 'Stronger By Science (SBS)',
        author: 'Greg Nuckols',
        desc: 'Daily undulating periodization with autoregulated rep targets and auxiliary movement fatigue modulation.',
        macro: [
          { id: 1, phase: 'Accumulation', weeks: 4 },
          { id: 2, phase: 'Intensification', weeks: 3 },
          { id: 3, phase: 'Realization / Peaking', weeks: 2 },
          { id: 4, phase: 'Deload', weeks: 1 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Upper Density Focus', 4: 'Deadlift & Power Focus', 5: 'GPP & Conditioning', 6: 'Rest & Recovery', 0: 'Rest & Recovery' }
        }
      },
      {
        id: 'rp',
        name: 'RP Hypertrophy Mesocycle',
        author: 'Dr. Mike Israetel',
        desc: 'Strict RIR stepping across mesocycles (3 RIR -> 2 RIR -> 1 RIR -> 0 RIR/Myo-reps -> Deload).',
        macro: [
          { id: 1, phase: 'Accumulation', weeks: 3 },
          { id: 2, phase: 'Hypertrophy', weeks: 3 },
          { id: 3, phase: 'Resensitization', weeks: 2 },
          { id: 4, phase: 'Deload', weeks: 1 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Upper Density Focus', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'GPP & Conditioning', 4: 'Upper Density Focus', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' }
        }
      },
      {
        id: '531',
        name: '5/3/1 Forever / BBB',
        author: 'Jim Wendler',
        desc: 'Submaximal progression with 1@8.0 Primer singles and Boring But Big 5x10 supplemental volume capacity.',
        macro: [
          { id: 1, phase: 'Strength', weeks: 3 },
          { id: 2, phase: 'Accumulation', weeks: 3 },
          { id: 3, phase: 'Deload', weeks: 1 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'GPP & Conditioning', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' }
        }
      },
      {
        id: 'phat',
        name: 'PHAT (Power Hypertrophy Adaptive)',
        author: 'Dr. Layne Norton',
        desc: 'Blends early-week max force neural power days with late-week speed work and high-density hypertrophy sets.',
        macro: [
          { id: 1, phase: 'Hypertrophy', weeks: 4 },
          { id: 2, phase: 'Powerbuilding', weeks: 3 },
          { id: 3, phase: 'Deload', weeks: 1 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Upper Density Focus', 5: 'Lower Hypertrophy Focus', 6: 'GPP & Conditioning', 0: 'Rest & Recovery' }
        }
      },
      {
        id: 'phul',
        name: 'PHUL (Power Hypertrophy Upper Lower)',
        author: 'Brandon Campbell',
        desc: '4-day upper/lower protocol combining compound power work (3-5 reps) with targeted hypertrophy volume (8-15 reps).',
        macro: [
          { id: 1, phase: 'Strength', weeks: 3 },
          { id: 2, phase: 'Hypertrophy', weeks: 3 },
          { id: 3, phase: 'Deload', weeks: 1 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Lower Hypertrophy Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'GPP & Conditioning', 4: 'Lower Hypertrophy Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' }
        }
      },
      {
        id: 'bullmastiff',
        name: 'Bullmastiff Wave Progression',
        author: 'Alexander Bromley',
        desc: '3-week ramping waves with volume accretion leading to auto-regulated + sets and submaximal strength realization.',
        macro: [
          { id: 1, phase: 'Accumulation', weeks: 3 },
          { id: 2, phase: 'Intensification', weeks: 3 },
          { id: 3, phase: 'Realization / Peaking', weeks: 3 },
          { id: 4, phase: 'Deload', weeks: 1 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'GPP & Conditioning', 4: 'Deadlift & Power Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' }
        }
      },
      {
        id: 'nsuns',
        name: 'nSuns Linear Progression',
        author: 'nSuns',
        desc: 'High-volume Tier 1 / Tier 2 paired linear overload with +1 AMRAP top sets and pyramid back-offs.',
        macro: [
          { id: 1, phase: 'Intensification', weeks: 4 },
          { id: 2, phase: 'Strength', weeks: 4 },
          { id: 3, phase: 'Deload', weeks: 1 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Bench & Pull Focus', 2: 'Squat & Push Focus', 3: 'Rest & Recovery', 4: 'Upper Density Focus', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Bench & Pull Focus', 2: 'Squat & Push Focus', 3: 'Upper Density Focus', 4: 'Deadlift & Power Focus', 5: 'GPP & Conditioning', 6: 'Rest & Recovery', 0: 'Rest & Recovery' }
        }
      },
      {
        id: 'nippard',
        name: 'Pure Hypertrophy Science',
        author: 'Jeff Nippard',
        desc: 'Biomechanical stretch-mediated hypertrophy, long muscle length bias, strict tempo control, and integrated myo-reps.',
        macro: [
          { id: 1, phase: 'Hypertrophy', weeks: 4 },
          { id: 2, phase: 'Accumulation', weeks: 3 },
          { id: 3, phase: 'Resensitization', weeks: 2 },
          { id: 4, phase: 'Deload', weeks: 1 }
        ],
        splits: {
          3: { 1: 'Squat & Push Focus', 2: 'Rest & Recovery', 3: 'Bench & Pull Focus', 4: 'Rest & Recovery', 5: 'Deadlift & Power Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          4: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Rest & Recovery', 4: 'Lower Hypertrophy Focus', 5: 'Upper Density Focus', 6: 'Rest & Recovery', 0: 'Rest & Recovery' },
          5: { 1: 'Squat & Push Focus', 2: 'Bench & Pull Focus', 3: 'Upper Density Focus', 4: 'Lower Hypertrophy Focus', 5: 'GPP & Conditioning', 6: 'Rest & Recovery', 0: 'Rest & Recovery' }
        }
      }
    ];

    window.deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      if (window.state) window.state.canInstall = true;
      if (typeof window.render === 'function') window.render();
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    function formatIsoDate(year, monthIndex, dayNumber) {
      const y = Number(year);
      const m = String(Number(monthIndex) + 1).padStart(2, '0');
      const d = String(Number(dayNumber)).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    function getTodayDateString() {
      const d = new Date();
      return formatIsoDate(d.getFullYear(), d.getMonth(), d.getDate());
    }

    function normalizeDateKey(k) {
      if (!k || typeof k !== 'string') return k;
      const parts = k.split('-');
      if (parts.length === 3) {
        return formatIsoDate(parts[0], Number(parts[1]) - 1, parts[2]);
      }
      return k;
    }

    // Strict 0.5 RPE Increment Rounder (5.5 - 10.0)
    function roundRpe(val) {
      const num = Number(val);
      if (isNaN(num) || num < 5.0) return 5.5;
      const clamped = Math.min(10.0, Math.max(5.5, num));
      return Math.round(clamped * 2) / 2;
    }

    // Normalizes input values into strict { min, max } numerical bookends
    function normalizeRepBookends(val, fallbackMin = 6, fallbackMax = 8) {
      if (!val && val !== 0) return { min: fallbackMin, max: fallbackMax };
      if (typeof val === 'number') return { min: val, max: val };
      if (typeof val === 'object') {
        const min = Number(val.min !== undefined ? val.min : fallbackMin) || fallbackMin;
        const max = Number(val.max !== undefined ? val.max : min) || min;
        return { min: Math.min(min, max), max: Math.max(min, max) };
      }
      if (typeof val === 'string') {
        const parts = val.split(/[-–—]/).map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
        if (parts.length === 1) return { min: parts[0], max: parts[0] };
        if (parts.length >= 2) return { min: Math.min(parts[0], parts[1]), max: Math.max(parts[0], parts[1]) };
      }
      return { min: fallbackMin, max: fallbackMax };
    }

    function getSafeInitialDayLogs() {
      try {
        const stored = localStorage.getItem('apex_dayLogs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            const normalized = {};
            Object.keys(parsed).forEach(k => {
              normalized[normalizeDateKey(k)] = parsed[k];
            });
            return normalized;
          }
        }
      } catch(e) {}
      return {};
    }

    function getSafeInitialE1rms() {
      const defaultLifts = { 
        'Squat': 345, 'Bench Press': 265, 'Deadlift (conv)': 425, 
        'Incline Bench': 205, 'Row': 90, 'Chest Supported Row': 90, 
        'Curls': 45, 'Pull Down': 190, 'Dips': 80, 
        'Barbell Complex (RDL+Row+FSq+Press)': 95 
      };
      try {
        const stored = localStorage.getItem('apex_e1rms');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            return { ...defaultLifts, ...parsed };
          }
        }
      } catch(e) {}
      return defaultLifts;
    }

    const state = {
      screen: 'calendar',
      screenScrolls: {},
      drawerOpen: false,
      year: TODAY_YEAR,
      month: TODAY_MONTH,
      selectedDay: TODAY_DATE,
      dateActionModal: { open: false, d: TODAY_DATE },
      restStopwatchSecs: 0,
      restStart: null,
      sessionSecs: 0,
      sStart: null,
      activeWorkoutDay: null,
      activeWorkoutDateKey: null,
      activeWorkout: [],
      collapsedCards: {},
      cardMenuOpen: null,
      sessionPRs: {},
      reviewDateKey: null,
      isEditingHistorical: false,
      historicalDateKey: null,
      savedStaged: {},
      copyModal: { open: false, sourceDateKey: '', targetYear: TODAY_YEAR, targetMonth: TODAY_MONTH, targetDay: TODAY_DATE, sourceSlots: [] },
      toastMsg: '',
      user: null,
      syncStatus: 'offline',
      canInstall: false,
      showInstallGuide: false,
      supabaseConfig: {
        url: 'https://bfswskvbbvwvqqwlfuxe.supabase.co',
        anonKey: 'sb_publishable_aEdmPRyoz9zHXj2dQvkepQ_reYfYTpO'
      },
      authModal: { open: false, mode: 'login', email: '', password: '', msg: '', msgType: '' },
      profile: { age: 40, bodyweight: 196.2, skillLevel: 'Advanced', lifterType: 'Natural' },
      macrocycleStartDate: getTodayDateString(),
      macrocycle: [
        { id: 1, phase: 'Accumulation', weeks: 3 },
        { id: 2, phase: 'Hypertrophy', weeks: 3 },
        { id: 3, phase: 'Intensification', weeks: 3 },
        { id: 4, phase: 'Strength', weeks: 3 }
      ],
      activeBlockIdx: 0,
      activeWeek: 1,
      newBlockPhase: 'Accumulation',
      newBlockWeeks: 3,
      weekdaySplit: {
        0: 'Rest & Recovery',
        1: 'Squat & Push Focus',
        2: 'GPP & Conditioning',
        3: 'Bench & Pull Focus',
        4: 'GPP & Conditioning',
        5: 'Deadlift & Power Focus',
        6: 'Rest & Recovery'
      },
      customSplitBlueprints: JSON.parse(JSON.stringify(defaultSplitBlueprints)),
      editingBlueprintName: 'Squat & Push Focus',
      newBlueprintName: '',
      selectedProgramId: 'rts_hyp',
      selectedProgramDays: 4,
      analyticsSelectedLift: 'Squat',
      analyticsCalcWeight: 315,
      analyticsCalcReps: 5,
      analyticsMicrocycle: 'cur_week',
      exercises: {
        'Knee Dominant': ['Squat', 'Belt Squat', 'Bulgarian Split Squat', 'Front Squat', 'Goblet Squat', 'Hack Squat', 'Leg Extensions', 'Lunges'],
        'Hip Dominant': ['Deadlift (conv)', 'Deadlift (sumo)', 'RDL', 'SLDL', 'Hip Thrust', 'Leg Curls', 'Pull Through'],
        'Horizontal Push': ['Bench Press', 'Incline Bench', 'Floor Press', 'Spoto Press', 'Larsen Bench', 'JM Press', 'Push Up', 'Tricep Extension'],
        'Vertical Push': ['Dips', 'BW Dips', 'Standing Military', 'Seated Military', 'Landmine Press'],
        'Horizontal Pull': ['Row', 'Chest Supported Row', 'Cable Row', 'Pendlay Row', 'Seal Row', 'T-Bar Row', 'Face Pull'],
        'Vertical Pull': ['Pull Down', 'Pull Up', 'BW Pull Up', 'Shrugs', 'Upright Row'],
        'Core': ['Ab Wheel', 'Hanging Leg Raise', 'Plank', 'Pallof Press', 'Suitcase Carry'],
        'Isolation': ['Curls', 'Calf Raise', 'Hammer Curl', 'Incline Curl', 'Lateral Raise', 'Lu Raise', 'Tricep Pushdowns'],
        'Circuits & GPP': ['Barbell Complex (RDL+Row+FSq+Press)', 'KB Swing + Pushup Density', 'Sled Drag + Carry Medley']
      },
      exerciseMeta: {
        'Plank': { w: false, r: false, t: true, rpe: true },
        'Push Up': { w: false, r: true, t: false, rpe: true },
        'BW Dips': { w: false, r: true, t: false, rpe: true },
        'BW Pull Up': { w: false, r: true, t: false, rpe: true },
        'Ab Wheel': { w: false, r: true, t: false, rpe: true },
        'Hanging Leg Raise': { w: false, r: true, t: false, rpe: true },
        'Barbell Complex (RDL+Row+FSq+Press)': { w: true, r: true, t: true, rpe: true },
        'KB Swing + Pushup Density': { w: true, r: true, t: true, rpe: true },
        'Suitcase Carry': { w: true, r: false, t: true, rpe: true },
        'Sled Drag + Carry Medley': { w: true, r: false, t: true, rpe: true }
      },
      phaseRepMatrix: JSON.parse(JSON.stringify(defaultPhaseRepMatrix)),
      schemeRecipes: JSON.parse(JSON.stringify(defaultSchemeRecipes)),
      activeRecipeScheme: 'Reverse Pyramid',
      exerciseRepOverrides: {},
      modifierCats: defaultModifierCats,
      settings: {
        theme: 'Midnight',
        fontFamily: 'JetBrains Mono',
        customAccent: '#38bdf8',
        uiScale: 'm',
        rpeTable: 'High Capacity',
        rounding: 5.0,
        progressionType: 'percent',
        progressionRate: 1.5,
        baseOnLastWorkout: true,
        includeTopSingle: false,
        e1rmBlending: 'moderate',
        oneRmFormula: 'apex'
      },
      e1rms: getSafeInitialE1rms(),
      anchorE1rms: getSafeInitialE1rms(),
      prLedger: [],
      dayLogs: getSafeInitialDayLogs(),
      formMetrics: { weight: 196.2, sleep: 3, pushSoreness: 4, pullSoreness: 4, legSoreness: 4, energy: 4, stress: 4, motivation: 4 },
      stagedSlots: [],
      finishModal: { open: false, dur: 45, srpe: 7.5 },
      plannerModal: { open: false, ex: '', mods: [], exIdx: null, weight: 315, reps: 5, rpe: 8.0, withMods: true, savedMsg: '' },
      modal: { open: false, idx: null, isMid: false, isNew: false, isSplitEditor: false, cat: 'Knee Dominant', ex: 'Squat', mods: [], scheme: 'Straight Sets' },
      resTab: 'exercises',
      newExName: '',
      newExCat: 'Knee Dominant',
      newExMeta: { w: true, r: true, t: false, rpe: true },
      newModName: '',
      newModCat: 'Implement',
      wizardModal: { open: false, data: null }
    };

    function getAllValidModifiers() {
      const valid = new Set();
      (state.modifierCats || defaultModifierCats).forEach(c => (c.opts || []).forEach(o => valid.add(o)));
      return valid;
    }

    function sanitizeModifiers(mods) {
      if (!Array.isArray(mods)) return [];
      const valid = getAllValidModifiers();
      return mods.filter(m => valid.has(m));
    }

    // Complete Non-Destructive Offline LocalStorage Rehydration
    try {
      const savedStagedDict = localStorage.getItem('apex_savedStaged');
      if (savedStagedDict) {
        const p = JSON.parse(savedStagedDict);
        if (p && typeof p === 'object') {
          const normStaged = {};
          Object.keys(p).forEach(k => {
            const normKey = normalizeDateKey(k);
            if (Array.isArray(p[k])) {
              p[k].forEach(item => { 
                item.modifiers = sanitizeModifiers(item.modifiers); 
                item.scheme = normalizeSchemeName(item.scheme);
              });
            }
            normStaged[normKey] = p[k];
          });
          state.savedStaged = normStaged;
        }
      }
      const savedPRs = localStorage.getItem('apex_prLedger');
      if (savedPRs) {
        const p = JSON.parse(savedPRs);
        if (Array.isArray(p)) {
          state.prLedger = p.map(item => ({ ...item, date: normalizeDateKey(item.date) }));
        }
      }
      const savedSet = localStorage.getItem('apex_settings');
      if (savedSet) {
        const p = JSON.parse(savedSet);
        if (p && typeof p === 'object') {
          state.settings = { ...state.settings, ...p };
          if (p.customSplitBlueprints) state.customSplitBlueprints = p.customSplitBlueprints;
          if (p.schemeRecipes) state.schemeRecipes = { ...defaultSchemeRecipes, ...p.schemeRecipes };
          if (p.anchorE1rms) state.anchorE1rms = { ...state.e1rms, ...p.anchorE1rms };
          if (p.oneRmFormula) state.settings.oneRmFormula = p.oneRmFormula;
        }
      }
      const savedProf = localStorage.getItem('apex_profile');
      if (savedProf) { const p = JSON.parse(savedProf); if (p && typeof p === 'object') state.profile = { ...state.profile, ...p }; }
      const savedStart = localStorage.getItem('apex_macrocycleStartDate');
      if (savedStart) state.macrocycleStartDate = normalizeDateKey(savedStart);
      const savedMacro = localStorage.getItem('apex_macrocycle');
      if (savedMacro) { const p = JSON.parse(savedMacro); if (Array.isArray(p) && p.length > 0) state.macrocycle = p; }
      const savedSplit = localStorage.getItem('apex_weekdaySplit');
      if (savedSplit) { const p = JSON.parse(savedSplit); if (p && typeof p === 'object') state.weekdaySplit = { ...state.weekdaySplit, ...p }; }
      const savedCustomSplits = localStorage.getItem('apex_customSplitBlueprints');
      if (savedCustomSplits) { const p = JSON.parse(savedCustomSplits); if (p && typeof p === 'object') state.customSplitBlueprints = p; }
      const savedMeta = localStorage.getItem('apex_exerciseMeta');
      if (savedMeta) { const p = JSON.parse(savedMeta); if (p && typeof p === 'object') state.exerciseMeta = { ...state.exerciseMeta, ...p }; }
      const savedEx = localStorage.getItem('apex_exercises');
      if (savedEx) { const p = JSON.parse(savedEx); if (p && typeof p === 'object') state.exercises = { ...state.exercises, ...p }; }
      
      const savedPhaseReps = localStorage.getItem('apex_phaseRepMatrix');
      if (savedPhaseReps) {
        const p = JSON.parse(savedPhaseReps);
        if (p && typeof p === 'object') {
          const normMatrix = {};
          availablePhases.forEach(ph => {
            normMatrix[ph] = {
              Main: normalizeRepBookends(p[ph]?.Main, defaultPhaseRepMatrix[ph].Main.min, defaultPhaseRepMatrix[ph].Main.max),
              Secondary: normalizeRepBookends(p[ph]?.Secondary, defaultPhaseRepMatrix[ph].Secondary.min, defaultPhaseRepMatrix[ph].Secondary.max),
              Assistance: normalizeRepBookends(p[ph]?.Assistance, defaultPhaseRepMatrix[ph].Assistance.min, defaultPhaseRepMatrix[ph].Assistance.max)
            };
          });
          state.phaseRepMatrix = normMatrix;
        }
      }

      const savedRecipes = localStorage.getItem('apex_schemeRecipes');
      if (savedRecipes) {
        const p = JSON.parse(savedRecipes);
        if (p && typeof p === 'object') {
          const normalizedRecs = {};
          Object.keys(p).forEach(k => {
            normalizedRecs[normalizeSchemeName(k)] = p[k];
          });
          state.schemeRecipes = { ...defaultSchemeRecipes, ...normalizedRecs };
        }
      }

      const savedRepOverrides = localStorage.getItem('apex_exerciseRepOverrides');
      if (savedRepOverrides) {
        const p = JSON.parse(savedRepOverrides);
        if (p && typeof p === 'object') {
          const normOverrides = {};
          Object.keys(p).forEach(exName => {
            normOverrides[exName] = {};
            Object.keys(p[exName] || {}).forEach(slotKey => {
              normOverrides[exName][slotKey] = normalizeRepBookends(p[exName][slotKey], 8, 12);
            });
          });
          state.exerciseRepOverrides = normOverrides;
        }
      }

      const savedAnchors = localStorage.getItem('apex_anchorE1rms');
      if (savedAnchors) {
        const p = JSON.parse(savedAnchors);
        if (p && typeof p === 'object') {
          state.anchorE1rms = { ...state.e1rms, ...p };
        }
      }

      const savedMods = localStorage.getItem('apex_modifierCats');
      if (savedMods) {
        const parsed = JSON.parse(savedMods);
        if (Array.isArray(parsed)) {
          defaultModifierCats.forEach(defCat => {
            if (!parsed.some(c => c.name === defCat.name)) parsed.push(defCat);
          });
          state.modifierCats = parsed;
        }
      }
      const savedStaged = localStorage.getItem('apex_stagedSlots');
      if (savedStaged) {
        const p = JSON.parse(savedStaged);
        if (Array.isArray(p)) {
          p.forEach(item => { 
            item.modifiers = sanitizeModifiers(item.modifiers); 
            item.scheme = normalizeSchemeName(item.scheme);
          });
          state.stagedSlots = p;
        }
      }
      const savedDateKey = localStorage.getItem('apex_activeWorkoutDateKey');
      if (savedDateKey) state.activeWorkoutDateKey = normalizeDateKey(savedDateKey);
    } catch(e) {
      console.warn("Storage rehydration bypassed:", e);
    }

    // Dynamic Rep Resolver: returns explicit { min, max } rep window
    function resolveTargetReps(exName, tier = 'Main', phase = 'Hypertrophy') {
      if (state.exerciseRepOverrides && state.exerciseRepOverrides[exName]) {
        const ov = state.exerciseRepOverrides[exName];
        if (ov[phase] !== undefined) return normalizeRepBookends(ov[phase]);
        if (ov['All'] !== undefined) return normalizeRepBookends(ov['All']);
      }
      const matrix = state.phaseRepMatrix || defaultPhaseRepMatrix;
      const pDefaults = matrix[phase] || defaultPhaseRepMatrix[phase] || defaultPhaseRepMatrix['Hypertrophy'];
      const tierFallback = tier === 'Assistance' ? { min: 10, max: 15 } : (tier === 'Secondary' ? { min: 6, max: 8 } : { min: 4, max: 6 });
      const raw = pDefaults[tier] || tierFallback;
      return normalizeRepBookends(raw, tierFallback.min, tierFallback.max);
    }

    // Global Persistence Engine with Database-Safe Settings Mirroring
    function persist() {
      try {
        state.settings.customSplitBlueprints = state.customSplitBlueprints;
        state.settings.schemeRecipes = state.schemeRecipes;
        state.settings.anchorE1rms = state.anchorE1rms;
        state.settings.oneRmFormula = state.settings.oneRmFormula || 'apex';

        localStorage.setItem('apex_dayLogs', JSON.stringify(state.dayLogs));
        localStorage.setItem('apex_savedStaged', JSON.stringify(state.savedStaged));
        localStorage.setItem('apex_e1rms', JSON.stringify(state.e1rms));
        localStorage.setItem('apex_anchorE1rms', JSON.stringify(state.anchorE1rms || {}));
        localStorage.setItem('apex_prLedger', JSON.stringify(state.prLedger));
        localStorage.setItem('apex_settings', JSON.stringify(state.settings));
        localStorage.setItem('apex_profile', JSON.stringify(state.profile));
        localStorage.setItem('apex_macrocycleStartDate', state.macrocycleStartDate);
        localStorage.setItem('apex_macrocycle', JSON.stringify(state.macrocycle));
        localStorage.setItem('apex_weekdaySplit', JSON.stringify(state.weekdaySplit));
        localStorage.setItem('apex_customSplitBlueprints', JSON.stringify(state.customSplitBlueprints));
        localStorage.setItem('apex_exerciseMeta', JSON.stringify(state.exerciseMeta));
        localStorage.setItem('apex_exercises', JSON.stringify(state.exercises));
        localStorage.setItem('apex_phaseRepMatrix', JSON.stringify(state.phaseRepMatrix));
        localStorage.setItem('apex_schemeRecipes', JSON.stringify(state.schemeRecipes));
        localStorage.setItem('apex_exerciseRepOverrides', JSON.stringify(state.exerciseRepOverrides));
        localStorage.setItem('apex_modifierCats', JSON.stringify(state.modifierCats));
        localStorage.setItem('apex_stagedSlots', JSON.stringify(state.stagedSlots));
        if (state.activeWorkout && state.activeWorkout.length) {
          const sanitizedWorkout = state.activeWorkout.map(ex => ({
            ...ex,
            densityTimerObj: null,
            sets: (ex.sets || []).map(s => ({ ...s, lapTimerObj: null }))
          }));
          localStorage.setItem('apex_activeWorkout', JSON.stringify(sanitizedWorkout));
          localStorage.setItem('apex_activeWorkoutDay', String(state.activeWorkoutDay));
          localStorage.setItem('apex_activeWorkoutDateKey', state.activeWorkoutDateKey || getCurKey());
          localStorage.setItem('apex_sStart', String(state.sStart));
          localStorage.setItem('apex_restStart', String(state.restStart));
        } else {
          localStorage.removeItem('apex_activeWorkout');
          localStorage.removeItem('apex_activeWorkoutDay');
          localStorage.removeItem('apex_activeWorkoutDateKey');
          localStorage.removeItem('apex_sStart');
          localStorage.removeItem('apex_restStart');
        }
      } catch(e) {}
    }

    window.persist = persist;
    window.state = state;

    // Global Shared Timer Bus
    window.apexTimers = {
      sInterval: null,
      restInterval: null,
      wakeLock: null,
      wakeLockIdleTimeout: null,
      IDLE_LIMIT_MS: 15 * 60 * 1000
    };

    function hasActiveRunningTimers() {
      if (!state.activeWorkout || !state.activeWorkout.length) return false;
      return state.activeWorkout.some(ex => 
        Boolean(ex.densityRunning) || Boolean(ex.sets && ex.sets.some(s => s.lapRunning))
      );
    }

    function resetWakeLockIdleTimer() {
      if (window.apexTimers.wakeLockIdleTimeout) clearTimeout(window.apexTimers.wakeLockIdleTimeout);
      if (window.apexTimers.wakeLock) {
        window.apexTimers.wakeLockIdleTimeout = setTimeout(() => {
          releaseWakeLock(true);
        }, window.apexTimers.IDLE_LIMIT_MS);
      }
    }

    ['touchstart', 'pointerdown', 'mousemove', 'keydown', 'scroll'].forEach(evt => {
      window.addEventListener(evt, () => {
        if (window.apexTimers.wakeLock) resetWakeLockIdleTimer();
      }, { passive: true });
    });

    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator && !window.apexTimers.wakeLock) {
          window.apexTimers.wakeLock = await navigator.wakeLock.request('screen');
          window.apexTimers.wakeLock.addEventListener('release', () => {
            window.apexTimers.wakeLock = null;
            if (window.apexTimers.wakeLockIdleTimeout) clearTimeout(window.apexTimers.wakeLockIdleTimeout);
          });
        }
        resetWakeLockIdleTimer();
      } catch(e) {}
    }

    async function releaseWakeLock(force = false) {
      try {
        if (!force && hasActiveRunningTimers()) return;
        if (window.apexTimers.wakeLockIdleTimeout) {
          clearTimeout(window.apexTimers.wakeLockIdleTimeout);
          window.apexTimers.wakeLockIdleTimeout = null;
        }
        if (window.apexTimers.wakeLock) {
          await window.apexTimers.wakeLock.release();
          window.apexTimers.wakeLock = null;
        }
      } catch(e) {}
    }

    // Date-Aware Macrocycle Position Resolver
    function getMacrocyclePosition(targetDate = new Date()) {
      if (!state.macrocycle || !state.macrocycle.length || !state.macrocycleStartDate) {
        return { blockIdx: 0, week: 1, phase: 'Hypertrophy', block: { phase: 'Hypertrophy', weeks: 3 } };
      }
      try {
        const [sY, sM, sD] = state.macrocycleStartDate.split('-').map(Number);
        const startDate = new Date(sY, sM - 1, sD);
        startDate.setHours(0, 0, 0, 0);

        let cur;
        if (targetDate instanceof Date) {
          cur = new Date(targetDate);
        } else if (typeof targetDate === 'string' && targetDate.includes('-')) {
          const [tY, tM, tD] = targetDate.split('-').map(Number);
          cur = new Date(tY, tM - 1, tD);
        } else {
          cur = new Date();
        }
        cur.setHours(0, 0, 0, 0);

        const diffTime = cur - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          return { blockIdx: 0, week: 1, phase: state.macrocycle[0].phase, block: state.macrocycle[0] };
        }

        let totalWeeksElapsed = Math.floor(diffDays / 7);
        const totalMacroWeeks = state.macrocycle.reduce((sum, b) => sum + (Number(b.weeks) || 1), 0);
        if (totalMacroWeeks > 0) {
          totalWeeksElapsed = totalWeeksElapsed % totalMacroWeeks;
        }

        let accumulatedWeeks = 0;
        for (let i = 0; i < state.macrocycle.length; i++) {
          const bWeeks = Number(state.macrocycle[i].weeks) || 1;
          if (totalWeeksElapsed < accumulatedWeeks + bWeeks) {
            const weekNum = (totalWeeksElapsed - accumulatedWeeks) + 1;
            return {
              blockIdx: i,
              week: weekNum,
              phase: state.macrocycle[i].phase,
              block: state.macrocycle[i]
            };
          }
          accumulatedWeeks += bWeeks;
        }
      } catch (e) {}
      return { blockIdx: 0, week: 1, phase: state.macrocycle[0]?.phase || 'Hypertrophy', block: state.macrocycle[0] };
    }

    function syncMacrocycleProgression(targetDate = new Date()) {
      const pos = getMacrocyclePosition(targetDate);
      state.activeBlockIdx = pos.blockIdx;
      state.activeWeek = pos.week;
    }

    function getVariantKey(ex, mods = []) {
      const cleanMods = sanitizeModifiers(mods);
      const sorted = cleanMods.slice().sort();
      if (!sorted.length) return ex;
      return `${ex} [${sorted.join(', ')}]`;
    }

    function showToast(msg) {
      state.toastMsg = msg;
      renderToast();
      setTimeout(() => {
        state.toastMsg = '';
        renderToast();
      }, 3500);
    }

    function renderToast() {
      let el = document.getElementById('apex-toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'apex-toast';
        document.body.appendChild(el);
      }
      if (state.toastMsg) {
        el.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-blue-500 text-white font-mono text-xs px-4 py-2.5 rounded-2xl shadow-2xl z-50 transition-all duration-300 max-w-[90vw] text-center';
        el.innerText = state.toastMsg;
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    }

    function getExMeta(exName) {
      if (state.exerciseMeta && state.exerciseMeta[exName]) return state.exerciseMeta[exName];
      if (exName && (exName.startsWith('BW ') || exName === 'Push Up' || exName === 'Plank' || exName === 'Ab Wheel' || exName === 'Hanging Leg Raise')) {
        return { w: false, r: exName !== 'Plank', t: exName === 'Plank', rpe: true };
      }
      return { w: true, r: true, t: false, rpe: true };
    }

    function getLatestBodyweight(targetDateKey = null) {
      if (!state.dayLogs) return Number(state.profile?.bodyweight || 196.2);
      const allKeys = Object.keys(state.dayLogs).filter(k => state.dayLogs[k] && state.dayLogs[k].weight);
      if (!allKeys.length) return Number(state.profile?.bodyweight || 196.2);

      const normalizedTarget = targetDateKey ? normalizeDateKey(targetDateKey) : null;
      if (normalizedTarget && state.dayLogs[normalizedTarget]?.weight) {
        return Number(state.dayLogs[normalizedTarget].weight);
      }

      const parseKey = (k) => {
        const [y, m, d] = k.split('-').map(Number);
        return new Date(y, m - 1, d).getTime();
      };

      const targetTime = normalizedTarget ? parseKey(normalizedTarget) : Date.now();
      const priorKeys = allKeys.filter(k => parseKey(k) <= targetTime).sort((a, b) => parseKey(b) - parseKey(a));
      if (priorKeys.length > 0) return Number(state.dayLogs[priorKeys[0]].weight);

      const futureKeys = allKeys.filter(k => parseKey(k) > targetTime).sort((a, b) => parseKey(a) - parseKey(b));
      if (futureKeys.length > 0) return Number(state.dayLogs[futureKeys[0]].weight);

      return Number(state.profile?.bodyweight || 196.2);
    }
    state.formMetrics.weight = getLatestBodyweight();

    function getReadinessScore() {
      const { sleep, pushSoreness, pullSoreness, legSoreness, energy, stress, motivation } = state.formMetrics;
      const isRest = Number(motivation) === 0;
      const physicalTotal = (Number(sleep) || 3) + 
                            (Number(pushSoreness) || 4) + 
                            (Number(pullSoreness) || 4) + 
                            (Number(legSoreness) || 4) + 
                            (Number(energy) || 4) + 
                            (Number(stress) || 4);

      if (isRest) {
        return Math.round((physicalTotal / 30) * 100);
      }
      return Math.round(((physicalTotal + (Number(motivation) || 4)) / 35) * 100);
    }

    function getReadinessBand(score) {
      if (score >= 85) {
        return { name: 'Primed', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500', desc: 'Primed (+2.5% Boost)', factor: 1.025, rpeCap: 10.0, setReduction: 0 };
      } else if (score >= 65) {
        return { name: 'Optimal', badge: 'bg-blue-500/20 text-blue-300 border-blue-500', desc: 'Optimal Baseline', factor: 1.0, rpeCap: 10.0, setReduction: 0 };
      } else if (score >= 50) {
        return { name: 'Guarded', badge: 'bg-amber-500/20 text-amber-300 border-amber-500', desc: 'Guarded (-1 Set Trim)', factor: 1.0, rpeCap: 8.5, setReduction: 1 };
      } else {
        return { name: 'Fatigued', badge: 'bg-red-500/20 text-red-300 border-red-500', desc: 'Fatigued (-5% Load, -1 Set)', factor: 0.95, rpeCap: 7.5, setReduction: 1 };
      }
    }

    function getRollingReadiness(targetDateKey, windowDays = 3) {
      if (!state.dayLogs) return 85;
      const curDate = targetDateKey 
        ? (() => {
            const [y, m, d] = normalizeDateKey(targetDateKey).split('-').map(Number);
            return new Date(y, m - 1, d);
          })() 
        : new Date(state.year, state.month, state.selectedDay);
      
      let scores = [];
      let srpeFatiguePenalty = 0;

      for (let i = 0; i < windowDays; i++) {
        const d = new Date(curDate);
        d.setDate(d.getDate() - i);
        const k = formatIsoDate(d.getFullYear(), d.getMonth(), d.getDate());
        const dayLog = state.dayLogs[k];

        if (dayLog?.recovery?.score) {
          scores.push(dayLog.recovery.score);
        }

        if (i > 0 && dayLog?.workout?.done && dayLog.workout.srpe) {
          const srpe = Number(dayLog.workout.srpe);
          if (srpe >= 9.0) srpeFatiguePenalty += 8;
          else if (srpe >= 8.0) srpeFatiguePenalty += 4;
        }
      }

      let baselineScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : (state.dayLogs[getCurKey()]?.recovery?.score || 78);

      return Math.max(30, Math.min(100, baselineScore - srpeFatiguePenalty));
    }

    function roundLoad(val) {
      const inc = Number(state.settings?.rounding) || 5.0;
      return Math.round((Number(val) || 0) / inc) * inc;
    }

    // Multi-Formula 1RM Prediction Engine
    function calculate1RmEquivalent(weight, reps, formula = 'apex') {
      const w = Number(weight) || 0;
      const r = Math.max(1, Number(reps) || 1);
      if (w <= 0) return 0;
      if (r === 1) return w;

      if (formula === 'epley') {
        return Math.round(w * (1 + (r / 30)));
      } else if (formula === 'brzycki') {
        return Math.round(w * (36 / (37 - r)));
      } else if (formula === 'wathan') {
        return Math.round((100 * w) / (48.8 + (53.8 * Math.exp(-0.075 * r))));
      } else if (formula === 'lombardi') {
        return Math.round(w * Math.pow(r, 0.10));
      }
      // Default: APEX Autoregulated Table Formula
      const rirTablePct = Math.max(40, (100 - (r - 1) * 2.15));
      return Math.round(w / (rirTablePct / 100));
    }

    // Dynamic Percentage Resolver Linked to Selected 1RM Engine
    function getPct(reps, rpe, formulaOverride = null) {
      const r = Math.min(Math.max(1, Number(reps) || 1), 30);
      const cleanRpe = roundRpe(rpe);
      const rir = 10.0 - cleanRpe;
      const effReps = r + rir;
      const activeFormula = formulaOverride || state.settings?.oneRmFormula || 'apex';

      if (activeFormula === 'epley') {
        return Math.max(35, Math.round((3000 / (30 + effReps)) * 10) / 10);
      } else if (activeFormula === 'brzycki') {
        return Math.max(35, Math.round(((100 * (37 - Math.min(36, effReps))) / 36) * 10) / 10);
      } else if (activeFormula === 'wathan') {
        return Math.max(35, Math.round((48.8 + (53.8 * Math.exp(-0.075 * effReps))) * 10) / 10);
      } else if (activeFormula === 'lombardi') {
        return Math.max(35, Math.round((100 / Math.pow(effReps, 0.10)) * 10) / 10);
      }

      // Default APEX Standard / High Capacity RPE matrix
      if (state.settings && state.settings.rpeTable === 'Standard') {
        return Math.max(35, Math.round((100 - (effReps - 1) * 2.85) * 10) / 10);
      }
      return Math.max(40, Math.round((100 - (effReps - 1) * 2.15) * 10) / 10);
    }

    function calcLoad(e1rm, pct) {
      return roundLoad((Number(e1rm) || 135) * ((Number(pct) || 75) / 100));
    }

    function fmtTime(sec) {
      const totalSec = Math.max(0, Math.floor(Number(sec) || 0));
      const m = Math.floor(totalSec / 60), s = totalSec % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function getCurKey() { 
      return formatIsoDate(state.year, state.month, state.selectedDay); 
    }

    function getCurLog() { 
      return (state.dayLogs && state.dayLogs[getCurKey()]) || {}; 
    }

    function getDayOfWeek(d) { 
      return new Date(state.year, state.month, Number(d)).getDay(); 
    }

    function getE1rm(ex, mods = []) {
      const cleanMods = sanitizeModifiers(mods);
      const variantKey = getVariantKey(ex, cleanMods);
      return state.e1rms[variantKey] || state.e1rms[ex] || 135;
    }

    function getDayFocus(d) {
      const dow = getDayOfWeek(d);
      return state.weekdaySplit[dow] || 'Rest & Recovery';
    }

    function generateBlueprint(d) {
      const focus = getDayFocus(d);
      if (state.customSplitBlueprints && state.customSplitBlueprints[focus]) {
        return JSON.parse(JSON.stringify(state.customSplitBlueprints[focus]));
      }
      return defaultSplitBlueprints[focus] || defaultSplitBlueprints['Rest & Recovery'];
    }

    function getLiftHistory(exName, withMods, mods) {
      const results = [];
      const cleanMods = sanitizeModifiers(mods || []);
      const targetModKey = cleanMods.slice().sort().join('+');
      const dates = Object.keys(state.dayLogs || {}).sort().reverse();
      dates.forEach(dKey => {
        const dLog = state.dayLogs[dKey];
        if (dLog && dLog.workout && dLog.workout.exercises) {
          dLog.workout.exercises.forEach(exObj => {
            if (exObj && exObj.exercise === exName) {
              const currentCleanMods = sanitizeModifiers(exObj.modifiers || []);
              const currentModKey = currentCleanMods.slice().sort().join('+');
              if (!withMods || currentModKey === targetModKey) {
                const completedSets = (exObj.sets || []).filter(s => s && s.done);
                let topE1 = 0;
                completedSets.forEach(s => {
                  if (s.actualWeight && s.actualReps && s.actualRpe) {
                    const c = Math.round(s.actualWeight / (getPct(s.actualReps, s.actualRpe) / 100));
                    if (c > topE1) topE1 = c;
                  }
                });
                results.push({
                  date: dKey,
                  modifiers: currentCleanMods,
                  scheme: normalizeSchemeName(exObj.scheme || 'Straight Sets'),
                  sets: exObj.sets || [],
                  totalReps: exObj.totalReps || 0,
                  tonnage: exObj.tonnage || 0,
                  topE1: topE1
                });
              }
            }
          });
        }
      });
      return results;
    }

    function getMicrocycleVolume(microcycleKey = 'cur_week') {
      const totals = {};
      muscleGroupTaxonomy.forEach(m => totals[m] = 0);

      const targetTimeNow = new Date();
      const dateFilter = (dKey) => {
        const [y, m, d] = dKey.split('-').map(Number);
        const targetDate = new Date(y, m - 1, d);
        if (microcycleKey === 'cur_week') {
          const diffDays = Math.floor((targetTimeNow - targetDate) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays < 7;
        } else if (microcycleKey === 'prev_week') {
          const diffDays = Math.floor((targetTimeNow - targetDate) / (1000 * 60 * 60 * 24));
          return diffDays >= 7 && diffDays < 14;
        } else if (microcycleKey === 'last_30') {
          const diffDays = Math.floor((targetTimeNow - targetDate) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays < 30;
        }
        return true;
      };

      Object.keys(state.dayLogs || {}).forEach(dKey => {
        if (!dateFilter(dKey)) return;
        const workout = state.dayLogs[dKey]?.workout;
        if (workout && Array.isArray(workout.exercises)) {
          workout.exercises.forEach(exObj => {
            const completedSets = (exObj.sets || []).filter(s => s && s.done).length;
            if (completedSets > 0) {
              const attribution = exerciseMuscleMap[exObj.exercise] || { 'Back / Lats': 1.0 };
              Object.keys(attribution).forEach(muscle => {
                if (totals[muscle] !== undefined) {
                  totals[muscle] += completedSets * attribution[muscle];
                }
              });
            }
          });
        }
      });
      return totals;
    }

    // ========================================================================
    // MULTI-VARIABLE BLOCK TRANSITION WIZARD HEURISTICS ENGINE
    // ========================================================================
    function analyzeBlockTransition(targetDateKey = null) {
      const pos = getMacrocyclePosition(targetDateKey || new Date());
      const curPhase = pos.phase;
      const curWeeks = Number(pos.block.weeks) || 3;
      const lifterType = state.profile?.lifterType || 'Natural';
      const thresholds = landmarkThresholds[lifterType] || landmarkThresholds.Natural;

      // 1. Gather DayLogs for the Current Block Window
      const allDates = Object.keys(state.dayLogs || {}).sort();
      const [sY, sM, sD] = (state.macrocycleStartDate || getTodayDateString()).split('-').map(Number);
      const startOfCycle = new Date(sY, sM - 1, sD).getTime();

      let accumWeeks = 0;
      for (let i = 0; i < pos.blockIdx; i++) {
        accumWeeks += Number(state.macrocycle[i].weeks) || 1;
      }
      const blockStartEpoch = startOfCycle + (accumWeeks * 7 * 86400000);
      const blockEndEpoch = blockStartEpoch + (curWeeks * 7 * 86400000);

      const blockLogs = allDates.filter(k => {
        const [y, m, d] = k.split('-').map(Number);
        const ep = new Date(y, m - 1, d, 12, 0).getTime();
        return ep >= blockStartEpoch && ep <= blockEndEpoch;
      });

      // 2. Bodyweight Trajectory & Velocity
      const bwEntries = blockLogs
        .filter(k => state.dayLogs[k]?.weight)
        .map(k => ({ date: k, val: Number(state.dayLogs[k].weight) }))
        .filter(b => !isNaN(b.val) && b.val > 0);

      let bwVelocity = 0.0;
      let startBw = Number(state.profile?.bodyweight || 196.2);
      let endBw = startBw;
      if (bwEntries.length >= 2) {
        startBw = bwEntries[0].val;
        endBw = bwEntries[bwEntries.length - 1].val;
        bwVelocity = Math.round(((endBw - startBw) / Math.max(1, curWeeks)) * 10) / 10;
      }

      // 3. Systemic Readiness & Foster Load
      const readinessScores = blockLogs
        .filter(k => state.dayLogs[k]?.recovery?.score)
        .map(k => Number(state.dayLogs[k].recovery.score));
      const avgReadiness = readinessScores.length 
        ? Math.round(readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length) 
        : 78;

      const fosterLoads = blockLogs
        .filter(k => state.dayLogs[k]?.workout?.done && state.dayLogs[k].workout.dur && state.dayLogs[k].workout.srpe)
        .map(k => Math.round(Number(state.dayLogs[k].workout.dur) * Number(state.dayLogs[k].workout.srpe)));
      const avgFosterLoad = fosterLoads.length 
        ? Math.round(fosterLoads.reduce((a, b) => a + b, 0) / fosterLoads.length) 
        : 320;

      // 4. Localized Muscle Soreness & Volume Accretion
      const muscleVolume = {};
      const muscleSoreness = {};
      muscleGroupTaxonomy.forEach(m => {
        muscleVolume[m] = 0;
        muscleSoreness[m] = [];
      });

      blockLogs.forEach(k => {
        const log = state.dayLogs[k];
        if (log?.recovery?.metrics) {
          const { pushSoreness, pullSoreness, legSoreness } = log.recovery.metrics;
          if (pushSoreness) {
            ['Chest', 'Front Delts', 'Triceps'].forEach(m => muscleSoreness[m].push(Number(pushSoreness)));
          }
          if (pullSoreness) {
            ['Back / Lats', 'Biceps', 'Traps'].forEach(m => muscleSoreness[m].push(Number(pullSoreness)));
          }
          if (legSoreness) {
            ['Quads', 'Hamstrings', 'Glutes', 'Calves'].forEach(m => muscleSoreness[m].push(Number(legSoreness)));
          }
        }
        if (log?.workout?.exercises) {
          log.workout.exercises.forEach(exObj => {
            const completedSets = (exObj.sets || []).filter(s => s && s.done).length;
            if (completedSets > 0) {
              const attribution = exerciseMuscleMap[exObj.exercise] || { 'Back / Lats': 1.0 };
              Object.keys(attribution).forEach(muscle => {
                if (muscleVolume[muscle] !== undefined) {
                  muscleVolume[muscle] += completedSets * (attribution[muscle] || 0);
                }
              });
            }
          });
        }
      });

      // 5. Build Granular Tier-Specific Recommendations
      const recommendations = [];
      muscleGroupTaxonomy.forEach(m => {
        const totalSets = muscleVolume[m] || 0;
        const weeklySets = Math.round((totalSets / Math.max(1, curWeeks)) * 10) / 10;
        const sArr = muscleSoreness[m] || [];
        const avgSoreness = sArr.length 
          ? Math.round((sArr.reduce((a, b) => a + b, 0) / sArr.length) * 10) / 10 
          : 4.0;
        const { mv, mev, mav, mrv } = thresholds[m] || { mv: 4, mev: 8, mav: 16, mrv: 22 };

        let delta = 0;
        let targetTier = 'Secondary';
        let reason = 'Volume and recovery within normal parameters.';

        // Extreme Reading Checks (+-2 sets)
        if (avgSoreness <= 1.8 || weeklySets >= mrv + 2) {
          delta = -2;
          targetTier = (weeklySets >= mrv + 3) ? 'Main & Secondary (-1 each)' : 'Assistance (-2)';
          reason = `Extreme localized fatigue (${avgSoreness}/5) or volume exceeding MRV ceiling (${weeklySets} sets vs ${mrv} limit).`;
        } else if (avgSoreness >= 4.5 && weeklySets <= mev && bwVelocity > 0.25 && avgReadiness >= 80) {
          delta = 2;
          targetTier = 'Secondary (+1) & Assistance (+1)';
          reason = `High recovery rate (${avgSoreness}/5) with caloric surplus (+${bwVelocity} lbs/wk) and volume below MEV (${weeklySets} sets).`;
        }
        // Standard Micro-Adjustment Checks (+-1 set)
        else if (avgSoreness <= 2.6 || weeklySets > mav) {
          delta = -1;
          targetTier = (bwVelocity < -0.4) ? 'Assistance' : 'Secondary';
          reason = `Elevated localized DOMS (${avgSoreness}/5) near upper MAV threshold (${weeklySets} sets).`;
        } else if (avgSoreness >= 3.8 && weeklySets < mav && avgReadiness >= 70 && bwVelocity >= -0.3) {
          delta = 1;
          targetTier = 'Secondary';
          reason = `Optimal recovery state (${avgSoreness}/5) with capacity below MAV (${weeklySets} sets).`;
        } else {
          delta = 0;
          targetTier = 'None';
          reason = `Well-calibrated within optimal MAV range (${weeklySets} sets) with stable recovery.`;
        }

        recommendations.push({
          muscle: m,
          weeklySets,
          avgSoreness,
          landmarks: { mv, mev, mav, mrv },
          delta,
          targetTier,
          reason
        });
      });

      // 6. Phase Advance & Blending Recommendation
      let nextPhase = 'Hypertrophy';
      if (curPhase === 'Accumulation') nextPhase = 'Hypertrophy';
      else if (curPhase === 'Hypertrophy') nextPhase = 'Intensification';
      else if (curPhase === 'Intensification') nextPhase = 'Strength';
      else if (curPhase === 'Strength') nextPhase = 'Deload';
      else if (curPhase === 'Deload') nextPhase = 'Accumulation';

      if (avgReadiness < 60 || avgFosterLoad > 450) {
        nextPhase = 'Deload';
      }

      const suggestedBlending = (avgReadiness >= 75 && bwVelocity >= 0) ? 'moderate' : (avgReadiness < 65 ? 'conservative' : 'moderate');

      return {
        currentPhase: curPhase,
        currentWeeks: curWeeks,
        nextPhase,
        suggestedBlending,
        avgReadiness,
        avgFosterLoad,
        startBw,
        endBw,
        bwVelocity,
        recommendations
      };
    }

    let sbClient = null;
    let realtimeChannel = null;

    function subscribeToRealtime() {
      if (!sbClient || !state.user || realtimeChannel) return;
      try {
        realtimeChannel = sbClient
          .channel('apex_userdata_changes')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'apex_userdata',
            filter: `user_id=eq.${state.user.id}`
          }, (payload) => {
            if (payload.new && payload.new.updated_at) {
              const cloudTime = new Date(payload.new.updated_at).getTime();
              const localTime = Number(localStorage.getItem('apex_last_sync_timestamp') || 0);
              if (cloudTime > localTime + 2000) {
                window.pullFromCloud(false, true);
              }
            }
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log("Supabase Realtime synchronized");
            }
          });
      } catch(e) {
        console.warn("Realtime subscription warning:", e);
      }
    }

    window.initSupabase = function() {
      if (typeof window.supabase === 'undefined') return;
      const { url, anonKey } = state.supabaseConfig;
      if (url && anonKey) {
        try {
          sbClient = window.supabase.createClient(url, anonKey);
          sbClient.auth.getSession().then(({ data: { session } }) => {
            state.user = session?.user || null;
            state.syncStatus = state.user ? 'synced' : 'offline';
            if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();
            if (state.user) {
              window.pullFromCloud(false);
              subscribeToRealtime();
            }
          });
          sbClient.auth.onAuthStateChange((_event, session) => {
            const prevUser = state.user;
            state.user = session?.user || null;
            state.syncStatus = state.user ? 'synced' : 'offline';
            if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();
            if (state.user && !prevUser) {
              window.pullFromCloud(false);
              subscribeToRealtime();
            } else if (!state.user && realtimeChannel) {
              sbClient.removeChannel(realtimeChannel);
              realtimeChannel = null;
            }
          });
        } catch (e) {
          console.warn("Supabase init error:", e);
        }
      }
    };

    window.pushToCloud = async function(isManual = false) {
      if (!sbClient) window.initSupabase();
      if (!sbClient || !state.user) {
        state.syncStatus = 'offline';
        if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();
        if (isManual) showToast("❌ Please sign in to Supabase first.");
        return;
      }
      state.syncStatus = 'syncing';
      if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();
      try {
        state.settings.customSplitBlueprints = state.customSplitBlueprints;
        state.settings.schemeRecipes = state.schemeRecipes;
        state.settings.anchorE1rms = state.anchorE1rms;
        state.settings.oneRmFormula = state.settings.oneRmFormula || 'apex';

        const nowIso = new Date().toISOString();
        const payload = {
          user_id: state.user.id,
          settings: state.settings,
          profile: state.profile,
          macrocycle: state.macrocycle,
          weekday_split: state.weekdaySplit,
          exercise_meta: state.exerciseMeta,
          phase_rep_matrix: state.phaseRepMatrix,
          exercise_rep_overrides: state.exerciseRepOverrides,
          active_block_idx: state.activeBlockIdx,
          active_week: state.activeWeek,
          exercises: state.exercises,
          modifier_cats: state.modifierCats,
          day_logs: state.dayLogs,
          e1rms: state.e1rms,
          pr_ledger: state.prLedger,
          updated_at: nowIso
        };
        const { error } = await sbClient.from('apex_userdata').upsert(payload, { onConflict: 'user_id' });
        if (error) throw error;
        localStorage.setItem('apex_last_sync_timestamp', String(Date.now()));
        state.syncStatus = 'synced';
        if (isManual) showToast("✓ Data pushed to Supabase successfully!");
      } catch (err) {
        console.error("Cloud push error:", err);
        state.syncStatus = 'error';
        if (isManual) showToast(`❌ Push Error: ${err.message || 'Check database permissions'}`);
      }
      if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();
    };

    window.pullFromCloud = async function(isManual = false, isSilent = false) {
      if (!sbClient) window.initSupabase();
      if (!sbClient || !state.user) {
        state.syncStatus = 'offline';
        if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();
        if (isManual) showToast("❌ Please sign in to Supabase first.");
        return;
      }
      if (!isSilent) {
        state.syncStatus = 'syncing';
        if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();
      }
      try {
        const { data, error } = await sbClient.from('apex_userdata').select('*').eq('user_id', state.user.id).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          if (data.settings) {
            state.settings = { ...state.settings, ...data.settings };
            if (data.settings.customSplitBlueprints) state.customSplitBlueprints = data.settings.customSplitBlueprints;
            if (data.settings.schemeRecipes) state.schemeRecipes = { ...defaultSchemeRecipes, ...data.settings.schemeRecipes };
            if (data.settings.anchorE1rms) state.anchorE1rms = { ...state.e1rms, ...data.settings.anchorE1rms };
            if (data.settings.oneRmFormula) state.settings.oneRmFormula = data.settings.oneRmFormula;
          }
          if (data.profile) state.profile = { ...state.profile, ...data.profile };
          if (data.macrocycle) state.macrocycle = data.macrocycle;
          if (data.weekday_split) state.weekdaySplit = data.weekday_split;
          if (data.exercise_meta) state.exerciseMeta = { ...state.exerciseMeta, ...data.exercise_meta };
          if (data.phase_rep_matrix) state.phaseRepMatrix = data.phase_rep_matrix;
          if (data.scheme_recipes) state.schemeRecipes = { ...defaultSchemeRecipes, ...data.scheme_recipes };
          if (data.exercise_rep_overrides) state.exerciseRepOverrides = data.exercise_rep_overrides;
          if (data.modifier_cats) state.modifierCats = data.modifier_cats;
          if (data.exercises) state.exercises = { ...state.exercises, ...data.exercises };
          if (data.day_logs) {
            const normalizedLogs = {};
            Object.keys(data.day_logs).forEach(k => {
              normalizedLogs[normalizeDateKey(k)] = data.day_logs[k];
            });
            state.dayLogs = { ...state.dayLogs, ...normalizedLogs };
          }
          if (data.e1rms) state.e1rms = { ...state.e1rms, ...data.e1rms };
          if (data.anchor_e1rms) state.anchorE1rms = { ...state.e1rms, ...data.anchor_e1rms };
          else if (!state.anchorE1rms || !Object.keys(state.anchorE1rms).length) state.anchorE1rms = { ...state.e1rms };
          if (data.pr_ledger) state.prLedger = data.pr_ledger;
          localStorage.setItem('apex_last_sync_timestamp', String(Date.now()));
          syncMacrocycleProgression();
          state.formMetrics.weight = getLatestBodyweight();
          if (typeof window.persist === 'function') window.persist();
          state.syncStatus = 'synced';
          if (isManual) showToast("✓ Latest cloud data loaded!");
          if (isSilent) showToast("⚡ Cloud data auto-synced via Realtime");
          if (typeof window.render === 'function') window.render();
        } else {
          await window.pushToCloud(false);
        }
      } catch (err) {
        console.error("Cloud pull error:", err);
        state.syncStatus = 'error';
        if (isManual) showToast(`❌ Pull Error: ${err.message || 'Check RLS / Table'}`);
      }
      if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();
    };

    // Debounced Auto-Sync Engine
    let cloudSyncTimeout = null;
    function queueCloudSync(delayMs = 2500) {
      if (!state.user) return;
      if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
      state.syncStatus = 'syncing';
      if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();

      cloudSyncTimeout = setTimeout(() => {
        window.pushToCloud(false);
      }, delayMs);
    }
    window.queueCloudSync = queueCloudSync;

    // 60-Second Background Heartbeat Auto-Sync for In-Progress Workouts
    setInterval(() => {
      if (state.user && state.activeWorkout && state.activeWorkout.length) {
        window.pushToCloud(false);
      }
    }, 60000);

    window.apexCore = {
      APP_VERSION,
      TODAY_YEAR,
      TODAY_MONTH,
      TODAY_DATE,
      roundRpe,
      roundLoad,
      getPct,
      calcLoad,
      calculate1RmEquivalent,
      fmtTime,
      getCurKey,
      getCurLog,
      getDayOfWeek,
      getE1rm,
      getDayFocus,
      generateBlueprint,
      getLiftHistory,
      getMicrocycleVolume,
      analyzeBlockTransition,
      normalizeSchemeName,
      showToast,
      renderToast,
      getExMeta,
      getLatestBodyweight,
      getReadinessScore,
      getReadinessBand,
      getRollingReadiness,
      getMacrocyclePosition,
      syncMacrocycleProgression,
      sanitizeModifiers,
      getVariantKey,
      normalizeRepBookends,
      resolveTargetReps,
      requestWakeLock,
      releaseWakeLock,
      resetWakeLockIdleTimer,
      hasActiveRunningTimers,
      getTodayDateString,
      formatIsoDate,
      normalizeDateKey,
      queueCloudSync,
      monthNames,
      availablePhases,
      availableThemes,
      availableFonts,
      hypertrophySchemes,
      strengthSchemes,
      schemeAliases,
      defaultModifierCats,
      defaultPhaseRepMatrix,
      defaultSchemeRecipes,
      muscleGroupTaxonomy,
      landmarkThresholds,
      metricDescs,
      programPresets,
      phaseDescriptions,
      schemeDescriptions
    };
  } catch (err) {
    console.error("APEX Engine Part 1 fatal initialization error:", err);
  }
})();
// ============================================================================
// APEX TRAINING ENGINE - PART 2 OF 4: MATHEMATICAL PERIODIZATION MATRIX
// Production Release v4.6.0-PWA (Neutral Schemes / Multi-Engine / Date-Aware)
// Includes: Full Mathematical Logic for all 31 Hypertrophy & Strength Schemes,
//           Neutral Scheme Nomenclature with Backward-Compatibility Aliasing,
//           Multi-Formula 1RM Prediction Engine Integration (Dynamic getPct),
//           Strict 0.5 RPE Quantization Across All Prescriptions,
//           Scheme-Level Rep Range / Fixed Rep Locks (minReps === maxReps),
//           Microcycle 0.5 RPE Progression Toggles (enableRpeProgression),
//           Submaximal AMRAP Calibration Engine (10@9.0 Anchor + 12@62% Volume),
//           Anticipated Target Date Resolution (opts.dateKey / Staging Ahead),
//           opts.isGrounding (@9.0 Top Set) & opts.skipBackoffs Support
// ============================================================================

(function() {
  try {
    const {
      roundRpe, roundLoad, getPct, calcLoad, getCurKey, getDayOfWeek,
      getLiftHistory, getExMeta, getRollingReadiness, getReadinessBand,
      getMacrocyclePosition, resolveTargetReps, defaultSchemeRecipes,
      normalizeSchemeName
    } = window.apexCore;

    const state = window.state;

    function getActiveBlock(targetDateKey = null) {
      if (typeof getMacrocyclePosition === 'function') {
        const pos = getMacrocyclePosition(targetDateKey || new Date());
        return pos.block || { phase: pos.phase || 'Hypertrophy', weeks: 3 };
      }
      if (!state.macrocycle || !state.macrocycle.length) return { phase: 'Hypertrophy', weeks: 3 };
      if (state.activeBlockIdx >= state.macrocycle.length) state.activeBlockIdx = 0;
      return state.macrocycle[state.activeBlockIdx];
    }

    // ========================================================================
    // UNIFIED 31-SCHEME TARGET DERIVATION ENGINE (NEUTRAL NOMENCLATURE)
    // ========================================================================
    function buildSets(scheme, e1rm, factor = 1.0, tier = 'Main', exName = '', mods = [], opts = {}) {
      const isGrounding = Boolean(opts && opts.isGrounding);
      const skipBackoffs = Boolean(opts && opts.skipBackoffs);

      // 1. Normalize Scheme Name with Backward-Compatibility Aliasing
      const cleanScheme = (typeof normalizeSchemeName === 'function') 
        ? normalizeSchemeName(scheme) 
        : (scheme || 'Straight Sets');

      // 2. Contextual Target Date Determination (Anticipated Staging vs. Active)
      const targetDateKey = opts.dateKey || opts.targetDateKey || state.activeWorkoutDateKey || getCurKey();
      
      let curBlock = { phase: 'Hypertrophy', weeks: 3 };
      let phase = 'Hypertrophy';
      let w = 1;

      if (typeof getMacrocyclePosition === 'function') {
        const pos = getMacrocyclePosition(targetDateKey);
        curBlock = pos.block;
        phase = pos.phase;
        w = pos.week;
      } else {
        curBlock = getActiveBlock(targetDateKey);
        phase = curBlock.phase || 'Hypertrophy';
        w = state.activeWeek || 1;
      }

      const skill = state.profile?.skillLevel || 'Advanced';
      const lifterType = state.profile?.lifterType || 'Natural';
      const ready = getRollingReadiness(targetDateKey, 3);
      const readyBand = getReadinessBand(ready);

      // Resolve Day of Week from Target Date Key
      let dow = 1;
      if (targetDateKey && typeof targetDateKey === 'string' && targetDateKey.includes('-')) {
        const [y, m, d] = targetDateKey.split('-').map(Number);
        dow = new Date(y, m - 1, d).getDay();
      } else {
        dow = getDayOfWeek(state.selectedDay || window.apexCore.TODAY_DATE);
      }

      const callerFactor = (typeof factor === 'number' && !isNaN(factor) && factor > 0) ? factor : 1.0;
      let fatigueMod = readyBand.factor * callerFactor;
      let rpeCap = isGrounding ? 10.0 : roundRpe(readyBand.rpeCap);
      let setReduction = (tier === 'Assistance' || ready < 50) ? readyBand.setReduction : 0;

      if (phase === 'Deload') {
        fatigueMod = 0.85 * callerFactor; 
        rpeCap = 6.5; 
        setReduction = 1;
      }

      const skillMod = skill === 'Beginner' ? 0.95 : (skill === 'Intermediate' ? 0.98 : 1.0);
      
      // Historical Performance Anchoring (baseOnLastWorkout)
      let baseE1rm = Number(e1rm) || 135;
      let hasHistory = false;
      if (state.settings?.baseOnLastWorkout && exName) {
        const history = getLiftHistory(exName, true, mods);
        if (history && history.length > 0 && history[0].topE1 > 0) {
          baseE1rm = history[0].topE1;
          hasHistory = true;
        }
      }

      // Microcycle Progressive Overload Acceleration
      let progressionMultiplier = 1.0;
      let progressionAbsolute = 0;
      const weekStep = hasHistory ? 1 : Math.max(0, w - 1);
      
      if (state.settings?.progressionType === 'absolute') {
        progressionAbsolute = weekStep * (Number(state.settings.progressionRate) || 5.0);
      } else {
        progressionMultiplier = 1.0 + (weekStep * ((Number(state.settings?.progressionRate) || 1.5) / 100));
      }

      const adj = (baseE1rm * fatigueMod * skillMod * progressionMultiplier) + progressionAbsolute;
      const meta = getExMeta(exName);
      const roundingStep = Number(state.settings?.rounding) || 5.0;

      // Pull Declarative Recipe from Programming Builder
      const activeRecipes = state.schemeRecipes || defaultSchemeRecipes || {};
      const recipe = activeRecipes[cleanScheme] || defaultSchemeRecipes?.[cleanScheme] || {};

      // Microcycle RPE Progression Toggle: strict 0.5 RPE increments
      const enableRpeProgression = recipe.enableRpeProgression !== undefined ? Boolean(recipe.enableRpeProgression) : true;
      const weekRpeBump = enableRpeProgression ? Math.max(0, (w - 1) * 0.5) : 0; // Exactly 0.0, 0.5, 1.0...

      // Working Set Volume Sizing Matrix
      let baseWorkingSets = Number(recipe.setsCount) || 3;
      if (lifterType === 'Enhanced') {
        baseWorkingSets = (tier === 'Main') ? baseWorkingSets : baseWorkingSets + 1;
        if (w === 1) baseWorkingSets = Math.max(2, baseWorkingSets - 1);
        else if (w >= 3) baseWorkingSets += 1;
      } else {
        if (w === 1) baseWorkingSets = Math.max(2, baseWorkingSets - 1);
        else if (w >= 3 && tier !== 'Main') baseWorkingSets += 1;
      }

      if (phase === 'Deload') baseWorkingSets = Math.max(2, Math.floor(baseWorkingSets * 0.6));
      baseWorkingSets = Math.max(2, baseWorkingSets - setReduction);

      let setArray = [];

      // Optional Over-Warmup Heavy Primer Single (1@8.0)
      if (tier === 'Main' && state.settings?.includeTopSingle && cleanScheme !== 'e1RM Grounding AMRAP' && cleanScheme !== 'Primer Single + % Back-offs' && ready >= 65 && phase !== 'Deload' && !isGrounding) {
        const top1 = calcLoad(adj, 92);
        setArray.push({
          label: '1@8.0 Primer',
          targetLoad: meta.w ? top1 : 0,
          targetReps: 1,
          targetTime: 0,
          targetRpe: 8.0,
          actualWeight: meta.w ? top1 : 0,
          actualReps: 1,
          actualTime: 0,
          actualRpe: 8.0,
          done: false,
          lapRunning: false
        });
      }

      // Dual-Bound Rep Range Derivation: Check Scheme-Level Recipe Override First
      let minRep = 6;
      let maxRep = 8;
      const hasRecipeRepLock = (Number(recipe.minReps) > 0 && Number(recipe.maxReps) > 0);

      if (hasRecipeRepLock) {
        minRep = Number(recipe.minReps);
        maxRep = Number(recipe.maxReps);
      } else {
        const repResolver = resolveTargetReps || window.apexCore?.resolveTargetReps || function(ex, t, p) {
          if (t === 'Assistance') return { min: 10, max: 15 };
          if (t === 'Secondary') return { min: 6, max: 8 };
          return { min: 4, max: 6 };
        };
        const rawBounds = repResolver(exName, tier, phase);
        minRep = Number(rawBounds.min) || 6;
        maxRep = Number(rawBounds.max) || 8;
      }

      if (minRep > maxRep) {
        const temp = minRep;
        minRep = maxRep;
        maxRep = temp;
      }

      const hasSpecificOverride = state.exerciseRepOverrides && (
        (state.exerciseRepOverrides[exName] && state.exerciseRepOverrides[exName][phase] !== undefined) ||
        (state.exerciseRepOverrides[exName] && state.exerciseRepOverrides[exName]['All'] !== undefined)
      );

      // Only adjust reps for DUP or Week 1/3 if NOT locked by a scheme recipe definition
      if (!hasRecipeRepLock) {
        if (phase === 'DUP' && !hasSpecificOverride && tier !== 'Assistance') {
          if (dow === 1 || dow === 5) { minRep = 3; maxRep = 5; }
          else if (dow === 3) { minRep = 8; maxRep = 12; }
          else { minRep = 5; maxRep = 7; }
        }

        if (w === 1 && tier !== 'Assistance') { minRep += 1; maxRep += 1; }
        if (w === 3 && minRep > 2 && tier !== 'Assistance') { minRep -= 1; maxRep -= 1; }
      }

      const baseReps = Math.round((minRep + maxRep) / 2);
      const isFixedRep = (minRep === maxRep);
      const rangeStr = isFixedRep ? `${minRep}` : `${minRep}-${maxRep}`;

      // ----------------------------------------------------------------------
      // 1. STRAIGHT SETS
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Straight Sets') {
        const baseRecipeRpe = roundRpe(Number(recipe.targetRpe) || 7.5);
        const topRpe = isGrounding ? 9.0 : roundRpe(Math.min(baseRecipeRpe + weekRpeBump, rpeCap));
        const topLoad = calcLoad(adj, getPct(maxRep, topRpe));
        const backoffLoad = roundLoad(topLoad * 0.90);
        const isPlank = meta.t && !meta.r;
        const targetCount = skipBackoffs ? 1 : baseWorkingSets;

        for (let i = 1; i <= targetCount; i++) {
          const isTop = (i === 1 && isGrounding);
          const load = (i === 1 || !isGrounding) ? topLoad : backoffLoad;
          const rpe = (i === 1 || !isGrounding) ? topRpe : 8.0;
          setArray.push({
            label: isTop ? '🔥 Grounding Top Set (@9.0)' : (isGrounding ? `Back-off ${i - 1} (-10%)` : `Set ${i}`),
            targetLoad: meta.w ? load : 0,
            targetReps: meta.r ? rangeStr : 0,
            targetTime: isPlank ? 60 : 0,
            targetRpe: rpe,
            actualWeight: meta.w ? load : 0,
            actualReps: meta.r ? minRep : 0,
            actualTime: isPlank ? 60 : 0,
            actualRpe: rpe,
            done: false,
            lapRunning: false
          });
        }
        return setArray;
      }

      // ----------------------------------------------------------------------
      // 2. DYNAMIC DOUBLE PROGRESSION (Rep Range Window)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Dynamic Double Progression (Rep Range)') {
        const baseRecipeRpe = roundRpe(Number(recipe.targetRpe) || 7.5);
        const topRpe = isGrounding ? 9.0 : roundRpe(Math.min(baseRecipeRpe + weekRpeBump, rpeCap));
        const topLoad = calcLoad(adj, getPct(maxRep, topRpe));
        const backoffLoad = roundLoad(topLoad * 0.90);
        const targetCount = skipBackoffs ? 1 : baseWorkingSets;

        for (let i = 1; i <= targetCount; i++) {
          const isTop = (i === 1 && isGrounding);
          const load = (i === 1 || !isGrounding) ? topLoad : backoffLoad;
          const rpe = (i === 1 || !isGrounding) ? topRpe : 8.0;
          const repStr = (isGrounding && i > 1) ? `${minRep}` : rangeStr;
          setArray.push({
            label: isTop ? '🔥 Grounding DDP (@9.0)' : (isGrounding ? `Back-off ${i - 1} (-10%)` : `[${rangeStr}r] S${i}`),
            targetLoad: meta.w ? load : 0,
            targetReps: repStr,
            targetTime: 0,
            targetRpe: rpe,
            actualWeight: meta.w ? load : 0,
            actualReps: minRep,
            actualTime: 0,
            actualRpe: rpe,
            done: false,
            lapRunning: false
          });
        }
        return setArray;
      }

      // ----------------------------------------------------------------------
      // 3. MYO-REPS (Rest-Pause Density Clusters)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Myo-reps') {
        const actReps = isFixedRep ? minRep : Math.max(tier === 'Assistance' ? 12 : 10, maxRep + 2);
        const actRpe = isGrounding ? 9.5 : roundRpe(Number(recipe.actRpe) || 9.0);
        const actLoad = calcLoad(adj, getPct(actReps, actRpe));
        const miniReps = Math.max(3, Math.round(actReps * 0.3));
        const restSec = Number(recipe.intraRestSec) || 15;

        setArray.push({
          label: isGrounding ? '🔥 Grounding Activation (@9.5)' : 'Activation Set',
          targetLoad: meta.w ? actLoad : 0,
          targetReps: actReps,
          targetTime: 0,
          targetRpe: actRpe,
          actualWeight: meta.w ? actLoad : 0,
          actualReps: actReps,
          actualTime: 0,
          actualRpe: actRpe,
          done: false,
          lapRunning: false
        });

        if (!skipBackoffs) {
          const miniCount = phase === 'Deload' ? 2 : (Number(recipe.miniSets) || (lifterType === 'Enhanced' ? 5 : 4));
          const miniRpe = roundRpe(Number(recipe.miniRpe) || 9.5);
          for (let i = 1; i <= miniCount; i++) {
            setArray.push({
              label: `Myo Mini ${i}`,
              targetLoad: meta.w ? actLoad : 0,
              targetReps: miniReps,
              targetTime: restSec,
              targetRpe: miniRpe,
              actualWeight: meta.w ? actLoad : 0,
              actualReps: miniReps,
              actualTime: restSec,
              actualRpe: miniRpe,
              done: false,
              lapRunning: false
            });
          }
        }
        return setArray;
      }

      // ----------------------------------------------------------------------
      // 4. REST-PAUSE (Dogcrapp Style)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Rest-Pause (Dogcrapp)') {
        const actReps = isFixedRep ? minRep : Math.max(tier === 'Assistance' ? 10 : 6, baseReps);
        const actRpe = isGrounding ? 10.0 : roundRpe(Number(recipe.actRpe) || 9.5);
        const actLoad = calcLoad(adj, getPct(actReps, actRpe));
        const restSec = Number(recipe.intraRestSec) || 15;

        const rpSets = [
          { label: isGrounding ? '🔥 Grounding Activation (@10.0)' : 'Activation', targetLoad: meta.w ? actLoad : 0, targetReps: actReps, targetTime: 0, targetRpe: actRpe, actualWeight: meta.w ? actLoad : 0, actualReps: actReps, actualTime: 0, actualRpe: actRpe, done: false, lapRunning: false }
        ];

        if (!skipBackoffs) {
          const clusterRpe = roundRpe(Number(recipe.clusterRpe) || 10.0);
          const numClusters = Number(recipe.clusters) || 2;
          for (let c = 1; c <= numClusters; c++) {
            const cReps = Math.max(1, Math.round(actReps / (c + 1)));
            rpSets.push({
              label: `RP Cluster ${c}`,
              targetLoad: meta.w ? actLoad : 0,
              targetReps: cReps,
              targetTime: restSec,
              targetRpe: clusterRpe,
              actualWeight: meta.w ? actLoad : 0,
              actualReps: cReps,
              actualTime: restSec,
              actualRpe: clusterRpe,
              done: false,
              lapRunning: false
            });
          }
        }
        return rpSets;
      }

      // ----------------------------------------------------------------------
      // 5. STEP LOADING (Double Progression)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Step Loading (Double Progression)') {
        const baseRecipeRpe = roundRpe(Number(recipe.targetRpe) || 8.0);
        const targetRpe = isGrounding ? 9.0 : roundRpe(Math.min(baseRecipeRpe + weekRpeBump, rpeCap));
        const l = calcLoad(adj, getPct(maxRep, targetRpe));
        const count = skipBackoffs ? 1 : baseWorkingSets;

        return Array.from({ length: count }, (_, idx) => {
          const isTop = (idx === 0 && isGrounding);
          const load = (idx === 0 || !isGrounding) ? l : roundLoad(l * 0.90);
          const rpe = (idx === 0 || !isGrounding) ? targetRpe : 8.0;
          return {
            label: isTop ? '🔥 Grounding Step (@9.0)' : (isGrounding ? `Back-off ${idx} (-10%)` : `Step ${idx + 1}`),
            targetLoad: meta.w ? load : 0,
            targetReps: rangeStr,
            targetTime: 0,
            targetRpe: rpe,
            actualWeight: meta.w ? load : 0,
            actualReps: minRep,
            actualTime: 0,
            actualRpe: rpe,
            done: false,
            lapRunning: false
          };
        });
      }

      // ----------------------------------------------------------------------
      // 6. DENSITY BLOCK (EDT Clock Target Sets)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Density Block') {
        const dLoadPct = Number(recipe.targetLoadPct) || 65;
        const dLoad = calcLoad(adj, dLoadPct);
        const dReps = meta.r ? (isFixedRep ? minRep : (tier === 'Assistance' ? 10 : Math.max(4, baseReps))) : 0;
        const count = skipBackoffs ? 1 : (Number(recipe.setsCount) || 3);

        return Array.from({ length: count }, (_, idx) => ({
          label: `Density S${idx + 1}`,
          targetLoad: meta.w ? dLoad : 0,
          targetReps: dReps,
          targetTime: 0,
          targetRpe: roundRpe(8.0 + (idx * 0.5)),
          actualWeight: meta.w ? dLoad : 0,
          actualReps: dReps,
          actualTime: 0,
          actualRpe: roundRpe(8.0 + (idx * 0.5)),
          done: false,
          lapRunning: false
        }));
      }

      // ----------------------------------------------------------------------
      // 7. REP GOAL SYSTEM (Metabolic 50 - Calves, Core, Isolations)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Rep Goal System (Metabolic 50)') {
        const repLoad = calcLoad(adj, Number(recipe.targetLoadPct) || 58);
        const repTargets = Array.isArray(recipe.repTargets) ? recipe.repTargets : [15, 13, 12, 10];
        const targetsToRender = skipBackoffs ? [repTargets[0]] : repTargets;

        return targetsToRender.map((reps, idx) => ({
          label: (idx === 0 && isGrounding) ? `🔥 Grounding Goal S1 (${reps}r @9.0)` : `Goal S${idx + 1} (Target ~${reps})`,
          targetLoad: meta.w ? repLoad : 0,
          targetReps: reps,
          targetTime: 0,
          targetRpe: isGrounding && idx === 0 ? 9.0 : roundRpe(8.5 + (idx * 0.5)),
          actualWeight: meta.w ? repLoad : 0,
          actualReps: reps,
          actualTime: 0,
          actualRpe: isGrounding && idx === 0 ? 9.0 : roundRpe(8.5 + (idx * 0.5)),
          done: false,
          lapRunning: false
        }));
      }

      // ----------------------------------------------------------------------
      // 8. REVERSE PYRAMID (RPT Curve - Dynamic Percentage Offsets)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Reverse Pyramid') {
        const topReps = isFixedRep ? minRep : Math.max(tier === 'Assistance' ? 8 : 2, baseReps - 2);
        const baseRecipeRpe = roundRpe(Number(recipe.topRpe) || 8.5);
        const topRpe = isGrounding ? 9.0 : roundRpe(Math.min(baseRecipeRpe + weekRpeBump, rpeCap));
        const topLoad = calcLoad(adj, getPct(topReps, topRpe));

        const drop1Pct = Number(recipe.drop1Pct) || 10;
        const drop2Pct = Number(recipe.drop2Pct) || 20;

        let b1Load = roundLoad(topLoad * (1 - (drop1Pct / 100)));
        let b2Load = roundLoad(topLoad * (1 - (drop2Pct / 100)));
        if (b1Load >= topLoad) b1Load = Math.max(0, topLoad - roundingStep);
        if (b2Load >= b1Load) b2Load = Math.max(0, b1Load - roundingStep);

        const sets = [
          { label: isGrounding ? '🔥 Grounding Top Set (@9.0)' : 'Top Effort', targetLoad: meta.w ? topLoad : 0, targetReps: topReps, targetTime: 0, targetRpe: topRpe, actualWeight: meta.w ? topLoad : 0, actualReps: topReps, actualTime: 0, actualRpe: topRpe, done: false, lapRunning: false }
        ];

        if (!skipBackoffs) {
          sets.push(
            { label: `Backoff 1 (-${drop1Pct}%)`, targetLoad: meta.w ? b1Load : 0, targetReps: topReps + 2, targetTime: 0, targetRpe: 8.0, actualWeight: meta.w ? b1Load : 0, actualReps: topReps + 2, actualTime: 0, actualRpe: 8.0, done: false, lapRunning: false },
            { label: `Backoff 2 (-${drop2Pct}%)`, targetLoad: meta.w ? b2Load : 0, targetReps: topReps + 4, targetTime: 0, targetRpe: 8.5, actualWeight: meta.w ? b2Load : 0, actualReps: topReps + 4, actualTime: 0, actualRpe: 8.5, done: false, lapRunning: false }
          );

          if (baseWorkingSets >= 4) {
            const drop3Pct = Number(recipe.drop3Pct) || 30;
            let b3Load = roundLoad(topLoad * (1 - (drop3Pct / 100)));
            if (b3Load >= b2Load) b3Load = Math.max(0, b2Load - roundingStep);
            sets.push({ label: `Capacity (-${drop3Pct}%)`, targetLoad: meta.w ? b3Load : 0, targetReps: topReps + 6, targetTime: 0, targetRpe: 9.0, actualWeight: meta.w ? b3Load : 0, actualReps: topReps + 6, actualTime: 0, actualRpe: 9.0, done: false, lapRunning: false });
          }
        }
        return sets;
      }

      // ----------------------------------------------------------------------
      // 9. TAPERED (Capacity Cascade)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Tapered') {
        const openerReps = isFixedRep ? minRep : Math.max(tier === 'Assistance' ? 6 : 2, baseReps - 3);
        const openerRpe = isGrounding ? 9.0 : roundRpe(Math.min((Number(recipe.openerRpe) || 8.5) + weekRpeBump, rpeCap));
        const openerLoad = calcLoad(adj, getPct(openerReps, openerRpe));

        const sets = [
          { label: isGrounding ? '🔥 Grounding Opener (@9.0)' : 'Opener Heavy', targetLoad: meta.w ? openerLoad : 0, targetReps: openerReps, targetTime: 0, targetRpe: openerRpe, actualWeight: meta.w ? openerLoad : 0, actualReps: openerReps, actualTime: 0, actualRpe: openerRpe, done: false, lapRunning: false }
        ];

        if (!skipBackoffs) {
          const backLoadPct = Number(recipe.backoffLoadPct) || 85;
          const backLoad = roundLoad(openerLoad * (backLoadPct / 100));
          const backRpe = roundRpe(Number(recipe.backoffRpe) || 8.0);
          sets.push(
            { label: 'Taper Capacity 1', targetLoad: meta.w ? backLoad : 0, targetReps: baseReps + 2, targetTime: 0, targetRpe: backRpe, actualWeight: meta.w ? backLoad : 0, actualReps: baseReps + 2, actualTime: 0, actualRpe: backRpe, done: false, lapRunning: false },
            { label: 'Taper Capacity 2', targetLoad: meta.w ? backLoad : 0, targetReps: baseReps + 2, targetTime: 0, targetRpe: roundRpe(backRpe + 0.5), actualWeight: meta.w ? backLoad : 0, actualReps: baseReps + 2, actualTime: 0, actualRpe: roundRpe(backRpe + 0.5), done: false, lapRunning: false }
          );
        }
        return sets;
      }

      // ----------------------------------------------------------------------
      // 10. ASCENDING PYRAMID
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Ascending Pyramid') {
        const peakReps = isFixedRep ? minRep : Math.max(tier === 'Assistance' ? 8 : 3, baseReps - 2);
        const peakRpe = isGrounding ? 9.0 : roundRpe(Math.min((Number(recipe.peakRpe) || 8.5) + weekRpeBump, rpeCap));
        const peakLoad = calcLoad(adj, getPct(peakReps, peakRpe));

        const rampStep = Number(recipe.rampStepPct) || 9;
        let r2Load = roundLoad(peakLoad * (1 - (rampStep / 100)));
        let r1Load = roundLoad(peakLoad * (1 - ((rampStep * 2) / 100)));

        if (r2Load >= peakLoad) r2Load = Math.max(0, peakLoad - roundingStep);
        if (r1Load >= r2Load) r1Load = Math.max(0, r2Load - roundingStep);

        if (skipBackoffs) {
          return [
            { label: isGrounding ? '🔥 Grounding Peak Set (@9.0)' : 'Peak Set', targetLoad: meta.w ? peakLoad : 0, targetReps: peakReps, targetTime: 0, targetRpe: peakRpe, actualWeight: meta.w ? peakLoad : 0, actualReps: peakReps, actualTime: 0, actualRpe: peakRpe, done: false, lapRunning: false }
          ];
        }

        return [
          { label: `Ramp 1 (-${rampStep * 2}%)`, targetLoad: meta.w ? r1Load : 0, targetReps: peakReps + 4, targetTime: 0, targetRpe: 7.0, actualWeight: meta.w ? r1Load : 0, actualReps: peakReps + 4, actualTime: 0, actualRpe: 7.0, done: false, lapRunning: false },
          { label: `Ramp 2 (-${rampStep}%)`, targetLoad: meta.w ? r2Load : 0, targetReps: peakReps + 2, targetTime: 0, targetRpe: 7.5, actualWeight: meta.w ? r2Load : 0, actualReps: peakReps + 2, actualTime: 0, actualRpe: 7.5, done: false, lapRunning: false },
          { label: isGrounding ? '🔥 Grounding Peak Set (@9.0)' : 'Peak Set', targetLoad: meta.w ? peakLoad : 0, targetReps: peakReps, targetTime: 0, targetRpe: peakRpe, actualWeight: meta.w ? peakLoad : 0, actualReps: peakReps, actualTime: 0, actualRpe: peakRpe, done: false, lapRunning: false }
        ];
      }

      // ----------------------------------------------------------------------
      // 11. VOLUME PYRAMID
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Volume Pyramid') {
        const apexReps = isFixedRep ? minRep : Math.max(tier === 'Assistance' ? 8 : 3, baseReps - 3);
        const midReps = apexReps + 2;
        const basePyramidReps = apexReps + 4;

        const apexRpe = isGrounding ? 9.0 : roundRpe(Math.min((Number(recipe.apexRpe) || 8.5) + weekRpeBump, rpeCap));
        const midRpe = roundRpe(Number(recipe.midRpe) || 8.0);
        const baseRpe = roundRpe(Number(recipe.baseRpe) || 7.5);

        const apexLoad = calcLoad(adj, getPct(apexReps, apexRpe));
        const midLoad = calcLoad(adj, getPct(midReps, midRpe));
        const baseLoad = calcLoad(adj, getPct(basePyramidReps, baseRpe));

        if (skipBackoffs) {
          return [
            { label: isGrounding ? '🔥 Grounding Apex Peak (@9.0)' : 'Apex Peak', targetLoad: meta.w ? apexLoad : 0, targetReps: apexReps, targetTime: 0, targetRpe: apexRpe, actualWeight: meta.w ? apexLoad : 0, actualReps: apexReps, actualTime: 0, actualRpe: apexRpe, done: false, lapRunning: false }
          ];
        }

        return [
          { label: 'Ascent 1', targetLoad: meta.w ? baseLoad : 0, targetReps: basePyramidReps, targetTime: 0, targetRpe: 7.0, actualWeight: meta.w ? baseLoad : 0, actualReps: basePyramidReps, actualTime: 0, actualRpe: 7.0, done: false, lapRunning: false },
          { label: 'Ascent 2', targetLoad: meta.w ? midLoad : 0, targetReps: midReps, targetTime: 0, targetRpe: midRpe, actualWeight: meta.w ? midLoad : 0, actualReps: midReps, actualTime: 0, actualRpe: midRpe, done: false, lapRunning: false },
          { label: isGrounding ? '🔥 Grounding Apex Peak (@9.0)' : 'Apex Peak', targetLoad: meta.w ? apexLoad : 0, targetReps: apexReps, targetTime: 0, targetRpe: apexRpe, actualWeight: meta.w ? apexLoad : 0, actualReps: apexReps, actualTime: 0, actualRpe: apexRpe, done: false, lapRunning: false },
          { label: 'Descent 1', targetLoad: meta.w ? midLoad : 0, targetReps: midReps, targetTime: 0, targetRpe: roundRpe(midRpe + 0.5), actualWeight: meta.w ? midLoad : 0, actualReps: midReps, actualTime: 0, actualRpe: roundRpe(midRpe + 0.5), done: false, lapRunning: false },
          { label: 'Descent 2', targetLoad: meta.w ? baseLoad : 0, targetReps: basePyramidReps, targetTime: 0, targetRpe: 9.0, actualWeight: meta.w ? baseLoad : 0, actualReps: basePyramidReps, actualTime: 0, actualRpe: 9.0, done: false, lapRunning: false }
        ];
      }

      // ----------------------------------------------------------------------
      // 12. FORCE/METABOLIC INTERLEAVE
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Force/Metabolic Interleave') {
        const forceReps = isFixedRep ? minRep : (tier === 'Assistance' ? 8 : Math.max(3, baseReps - 2));
        const forceRpe = isGrounding ? 9.0 : roundRpe(Number(recipe.forceRpe) || 8.5);
        const metaRpe = roundRpe(Number(recipe.metaRpe) || 8.5);
        const metaReps = Number(recipe.metaReps) || 15;

        const forceLoad = calcLoad(adj, getPct(forceReps, forceRpe));
        const metaLoad = calcLoad(adj, getPct(metaReps, metaRpe));

        if (skipBackoffs) {
          return [
            { label: isGrounding ? '🔥 Grounding Force (@9.0)' : `Force (${forceReps}r)`, targetLoad: meta.w ? forceLoad : 0, targetReps: forceReps, targetTime: 0, targetRpe: forceRpe, actualWeight: meta.w ? forceLoad : 0, actualReps: forceReps, actualTime: 0, actualRpe: forceRpe, done: false, lapRunning: false }
          ];
        }

        return [
          { label: isGrounding ? '🔥 Grounding Force (@9.0)' : `Force (${forceReps}r)`, targetLoad: meta.w ? forceLoad : 0, targetReps: forceReps, targetTime: 0, targetRpe: forceRpe, actualWeight: meta.w ? forceLoad : 0, actualReps: forceReps, actualTime: 0, actualRpe: forceRpe, done: false, lapRunning: false },
          { label: `Metabolic (${metaReps}r)`, targetLoad: meta.w ? metaLoad : 0, targetReps: metaReps, targetTime: 0, targetRpe: metaRpe, actualWeight: meta.w ? metaLoad : 0, actualReps: metaReps, actualTime: 0, actualRpe: metaRpe, done: false, lapRunning: false },
          { label: `Force (${forceReps}r)`, targetLoad: meta.w ? forceLoad : 0, targetReps: forceReps, targetTime: 0, targetRpe: forceRpe, actualWeight: meta.w ? forceLoad : 0, actualReps: forceReps, actualTime: 0, actualRpe: forceRpe, done: false, lapRunning: false },
          { label: `Metabolic (${metaReps}r)`, targetLoad: meta.w ? metaLoad : 0, targetReps: metaReps, targetTime: 0, targetRpe: 9.0, actualWeight: meta.w ? metaLoad : 0, actualReps: metaReps, actualTime: 0, actualRpe: 9.0, done: false, lapRunning: false }
        ];
      }

      // ----------------------------------------------------------------------
      // 13. DROP SET
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Drop Set') {
        const topReps = baseReps;
        const workRpe = isGrounding ? 9.0 : roundRpe(Math.min((Number(recipe.workRpe) || 8.0) + weekRpeBump, rpeCap));
        const topLoad = calcLoad(adj, getPct(topReps, workRpe));

        const drop1Pct = Number(recipe.drop1Pct) || 20;
        const drop2Pct = Number(recipe.drop2Pct) || 40;
        const drop1Load = roundLoad(topLoad * (1 - (drop1Pct / 100)));
        const drop2Load = roundLoad(topLoad * (1 - (drop2Pct / 100)));

        if (skipBackoffs) {
          return [
            { label: isGrounding ? '🔥 Grounding Lead (@9.0)' : 'Work Set', targetLoad: meta.w ? topLoad : 0, targetReps: rangeStr, targetTime: 0, targetRpe: workRpe, actualWeight: meta.w ? topLoad : 0, actualReps: minRep, actualTime: 0, actualRpe: workRpe, done: false, lapRunning: false }
          ];
        }

        return [
          { label: isGrounding ? '🔥 Grounding Lead (@9.0)' : 'Work Set', targetLoad: meta.w ? topLoad : 0, targetReps: rangeStr, targetTime: 0, targetRpe: workRpe, actualWeight: meta.w ? topLoad : 0, actualReps: minRep, actualTime: 0, actualRpe: workRpe, done: false, lapRunning: false },
          { label: 'Drop Lead', targetLoad: meta.w ? topLoad : 0, targetReps: rangeStr, targetTime: 0, targetRpe: roundRpe(Math.min(9.5, rpeCap)), actualWeight: meta.w ? topLoad : 0, actualReps: minRep, actualTime: 0, actualRpe: roundRpe(Math.min(9.5, rpeCap)), done: false, lapRunning: false },
          { label: `Strip 1 (-${drop1Pct}%)`, targetLoad: meta.w ? drop1Load : 0, targetReps: baseReps, targetTime: 0, targetRpe: 10.0, actualWeight: meta.w ? drop1Load : 0, actualReps: baseReps, actualTime: 0, actualRpe: 10.0, done: false, lapRunning: false },
          { label: `Strip 2 (-${drop2Pct}%)`, targetLoad: meta.w ? drop2Load : 0, targetReps: baseReps, targetTime: 0, targetRpe: 10.0, actualWeight: meta.w ? drop2Load : 0, actualReps: baseReps, actualTime: 0, actualRpe: 10.0, done: false, lapRunning: false }
        ];
      }

      // ----------------------------------------------------------------------
      // 14. HYPERTROPHY CLUSTER
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Hypertrophy Cluster') {
        const clusterReps = isFixedRep ? minRep : (Number(recipe.clusterReps) || 6);
        const clusterLoad = calcLoad(adj, getPct(clusterReps, 8.0));
        const restSec = Number(recipe.intraRestSec) || 20;
        const count = skipBackoffs ? 1 : baseWorkingSets;

        return Array.from({ length: count }, (_, idx) => ({
          label: (idx === 0 && isGrounding) ? '🔥 Grounding Cluster (@9.0)' : `Cluster ${idx + 1}`,
          targetLoad: meta.w ? clusterLoad : 0,
          targetReps: clusterReps,
          targetTime: restSec,
          targetRpe: isGrounding && idx === 0 ? 9.0 : 8.0,
          actualWeight: meta.w ? clusterLoad : 0,
          actualReps: clusterReps,
          actualTime: restSec,
          actualRpe: isGrounding && idx === 0 ? 9.0 : 8.0,
          done: false,
          lapRunning: false
        }));
      }

      // ----------------------------------------------------------------------
      // 15. ASCENDING TRIPLET + LOAD DROP
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Ascending Triplet + Load Drop') {
        const tReps = isFixedRep ? minRep : (tier === 'Assistance' ? Math.max(8, baseReps) : Math.max(3, baseReps));
        const l7 = calcLoad(adj, getPct(tReps, 7.0));
        const l8 = calcLoad(adj, getPct(tReps, 8.0));
        const topRpe = isGrounding ? 9.5 : roundRpe(Math.min(Number(recipe.topRpe) || 9.0, rpeCap));
        const l9 = calcLoad(adj, getPct(tReps, topRpe));

        const dropPct = Number(recipe.dropPct) || 7;
        const dropLoad = roundLoad(l9 * (1 - (dropPct / 100)));

        const rtsSets = [
          { label: `${tReps}r @7.0`, targetLoad: meta.w ? l7 : 0, targetReps: tReps, targetTime: 0, targetRpe: 7.0, actualWeight: meta.w ? l7 : 0, actualReps: tReps, actualTime: 0, actualRpe: 7.0, done: false, lapRunning: false },
          { label: `${tReps}r @8.0`, targetLoad: meta.w ? l8 : 0, targetReps: tReps, targetTime: 0, targetRpe: 8.0, actualWeight: meta.w ? l8 : 0, actualReps: tReps, actualTime: 0, actualRpe: 8.0, done: false, lapRunning: false },
          { label: isGrounding ? `🔥 Grounding Triplet (${tReps}r @9.5)` : `${tReps}r @${topRpe.toFixed(1)}`, targetLoad: meta.w ? l9 : 0, targetReps: tReps, targetTime: 0, targetRpe: topRpe, actualWeight: meta.w ? l9 : 0, actualReps: tReps, actualTime: 0, actualRpe: topRpe, done: false, lapRunning: false }
        ];

        if (!skipBackoffs && phase !== 'Deload') {
          rtsSets.push({ label: `Down Set (-${dropPct}%)`, targetLoad: meta.w ? dropLoad : 0, targetReps: tReps, targetTime: 0, targetRpe: 8.0, actualWeight: meta.w ? dropLoad : 0, actualReps: tReps, actualTime: 0, actualRpe: 8.0, done: false, lapRunning: false });
        }
        return rtsSets;
      }

      // ----------------------------------------------------------------------
      // 16. ASCENDING RPE LADDER (RPE 6.0/7.0/8.0 Ramp)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Ascending RPE Ladder') {
        const startRpe = roundRpe(Number(recipe.startRpe) || 5.5);
        const midRpe = roundRpe(Number(recipe.midRpe) || 7.0);
        const topRpe = isGrounding ? 9.0 : roundRpe(Math.min((Number(recipe.topRpe) || 8.0) + weekRpeBump, rpeCap));

        const s6Load = calcLoad(adj, getPct(baseReps, startRpe));
        const s7Load = calcLoad(adj, getPct(baseReps, midRpe));
        const s8Load = calcLoad(adj, getPct(baseReps, topRpe));
        
        const startRpeLabel = startRpe <= 5.5 ? '6 (<6)' : startRpe.toFixed(1);
        const midRpeLabel = midRpe.toFixed(1);
        const topRpeLabel = topRpe.toFixed(1);

        const ladderSets = [
          { label: `${rangeStr}r @${startRpeLabel}`, targetLoad: meta.w ? s6Load : 0, targetReps: rangeStr, targetTime: 0, targetRpe: startRpe, actualWeight: meta.w ? s6Load : 0, actualReps: minRep, actualTime: 0, actualRpe: startRpe, done: false, lapRunning: false },
          { label: `${rangeStr}r @${midRpeLabel}`, targetLoad: meta.w ? s7Load : 0, targetReps: rangeStr, targetTime: 0, targetRpe: midRpe, actualWeight: meta.w ? s7Load : 0, actualReps: minRep, actualTime: 0, actualRpe: midRpe, done: false, lapRunning: false },
          { label: isGrounding ? `🔥 Grounding Ladder (${rangeStr}r @9.0)` : `${rangeStr}r @${topRpeLabel}`, targetLoad: meta.w ? s8Load : 0, targetReps: rangeStr, targetTime: 0, targetRpe: topRpe, actualWeight: meta.w ? s8Load : 0, actualReps: minRep, actualTime: 0, actualRpe: topRpe, done: false, lapRunning: false }
        ];

        if (!skipBackoffs && baseWorkingSets >= 4 && phase !== 'Deload') {
          ladderSets.push({ label: 'Repeat Top', targetLoad: meta.w ? s8Load : 0, targetReps: rangeStr, targetTime: 0, targetRpe: topRpe, actualWeight: meta.w ? s8Load : 0, actualReps: minRep, actualTime: 0, actualRpe: topRpe, done: false, lapRunning: false });
        }
        return ladderSets;
      }

      // ----------------------------------------------------------------------
      // 17. TOP SET + BACK-OFF
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Top Set + Back-off') {
        const topReps = isFixedRep ? minRep : Math.max(tier === 'Assistance' ? 8 : 1, baseReps - 4);
        const backReps = isFixedRep ? minRep : topReps + (tier === 'Assistance' ? 4 : 2);
        const baseRecipeRpe = roundRpe(Number(recipe.topRpe) || 8.5);
        const topRpe = isGrounding ? 9.0 : roundRpe(Math.min(baseRecipeRpe + weekRpeBump, rpeCap));
        const backRpe = roundRpe(Math.min((Number(recipe.backoffRpe) || 8.0) + weekRpeBump, rpeCap));
        
        const top = calcLoad(adj, getPct(topReps, topRpe));
        const dropPct = Number(recipe.backoffDropPct) || 10;
        const back = roundLoad(top * (1 - (dropPct / 100)));

        setArray.push({ 
          label: isGrounding ? '🔥 Grounding Top Set (@9.0)' : 'Top Set', 
          targetLoad: meta.w ? top : 0, 
          targetReps: topReps, 
          targetTime: 0, 
          targetRpe: topRpe, 
          actualWeight: meta.w ? top : 0, 
          actualReps: topReps, 
          actualTime: 0, 
          actualRpe: topRpe, 
          done: false, 
          lapRunning: false 
        });

        if (!skipBackoffs) {
          const numBack = Number(recipe.backoffSets) || baseWorkingSets;
          for (let i = 1; i <= numBack; i++) {
            setArray.push({ 
              label: `Backoff ${i} (-${dropPct}%)`, 
              targetLoad: meta.w ? back : 0, 
              targetReps: backReps, 
              targetTime: 0, 
              targetRpe: backRpe, 
              actualWeight: meta.w ? back : 0, 
              actualReps: backReps, 
              actualTime: 0, 
              actualRpe: backRpe, 
              done: false, 
              lapRunning: false 
            });
          }
        }
        return setArray;
      }

      // ----------------------------------------------------------------------
      // 18. PRIMER SINGLE + % BACK-OFFS (1@8.0 + % Sets Across)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Primer Single + % Back-offs') {
        const singleRpe = isGrounding ? 9.0 : roundRpe(Number(recipe.singleRpe) || 8.0);
        const singlePct = Number(recipe.singlePct) || 92;
        const singleLoad = calcLoad(adj, isGrounding ? 95 : singlePct);
        const dropPct = Number(recipe.backoffDropPct) || 12;
        const backoffLoad = roundLoad(singleLoad * (1 - (dropPct / 100)));

        const bbmSingleSets = [
          { 
            label: isGrounding ? '🔥 Grounding Single (1@9.0)' : `1@${singleRpe.toFixed(1)} Single`, 
            targetLoad: meta.w ? singleLoad : 0, 
            targetReps: 1, 
            targetTime: 0, 
            targetRpe: singleRpe, 
            actualWeight: meta.w ? singleLoad : 0, 
            actualReps: 1, 
            actualTime: 0, 
            actualRpe: singleRpe, 
            done: false, 
            lapRunning: false 
          }
        ];

        if (!skipBackoffs) {
          const numBackoffs = phase === 'Deload' ? 2 : (Number(recipe.backoffSets) || baseWorkingSets);
          for (let i = 1; i <= numBackoffs; i++) {
            bbmSingleSets.push({
              label: `Back-off ${i} (-${dropPct}%)`,
              targetLoad: meta.w ? backoffLoad : 0,
              targetReps: rangeStr,
              targetTime: 0,
              targetRpe: 8.0,
              actualWeight: meta.w ? backoffLoad : 0,
              actualReps: minRep,
              actualTime: 0,
              actualRpe: 8.0,
              done: false,
              lapRunning: false
            });
          }
        }
        return bbmSingleSets;
      }

      // ----------------------------------------------------------------------
      // 19. BENCHMARK + DENSITY BACK-OFF (30-60s Rest Waves)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Benchmark + Density Back-Off') {
        const benchReps = isFixedRep ? minRep : Math.max(1, Math.min(4, baseReps - 3));
        const benchRpe = isGrounding ? 9.0 : roundRpe(Number(recipe.benchRpe) || 8.0);
        const benchLoad = calcLoad(adj, getPct(benchReps, benchRpe));

        const dropPct = Number(recipe.densityDropPct) || 14;
        const densityLoad = roundLoad(benchLoad * (1 - (dropPct / 100)));
        const densityReps = benchReps === 1 ? 2 : (benchReps === 2 ? 3 : 5);
        const restSec = Number(recipe.intraRestSec) || 45;

        const rtsBenchSets = [
          { 
            label: isGrounding ? `🔥 Grounding Benchmark (${benchReps}@9.0)` : `Benchmark (${benchReps}@${benchRpe.toFixed(1)})`, 
            targetLoad: meta.w ? benchLoad : 0, 
            targetReps: benchReps, 
            targetTime: 0, 
            targetRpe: benchRpe, 
            actualWeight: meta.w ? benchLoad : 0, 
            actualReps: benchReps, 
            actualTime: 0, 
            actualRpe: benchRpe, 
            done: false, 
            lapRunning: false 
          }
        ];

        if (!skipBackoffs) {
          const numDensitySets = phase === 'Deload' ? 3 : (Number(recipe.densitySets) || 6);
          for (let i = 1; i <= numDensitySets; i++) {
            rtsBenchSets.push({
              label: `Density ${i} (${restSec}s Rest)`,
              targetLoad: meta.w ? densityLoad : 0,
              targetReps: densityReps,
              targetTime: restSec,
              targetRpe: 7.0,
              actualWeight: meta.w ? densityLoad : 0,
              actualReps: densityReps,
              actualTime: restSec,
              actualRpe: 7.0,
              done: false,
              lapRunning: false
            });
          }
        }
        return rtsBenchSets;
      }

      // ----------------------------------------------------------------------
      // 20. SUBMAXIMAL AMRAP CALIBRATION (10@9.0 Probe + 12@62% Volume)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Submaximal AMRAP Calibration') {
        const anchorReps = Number(recipe.anchorReps) || 10;
        const anchorRpe = isGrounding ? 9.5 : roundRpe(Number(recipe.anchorRpe) || 9.0);
        const anchorPct = Number(recipe.anchorPct) || 70;
        const amrapLoad = calcLoad(adj, anchorPct);

        const repeatReps = Number(recipe.repeatReps) || 12;
        const repeatRpe = roundRpe(Number(recipe.repeatRpe) || 7.5);
        const repeatPct = Number(recipe.repeatPct) || 62;
        const backVolumeLoad = calcLoad(adj, repeatPct);

        const amrapSets = [
          { 
            label: isGrounding ? `🔥 Grounding AMRAP Anchor (${anchorReps}r @9.5)` : `Anchor Probe (${anchorReps}r @${anchorRpe.toFixed(1)})`, 
            targetLoad: meta.w ? amrapLoad : 0, 
            targetReps: anchorReps, 
            targetTime: 0, 
            targetRpe: anchorRpe, 
            actualWeight: meta.w ? amrapLoad : 0, 
            actualReps: anchorReps, 
            actualTime: 0, 
            actualRpe: anchorRpe, 
            done: false, 
            lapRunning: false 
          }
        ];

        if (!skipBackoffs) {
          const numBack = phase === 'Deload' ? 2 : (Number(recipe.backoffSets) || (baseWorkingSets >= 4 ? 4 : 3));
          for (let i = 1; i <= numBack; i++) {
            amrapSets.push({
              label: `Repeat ${i} (${repeatReps}r @${repeatRpe.toFixed(1)})`,
              targetLoad: meta.w ? backVolumeLoad : 0,
              targetReps: repeatReps,
              targetTime: 0,
              targetRpe: repeatRpe,
              actualWeight: meta.w ? backVolumeLoad : 0,
              actualReps: repeatReps,
              actualTime: 0,
              actualRpe: repeatRpe,
              done: false,
              lapRunning: false
            });
          }
        }
        return amrapSets;
      }

      // ----------------------------------------------------------------------
      // 21. AUTOREGULATED FATIGUE STOP (Stop at RPE Threshold)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Autoregulated Fatigue Stop') {
        const stopRpe = roundRpe(Number(recipe.stopRpe) || 9.0);
        const targetRpe = roundRpe(Number(recipe.targetRpe) || 8.0);
        const stopLoad = calcLoad(adj, getPct(baseReps, targetRpe));
        const count = skipBackoffs ? 1 : baseWorkingSets;

        return Array.from({ length: count }, (_, idx) => {
          const isTop = (idx === 0 && isGrounding);
          const load = (idx === 0 || !isGrounding) ? stopLoad : roundLoad(stopLoad * 0.90);
          const rpe = (idx === 0 || !isGrounding) ? (isGrounding ? 9.0 : targetRpe) : 8.0;
          return {
            label: isTop ? '🔥 Grounding Stop Set (@9.0)' : (isGrounding ? `Back-off ${idx} (-10%)` : `Set ${idx + 1} (Stop @${stopRpe.toFixed(1)})`),
            targetLoad: meta.w ? load : 0,
            targetReps: rangeStr,
            targetTime: 0,
            targetRpe: rpe,
            actualWeight: meta.w ? load : 0,
            actualReps: minRep,
            actualTime: 0,
            actualRpe: rpe,
            done: false,
            lapRunning: false
          };
        });
      }

      // ----------------------------------------------------------------------
      // 22. DYNAMIC EFFORT (Speed Waves)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Dynamic Effort (Speed Waves)') {
        const baseSpeedPct = Number(recipe.basePct) || 65;
        const stepPct = Number(recipe.speedStepPct) || 2.5;
        const speedPct = baseSpeedPct + ((w - 1) * stepPct);
        const speedLoad = calcLoad(adj, speedPct);
        const speedReps = Number(recipe.reps) || 3;
        const setsCount = skipBackoffs ? 2 : (phase === 'Deload' ? 3 : (Number(recipe.setsCount) || (lifterType === 'Enhanced' ? 8 : 6)));

        return Array.from({ length: setsCount }, (_, idx) => ({
          label: `DE Set ${idx + 1}`,
          targetLoad: meta.w ? speedLoad : 0,
          targetReps: speedReps,
          targetTime: 0,
          targetRpe: 7.0,
          actualWeight: meta.w ? speedLoad : 0,
          actualReps: speedReps,
          actualTime: 0,
          actualRpe: 7.0,
          done: false,
          lapRunning: false
        }));
      }

      // ----------------------------------------------------------------------
      // 23. INTRA-SET CLUSTER (4x[2+2+2])
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Intra-Set Cluster (4x[2+2+2])') {
        const clusterLoad = calcLoad(adj, Number(recipe.loadPct) || 85);
        const restSec = Number(recipe.intraRestSec) || 15;
        const numClusters = skipBackoffs ? 1 : (phase === 'Deload' ? 2 : (Number(recipe.setsCount) || baseWorkingSets));

        return Array.from({ length: numClusters }, (_, idx) => ({
          label: (idx === 0 && isGrounding) ? '🔥 Grounding Cluster [2+2+2] (@9.0)' : `Cluster [2+2+2] Set ${idx + 1}`,
          targetLoad: meta.w ? clusterLoad : 0,
          targetReps: 6,
          targetTime: restSec,
          targetRpe: isGrounding && idx === 0 ? 9.0 : roundRpe(Math.min(8.0 + weekRpeBump, rpeCap)),
          actualWeight: meta.w ? clusterLoad : 0,
          actualReps: 6,
          actualTime: restSec,
          actualRpe: isGrounding && idx === 0 ? 9.0 : roundRpe(Math.min(8.0 + weekRpeBump, rpeCap)),
          done: false,
          lapRunning: false
        }));
      }

      // ----------------------------------------------------------------------
      // 24. AUTOREGULATED FATIGUE DROP (-5%)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Autoregulated Fatigue Drop (-5%)') {
        const topReps = isFixedRep ? minRep : Math.max(tier === 'Assistance' ? 8 : 2, baseReps - 2);
        const topRpe = isGrounding ? 9.0 : roundRpe(Number(recipe.topRpe) || 8.5);
        const topLoad = calcLoad(adj, getPct(topReps, topRpe));
        const dropPct = Number(recipe.dropPct) || 5;
        const dropLoad = roundLoad(topLoad * (1 - (dropPct / 100)));

        if (skipBackoffs) {
          return [
            { label: isGrounding ? '🔥 Grounding Top Set (@9.0)' : `Top Set @${topRpe.toFixed(1)}`, targetLoad: meta.w ? topLoad : 0, targetReps: topReps, targetTime: 0, targetRpe: topRpe, actualWeight: meta.w ? topLoad : 0, actualReps: topReps, actualTime: 0, actualRpe: topRpe, done: false, lapRunning: false }
          ];
        }

        return [
          { label: isGrounding ? '🔥 Grounding Top Set (@9.0)' : `Top Set @${topRpe.toFixed(1)}`, targetLoad: meta.w ? topLoad : 0, targetReps: topReps, targetTime: 0, targetRpe: topRpe, actualWeight: meta.w ? topLoad : 0, actualReps: topReps, actualTime: 0, actualRpe: topRpe, done: false, lapRunning: false },
          { label: `Drop 1 (-${dropPct}%)`, targetLoad: meta.w ? dropLoad : 0, targetReps: topReps, targetTime: 0, targetRpe: 8.0, actualWeight: meta.w ? dropLoad : 0, actualReps: topReps, actualTime: 0, actualRpe: 8.0, done: false, lapRunning: false },
          { label: `Drop 2 (-${dropPct}%)`, targetLoad: meta.w ? dropLoad : 0, targetReps: topReps, targetTime: 0, targetRpe: 8.5, actualWeight: meta.w ? dropLoad : 0, actualReps: topReps, actualTime: 0, actualRpe: 8.5, done: false, lapRunning: false }
        ];
      }

      // ----------------------------------------------------------------------
      // 25. PRESCRIPTION TABLE (Velocity Focus)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Prescription Table') {
        const pReps = isFixedRep ? minRep : (tier === 'Assistance' ? 8 : Math.max(2, baseReps - 3));
        const pRpe = isGrounding ? 9.0 : roundRpe(Number(recipe.targetRpe) || 7.5);
        const pLoad = calcLoad(adj, getPct(pReps, pRpe));
        const count = skipBackoffs ? 1 : (Number(recipe.setsCount) || baseWorkingSets);

        return Array.from({ length: count }, (_, idx) => {
          const isTop = (idx === 0 && isGrounding);
          const load = (idx === 0 || !isGrounding) ? pLoad : roundLoad(pLoad * 0.90);
          const rpe = (idx === 0 || !isGrounding) ? pRpe : 7.0;
          return {
            label: isTop ? '🔥 Grounding Precision (@9.0)' : (isGrounding ? `Back-off ${idx} (-10%)` : `Precision ${idx + 1}`),
            targetLoad: meta.w ? load : 0,
            targetReps: pReps,
            targetTime: 0,
            targetRpe: rpe,
            actualWeight: meta.w ? load : 0,
            actualReps: pReps,
            actualTime: 0,
            actualRpe: rpe,
            done: false,
            lapRunning: false
          };
        });
      }

      // ----------------------------------------------------------------------
      // 26. WAVE LOADING
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Wave Loading') {
        const wBase = isFixedRep ? minRep : (tier === 'Assistance' ? 8 : Math.max(4, baseReps));
        const wMid = isFixedRep ? minRep : (tier === 'Assistance' ? 6 : Math.max(2, wBase - 2));
        const wTop = isFixedRep ? minRep : (tier === 'Assistance' ? 4 : Math.max(1, wMid - 2));

        const w1TopRpe = roundRpe(Number(recipe.wave1TopRpe) || 8.5);
        const w2TopRpe = isGrounding ? 9.5 : roundRpe(Number(recipe.wave2TopRpe) || 9.0);

        const w1_1 = calcLoad(adj, getPct(wBase, 7.5));
        const w1_2 = calcLoad(adj, getPct(wMid, 8.0));
        const w1_3 = calcLoad(adj, getPct(wTop, w1TopRpe));
        const w2_1 = calcLoad(adj, getPct(wBase, 8.0));
        const w2_2 = calcLoad(adj, getPct(wMid, 8.5));
        const w2_3 = calcLoad(adj, getPct(wTop, w2TopRpe));

        if (skipBackoffs) {
          return [
            { label: isGrounding ? `🔥 Grounding Wave Peak (${wTop}r @${w2TopRpe.toFixed(1)})` : `Wave Peak (${wTop}r)`, targetLoad: meta.w ? w2_3 : 0, targetReps: wTop, targetTime: 0, targetRpe: w2TopRpe, actualWeight: meta.w ? w2_3 : 0, actualReps: wTop, actualTime: 0, actualRpe: w2TopRpe, done: false, lapRunning: false }
          ];
        }

        return [
          { label: `Wave 1 (${wBase}r)`, targetLoad: meta.w ? w1_1 : 0, targetReps: wBase, targetTime: 0, targetRpe: 7.5, actualWeight: meta.w ? w1_1 : 0, actualReps: wBase, actualTime: 0, actualRpe: 7.5, done: false, lapRunning: false },
          { label: `Wave 1 (${wMid}r)`, targetLoad: meta.w ? w1_2 : 0, targetReps: wMid, targetTime: 0, targetRpe: 8.0, actualWeight: meta.w ? w1_2 : 0, actualReps: wMid, actualTime: 0, actualRpe: 8.0, done: false, lapRunning: false },
          { label: `Wave 1 (${wTop}r)`, targetLoad: meta.w ? w1_3 : 0, targetReps: wTop, targetTime: 0, targetRpe: w1TopRpe, actualWeight: meta.w ? w1_3 : 0, actualReps: wTop, actualTime: 0, actualRpe: w1TopRpe, done: false, lapRunning: false },
          { label: `Wave 2 (${wBase}r)`, targetLoad: meta.w ? w2_1 : 0, targetReps: wBase, targetTime: 0, targetRpe: 8.0, actualWeight: meta.w ? w2_1 : 0, actualReps: wBase, actualTime: 0, actualRpe: 8.0, done: false, lapRunning: false },
          { label: `Wave 2 (${wMid}r)`, targetLoad: meta.w ? w2_2 : 0, targetReps: wMid, targetTime: 0, targetRpe: 8.5, actualWeight: meta.w ? w2_2 : 0, actualReps: wMid, actualTime: 0, actualRpe: 8.5, done: false, lapRunning: false },
          { label: isGrounding ? `🔥 Grounding Wave Peak (${wTop}r @${w2TopRpe.toFixed(1)})` : `Wave 2 (${wTop}r)`, targetLoad: meta.w ? w2_3 : 0, targetReps: wTop, targetTime: 0, targetRpe: w2TopRpe, actualWeight: meta.w ? w2_3 : 0, actualReps: wTop, actualTime: 0, actualRpe: w2TopRpe, done: false, lapRunning: false }
        ];
      }

      // ----------------------------------------------------------------------
      // 27. DOUBLE PYRAMID
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Double Pyramid') {
        const apexPeakReps = isFixedRep ? minRep : Math.max(tier === 'Assistance' ? 6 : 2, baseReps - 3);
        const peakRpe = isGrounding ? 9.0 : roundRpe(Math.min((Number(recipe.peakRpe) || 8.5) + weekRpeBump, rpeCap));
        const peakLoad = calcLoad(adj, getPct(apexPeakReps, peakRpe));

        const midUpLoad = calcLoad(adj, getPct(apexPeakReps + 2, 7.5));
        const baseUpLoad = calcLoad(adj, getPct(apexPeakReps + 5, 7.0));
        const midDownLoad = calcLoad(adj, getPct(apexPeakReps + 2, 8.5));
        const baseDownLoad = calcLoad(adj, getPct(apexPeakReps + 5, 9.0));

        if (skipBackoffs) {
          return [
            { label: isGrounding ? '🔥 Grounding Peak (@9.0)' : `Peak (${apexPeakReps}r)`, targetLoad: meta.w ? peakLoad : 0, targetReps: apexPeakReps, targetTime: 0, targetRpe: peakRpe, actualWeight: meta.w ? peakLoad : 0, actualReps: apexPeakReps, actualTime: 0, actualRpe: peakRpe, done: false, lapRunning: false }
          ];
        }

        return [
          { label: `Base Up (${apexPeakReps + 5}r)`, targetLoad: meta.w ? baseUpLoad : 0, targetReps: apexPeakReps + 5, targetTime: 0, targetRpe: 7.0, actualWeight: meta.w ? baseUpLoad : 0, actualReps: apexPeakReps + 5, actualTime: 0, actualRpe: 7.0, done: false, lapRunning: false },
          { label: `Mid Up (${apexPeakReps + 2}r)`, targetLoad: meta.w ? midUpLoad : 0, targetReps: apexPeakReps + 2, targetTime: 0, targetRpe: 7.5, actualWeight: meta.w ? midUpLoad : 0, actualReps: apexPeakReps + 2, actualTime: 0, actualRpe: 7.5, done: false, lapRunning: false },
          { label: isGrounding ? '🔥 Grounding Peak (@9.0)' : `Peak (${apexPeakReps}r)`, targetLoad: meta.w ? peakLoad : 0, targetReps: apexPeakReps, targetTime: 0, targetRpe: peakRpe, actualWeight: meta.w ? peakLoad : 0, actualReps: apexPeakReps, actualTime: 0, actualRpe: peakRpe, done: false, lapRunning: false },
          { label: `Mid Down (${apexPeakReps + 2}r)`, targetLoad: meta.w ? midDownLoad : 0, targetReps: apexPeakReps + 2, targetTime: 0, targetRpe: 8.5, actualWeight: meta.w ? midDownLoad : 0, actualReps: apexPeakReps + 2, actualTime: 0, actualRpe: 8.5, done: false, lapRunning: false },
          { label: `Base Down (${apexPeakReps + 5}r)`, targetLoad: meta.w ? baseDownLoad : 0, targetReps: apexPeakReps + 5, targetTime: 0, targetRpe: 9.0, actualWeight: meta.w ? baseDownLoad : 0, actualReps: apexPeakReps + 5, actualTime: 0, actualRpe: 9.0, done: false, lapRunning: false }
        ];
      }

      // ----------------------------------------------------------------------
      // 28. SAWTOOTH
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Sawtooth') {
        const heavyReps = isFixedRep ? minRep : Math.max(tier === 'Assistance' ? 6 : 2, baseReps - 3);
        const repReps = heavyReps + 4;
        const heavyRpe = isGrounding ? 9.0 : roundRpe(Number(recipe.heavyRpe) || 8.5);
        const repRpe = roundRpe(Number(recipe.repRpe) || 8.0);

        const heavyLoad = calcLoad(adj, getPct(heavyReps, heavyRpe));
        const repLoad = calcLoad(adj, getPct(repReps, repRpe));

        if (skipBackoffs) {
          return [
            { label: isGrounding ? '🔥 Grounding Heavy Tooth (@9.0)' : `Sawtooth Heavy (${heavyReps}r)`, targetLoad: meta.w ? heavyLoad : 0, targetReps: heavyReps, targetTime: 0, targetRpe: heavyRpe, actualWeight: meta.w ? heavyLoad : 0, actualReps: heavyReps, actualTime: 0, actualRpe: heavyRpe, done: false, lapRunning: false }
          ];
        }

        return [
          { label: `Sawtooth 1 (${repReps}r)`, targetLoad: meta.w ? repLoad : 0, targetReps: repReps, targetTime: 0, targetRpe: repRpe, actualWeight: meta.w ? repLoad : 0, actualReps: repReps, actualTime: 0, actualRpe: repRpe, done: false, lapRunning: false },
          { label: isGrounding ? '🔥 Grounding Heavy Tooth (@9.0)' : `Sawtooth 1 (${heavyReps}r)`, targetLoad: meta.w ? heavyLoad : 0, targetReps: heavyReps, targetTime: 0, targetRpe: heavyRpe, actualWeight: meta.w ? heavyLoad : 0, actualReps: heavyReps, actualTime: 0, actualRpe: heavyRpe, done: false, lapRunning: false },
          { label: `Sawtooth 2 (${repReps}r)`, targetLoad: meta.w ? repLoad : 0, targetReps: repReps, targetTime: 0, targetRpe: repRpe, actualWeight: meta.w ? repLoad : 0, actualReps: repReps, actualTime: 0, actualRpe: repRpe, done: false, lapRunning: false },
          { label: `Sawtooth 2 (${heavyReps}r)`, targetLoad: meta.w ? heavyLoad : 0, targetReps: heavyReps, targetTime: 0, targetRpe: heavyRpe, actualWeight: meta.w ? heavyLoad : 0, actualReps: heavyReps, actualTime: 0, actualRpe: heavyRpe, done: false, lapRunning: false }
        ];
      }

      // ----------------------------------------------------------------------
      // 29. STRENGTH CLUSTER
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Strength Cluster') {
        const cLoad = calcLoad(adj, Number(recipe.loadPct) || 88);
        const restSec = Number(recipe.intraRestSec) || 30;
        const reps = isFixedRep ? minRep : (Number(recipe.reps) || 2);
        const count = skipBackoffs ? 1 : (Number(recipe.setsCount) || 4);

        return Array.from({ length: count }, (_, idx) => ({
          label: (idx === 0 && isGrounding) ? `🔥 Grounding Heavy Cluster (${reps}r @9.0)` : `Heavy Cluster ${idx + 1}`,
          targetLoad: meta.w ? cLoad : 0,
          targetReps: reps,
          targetTime: restSec,
          targetRpe: isGrounding && idx === 0 ? 9.0 : 8.5,
          actualWeight: meta.w ? cLoad : 0,
          actualReps: reps,
          actualTime: restSec,
          actualRpe: isGrounding && idx === 0 ? 9.0 : 8.5,
          done: false,
          lapRunning: false
        }));
      }

      // ----------------------------------------------------------------------
      // 30. e1RM GROUNDING AMRAP
      // ----------------------------------------------------------------------
      if (cleanScheme === 'e1RM Grounding AMRAP') {
        const warmup1 = calcLoad(adj, Number(recipe.primer1Pct) || 65);
        const warmup2 = calcLoad(adj, Number(recipe.primer2Pct) || 75);
        const anchorRpe = roundRpe(Number(recipe.anchorRpe) || 9.5);
        const anchorLoad = calcLoad(adj, getPct(5, anchorRpe));

        if (skipBackoffs) {
          return [
            { label: '🔥 Anchor AMRAP (@9.5)', targetLoad: meta.w ? anchorLoad : 0, targetReps: 5, targetTime: 0, targetRpe: anchorRpe, actualWeight: meta.w ? anchorLoad : 0, actualReps: 5, actualTime: 0, actualRpe: anchorRpe, done: false, lapRunning: false }
          ];
        }

        return [
          { label: 'Primer 1', targetLoad: meta.w ? warmup1 : 0, targetReps: 5, targetTime: 0, targetRpe: 5.5, actualWeight: meta.w ? warmup1 : 0, actualReps: 5, actualTime: 0, actualRpe: 5.5, done: false, lapRunning: false },
          { label: 'Primer 2', targetLoad: meta.w ? warmup2 : 0, targetReps: 3, targetTime: 0, targetRpe: 7.0, actualWeight: meta.w ? warmup2 : 0, actualReps: 3, actualTime: 0, actualRpe: 7.0, done: false, lapRunning: false },
          { label: '🔥 Anchor AMRAP (@9.5)', targetLoad: meta.w ? anchorLoad : 0, targetReps: 5, targetTime: 0, targetRpe: anchorRpe, actualWeight: meta.w ? anchorLoad : 0, actualReps: 5, actualTime: 0, actualRpe: anchorRpe, done: false, lapRunning: false }
        ];
      }

      // ----------------------------------------------------------------------
      // 31. INTENSITY MATCHED (Default / Custom Split Fallback)
      // ----------------------------------------------------------------------
      const baseRecipeRpe = roundRpe(Number(recipe.targetRpe) || 8.0);
      const topRpe = isGrounding ? 9.0 : baseRecipeRpe;
      const imLoad = calcLoad(adj, getPct(baseReps, topRpe));
      const backoffLoad = roundLoad(imLoad * 0.90);
      const count = skipBackoffs ? 1 : baseWorkingSets;

      return Array.from({ length: count }, (_, idx) => {
        const isTop = (idx === 0 && isGrounding);
        const load = (idx === 0 || !isGrounding) ? imLoad : backoffLoad;
        const rpe = (idx === 0 || !isGrounding) ? topRpe : 7.5;
        return {
          label: isTop ? '🔥 Grounding Match (@9.0)' : (isGrounding ? `Back-off ${idx} (-10%)` : `Match ${idx + 1}`),
          targetLoad: meta.w ? load : 0,
          targetReps: rangeStr,
          targetTime: 0,
          targetRpe: rpe,
          actualWeight: meta.w ? load : 0,
          actualReps: minRep,
          actualTime: 0,
          actualRpe: rpe,
          done: false,
          lapRunning: false
        };
      });
    }

    window.apexCore.buildSets = buildSets;
    window.apexCore.getActiveBlock = getActiveBlock;
    window.buildSets = buildSets;
    window.getActiveBlock = getActiveBlock;
  } catch (err) {
    console.error("APEX Engine Part 2 initialization error:", err);
  }
})();
// ============================================================================
// APEX TRAINING ENGINE - PART 3 OF 4: CONTROLLER ACTIONS & RUNTIME ENGINE
// Complete Production Release v4.6.0-PWA (Wizard & 1RM Engine Controllers)
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

  // State initialization safeguards
  if (!state.anchorE1rms) state.anchorE1rms = {};
  if (!state.settings) state.settings = {};
  if (!state.settings.e1rmBlending) state.settings.e1rmBlending = 'moderate';
  if (!state.settings.oneRmFormula) state.settings.oneRmFormula = 'apex';
  if (!state.schemeRecipes) state.schemeRecipes = JSON.parse(JSON.stringify(core.defaultSchemeRecipes || {}));
  if (!state.activeRecipeScheme) state.activeRecipeScheme = 'Reverse Pyramid';
  if (!state.wizardModal) state.wizardModal = { open: false, data: null };

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
    getMacrocyclePosition = () => ({ blockIdx: 0, week: 1, phase: 'Hypertrophy', block: { phase: 'Hypertrophy', weeks: 3 } }),
    syncMacrocycleProgression = () => {},
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
    const meta = getExMeta(exName);
    const bw = getLatestBodyweight(targetDateKey);
    const w = Number(inputWeight) || 0;

    if (exName === 'BW Pull Up' || exName === 'Pull Up' || exName === 'BW Chin Up') {
      return Math.round(bw * 1.0) + w;
    }
    if (exName === 'BW Dips' || exName === 'Dips') {
      return Math.round(bw * 0.90) + w;
    }
    if (exName === 'Push Up') {
      return Math.round(bw * 0.65) + w;
    }
    if (exName === 'Ab Wheel' || exName === 'Hanging Leg Raise') {
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

  window.appActions = {
    // Navigation & Shell
    toggleDrawer(e) { if (e?.stopPropagation) e.stopPropagation(); state.drawerOpen = !state.drawerOpen; safeRender(); },
    navigate(screen, e) { if (e?.stopPropagation) e.stopPropagation(); state.screen = screen; state.drawerOpen = false; safeRender(); },
    changeMonth(delta) { state.month += delta; if (state.month > 11) { state.month = 0; state.year++; } if (state.month < 0) { state.month = 11; state.year--; } safeRender(); },
    jumpToToday() { const t = new Date(); state.year = t.getFullYear(); state.month = t.getMonth(); state.selectedDay = t.getDate(); safeRender(); },

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

    // Workout Staging & Templates
    initStaging() {
      if (state.activeWorkout && state.activeWorkout.length && Number(state.activeWorkoutDay) === Number(state.selectedDay)) {
        state.screen = 'logger';
        safeRender();
        return;
      }
      const k = formatIsoDate(state.year, state.month, state.selectedDay);
      if (state.savedStaged && state.savedStaged[k] && state.savedStaged[k].length > 0) {
        state.stagedSlots = JSON.parse(JSON.stringify(state.savedStaged[k]));
      } else {
        state.stagedSlots = generateBlueprint(state.selectedDay);
      }
      state.stagedSlots.forEach(s => {
        s.tier = s.tier || 'Main';
        s.category = s.category || 'Logged';
        s.modifiers = sanitizeModifiers(s.modifiers);
        s.scheme = normalizeSchemeName(s.scheme);
        if (s.isGrounding === undefined) s.isGrounding = false;
        if (s.skipBackoffs === undefined) s.skipBackoffs = false;
      });
      persist();
      state.dateActionModal.open = false;
      state.screen = 'staging';
      state.drawerOpen = false;
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
      persist();
      window.pushToCloud(false);
      showToast(`Saved plan for ${monthNames[state.month]} ${state.selectedDay}!`);
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
      const anchorE1 = getBaseAnchorE1rm(slot.exercise, slot.modifiers);
      const targetDateKey = formatIsoDate(state.year, state.month, state.selectedDay);
      slot.sets = dispatchBuildSets(cleanVal, anchorE1, 1.0, slot.tier, slot.exercise, slot.modifiers, {
        dateKey: targetDateKey,
        isGrounding: slot.isGrounding,
        skipBackoffs: slot.skipBackoffs
      });
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

      // 2. Advance to Next Macrocycle Block
      if (state.macrocycle && state.macrocycle.length) {
        state.activeBlockIdx = (state.activeBlockIdx + 1) % state.macrocycle.length;
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
      
      if (field === 'enableRpeProgression') {
        state.schemeRecipes[cleanScheme][field] = Boolean(val === true || val === 'true');
      } else if (Array.isArray(val)) {
        state.schemeRecipes[cleanScheme][field] = val;
      } else if (typeof field === 'string' && field.toLowerCase().includes('rpe')) {
        state.schemeRecipes[cleanScheme][field] = roundRpe(val);
      } else {
        const num = Number(val);
        state.schemeRecipes[cleanScheme][field] = isNaN(num) ? val : num;
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

    resetSchemeRecipes() {
      state.schemeRecipes = JSON.parse(JSON.stringify(core.defaultSchemeRecipes || {}));
      persist();
      triggerCloudSync(1500);
      showToast("Reset scheme recipes to system defaults");
      safeRender();
    },

    exportProgrammingBuilderJson() {
      const chassisData = {
        version: core.APP_VERSION || 'v4.6.1-PWA',
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
      syncMacrocycleProgression(targetDateKey);
      const r = getRollingReadiness(targetDateKey, 3);
      const readyBand = getReadinessBand(r);
      const pos = getMacrocyclePosition(targetDateKey);
      const w = pos.week || 1;

      state.sStart = Date.now();
      state.restStart = Date.now();
      state.sessionSecs = 0;
      state.restStopwatchSecs = 0;
      state.activeWorkoutDay = state.selectedDay;
      state.activeWorkoutDateKey = targetDateKey;
      state.isEditingHistorical = false;
      state.historicalDateKey = null;
      resumeStopwatch();

      state.activeWorkout = state.stagedSlots.map(slot => {
        const cleanMods = sanitizeModifiers(slot.modifiers);
        const anchorE1 = getBaseAnchorE1rm(slot.exercise, cleanMods);
        const dPct = w <= 2 ? 65 : 75;
        return {
          tier: slot.tier || 'Main',
          category: slot.category || 'Logged',
          exercise: slot.exercise,
          modifiers: [...cleanMods],
          scheme: normalizeSchemeName(slot.scheme),
          isGrounding: Boolean(slot.isGrounding),
          skipBackoffs: Boolean(slot.skipBackoffs),
          fatigueWarning: false,
          densityLoad: calcLoad(anchorE1 * readyBand.factor, dPct),
          densitySec: 480,
          densityTotalSec: 480,
          densityRunning: false,
          densityTimerObj: null,
          densityReps: 0,
          sets: dispatchBuildSets(slot.scheme, anchorE1, readyBand.factor, slot.tier, slot.exercise, cleanMods, {
            dateKey: targetDateKey,
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

      state.restStart = Date.now();
      state.restStopwatchSecs = 0;
      const rEl = document.getElementById('workout-rest-display');
      if (rEl) rEl.innerText = '0:00';

      if (s.done) {
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
      ex.sets.forEach(s => {
        if (!s.done) {
          s.targetLoad = roundLoad(s.targetLoad * 0.95);
          s.actualWeight = s.targetLoad;
        }
      });
      ex.fatigueWarning = false;
      persist();
      triggerCloudSync(1500);
      showToast("Applied -5% load drop to remaining sets");
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

      const targetKey = state.isEditingHistorical 
        ? state.historicalDateKey 
        : (state.activeWorkoutDateKey || getCurKey());

      if (!state.dayLogs[targetKey]) state.dayLogs[targetKey] = {};
      
      state.dayLogs[targetKey].workout = {
        done: true,
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
            densityLoad: ex.densityLoad || 0,
            densitySec: ex.densitySec || 0,
            sets: ex.sets.map(s => ({ ...s, targetRpe: roundRpe(s.targetRpe), actualRpe: roundRpe(s.actualRpe), lapRunning: false, lapTimerObj: null })),
            totalReps,
            tonnage
          };
        })
      };

      state.activeWorkout = [];
      state.activeWorkoutDay = null;
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
      window.pushToCloud(false);
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
      const dLog = state.dayLogs[normKey];
      if (dLog && dLog.workout && dLog.workout.exercises) {
        state.activeWorkout = dLog.workout.exercises.map(ex => ({
          tier: ex.tier || 'Main',
          category: ex.category || 'Logged',
          exercise: ex.exercise,
          modifiers: sanitizeModifiers(ex.modifiers || []),
          scheme: normalizeSchemeName(ex.scheme || 'Straight Sets'),
          isGrounding: Boolean(ex.isGrounding),
          skipBackoffs: Boolean(ex.skipBackoffs),
          fatigueWarning: false,
          densityLoad: ex.densityLoad || 0,
          densitySec: ex.densitySec || 480,
          densityTotalSec: ex.densityTotalSec || 480,
          densityRunning: false,
          densityTimerObj: null,
          densityReps: ex.densityReps || 0,
          sets: (ex.sets || []).map(s => ({ ...s, targetRpe: roundRpe(s.targetRpe), actualRpe: roundRpe(s.actualRpe), lapRunning: false, lapTimerObj: null }))
        }));
        state.activeWorkoutDay = Number(normKey.split('-')[2]);
        state.activeWorkoutDateKey = normKey;
        state.isEditingHistorical = true;
        state.historicalDateKey = normKey;
        state.sessionSecs = (dLog.workout.dur || 45) * 60;
        state.sStart = Date.now() - (state.sessionSecs * 1000);
        state.restStart = Date.now();
        resumeStopwatch();
        state.screen = 'logger';
        state.dateActionModal.open = false;
        persist();
        safeRender();
      }
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
          obj.fatigueWarning = false;
          obj.densityLoad = calcLoad(anchorE1, 65);
          obj.densitySec = 480;
          obj.densityTotalSec = 480;
          obj.densityRunning = false;
          obj.densityTimerObj = null;
          obj.densityReps = 0;
          state.activeWorkout.push(obj);
        } else state.stagedSlots.push(obj);
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
      state.modal.open = false;
      persist();
      triggerCloudSync(1500);
      safeRender();
    },

    // Macrocycle & Blueprint Architecture
    setActiveBlock(idx) { state.activeBlockIdx = idx; state.activeWeek = 1; persist(); window.pushToCloud(false); safeRender(); },
    setActiveWeek(w) { state.activeWeek = w; persist(); window.pushToCloud(false); safeRender(); },
    addMacroBlock() { state.macrocycle.push({ id: Date.now(), phase: state.newBlockPhase, weeks: Number(state.newBlockWeeks) }); syncMacrocycleProgression(); persist(); window.pushToCloud(false); safeRender(); },
    
    deleteMacroBlock(idx) {
      if (state.macrocycle.length <= 1) return;
      state.macrocycle.splice(idx, 1);
      syncMacrocycleProgression();
      persist();
      window.pushToCloud(false);
      safeRender();
    },

    moveMacroBlock(idx, dir) {
      const target = idx + dir;
      if (target < 0 || target >= state.macrocycle.length) return;
      const item = state.macrocycle.splice(idx, 1)[0];
      state.macrocycle.splice(target, 0, item);
      syncMacrocycleProgression();
      persist();
      window.pushToCloud(false);
      safeRender();
    },

    setMacrocycleStartDate(dateStr) {
      state.macrocycleStartDate = normalizeDateKey(dateStr);
      syncMacrocycleProgression();
      persist();
      window.pushToCloud(false);
      safeRender();
    },

    setMacrocycleStartToMonday() {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      state.macrocycleStartDate = formatIsoDate(monday.getFullYear(), monday.getMonth(), monday.getDate());
      syncMacrocycleProgression();
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

    selectProgramPreset(progId) { state.selectedProgramId = progId; safeRender(); },
    setProgramPresetDays(days) { state.selectedProgramDays = Number(days); safeRender(); },

    launchProgramPreset(progId, days) {
      const prog = programPresets.find(p => p.id === progId);
      if (!prog) return;
      state.macrocycle = JSON.parse(JSON.stringify(prog.macro));
      state.macrocycleStartDate = core.getTodayDateString ? core.getTodayDateString() : formatIsoDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
      syncMacrocycleProgression();
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
        version: core.APP_VERSION || 'v4.6.1-PWA',
        timestamp: new Date().toISOString(),
        settings: state.settings,
        profile: state.profile,
        macrocycle: state.macrocycle,
        macrocycleStartDate: state.macrocycleStartDate,
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
            if (imported.macrocycle) state.macrocycle = imported.macrocycle;
            if (imported.macrocycleStartDate) state.macrocycleStartDate = imported.macrocycleStartDate;
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
      const rows = [["Date", "Weight", "ReadinessScore", "WorkoutDuration", "WorkoutSRPE", "ExercisesCount"]];
      const dates = Object.keys(state.dayLogs || {}).sort();
      dates.forEach(dKey => {
        const log = state.dayLogs[dKey];
        rows.push([
          dKey,
          log.weight || "",
          log.recovery?.score || "",
          log.workout?.dur || "",
          log.workout?.srpe || "",
          log.workout?.exercises?.length || 0
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
  };
})();
// ============================================================================
// APEX TRAINING ENGINE - PART 4 OF 4: VIEW LAYER, RENDER PIPELINE & BOOTSTRAP
// Complete Unabridged Production Release v4.6.0-PWA (Full View Architecture)
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
    getMacrocyclePosition = () => ({ blockIdx: 0, week: 1, phase: 'Hypertrophy', block: { phase: 'Hypertrophy', weeks: 3 } }),
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
    document.body.className = `theme-${activeTheme}`;
    
    const themeColors = {
      midnight: { bg: '#090d16', card: '#0f172a', input: '#1e293b', border: '#334155' },
      onyx: { bg: '#000000', card: '#121212', input: '#1e1e1e', border: '#2c2c2c' },
      slate: { bg: '#0f172a', card: '#1e293b', input: '#334155', border: '#475569' },
      forest: { bg: '#061811', card: '#0b291d', input: '#133e2c', border: '#1c523b' },
      crimson: { bg: '#18080a', card: '#290d11', input: '#3e161c', border: '#5c1f2a' },
      nordic: { bg: '#0a131c', card: '#11202e', input: '#1b3044', border: '#27435e' },
      amber: { bg: '#161006', card: '#261b0a', input: '#3b2a10', border: '#523b17' },
      cyberpunk: { bg: '#0d0618', card: '#180d2c', input: '#261545', border: '#412375' }
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
    `;
    document.documentElement.style.fontFamily = `'${font}', monospace, sans-serif`;

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
    if (tf === '1M') return now - (30 * 86400000);
    if (tf === '3M') return now - (90 * 86400000);
    if (tf === '6M') return now - (180 * 86400000);
    if (tf === '1Y') return now - (365 * 86400000);
    return 0;
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

  function renderRichChartSvg(dataPoints, unit = 'lbs', strokeColor = '#38bdf8') {
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

    return `
      <svg class="w-full h-40 overflow-visible font-mono select-none" viewBox="0 0 ${svgW} ${svgH}">
        <line x1="${padL}" y1="${padT}" x2="${svgW - padR}" y2="${padT}" stroke="#334155" stroke-dasharray="3,3" stroke-width="1" />
        <line x1="${padL}" y1="${padT + plotH / 2}" x2="${svgW - padR}" y2="${padT + plotH / 2}" stroke="#334155" stroke-dasharray="3,3" stroke-width="1" />
        <line x1="${padL}" y1="${padT + plotH}" x2="${svgW - padR}" y2="${padT + plotH}" stroke="#475569" stroke-width="1.5" />
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#475569" stroke-width="1.5" />

        <text x="${padL - 6}" y="${padT + 4}" fill="#94a3b8" font-size="8" text-anchor="end">${Math.round(maxV)}${unit}</text>
        <text x="${padL - 6}" y="${padT + (plotH / 2) + 3}" fill="#64748b" font-size="8" text-anchor="end">${Math.round(midV)}${unit}</text>
        <text x="${padL - 6}" y="${padT + plotH + 3}" fill="#94a3b8" font-size="8" text-anchor="end">${Math.round(minV)}${unit}</text>

        <polyline fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsStr}" />
        ${xTicks}

        ${coords.map((c, i) => `
          <circle cx="${c.x}" cy="${c.y}" r="${i === n - 1 ? 4 : 2.5}" fill="${i === n - 1 ? '#ffffff' : strokeColor}" stroke="${strokeColor}" stroke-width="1.5">
            <title>${c.p.date}: ${c.p.val} ${unit}</title>
          </circle>
        `).join('')}
      </svg>
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
      icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5v14M18 5v14M2 9h4M18 9h4M2 15h4M18 15h4M6 12h12"/></svg>`
    },
    {
      id: 'builder',
      label: 'Builder',
      action: "appActions.navigate('programming_builder', event)",
      active: cur === 'programming_builder',
      icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
    },
    {
      id: 'analytics',
      label: 'Analytics',
      action: "appActions.navigate('analytics', event)",
      active: cur === 'analytics',
      icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`
    },
    {
      id: 'settings',
      label: 'Settings',
      action: "appActions.navigate('settings', event)",
      active: cur === 'settings',
      icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
    }
  ];

  return `
    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-sub px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-around items-center max-w-lg mx-auto shadow-2xl">
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
        'analytics', 'programming_builder'
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
      const currentRealTimePos = getMacrocyclePosition(new Date());
      const isWorkoutActive = state.activeWorkout && state.activeWorkout.length > 0;

      let syncBtnContent = state.user 
        ? (state.syncStatus === 'synced' ? '☁️ <span class="text-emerald-400 font-bold">Synced</span>' : (state.syncStatus === 'syncing' ? '☁️ <span class="text-amber-400">Syncing...</span>' : '☁️ <span class="text-red-400">Sync Err</span>'))
        : '☁️ <span class="text-blue-400 font-bold">Cloud Sync</span>';

      let html = `
        <header class="flex justify-between items-center pb-2.5 border-b border-sub relative shrink-0">
          <div class="flex items-center space-x-2.5">
            <button type="button" onclick="appActions.toggleDrawer(event)" class="p-1.5 rounded-xl bg-card-sub border border-sub text-slate-300 hover:text-white flex flex-col justify-center items-center space-y-1 w-8 h-8 tactile shadow-sm">
              <span class="w-4 h-0.5 bg-slate-300 rounded"></span>
              <span class="w-4 h-0.5 bg-slate-300 rounded"></span>
              <span class="w-4 h-0.5 bg-slate-300 rounded"></span>
            </button>
            <div class="flex items-center space-x-1.5 cursor-pointer" onclick="appActions.navigate('calendar', event)">
              <span class="font-black tracking-wider text-base text-white font-mono">APEX</span>
              <span class="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-input border border-sub text-slate-300 hover:text-white font-bold">PRO</span>
            </div>
            <button type="button" onclick="appActions.navigate('blocks', event)" class="text-[10px] font-mono bg-card-sub px-2.5 py-1 rounded-lg border border-sub text-slate-300 truncate max-w-[160px] tactile">
              ${currentRealTimePos.phase} (W${currentRealTimePos.week}/${currentRealTimePos.block.weeks})
            </button>
          </div>
          <div class="flex items-center space-x-2 font-mono text-xs">
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
                  <span class="font-black tracking-wider text-white font-mono">APEX NAVIGATION</span>
                  <button type="button" onclick="appActions.toggleDrawer(event)" class="text-slate-400 hover:text-white text-base">✕</button>
                </div>
                <nav class="space-y-1.5 font-mono text-xs">
                  <button type="button" onclick="appActions.navigate('calendar', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'calendar' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg></span><span>Calendar</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('programming_builder', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'programming_builder' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:text-white hover:bg-slate-800 font-semibold'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span><span>Rep Scheme Builder</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('library', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'library' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span><span>Program Library</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('splits', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'splits' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg></span><span>Microcycle Builder</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('blocks', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'blocks' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 10 5-10 5-10-5Z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/></svg></span><span>Macrocycle Builder</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('analytics', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'analytics' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg></span><span>Analytics</span>
                  </button>
                  <button type="button" onclick="appActions.openPrLedgerModal()" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile bg-card-sub text-slate-300 hover:bg-slate-800 font-bold">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></span><span>PR Tracking</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('resources', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'resources' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg></span><span>Movement Library</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('profile', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'profile' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg></span><span>Profile</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('settings', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'settings' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></span><span>Settings</span>
                  </button>
                  <button type="button" onclick="appActions.navigate('about', event)" class="w-full text-left p-2.5 rounded-xl border border-sub flex items-center space-x-2.5 tactile ${state.screen === 'about' ? 'bg-blue-600 text-white font-bold' : 'bg-card-sub text-slate-300 hover:bg-slate-800'}">
                    <span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg></span><span>System</span>
                  </button>
                </nav>
              </div>

              <div class="space-y-2 border-t border-sub pt-3 font-mono text-xs">
                <button type="button" onclick="appActions.promptInstallApp()" class="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold flex items-center justify-center space-x-2 shadow-lg tactile">
                  <span>📲</span><span>Install Standalone App</span>
                </button>
                <div class="text-[10px] text-slate-500 text-center">
                  <div>APEX Engine ${core.APP_VERSION || 'v4.6.1'}</div>
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
          cellsHtml += `<div class="min-h-[58px] sm:min-h-[64px] rounded-xl p-1 flex flex-col justify-between bg-card-sub/20 opacity-20 border border-sub"><span class="text-[10px] font-mono text-slate-500">${prevDays - i}</span></div>`;
        }
        for (let d = 1; d <= daysInMonth; d++) {
          const k = formatIsoDate(state.year, state.month, d);
          const log = state.dayLogs?.[k];
          const isSelected = state.selectedDay === d;
          const isToday = (d === core.TODAY_DATE && state.month === core.TODAY_MONTH && state.year === core.TODAY_YEAR);
          const hasSavedStaged = state.savedStaged && state.savedStaged[k] && state.savedStaged[k].length > 0;
          const hasWorkoutEntry = Boolean(log?.workout?.done || hasSavedStaged || (isWorkoutActive && state.activeWorkoutDateKey === k));

          let badges = '';
          if (log?.weight !== undefined && log?.weight !== null && log?.weight !== '') {
            badges += `
              <span class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0" title="BW: ${log.weight} lbs">
                <svg class="w-2 h-2 sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <rect x="8" y="6" width="8" height="3" rx="1" fill="currentColor" />
                </svg>
              </span>
            `;
          }
          if (log?.recovery?.score) {
            badges += `
              <span class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300 shrink-0" title="Readiness: ${log.recovery.score}%">
                <svg class="w-2 h-2 sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </span>
            `;
          }
          if (hasWorkoutEntry) {
            badges += `
              <span class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0" title="Workout Session">
                <svg class="w-2 h-2 sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12h20M6 8v8M18 8v8M4 10v4M20 10v4"/>
                </svg>
              </span>
            `;
          }

          cellsHtml += `
            <div onclick="appActions.selectDate(${d})" class="min-h-[58px] sm:min-h-[64px] rounded-xl p-1 sm:p-1.5 flex flex-col justify-between cursor-pointer transition bg-card-sub hover:border-blue-400 tactile ${isSelected ? 'ring-2 ring-blue-500 shadow-accent' : (isToday ? 'border-2 border-accent shadow-sm' : 'border border-sub')}">
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
          cellsHtml += `<div class="min-h-[58px] sm:min-h-[64px] rounded-xl p-1 flex flex-col justify-between bg-card-sub/20 opacity-20 border border-sub"><span class="text-[10px] font-mono text-slate-500">${n}</span></div>`;
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
                <span class="flex items-center space-x-1.5">
                  <span class="w-3.5 h-3.5 rounded bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                    <svg class="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="4"/><rect x="8" y="6" width="8" height="3" rx="1" fill="currentColor"/></svg>
                  </span>
                  <span>Bodyweight</span>
                </span>
                <span class="flex items-center space-x-1.5">
                  <span class="w-3.5 h-3.5 rounded bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300">
                    <svg class="w-2 h-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </span>
                  <span>Readiness</span>
                </span>
                <span class="flex items-center space-x-1.5">
                  <span class="w-3.5 h-3.5 rounded bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                    <svg class="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12h20M6 8v8M18 8v8M4 10v4M20 10v4"/></svg>
                  </span>
                  <span>Workout</span>
                </span>
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

        const formFieldsHtml = recipeKeys.map(k => {
          const val = recipe[k];
          const isArr = Array.isArray(val);
          const label = fieldLabels[k] || k;
          const isRpeField = typeof k === 'string' && k.toLowerCase().includes('rpe');
          const isBooleanToggle = k === 'enableRpeProgression';

          if (isBooleanToggle) {
            const isEnabled = Boolean(val);
            return `
              <div class="bg-input p-3 rounded-2xl border border-sub space-y-1 sm:col-span-2">
                <label class="text-[10px] text-slate-300 font-bold uppercase flex justify-between">
                  <span>${label}</span>
                  <span class="text-accent font-bold">${isEnabled ? 'Active (+0.5/Wk)' : 'Disabled (Fixed RPE)'}</span>
                </label>
                <div class="grid grid-cols-2 gap-1.5 pt-0.5">
                  <button type="button" onclick="appActions.updateSchemeRecipe('${curScheme}', '${k}', true)" class="py-2 rounded-xl font-bold text-xs border transition tactile ${isEnabled ? 'bg-blue-600 text-white border-blue-400 shadow' : 'bg-card-sub text-slate-400 border-sub'}">
                    Progression ON
                  </button>
                  <button type="button" onclick="appActions.updateSchemeRecipe('${curScheme}', '${k}', false)" class="py-2 rounded-xl font-bold text-xs border transition tactile ${!isEnabled ? 'bg-blue-600 text-white border-blue-400 shadow' : 'bg-card-sub text-slate-400 border-sub'}">
                    Progression OFF
                  </button>
                </div>
              </div>
            `;
          }

          if (isRpeField) {
            const currentRpe = roundRpe(val);
            const rpeOptions = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];
            return `
              <div class="bg-input p-3 rounded-2xl border border-sub space-y-1">
                <label class="text-[10px] text-slate-300 font-bold uppercase">${label}</label>
                <select onchange="appActions.updateSchemeRecipe('${curScheme}', '${k}', this.value)" class="w-full bg-card-sub border border-sub rounded-xl p-2 text-white font-mono text-xs focus:outline-none font-bold">
                  ${rpeOptions.map(r => `
                    <option value="${r}" ${currentRpe === r ? 'selected' : ''}>
                      ${r === 5.5 ? '5.5 (<6.0)' : '@' + r.toFixed(1)}
                    </option>
                  `).join('')}
                </select>
              </div>
            `;
          }

          return `
            <div class="bg-input p-3 rounded-2xl border border-sub space-y-1">
              <label class="text-[10px] text-slate-300 font-bold uppercase">${label}</label>
              ${isArr ? `
                <input type="text" value="${val.join(', ')}" onchange="appActions.updateSchemeRecipe('${curScheme}', '${k}', this.value.split(',').map(s=>Number(s.trim())).filter(n=>!isNaN(n)))" class="w-full bg-card-sub border border-sub rounded-xl p-2 text-white font-mono text-xs focus:outline-none">
              ` : `
                <input type="number" step="0.5" value="${val}" onchange="appActions.updateSchemeRecipe('${curScheme}', '${k}', this.value)" class="w-full bg-card-sub border border-sub rounded-xl p-2 text-white font-mono text-xs focus:outline-none font-bold">
              `}
            </div>
          `;
        }).join('');

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 max-w-4xl mx-auto w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono w-full">
              <span class="flex items-center gap-1.5">
  <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  Rep Scheme Builder</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <div class="p-3 bg-card-sub rounded-2xl border border-sub flex flex-wrap gap-2 items-center justify-between font-mono text-xs shadow-sm">
              <div>
                <span class="text-[10px] text-accent font-bold uppercase">Periodization Engine Rules</span>
                <div class="text-[9px] text-slate-400">Tweak mathematical offsets, RPE anchors, and set volumes dynamically</div>
              </div>
              <div class="flex items-center space-x-1.5">
                <button type="button" onclick="appActions.exportProgrammingBuilderJson()" class="px-2.5 py-1.5 bg-input border border-sub hover:border-blue-500 text-slate-200 rounded-xl text-[10px] font-bold tactile">
                  ⬇ Export Rules JSON
                </button>
                <label class="px-2.5 py-1.5 bg-input border border-sub hover:border-blue-500 text-slate-200 rounded-xl text-[10px] font-bold text-center cursor-pointer tactile">
                  ⬆ Import Rules JSON
                  <input type="file" accept=".json" onchange="appActions.importProgrammingBuilderJson(event)" class="hidden">
                </label>
                <button type="button" onclick="appActions.resetSchemeRecipes()" class="px-2.5 py-1.5 bg-input border border-sub text-amber-300 rounded-xl text-[10px] font-bold tactile">
                  ↺ Reset
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start font-mono text-xs w-full">
              <div class="md:col-span-4 bg-card-sub p-3 rounded-2xl border border-sub space-y-2">
                <div class="text-[10px] text-accent font-bold uppercase">All 31 Prescribed Schemes</div>
                <div class="space-y-1 max-h-96 overflow-y-auto pr-1">
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

              <div class="md:col-span-8 bg-card-sub p-4 rounded-3xl border border-sub space-y-3 shadow-xl">
                <div class="border-b border-sub pb-2 flex justify-between items-start">
                  <div>
                    <span class="text-[9px] text-accent font-bold uppercase">Recipe Architecture</span>
                    <h3 class="text-sm font-bold text-white">${curScheme}</h3>
                    <p class="text-[10px] text-slate-400 mt-0.5">${schemeDescriptions[curScheme] || 'Dynamic periodization scheme prescription.'}</p>
                  </div>
                  <button type="button" onclick="appActions.saveCurrentRecipe('${curScheme}')" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md tactile">
                    Save Changes
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  ${formFieldsHtml.length ? formFieldsHtml : `<div class="text-slate-500 text-center py-8 col-span-2">This scheme uses pure phase matrix constraints without additional sub-rules.</div>`}
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

          const isDensity = (ex.scheme === 'Density Block');
          const isDensityRunning = ex.densityRunning;

          const sessionDateKey = state.isEditingHistorical ? state.historicalDateKey : (state.activeWorkoutDateKey || getCurKey());
          const completedSets = (ex.sets || []).filter(s => s && s.done);
          const liveReps = completedSets.reduce((sum, s) => sum + (Number(s.actualReps) || 0), 0);

          let livePeakE1 = 0;
          let liveLastE1 = 0;
          completedSets.forEach(s => {
            const effectiveW = getExerciseLoad(ex.exercise, s.actualWeight, sessionDateKey);
            if (effectiveW && s.actualReps && s.actualRpe) {
              const cleanRpe = roundRpe(s.actualRpe);
              const c = Math.round(Number(effectiveW) / (getPct(s.actualReps, cleanRpe) / 100));
              if (c > livePeakE1) livePeakE1 = c;
              liveLastE1 = c;
            }
          });

          const liveFatiguePct = (livePeakE1 > 0 && liveLastE1 > 0)
            ? Math.max(0, Math.round(((livePeakE1 - liveLastE1) / livePeakE1) * 100))
            : 0;

          const setRows = (ex.sets || []).map((s, sIdx) => {
            const isLapActive = s.lapRunning;
            const targetRpeNum = roundRpe(s.targetRpe);
            const displayTargetRpe = targetRpeNum <= 5.5 ? '&lt;6.0' : targetRpeNum.toFixed(1);
            const actualRpeNum = roundRpe(s.actualRpe);

            return `
              <div id="set-row-${exIdx}-${sIdx}" class="p-2 rounded-xl border space-y-1.5 ${s.done ? 'bg-emerald-950/30 border-emerald-800' : 'bg-input border-sub'}">
                <div class="grid grid-cols-12 gap-1 items-center text-center">
                  <div class="col-span-2 flex items-center space-x-1 text-left">
                    <button type="button" onclick="appActions.deleteSet(${exIdx}, ${sIdx})" class="text-[9px] md:text-xs font-mono text-slate-400 hover:text-red-400 font-bold">${sIdx + 1}</button>
                    ${s.label ? `<span class="text-[7px] md:text-[8px] font-mono px-1 py-0.2 bg-card-sub rounded text-blue-300 border border-sub truncate max-w-[42px]">${s.label}</span>` : ''}
                  </div>
                  <span class="col-span-3 font-mono text-[9px] md:text-xs text-slate-300 text-left pl-0.5 leading-tight truncate">
                    ${s.targetLoad ? s.targetLoad + 'x' : ''}${s.targetReps ? s.targetReps + 'r' : ''}${s.targetTime ? s.targetTime + 's' : ''} @${displayTargetRpe}
                  </span>
                  
                  <div class="col-span-6 flex gap-1 items-center justify-end">
                    ${meta.w ? `<input type="number" step="2.5" placeholder="lbs" value="${s.actualWeight !== undefined && s.actualWeight !== null ? s.actualWeight : ''}" onchange="appActions.updateSetInput(${exIdx}, ${sIdx}, 'actualWeight', this.value)" class="w-16 md:w-20 bg-card-sub border border-sub rounded-lg py-1 text-xs text-center font-mono text-white focus:outline-none">` : ''}
                    ${meta.r ? `<input type="number" placeholder="reps" value="${s.actualReps !== undefined && s.actualReps !== null ? s.actualReps : ''}" onchange="appActions.updateSetInput(${exIdx}, ${sIdx}, 'actualReps', this.value)" class="w-14 md:w-16 bg-card-sub border border-sub rounded-lg py-1 text-xs text-center font-mono text-white focus:outline-none">` : ''}
                    ${meta.rpe ? `
                      <select onchange="appActions.updateSetInput(${exIdx}, ${sIdx}, 'actualRpe', this.value)" class="w-12 md:w-14 bg-card-sub border border-sub rounded-lg py-1 text-[9px] md:text-xs font-mono text-white px-0 focus:outline-none shrink-0 font-bold">
                        <option value="5.5" ${actualRpeNum <= 5.5 ? 'selected' : ''}>&lt;6.0</option>
                        ${[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0].map(r => `<option value="${r}" ${actualRpeNum === r ? 'selected' : ''}>${r.toFixed(1)}</option>`).join('')}
                      </select>
                    ` : ''}
                  </div>
                  <button type="button" id="set-btn-${exIdx}-${sIdx}" onclick="appActions.logSet(${exIdx}, ${sIdx}, event)" class="col-span-1 py-1 rounded text-xs font-bold transition tactile ${s.done ? 'bg-emerald-600 text-white shadow-sm' : 'bg-card-sub text-slate-400 border border-sub'}">✓</button>
                </div>

                ${meta.t ? `
                  <div class="pt-1.5 mt-1 border-t border-sub/50 flex items-center justify-between text-xs font-mono">
                    <span class="text-[9px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                      <span>⏱</span><span>Timer / Lap:</span>
                    </span>
                    <div class="flex items-center space-x-1.5">
                      <button type="button" onclick="appActions.toggleSetLap(${exIdx}, ${sIdx})" class="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold tactile shadow ${isLapActive ? 'bg-amber-600 text-white animate-pulse' : 'bg-card-sub text-blue-400 border border-blue-800'}">
                        ⏱ <span id="lap-display-${exIdx}-${sIdx}">${fmtTime(s.actualTime || 0)}</span>
                      </button>
                      <input type="number" placeholder="sec" value="${s.actualTime || ''}" onchange="appActions.updateSetInput(${exIdx}, ${sIdx}, 'actualTime', this.value)" class="w-14 bg-card-sub border border-sub rounded-lg py-1 text-[10px] text-center font-mono text-white focus:outline-none shrink-0" title="Manual seconds">
                      <button type="button" onclick="appActions.resetSetLap(${exIdx}, ${sIdx})" class="px-2 py-1 bg-card-sub border border-sub rounded-lg text-[9px] text-slate-400 hover:text-white tactile font-bold">↺</button>
                    </div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('');

          return `
            <div class="bg-card-sub rounded-2xl border ${isDensity ? 'border-blue-700/80 shadow-lg' : 'border-sub'} p-3 space-y-2 relative shadow-md">
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
                      <button type="button" onclick="event.stopPropagation(); appActions.openConfig(${exIdx}, true)" class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-input border border-sub text-accent hover:text-white tactile" title="Edit Modifiers / Movement">
                        🏷️ Edit
                      </button>
                    </div>
                    <div class="flex flex-wrap gap-1 mt-1 cursor-pointer" onclick="event.stopPropagation(); appActions.openConfig(${exIdx}, true)" title="Tap to adjust modifiers">
                      ${cleanMods.length ? cleanMods.map(m => `<span class="text-[8px] font-mono bg-input text-slate-300 hover:text-white px-1.5 py-0.2 rounded border border-sub">${m}</span>`).join('') : `<span class="text-[8px] font-mono text-slate-500 hover:text-accent">+ Add Modifiers</span>`}
                    </div>
                  </div>
                </div>

                <div class="relative" onclick="event.stopPropagation()">
                  <button type="button" onclick="appActions.toggleCardMenu(${exIdx}, event)" class="p-1 rounded-xl bg-input border border-sub text-slate-300 hover:text-white text-xs w-7 h-7 flex items-center justify-center font-bold tactile">⋮</button>
                  ${state.cardMenuOpen === exIdx ? `
                    <div class="absolute right-0 top-8 w-48 bg-card border border-sub rounded-2xl shadow-2xl z-40 p-1.5 font-mono text-[11px] space-y-0.5">
                      <button type="button" onclick="appActions.openConfig(${exIdx}, true)" class="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center space-x-1.5 text-accent"><span>🏷️</span><span>Edit Modifiers / Lift</span></button>
                      <button type="button" onclick="appActions.moveActiveEx(${exIdx}, -1)" class="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center space-x-1.5 text-slate-200"><span>↑</span><span>Move Up</span></button>
                      <button type="button" onclick="appActions.moveActiveEx(${exIdx}, 1)" class="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center space-x-1.5 text-slate-200"><span>↓</span><span>Move Down</span></button>
                      <button type="button" onclick="appActions.openPlanner(${exIdx})" class="w-full text-left p-1.5 rounded-lg hover:bg-blue-600 hover:text-white flex items-center space-x-1.5 text-blue-300"><span>🧮</span><span>Planner & History</span></button>
                      <button type="button" onclick="appActions.deleteActiveEx(${exIdx})" class="w-full text-left p-1.5 rounded-lg hover:bg-red-950 text-red-400 flex items-center space-x-1.5 border-t border-sub mt-0.5"><span>✕</span><span>Remove Movement</span></button>
                    </div>
                  ` : ''}
                </div>
              </div>

              ${ex.tier === 'Main' ? `
                <div class="flex items-center space-x-1.5 pt-0.5 font-mono">
                  <button type="button" onclick="appActions.toggleGroundingSet(${exIdx}, true)" class="px-2 py-0.5 rounded-lg text-[9px] font-bold border transition tactile ${ex.isGrounding ? 'bg-amber-600 text-white border-amber-400 shadow-sm' : 'bg-input text-slate-400 border-sub'}">
                    ${ex.isGrounding ? '🔥 Grounding Set (@9.0)' : 'Grounding Set'}
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
                    <div class="bg-input/90 p-2 rounded-xl border border-blue-800/60 space-y-1.5 font-mono">
                      <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-2">
                          <span class="text-[8px] uppercase bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700 font-bold">⏱ Density Block</span>
                          <div id="density-timer-disp-${exIdx}" class="text-base font-black tracking-wider ${isDensityRunning ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}">
                            ${fmtTime(ex.densitySec !== undefined ? ex.densitySec : 480)}
                          </div>
                        </div>
                        <div class="flex items-center space-x-1">
                          <button type="button" onclick="appActions.toggleDensity(${exIdx})" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition tactile shadow ${isDensityRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}">
                            ${isDensityRunning ? '⏸ Pause' : '▶ Start'}
                          </button>
                          <button type="button" onclick="appActions.resetDensity(${exIdx})" class="px-2 py-1 bg-card-sub border border-sub rounded-lg text-[10px] font-bold text-slate-300 hover:text-white tactile">
                            ↺
                          </button>
                        </div>
                      </div>
                      <div class="grid grid-cols-6 gap-1 pt-1 border-t border-sub/40 text-[9px] text-center">
                        ${[5, 6, 7, 8, 9, 10].map(m => `
                          <button type="button" onclick="appActions.setDensityDuration(${exIdx}, ${m})" class="py-0.5 rounded-lg border font-bold tactile ${((ex.densityTotalSec || 480) / 60) === m ? 'bg-blue-600 text-white border-blue-500 shadow-sm' : 'bg-card-sub text-slate-400 border-sub'}">
                            ${m}m
                          </button>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}

                  <div class="space-y-1.5">
                    <div class="grid grid-cols-12 gap-1 text-[9px] md:text-[10px] font-mono text-slate-400 text-center font-bold">
                      <span class="col-span-2 text-left">SET</span>
                      <span class="col-span-3 text-left">TARGET</span>
                      <span class="col-span-6 text-right">${meta.t ? 'LOAD / REPS / RPE' : 'ACTUAL (LBS / REPS / RPE)'}</span>
                      <span class="col-span-1">LOG</span>
                    </div>
                    ${setRows}
                    
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
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="sticky top-0 z-30 bg-card/95 backdrop-blur-md border border-sub p-2.5 rounded-2xl flex justify-between items-center text-[10px] md:text-xs font-mono shadow-xl w-full">
              <div class="flex items-center space-x-2">
                <span class="text-slate-400 font-semibold">⏱ Session:</span>
                <span id="workout-elapsed-time" class="text-slate-200 font-bold">${fmtTime(state.sessionSecs)}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-slate-400 font-semibold">Rest:</span>
                <span id="workout-rest-display" class="text-amber-400 font-bold text-sm">${fmtTime(state.restStopwatchSecs)}</span>
              </div>
            </div>

            <div class="space-y-2.5 w-full">${exercisesHtml}</div>
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
        const stagedPos = getMacrocyclePosition(targetDateKey);
        const curPhase = stagedPos.phase;
        const curWeek = stagedPos.week;
        const curBlockWeeks = stagedPos.block.weeks || 3;

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
                <span class="text-[9px] font-mono uppercase bg-input px-2 py-0.5 rounded-md text-slate-400 border border-sub">${slot.tier} • ${slot.category}</span>
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
                  ${slot.isGrounding ? '🔥 Grounding Set (@9.0)' : 'Grounding Set'}
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
                  <h2 class="text-base font-bold text-white font-mono">Stage Workout (Day ${state.selectedDay})</h2>
                  <p class="text-[10px] text-slate-400 font-mono">${getDayFocus(state.selectedDay)} • ${curPhase} (W${curWeek}/${curBlockWeeks})</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-[10px] font-mono text-slate-400">3D Ready: <b class="text-accent">${rollingReady}%</b></span>
                  <button type="button" onclick="appActions.navigate('calendar', event)" class="text-xs text-slate-400 underline font-mono">Calendar</button>
                </div>
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

              <div class="space-y-2.5">${slotsHtml}</div>
              
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
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 max-w-2xl mx-auto w-full pr-0.5" onclick="appActions.closeCardMenu()">
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
        const dKey = state.reviewDateKey || getCurKey();
        const curLog = state.dayLogs?.[dKey] || {};
        const workout = curLog.workout || { dur: 45, srpe: 7.5, exercises: [] };
        const srpeNum = roundRpe(workout.srpe);
        const displaySrpe = srpeNum <= 5.5 ? '&lt;6.0' : srpeNum.toFixed(1);

        html += `
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 max-w-3xl mx-auto w-full pr-0.5" onclick="appActions.closeCardMenu()">
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
                const cleanMods = sanitizeModifiers(ex.modifiers || []);
                const setDetails = (ex.sets || []).map((s, idx) => {
                  const effectiveW = getExerciseLoad(ex.exercise, s.actualWeight, dKey);
                  const cleanRpe = roundRpe(s.actualRpe);
                  const displayRpe = cleanRpe <= 5.5 ? '&lt;6.0' : cleanRpe.toFixed(1);
                  return `${idx + 1}. ${effectiveW}lbs × ${s.actualReps || 0}r @${displayRpe}`;
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

      // 7. MACROCYCLE BLOCKS SCREEN (With On-Demand Wizard Launcher)
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

        const blockCards = (state.macrocycle || []).map((b, idx) => {
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
              <div class="flex justify-between items-center text-[11px]">
                <span class="text-slate-400">Duration: <b class="text-slate-200">${b.weeks} Weeks</b></span>
                ${isActive ? `<span class="text-[9px] px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold">ACTIVE</span>` : `<button type="button" onclick="appActions.setActiveBlock(${idx})" class="text-[9px] px-2 py-0.5 rounded-md bg-input text-blue-400 border border-blue-800 hover:bg-blue-900 tactile">Set Active</button>`}
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
  Macrocycle Builder</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <!-- On-Demand Block Transition Wizard Button -->
            <div class="p-3.5 bg-gradient-to-r from-blue-950/80 to-indigo-950/80 rounded-2xl border border-blue-600/60 flex justify-between items-center text-xs font-mono shadow-xl">
              <div>
                <span class="text-[10px] text-accent font-bold uppercase">Mesocycle Transition Audit</span>
                <div class="text-[9px] text-slate-300 mt-0.5">Analyze completed block volume, e1RM adaptation, and localized fatigue.</div>
              </div>
              <button type="button" onclick="appActions.openBlockWizard()" class="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tactile shadow-lg">
                🧙 Block Transition Wizard &rarr;
              </button>
            </div>

            <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2 font-mono text-xs shadow-md">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-[10px] text-accent font-bold uppercase">Macrocycle Timeline Anchor</span>
                  <div class="text-[9px] text-slate-400">Auto-calculates phase & active week based on current date</div>
                </div>
                <div class="flex items-center space-x-1">
                  <button type="button" onclick="appActions.setMacrocycleStartToMonday()" class="px-2 py-1 bg-input border border-sub text-[10px] text-slate-300 rounded-lg font-bold hover:text-white tactile">Set Monday</button>
                  <button type="button" onclick="appActions.setMacrocycleStartDate(core.getTodayDateString ? core.getTodayDateString() : '')" class="px-2 py-1 bg-blue-600 text-white text-[10px] rounded-lg font-bold tactile shadow">Today</button>
                </div>
              </div>
              <div class="flex items-center space-x-2 pt-1">
                <input type="date" value="${state.macrocycleStartDate}" onchange="appActions.setMacrocycleStartDate(this.value)" class="flex-1 bg-input border border-sub rounded-xl p-2 text-white font-mono text-xs focus:outline-none font-bold">
                <div class="bg-input px-3 py-2 rounded-xl border border-sub text-center shrink-0">
                  <div class="text-[8px] text-slate-400 uppercase">Current Real-Time</div>
                  <div class="text-xs font-black text-accent">${currentRealTimePos.phase} • W${currentRealTimePos.week}</div>
                </div>
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
  Movement Library</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <div class="grid grid-cols-2 gap-1.5 p-1 bg-input rounded-2xl border border-sub font-mono text-xs w-full">
              <button type="button" onclick="appActions.setResTab('exercises')" class="py-2 rounded-xl font-bold transition tactile ${activeTab === 'exercises' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}">Movements (${catKeys.length})</button>
              <button type="button" onclick="appActions.setResTab('modifiers')" class="py-2 rounded-xl font-bold transition tactile ${activeTab === 'modifiers' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}">Modifiers (${(state.modifierCats || []).length})</button>
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
            ` : `
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
            `}
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
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3 max-w-2xl mx-auto w-full pr-0.5" onclick="appActions.closeCardMenu()">
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
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3.5 max-w-4xl mx-auto w-full pr-0.5" onclick="appActions.closeCardMenu()">
            <div class="flex justify-between items-center text-xs font-bold border-b border-sub pb-2 text-slate-200 font-mono w-full">
              <span class="flex items-center gap-1.5">
  <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  Settings</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white">✕</button>
            </div>

            <!-- Global Phase Rep Matrix Table -->
            <div class="p-4 bg-card-sub rounded-3xl border border-sub space-y-3 shadow-md font-mono text-xs w-full">
              <div class="flex justify-between items-center border-b border-sub pb-2">
                <div>
                  <span class="text-[10px] text-accent font-bold uppercase">Global Phase Rep Matrix (Low - High Bookends)</span>
                  <div class="text-[9px] text-slate-400">Rep range windows generated by block phase across movement tiers</div>
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
                  <span class="text-[10px] text-accent font-bold uppercase">e1RM Grounding & Blending Sensitivity</span>
                  <div class="text-[9px] text-slate-400">Controls weighting when grounding sets establish the next block's anchor</div>
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
                  <div class="text-[10px] text-accent font-bold uppercase">Data Backup & Migration</div>
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
                </div>

                <div class="p-3.5 bg-card-sub rounded-2xl border border-sub space-y-2 shadow-md">
                  <div class="text-[10px] text-red-400 font-bold uppercase">Emergency Session Purge</div>
                  <p class="text-[10px] text-slate-400">Clear background workouts or stuck resume banners freezing the interface.</p>
                  <button type="button" onclick="appActions.forceClearActiveWorkout(event)" class="w-full py-2.5 bg-input hover:bg-red-950/60 text-red-400 border border-sub rounded-xl font-bold tactile">
                    Purge Active Workout State
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
          <main class="flex-1 min-h-0 overflow-y-auto space-y-3.5 max-w-4xl mx-auto w-full pr-0.5" onclick="appActions.closeCardMenu()">
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
                  <div class="text-xs font-bold text-pink-400">Lombardi Power Law (1989)</div>
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
                <li><b>Dynamic Double Progression</b>: Lock load across sets; progress from bottom to top of rep window (e.g. 6-8r). Add bar weight only when all sets reach the upper ceiling.</li>
                <li><b>Autoregulated Load Drops & RPE Stops</b>: Ramp to top intensity (e.g. 4@8.0 or 6@9.0). Calculate down sets as a strict percentage reduction (-5% to -14%) or repeat until RPE 9.0 is hit.</li>
                <li><b>Non-Specific GPP Work Capacity</b>: Dedicated 20-30 minute circuits (loaded carries, sled medleys, core, arms) 1-2 times weekly to promote systemic recovery and work capacity without competing with axial spinal recovery.</li>
              </ul>
            </div>

            <div class="p-3.5 bg-card-sub rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-md">
              <span class="text-[10px] text-accent font-bold uppercase">Macrocycle Periodization Blocks</span>
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
  Program Library</span>
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
                  <div class="text-[10px] text-accent font-bold uppercase">Macrocycle Periodization Sequence</div>
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
                  <span class="text-[9px] uppercase font-bold text-accent">${slot.tier} • ${slot.category}</span>
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
  Microcycle Builder</span>
              <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Calendar</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start w-full">
              <div class="md:col-span-4 bg-card-sub p-3 rounded-2xl border border-sub space-y-2 font-mono text-xs">
                <div class="text-[10px] text-accent font-bold uppercase">Split Day Templates</div>
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
                    <span class="text-[9px] text-accent font-bold uppercase">Active Blueprint</span>
                    <h3 class="text-sm font-bold text-white">${activeBlueprintName}</h3>
                  </div>
                  <div class="flex items-center space-x-1.5">
                    <button type="button" onclick="appActions.addSlotToBlueprint('${activeBlueprintName}')" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl tactile shadow">+ Slot</button>
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

        const volumeBarsHtml = muscleGroupTaxonomy.map(m => {
          const sets = Math.round((volScores[m] || 0) * 10) / 10;
          const { mv = 4, mev = 8, mav = 16, mrv = 22 } = thresholds[m] || {};
          
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
                ${['1M', '3M', '6M', '1Y', 'ALL'].map(tf => `
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
                    <span class="text-[10px] text-teal-400 font-bold uppercase">Bodyweight Telemetry</span>
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
                      <div class="text-xs md:text-sm font-black text-teal-300 mt-0.5">${bwRecords[bwRecords.length - 1].val}lbs</div>
                    </div>
                    <div class="bg-input p-2 rounded-xl border border-sub">
                      <div class="text-[8px] text-slate-400 uppercase">Low / High</div>
                      <div class="text-xs font-bold text-white mt-0.5">${Math.min(...bwRecords.map(b => b.val))} / ${Math.max(...bwRecords.map(b => b.val))}</div>
                    </div>
                    <div class="bg-input p-2 rounded-xl border border-sub">
                      <div class="text-[8px] text-slate-400 uppercase">Net &Delta;</div>
                      <div class="text-xs font-bold ${bwRecords[bwRecords.length - 1].val - bwRecords[0].val >= 0 ? 'text-teal-400' : 'text-amber-400'} mt-0.5">
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
            ` : ''}

            ${activeTab === 'fatigue' ? `
              <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-xl">
                <div class="flex justify-between items-center border-b border-sub pb-2">
                  <div>
                    <span class="text-[10px] text-pink-400 font-bold uppercase">Foster Session Load (AU) & Readiness</span>
                    <div class="text-[9px] text-slate-400">Training impulse = Session Duration (min) &times; Foster sRPE</div>
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
                  <span class="text-[10px] text-pink-400 font-bold uppercase">Completed Stress Logs</span>
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
                    <span class="text-[10px] text-accent font-bold uppercase">Microcycle Volume Landmarks</span>
                    <div class="text-[9px] text-slate-400">Calendar week (Mon-Sun) aggregated sets vs. thresholds (${lifterType})</div>
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
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">RPE Load Matrix</h3>
            <span class="text-[10px] text-slate-500">Continuous 1RM Interpolation</span>
          </div>
          ${renderRpeMatrixComponent({ title: 'Dynamic Calculator', sets: state.rpeMatrixModal.sets })}
        </div>
      ` : ''}
            </main>
        `;
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
                  <span class="text-[9px] text-accent font-bold uppercase">🧙 Block Transition & Periodization Wizard</span>
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
                    <button type="button" onclick="state.selectedDay=${d}; appActions.initStaging()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-[10px] flex items-center justify-center space-x-1.5 tactile shadow">
                      <span>Stage & Build Session</span>
                      <span>&rarr;</span>
                    </button>
                  `)}
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
        const pPct = getPct(reps, cleanRpe);
        const pE1 = Math.round(weight / (pPct / 100));
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

        html += `
          <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto" onclick="event.stopPropagation()">
            <div class="bg-card border border-sub rounded-3xl w-full max-w-md p-4 space-y-3 shadow-2xl my-auto text-xs font-mono max-h-[88vh] flex flex-col">
              <div class="flex justify-between items-center border-b border-sub pb-2">
                <div>
                  <span class="font-bold text-accent text-sm">🧮 Planner: ${ex}</span>
                </div>
                <div class="flex items-center space-x-1">
            <button type="button" onclick="appActions.openRpeMatrixModal('${ex}')" class="text-slate-400 hover:text-accent p-1" title="RPE Matrix">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            </button>
            <button type="button" onclick="appActions.closePlanner()" class="text-slate-400 hover:text-white p-1">✕</button>
          </div>
              </div>

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
      if (state.prLedgerModal && state.prLedgerModal.open) {
        const filterLift = state.prLedgerModal.filterLift || 'All';
        const allPrLifts = Array.from(new Set((state.prLedger || []).map(p => p.lift))).sort();
        const filteredPRs = (state.prLedger || []).filter(p => filterLift === 'All' || p.lift === filterLift);

        html += `
          <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto" onclick="event.stopPropagation()">
            <div class="bg-card border border-sub rounded-3xl w-full max-w-md p-4 space-y-3 shadow-2xl my-auto text-xs font-mono max-h-[88vh] flex flex-col">
              <div class="flex justify-between items-center border-b border-sub pb-2">
                <span class="font-bold text-amber-300 text-sm flex items-center space-x-1.5">
                  <span class="flex items-center gap-1.5">
  <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
  PR Tracking</span>
                </span>
                <button type="button" onclick="appActions.closePrLedgerModal()" class="text-slate-400 hover:text-white p-1">✕</button>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-[10px] text-slate-400 uppercase font-bold">Filter Lift:</span>
                <select onchange="appActions.setPrLedgerFilter(this.value)" class="bg-input border border-sub rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:outline-none max-w-[200px] truncate font-bold">
                  <option value="All" ${filterLift === 'All' ? 'selected' : ''}>All Achievements (${state.prLedger?.length || 0})</option>
                  ${allPrLifts.map(l => `<option value="${l}" ${filterLift === l ? 'selected' : ''}>${l}</option>`).join('')}
                </select>
              </div>

              <div class="space-y-1.5 overflow-y-auto max-h-60 pr-1 flex-1">
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
            </div>
          </div>
        `;
      }

      html += `
        <footer class="pt-2 border-t border-sub/50 flex justify-between items-center text-[9px] font-mono text-slate-500 shrink-0" onclick="appActions.closeCardMenu()">
          <span>APEX Training Engine ${core.APP_VERSION || 'v4.6.1'}</span>
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