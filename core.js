// ============================================================================
// APEX TRAINING ENGINE - PART 1 OF 4: CORE ARCHITECTURE & FOUNDATIONS
// Production Release v4.6.0-PWA (Neutral Schemes / Multi-Engine / Block Wizard)
// Includes: Strict ISO-8601 Date Standard, Supabase Realtime Channel Sync,
//           Ghost Timer Sanitization, Multi-Variable Block Transition Heuristics,
//           Multi-Formula 1RM Prediction Engine (APEX, Epley, Brzycki, Wathan, Lombardi),
//           Neutral Scheme Nomenclature with Backward Compatibility Aliasing,
//           Strict 0.5 RPE Quantization Engine (<6 / 5.5 to 10.0),
//           Anticipated Target Date Mesocycle Resolver (getMesocyclePosition),
//           Dual-Bound Phase Rep Matrix & Lift Override Architecture,
//           Resilient Database-Safe Settings Mirroring
// ============================================================================

(function() {
  try {
    const APP_VERSION = 'v5.0.5-PWA';
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
    
    const availableThemes = ['Onyx', 'Graphite', 'Midnight', 'Abyss', 'Slate', 'Vapor', 'Espresso'];
    const availableFonts = ['JetBrains Mono', 'Inter', 'Roboto', 'Geist', 'Cinzel'];

   // Neutralized Scheme Definitions
    const hypertrophySchemes = [
      'Straight Sets',
      'Double Progression',
      'Myo-reps',
      'Rest-Pause (Dogcrapp)',
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
      'Intensity Matched',
      'The 3/7 Tension Ladder',
      'Integrated Lengthened Partials',
      'Statodynamic Occlusion Waves'
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
      'Intensity Matched',
      'Rest-Redistribution Singles',
      'Reciprocal Antagonist Potentiation'
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
      'Double Progression': 'Add reps within the phase rep range at a fixed load until the ceiling is cleared, then increase weight by your step (lbs) and reset reps.',      'Myo-reps': '1 activation set (12-15r @ RPE 9.0) followed by short mini-sets (3-5r) on strict 15-20s rest intervals.',
      'Rest-Pause (Dogcrapp)': '1 all-out activation set followed by two 15-second rest-pause failure clusters.',
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
      'Double Progression': { targetRpe: 8.0, setsCount: 3, stepLbs: 5, enableRpeProgression: true, minReps: 0, maxReps: 0 },
      'Myo-reps': { actRpe: 9.0, miniRpe: 9.5, miniSets: 4, intraRestSec: 15, enableRpeProgression: false, minReps: 0, maxReps: 0 },
      'Rest-Pause (Dogcrapp)': { actRpe: 9.5, clusterRpe: 10.0, clusters: 2, intraRestSec: 15, enableRpeProgression: false, minReps: 0, maxReps: 0 },
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
        4: 'Eager to train', 
        5: 'Aggressive drive to train' 
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
        { tier: 'Main', category: 'Knee Dominant', exercise: 'Hack Squat', modifiers: [], scheme: 'Double Progression' },
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
const defaultEquipmentInventory = {
      dumbbells: {
    pairedMax: 90,          // Max per-hand for fixed/adjustable paired DBs (Presses, Flyes, Curls)
    singleHandleMax: 185,   // Max capacity for your heavy loadable DB handle (Rows, Carries, Single-Arm)
    singleHandleTare: 5,    // Empty weight of the loadable DB handle + collars (lbs)
    increment: 5
  },
      cable: {
        ratio: 0.5,             // 0.5 = 2:1 Pulley (100lbs plated = 50lbs felt), 1.0 = 1:1
        carriageWeight: 0,
        increment: 2.5
      },
      bars: {
        'Barbell': 45,
        'Safety Bar': 65,
        'Trap Bar': 55,
        'Swiss Bar': 35,
        'EZ Bar': 25
      },
// Plate inventory removed
    };

    const state = {
      equipment: JSON.parse(localStorage.getItem('apex_equipment')) || JSON.parse(JSON.stringify(defaultEquipmentInventory)),
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
      mesocycleStartDate: getTodayDateString(),
      mesocycle: [
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
        uiStyle: 'glass',
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
  return [...new Set(mods.map(m => typeof m === 'string' ? m.trim() : '').filter(Boolean))];
}
// ==========================================
// SCHEME BLUEPRINTS & UNIVERSAL GENERATOR
// ==========================================

const DEFAULT_SCHEME_BLUEPRINTS = {
  // ==========================================
  // HYPERTROPHY SCHEMES
  // ==========================================
  'Straight Sets': {
    id: 'straight_sets',
    name: 'Straight Sets',
    category: 'Hypertrophy',
    pattern: 'straight',
    baseSets: 3,
    reps: 8,
    targetRpe: 8.0,
    rpeStepDelta: 0.0,
    fatigueDropPct: 0.0,
    restSeconds: 120,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Hold weight and target reps flat across all working sets. Increase bar weight (+5 lbs) when all sets reach the top rep target at or below target RPE.',
    sfrRating: 'B+'
  },
  'Double Progression': {
    id: 'double_progression',
    name: 'Double Progression',
    category: 'Hypertrophy',
    pattern: 'double_progression',
    baseSets: 3,
    reps: '8-12',
    repLockMode: 'phase',   // 'phase' = inherit Phase Rep Matrix | 'locked' = lock to blueprint reps
    targetRpe: 8.5,
    enableRpeProgression: true,
    rpeStepDelta: 0.0,
    fatigueDropPct: 0.0,
    restSeconds: 120,
    intraSetRest: 0,
    densityPenalty: 1.0,
    stepLbs: 5,             // Weight jump (+2.5, +5, +10, +15, +20 lbs) when rep ceiling is cleared
    dpMode: 'all',          // 'all' = all sets hit ceiling | 'first' = Set 1 hits ceiling | 'independent' = per-set graduation
    backoffStep: false,     // true = drop each subsequent set by 1 stepLbs (-5 lbs) from Set 1
    deloadPct: 90,          // Reset to 90% load if stalled for 2+ consecutive sessions
    instructions: 'Work within the phase rep range at a fixed load. Add reps weekly until the ceiling of the range is reached, then increase load by your step (lbs) and reset reps to the bottom.',
    sfrRating: 'A-'
  },
  'Myo-reps': {
    id: 'myo_reps',
    name: 'Myo-reps',
    category: 'Hypertrophy',
    pattern: 'rest_pause',
    actRpe: 9.0,
    miniRpe: 9.5,
    miniSets: 4,
    baseSets: 5,
    reps: [12, 3, 3, 3, 3],
    targetRpe: 9.5,
    restSeconds: 120,
    intraSetRest: 15,
    densityPenalty: 0.85,
    instructions: 'Execute 1 activation set to near-failure (@9.0-9.5), rack for 15s, then perform 3-5 mini-sets of 3-5 reps on strict 15s rest intervals until velocity noticeably decays.',
    sfrRating: 'A+'
  },
  'Rest-Pause (Dogcrapp)': {
    id: 'rest_pause_dc',
    name: 'Rest-Pause (Dogcrapp)',
    category: 'Hypertrophy',
    pattern: 'rest_pause',
    actRpe: 9.5,
    clusterRpe: 10.0,
    clusters: 2,
    baseSets: 3,
    reps: [8, 4, 2],
    targetRpe: 10.0,
    restSeconds: 180,
    intraSetRest: 25,
    densityPenalty: 0.90,
    instructions: 'Take the activation set to technical failure, take 10-15 deep breaths (approx. 20-25s), grind out cluster 1 to failure, rest another 10-15 deep breaths, and finish cluster 2 to failure.',
    sfrRating: 'A'
  },
  'Density Block': {
    id: 'density_block',
    name: 'Density Block',
    category: 'Hypertrophy',
    pattern: 'density_block',
    baseSets: 4,
    reps: 8,
    repLockMode: 'phase',
    targetRpe: 8.0,
    targetLoadPct: 65,
    defaultMinutes: 8,
    restSeconds: 45,
    intraSetRest: 45,
    densityPenalty: 0.85,
    repGoal: 35,
    instructions: 'Set the countdown clock (1-20 min) with fixed target weight. Cycle quality submaximal mini-sets. Advance load when total volume reps within the block reach your rep goal or increase by >= 15%.',
    sfrRating: 'A-'
  },
  'Rep Goal System (Metabolic 50)': {
    id: 'rep_goal_50',
    name: 'Rep Goal System (Metabolic 50)',
    category: 'Hypertrophy',
    pattern: 'rep_goal',
    baseSets: 4,
    repGoal: 50,
    targetRpe: 9.0,
    restSeconds: 90,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Accumulate 50 total reps across as few sets as possible. Terminate each set 1-2 reps shy of failure. Advance load (+5 lbs) once 50 reps are accumulated in 3 or fewer sets.',
    sfrRating: 'A'
  },
  'Reverse Pyramid': {
    id: 'reverse_pyramid',
    name: 'Reverse Pyramid',
    category: 'Hypertrophy',
    pattern: 'reverse_pyramid',
    drop1Pct: 10,
    drop2Pct: 20,
    drop3Pct: 30,
    baseSets: 3,
    topSetCount: 1,
    reps: [4, 6, 8],
    targetRpe: 9.0,
    fatigueDropPct: 0.10,
    restSeconds: 150,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Warm up to the heavy top set first. Strip load by 10-20% for back-off sets while expanding rep targets by +2 to +4 reps to compound volume under fatigue.',
    sfrRating: 'A'
  },
  'Tapered': {
    id: 'tapered',
    name: 'Tapered',
    category: 'Hypertrophy',
    pattern: 'load_drop',
    baseSets: 3,
    topSetCount: 1,
    reps: [6, 8, 10],
    targetRpe: 8.5,
    fatigueDropPct: 0.075,
    restSeconds: 120,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Hit a high-intensity opener set, then drop load by 10-15% for uniform capacity back-offs to collect safe mechanical tension.',
    sfrRating: 'B+'
  },
  'Ascending Pyramid': {
    id: 'ascending_pyramid',
    name: 'Ascending Pyramid',
    category: 'Hypertrophy',
    pattern: 'ramp',
    baseSets: 3,
    reps: [12, 10, 8],
    targetRpe: 7.5,
    rpeStepDelta: 0.5,
    restSeconds: 120,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Step up load and effort each set as reps decrease. Treat earlier sets as potentiation ramp sets; only the final peak set reaches maximum intensity.',
    sfrRating: 'B'
  },
  'Volume Pyramid': {
    id: 'volume_pyramid',
    name: 'Volume Pyramid',
    category: 'Hypertrophy',
    pattern: 'ramp',
    baseSets: 4,
    reps: [10, 8, 8, 12],
    targetRpe: 8.0,
    rpeStepDelta: 0.5,
    restSeconds: 120,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Ascend in load to an apex peak set, then descend down the ladder. Use the eccentric fatigue on descending sets to maximize metabolic stress.',
    sfrRating: 'B-'
  },
  'Force/Metabolic Interleave': {
    id: 'force_metabolic_interleave',
    name: 'Force/Metabolic Interleave',
    category: 'Hypertrophy',
    pattern: 'load_drop',
    baseSets: 4,
    topSetCount: 1,
    reps: [5, 15, 5, 20],
    targetRpe: 9.0,
    fatigueDropPct: 0.20,
    restSeconds: 120,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Alternate between heavy low-rep mechanical tension sets (3-5r) and light high-rep pump sets (15-20r) to simultaneously exhaust different motor unit pools.',
    sfrRating: 'B+'
  },
  'Drop Set': {
    id: 'drop_set',
    name: 'Drop Set',
    category: 'Hypertrophy',
    pattern: 'load_drop',
    baseSets: 3,
    topSetCount: 1,
    reps: [8, 8, 8],
    targetRpe: 9.5,
    fatigueDropPct: 0.15,
    restSeconds: 15,
    intraSetRest: 15,
    densityPenalty: 0.85,
    instructions: 'Take the primary set to near-failure, immediately strip 15-20% of the load without resting, repeat to failure, and strip a second time.',
    sfrRating: 'A-'
  },
  'Hypertrophy Cluster': {
    id: 'hypertrophy_cluster',
    name: 'Hypertrophy Cluster',
    category: 'Hypertrophy',
    pattern: 'cluster',
    baseSets: 4,
    reps: 6,
    targetRpe: 8.0,
    targetLoadPct: 72.5,
    restSeconds: 120,
    intraSetRest: 20,
    densityPenalty: 0.90,
    instructions: 'Use a moderately heavy load (approx. 72.5-75% e1RM) for repeatable sets of 6 on strict 20s intra-set pacing to maintain bar speed.',
    sfrRating: 'A'
  },
  'Ascending Triplet + Load Drop': {
    id: 'ascending_triplet_drop',
    name: 'Ascending Triplet + Load Drop',
    category: 'Hypertrophy',
    pattern: 'load_drop',
    baseSets: 4,
    topSetCount: 3,
    reps: 3,
    targetRpe: 9.0,
    fatigueDropPct: 0.12,
    restSeconds: 150,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Climb through 3 progressive effort benchmarks (x@7.0, x@8.0, x@9.0), then strip 7-12% load for a single volume down set.',
    sfrRating: 'A-'
  },
  'Ascending RPE Ladder': {
    id: 'ascending_rpe_ladder',
    name: 'Ascending RPE Ladder',
    category: 'Hypertrophy',
    pattern: 'ramp',
    baseSets: 3,
    reps: 8,
    targetRpe: 7.0,
    rpeStepDelta: 1.0,
    restSeconds: 120,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Keep reps fixed while ascending effort tiers (@6.0 -> @7.0 -> @8.0). Gauge neuromuscular fatigue by how much load is needed to hit the final @8.0 threshold.',
    sfrRating: 'B+'
  },
  'Intensity Matched': {
    id: 'intensity_matched',
    name: 'Intensity Matched',
    category: 'Hypertrophy',
    pattern: 'straight',
    baseSets: 3,
    reps: 8,
    targetRpe: 8.0,
    restSeconds: 120,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Reps and target RPE are locked across sets. Autoregulate by manually adjusting load up or down from set to set based on immediate bar speed.',
    sfrRating: 'B'
  },
  'The 3/7 Tension Ladder': {
    id: 'tension_ladder_37',
    name: 'The 3/7 Tension Ladder',
    category: 'Hypertrophy',
    pattern: 'cluster',
    baseSets: 5,
    reps: [3, 4, 5, 6, 7],
    targetLoadPct: 70.0,
    targetRpe: 9.5,
    restSeconds: 180,
    intraSetRest: 15,
    densityPenalty: 0.90,
    instructions: 'Advance load (+5 lbs) when all 7 reps of the 5th cluster are completed at or below RPE 9.5 on strict 15s intra-rest.',
    sfrRating: 'A',
    tierScaling: {
      Main: { baseSets: 5, intraSetRest: 15, restSeconds: 180 },
      Secondary: { baseSets: 5, intraSetRest: 15, restSeconds: 150 },
      Assistance: { baseSets: 5, intraSetRest: 12, restSeconds: 120 }
    }
  },
  'Integrated Lengthened Partials': {
    id: 'lengthened_partials_cascade',
    name: 'Integrated Lengthened Partials',
    category: 'Hypertrophy',
    pattern: 'load_drop',
    baseSets: 3,
    topSetCount: 1,
    reps: [8, 10, 12],
    targetRpe: 8.5,
    fatigueDropPct: 0.10,
    restSeconds: 150,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Complete full ROM target reps, then immediately pulse 4-6 partials in the deep lengthened stretch to failure before re-racking.',
    sfrRating: 'A+',
    tierScaling: {
      Main: { targetRpe: 8.5, restSeconds: 180 },
      Secondary: { targetRpe: 9.0, restSeconds: 120 },
      Assistance: { targetRpe: 9.5, restSeconds: 90 }
    }
  },
  'Statodynamic Occlusion Waves': {
    id: 'statodynamic_waves',
    name: 'Statodynamic Occlusion Waves',
    category: 'Hypertrophy',
    pattern: 'cluster',
    baseSets: 3,
    reps: 10,
    targetLoadPct: 58.0,
    targetRpe: 9.0,
    restSeconds: 120,
    intraSetRest: 30,
    densityPenalty: 0.90,
    instructions: 'Continuous tension: 2s down, 2s up, zero lockouts, zero bottom pauses. 3 bursts of 30s continuous work with 30s intra-rest.',
    sfrRating: 'A',
    tierScaling: {
      Main: { baseSets: 3, intraSetRest: 30 },
      Secondary: { baseSets: 3, intraSetRest: 30 },
      Assistance: { baseSets: 4, intraSetRest: 20 }
    }
  },

  // ==========================================
  // STRENGTH SCHEMES
  // ==========================================
  'Top Set + Back-off': {
    id: 'top_set_backoff',
    name: 'Top Set + Back-off',
    category: 'Strength',
    pattern: 'load_drop',
    baseSets: 4,
    topSetCount: 1,
    reps: [3, 5, 5, 5],
    targetRpe: 9.0,
    fatigueDropPct: 0.10,
    restSeconds: 180,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Calibrate neuromuscular readiness with 1 heavy top set (@8.5-9.0), then drop load 10-15% across working sets to accumulate clean strength volume.',
    sfrRating: 'A'
  },
  'Primer Single + % Back-offs': {
    id: 'primer_single_backoffs',
    name: 'Primer Single + % Back-offs',
    category: 'Strength',
    pattern: 'load_drop',
    baseSets: 4,
    topSetCount: 1,
    reps: [1, 5, 5, 5],
    targetRpe: 8.5,
    fatigueDropPct: 0.15,
    restSeconds: 180,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Perform a single at RPE 8.0 to prime neural recruitment without inducing excessive fatigue, followed by repeat sets across at 85-88% of that single\'s load.',
    sfrRating: 'S'
  },
  'Benchmark + Density Back-Off': {
    id: 'benchmark_density',
    name: 'Benchmark + Density Back-Off',
    category: 'Strength',
    pattern: 'load_drop',
    baseSets: 4,
    topSetCount: 1,
    reps: [3, 8, 8, 8],
    targetRpe: 9.0,
    fatigueDropPct: 0.20,
    restSeconds: 90,
    intraSetRest: 0,
    densityPenalty: 0.90,
    instructions: 'Establish daily e1RM with a calibrated benchmark set (1-4@8.0), followed by 6 tight speed-density back-off sets at 70-80% on strict 30-60s rest.',
    sfrRating: 'A-'
  },
  'Submaximal AMRAP Calibration': {
    id: 'submax_amrap_cal',
    name: 'Submaximal AMRAP Calibration',
    category: 'Strength',
    pattern: 'ramp',
    baseSets: 3,
    reps: 5,
    targetRpe: 8.0,
    rpeStepDelta: 0.5,
    restSeconds: 180,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Use a submaximal anchor set (10@9.0 or 5@8.0) to calibrate exact estimated 1RM, directly driving loads for subsequent back-off volume sets.',
    sfrRating: 'A'
  },
  'Autoregulated Fatigue Stop': {
    id: 'autoreg_fatigue_stop',
    name: 'Autoregulated Fatigue Stop',
    category: 'Strength',
    pattern: 'repeats',
    baseSets: 4,
    reps: 5,
    targetRpe: 8.0,
    fatigueStopRpe: 9.5,
    restSeconds: 180,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Repeat sets across at target load until fatigue causes perceived effort to cross the stop threshold (typically RPE 9.0 or a 0.5-1.0 RPE rise), then terminate the movement.',
    sfrRating: 'A'
  },
  'Dynamic Effort (Speed Waves)': {
    id: 'dynamic_effort_waves',
    name: 'Dynamic Effort (Speed Waves)',
    category: 'Strength',
    pattern: 'straight',
    baseSets: 6,
    reps: 3,
    targetRpe: 7.0,
    restSeconds: 60,
    intraSetRest: 0,
    densityPenalty: 0.80,
    instructions: 'Move 60-70% e1RM bar weight with maximum intent and acceleration on short 45-60s rest intervals. Terminate early if velocity drops visibly.',
    sfrRating: 'A'
  },
  'Intra-Set Cluster (4x[2+2+2])': {
    id: 'intra_set_cluster_222',
    name: 'Intra-Set Cluster (4x[2+2+2])',
    category: 'Strength',
    pattern: 'cluster',
    baseSets: 4,
    reps: 6,
    targetRpe: 8.5,
    targetLoadPct: 75.0,
    restSeconds: 180,
    intraSetRest: 20,
    densityPenalty: 0.95,
    instructions: 'Perform 2 reps, rack for 15-20s, perform 2 reps, rack for 15-20s, finish final 2 reps. Counts as 1 cluster working set; keeps power output high with heavy weights.',
    sfrRating: 'A+'
  },
  'Autoregulated Fatigue Drop (-5%)': {
    id: 'autoreg_fatigue_drop_5',
    name: 'Autoregulated Fatigue Drop (-5%)',
    category: 'Strength',
    pattern: 'load_drop',
    baseSets: 4,
    topSetCount: 1,
    reps: 5,
    targetRpe: 9.0,
    fatigueDropPct: 0.05,
    restSeconds: 180,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Work at top load until perceived effort drifts +0.5 above target. Drop bar weight by exactly 5% and continue until hitting the fatigue ceiling again.',
    sfrRating: 'B+'
  },
  'Prescription Table': {
    id: 'prescription_table',
    name: 'Prescription Table',
    category: 'Strength',
    pattern: 'straight',
    baseSets: 3,
    reps: 5,
    targetRpe: 8.0,
    restSeconds: 180,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Execute strict percentage-based sets focusing on bar path consistency and crisp acceleration without grinding.',
    sfrRating: 'B'
  },
  'Wave Loading': {
    id: 'wave_loading',
    name: 'Wave Loading',
    category: 'Strength',
    pattern: 'wave',
    wave1TopRpe: 8.5,
    wave2TopRpe: 9.0,
    baseSets: 6,
    reps: [5, 3, 1, 5, 3, 1],
    targetRpe: 8.0,
    rpeStepDelta: 0.5,
    restSeconds: 180,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Perform Wave 1 (5, 3, 1 reps) ending submaximally; use the neural post-activation potentiation to load Wave 2 (5, 3, 1 reps) heavier than Wave 1.',
    sfrRating: 'A'
  },
  'Double Pyramid': {
    id: 'double_pyramid',
    name: 'Double Pyramid',
    category: 'Strength',
    pattern: 'wave',
    baseSets: 5,
    reps: [6, 4, 2, 4, 6],
    targetRpe: 8.0,
    rpeStepDelta: 0.5,
    restSeconds: 180,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Ramp up to a heavy double/triple apex peak, then descend the ladder while fatigue accumulates. Prioritize technical discipline on the descent.',
    sfrRating: 'B'
  },
  'Sawtooth': {
    id: 'sawtooth',
    name: 'Sawtooth',
    category: 'Strength',
    pattern: 'wave',
    heavyRpe: 8.5,
    repRpe: 8.0,
    baseSets: 6,
    reps: [6, 4, 6, 4, 6, 4],
    targetRpe: 8.0,
    rpeStepDelta: 0.5,
    restSeconds: 150,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Alternate between heavy low-rep anchor sets and lighter rep-capacity sets across consecutive rounds (e.g., 4r heavy -> 8r moderate -> 4r heavy -> 8r moderate).',
    sfrRating: 'B+'
  },
  'Strength Cluster': {
    id: 'strength_cluster',
    name: 'Strength Cluster',
    category: 'Strength',
    pattern: 'cluster',
    baseSets: 4,
    reps: 3,
    targetRpe: 9.0,
    restSeconds: 180,
    intraSetRest: 20,
    densityPenalty: 0.95,
    instructions: 'Use an 85-88% e1RM load for doubles or triples on strict 30s intra-set rest. Emphasize maximal force production on every individual rep.',
    sfrRating: 'A'
  },
  'e1RM Grounding AMRAP': {
    id: 'grounding_amrap',
    name: 'e1RM Grounding AMRAP',
    category: 'Strength',
    pattern: 'load_drop',
    baseSets: 3,
    topSetCount: 1,
    reps: [5, 8, 8],
    targetRpe: 9.5,
    fatigueDropPct: 0.10,
    restSeconds: 180,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Build through warm-up primers into 1 max-effort AMRAP set capped at RPE 9.5 to establish and re-anchor true current estimated 1RM.',
    sfrRating: 'A'
  },
  'Rest-Redistribution Singles': {
    id: 'rest_redistribution_singles',
    name: 'Rest-Redistribution Singles',
    category: 'Strength',
    pattern: 'cluster',
    baseSets: 12,
    reps: 1,
    targetLoadPct: 82.5,
    targetRpe: 7.5,
    restSeconds: 180,
    intraSetRest: 20,
    densityPenalty: 1.0,
    instructions: 'Execute every single with maximal bar acceleration. Terminate cluster series early if bar speed visibly drops (RPE > 8.5).',
    sfrRating: 'S',
    tierScaling: {
      Main: { baseSets: 12, targetLoadPct: 82.5, intraSetRest: 20 },
      Secondary: { baseSets: 8, targetLoadPct: 80.0, intraSetRest: 15 },
      Assistance: { baseSets: 6, targetLoadPct: 75.0, intraSetRest: 15 }
    }
  },
  'Reciprocal Antagonist Potentiation': {
    id: 'reciprocal_potentiation_waves',
    name: 'Reciprocal Antagonist Potentiation',
    category: 'Strength',
    pattern: 'ramp',
    baseSets: 4,
    reps: [5, 4, 3, 2],
    targetRpe: 8.5,
    rpeStepDelta: 0.5,
    restSeconds: 150,
    intraSetRest: 0,
    densityPenalty: 1.0,
    instructions: 'Perform a heavy submaximal antagonist movement (e.g. Row @7.0) 60s before each pressing effort.',
    sfrRating: 'B+',
    tierScaling: {
      Main: { restSeconds: 180, targetRpe: 8.5 },
      Secondary: { restSeconds: 120, targetRpe: 8.0 },
      Assistance: { restSeconds: 90, targetRpe: 8.5 }
    }
  }
};
window.DEFAULT_SCHEME_BLUEPRINTS = DEFAULT_SCHEME_BLUEPRINTS;

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
          if (p.equipment) state.equipment = { ...defaultEquipmentInventory, ...p.equipment };
          if (p.customSplitBlueprints) state.customSplitBlueprints = p.customSplitBlueprints;
          if (p.schemeRecipes) state.schemeRecipes = { ...defaultSchemeRecipes, ...p.schemeRecipes };
          if (p.anchorE1rms) state.anchorE1rms = { ...state.e1rms, ...p.anchorE1rms };
          if (p.oneRmFormula) state.settings.oneRmFormula = p.oneRmFormula;
        }
      }
      const savedProf = localStorage.getItem('apex_profile');
      if (savedProf) { const p = JSON.parse(savedProf); if (p && typeof p === 'object') state.profile = { ...state.profile, ...p }; }
      const savedStart = localStorage.getItem('apex_mesocycleStartDate');
      if (savedStart) state.mesocycleStartDate = normalizeDateKey(savedStart);
      const savedMacro = localStorage.getItem('apex_mesocycle');
      if (savedMacro) { const p = JSON.parse(savedMacro); if (Array.isArray(p) && p.length > 0) state.mesocycle = p; }
      const savedBlockIdx = localStorage.getItem('apex_activeBlockIdx');
      if (savedBlockIdx !== null && savedBlockIdx !== undefined && !isNaN(Number(savedBlockIdx))) {
        state.activeBlockIdx = Math.max(0, Number(savedBlockIdx));
      } else if (state.settings?.activeBlockIdx !== undefined) {
        state.activeBlockIdx = Math.max(0, Number(state.settings.activeBlockIdx) || 0);
      }
      const savedActiveWeek = localStorage.getItem('apex_activeWeek');
      if (savedActiveWeek !== null && savedActiveWeek !== undefined && !isNaN(Number(savedActiveWeek))) {
        state.activeWeek = Math.max(1, Number(savedActiveWeek));
      } else if (state.settings?.activeWeek !== undefined) {
        state.activeWeek = Math.max(1, Number(state.settings.activeWeek) || 1);
      }
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

      const savedBlueprints = localStorage.getItem('apex_schemeBlueprints');
      if (savedBlueprints) {
        try {
          const p = JSON.parse(savedBlueprints);
          if (p && typeof p === 'object' && Object.keys(p).length > 0) {
            delete p['Dynamic Double Progression (Rep Range)'];
            delete p['Step Loading (Double Progression)'];
            state.schemeBlueprints = { ...DEFAULT_SCHEME_BLUEPRINTS, ...p };
            Object.keys(DEFAULT_SCHEME_BLUEPRINTS).forEach(sKey => {
              if (state.schemeBlueprints[sKey]) {
                state.schemeBlueprints[sKey] = {
                  ...DEFAULT_SCHEME_BLUEPRINTS[sKey],
                  ...state.schemeBlueprints[sKey]
                };
              }
            });
            if (state.schemeBlueprints['Double Progression']?.pattern === 'straight') {
              state.schemeBlueprints['Double Progression'].pattern = 'double_progression';
            }
            if (state.schemeBlueprints['Density Block']?.pattern === 'straight') {
              state.schemeBlueprints['Density Block'].pattern = 'density_block';
            }
          }
        } catch(e) {}
      }
      if (!state.schemeBlueprints) {
        state.schemeBlueprints = JSON.parse(JSON.stringify(DEFAULT_SCHEME_BLUEPRINTS));
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

    function safeSaveDayLogsLocal(dayLogsObj) {
  if (!dayLogsObj || typeof dayLogsObj !== 'object') return;
  try {
    localStorage.setItem('apex_dayLogs', JSON.stringify(dayLogsObj));
  } catch (e) {
    // 1. Free the existing localStorage key first so the 5MB quota clears immediately
    try { localStorage.removeItem('apex_dayLogs'); } catch (_) {}
    // 2. Trim ONLY the localStorage cache copy (NEVER mutate state.dayLogs in memory!)
    const allKeys = Object.keys(dayLogsObj).sort();
    for (const keepCount of [60, 40, 25, 15, 5]) {
      try {
        const subset = {};
        allKeys.slice(-keepCount).forEach(k => { subset[k] = dayLogsObj[k]; });
        localStorage.setItem('apex_dayLogs', JSON.stringify(subset));
        return;
      } catch (_) {
        try { localStorage.removeItem('apex_dayLogs'); } catch (_) {}
      }
    }
  }
}

// Global Persistence Engine with Database-Safe Settings Mirroring
function persist() {
  try {
    state.settings.customSplitBlueprints = state.customSplitBlueprints;
    state.settings.schemeRecipes = state.schemeRecipes;
    state.settings.anchorE1rms = state.anchorE1rms;
    state.settings.oneRmFormula = state.settings.oneRmFormula || 'apex';
    state.settings.mesocycleStartDate = state.mesocycleStartDate;
    state.settings.activeBlockIdx = state.activeBlockIdx;
    state.settings.activeWeek = state.activeWeek;
    localStorage.setItem('apex_activeBlockIdx', String(state.activeBlockIdx || 0));
    localStorage.setItem('apex_activeWeek', String(state.activeWeek || 1));
    state.settings.rpeProfiles = state.rpeProfiles;
    state.settings.activeRpeProfileId = state.activeRpeProfileId;
    state.settings.equipment = state.equipment;
    localStorage.setItem('apex_equipment', JSON.stringify(state.equipment));
    safeSaveDayLogsLocal(state.dayLogs);
        localStorage.setItem('apex_savedStaged', JSON.stringify(state.savedStaged));
        localStorage.setItem('apex_e1rms', JSON.stringify(state.e1rms));
        localStorage.setItem('apex_anchorE1rms', JSON.stringify(state.anchorE1rms || {}));
        localStorage.setItem('apex_prLedger', JSON.stringify(state.prLedger));
        localStorage.setItem('apex_settings', JSON.stringify(state.settings));
        localStorage.setItem('apex_profile', JSON.stringify(state.profile));
        localStorage.setItem('apex_mesocycleStartDate', state.mesocycleStartDate);
        localStorage.setItem('apex_mesocycle', JSON.stringify(state.mesocycle));
        localStorage.setItem('apex_weekdaySplit', JSON.stringify(state.weekdaySplit));
        localStorage.setItem('apex_customSplitBlueprints', JSON.stringify(state.customSplitBlueprints));
        localStorage.setItem('apex_exerciseMeta', JSON.stringify(state.exerciseMeta));
        localStorage.setItem('apex_exercises', JSON.stringify(state.exercises));
        localStorage.setItem('apex_phaseRepMatrix', JSON.stringify(state.phaseRepMatrix));
        localStorage.setItem('apex_schemeRecipes', JSON.stringify(state.schemeRecipes));
        localStorage.setItem('apex_schemeBlueprints', JSON.stringify(state.schemeBlueprints || {}));
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

    // State-First Mesocycle Position Resolver (Decoupled from Modulo Timeline Wrap-Around)
    function getMesocyclePosition(targetDate = null) {
      if (!state.mesocycle || !state.mesocycle.length) {
        return { blockIdx: 0, week: 1, phase: 'Hypertrophy', block: { phase: 'Hypertrophy', weeks: 3 } };
      }

      const activeIdx = Math.min(Math.max(0, Number(state.activeBlockIdx) || 0), state.mesocycle.length - 1);
      const activeBlock = state.mesocycle[activeIdx] || state.mesocycle[0];
      const maxBlockWeeks = Math.max(1, Number(activeBlock.weeks) || 3);
      const currentActiveWeek = Math.min(Math.max(1, Number(state.activeWeek) || 1), maxBlockWeeks);

      if (!targetDate) {
        return {
          blockIdx: activeIdx,
          week: currentActiveWeek,
          phase: activeBlock.phase,
          block: activeBlock
        };
      }

      // If staging a specific future date > today, project forward from current active Block/Week without looping back to Block 0
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let cur = (targetDate instanceof Date) ? new Date(targetDate) : new Date();
        if (typeof targetDate === 'string' && targetDate.includes('-')) {
          const [tY, tM, tD] = targetDate.split('-').map(Number);
          cur = new Date(tY, tM - 1, tD);
        }
        cur.setHours(0, 0, 0, 0);

        const diffWeeks = Math.floor((cur - today) / (1000 * 60 * 60 * 24 * 7));
        if (diffWeeks <= 0) {
          return { blockIdx: activeIdx, week: currentActiveWeek, phase: activeBlock.phase, block: activeBlock };
        }

        let remWeeks = diffWeeks;
        let bIdx = activeIdx;
        let wNum = currentActiveWeek;

        while (remWeeks > 0 && bIdx < state.mesocycle.length) {
          const bLimit = Math.max(1, Number(state.mesocycle[bIdx].weeks) || 3);
          if (wNum < bLimit) {
            wNum++;
            remWeeks--;
          } else if (bIdx < state.mesocycle.length - 1) {
            bIdx++;
            wNum = 1;
            remWeeks--;
          } else {
            // Reached the end of the planned mesocycle queue: hold at final block rather than wrapping around to Block 0
            wNum = bLimit;
            break;
          }
        }
        const resolvedBlock = state.mesocycle[bIdx];
        return { blockIdx: bIdx, week: wNum, phase: resolvedBlock.phase, block: resolvedBlock };
      } catch (e) {}

      return { blockIdx: activeIdx, week: currentActiveWeek, phase: activeBlock.phase, block: activeBlock };
    }

    function syncMesocycleProgression() {
      if (!state.mesocycle || !state.mesocycle.length) return;
      if (state.activeBlockIdx >= state.mesocycle.length || state.activeBlockIdx < 0) {
        state.activeBlockIdx = Math.max(0, state.mesocycle.length - 1);
      }
      const maxW = Math.max(1, Number(state.mesocycle[state.activeBlockIdx]?.weeks) || 3);
      if (!state.activeWeek || state.activeWeek > maxW || state.activeWeek < 1) {
        state.activeWeek = 1;
      }
    }

    function getVariantKey(ex, mods = []) {
  const cleanMods = sanitizeModifiers(mods).filter(m => m.toLowerCase() !== 'barbell');
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

   // Multi-Formula & RPE-Aware 1RM Prediction Engine
function calculate1RmEquivalent(weight, reps, rpeOrFormula = 10, exName = '') {
  const w = Number(weight) || 0;
  const r = Math.max(1, Number(reps) || 1);
  if (w <= 0) return 0;

  // Determine if 3rd arg is a formula name ('epley', 'brzycki', etc.) or an RPE number
  const isFormulaStr = typeof rpeOrFormula === 'string' && isNaN(Number(rpeOrFormula));
  const formulaOverride = isFormulaStr ? rpeOrFormula.toLowerCase() : null;
  const rpeVal = isFormulaStr ? 10 : (Number(rpeOrFormula) || 10);

  // If no RIR and 1 rep, 1RM is simply the weight
  if (r === 1 && rpeVal >= 10) return Math.round(w);

  // Route through getUnifiedE1RM if no specific formula override was requested
  if (!formulaOverride && typeof getUnifiedE1RM === 'function') {
    return getUnifiedE1RM(w, r, rpeVal, exName);
  }

  // Otherwise use getPct with the requested formula & RPE
  const pct = getPct(r, rpeVal, formulaOverride);
  return Math.round(w / (Math.max(30, pct) / 100));
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
// ==========================================
// RPE MATRIX & E1RM ENGINE
// ==========================================

const RPE_COLS = [10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5];

const DEFAULT_HIGH_CAPACITY_BASE = {
  1:  { 10: 100.0, 9.5: 99.1, 9: 98.1, 8.5: 97.2, 8: 96.2, 7.5: 95.3, 7: 94.4, 6.5: 93.5, 6: 92.6, 5.5: 91.8, 5: 90.9 },
  2:  { 10: 98.1,  9.5: 97.2, 9: 96.2, 8.5: 95.3, 8: 94.4, 7.5: 93.5, 7: 92.6, 6.5: 91.8, 6: 90.9, 5.5: 90.1, 5: 89.2 },
  3:  { 10: 96.2,  9.5: 95.3, 9: 94.4, 8.5: 93.5, 8: 92.6, 7.5: 91.8, 7: 90.9, 6.5: 90.1, 6: 89.2, 5.5: 88.4, 5: 87.5 },
  4:  { 10: 94.4,  9.5: 93.5, 9: 92.6, 8.5: 91.8, 8: 90.9, 7.5: 90.1, 7: 89.2, 6.5: 88.4, 6: 87.5, 5.5: 86.7, 5: 85.8 },
  5:  { 10: 92.6,  9.5: 91.8, 9: 90.9, 8.5: 90.1, 8: 89.2, 7.5: 88.4, 7: 87.5, 6.5: 86.7, 6: 85.8, 5.5: 85.0, 5: 84.2 },
  6:  { 10: 90.9,  9.5: 90.1, 9: 89.2, 8.5: 88.4, 8: 87.5, 7.5: 86.7, 7: 85.8, 6.5: 85.0, 6: 84.2, 5.5: 83.5, 5: 82.7 },
  7:  { 10: 89.2,  9.5: 88.4, 9: 87.5, 8.5: 86.7, 8: 85.8, 7.5: 85.0, 7: 84.2, 6.5: 83.5, 6: 82.7, 5.5: 81.9, 5: 81.1 },
  8:  { 10: 87.5,  9.5: 86.7, 9: 85.8, 8.5: 85.0, 8: 84.2, 7.5: 83.5, 7: 82.7, 6.5: 81.9, 6: 81.1, 5.5: 80.4, 5: 79.6 },
  9:  { 10: 85.8,  9.5: 85.0, 9: 84.2, 8.5: 83.5, 8: 82.7, 7.5: 81.9, 7: 81.1, 6.5: 80.4, 6: 79.6, 5.5: 78.9, 5: 78.1 },
  10: { 10: 84.2,  9.5: 83.5, 9: 82.7, 8.5: 81.9, 8: 81.1, 7.5: 80.4, 7: 79.6, 6.5: 78.9, 6: 78.1, 5.5: 77.4, 5: 76.6 },
  11: { 10: 82.7,  9.5: 81.9, 9: 81.1, 8.5: 80.4, 8: 79.6, 7.5: 78.9, 7: 78.1, 6.5: 77.4, 6: 76.6, 5.5: 75.9, 5: 75.2 },
  12: { 10: 81.1,  9.5: 80.4, 9: 79.6, 8.5: 78.9, 8: 78.1, 7.5: 77.4, 7: 76.6, 6.5: 75.9, 6: 75.2, 5.5: 74.5, 5: 73.8 }
};
window.DEFAULT_HIGH_CAPACITY_BASE = DEFAULT_HIGH_CAPACITY_BASE;

// Autonomously extends 1-12 slope out to 50 reps using dampened decay
function extendRpeMatrix(baseMatrix, maxReps = 50) {
  const extended = JSON.parse(JSON.stringify(baseMatrix));
  for (let rep = 13; rep <= maxReps; rep++) {
    extended[rep] = {};
    let dropPerRep;
    if (rep <= 16) dropPerRep = 1.50;
    else if (rep <= 22) dropPerRep = 1.20;
    else if (rep <= 30) dropPerRep = 0.90;
    else if (rep <= 40) dropPerRep = 0.65;
    else dropPerRep = 0.50;

    const prevRep10 = extended[rep - 1][10];
    const currentRep10 = Math.round((prevRep10 - dropPerRep) * 10) / 10;
    extended[rep][10] = currentRep10;

    const stepOffset = Math.max(0.45, Math.round((currentRep10 * 0.01) * 100) / 100);
    for (let i = 1; i < RPE_COLS.length; i++) {
      const rpe = RPE_COLS[i];
      const prevRpe = RPE_COLS[i - 1];
      extended[rep][rpe] = Math.round((extended[rep][prevRpe] - stepOffset) * 10) / 10;
    }
  }
  return extended;
}
window.extendRpeMatrix = extendRpeMatrix;
function resolveBlueprintForPhase(bp, phase) {
  if (!bp) return null;
  if (!phase || phase === 'Global' || !bp.phaseOverrides || !bp.phaseOverrides[phase]) {
    return bp;
  }
  // Merge phase overrides on top of global blueprint properties
  return {
    ...bp,
    ...bp.phaseOverrides[phase],
    isOverridden: true
  };
}
window.resolveBlueprintForPhase = resolveBlueprintForPhase;
window.generateSetsFromBlueprint = generateSetsFromBlueprint;


// ============================================================================
// STIMULUS-TO-FATIGUE (SFR) & SCHEME STRAIN ENGINE (Clean / No Amber)
// ============================================================================
function calculateSchemeStrain(sets) {
  if (!Array.isArray(sets) || !sets.length) {
    return { score: 0, level: 'Low', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500' };
  }
  let totalStrain = 0;
  sets.forEach(s => {
    const reps = Number(s.actualReps || s.targetReps) || 5;
    const load = Number(s.actualWeight || s.targetLoad) || 100;
    const rpe = Number(s.actualRpe || s.targetRpe) || 8.0;
    totalStrain += (reps * load * (rpe * rpe)) / 1000;
  });
  const score = Math.round(totalStrain);
  let level = 'Moderate';
  let badge = 'bg-blue-500/20 text-blue-300 border-blue-500';

  if (score > 320) {
    level = 'Severe';
    badge = 'bg-rose-500/20 text-rose-300 border-rose-500';
  } else if (score > 220) {
    level = 'High';
    badge = 'bg-indigo-500/20 text-indigo-300 border-indigo-500';
  } else if (score < 120) {
    level = 'Low / Recovery';
    badge = 'bg-teal-500/20 text-teal-300 border-teal-500';
  }
  return { score, level, badge };
}
window.calculateSchemeStrain = calculateSchemeStrain;

function getReadinessStrainCeiling(readinessScore) {
  const score = Number(readinessScore) || 75;
  if (score >= 85) return { max: 1000, label: 'High Capacity', badge: 'text-emerald-400' };
  if (score >= 65) return { max: 800, label: 'Optimal Capacity', badge: 'text-blue-400' };
  if (score >= 50) return { max: 550, label: 'Guarded Capacity', badge: 'text-slate-300' };
  return { max: 380, label: 'Fatigued / Deload', badge: 'text-rose-400' };
}
window.getReadinessStrainCeiling = getReadinessStrainCeiling;

function generateSetsFromBlueprint(paramsOrName, metaArg, e1rmArg, baseWorkingSetsArg = 3, landmarkOffsetArg = 0) {
  // Self-heal: automatically migrate or initialize blueprints
  if (!state.schemeBlueprints) {
    state.schemeBlueprints = JSON.parse(JSON.stringify(typeof DEFAULT_SCHEME_BLUEPRINTS !== 'undefined' ? DEFAULT_SCHEME_BLUEPRINTS : {}));
  }

  // Unpack whether passed as an object or positional arguments
  let schemeName, meta, e1rm, baseWorkingSets, minRep, maxRep, rangeStr, weekRpeBump, isGrounding;
  if (typeof paramsOrName === 'object' && paramsOrName !== null) {
    ({
      schemeName,
      meta,
      e1rm,
      baseWorkingSets = 3,
      minRep = 8,
      maxRep = 8,
      rangeStr = '8',
      weekRpeBump = 0,
      isGrounding = false
    } = paramsOrName);
  } else {
    schemeName = paramsOrName;
    meta = metaArg;
    e1rm = e1rmArg;
    baseWorkingSets = baseWorkingSetsArg;
    weekRpeBump = landmarkOffsetArg;
    minRep = 8;
    maxRep = 8;
    rangeStr = '8';
    isGrounding = false;
  }

 const pool = state.schemeBlueprints || DEFAULT_SCHEME_BLUEPRINTS;
  const rawBp = pool[schemeName] || DEFAULT_SCHEME_BLUEPRINTS[schemeName];
  if (!rawBp) return null;

  // Resolve phase-specific overrides if a target phase is provided
  const targetPhase = (typeof paramsOrName === 'object' && paramsOrName?.phase) ? paramsOrName.phase : 'Hypertrophy';
  let bp = resolveBlueprintForPhase(rawBp, targetPhase);

  // Extract Tier (Main, Secondary, Assistance) and merge Tier-Aware parameter scaling
  const currentTier = (typeof paramsOrName === 'object' && paramsOrName?.tier) ? paramsOrName.tier : 'Main';
  if (bp.tierScaling && bp.tierScaling[currentTier]) {
    bp = {
      ...bp,
      ...bp.tierScaling[currentTier]
    };
  }

  const totalSets = Number(bp.baseSets || bp.setsCount) || baseWorkingSets || 3;
  const baseEffort = roundRpe(isGrounding ? 9.0 : ((Number(bp.targetRpe) || 8.0) + (weekRpeBump || 0)));
  const topCount = Number(bp.topSetCount) || 1;
  const isPlank = meta && meta.t && !meta.r;
  const sets = [];
  let topSetLoad = 0;

  for (let idx = 0; idx < totalSets; idx++) {
    // 1. Rep resolution (supports arrays [4,6,8], ranges '8-12', rep goals, or fixed counts)
    let setRepStr = rangeStr;
    let setRepVal = minRep;

    if (Array.isArray(bp.reps)) {
      const r = bp.reps[idx] !== undefined ? bp.reps[idx] : bp.reps[bp.reps.length - 1];
      setRepStr = String(r);
      setRepVal = Number(r) || minRep;
    } else if (bp.pattern === 'rep_goal') {
      const goal = Number(bp.repGoal) || 30;
      const r = Math.ceil(goal / totalSets);
      setRepStr = String(r);
      setRepVal = r;
    } else if (bp.reps || bp.targetReps) {
      const repSource = bp.reps || bp.targetReps;
      if (typeof repSource === 'string' && repSource.includes(',')) {
        const rArr = repSource.split(',').map(x => x.trim());
        setRepStr = rArr[idx] !== undefined ? rArr[idx] : rArr[rArr.length - 1];
        setRepVal = Number(setRepStr) || minRep;
      } else if (typeof repSource === 'string' && repSource.includes('-')) {
        setRepStr = repSource;
        setRepVal = Number(repSource.split('-')[0]) || minRep;
      } else {
        setRepStr = String(repSource);
        setRepVal = Number(repSource) || minRep;
      }
    }

    // 2. Effort resolution
    let setRpe = baseEffort;
    if (bp.pattern === 'ramp') {
      const rpeStep = bp.rpeStepDelta !== undefined ? Number(bp.rpeStepDelta) : 0.5;
      const stepsFromTop = totalSets - 1 - idx;
      setRpe = roundRpe(Math.max(6.0, baseEffort - (stepsFromTop * rpeStep)));
    } else if (bp.pattern === 'load_drop' && idx >= topCount) {
      setRpe = roundRpe(Math.max(6.0, baseEffort - 0.5));
    }

    // 3. Load resolution
    let setLoad = 0;
    if (meta && meta.w && e1rm > 0) {
      const penalty = Number(bp.densityPenalty) || 1.0;
      const calcReps = typeof setRepVal === 'number' ? setRepVal : (Number(minRep) || 8);

      if (bp.pattern === 'ramp') {
        // Ascending Ramp: Peak working set is the final set; earlier sets step down
        const rawRamp = bp.loadRampPct !== undefined ? bp.loadRampPct : 7.5;
        const rampPct = rawRamp > 1 ? rawRamp / 100 : rawRamp;
        const stepsFromTop = totalSets - 1 - idx;

        if (!topSetLoad) {
          let peakReps = minRep;
          const rSource = bp.reps || bp.targetReps;
          if (Array.isArray(rSource)) {
            peakReps = rSource[totalSets - 1] !== undefined ? rSource[totalSets - 1] : rSource[rSource.length - 1];
          } else if (typeof rSource === 'string' && rSource.includes(',')) {
            const parts = rSource.split(',');
            peakReps = Number(parts[parts.length - 1].trim()) || minRep;
          } else if (rSource) {
            peakReps = Number(rSource) || minRep;
          }
          topSetLoad = calcLoad(e1rm, getPct(peakReps, baseEffort) * penalty);
        }

        const multiplier = Math.max(0.2, 1 - (stepsFromTop * rampPct));
        setLoad = roundLoad(topSetLoad * multiplier);
      } else if (bp.pattern === 'cluster') {
        const rawClusterPct = Number(bp.targetLoadPct !== undefined ? bp.targetLoadPct : (typeof recipe !== 'undefined' && recipe?.targetLoadPct ? recipe.targetLoadPct : 72.5));
        setLoad = calcLoad(e1rm, rawClusterPct * penalty);
        if (idx === 0) topSetLoad = setLoad;
    } else if (idx === 0) {
      topSetLoad = calcLoad(e1rm, getPct(calcReps, baseEffort) * penalty);
      setLoad = topSetLoad;
    } else if (bp.pattern === 'load_drop' && idx >= topCount) {
      const rawDrop = bp.loadDropPct !== undefined ? bp.loadDropPct : (bp.fatiguedDropPct || bp.loadStepPct || 10);
      const dropPct = rawDrop > 1 ? rawDrop / 100 : rawDrop;
      const multiplier = 1 - (dropPct * (idx - topCount + 1));
      setLoad = roundLoad(topSetLoad * Math.max(0.1, multiplier));
    } else {
      setLoad = calcLoad(e1rm, getPct(calcReps, setRpe) * penalty);
    }
    }

    // 4. Label resolution
    let label = `Set ${idx + 1}`;
    if (bp.pattern === 'cluster') {
      label = `Cluster ${idx + 1}`;
    } else if (bp.pattern === 'rep_goal') {
      label = `Set ${idx + 1} (Goal: ${bp.repGoal || 30}r)`;
    } else if (bp.pattern === 'load_drop') {
      const rawDrop = bp.loadDropPct !== undefined ? bp.loadDropPct : ((Number(bp.fatiguedDropPct) || 0.05) * 100);
      const dropStep = rawDrop > 1 ? rawDrop : rawDrop * 100;
      const totalDropPct = Math.round(dropStep * (idx - topCount + 1));
      label = idx < topCount ? (isGrounding ? '🔥 Grounding Top Set (@9.0)' : (topCount === 1 ? 'Top Set' : `Top Set ${idx + 1}`)) : `Back-off ${idx - topCount + 1} (-${totalDropPct}%)`;
    } else if (bp.pattern === 'ramp') {
      const stepsFromTop = totalSets - 1 - idx;
      label = stepsFromTop === 0 ? (isGrounding ? '🔥 Grounding Top Set' : 'Top Set (Peak)') : `Ramp Set ${idx + 1}`;
    }
    // 5. APEX Set Contract
    sets.push({
      label: label,
      targetLoad: (meta && meta.w) ? setLoad : 0,
      targetReps: (meta && meta.r) ? setRepStr : 0,
      targetTime: isPlank ? 60 : 0,
      targetRpe: setRpe,
      actualWeight: (meta && meta.w) ? setLoad : 0,
      actualReps: (meta && meta.r) ? setRepVal : 0,
      actualTime: isPlank ? 60 : 0,
      actualRpe: setRpe,
      done: false,
      lapRunning: false
    });
  }

  return sets;
}
// ==========================================
// SCHEME BLUEPRINT CONTROLLER ACTIONS
// ==========================================
window.appActions = window.appActions || {};

// --- Rep Scheme Builder Actions (Phase Scope & Persistence) ---

// 1. Phase Scope Selector
window.appActions.setBuilderPhaseScope = function(phase) {
  state.builderPhaseScope = phase;
  if (typeof safeRender === 'function') safeRender();
  else if (typeof window.render === 'function') window.render();
};

// 2. Simulation Week Selector
window.appActions.setBuilderSimWeek = function(week) {
  state.builderSimWeek = Number(week) || 1;
  if (typeof safeRender === 'function') safeRender();
  else if (typeof window.render === 'function') window.render();
};

// 3. Dynamic Blueprint Input Updater (Phase-Aware & Two-Way Recipe Sync)
window.appActions.updateSchemeBlueprint = function(schemeName, key, value) {
  if (!state.schemeBlueprints) {
    state.schemeBlueprints = JSON.parse(JSON.stringify(state.schemeRecipes || DEFAULT_SCHEME_BLUEPRINTS));
  }
  if (!state.schemeBlueprints[schemeName]) {
    const fallback = DEFAULT_SCHEME_BLUEPRINTS[schemeName] || DEFAULT_SCHEME_BLUEPRINTS['Straight Sets'];
    state.schemeBlueprints[schemeName] = JSON.parse(JSON.stringify(fallback));
    state.schemeBlueprints[schemeName].name = schemeName;
  }
  if (!state.schemeRecipes) state.schemeRecipes = {};
  if (!state.schemeRecipes[schemeName]) state.schemeRecipes[schemeName] = {};

  const bp = state.schemeBlueprints[schemeName];
  const currentScope = state.builderPhaseScope || 'Global';

  if (key === 'enableRpeProgression' || key === 'backoffStep') {
    value = Boolean(value === true || value === 'true');
  } else if (key === 'reps' && typeof value === 'string' && value.includes(',')) {
    value = value.split(',').map(s => {
      const trimmed = s.trim();
      return isNaN(Number(trimmed)) ? trimmed : Number(trimmed);
    });
  } else if ([
    'baseSets', 'setsCount', 'topSetCount', 'restSeconds', 'intraSetRest', 'intraRestSec',
    'targetRpe', 'topRpe', 'backoffRpe', 'actRpe', 'miniRpe', 'clusterRpe', 'singleRpe', 'benchRpe',
    'fatigueDropPct', 'backoffDropPct', 'dropPct', 'drop1Pct', 'drop2Pct', 'drop3Pct', 'densityDropPct',
    'densityPenalty', 'repGoal', 'rpeStepDelta', 'rampStepPct', 'targetLoadPct', 'loadPct', 'clusterLoadPct',
    'stepLbs', 'deloadPct', 'defaultMinutes', 'miniSets', 'clusters', 'clusterReps', 'backoffSets',
    'densitySets', 'wave1TopRpe', 'wave2TopRpe', 'heavyRpe', 'repRpe', 'fatigueStopRpe', 'stopRpe'
  ].includes(key)) {
    const num = Number(value);
    if (!isNaN(num)) value = num;
  }

  const targetObj = (currentScope === 'Global')
    ? bp
    : ((bp.phaseOverrides = bp.phaseOverrides || {}), (bp.phaseOverrides[currentScope] = bp.phaseOverrides[currentScope] || {}));

  targetObj[key] = value;

  const rec = state.schemeRecipes[schemeName];
  if (currentScope === 'Global') {
    rec[key] = value;
  }
  if (key === 'baseSets') { targetObj.setsCount = value; if (currentScope === 'Global') rec.setsCount = value; }
  if (key === 'setsCount') { targetObj.baseSets = value; if (currentScope === 'Global') rec.baseSets = value; }
  if (key === 'intraSetRest') { targetObj.intraRestSec = value; if (currentScope === 'Global') rec.intraRestSec = value; }
  if (key === 'intraRestSec') { targetObj.intraSetRest = value; if (currentScope === 'Global') rec.intraSetRest = value; }
  if (key === 'fatigueDropPct') {
    const pctNum = value <= 1 ? Math.round(value * 1000) / 10 : value;
    targetObj.backoffDropPct = pctNum;
    targetObj.dropPct = pctNum;
    targetObj.drop1Pct = pctNum;
    if (currentScope === 'Global') { rec.backoffDropPct = pctNum; rec.dropPct = pctNum; rec.drop1Pct = pctNum; }
  }
  if (key === 'targetLoadPct') {
    targetObj.loadPct = value;
    targetObj.clusterLoadPct = value;
    if (currentScope === 'Global') { rec.loadPct = value; rec.clusterLoadPct = value; }
  }
  if (key === 'fatigueStopRpe') {
    targetObj.stopRpe = value;
    if (currentScope === 'Global') rec.stopRpe = value;
  }

  const activeLockMode = targetObj.repLockMode || bp.repLockMode || ((Number(rec.minReps) > 0 && Number(rec.maxReps) > 0) ? 'locked' : 'phase');
  if (key === 'reps' || key === 'repLockMode') {
    const rawR = targetObj.reps !== undefined ? targetObj.reps : bp.reps;
    if (activeLockMode === 'locked') {
      const bounds = normalizeRepBookends(Array.isArray(rawR) ? rawR[0] : rawR, 8, 12);
      targetObj.minReps = bounds.min;
      targetObj.maxReps = bounds.max;
      if (currentScope === 'Global') { rec.minReps = bounds.min; rec.maxReps = bounds.max; }
    } else {
      targetObj.minReps = 0;
      targetObj.maxReps = 0;
      if (currentScope === 'Global') { rec.minReps = 0; rec.maxReps = 0; }
    }
  }

  if (typeof persist === 'function') persist();
  if (typeof safeRender === 'function') safeRender();
  else if (typeof window.render === 'function') window.render();
};

window.appActions.toggleSchemeRepLock = function(schemeName) {
  const pool = state.schemeBlueprints || DEFAULT_SCHEME_BLUEPRINTS;
  const bp = pool[schemeName] || DEFAULT_SCHEME_BLUEPRINTS[schemeName] || {};
  const rec = state.schemeRecipes?.[schemeName] || {};
  const isCurrentlyLocked = bp.repLockMode === 'locked' || (bp.repLockMode !== 'phase' && Number(rec.minReps) > 0 && Number(rec.maxReps) > 0);
  const nextMode = isCurrentlyLocked ? 'phase' : 'locked';
  window.appActions.updateSchemeBlueprint(schemeName, 'repLockMode', nextMode);
  if (typeof showToast === 'function') {
    showToast(nextMode === 'locked' ? `🔒 Locked ${schemeName} reps to Blueprint` : `🔄 ${schemeName} now inherits Phase Matrix reps`);
  }
};

// 4. Clear Overrides for a Specific Phase
window.appActions.clearPhaseOverride = function(schemeName, phase) {
  if (state.schemeBlueprints?.[schemeName]?.phaseOverrides?.[phase]) {
    delete state.schemeBlueprints[schemeName].phaseOverrides[phase];
    if (Object.keys(state.schemeBlueprints[schemeName].phaseOverrides).length === 0) {
      delete state.schemeBlueprints[schemeName].phaseOverrides;
    }
    if (typeof persist === 'function') persist();
    if (typeof showToast === 'function') showToast(`Reverted ${phase} to Global defaults`);
    if (typeof safeRender === 'function') safeRender();
    else if (typeof window.render === 'function') window.render();
  }
};

// 5. Save Blueprint to Persistent Storage & Cloud
window.appActions.saveSchemeBlueprint = function(schemeName) {
  if (typeof persist === 'function') persist();
  if (typeof window.pushToCloud === 'function') window.pushToCloud(false);
  if (typeof showToast === 'function') showToast(`Blueprint Saved: ${schemeName}`);
  if (typeof safeRender === 'function') safeRender();
  else if (typeof window.render === 'function') window.render();
};

// 6. Reset Blueprints to Canonical Factory Defaults
window.appActions.resetSchemeRecipes = function() {
  if (confirm("Reset all 32 scheme blueprints back to factory default parameters?")) {
    state.schemeBlueprints = JSON.parse(JSON.stringify(DEFAULT_SCHEME_BLUEPRINTS));
    state.schemeRecipes = JSON.parse(JSON.stringify(DEFAULT_SCHEME_BLUEPRINTS));
    
    if (typeof persist === 'function') persist();
    if (typeof window.pushToCloud === 'function') window.pushToCloud(false);
    if (typeof showToast === 'function') showToast("Blueprints reset to factory defaults");
    if (typeof safeRender === 'function') safeRender();
    else if (typeof window.render === 'function') window.render();
  }
};

// 7. Create New Custom Blueprint
window.appActions.createCustomBlueprint = function() {
  const newId = 'custom_' + Date.now();
  if (!state.schemeBlueprints) state.schemeBlueprints = {};

  state.schemeBlueprints[newId] = {
    id: newId,
    name: 'New Custom Scheme',
    pattern: 'straight',
    sets: 3,
    targetReps: '10',
    anchorRpe: 8.0,
    restSec: 120,
    loadDropPct: 10,
    loadRampPct: 7.5
  };

  state.activeRecipeScheme = newId;

  if (typeof persist === 'function') persist();
  if (typeof window.pushToCloud === 'function') window.pushToCloud(false);
  if (typeof showToast === 'function') showToast('New Custom Blueprint Created');
  if (typeof safeRender === 'function') safeRender();
  else if (typeof window.render === 'function') window.render();
};
// 8. Duplicate Scheme Blueprint (Forking)
window.appActions.duplicateSchemeBlueprint = function(sourceSchemeName) {
  const srcKey = sourceSchemeName || state.activeRecipeScheme || 'Straight Sets';
  const pool = state.schemeBlueprints || DEFAULT_SCHEME_BLUEPRINTS;
  const sourceBp = pool[srcKey] || DEFAULT_SCHEME_BLUEPRINTS[srcKey] || DEFAULT_SCHEME_BLUEPRINTS['Straight Sets'];
  
  const newId = 'custom_' + Date.now();
  const newName = `${sourceBp.name || srcKey} (Custom)`;
  
  const cloned = JSON.parse(JSON.stringify(sourceBp));
  cloned.id = newId;
  cloned.name = newName;
  
  if (!state.schemeBlueprints) state.schemeBlueprints = JSON.parse(JSON.stringify(DEFAULT_SCHEME_BLUEPRINTS));
  state.schemeBlueprints[newId] = cloned;
  state.activeRecipeScheme = newId;
  state.selectedRecipeScheme = newId;

  if (typeof persist === 'function') persist();
  if (typeof window.pushToCloud === 'function') window.pushToCloud(false);
  if (typeof showToast === 'function') showToast(`Cloned into "${newName}"`);
  if (typeof safeRender === 'function') safeRender();
  else if (typeof window.render === 'function') window.render();
};

// 9. Delete Custom Blueprint
window.appActions.deleteCustomBlueprint = function(schemeKey) {
  const targetId = schemeKey || state.activeRecipeScheme;
  const bpName = state.schemeBlueprints?.[targetId]?.name || targetId;
  
  if (!confirm(`Permanently delete custom scheme "${bpName}"?`)) return;

  if (state.schemeBlueprints && state.schemeBlueprints[targetId]) {
    delete state.schemeBlueprints[targetId];
  }
  if (state.schemeRecipes && state.schemeRecipes[targetId]) {
    delete state.schemeRecipes[targetId];
  }

  state.activeRecipeScheme = 'Straight Sets';
  state.selectedRecipeScheme = 'Straight Sets';

  if (typeof persist === 'function') persist();
  if (typeof window.pushToCloud === 'function') window.pushToCloud(false);
  if (typeof showToast === 'function') showToast("Custom scheme deleted");
  if (typeof safeRender === 'function') safeRender();
  else if (typeof window.render === 'function') window.render();
};

// 10. Update Scheme Instructions
window.appActions.updateSchemeInstructions = function(schemeName, instructionText) {
  if (!state.schemeBlueprints) state.schemeBlueprints = JSON.parse(JSON.stringify(DEFAULT_SCHEME_BLUEPRINTS));
  if (!state.schemeBlueprints[schemeName]) {
    const fallback = DEFAULT_SCHEME_BLUEPRINTS[schemeName] || DEFAULT_SCHEME_BLUEPRINTS['Straight Sets'];
    state.schemeBlueprints[schemeName] = JSON.parse(JSON.stringify(fallback));
  }
  state.schemeBlueprints[schemeName].instructions = instructionText;
  state.schemeBlueprints[schemeName].directive = instructionText;
  if (typeof persist === 'function') persist();
  if (typeof safeRender === 'function') safeRender();
  else if (typeof window.render === 'function') window.render();
};
window.appActions.updateSchemeDirective = window.appActions.updateSchemeInstructions;

// 11. Update Tier-Aware Scaling Parameter
window.appActions.updateTierScalingParam = function(schemeName, tier, field, val) {
  if (!state.schemeBlueprints) state.schemeBlueprints = JSON.parse(JSON.stringify(DEFAULT_SCHEME_BLUEPRINTS));
  if (!state.schemeBlueprints[schemeName]) {
    const fallback = DEFAULT_SCHEME_BLUEPRINTS[schemeName] || DEFAULT_SCHEME_BLUEPRINTS['Straight Sets'];
    state.schemeBlueprints[schemeName] = JSON.parse(JSON.stringify(fallback));
  }
  const bp = state.schemeBlueprints[schemeName];
  if (!bp.tierScaling) bp.tierScaling = { Main: {}, Secondary: {}, Assistance: {} };
  if (!bp.tierScaling[tier]) bp.tierScaling[tier] = {};
  
  bp.tierScaling[tier][field] = Number(val) || val;
  if (typeof persist === 'function') persist();
  if (typeof safeRender === 'function') safeRender();
  else if (typeof window.render === 'function') window.render();
};
// Aliases for legacy button bindings
window.appActions.resetSchemeBlueprints = window.appActions.resetSchemeRecipes;
window.renderCustomRpeTool = renderCustomRpeTool;
function renderCustomRpeTool() {
  // Self-heal: initialize default profile if missing from cache
  if (!state.rpeProfiles || !state.rpeProfiles.high_capacity) {
    state.rpeProfiles = {
      high_capacity: {
        id: 'high_capacity',
        name: 'High Capacity',
        matrix: extendRpeMatrix(DEFAULT_HIGH_CAPACITY_BASE, 50)
      }
    };
    state.activeRpeProfileId = 'high_capacity';
    state.editingRpeProfile = JSON.parse(JSON.stringify(state.rpeProfiles.high_capacity));
  }

  const prof = state.editingRpeProfile || state.rpeProfiles[state.activeRpeProfileId] || Object.values(state.rpeProfiles)[0];
  if (!prof || !prof.matrix) return '<div class="text-slate-500 text-xs font-mono p-4">Initializing RPE Profile...</div>';

  return `
    <div class="space-y-3 bg-card p-4 rounded-2xl border border-sub">
      <div class="flex items-center justify-between gap-2">
        <select onchange="appActions.selectRpeProfile(this.value)" class="bg-input border border-sub rounded-lg px-2.5 py-1.5 text-xs font-mono flex-1 text-slate-200">
          ${Object.values(state.rpeProfiles).map(p => `
            <option value="${p.id}" ${p.id === prof.id ? 'selected' : ''}>${p.name}</option>
          `).join('')}
        </select>
        <button type="button" onclick="appActions.createNewRpeProfile()" class="px-3 py-1.5 bg-input border border-sub rounded-lg text-xs font-mono text-slate-200 whitespace-nowrap hover:border-slate-400">
          + Create New
        </button>
      </div>

      <div>
        <label class="text-[10px] font-mono uppercase tracking-wider text-slate-400">Title</label>
        <input 
          type="text" 
          value="${prof.name || ''}" 
          onchange="appActions.updateRpeProfileName(this.value)" 
          class="w-full bg-input border border-sub rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 mt-1"
        />
      </div>

      <div class="flex items-center gap-2 pt-1">
        <button type="button" onclick="appActions.deleteRpeProfile()" class="px-3 py-1.5 bg-red-950/40 border border-red-800 text-red-300 rounded-lg text-xs font-mono">
          Delete RPE Chart
        </button>
        <button type="button" onclick="appActions.saveCurrentRpeProfile()" class="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold">
          Update Chart
        </button>
        <button type="button" onclick="appActions.saveNewRpeProfile()" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-mono font-bold">
          Save as New
        </button>
      </div>

      ${renderRpeSvgCurve(prof.matrix)}

      <div class="flex items-center justify-between pt-1">
        <span class="text-[10px] font-mono text-slate-400">Interactive Matrix (1-50 Reps)</span>
        <button type="button" onclick="appActions.autoExtendActiveChart()" class="text-[9.5px] font-mono text-accent hover:underline">
          ⚡ Re-extrapolate to 50
        </button>
      </div>

      ${renderRpeMatrixTable(prof)}
    </div>
  `;
}
// Global Single Source of Truth for e1RM
function getE1RM(weight, reps, rpe = 10, exName = '') {
  return getUnifiedE1RM(weight, reps, rpe, exName);
}
window.getE1RM = getE1RM;
// ==========================================
// RPE TOOL SVG & MATRIX RENDERERS
// ==========================================

function renderRpeSvgCurve(matrix) {
  const width = 360;
  const height = 140;
  const pad = { top: 15, bottom: 25, left: 32, right: 15 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const curves = [
    { rpe: 10, stroke: '#a855f7' },
    { rpe: 8,  stroke: '#3b82f6' },
    { rpe: 6,  stroke: '#14b8a6' }
  ];

  const lines = curves.map(c => {
    const points = Object.keys(matrix).map(reps => {
      const repNum = Number(reps);
      const pct = matrix[repNum]?.[c.rpe] || 0;
      const x = pad.left + ((repNum - 1) / 49) * plotW;
      const y = pad.top + ((100 - pct) / 60) * plotH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<polyline points="${points}" fill="none" stroke="${c.stroke}" stroke-width="2.5" stroke-linecap="round"/>`;
  }).join('');

  return `
    <div class="bg-card-sub/60 rounded-xl p-2.5 border border-sub/60 my-3">
      <svg class="w-full h-36" viewBox="0 0 ${width} ${height}">
        <line x1="${pad.left}" y1="${pad.top}" x2="${width - pad.right}" y2="${pad.top}" stroke="#334155" stroke-dasharray="3 3"/>
        <line x1="${pad.left}" y1="${pad.top + plotH/2}" x2="${width - pad.right}" y2="${pad.top + plotH/2}" stroke="#334155" stroke-dasharray="3 3"/>
        <line x1="${pad.left}" y1="${height - pad.bottom}" x2="${width - pad.right}" y2="${height - pad.bottom}" stroke="#334155"/>
        <text x="5" y="${pad.top + 4}" fill="#64748b" font-size="9" font-family="monospace">100%</text>
        <text x="5" y="${pad.top + plotH/2 + 3}" fill="#64748b" font-size="9" font-family="monospace">70%</text>
        <text x="5" y="${height - pad.bottom + 3}" fill="#64748b" font-size="9" font-family="monospace">40%</text>
        ${[1, 10, 20, 30, 40, 50].map(r => `
          <text x="${pad.left + ((r-1)/49)*plotW - 4}" y="${height - 8}" fill="#64748b" font-size="9" font-family="monospace">${r}</text>
        `).join('')}
        ${lines}
      </svg>
      <div class="flex justify-center gap-4 text-[10px] font-mono text-slate-400 mt-1">
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-purple-500"></span> @10</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500"></span> @8</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-teal-500"></span> @6</span>
      </div>
    </div>
  `;
}

function renderRpeMatrixTable(profile) {
  const matrix = profile.matrix;
  const repsList = Object.keys(matrix).map(Number).sort((a,b) => a - b);

  return `
    <div class="overflow-x-auto border border-sub/70 rounded-xl bg-card-sub/40 shadow-inner max-h-[380px] scrollbar-thin">
      <table class="w-full border-collapse font-mono text-[11px] text-center whitespace-nowrap">
        <thead class="sticky top-0 bg-[#121820] z-10 border-b border-sub/80 text-slate-400">
          <tr>
            <th class="p-2 sticky left-0 bg-[#121820] border-r border-sub/60 text-slate-300 font-bold z-20">Reps</th>
            ${RPE_COLS.map(rpe => `<th class="p-2 px-3 font-semibold">${rpe}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-sub/40 text-slate-200">
          ${repsList.map(rep => `
            <tr class="hover:bg-card/40">
              <td class="p-1.5 font-bold sticky left-0 bg-[#151c24] border-r border-sub/60 text-slate-400 z-10">${rep}</td>${RPE_COLS.map(rpe => {
                const val = matrix[rep]?.[rpe] !== undefined ? matrix[rep][rpe].toFixed(1) : '';
                return `
                  <td class="p-1">
                    <input 
                      type="number" 
                      step="0.1" 
                      value="${val}" 
                      onchange="appActions.updateRpeCell(${rep}, ${rpe}, this.value)"
                      class="w-14 bg-input/70 border border-sub/40 rounded px-1 py-0.5 text-center text-[10.5px] font-mono focus:border-accent focus:bg-input focus:outline-none"
                    />
                  </td>
                `;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
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

    function getLiftHistory(exName, withMods, mods, excludeDeload = false) {
      const results = [];
      const cleanMods = sanitizeModifiers(mods || []);
      const targetModKey = cleanMods.slice().sort().join('+');
      const dates = Object.keys(state.dayLogs || {}).sort().reverse();
      dates.forEach(dKey => {
        const dLog = state.dayLogs[dKey];
        if (dLog && dLog.workout && dLog.workout.exercises) {
          const wPhase = dLog.workout.phase || '';
          const isDeloadSession = wPhase === 'Deload' || Boolean(dLog.workout.isDeload);
          const isRecoverySession = Boolean(dLog.workout.isRecovery);
          if (excludeDeload && (isDeloadSession || isRecoverySession)) return;

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
                  phase: wPhase,
                  week: dLog.workout.week || 1,
                  isDeload: isDeloadSession,
                  isRecovery: isRecoverySession,
                  jointDiscomfort: Number(exObj.jointDiscomfort) || 0,
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
      const pos = getMesocyclePosition(targetDateKey || new Date());
      const curPhase = pos.phase;
      const curWeeks = Number(pos.block.weeks) || 3;
      const lifterType = state.profile?.lifterType || 'Natural';
      const thresholds = landmarkThresholds[lifterType] || landmarkThresholds.Natural;

      // 1. Gather DayLogs for the Current Block Window
      const allDates = Object.keys(state.dayLogs || {}).sort();
      const [sY, sM, sD] = (state.mesocycleStartDate || getTodayDateString()).split('-').map(Number);
      const startOfCycle = new Date(sY, sM - 1, sD).getTime();

      let accumWeeks = 0;
      for (let i = 0; i < pos.blockIdx; i++) {
        accumWeeks += Number(state.mesocycle[i].weeks) || 1;
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

      // Track movements with repeated joint discomfort (>= 2) across 2+ sessions in this block
      const jointMap = {};
      blockLogs.forEach(k => {
        const exs = state.dayLogs[k]?.workout?.exercises;
        if (!Array.isArray(exs)) return;
        exs.forEach(exObj => {
          const jd = Number(exObj?.jointDiscomfort) || 0;
          if (jd >= 2 && exObj.exercise) {
            const vKey = getVariantKey(exObj.exercise, exObj.modifiers || []);
            if (!jointMap[vKey]) jointMap[vKey] = { variant: vKey, count: 0, maxScore: 0 };
            jointMap[vKey].count += 1;
            if (jd > jointMap[vKey].maxScore) jointMap[vKey].maxScore = jd;
          }
        });
      });
      const jointSwapCandidates = Object.values(jointMap)
        .filter(item => item.count >= 2)
        .sort((a, b) => b.maxScore - a.maxScore || b.count - a.count);

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
        recommendations,
        jointSwapCandidates
      };
    }

   let sbClient = null;
  let realtimeChannel = null;
  let isPushingToCloud = false;
  let lastPushStartedAt = 0;

  // Shared per-date deep merge so neither Pull nor Push can EVER erase a completed workout
  function mergeDayLogs(localRaw = {}, cloudRaw = {}) {
    const normLocal = {};
    const normCloud = {};
    Object.keys(localRaw || {}).forEach(k => { normLocal[normalizeDateKey(k)] = localRaw[k]; });
    Object.keys(cloudRaw || {}).forEach(k => { normCloud[normalizeDateKey(k)] = cloudRaw[k]; });

    const allDates = new Set([...Object.keys(normCloud), ...Object.keys(normLocal)]);
    const merged = {};

    const getWorkoutScore = (log) => {
      const w = log?.workout;
      if (!w) return -1;
      const exList = Array.isArray(w.exercises) ? w.exercises : (Array.isArray(w.lifts) ? w.lifts : []);
      const doneSets = exList.reduce((acc, ex) => acc + (Array.isArray(ex.sets) ? ex.sets.filter(s => s && s.done).length : 0), 0);
      const totalSets = exList.reduce((acc, ex) => acc + (Array.isArray(ex.sets) ? ex.sets.length : 1), 0);
      return (w.done ? 10000 : 0) + (doneSets * 100) + totalSets;
    };

    allDates.forEach(k => {
      const cLog = normCloud[k];
      const lLog = normLocal[k];
      if (cLog && lLog) {
        const lScore = getWorkoutScore(lLog);
        const cScore = getWorkoutScore(cLog);
        const bestWorkout = (lScore >= cScore)
          ? (lLog.workout || cLog.workout)
          : (cLog.workout || lLog.workout);

        merged[k] = {
          ...cLog,
          ...lLog,
          weight: lLog.weight || cLog.weight,
          recovery: { ...(cLog.recovery || {}), ...(lLog.recovery || {}) },
          ...(bestWorkout ? { workout: bestWorkout } : {})
        };
      } else {
        merged[k] = lLog || cLog;
      }
    });
    return merged;
  }

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
          if (isPushingToCloud || (Date.now() - lastPushStartedAt < 4000)) return;
          if (payload.new && payload.new.updated_at) {
            const cloudTime = new Date(payload.new.updated_at).getTime();
            const localTime = Number(localStorage.getItem('apex_last_sync_timestamp') || 0);
            if (cloudTime > localTime + 3000) {
              window.pullFromCloud(false, true);
            }
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log("Supabase Realtime synchronized");
          }
        });
    } catch (e) {
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

  // Payload Compaction & Deduplication Helpers (Minimizes Supabase Disk IO / TOAST Rewrites)
  let lastPushedPayloadFingerprint = '';

  function compactDiffAgainstDefaults(currentObj, defaultObj) {
    if (!currentObj || typeof currentObj !== 'object') return {};
    const out = {};
    Object.keys(currentObj).forEach(k => {
      const curVal = currentObj[k];
      const defVal = defaultObj ? defaultObj[k] : undefined;
      if (defVal === undefined || JSON.stringify(curVal) !== JSON.stringify(defVal)) {
        out[k] = curVal;
      }
    });
    return out;
  }

  function compactRpeProfilesForCloud(profiles) {
    if (!profiles || typeof profiles !== 'object') return undefined;
    const out = {};
    Object.keys(profiles).forEach(id => {
      const p = profiles[id];
      if (!p || !p.matrix) return;
      // Only sync base rows 1-12; rows 13-50 are deterministically rebuilt by extendRpeMatrix()
      const compactMatrix = {};
      for (let r = 1; r <= 12; r++) {
        if (p.matrix[r]) compactMatrix[r] = p.matrix[r];
      }
      out[id] = { id: p.id || id, name: p.name || id, matrix: compactMatrix };
    });
    return out;
  }

  function expandRpeProfilesFromCloud(profiles) {
    if (!profiles || typeof profiles !== 'object') return profiles;
    const out = {};
    Object.keys(profiles).forEach(id => {
      const p = profiles[id];
      if (!p || !p.matrix) return;
      const rowCount = Object.keys(p.matrix).length;
      out[id] = {
        ...p,
        matrix: rowCount <= 12 ? extendRpeMatrix(p.matrix, 50) : p.matrix
      };
    });
    return out;
  }

  function compactDayLogsForCloud(dayLogsObj) {
    if (!dayLogsObj || typeof dayLogsObj !== 'object') return {};
    const out = {};
    Object.keys(dayLogsObj).forEach(k => {
      const log = dayLogsObj[k];
      if (!log || typeof log !== 'object') return;
      const cleanLog = { ...log };
      if (cleanLog.workout && Array.isArray(cleanLog.workout.exercises)) {
        cleanLog.workout = {
          ...cleanLog.workout,
          exercises: cleanLog.workout.exercises.map(ex => {
            if (!ex || typeof ex !== 'object') return ex;
            const cleanEx = { ...ex };
            delete cleanEx.densityTimerObj;
            delete cleanEx.densityRunning;
            delete cleanEx.densityTargetEnd;
            delete cleanEx.fatigueWarning;
            delete cleanEx.liveAnchorSync;
            if (!cleanEx.notes) delete cleanEx.notes;
            if (!cleanEx.jointDiscomfort) delete cleanEx.jointDiscomfort;
            if (Array.isArray(cleanEx.sets)) {
              cleanEx.sets = cleanEx.sets.map(s => {
                if (!s || typeof s !== 'object') return s;
                const cleanS = { ...s };
                delete cleanS.lapTimerObj;
                delete cleanS.lapRunning;
                delete cleanS.lapStart;
                delete cleanS.lapAccumulated;
                if (!cleanS.targetTime) delete cleanS.targetTime;
                if (!cleanS.actualTime) delete cleanS.actualTime;
                return cleanS;
              });
            }
            return cleanEx;
          })
        };
      }
      out[k] = cleanLog;
    });
    return out;
  }

  function buildCompactCloudPayload() {
    const slimSettings = {
      ...state.settings,
      customSplitBlueprints: state.customSplitBlueprints,
      schemeRecipes: compactDiffAgainstDefaults(state.schemeRecipes, defaultSchemeRecipes),
      anchorE1rms: state.anchorE1rms,
      oneRmFormula: state.settings.oneRmFormula || 'apex',
      rpeProfiles: compactRpeProfilesForCloud(state.rpeProfiles)
    };

    return {
      user_id: state.user.id,
      settings: slimSettings,
      profile: state.profile,
      mesocycle: state.mesocycle,
      weekday_split: state.weekdaySplit,
      exercise_meta: state.exerciseMeta,
      phase_rep_matrix: state.phaseRepMatrix,
      scheme_blueprints: compactDiffAgainstDefaults(state.schemeBlueprints, DEFAULT_SCHEME_BLUEPRINTS),
      exercise_rep_overrides: state.exerciseRepOverrides,
      active_block_idx: state.activeBlockIdx,
      active_week: state.activeWeek,
      exercises: state.exercises,
      modifier_cats: state.modifierCats,
      day_logs: compactDayLogsForCloud(state.dayLogs),
      e1rms: state.e1rms,
      pr_ledger: state.prLedger
    };
  }

  window.pushToCloud = async function(isManual = false) {
    if (!sbClient) window.initSupabase();
    if (!sbClient || !state.user) {
      state.syncStatus = 'offline';
      if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();
      if (isManual) showToast("❌ Please sign in to Supabase first.");
      return;
    }
    if (cloudSyncTimeout) {
      clearTimeout(cloudSyncTimeout);
      cloudSyncTimeout = null;
    }

    // Deduplicate: skip no-op background pushes when nothing has changed since the last push
    const prePayload = buildCompactCloudPayload();
    const preFingerprint = JSON.stringify(prePayload);
    if (!isManual && preFingerprint === lastPushedPayloadFingerprint) {
      localStorage.setItem('apex_has_unsynced_changes', 'false');
      state.syncStatus = 'synced';
      if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();
      return;
    }

    isPushingToCloud = true;
    lastPushStartedAt = Date.now();
    localStorage.setItem('apex_last_sync_timestamp', String(lastPushStartedAt));
    state.syncStatus = 'syncing';
    if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();

    try {
      // Only run pre-flight SELECT if manual or >3 minutes since last sync (reduces read IO while preserving multi-device safety)
      const prevSyncTs = Number(localStorage.getItem('apex_last_sync_timestamp_prev') || 0);
      if (isManual || (Date.now() - prevSyncTs > 180000)) {
        const { data: existingCloud } = await sbClient
          .from('apex_userdata')
          .select('day_logs, e1rms, pr_ledger')
          .eq('user_id', state.user.id)
          .maybeSingle();

        if (existingCloud?.day_logs) {
          state.dayLogs = mergeDayLogs(state.dayLogs, existingCloud.day_logs);
          safeSaveDayLogsLocal(state.dayLogs);
        }
        if (existingCloud?.e1rms) {
          state.e1rms = { ...existingCloud.e1rms, ...state.e1rms };
        }
      }

      const finalBody = buildCompactCloudPayload();
      const finalFingerprint = JSON.stringify(finalBody);
      const payload = {
        ...finalBody,
        updated_at: new Date().toISOString()
      };

      const { error } = await sbClient.from('apex_userdata').upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      const doneTs = Date.now();
      lastPushStartedAt = doneTs;
      lastPushedPayloadFingerprint = finalFingerprint;
      localStorage.setItem('apex_last_sync_timestamp', String(doneTs));
      localStorage.setItem('apex_last_sync_timestamp_prev', String(doneTs));
      localStorage.setItem('apex_has_unsynced_changes', 'false');
      state.syncStatus = 'synced';
      if (isManual) {
        const kb = Math.round(finalFingerprint.length / 1024);
        showToast(`✅ Synced to Supabase (${kb} KB)`);
      }
    } catch (err) {
      console.error("Cloud push error:", err);
      state.syncStatus = 'error';
      if (isManual) showToast(`❌ Push Error: ${err.message || 'Check database permissions'}`);
    } finally {
      isPushingToCloud = false;
      if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();
    }
  };

  window.pullFromCloud = async function(isManual = false, isSilent = false) {
    if (!sbClient) window.initSupabase();
    if (!sbClient || !state.user) {
      state.syncStatus = 'offline';
      if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();
      if (isManual) showToast("❌ Please sign in to Supabase first.");
      return;
    }
    if (!isManual && (isPushingToCloud || (Date.now() - lastPushStartedAt < 3500))) {
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
        const hasUnsyncedLocal = !isManual && localStorage.getItem('apex_has_unsynced_changes') === 'true';

        if (data.settings) {
          state.settings = { ...state.settings, ...data.settings };
          if (data.settings.customSplitBlueprints) state.customSplitBlueprints = data.settings.customSplitBlueprints;
          if (data.settings.schemeRecipes) state.schemeRecipes = { ...defaultSchemeRecipes, ...data.settings.schemeRecipes };
          if (data.settings.anchorE1rms) state.anchorE1rms = { ...state.e1rms, ...data.settings.anchorE1rms };
          if (data.settings.oneRmFormula) state.settings.oneRmFormula = data.settings.oneRmFormula;
          if (data.settings.mesocycleStartDate) state.mesocycleStartDate = data.settings.mesocycleStartDate;
          if (data.settings.rpeProfiles) state.rpeProfiles = expandRpeProfilesFromCloud(data.settings.rpeProfiles);
          if (data.settings.activeRpeProfileId) state.activeRpeProfileId = data.settings.activeRpeProfileId;
        }
        if (data.profile) state.profile = { ...state.profile, ...data.profile };
        if (data.mesocycle) state.mesocycle = data.mesocycle;
        if (data.active_block_idx !== undefined && data.active_block_idx !== null) {
          state.activeBlockIdx = Math.max(0, Number(data.active_block_idx) || 0);
        } else if (data.settings?.activeBlockIdx !== undefined) {
          state.activeBlockIdx = Math.max(0, Number(data.settings.activeBlockIdx) || 0);
        }
        if (data.active_week !== undefined && data.active_week !== null) {
          state.activeWeek = Math.max(1, Number(data.active_week) || 1);
        } else if (data.settings?.activeWeek !== undefined) {
          state.activeWeek = Math.max(1, Number(data.settings.activeWeek) || 1);
        }
        if (data.weekday_split) state.weekdaySplit = data.weekday_split;
        if (data.exercise_meta) state.exerciseMeta = { ...state.exerciseMeta, ...data.exercise_meta };
        if (data.phase_rep_matrix) state.phaseRepMatrix = data.phase_rep_matrix;
        if (data.scheme_blueprints) state.schemeBlueprints = { ...(typeof DEFAULT_SCHEME_BLUEPRINTS !== 'undefined' ? DEFAULT_SCHEME_BLUEPRINTS : {}), ...data.scheme_blueprints };
        if (data.scheme_recipes) state.schemeRecipes = { ...defaultSchemeRecipes, ...data.scheme_recipes };
        if (data.exercise_rep_overrides) state.exerciseRepOverrides = data.exercise_rep_overrides;
        if (data.modifier_cats) state.modifierCats = data.modifier_cats;
        if (data.exercises) state.exercises = Array.isArray(data.exercises) ? data.exercises : { ...state.exercises, ...data.exercises };
        if (data.day_logs) {
          state.dayLogs = mergeDayLogs(state.dayLogs, data.day_logs);
        }
        if (data.e1rms) state.e1rms = { ... data.e1rms, ...state.e1rms };
        if (data.anchor_e1rms) state.anchorE1rms = { ...state.e1rms, ...data.anchor_e1rms };
        else if (!state.anchorE1rms || !Object.keys(state.anchorE1rms).length) state.anchorE1rms = { ...state.e1rms };
        if (Array.isArray(data.pr_ledger)) {
          const combinedLedger = [...(state.prLedger || []), ...data.pr_ledger];
          const seen = new Set();
          state.prLedger = combinedLedger.filter(item => {
            if (!item) return false;
            const sig = `${item.date}_${item.lift}_${item.newVal}`;
            if (seen.has(sig)) return false;
            seen.add(sig);
            return true;
          });
        }
        localStorage.setItem('apex_last_sync_timestamp', String(Date.now()));
        syncMesocycleProgression();
        state.formMetrics.weight = getLatestBodyweight();
        if (typeof window.persist === 'function') window.persist();
        // Prevent window.persist() from falsely marking a cloud pull as an unsynced local edit:
        if (cloudSyncTimeout) {
          clearTimeout(cloudSyncTimeout);
          cloudSyncTimeout = null;
        }
        localStorage.setItem('apex_has_unsynced_changes', 'false');
        localStorage.setItem('apex_last_sync_timestamp_prev', String(Date.now()));
        try { lastPushedPayloadFingerprint = JSON.stringify(buildCompactCloudPayload()); } catch (_) {}
        state.syncStatus = 'synced';
        if (hasUnsyncedLocal) {
          await window.pushToCloud(false);
        }
        if (isManual) showToast("✅ Latest cloud data loaded!");
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

  // Debounced Auto-Sync Engine (Batches rapid taps into a single Postgres write)
  let cloudSyncTimeout = null;
  function queueCloudSync(delayMs = 5000) {
    localStorage.setItem('apex_has_unsynced_changes', 'true');
    localStorage.setItem('apex_last_local_edit', String(Date.now()));
    if (!state.user) return;
    if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
    state.syncStatus = 'syncing';
    if (typeof window.renderSyncIndicator === 'function') window.renderSyncIndicator();

    const effectiveDelay = Math.max(Number(delayMs) || 0, 5000);
    cloudSyncTimeout = setTimeout(() => {
      cloudSyncTimeout = null;
      window.pushToCloud(false);
    }, effectiveDelay);
  }
  window.queueCloudSync = queueCloudSync;

  // Flush any pending cloud sync immediately if the page is refreshed or backgrounded
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && localStorage.getItem('apex_has_unsynced_changes') === 'true' && !isPushingToCloud) {
      window.pushToCloud(false);
    }
  });

  // 60-Second Background Heartbeat: ONLY push if there are actual unsynced local edits
  setInterval(() => {
    if (
      state.user &&
      state.activeWorkout &&
      state.activeWorkout.length &&
      !isPushingToCloud &&
      localStorage.getItem('apex_has_unsynced_changes') === 'true'
    ) {
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
      getMesocyclePosition,
      syncMesocycleProgression,
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
