// ============================================================================
// APEX TRAINING ENGINE - MODULE 5: NUTRITION TRACKER & ADAPTIVE TDEE ENGINE
// Features: Meal-Grouped Diary, Serving Size × Qty Multiplier (Manual, USDA,
//           Saved Meals), Gemini AI Quick-Log, Open Food Facts Barcode Lookup,
//           Goal-Aware Auto-Macro Engine, & 21-Day Adaptive TDEE Calculator
// ============================================================================

(function() {
  const state = window.state || {};
  const core = window.apexCore || {};

  const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  function getTodayKey() {
    if (typeof core.getTodayDateString === 'function') return core.getTodayDateString();
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function getSelectedDateKey() {
    if (state.nutritionDateKey) return state.nutritionDateKey;
    if (typeof core.formatIsoDate === 'function' && state.year && state.selectedDay) {
      return core.formatIsoDate(state.year, state.month, state.selectedDay);
    }
    return getTodayKey();
  }

  function toast(msg) {
    if (typeof core.showToast === 'function') core.showToast(msg);
    else if (typeof window.showToast === 'function') window.showToast(msg);
    else console.log('[APEX Nutrition]:', msg);
  }

  function saveAndSync() {
    if (typeof window.persist === 'function') window.persist();
    if (typeof window.queueCloudSync === 'function') window.queueCloudSync(1500);
    if (typeof window.render === 'function') window.render();
  }

  const NUTRITION_GOALS = {
    cut:      { label: 'Cut',       sub: '-400 kcal (~0.8 lb/wk)', kcalDelta: -400, pPerLb: 1.05, fPerLb: 0.32 },
    recomp:   { label: 'Recomp',    sub: '-150 kcal (Body Recomp)', kcalDelta: -150, pPerLb: 1.00, fPerLb: 0.35 },
    maintain: { label: 'Maintain',  sub: '0 kcal (Maintenance)',    kcalDelta: 0,    pPerLb: 0.95, fPerLb: 0.35 },
    bulk:     { label: 'Lean Bulk', sub: '+250 kcal (~0.5 lb/wk)',  kcalDelta: 250,  pPerLb: 0.90, fPerLb: 0.35 }
  };

  function getLatestBwForNutrition() {
    if (typeof core.getLatestBodyweight === 'function') {
      const bw = Number(core.getLatestBodyweight());
      if (bw > 0) return bw;
    }
    return Number(state.profile?.bodyweight) || 195;
  }

  function calculateAutoMacroTargets(goalMode = null) {
    const mode = goalMode || state.settings?.nutritionGoal?.mode || 'maintain';
    const g = NUTRITION_GOALS[mode] || NUTRITION_GOALS.maintain;
    const bw = getLatestBwForNutrition();
    const tdee = computeAdaptiveTdee(21);

    const baseTdee = tdee.ready ? tdee.estimatedTdee : Math.round(bw * 14.5);
    const sourceLabel = tdee.ready
      ? `Adaptive TDEE (${tdee.estimatedTdee} kcal • ${tdee.confidence})`
      : `Initial Estimate (${bw} lbs × 14.5 = ${baseTdee} kcal)`;

    const kcal = Math.max(1400, Math.round((baseTdee + g.kcalDelta) / 25) * 25);
    const p = Math.round((bw * g.pPerLb) / 5) * 5;
    const f = Math.max(45, Math.round((bw * g.fPerLb) / 5) * 5);
    const remKcal = Math.max(0, kcal - (p * 4) - (f * 9));
    const c = Math.max(50, Math.round((remKcal / 4) / 5) * 5);

    return { kcal, p, c, f, mode, sourceLabel, baseTdee, bw };
  }

  function getNutritionTargets() {
    const goalCfg = state.settings?.nutritionGoal || { mode: 'maintain', autoSync: true };
    if (goalCfg.autoSync !== false) {
      return calculateAutoMacroTargets(goalCfg.mode);
    }
    const t = state.settings?.nutritionTargets || {};
    const autoFb = calculateAutoMacroTargets(goalCfg.mode);
    return {
      kcal: Number(t.kcal) || autoFb.kcal,
      p: Number(t.p) || autoFb.p,
      c: Number(t.c) || autoFb.c,
      f: Number(t.f) || autoFb.f,
      mode: goalCfg.mode || 'maintain',
      sourceLabel: 'Manual Override',
      baseTdee: autoFb.baseTdee,
      bw: autoFb.bw
    };
  }

  function getSavedMeals() {
    if (!state.settings) state.settings = {};
    if (!Array.isArray(state.settings.savedMeals)) {
      state.settings.savedMeals = [];
    }
    return state.settings.savedMeals;
  }

  function normalizeMealSlot(meal) {
    if (!meal) return 'Snacks';
    const m = String(meal).toLowerCase();
    if (m.includes('break')) return 'Breakfast';
    if (m.includes('lunch')) return 'Lunch';
    if (m.includes('din')) return 'Dinner';
    return 'Snacks';
  }

  function getDayNutrition(dateKey) {
    const k = core.normalizeDateKey ? core.normalizeDateKey(dateKey) : dateKey;
    if (!state.dayLogs) state.dayLogs = {};
    if (!state.dayLogs[k]) state.dayLogs[k] = {};
    if (!state.dayLogs[k].nutrition) {
      state.dayLogs[k].nutrition = { entries: [], totals: { kcal: 0, p: 0, c: 0, f: 0 } };
    }
    recalcDayTotals(k);
    return state.dayLogs[k].nutrition;
  }

  function recalcDayTotals(dateKey) {
    const nut = state.dayLogs?.[dateKey]?.nutrition;
    if (!nut) return;
    const entries = Array.isArray(nut.entries) ? nut.entries : [];
    const totals = entries.reduce((acc, item) => {
      acc.kcal += Number(item.kcal) || 0;
      acc.p += Number(item.p) || 0;
      acc.c += Number(item.c) || 0;
      acc.f += Number(item.f) || 0;
      return acc;
    }, { kcal: 0, p: 0, c: 0, f: 0 });
    nut.totals = {
      kcal: Math.round(totals.kcal),
      p: Math.round(totals.p),
      c: Math.round(totals.c),
      f: Math.round(totals.f)
    };
  }

  function formatServingInfo(qty, servingUnit) {
    const cleanQty = Math.round(Math.max(0.05, Number(qty) || 1) * 100) / 100;
    const unit = String(servingUnit || '').trim();
    if (unit) return `${cleanQty} × ${unit}`;
    return cleanQty !== 1 ? `${cleanQty}×` : '';
  }

  function getEntryServingMeta(entry) {
    let qty = Number(entry?.qty);
    let servingUnit = entry?.servingUnit !== undefined ? String(entry.servingUnit).trim() : null;

    if (!(qty > 0)) {
      const rawInfo = String(entry?.servingInfo || '').trim();
      const m = rawInfo.match(/^(\d+(?:\.\d+)?)\s*[×x]\s*(.*)$/i);
      if (m) {
        qty = Math.max(0.05, Number(m[1]) || 1);
        if (servingUnit === null) servingUnit = m[2].trim();
      } else {
        qty = 1;
        if (servingUnit === null) servingUnit = rawInfo;
      }
    } else if (servingUnit === null) {
      const rawInfo = String(entry?.servingInfo || '').trim();
      const m = rawInfo.match(/^\d+(?:\.\d+)?\s*[×x]\s*(.*)$/i);
      servingUnit = m ? m[1].trim() : rawInfo;
    }

    const per = entry?.perServing && typeof entry.perServing === 'object'
      ? {
          kcal: Number(entry.perServing.kcal) || 0,
          p: Number(entry.perServing.p) || 0,
          c: Number(entry.perServing.c) || 0,
          f: Number(entry.perServing.f) || 0
        }
      : {
          kcal: (Number(entry?.kcal) || 0) / qty,
          p: (Number(entry?.p) || 0) / qty,
          c: (Number(entry?.c) || 0) / qty,
          f: (Number(entry?.f) || 0) / qty
        };

    return { qty, servingUnit: servingUnit || '', perServing: per };
  }

  // Adaptive TDEE Engine (MacroFactor-Style with Noise & Minimum-Day Guardrails)
  function computeAdaptiveTdee(windowDays = 21) {
    const nowMs = Date.now();
    const todayKey = getTodayKey();
    const toMs = (k) => {
      const [y, m, d] = k.split('-').map(Number);
      return (y && m && d) ? new Date(y, m - 1, d, 12, 0, 0).getTime() : 0;
    };

    const dates = Object.keys(state.dayLogs || {}).sort().filter(k => {
      const ms = toMs(k);
      return ms > 0 && (nowMs - ms) <= (windowDays * 86400000);
    });

    const bwPts = dates
      .filter(k => Number(state.dayLogs[k]?.weight) > 0)
      .map(k => ({ date: k, ms: toMs(k), w: Number(state.dayLogs[k].weight) }));

    // Exclude today (in-progress) and partial logs (<800 kcal) so half-logged days never tank TDEE
    const kcalPts = dates
      .filter(k => k < todayKey && Number(state.dayLogs[k]?.nutrition?.totals?.kcal) >= 800)
      .map(k => ({ date: k, ms: toMs(k), kcal: Number(state.dayLogs[k].nutrition.totals.kcal) }));

    const minKcalDays = 10;
    const minBwDays = 6;
    const minSpanDays = 14;
    const spanDays = (bwPts.length >= 2)
      ? Math.round((bwPts[bwPts.length - 1].ms - bwPts[0].ms) / 86400000)
      : 0;

    if (bwPts.length < minBwDays || kcalPts.length < minKcalDays || spanDays < minSpanDays) {
      return {
        ready: false,
        bwDays: bwPts.length,
        kcalDays: kcalPts.length,
        spanDays,
        message: `Calibrating: Need ${minKcalDays} completed calorie days (${kcalPts.length}/${minKcalDays}) and ${minBwDays} weigh-ins (${bwPts.length}/${minBwDays}) across ≥${minSpanDays} days (${spanDays}/${minSpanDays}d) to unlock Adaptive TDEE.`
      };
    }

    const avgKcal = Math.round(kcalPts.reduce((s, x) => s + x.kcal, 0) / kcalPts.length);

    // Smooth weight trend by comparing first-half vs. second-half averages (eliminates single-day water spikes)
    const splitIdx = Math.floor(bwPts.length / 2);
    const earlySlice = bwPts.slice(0, splitIdx);
    const lateSlice = bwPts.slice(splitIdx);
    const earlyAvgW = earlySlice.reduce((s, x) => s + x.w, 0) / earlySlice.length;
    const lateAvgW = lateSlice.reduce((s, x) => s + x.w, 0) / lateSlice.length;
    const earlyMidMs = earlySlice.reduce((s, x) => s + x.ms, 0) / earlySlice.length;
    const lateMidMs = lateSlice.reduce((s, x) => s + x.ms, 0) / lateSlice.length;

    const weeksSpan = Math.max(1.0, (lateMidMs - earlyMidMs) / (7 * 86400000));
    const weeklyBwDelta = Math.round(((lateAvgW - earlyAvgW) / weeksSpan) * 100) / 100;

    // Physiological sanity guardrail around current bodyweight (11–19 kcal/lb)
    const refBw = lateAvgW || getLatestBwForNutrition();
    const minSaneTdee = Math.round(refBw * 11);
    const maxSaneTdee = Math.round(refBw * 19);
    const rawTdee = Math.round(avgKcal - (weeklyBwDelta * 500));
    const estimatedTdee = Math.min(maxSaneTdee, Math.max(minSaneTdee, rawTdee));
    const confidence = (kcalPts.length >= 16 && bwPts.length >= 10) ? 'High' : 'Moderate';

    return {
      ready: true,
      estimatedTdee,
      avgKcal,
      weeklyBwDelta,
      bwDays: bwPts.length,
      kcalDays: kcalPts.length,
      confidence
    };
  }

  // Ephemeral UI state for Nutrition screen
  state.nutritionUi = state.nutritionUi || {
    view: 'diary',     // 'diary' | 'add' | 'targets'
    addTab: 'manual',  // 'manual' | 'search' | 'saved'
    aiLoading: false,
    searchLoading: false,
    searchQuery: '',
    searchResults: [],
    barcodeLoading: false,
    scannerActive: false,
    mealSlot: 'Lunch',
    editingId: null,
    recipeBuilderOpen: false,
    recipeLoading: false
  };

  let qrScannerInstance = null;

  function stopBarcodeScanner() {
    if (qrScannerInstance) {
      try {
        qrScannerInstance.stop().then(() => qrScannerInstance.clear()).catch(() => {});
      } catch (e) {}
      qrScannerInstance = null;
    }
    state.nutritionUi.scannerActive = false;
  }

  function readManualForm() {
    const name = document.getElementById('nut-manual-name')?.value?.trim() || '';
    const serving = document.getElementById('nut-manual-serving')?.value?.trim() || '1 serving';
    const qty = Math.max(0.1, Number(document.getElementById('nut-manual-qty')?.value) || 1);
    const rawKcal = Number(document.getElementById('nut-manual-kcal')?.value) || 0;
    const pPer = Math.max(0, Number(document.getElementById('nut-manual-p')?.value) || 0);
    const cPer = Math.max(0, Number(document.getElementById('nut-manual-c')?.value) || 0);
    const fPer = Math.max(0, Number(document.getElementById('nut-manual-f')?.value) || 0);
    const kcalPer = rawKcal > 0 ? rawKcal : Math.round((pPer * 4) + (cPer * 4) + (fPer * 9));

    return {
      name,
      serving,
      qty,
      kcalPer,
      pPer,
      cPer,
      fPer,
      kcalTotal: Math.round(kcalPer * qty),
      pTotal: Math.round(pPer * qty),
      cTotal: Math.round(cPer * qty),
      fTotal: Math.round(fPer * qty)
    };
  }

  // Controller Actions
  window.appActions = window.appActions || {};
  Object.assign(window.appActions, {
    openNutritionForDate(dateKey) {
      state.nutritionDateKey = core.normalizeDateKey ? core.normalizeDateKey(dateKey) : dateKey;
      state.nutritionUi.view = 'diary';
      state.dateActionModal.open = false;
      state.drawerOpen = false;
      state.screen = 'nutrition';
      if (typeof window.render === 'function') window.render();
    },

    setNutritionDate(dateKey) {
      state.nutritionDateKey = core.normalizeDateKey ? core.normalizeDateKey(dateKey) : dateKey;
      if (typeof window.render === 'function') window.render();
    },

    stepNutritionDate(deltaDays) {
      const cur = getSelectedDateKey();
      const [y, m, d] = cur.split('-').map(Number);
      const dt = new Date(y, (m || 1) - 1, (d || 1) + Number(deltaDays));
      const nextKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      state.nutritionDateKey = nextKey;
      if (typeof window.render === 'function') window.render();
    },

    copyYesterdayMeal(slot) {
      const curKey = getSelectedDateKey();
      const [y, m, d] = curKey.split('-').map(Number);
      const prevDt = new Date(y, (m || 1) - 1, (d || 1) - 1);
      const prevKey = `${prevDt.getFullYear()}-${String(prevDt.getMonth() + 1).padStart(2, '0')}-${String(prevDt.getDate()).padStart(2, '0')}`;
      const prevEntries = (state.dayLogs?.[prevKey]?.nutrition?.entries || [])
        .filter(e => normalizeMealSlot(e.meal) === slot);

      if (!prevEntries.length) {
        toast(`No ${slot.toLowerCase()} entries found on ${prevKey}.`);
        return;
      }

      const curNut = getDayNutrition(curKey);
      prevEntries.forEach((e, idx) => {
        curNut.entries.push({
          ...e,
          id: 'copy_' + Date.now() + '_' + idx + '_' + Math.floor(Math.random() * 1000),
          ts: Date.now()
        });
      });
      recalcDayTotals(curKey);
      toast(`Copied ${prevEntries.length} ${slot.toLowerCase()} item(s) from ${prevKey}`);
      saveAndSync();
    },

    setNutritionView(viewName, mealSlot = null) {
      stopBarcodeScanner();
      state.nutritionUi.view = viewName;
      if (mealSlot) state.nutritionUi.mealSlot = mealSlot;
      if (typeof window.render === 'function') window.render();
    },

    setNutritionAddTab(tab) {
      stopBarcodeScanner();
      state.nutritionUi.addTab = tab;
      if (typeof window.render === 'function') window.render();
    },

    setNutritionMealSlot(slot) {
      state.nutritionUi.mealSlot = slot;
      if (typeof window.render === 'function') window.render();
    },

    updateManualMacroPreview() {
      const el = document.getElementById('nut-manual-preview');
      if (!el) return;
      const f = readManualForm();
      el.innerHTML = `<span class="text-slate-400">${f.qty} × ${f.serving} =</span> <b class="text-white">${f.kcalTotal} kcal</b> • <span class="text-blue-300">${f.pTotal}P</span> / <span class="text-emerald-300">${f.cTotal}C</span> / <span class="text-amber-300">${f.fTotal}F</span>`;
    },

    addNutritionEntry(entry, qtyOverride = null) {
      const k = getSelectedDateKey();
      const nut = getDayNutrition(k);
      const qty = Math.max(0.05, Number(qtyOverride !== null ? qtyOverride : (entry.qty || 1)) || 1);
      const servingUnit = String(entry.serving || '').trim();
      const servingText = formatServingInfo(qty, servingUnit);

      const baseKcal = Number(entry.kcal) || 0;
      const baseP = Number(entry.p) || 0;
      const baseC = Number(entry.c) || 0;
      const baseF = Number(entry.f) || 0;

      // If qtyOverride is passed, base values are per-serving; otherwise they are already totals for qty
      const mult = qtyOverride !== null ? qty : 1;
      const perServing = qtyOverride !== null
        ? { kcal: baseKcal, p: baseP, c: baseC, f: baseF }
        : { kcal: baseKcal / qty, p: baseP / qty, c: baseC / qty, f: baseF / qty };

      nut.entries.push({
        id: 'food_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        name: String(entry.name || 'Food Item').trim(),
        qty,
        servingUnit,
        servingInfo: servingText,
        perServing,
        meal: normalizeMealSlot(entry.meal || state.nutritionUi.mealSlot || 'Lunch'),
        kcal: Math.max(0, Math.round(baseKcal * mult)),
        p: Math.max(0, Math.round(baseP * mult)),
        c: Math.max(0, Math.round(baseC * mult)),
        f: Math.max(0, Math.round(baseF * mult)),
        source: entry.source || 'manual',
        ts: Date.now()
      });
      recalcDayTotals(k);
      toast(`Logged ${entry.name} (${Math.round(baseKcal * mult)} kcal)`);
      saveAndSync();
    },

    deleteNutritionEntry(entryId) {
      const k = getSelectedDateKey();
      const nut = getDayNutrition(k);
      const target = (nut.entries || []).find(e => e.id === entryId);
      const doDelete = () => {
        nut.entries = nut.entries.filter(e => e.id !== entryId);
        if (state.nutritionUi.editingId === entryId) state.nutritionUi.editingId = null;
        recalcDayTotals(k);
        saveAndSync();
      };
      if (typeof window.apexConfirm === 'function') {
        window.apexConfirm('Delete Food Entry', `Delete "${target?.name || 'this food entry'}" from ${k}?`, doDelete);
      } else if (confirm(`Delete "${target?.name || 'this food entry'}" from ${k}?`)) {
        doDelete();
      }
    },

    editNutritionEntry(entryId) {
      state.nutritionUi.editingId = (state.nutritionUi.editingId === entryId) ? null : entryId;
      if (typeof window.render === 'function') window.render();
    },

    cancelEditNutritionEntry() {
      state.nutritionUi.editingId = null;
      if (typeof window.render === 'function') window.render();
    },

    scaleEditedNutritionQty(entryId, newQtyVal) {
      const k = getSelectedDateKey();
      const nut = getDayNutrition(k);
      const item = (nut.entries || []).find(e => e.id === entryId);
      if (!item) return;

      const q = Math.max(0.05, Number(newQtyVal) || 0);
      if (!(q > 0)) return;
      const meta = getEntryServingMeta(item);
      const per = meta.perServing;

      const setVal = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.value = Math.max(0, Math.round(v));
      };
      setVal(`nut-edit-kcal-${entryId}`, per.kcal * q);
      setVal(`nut-edit-p-${entryId}`, per.p * q);
      setVal(`nut-edit-c-${entryId}`, per.c * q);
      setVal(`nut-edit-f-${entryId}`, per.f * q);
    },

    stepEditedNutritionQty(entryId, delta) {
      const qtyEl = document.getElementById(`nut-edit-qty-${entryId}`);
      if (!qtyEl) return;
      const cur = Number(qtyEl.value) || 1;
      const next = Math.max(0.25, Math.round((cur + Number(delta)) * 100) / 100);
      qtyEl.value = next;
      window.appActions.scaleEditedNutritionQty(entryId, next);
    },

    saveEditedNutritionEntry(entryId) {
      const k = getSelectedDateKey();
      const nut = getDayNutrition(k);
      const item = (nut.entries || []).find(e => e.id === entryId);
      if (!item) return;

      const meta = getEntryServingMeta(item);
      const name = document.getElementById(`nut-edit-name-${entryId}`)?.value?.trim();
      const meal = document.getElementById(`nut-edit-meal-${entryId}`)?.value || item.meal;
      const qtyInput = Number(document.getElementById(`nut-edit-qty-${entryId}`)?.value);
      const newQty = (qtyInput > 0) ? Math.round(qtyInput * 100) / 100 : meta.qty;
      const kcal = Number(document.getElementById(`nut-edit-kcal-${entryId}`)?.value);
      const p = Number(document.getElementById(`nut-edit-p-${entryId}`)?.value);
      const c = Number(document.getElementById(`nut-edit-c-${entryId}`)?.value);
      const f = Number(document.getElementById(`nut-edit-f-${entryId}`)?.value);

      if (name) item.name = name;
      item.meal = normalizeMealSlot(meal);
      item.p = Math.max(0, Math.round(isNaN(p) ? item.p : p));
      item.c = Math.max(0, Math.round(isNaN(c) ? item.c : c));
      item.f = Math.max(0, Math.round(isNaN(f) ? item.f : f));
      item.kcal = Math.max(0, Math.round(!isNaN(kcal) && kcal > 0 ? kcal : ((item.p * 4) + (item.c * 4) + (item.f * 9))));

      // Preserve exact per-serving baseline if user only scaled qty; recalculate if macros were manually overridden
      const expectedKcal = Math.round(meta.perServing.kcal * newQty);
      const expectedP = Math.round(meta.perServing.p * newQty);
      const expectedC = Math.round(meta.perServing.c * newQty);
      const expectedF = Math.round(meta.perServing.f * newQty);
      const macrosManuallyEdited = (item.kcal !== expectedKcal || item.p !== expectedP || item.c !== expectedC || item.f !== expectedF);

      item.qty = newQty;
      item.servingUnit = meta.servingUnit;
      item.servingInfo = formatServingInfo(newQty, meta.servingUnit);
      item.perServing = macrosManuallyEdited
        ? { kcal: item.kcal / newQty, p: item.p / newQty, c: item.c / newQty, f: item.f / newQty }
        : meta.perServing;

      state.nutritionUi.editingId = null;
      recalcDayTotals(k);
      toast(`Updated ${item.name} (${item.qty}× • ${item.kcal} kcal)`);
      saveAndSync();
    },

    toggleRecipeBuilder() {
      state.nutritionUi.recipeBuilderOpen = !state.nutritionUi.recipeBuilderOpen;
      if (typeof window.render === 'function') window.render();
    },

    async aiParseBatchRecipe() {
      const name = document.getElementById('nut-batch-name')?.value?.trim();
      const servings = Math.max(1, Number(document.getElementById('nut-batch-servings')?.value) || 4);
      const ingText = document.getElementById('nut-batch-ingredients')?.value?.trim();
      if (!ingText || state.nutritionUi.recipeLoading) {
        toast('Paste your batch ingredients first.');
        return;
      }

      const apiKey = localStorage.getItem('apex_gemini_key') || state.profile?.geminiApiKey || '';
      const model = localStorage.getItem('apex_gemini_model') || 'gemini-2.5-flash';
      if (!apiKey) {
        toast('Add your Gemini API Key in Preferences first.');
        return;
      }

      state.nutritionUi.recipeLoading = true;
      if (typeof window.render === 'function') window.render();

      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{
                text: `Calculate the TOTAL combined nutrition macros for this entire batch recipe, then divide by ${servings} servings. Return ONLY valid JSON with no markdown fences in this exact schema: {"name":"string","kcalPerServing":number,"pPerServing":number,"cPerServing":number,"fPerServing":number}.
Recipe Name: ${name || 'Batch Meal'}
Servings: ${servings}
Ingredients:
${ingText}`
              }]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 500 }
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);

        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        const meals = getSavedMeals();
        const finalName = name || parsed.name || 'Batch Recipe';
        const p = Math.max(0, Math.round(Number(parsed.pPerServing) || 0));
        const c = Math.max(0, Math.round(Number(parsed.cPerServing) || 0));
        const f = Math.max(0, Math.round(Number(parsed.fPerServing) || 0));
        const kcal = Math.max(0, Math.round(Number(parsed.kcalPerServing) || ((p * 4) + (c * 4) + (f * 9))));

        meals.unshift({
          id: 'meal_' + Date.now(),
          name: finalName,
          serving: `1/${servings} batch`,
          kcal, p, c, f
        });
        state.nutritionUi.recipeBuilderOpen = false;
        toast(`Saved "${finalName}" (${kcal} kcal • ${p}P/${c}C/${f}F per serving)`);
      } catch (err) {
        toast(`Recipe Parse Error: ${err.message}`);
      } finally {
        state.nutritionUi.recipeLoading = false;
        saveAndSync();
      }
    },

    saveBatchRecipeManual() {
      const name = document.getElementById('nut-batch-name')?.value?.trim();
      const servings = Math.max(1, Number(document.getElementById('nut-batch-servings')?.value) || 4);
      const totKcal = Number(document.getElementById('nut-batch-kcal')?.value) || 0;
      const totP = Number(document.getElementById('nut-batch-p')?.value) || 0;
      const totC = Number(document.getElementById('nut-batch-c')?.value) || 0;
      const totF = Number(document.getElementById('nut-batch-f')?.value) || 0;
      if (!name) { toast('Enter a recipe name.'); return; }

      const p = Math.round(totP / servings);
      const c = Math.round(totC / servings);
      const f = Math.round(totF / servings);
      const kcal = totKcal > 0 ? Math.round(totKcal / servings) : Math.round((p * 4) + (c * 4) + (f * 9));

      const meals = getSavedMeals();
      meals.unshift({ id: 'meal_' + Date.now(), name, serving: `1/${servings} batch`, kcal, p, c, f });
      state.nutritionUi.recipeBuilderOpen = false;
      toast(`Saved "${name}" (${kcal} kcal per serving)`);
      saveAndSync();
    },

    addManualFoodFromForm(saveToLibrary = false) {
      const f = readManualForm();
      if (!f.name) { toast('Enter a food or meal name.'); return; }

      if (saveToLibrary) {
        const meals = getSavedMeals();
        meals.unshift({
          id: 'meal_' + Date.now(),
          name: f.name,
          serving: f.serving,
          kcal: Math.round(f.kcalPer),
          p: Math.round(f.pPer),
          c: Math.round(f.cPer),
          f: Math.round(f.fPer)
        });
      }

      window.appActions.addNutritionEntry({
        name: f.name,
        serving: f.serving,
        qty: f.qty,
        kcal: f.kcalTotal,
        p: f.pTotal,
        c: f.cTotal,
        f: f.fTotal,
        source: 'manual'
      });
      state.nutritionUi.view = 'diary';
      if (typeof window.render === 'function') window.render();
    },

    logUsdaResult(idx) {
      const item = state.nutritionUi.searchResults?.[idx];
      if (!item) return;
      const qty = Math.max(0.1, Number(document.getElementById(`nut-usda-qty-${idx}`)?.value) || 1);
      window.appActions.addNutritionEntry(item, qty);
      state.nutritionUi.view = 'diary';
      if (typeof window.render === 'function') window.render();
    },

    logSavedMeal(idx) {
      const item = getSavedMeals()[idx];
      if (!item) return;
      const qty = Math.max(0.1, Number(document.getElementById(`nut-saved-qty-${idx}`)?.value) || 1);
      window.appActions.addNutritionEntry(item, qty);
      state.nutritionUi.view = 'diary';
      if (typeof window.render === 'function') window.render();
    },

    saveMealToLibraryFromForm() {
      const name = document.getElementById('nut-saved-name')?.value?.trim();
      const serving = document.getElementById('nut-saved-serving')?.value?.trim() || '1 serving';
      const kcal = Number(document.getElementById('nut-saved-kcal')?.value) || 0;
      const p = Number(document.getElementById('nut-saved-p')?.value) || 0;
      const c = Number(document.getElementById('nut-saved-c')?.value) || 0;
      const f = Number(document.getElementById('nut-saved-f')?.value) || 0;
      if (!name) { toast('Enter a meal name to save.'); return; }
      const calcKcal = kcal > 0 ? kcal : Math.round((p * 4) + (c * 4) + (f * 9));
      const meals = getSavedMeals();
      meals.unshift({ id: 'meal_' + Date.now(), name, serving, kcal: calcKcal, p: Math.round(p), c: Math.round(c), f: Math.round(f) });
      toast(`Saved "${name}" to Meal Library`);
      saveAndSync();
    },

    deleteSavedMeal(mealId) {
      const target = getSavedMeals().find(m => m.id === mealId);
      const doDelete = () => {
        state.settings.savedMeals = getSavedMeals().filter(m => m.id !== mealId);
        saveAndSync();
      };
      if (typeof window.apexConfirm === 'function') {
        window.apexConfirm('Delete Saved Meal', `Delete saved meal "${target?.name || 'this meal'}" from your library?`, doDelete);
      } else if (confirm(`Delete saved meal "${target?.name || 'this meal'}"?`)) {
        doDelete();
      }
    },

    setNutritionGoalMode(modeKey) {
      if (!state.settings) state.settings = {};
      if (!state.settings.nutritionGoal) state.settings.nutritionGoal = { mode: 'maintain', autoSync: true };
      state.settings.nutritionGoal.mode = modeKey;
      state.settings.nutritionGoal.autoSync = true;
      const auto = calculateAutoMacroTargets(modeKey);
      state.settings.nutritionTargets = { kcal: auto.kcal, p: auto.p, c: auto.c, f: auto.f };
      toast(`Goal set to ${NUTRITION_GOALS[modeKey]?.label || modeKey}: ${auto.kcal} kcal (${auto.p}P/${auto.c}C/${auto.f}F)`);
      saveAndSync();
    },

    enableAutoMacroTargets() {
      if (!state.settings) state.settings = {};
      const mode = state.settings.nutritionGoal?.mode || 'maintain';
      state.settings.nutritionGoal = { mode, autoSync: true };
      const auto = calculateAutoMacroTargets(mode);
      state.settings.nutritionTargets = { kcal: auto.kcal, p: auto.p, c: auto.c, f: auto.f };
      toast(`Auto-calculated macros: ${auto.kcal} kcal`);
      saveAndSync();
    },

    updateNutritionTarget(field, val) {
      if (!state.settings) state.settings = {};
      const cur = getNutritionTargets();
      state.settings.nutritionGoal = { mode: cur.mode || 'maintain', autoSync: false };
      state.settings.nutritionTargets = { kcal: cur.kcal, p: cur.p, c: cur.c, f: cur.f };
      state.settings.nutritionTargets[field] = Math.max(0, Math.round(Number(val) || 0));
      saveAndSync();
    },

    saveUsdaApiKey(val) {
      localStorage.setItem('apex_usda_key', String(val || '').trim());
      toast('USDA FoodData API Key saved');
    },

    async aiQuickLogFood() {
      const inputEl = document.getElementById('nut-ai-input');
      const text = inputEl?.value?.trim();
      if (!text || state.nutritionUi.aiLoading) return;

      const apiKey = localStorage.getItem('apex_gemini_key') || state.profile?.geminiApiKey || '';
      const model = localStorage.getItem('apex_gemini_model') || 'gemini-2.5-flash';
      if (!apiKey) {
        toast('Add your Gemini API Key in Preferences first.');
        return;
      }

      state.nutritionUi.aiLoading = true;
      if (typeof window.render === 'function') window.render();

      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{
                text: `Parse this meal description into accurate USDA-aligned nutrition macros. Return ONLY valid JSON with no markdown fences in this exact schema: {"items":[{"name":"string","serving":"string","kcal":number,"p":number,"c":number,"f":number}]}.\nMeal: ${text}`
              }]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 800 }
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);

        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        const items = Array.isArray(parsed.items) ? parsed.items : [];
        if (!items.length) throw new Error('No food items parsed.');

        const k = getSelectedDateKey();
        const nut = getDayNutrition(k);
        items.forEach(it => {
          const kcal = Math.max(0, Math.round(Number(it.kcal) || 0));
          const p = Math.max(0, Math.round(Number(it.p) || 0));
          const c = Math.max(0, Math.round(Number(it.c) || 0));
          const f = Math.max(0, Math.round(Number(it.f) || 0));
          const servingUnit = it.serving ? String(it.serving).trim() : '';
          nut.entries.push({
            id: 'ai_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            name: String(it.name || 'Food'),
            qty: 1,
            servingUnit,
            servingInfo: formatServingInfo(1, servingUnit),
            perServing: { kcal, p, c, f },
            meal: normalizeMealSlot(state.nutritionUi.mealSlot || 'Lunch'),
            kcal, p, c, f,
            source: 'ai',
            ts: Date.now()
          });
        });
        recalcDayTotals(k);
        toast(`AI logged ${items.length} item(s) to ${state.nutritionUi.mealSlot}`);
      } catch (err) {
        console.error('AI Quick-Log Error:', err);
        toast(`AI Parse Error: ${err.message}`);
      } finally {
        state.nutritionUi.aiLoading = false;
        saveAndSync();
      }
    },

    async searchUsdaFoods() {
      const q = document.getElementById('nut-usda-query')?.value?.trim();
      if (!q || state.nutritionUi.searchLoading) return;
      state.nutritionUi.searchQuery = q;
      state.nutritionUi.searchLoading = true;
      if (typeof window.render === 'function') window.render();

      const usdaKey = localStorage.getItem('apex_usda_key') || 'DEMO_KEY';
      try {
        const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(usdaKey)}&query=${encodeURIComponent(q)}&pageSize=12`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || `USDA HTTP ${res.status}`);

        state.nutritionUi.searchResults = (data.foods || []).map(food => {
          const getN = (num) => {
            const found = (food.foodNutrients || []).find(n => String(n.nutrientNumber) === String(num));
            return found ? Math.round(Number(found.value) || 0) : 0;
          };
          const kcal = getN('208') || getN('957') || 0;
          const p = getN('203');
          const c = getN('205');
          const f = getN('204');
          const brand = food.brandOwner ? ` (${food.brandOwner})` : '';
          return {
            name: `${food.description}${brand}`.slice(0, 65),
            serving: food.servingSize ? `${food.servingSize} ${food.servingSizeUnit || 'g'}` : '100g',
            kcal: kcal || Math.round((p * 4) + (c * 4) + (f * 9)),
            p, c, f
          };
        });
      } catch (err) {
        toast(`USDA Search Error: ${err.message}`);
        state.nutritionUi.searchResults = [];
      } finally {
        state.nutritionUi.searchLoading = false;
        if (typeof window.render === 'function') window.render();
      }
    },

    async lookupBarcode(upcOverride = null) {
      const upc = (upcOverride || document.getElementById('nut-barcode-input')?.value || '').replace(/\D/g, '');
      if (!upc) { toast('Enter or scan a UPC barcode.'); return; }
      const qty = Math.max(0.1, Number(document.getElementById('nut-barcode-qty')?.value) || 1);
      state.nutritionUi.barcodeLoading = true;
      if (typeof window.render === 'function') window.render();

      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${upc}.json`);
        const data = await res.json();
        if (!res.ok || data.status !== 1 || !data.product) {
          throw new Error('Barcode not found in Open Food Facts.');
        }
        const prod = data.product;
        const n = prod.nutriments || {};
        const name = prod.product_name || `UPC ${upc}`;
        const serving = prod.serving_size || '100g';
        const kcal = Math.round(Number(n['energy-kcal_serving'] || n['energy-kcal_100g'] || 0));
        const p = Math.round(Number(n.proteins_serving || n.proteins_100g || 0));
        const c = Math.round(Number(n.carbohydrates_serving || n.carbohydrates_100g || 0));
        const f = Math.round(Number(n.fat_serving || n.fat_100g || 0));
        window.appActions.addNutritionEntry({
          name,
          serving,
          kcal: kcal || Math.round((p * 4) + (c * 4) + (f * 9)),
          p, c, f,
          source: 'barcode'
        }, qty);
        state.nutritionUi.view = 'diary';
      } catch (err) {
        toast(err.message || 'Barcode lookup failed.');
      } finally {
        state.nutritionUi.barcodeLoading = false;
        if (typeof window.render === 'function') window.render();
      }
    },

    toggleBarcodeScanner() {
      if (state.nutritionUi.scannerActive) {
        stopBarcodeScanner();
        if (typeof window.render === 'function') window.render();
        return;
      }
      if (typeof window.Html5Qrcode === 'undefined') {
        toast('Camera scanner library not loaded — use manual UPC input.');
        return;
      }
      state.nutritionUi.scannerActive = true;
      if (typeof window.render === 'function') window.render();

      setTimeout(() => {
        const el = document.getElementById('apex-barcode-reader');
        if (!el) return;
        qrScannerInstance = new window.Html5Qrcode('apex-barcode-reader');
        qrScannerInstance.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 120 } },
          (decodedText) => {
            stopBarcodeScanner();
            window.appActions.lookupBarcode(decodedText);
          },
          () => {}
        ).catch(err => {
          toast(`Camera error: ${err.message || err}`);
          stopBarcodeScanner();
          if (typeof window.render === 'function') window.render();
        });
      }, 100);
    }
  });

  // Adaptive TDEE Card Renderer (Mounted inside Analytics -> BW & Nutrition -> Targets)
  window.renderAdaptiveTdeeCard = function() {
    const tdee = computeAdaptiveTdee(21);
    if (!tdee.ready) {
      return `
        <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-2 font-mono text-xs shadow-xl">
          <div class="flex justify-between items-center border-b border-sub pb-2">
            <span class="text-[10px] text-accent font-bold uppercase">Adaptive TDEE Engine</span>
            <span class="text-[9px] text-slate-400">Calibrating</span>
          </div>
          <div class="text-[10px] text-slate-400 leading-relaxed">${tdee.message}</div>
        </div>
      `;
    }

    return `
      <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-xl">
        <div class="flex justify-between items-center border-b border-sub pb-2">
          <div>
            <span class="text-[10px] text-accent font-bold uppercase">Adaptive TDEE Engine (21-Day)</span>
            <div class="text-[9px] text-slate-400">Dynamic expenditure from ${tdee.kcalDays} calorie logs & ${tdee.bwDays} weigh-ins</div>
          </div>
          <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[9px] font-bold">${tdee.confidence} Confidence</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-input p-2.5 rounded-2xl border border-sub">
            <div class="text-[8.5px] text-slate-400 uppercase">Est. TDEE</div>
            <div class="text-base font-black text-accent mt-0.5">${tdee.estimatedTdee}</div>
            <div class="text-[8px] text-slate-500">kcal / day</div>
          </div>
          <div class="bg-input p-2.5 rounded-2xl border border-sub">
            <div class="text-[8.5px] text-slate-400 uppercase">Avg Intake</div>
            <div class="text-sm font-bold text-white mt-0.5">${tdee.avgKcal}</div>
            <div class="text-[8px] text-slate-500">kcal / day</div>
          </div>
          <div class="bg-input p-2.5 rounded-2xl border border-sub">
            <div class="text-[8.5px] text-slate-400 uppercase">BW Trend</div>
            <div class="text-sm font-bold ${tdee.weeklyBwDelta <= 0 ? 'text-teal-300' : 'text-amber-300'} mt-0.5">${tdee.weeklyBwDelta > 0 ? '+' : ''}${tdee.weeklyBwDelta}</div>
            <div class="text-[8px] text-slate-500">lbs / week</div>
          </div>
        </div>
      </div>
    `;
  };

  // Full Nutrition Screen Renderer (Meal-Grouped Diary + Add Food Panel + Targets)
  window.renderNutritionScreen = function() {
    const dKey = getSelectedDateKey();
    const nut = getDayNutrition(dKey);
    const targets = getNutritionTargets();
    const ui = state.nutritionUi;
    const savedMeals = getSavedMeals();
    const usdaKey = localStorage.getItem('apex_usda_key') || '';

    const pct = (val, max) => Math.min(100, Math.round(((Number(val) || 0) / Math.max(1, Number(max) || 1)) * 100));
    const remKcal = targets.kcal - nut.totals.kcal;

    // Group entries by Meal Slot
    const mealCardsHtml = MEAL_SLOTS.map(slot => {
      const items = (nut.entries || []).filter(e => normalizeMealSlot(e.meal) === slot);
      const sub = items.reduce((acc, it) => {
        acc.kcal += Number(it.kcal) || 0;
        acc.p += Number(it.p) || 0;
        acc.c += Number(it.c) || 0;
        acc.f += Number(it.f) || 0;
        return acc;
      }, { kcal: 0, p: 0, c: 0, f: 0 });

      return `
        <div class="bg-card-sub p-3.5 rounded-3xl border border-sub space-y-2 font-mono text-xs shadow-md">
          <div class="flex justify-between items-center border-b border-sub/60 pb-2">
            <div>
              <div class="font-bold text-white text-xs">${slot}</div>
              <div class="text-[9px] text-slate-400 mt-0.5">
                <b class="text-accent">${Math.round(sub.kcal)} kcal</b> • <span class="text-blue-300">${Math.round(sub.p)}P</span> / <span class="text-emerald-300">${Math.round(sub.c)}C</span> / <span class="text-amber-300">${Math.round(sub.f)}F</span>
              </div>
            </div>
            <div class="flex items-center space-x-1.5">
              <button type="button" onclick="appActions.copyYesterdayMeal('${slot}')" title="Copy yesterday's ${slot}" class="px-2 py-1 bg-input hover:bg-slate-800 border border-sub text-slate-400 hover:text-white font-bold rounded-xl text-[9.5px] tactile">
                ↺ Prev
              </button>
              <button type="button" onclick="appActions.setNutritionView('add', '${slot}')" class="px-3 py-1 bg-input hover:bg-blue-600 hover:text-white border border-sub text-accent font-bold rounded-xl text-[10px] tactile">
                + Add
              </button>
            </div>
          </div>
          ${items.length ? `
            <div class="space-y-1.5">
              ${items.map(e => {
                if (ui.editingId === e.id) {
                  const sMeta = getEntryServingMeta(e);
                  return `
                    <div class="bg-input p-2.5 rounded-xl border border-accent/60 space-y-2 text-[10.5px]">
                      <div class="grid grid-cols-12 gap-1.5">
                        <input type="text" id="nut-edit-name-${e.id}" value="${String(e.name || '').replace(/"/g, '&quot;')}" class="col-span-8 bg-card-sub border border-sub rounded-lg px-2 py-1 text-white text-[10.5px] font-bold">
                        <select id="nut-edit-meal-${e.id}" class="col-span-4 bg-card-sub border border-sub rounded-lg px-1.5 py-1 text-accent text-[10px] font-bold">
                          ${MEAL_SLOTS.map(m => `<option value="${m}" ${normalizeMealSlot(e.meal) === m ? 'selected' : ''}>${m}</option>`).join('')}
                        </select>
                      </div>
                      <div class="flex items-center justify-between gap-1.5 bg-card-sub/60 p-1.5 rounded-lg border border-sub/70">
                        <div class="text-[9px] text-slate-400 uppercase font-bold truncate pl-0.5">
                          Servings${sMeta.servingUnit ? ` <span class="text-slate-300 normal-case">(${sMeta.servingUnit})</span>` : ''}
                        </div>
                        <div class="flex items-center space-x-1 shrink-0">
                          <button type="button" onclick="appActions.stepEditedNutritionQty('${e.id}', -0.5)" class="px-1.5 py-0.5 bg-card-sub border border-sub rounded text-[9.5px] font-bold text-slate-300 hover:text-white tactile">-0.5</button>
                          <button type="button" onclick="appActions.stepEditedNutritionQty('${e.id}', -0.25)" class="px-1.5 py-0.5 bg-card-sub border border-sub rounded text-[9.5px] font-bold text-slate-300 hover:text-white tactile">-.25</button>
                          <input type="number" id="nut-edit-qty-${e.id}" step="0.25" min="0.05" value="${sMeta.qty}" oninput="appActions.scaleEditedNutritionQty('${e.id}', this.value)" class="w-12 bg-input border border-accent/50 rounded py-0.5 text-center text-accent font-black text-[10.5px]">
                          <button type="button" onclick="appActions.stepEditedNutritionQty('${e.id}', 0.25)" class="px-1.5 py-0.5 bg-card-sub border border-sub rounded text-[9.5px] font-bold text-accent hover:text-white tactile">+.25</button>
                          <button type="button" onclick="appActions.stepEditedNutritionQty('${e.id}', 0.5)" class="px-1.5 py-0.5 bg-card-sub border border-sub rounded text-[9.5px] font-bold text-accent hover:text-white tactile">+0.5</button>
                        </div>
                      </div>
                      <div class="grid grid-cols-4 gap-1.5">
                        <div class="space-y-0.5">
                          <div class="text-[8px] text-slate-400 text-center uppercase">Kcal</div>
                          <input type="number" id="nut-edit-kcal-${e.id}" value="${e.kcal}" placeholder="kcal" class="w-full bg-card-sub border border-sub rounded-lg py-1 text-center text-white text-[10px] font-bold">
                        </div>
                        <div class="space-y-0.5">
                          <div class="text-[8px] text-blue-300 text-center uppercase">P (g)</div>
                          <input type="number" id="nut-edit-p-${e.id}" value="${e.p}" placeholder="P" class="w-full bg-card-sub border border-sub rounded-lg py-1 text-center text-blue-300 text-[10px] font-bold">
                        </div>
                        <div class="space-y-0.5">
                          <div class="text-[8px] text-emerald-300 text-center uppercase">C (g)</div>
                          <input type="number" id="nut-edit-c-${e.id}" value="${e.c}" placeholder="C" class="w-full bg-card-sub border border-sub rounded-lg py-1 text-center text-emerald-300 text-[10px] font-bold">
                        </div>
                        <div class="space-y-0.5">
                          <div class="text-[8px] text-amber-300 text-center uppercase">F (g)</div>
                          <input type="number" id="nut-edit-f-${e.id}" value="${e.f}" placeholder="F" class="w-full bg-card-sub border border-sub rounded-lg py-1 text-center text-amber-300 text-[10px] font-bold">
                        </div>
                      </div>
                      <div class="flex justify-end space-x-1.5">
                        <button type="button" onclick="appActions.cancelEditNutritionEntry()" class="px-2.5 py-1 bg-card-sub border border-sub rounded-lg text-[9.5px] text-slate-300">Cancel</button>
                        <button type="button" onclick="appActions.saveEditedNutritionEntry('${e.id}')" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-[9.5px] text-white font-bold">Save</button>
                      </div>
                    </div>
                  `;
                }
                return `
                  <div class="bg-input p-2.5 rounded-xl border border-sub flex justify-between items-center text-[10.5px]">
                    <div class="min-w-0 pr-2">
                      <div class="font-bold text-white truncate">${e.name}</div>
                      <div class="text-[9px] text-slate-400 mt-0.5">
                        ${e.servingInfo ? `<span class="text-slate-300">${e.servingInfo}</span> • ` : ''}<span class="text-blue-300">${e.p}P</span> / <span class="text-emerald-300">${e.c}C</span> / <span class="text-amber-300">${e.f}F</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-1.5 shrink-0">
                      <span class="font-black text-accent">${e.kcal}</span>
                      <button type="button" onclick="appActions.editNutritionEntry('${e.id}')" title="Edit entry" class="text-slate-400 hover:text-white p-1 inline-flex items-center justify-center">${window.apexIcon ? window.apexIcon('edit','w-3 h-3') : 'Edit'}</button>
                      <button type="button" onclick="appActions.deleteNutritionEntry('${e.id}')" title="Delete entry" class="text-slate-500 hover:text-rose-400 px-1 font-bold">✕</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `<div class="text-[9.5px] text-slate-500 py-1 px-1">Nothing logged for ${slot.toLowerCase()} yet.</div>`}
        </div>
      `;
    }).join('');

    return `
      <main class="flex-1 min-h-0 overflow-y-auto space-y-3.5 w-full pr-0.5" onclick="appActions.closeCardMenu()">
        <!-- Header Bar -->
        <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono w-full">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
            <span>Nutrition</span>
          </span>
          <div class="flex items-center space-x-1.5">
            <div class="flex items-center space-x-1">
              <button type="button" onclick="appActions.stepNutritionDate(-1)" class="w-6 h-6 bg-input border border-sub rounded-lg text-slate-300 hover:text-white flex items-center justify-center text-xs tactile">&lsaquo;</button>
              <input type="date" value="${dKey}" onchange="appActions.setNutritionDate(this.value)" class="bg-input border border-sub rounded-xl px-2 py-1 text-[10px] text-white font-mono">
              <button type="button" onclick="appActions.stepNutritionDate(1)" class="w-6 h-6 bg-input border border-sub rounded-lg text-slate-300 hover:text-white flex items-center justify-center text-xs tactile">&rsaquo;</button>
            </div>
            <button type="button" onclick="appActions.setNutritionView('${ui.view === 'targets' ? 'diary' : 'targets'}')" class="px-2.5 py-1 rounded-xl border text-[10px] font-bold tactile ${ui.view === 'targets' ? 'bg-accent text-black border-accent' : 'bg-input border-sub text-slate-200 hover:border-accent'}">
              ${ui.view === 'targets' ? '← Diary' : 'Targets'}
            </button>
          </div>
        </div>

        <!-- Compact Daily Macro Summary Card with SVG Progress Ring -->
        ${(() => {
          const kcalPct = pct(nut.totals.kcal, targets.kcal);
          const ringR = 36;
          const ringC = Math.round(2 * Math.PI * ringR * 10) / 10;
          const ringOff = Math.round(ringC * (1 - (kcalPct / 100)) * 10) / 10;
          const ringStroke = remKcal < 0 ? '#f43f5e' : 'var(--accent-primary, #38bdf8)';
          return `
            <div class="bg-card-sub p-3.5 rounded-3xl border border-sub font-mono text-xs shadow-xl">
              <div class="flex items-center gap-3.5">
                <!-- SVG Calorie Ring -->
                <div class="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg class="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r="${ringR}" fill="none" stroke="rgba(148,163,184,0.18)" stroke-width="7" />
                    <circle cx="44" cy="44" r="${ringR}" fill="none" stroke="${ringStroke}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${ringC}" stroke-dashoffset="${ringOff}" />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
                    <span class="text-sm font-black ${remKcal >= 0 ? 'text-white' : 'text-rose-400'}">${Math.abs(remKcal)}</span>
                    <span class="text-[8px] uppercase text-slate-400 font-bold">${remKcal >= 0 ? 'kcal left' : 'over'}</span>
                  </div>
                </div>

                <!-- Right Side: Totals + P/C/F Bars -->
                <div class="flex-1 min-w-0 space-y-2">
                  <div class="flex justify-between items-baseline">
                    <span class="text-[9px] text-slate-400 uppercase font-bold">${NUTRITION_GOALS[targets.mode]?.label || 'Maintain'}</span>
                    <span class="text-[11px] font-bold text-white">${nut.totals.kcal} <span class="text-slate-400 font-normal">/ ${targets.kcal}</span></span>
                  </div>
                  <div class="space-y-1.5">
                    <div class="space-y-0.5">
                      <div class="flex justify-between text-[9px]"><span class="text-blue-300 font-bold">Protein</span><span class="text-slate-200">${nut.totals.p} / ${targets.p}g</span></div>
                      <div class="w-full h-1.5 bg-input rounded-full overflow-hidden"><div class="h-full bg-blue-500 rounded-full" style="width: ${pct(nut.totals.p, targets.p)}%"></div></div>
                    </div>
                    <div class="space-y-0.5">
                      <div class="flex justify-between text-[9px]"><span class="text-emerald-300 font-bold">Carbs</span><span class="text-slate-200">${nut.totals.c} / ${targets.c}g</span></div>
                      <div class="w-full h-1.5 bg-input rounded-full overflow-hidden"><div class="h-full bg-emerald-500 rounded-full" style="width: ${pct(nut.totals.c, targets.c)}%"></div></div>
                    </div>
                    <div class="space-y-0.5">
                      <div class="flex justify-between text-[9px]"><span class="text-amber-300 font-bold">Fat</span><span class="text-slate-200">${nut.totals.f} / ${targets.f}g</span></div>
                      <div class="w-full h-1.5 bg-input rounded-full overflow-hidden"><div class="h-full bg-amber-500 rounded-full" style="width: ${pct(nut.totals.f, targets.f)}%"></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        })()}

        ${ui.view === 'diary' ? `
          <!-- Single-Line AI Quick-Log Bar -->
          <div class="bg-card-sub p-3 rounded-3xl border border-sub space-y-2 font-mono text-xs shadow-md">
            <div class="flex justify-between items-center">
              <span class="text-[9.5px] text-accent font-bold uppercase">✦ AI Quick-Log</span>
              <select onchange="appActions.setNutritionMealSlot(this.value)" class="bg-input border border-sub rounded-lg px-2 py-0.5 text-[10px] text-white font-bold">
                ${MEAL_SLOTS.map(m => `<option value="${m}" ${ui.mealSlot === m ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
            </div>
            <div class="flex gap-2">
              <input type="text" id="nut-ai-input" placeholder="e.g. 8 oz 93/7 ground turkey, 1 cup rice, 1 tbsp oil" class="flex-1 bg-input border border-sub rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-accent" onkeydown="if(event.key==='Enter') appActions.aiQuickLogFood()">
              <button type="button" onclick="appActions.aiQuickLogFood()" ${ui.aiLoading ? 'disabled' : ''} class="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tactile shrink-0">
                ${ui.aiLoading ? '...' : 'Log'}
              </button>
            </div>
          </div>

          <!-- Meal-Grouped Diary Cards -->
          <div class="space-y-2.5">${mealCardsHtml}</div>
        ` : ''}

        ${ui.view === 'add' ? `
          <!-- Add Food Panel Header -->
          <div class="flex justify-between items-center bg-card-sub px-3.5 py-2.5 rounded-2xl border border-sub font-mono text-xs">
            <div class="flex items-center space-x-2">
              <span class="text-[10px] text-slate-400 uppercase font-bold">Adding to:</span>
              <select onchange="appActions.setNutritionMealSlot(this.value)" class="bg-input border border-sub rounded-xl px-2.5 py-1 text-accent font-bold text-xs">
                ${MEAL_SLOTS.map(m => `<option value="${m}" ${ui.mealSlot === m ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
            </div>
            <button type="button" onclick="appActions.setNutritionView('diary')" class="text-[10.5px] text-slate-300 hover:text-white font-bold underline">
              ← Back to Diary
            </button>
          </div>

          <!-- 3-Tab Add Food Switcher -->
          <div class="grid grid-cols-3 gap-1 p-1 bg-input rounded-2xl border border-sub font-mono text-[10.5px]">
            <button type="button" onclick="appActions.setNutritionAddTab('manual')" class="py-1.5 rounded-xl font-bold transition ${ui.addTab === 'manual' ? 'bg-accent text-black shadow' : 'text-slate-400'}">Manual</button>
            <button type="button" onclick="appActions.setNutritionAddTab('search')" class="py-1.5 rounded-xl font-bold transition ${ui.addTab === 'search' ? 'bg-accent text-black shadow' : 'text-slate-400'}">USDA / UPC</button>
            <button type="button" onclick="appActions.setNutritionAddTab('saved')" class="py-1.5 rounded-xl font-bold transition ${ui.addTab === 'saved' ? 'bg-accent text-black shadow' : 'text-slate-400'}">Saved Meals</button>
          </div>

          ${ui.addTab === 'manual' ? `
            <!-- Manual Entry with Serving Size × Qty Multiplier -->
            <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-md">
              <span class="text-[10px] text-accent font-bold uppercase">Label Entry (Per Serving × Quantity)</span>
              <div class="grid grid-cols-12 gap-2">
                <div class="col-span-12 space-y-1">
                  <label class="text-[8.5px] text-slate-400 uppercase font-bold">Food / Meal Name</label>
                  <input type="text" id="nut-manual-name" placeholder="e.g. 93/7 Ground Turkey" oninput="appActions.updateManualMacroPreview()" class="w-full bg-input border border-sub rounded-xl px-3 py-2 text-white text-xs">
                </div>
                <div class="col-span-8 space-y-1">
                  <label class="text-[8.5px] text-slate-400 uppercase font-bold">Serving Size</label>
                  <input type="text" id="nut-manual-serving" placeholder="e.g. 4 oz, 1 scoop, 1 cup" value="1 serving" oninput="appActions.updateManualMacroPreview()" class="w-full bg-input border border-sub rounded-xl px-3 py-1.5 text-white text-xs">
                </div>
                <div class="col-span-4 space-y-1">
                  <label class="text-[8.5px] text-accent uppercase font-bold">Servings (Qty)</label>
                  <input type="number" id="nut-manual-qty" step="0.25" min="0.25" value="1" oninput="appActions.updateManualMacroPreview()" class="w-full bg-input border border-sub rounded-xl px-2 py-1.5 text-center text-accent font-bold text-xs">
                </div>
              </div>

              <div class="grid grid-cols-4 gap-1.5 pt-1">
                <div class="space-y-1">
                  <label class="text-[8.5px] text-slate-400 uppercase font-bold block text-center">Kcal / Srv</label>
                  <input type="number" id="nut-manual-kcal" placeholder="auto" oninput="appActions.updateManualMacroPreview()" class="w-full bg-input border border-sub rounded-xl py-1.5 text-center text-white text-xs">
                </div>
                <div class="space-y-1">
                  <label class="text-[8.5px] text-blue-300 uppercase font-bold block text-center">P (g) / Srv</label>
                  <input type="number" id="nut-manual-p" placeholder="0" oninput="appActions.updateManualMacroPreview()" class="w-full bg-input border border-sub rounded-xl py-1.5 text-center text-blue-300 text-xs">
                </div>
                <div class="space-y-1">
                  <label class="text-[8.5px] text-emerald-300 uppercase font-bold block text-center">C (g) / Srv</label>
                  <input type="number" id="nut-manual-c" placeholder="0" oninput="appActions.updateManualMacroPreview()" class="w-full bg-input border border-sub rounded-xl py-1.5 text-center text-emerald-300 text-xs">
                </div>
                <div class="space-y-1">
                  <label class="text-[8.5px] text-amber-300 uppercase font-bold block text-center">F (g) / Srv</label>
                  <input type="number" id="nut-manual-f" placeholder="0" oninput="appActions.updateManualMacroPreview()" class="w-full bg-input border border-sub rounded-xl py-1.5 text-center text-amber-300 text-xs">
                </div>
              </div>

              <div id="nut-manual-preview" class="p-2.5 bg-input/80 rounded-xl border border-sub/70 text-center text-[10.5px]">
                <span class="text-slate-400">1 × 1 serving =</span> <b class="text-white">0 kcal</b> • <span class="text-blue-300">0P</span> / <span class="text-emerald-300">0C</span> / <span class="text-amber-300">0F</span>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <button type="button" onclick="appActions.addManualFoodFromForm(false)" class="py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tactile shadow">+ Log to ${ui.mealSlot}</button>
                <button type="button" onclick="appActions.addManualFoodFromForm(true)" class="py-2.5 bg-input hover:bg-slate-800 border border-sub text-emerald-300 font-bold rounded-xl text-xs tactile"><span class="inline-flex items-center justify-center gap-1">${window.apexIcon ? window.apexIcon('star','w-3.5 h-3.5') : ''}<span>Save & Log</span></span></button>
              </div>
            </div>
          ` : ''}

          ${ui.addTab === 'search' ? `
            <!-- Barcode / UPC Lookup -->
            <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-md">
              <div class="flex justify-between items-center">
                <span class="text-[10px] text-accent font-bold uppercase">Barcode Lookup (Open Food Facts)</span>
                <button type="button" onclick="appActions.toggleBarcodeScanner()" class="px-2.5 py-1 bg-input border border-sub rounded-xl text-[10px] text-white font-bold tactile">
                  ${ui.scannerActive ? '✕ Close Camera' : `<span class="inline-flex items-center gap-1">${window.apexIcon ? window.apexIcon('camera','w-3.5 h-3.5') : ''}<span>Scan</span></span>`}
                </button>
              </div>
              ${ui.scannerActive ? `<div id="apex-barcode-reader" class="w-full rounded-2xl overflow-hidden border border-sub"></div>` : ''}
              <div class="flex gap-1.5">
                <input type="text" id="nut-barcode-input" inputmode="numeric" placeholder="UPC barcode..." class="flex-1 bg-input border border-sub rounded-xl px-3 py-2 text-white text-xs" onkeydown="if(event.key==='Enter') appActions.lookupBarcode()">
                <input type="number" id="nut-barcode-qty" step="0.25" min="0.25" value="1" title="Servings" class="w-14 bg-input border border-sub rounded-xl px-1.5 py-2 text-center text-accent font-bold text-xs">
                <button type="button" onclick="appActions.lookupBarcode()" ${ui.barcodeLoading ? 'disabled' : ''} class="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs tactile">
                  ${ui.barcodeLoading ? '...' : 'Log'}
                </button>
              </div>
            </div>

            <!-- USDA FoodData Central Search -->
            <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-md">
              <span class="text-[10px] text-accent font-bold uppercase">USDA FoodData Central (400,000+ Foods)</span>
              <div class="flex gap-2">
                <input type="text" id="nut-usda-query" value="${ui.searchQuery || ''}" placeholder="Search whole foods or US brands..." class="flex-1 bg-input border border-sub rounded-xl px-3 py-2 text-white text-xs" onkeydown="if(event.key==='Enter') appActions.searchUsdaFoods()">
                <button type="button" onclick="appActions.searchUsdaFoods()" ${ui.searchLoading ? 'disabled' : ''} class="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tactile">
                  ${ui.searchLoading ? '...' : 'Search'}
                </button>
              </div>
              <div class="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                ${(ui.searchResults || []).map((r, idx) => `
                  <div class="bg-input p-2.5 rounded-xl border border-sub flex justify-between items-center gap-2 text-[10px]">
                    <div class="min-w-0 flex-1">
                      <div class="font-bold text-white truncate">${r.name}</div>
                      <div class="text-[9px] text-slate-400">${r.serving} • ${r.kcal} kcal • ${r.p}P / ${r.c}C / ${r.f}F</div>
                    </div>
                    <div class="flex items-center space-x-1 shrink-0">
                      <input type="number" id="nut-usda-qty-${idx}" step="0.25" min="0.25" value="1" class="w-12 bg-card-sub border border-sub rounded-lg py-1 text-center text-accent font-bold text-[10px]">
                      <button type="button" onclick="appActions.logUsdaResult(${idx})" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] tactile">+ Log</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${ui.addTab === 'saved' ? `
            <!-- Saved Meals & Batch-Cook Library -->
            <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-md">
              <div class="flex justify-between items-center">
                <span class="text-[10px] text-accent font-bold uppercase">Saved Meals & Batch-Cook Portions</span>
                <button type="button" onclick="appActions.toggleRecipeBuilder()" class="px-2.5 py-1 bg-input hover:bg-slate-800 border border-sub rounded-xl text-[9.5px] text-accent font-bold tactile">
                  ${ui.recipeBuilderOpen ? '✕ Close Builder' : '+ Batch Recipe'}
                </button>
              </div>

              ${ui.recipeBuilderOpen ? `
                <div class="p-3 bg-input/90 rounded-2xl border border-accent/40 space-y-2.5">
                  <div class="text-[9.5px] text-white font-bold uppercase">Multi-Serving Batch-Cook Recipe Builder</div>
                  <div class="grid grid-cols-12 gap-1.5">
                    <input type="text" id="nut-batch-name" placeholder="Recipe name (e.g. Turkey Taco Base)" class="col-span-8 bg-card-sub border border-sub rounded-xl px-2.5 py-1.5 text-white text-xs">
                    <input type="number" id="nut-batch-servings" min="1" step="1" value="6" title="Total Batch Servings" placeholder="Srv" class="col-span-4 bg-card-sub border border-sub rounded-xl px-2 py-1.5 text-center text-accent font-bold text-xs">
                  </div>
                  <textarea id="nut-batch-ingredients" rows="3" placeholder="Paste full batch ingredients for AI auto-split (e.g. 2 lbs 93/7 ground turkey, 2 cups dry rice, 2 tbsp olive oil)..." class="w-full bg-card-sub border border-sub rounded-xl p-2 text-white text-[11px] focus:outline-none focus:border-accent"></textarea>
                  <button type="button" onclick="appActions.aiParseBatchRecipe()" ${ui.recipeLoading ? 'disabled' : ''} class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tactile">
                    ${ui.recipeLoading ? 'Calculating per-serving macros...' : '✦ AI Split & Save Per-Serving'}
                  </button>
                  <div class="text-[8.5px] text-slate-400 text-center uppercase">— OR Enter Whole-Batch Totals Manually —</div>
                  <div class="grid grid-cols-4 gap-1.5">
                    <input type="number" id="nut-batch-kcal" placeholder="Tot kcal" class="bg-card-sub border border-sub rounded-lg py-1 text-center text-white text-[10px]">
                    <input type="number" id="nut-batch-p" placeholder="Tot P" class="bg-card-sub border border-sub rounded-lg py-1 text-center text-blue-300 text-[10px]">
                    <input type="number" id="nut-batch-c" placeholder="Tot C" class="bg-card-sub border border-sub rounded-lg py-1 text-center text-emerald-300 text-[10px]">
                    <input type="number" id="nut-batch-f" placeholder="Tot F" class="bg-card-sub border border-sub rounded-lg py-1 text-center text-amber-300 text-[10px]">
                  </div>
                  <button type="button" onclick="appActions.saveBatchRecipeManual()" class="w-full py-1.5 bg-card-sub hover:bg-slate-800 border border-sub text-slate-200 font-bold rounded-xl text-[10px] tactile">
                    Save Manual Batch Split
                  </button>
                </div>
              ` : ''}
              <div class="space-y-1.5">
                ${savedMeals.length ? savedMeals.map((m, idx) => `
                  <div class="bg-input p-2.5 rounded-xl border border-sub flex justify-between items-center gap-2 text-[10.5px]">
                    <div class="min-w-0 flex-1">
                      <div class="font-bold text-white truncate">${m.name}</div>
                      <div class="text-[9px] text-slate-400">${m.serving ? m.serving + ' • ' : ''}${m.kcal} kcal • ${m.p}P / ${m.c}C / ${m.f}F</div>
                    </div>
                    <div class="flex items-center space-x-1 shrink-0">
                      <input type="number" id="nut-saved-qty-${idx}" step="0.25" min="0.25" value="1" class="w-12 bg-card-sub border border-sub rounded-lg py-1 text-center text-accent font-bold text-[10px]">
                      <button type="button" onclick="appActions.logSavedMeal(${idx})" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] tactile">+ Log</button>
                      <button type="button" onclick="appActions.deleteSavedMeal('${m.id}')" class="text-slate-500 hover:text-rose-400 px-1 font-bold">✕</button>
                    </div>
                  </div>
                `).join('') : `<div class="text-center py-4 text-slate-500 text-[10px]">No saved meals yet. Use "<span class="inline-flex items-center justify-center gap-1">${window.apexIcon ? window.apexIcon('star','w-3.5 h-3.5') : ''}<span>Save & Log</span></span>" on the Manual tab to build your library.</div>`}
              </div>
            </div>
          ` : ''}
        ` : ''}

        ${ui.view === 'targets' ? `
          <!-- Goal Mode & Auto-Macro Engine -->
          <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-md">
            <div class="flex justify-between items-center border-b border-sub pb-2">
              <div>
                <span class="text-[10px] text-accent font-bold uppercase">Auto-Macro Goal Engine</span>
                <div class="text-[9px] text-slate-400 mt-0.5">${targets.sourceLabel}</div>
              </div>
              ${state.settings?.nutritionGoal?.autoSync === false ? `
                <button type="button" onclick="appActions.enableAutoMacroTargets()" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9.5px] font-bold tactile shadow">
                  ↻ Re-Sync Auto
                </button>
              ` : `
                <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[9px] font-bold">● AUTO-SYNCED</span>
              `}
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              ${Object.entries(NUTRITION_GOALS).map(([gKey, gObj]) => {
                const isActive = (targets.mode || 'maintain') === gKey && state.settings?.nutritionGoal?.autoSync !== false;
                return `
                  <button type="button" onclick="appActions.setNutritionGoalMode('${gKey}')"
                    class="text-left p-2.5 rounded-2xl border transition tactile ${isActive ? 'bg-accent/15 border-accent text-white shadow-sm' : 'bg-input border-sub text-slate-300 hover:border-slate-500'}">
                    <div class="font-bold text-xs flex justify-between items-center">
                      <span>${gObj.label}</span>${isActive ? '<span class="text-accent text-[9px]">✓</span>' : ''}
                    </div>
                    <div class="text-[8.5px] text-slate-400 mt-0.5">${gObj.sub}</div>
                  </button>
                `;
              }).join('')}
            </div>

            <div class="flex justify-between items-center pt-1">
              <span class="text-[9.5px] text-slate-400 font-bold uppercase">Daily Targets (Edit any box to override)</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
                <label class="text-[9px] text-slate-400 uppercase font-bold">Calories</label>
                <input type="number" step="50" value="${targets.kcal}" onchange="appActions.updateNutritionTarget('kcal', this.value)" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-center text-white font-bold">
              </div>
              <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
                <label class="text-[9px] text-blue-300 uppercase font-bold">Protein (g)</label>
                <input type="number" step="5" value="${targets.p}" onchange="appActions.updateNutritionTarget('p', this.value)" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-center text-white font-bold">
              </div>
              <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
                <label class="text-[9px] text-emerald-300 uppercase font-bold">Carbs (g)</label>
                <input type="number" step="5" value="${targets.c}" onchange="appActions.updateNutritionTarget('c', this.value)" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-center text-white font-bold">
              </div>
              <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
                <label class="text-[9px] text-amber-300 uppercase font-bold">Fat (g)</label>
                <input type="number" step="5" value="${targets.f}" onchange="appActions.updateNutritionTarget('f', this.value)" class="w-full bg-card-sub border border-sub rounded-xl p-1.5 text-center text-white font-bold">
              </div>
            </div>

            <div class="pt-2 border-t border-sub/50 space-y-1">
              <label class="text-[9px] text-slate-400 uppercase font-bold">USDA FoodData Central API Key (Free at api.data.gov)</label>
              <input type="password" value="${usdaKey}" placeholder="Paste your api.data.gov key..." onchange="appActions.saveUsdaApiKey(this.value)" class="w-full bg-input border border-sub rounded-xl px-3 py-2 text-white text-xs">
            </div>
          </div>

          ${window.renderAdaptiveTdeeCard()}
        ` : ''}
      </main>
    `;
  };

  window.apexCore = window.apexCore || {};
  window.apexCore.computeAdaptiveTdee = computeAdaptiveTdee;
})();
