// ============================================================================
// APEX TRAINING ENGINE - PART 2 OF 4: MATHEMATICAL PERIODIZATION MATRIX
// Production Release v4.6.5-PWA (Neutral Schemes / Multi-Engine / Date-Aware)
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
      getMesocyclePosition, resolveTargetReps, defaultSchemeRecipes,
      normalizeSchemeName
    } = window.apexCore;

    const state = window.state;

    function getActiveBlock(targetDateKey = null) {
      if (typeof getMesocyclePosition === 'function') {
        const pos = getMesocyclePosition(targetDateKey || new Date());
        return pos.block || { phase: pos.phase || 'Hypertrophy', weeks: 3 };
      }
      if (!state.mesocycle || !state.mesocycle.length) return { phase: 'Hypertrophy', weeks: 3 };
      if (state.activeBlockIdx >= state.mesocycle.length) state.activeBlockIdx = 0;
      return state.mesocycle[state.activeBlockIdx];
    }
  // =========================================================================
  // DYNAMIC EQUIPMENT INVENTORY, PLATE SOLVER & SMART HARDWARE CONSTRAINTS
  // =========================================================================
  function getEquipmentConfig() {
    return state.equipment || state.settings?.equipment || {
      dumbbells: { pairedMax: 90, singleHandleMax: 185, singleHandleTare: 5, increment: 5 },
      cable: { ratio: 0.5, carriageWeight: 0, increment: 2.5 },
      bars: { 'Barbell': 45, 'Safety Bar': 65, 'Trap Bar': 55, 'Swiss Bar': 35, 'EZ Bar': 25 },
// Plates removed
    };
  }

  function resolveActiveBar(exName, mods = []) {
    const eq = getEquipmentConfig();
    const bars = eq.bars || { 'Barbell': 45, 'Safety Bar': 65, 'Trap Bar': 55, 'Swiss Bar': 35, 'EZ Bar': 25 };
    const cleanMods = Array.isArray(mods) ? mods : [];

    for (const bName of ['Safety Bar', 'Trap Bar', 'Swiss Bar', 'EZ Bar', 'Barbell']) {
      if (cleanMods.includes(bName)) return { name: bName, weight: Number(bars[bName]) || 45 };
    }
    if (/\b(ssb|safety)\b/i.test(exName)) return { name: 'Safety Bar', weight: Number(bars['Safety Bar']) || 65 };
    if (/\b(trap)\b/i.test(exName)) return { name: 'Trap Bar', weight: Number(bars['Trap Bar']) || 55 };
    if (/\b(swiss)\b/i.test(exName)) return { name: 'Swiss Bar', weight: Number(bars['Swiss Bar']) || 35 };
    if (/\b(ez|curl|skullcrusher|tricep extension)\b/i.test(exName) && !cleanMods.includes('Barbell')) {
      return { name: 'EZ Bar', weight: Number(bars['EZ Bar']) || 25 };
    }
    return { name: 'Barbell', weight: Number(bars['Barbell']) || 45 };
  }
    // Enforces Dynamic Equipment Ceilings, Smart Handle Recommendations & Rep/Tempo Pivots
    function enforceHardwareConstraints(sets, exName, mods = [], effectiveE1rm = 100) {
      if (!Array.isArray(sets) || !sets.length) return sets;
      const eq = getEquipmentConfig();
      const cleanMods = Array.isArray(mods) ? mods : [];
      const isDB = cleanMods.includes('Dumbbell') || /\b(db|dumbbell|hammer curl|incline curl|lateral raise|lu raise)\b/i.test(exName);
      const isCable = cleanMods.includes('Cable') || /\b(cable|pushdown|pull down|face pull|pull through)\b/i.test(exName);

      const pairedMax = Number(eq.dumbbells?.pairedMax) || 90;
      const singleMax = Number(eq.dumbbells?.singleHandleMax) || 185;
      const dbStep = Number(eq.dumbbells?.increment) || 5;

      // Rows, Shrugs, Split Squats, Carries, or anything tagged 'Single Arm' automatically unlock the Heavy Loadable Handle!
      const isHeavyHandleMovement = cleanMods.includes('Single Arm') || cleanMods.includes('Single Leg') || /\b(row|one arm|single arm|suitcase|shrug|split squat|lunge)\b/i.test(exName);
      const activeDbCeiling = isHeavyHandleMovement ? Math.max(pairedMax, singleMax) : pairedMax;

      return sets.map(s => {
        if (!s || !s.targetLoad || s.targetLoad <= 0) return s;

        // 1. Cable Pulley Rounding
        if (isCable && !isDB) {
          const cStep = Number(eq.cable?.increment) || 2.5;
          const cableLoad = Math.round(Number(s.targetLoad) / cStep) * cStep;
          return { ...s, targetLoad: cableLoad, actualWeight: cableLoad };
        }

        // 2. Dumbbell Dynamic Ceiling & Smart Pivot Engine
        if (isDB) {
          const dbStepLoad = Math.round(Number(s.targetLoad) / dbStep) * dbStep;
          if (dbStepLoad <= activeDbCeiling) {
            const cue = (dbStepLoad > pairedMax && isHeavyHandleMovement)
              ? `Using Heavy Loadable Handle (${dbStepLoad} lbs > ${pairedMax}lb paired max)`
              : undefined;
            return {
              ...s,
              loadBasis: 'per_hand',
              targetLoad: dbStepLoad,
              actualWeight: dbStepLoad,
              ...(cue ? { smartHardwareCue: cue } : {})
            };
          }

          // Ceiling Exceeded! Calculate exact equivalent reps at the ceiling load to match target RPE
          const targetRpe = roundRpe(s.targetRpe || 8.0);
          const rir = 10.0 - targetRpe;
          const pctAtCap = Math.min(96, Math.max(45, (activeDbCeiling / Math.max(activeDbCeiling, effectiveE1rm)) * 100));
          const totalEffReps = Math.round(1 + ((100 - pctAtCap) / 2.15));
          const baseMinRep = parseInt(String(s.targetReps).split('-')[0], 10) || 6;
          const pivotedReps = Math.min(25, Math.max(baseMinRep + 2, Math.round(totalEffReps - rir)));

          let smartRec = pivotedReps >= 15 ? '3010 Tempo' : '1ct Stretch Pause';
          if (/\b(bench|incline|press)\b/i.test(exName)) {
            smartRec += ' (or swap to Swiss/BB)';
          }

          const baseLabel = String(s.label || 'Set').replace(/\s*\[.*Cap.*\]/i, '');
          return {
            ...s,
            loadBasis: 'per_hand',
            targetLoad: activeDbCeiling,
            actualWeight: activeDbCeiling,
            targetReps: `${pivotedReps}`,
            actualReps: pivotedReps,
            smartHardwareCue: `Capped at ${activeDbCeiling}lb/hand (Target was ${dbStepLoad}lb). Pivoted to ${pivotedReps}r • ${smartRec}`,
            label: `${baseLabel} [${activeDbCeiling}lb Cap → ${pivotedReps}r]`
          };
        }

        // 3. Barbell / Specialty Bar rounding to standard 5lb increments (plate solvers removed)
        const roundedBarLoad = Math.round(Number(s.targetLoad) / 5) * 5;
        if (roundedBarLoad > 0 && roundedBarLoad !== s.targetLoad) {
          return {
            ...s,
            targetLoad: roundedBarLoad,
            actualWeight: roundedBarLoad
          };
        }

        return s;
      });
    }

    window.apexCore.getEquipmentConfig = getEquipmentConfig;
    
    window.apexCore.enforceHardwareConstraints = enforceHardwareConstraints;
    

    // ========================================================================
    // UNIFIED 31-SCHEME TARGET DERIVATION ENGINE (NEUTRAL NOMENCLATURE)
    // ========================================================================
    function _rawBuildSets(scheme, e1rm, factor = 1.0, tier = 'Main', exName = '', mods = [], opts = {}) {
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

     if (typeof getMesocyclePosition === 'function') {
        const pos = getMesocyclePosition(targetDateKey);
        curBlock = pos.block;
        phase = opts.phase || pos.phase;
        w = opts.week || pos.week;
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
        const history = getLiftHistory(exName, true, mods, true);
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

    // Pull Declarative Recipe from Programming Builder & Blueprints (Unified Model)
    const bpPool = state.schemeBlueprints || (typeof DEFAULT_SCHEME_BLUEPRINTS !== 'undefined' ? DEFAULT_SCHEME_BLUEPRINTS : {});
    const activeRecipes = state.schemeRecipes || defaultSchemeRecipes || {};
    const baseBp = bpPool[cleanScheme] || {};
    const resolvedBp = (typeof resolveBlueprintForPhase === 'function') 
      ? resolveBlueprintForPhase(baseBp, phase) 
      : baseBp;

    const recipe = {
      ...(defaultSchemeRecipes?.[cleanScheme] || {}),
      ...(activeRecipes[cleanScheme] || {}),
      ...resolvedBp
    };

    // Microcycle RPE Progression Toggle: strict 0.5 RPE increments
    const enableRpeProgression = recipe.enableRpeProgression !== undefined ? Boolean(recipe.enableRpeProgression) : true;
    const weekRpeBump = (enableRpeProgression && curBlock?.progressionMode !== 'load') ? Math.max(0, (w - 1) * 0.5) : 0; // Exactly 0.0, 0.5, 1.0...

    // Working Set Volume Sizing Matrix
    let baseWorkingSets = Number(recipe.baseSets || recipe.setsCount) || 3;
    
    // Do not apply live autoregulated set reductions during blueprint previews
    if (!opts.isPreview) {
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
    }

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

    // Dual-Bound Rep Range Derivation: Check Scheme-Level Blueprint / Recipe Lock First
    let minRep = 6;
    let maxRep = 8;
    const isExplicitlyLocked = recipe.repLockMode === 'locked' || (recipe.repLockMode !== 'phase' && Number(recipe.minReps) > 0 && Number(recipe.maxReps) > 0);
    const hasRecipeRepLock = isExplicitlyLocked;

    if (hasRecipeRepLock) {
      if (Number(recipe.minReps) > 0 && Number(recipe.maxReps) > 0) {
        minRep = Number(recipe.minReps);
        maxRep = Number(recipe.maxReps);
      } else {
        const parsedLock = window.apexCore?.normalizeRepBookends
          ? window.apexCore.normalizeRepBookends(Array.isArray(recipe.reps) ? recipe.reps[0] : recipe.reps, 8, 12)
          : { min: 8, max: 12 };
        minRep = parsedLock.min;
        maxRep = parsedLock.max;
      }
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

    // Only adjust reps for DUP if NOT locked by a scheme recipe definition
    if (!hasRecipeRepLock) {
      if (phase === 'DUP' && !hasSpecificOverride && tier !== 'Assistance') {
        if (dow === 1 || dow === 5) { minRep = 3; maxRep = 5; }
        else if (dow === 3) { minRep = 8; maxRep = 12; }
        else { minRep = 5; maxRep = 7; }
      }
    }

    // Dynamic Microcycle Periodization: Linear decay from matrix ceiling to floor
    const totalBlockWeeks = Number(curBlock?.weeks) || 3;
const blockProgMode = curBlock?.progressionMode || (['Accumulation', 'Hypertrophy', 'Deload', 'Resensitization'].includes(phase) ? 'load' : 'intensity');
let periodizedRep = maxRep;

// Only decay reps if the block is set to 'intensity' (wave) mode
if (blockProgMode === 'intensity' && !hasRecipeRepLock && totalBlockWeeks > 1 && maxRep > minRep && tier !== 'Assistance' && phase !== 'Deload') {
      const progressFraction = Math.min(1, Math.max(0, (w - 1) / (totalBlockWeeks - 1)));
      periodizedRep = Math.round(maxRep - (progressFraction * (maxRep - minRep)));
    } else if (phase === 'Deload') {
      periodizedRep = Math.round((minRep + maxRep) / 2);
    }

    const baseReps = periodizedRep;
    const isFixedRep = (minRep === maxRep);
    const rangeStr = isFixedRep ? `${minRep}` : `${minRep}-${maxRep}`;

    // ====================================================
    // SCHEME ROUTING ENGINE: PARAMETRIC VS SPECIALIZED
    // ====================================================
    const SPECIALIZED_SCHEMES = [
      'Double Progression',
      'Myo-reps',
      'Rest-Pause (Dogcrapp)',
      'Density Block',
      'Wave Loading',
      'Double Pyramid',
      'Sawtooth',
      'Primer Single + % Back-offs',
      'Benchmark + Density Back-Off',
      'Submaximal AMRAP Calibration',
      'Dynamic Effort (Speed Waves)',
      'Intra-Set Cluster (4x[2+2+2])',
      'Strength Cluster',
      'e1RM Grounding AMRAP',
      'Drop Set',
      'Force/Metabolic Interleave',
      'Volume Pyramid',
      'Tapered',
      'Top Set + Back-off',
      'Ascending Triplet + Load Drop'
    ];

    const bpCatalog = (typeof DEFAULT_SCHEME_BLUEPRINTS !== 'undefined' ? DEFAULT_SCHEME_BLUEPRINTS : (state.schemeBlueprints || {}));
    const isCustomScheme = !bpCatalog[cleanScheme] || cleanScheme.startsWith('custom_');

    // Only route custom schemes and basic parametric schemes through the generic blueprint generator.
    // Specialized schemes fall through directly to their dedicated mathematical engines below.
    const hasDedicatedPatternEngine = ['double_progression', 'density_block'].includes(recipe.pattern);
    if ((isCustomScheme || !SPECIALIZED_SCHEMES.includes(cleanScheme)) && !hasDedicatedPatternEngine) {
      const blueprintSets = generateSetsFromBlueprint({
        schemeName: cleanScheme,
        meta,
        e1rm: adj,
        baseWorkingSets,
        minRep,
        maxRep,
        rangeStr,
        weekRpeBump,
        isGrounding,
        phase,
        tier // <-- Passes tier to unlock tier-aware scaling (Main/Secondary/Assistance)
      });
      if (blueprintSets && blueprintSets.length > 0) {
        return blueprintSets;
      }
    }
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
        return enforceHardwareConstraints(setArray, exName, mods, adj);
      }

            // -----------------------------------------------------------------
      // DOUBLE PROGRESSION (Full Step-Loading, Rep Carry-Over & Wave Engine)
      // -----------------------------------------------------------------
      if (cleanScheme === 'Double Progression' || recipe.pattern === 'double_progression') {
        const baseRecipeRpe = roundRpe(Number(recipe.targetRpe) || 8.0);
        const targetRpe = isGrounding ? 9.0 : roundRpe(Math.min(baseRecipeRpe + weekRpeBump, rpeCap));
        const fallbackLoad = calcLoad(adj, getPct(maxRep, targetRpe));
        const count = skipBackoffs ? 1 : baseWorkingSets;
        const stepLbs = Number(recipe.stepLbs || bpPool[cleanScheme]?.stepLbs) || 5;
        const dpMode = recipe.dpMode || bpPool[cleanScheme]?.dpMode || 'all';
        const backoffStep = Boolean(recipe.backoffStep || bpPool[cleanScheme]?.backoffStep);
        const deloadPct = Number(recipe.deloadPct || bpPool[cleanScheme]?.deloadPct) || 90;

        let workingLoad = fallbackLoad;
        let lastDoneSets = null;
        let didGraduate = false;

        if (!opts.isPreview && exName) {
          const hist = getLiftHistory(exName, true, mods, true);
          const validSessions = (hist || []).filter(h => Array.isArray(h.sets) && h.sets.some(s => s && s.done && Number(s.actualWeight) > 0));
          if (validSessions.length > 0) {
            const doneSets = validSessions[0].sets.filter(s => s && s.done);
            lastDoneSets = doneSets;
            const prevTopWeight = Math.max(...doneSets.map(s => Number(s.actualWeight) || 0));

            if (dpMode === 'first') {
              didGraduate = (Number(doneSets[0]?.actualReps) || 0) >= maxRep;
            } else {
              didGraduate = doneSets.length > 0 && doneSets.every(s => (Number(s.actualReps) || 0) >= maxRep);
            }

            if (didGraduate) {
              workingLoad = prevTopWeight + stepLbs;
            } else if (deloadPct < 100 && validSessions.length >= 2) {
              const prev2Sets = validSessions[1].sets.filter(s => s && s.done);
              const prev2TopW = Math.max(...prev2Sets.map(s => Number(s.actualWeight) || 0));
              const reps1 = doneSets.reduce((acc, s) => acc + (Number(s.actualReps) || 0), 0);
              const reps2 = prev2Sets.reduce((acc, s) => acc + (Number(s.actualReps) || 0), 0);
              if (prevTopWeight === prev2TopW && reps1 <= reps2) {
                workingLoad = roundLoad(prevTopWeight * (deloadPct / 100));
              } else {
                workingLoad = prevTopWeight;
              }
            } else {
              workingLoad = prevTopWeight;
            }
          }
        }

        return Array.from({ length: count }, (_, idx) => {
          const isTop = (idx === 0 && isGrounding);
          let setLoad = workingLoad;
          let carryRep = minRep;

          if (lastDoneSets && lastDoneSets[idx] && !didGraduate) {
            const prevSetW = Number(lastDoneSets[idx].actualWeight) || workingLoad;
            const prevSetR = Number(lastDoneSets[idx].actualReps) || minRep;
            if (dpMode === 'independent' && prevSetR >= maxRep) {
              setLoad = prevSetW + stepLbs;
              carryRep = minRep;
            } else {
              if (dpMode === 'independent') setLoad = prevSetW;
              carryRep = Math.min(maxRep, Math.max(minRep, prevSetR + 1));
            }
          }

          if (idx > 0 && backoffStep) {
            setLoad = Math.max(0, setLoad - (idx * stepLbs));
          } else if (idx > 0 && isGrounding) {
            setLoad = roundLoad(setLoad * 0.90);
          }

          const cleanLoad = roundLoad(setLoad);
          const rpe = (idx > 0 && isGrounding) ? 8.0 : targetRpe;

          return {
            label: isTop ? '🔥 Grounding Step (@9.0)' : (isGrounding ? `Back-off ${idx} (-10%)` : (opts.isPreview ? `Set ${idx + 1} (+${stepLbs}lb step)` : `Set ${idx + 1}`)),
            targetLoad: meta.w ? cleanLoad : 0,
            targetReps: rangeStr,
            targetTime: 0,
            targetRpe: rpe,
            actualWeight: meta.w ? cleanLoad : 0,
            actualReps: meta.r ? carryRep : 0,
            actualTime: 0,
            actualRpe: rpe,
            done: false,
            lapRunning: false
          };
        });
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
        return enforceHardwareConstraints(setArray, exName, mods, adj);
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
      // 6. DENSITY BLOCK (EDT Clock Target Sets)
      // ----------------------------------------------------------------------
      if (cleanScheme === 'Density Block' || recipe.pattern === 'density_block') {
        const dLoadPct = Number(recipe.targetLoadPct) || 65;
        const penalty = Number(recipe.densityPenalty) || 1.0;
        const dLoad = calcLoad(adj, dLoadPct * penalty);
        const dReps = meta.r ? (isFixedRep ? minRep : (Number(recipe.reps) || (tier === 'Assistance' ? 10 : Math.max(4, baseReps)))) : 0;
        const count = skipBackoffs ? 1 : (Number(recipe.baseSets || recipe.setsCount) || 4);
        const intervalRest = Number(recipe.intraSetRest !== undefined ? recipe.intraSetRest : (recipe.restSeconds || 45));
        const baseRpe = roundRpe(Number(recipe.targetRpe) || 8.0);

        return Array.from({ length: count }, (_, idx) => ({
          label: `Density S${idx + 1}`,
          targetLoad: meta.w ? dLoad : 0,
          targetReps: dReps,
          targetTime: intervalRest,
          targetRpe: roundRpe(Math.min(10.0, baseRpe + (idx * 0.5))),
          actualWeight: meta.w ? dLoad : 0,
          actualReps: dReps,
          actualTime: intervalRest,
          actualRpe: roundRpe(Math.min(10.0, baseRpe + (idx * 0.5))),
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
        return enforceHardwareConstraints(setArray, exName, mods, adj);
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
        const benchReps = isFixedRep ? minRep : baseReps;
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
  const clusterPct = Number(recipe.targetLoadPct !== undefined ? recipe.targetLoadPct : (recipe.loadPct || 75.0));
  const clusterLoad = calcLoad(adj, clusterPct);
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
    function buildSets(scheme, e1rm, factor = 1.0, tier = 'Main', exName = '', mods = [], opts = {}) {
  const rawSets = _rawBuildSets(scheme, e1rm, factor, tier, exName, mods, opts);
  return enforceHardwareConstraints(rawSets, exName, mods, (Number(e1rm) || 135) * (Number(factor) || 1.0));
}

    // =========================================================================
    // PASS 1 ANALYTICS: SFR LEADERBOARD, TIME-TO-PEAK, CALORIE-AWARE VOLUME & GHOST PACER
    // =========================================================================
    function getMovementSorenessDomain(exName = '', category = '') {
      const text = `${exName} ${category}`.toLowerCase();
      if (/(squat|deadlift|rdl|sldl|lunge|leg|calf|glute|hip|knee)/.test(text)) return 'legSoreness';
      if (/(bench|press|dip|push|tricep|fly|delt|raise|chest)/.test(text)) return 'pushSoreness';
      if (/(row|pull|curl|lat|shrug|trap|face pull|chin)/.test(text)) return 'pullSoreness';
      return 'avg';
    }

    function computePersonalSfrLeaderboard(cutoffEpoch = 0) {
      const dates = Object.keys(state.dayLogs || {}).sort();
      const map = {};

      dates.forEach(dKey => {
        const parts = dKey.split('-').map(Number);
        if (parts.length < 3) return;
        const ep = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getTime();
        if (ep < cutoffEpoch) return;

        const dLog = state.dayLogs[dKey];
        const wk = dLog?.workout;
        if (!wk || !wk.done || !Array.isArray(wk.exercises)) return;

        // Look up next calendar day's localized soreness
        const nextDate = new Date(parts[0], parts[1] - 1, parts[2] + 1);
        const nextKey = window.apexCore?.formatIsoDate
          ? window.apexCore.formatIsoDate(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate())
          : '';
        const nextMetrics = state.dayLogs?.[nextKey]?.recovery?.metrics || null;
        const srpe = Number(wk.srpe) || 7.5;

        wk.exercises.forEach(exObj => {
          if (!exObj || !exObj.exercise) return;
          const doneSets = (exObj.sets || []).filter(s => s && s.done && Number(s.actualWeight) > 0 && Number(s.actualReps) > 0);
          if (!doneSets.length) return;

          const cleanMods = window.apexCore?.sanitizeModifiers ? window.apexCore.sanitizeModifiers(exObj.modifiers || []) : (exObj.modifiers || []);
          const vKey = window.apexCore?.getVariantKey ? window.apexCore.getVariantKey(exObj.exercise, cleanMods) : exObj.exercise;

          let topE1 = 0;
          doneSets.forEach(s => {
            const c = Math.round(Number(s.actualWeight) / (getPct(s.actualReps, s.actualRpe || 8.0) / 100));
            if (c > topE1) topE1 = c;
          });
          if (topE1 <= 0) return;

          const domain = getMovementSorenessDomain(exObj.exercise, exObj.category);
          let nextSoreness = 3.8; // neutral default if next-day check-in wasn't logged
          if (nextMetrics) {
            if (domain === 'avg') {
              nextSoreness = ((Number(nextMetrics.pushSoreness) || 4) + (Number(nextMetrics.pullSoreness) || 4) + (Number(nextMetrics.legSoreness) || 4)) / 3;
            } else {
              nextSoreness = Number(nextMetrics[domain]) || 3.8;
            }
          }

          if (!map[vKey]) {
            map[vKey] = {
              variant: vKey,
              sessions: 0,
              startE1: topE1,
              latestE1: topE1,
              peakE1: topE1,
              sorenessSum: 0,
              srpeSum: 0
            };
          }
          const rec = map[vKey];
          rec.sessions += 1;
          rec.latestE1 = topE1;
          if (topE1 > rec.peakE1) rec.peakE1 = topE1;
          rec.sorenessSum += nextSoreness;
          rec.srpeSum += srpe;
        });
      });

      return Object.values(map)
        .filter(r => r.sessions >= 2)
        .map(r => {
          const avgSoreness = Math.round((r.sorenessSum / r.sessions) * 10) / 10;
          const avgSrpe = Math.round((r.srpeSum / r.sessions) * 10) / 10;
          const gainLbs = r.peakE1 - r.startE1;
          const gainPct = r.startE1 > 0 ? (gainLbs / r.startE1) * 100 : 0;
          // Higher soreness rating (5 = zero DOMS) = lower fatigue cost
          const fatigueCost = Math.max(1.5, ((6.0 - avgSoreness) * 1.4) + (avgSrpe * 0.45));
          const rawScore = ((gainPct + 4.0) * (1 + Math.min(r.sessions, 8) * 0.05)) / fatigueCost;
          const sfrScore = Math.max(10, Math.min(99, Math.round(rawScore * 22)));

          let grade = 'B';
          let badge = 'bg-blue-500/20 text-blue-300 border-blue-500/50';
          if (sfrScore >= 80) { grade = 'S'; badge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'; }
          else if (sfrScore >= 65) { grade = 'A'; badge = 'bg-teal-500/20 text-teal-300 border-teal-500/50'; }
          else if (sfrScore < 45) { grade = 'C'; badge = 'bg-rose-500/20 text-rose-300 border-rose-500/50'; }

          return {
            variant: r.variant,
            sessions: r.sessions,
            startE1: r.startE1,
            peakE1: r.peakE1,
            gainLbs,
            avgNextDaySoreness: avgSoreness,
            avgSrpe,
            sfrScore,
            grade,
            badge
          };
        })
        .sort((a, b) => b.sfrScore - a.sfrScore);
    }

    function computeLiftTimeToPeak(exName, mods = []) {
      const hist = getLiftHistory(exName, true, mods, true) || [];
      const valid = hist.filter(h => h && h.topE1 > 0);
      if (valid.length < 3) {
        return {
          peakWeek: null,
          sampleSessions: valid.length,
          weekProfile: [],
          recommendation: `Log at least 3 non-deload sessions of ${exName} to calibrate your personal Time-to-Peak window.`
        };
      }

      const byWeek = {};
      valid.forEach(h => {
        const w = Math.min(6, Math.max(1, Number(h.week) || 1));
        if (!byWeek[w]) byWeek[w] = { week: w, sumE1: 0, maxE1: 0, count: 0 };
        byWeek[w].sumE1 += h.topE1;
        if (h.topE1 > byWeek[w].maxE1) byWeek[w].maxE1 = h.topE1;
        byWeek[w].count += 1;
      });

      const weekProfile = Object.values(byWeek)
        .sort((a, b) => a.week - b.week)
        .map(w => ({
          week: w.week,
          avgE1: Math.round(w.sumE1 / w.count),
          maxE1: w.maxE1,
          count: w.count
        }));

      let best = weekProfile[0];
      weekProfile.forEach(wp => {
        if (wp.avgE1 > best.avgE1) best = wp;
      });

      return {
        peakWeek: best.week,
        sampleSessions: valid.length,
        weekProfile,
        recommendation: `${exName} historically peaks in Week ${best.week} (avg ${best.avgE1} lbs e1RM). Plan your deload or pivot after Week ${best.week}.`
      };
    }

    function getCalorieAwareVolumeMultiplier() {
      const allBwDates = Object.keys(state.dayLogs || {})
        .filter(k => state.dayLogs[k]?.weight && Number(state.dayLogs[k].weight) > 0)
        .sort();

      if (allBwDates.length < 2) {
        return {
          factor: 1.0,
          state: 'Maintenance',
          label: 'Maintenance Baseline',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
          bwVelocity: 0
        };
      }

      // Measure bodyweight velocity across the last 21 days
      const nowMs = Date.now();
      const recent = allBwDates.filter(k => {
        const [y, m, d] = k.split('-').map(Number);
        return (nowMs - new Date(y, m - 1, d).getTime()) <= (21 * 86400000);
      });
      const sample = recent.length >= 2 ? recent : allBwDates.slice(-7);
      const firstKey = sample[0];
      const lastKey = sample[sample.length - 1];
      const [y1, m1, d1] = firstKey.split('-').map(Number);
      const [y2, m2, d2] = lastKey.split('-').map(Number);
      const weeksSpan = Math.max(0.5, (new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / (7 * 86400000));
      const bwDelta = Number(state.dayLogs[lastKey].weight) - Number(state.dayLogs[firstKey].weight);
      const bwVelocity = Math.round((bwDelta / weeksSpan) * 10) / 10;

      if (bwVelocity <= -0.5) {
        return {
          factor: 0.85,
          state: 'Deficit',
          label: `Deficit Adjusted (-15% MRV • ${bwVelocity} lbs/wk)`,
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          bwVelocity
        };
      }
      if (bwVelocity >= 0.4) {
        return {
          factor: 1.08,
          state: 'Surplus',
          label: `Surplus Boost (+8% MRV • +${bwVelocity} lbs/wk)`,
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          bwVelocity
        };
      }
      return {
        factor: 1.0,
        state: 'Maintenance',
        label: `Maintenance Baseline (${bwVelocity >= 0 ? '+' : ''}${bwVelocity} lbs/wk)`,
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
        bwVelocity
      };
    }

    function getGhostPacerForLift(exName, mods = [], nextSetLoad = 0, nextSetRpe = 8.5, livePeakE1 = 0) {
      const hist = getLiftHistory(exName, true, mods, true) || [];
      const cutoff90 = Date.now() - (90 * 86400000);
      const recent90 = hist.filter(h => {
        if (!h || !h.topE1 || h.topE1 <= 0) return false;
        const [y, m, d] = (h.date || '').split('-').map(Number);
        return new Date(y, m - 1, d).getTime() >= cutoff90;
      });

      const avg90E1 = recent90.length
        ? Math.round(recent90.reduce((sum, h) => sum + h.topE1, 0) / recent90.length)
        : 0;
      const cleanMods = window.apexCore?.sanitizeModifiers ? window.apexCore.sanitizeModifiers(mods) : mods;
      const vKey = window.apexCore?.getVariantKey ? window.apexCore.getVariantKey(exName, cleanMods) : exName;
      const prE1 = Number(state.e1rms?.[vKey] || state.e1rms?.[exName] || 0);

      if (avg90E1 <= 0 && prE1 <= 0) return null;

      const targetBenchmark = (livePeakE1 > 0 && livePeakE1 >= avg90E1 && prE1 > livePeakE1) ? prE1 : (avg90E1 || prE1);
      const isChasingPr = (targetBenchmark === prE1 && livePeakE1 >= avg90E1);
      const load = Number(nextSetLoad) || 0;
      const rpe = roundRpe(nextSetRpe || 8.5);

      let repsNeeded = null;
      if (load > 0 && targetBenchmark > 0) {
        for (let r = 1; r <= 20; r++) {
          const est = Math.round(load / (getPct(r, rpe) / 100));
          if (est > targetBenchmark) {
            repsNeeded = r;
            break;
          }
        }
      }

      const deltaVs90 = (livePeakE1 > 0 && avg90E1 > 0) ? (livePeakE1 - avg90E1) : null;
      let cue = '';
      if (deltaVs90 !== null && deltaVs90 > 0) {
        cue = `Ahead of 90D Avg (+${deltaVs90} lbs)` + (repsNeeded && isChasingPr ? ` • PR: ${load}x${repsNeeded}r @${rpe.toFixed(1)}` : '');
      } else if (repsNeeded) {
        cue = `Beat ${isChasingPr ? 'PR' : '90D Avg'} (${targetBenchmark} lbs): ${load}x${repsNeeded}r @${rpe.toFixed(1)}`;
      } else {
        cue = `90D Avg: ${avg90E1 || '—'} lbs • PR: ${prE1 || '—'} lbs`;
      }

      return { avg90E1, prE1, deltaVs90, repsNeeded, cue };
    }

    window.apexCore.computePersonalSfrLeaderboard = computePersonalSfrLeaderboard;
    window.apexCore.computeLiftTimeToPeak = computeLiftTimeToPeak;
    window.apexCore.getCalorieAwareVolumeMultiplier = getCalorieAwareVolumeMultiplier;
    window.apexCore.getGhostPacerForLift = getGhostPacerForLift;

    window.apexCore.buildSets = buildSets;
    window.apexCore.getActiveBlock = getActiveBlock;
    window.buildSets = buildSets;
    window.getActiveBlock = getActiveBlock;
  } catch (err) {
    console.error("APEX Engine Part 2 initialization error:", err);
  }
})();