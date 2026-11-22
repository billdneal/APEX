// ============================================================================
// APEX TRAINING ENGINE - MODULE 5: NUTRITION TRACKER & ADAPTIVE TDEE ENGINE
// Features: Gemini AI Natural-Language Quick-Log, USDA FoodData Central Search,
//           Open Food Facts Barcode Lookup (+ Optional Camera Scanner),
//           Saved Meals / Batch-Cook Library, & Adaptive TDEE Calculator
// ============================================================================

(function() {
  const state = window.state || {};
  const core = window.apexCore || {};

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

  function getNutritionTargets() {
    const t = state.settings?.nutritionTargets || {};
    return {
      kcal: Number(t.kcal) || 2600,
      p: Number(t.p) || 200,
      c: Number(t.c) || 275,
      f: Number(t.f) || 75
    };
  }

  function getSavedMeals() {
    if (!state.settings) state.settings = {};
    if (!Array.isArray(state.settings.savedMeals)) {
      state.settings.savedMeals = [];
    }
    return state.settings.savedMeals;
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

  // Adaptive TDEE Engine (MacroFactor-Style)
  function computeAdaptiveTdee(windowDays = 21) {
    const nowMs = Date.now();
    const dates = Object.keys(state.dayLogs || {}).sort().filter(k => {
      const [y, m, d] = k.split('-').map(Number);
      if (!y || !m || !d) return false;
      return (nowMs - new Date(y, m - 1, d).getTime()) <= (windowDays * 86400000);
    });

    const bwPts = dates
      .filter(k => Number(state.dayLogs[k]?.weight) > 0)
      .map(k => ({ date: k, w: Number(state.dayLogs[k].weight) }));
    const kcalPts = dates
      .filter(k => Number(state.dayLogs[k]?.nutrition?.totals?.kcal) >= 500)
      .map(k => ({ date: k, kcal: Number(state.dayLogs[k].nutrition.totals.kcal) }));

    if (bwPts.length < 2 || kcalPts.length < 3) {
      return {
        ready: false,
        bwDays: bwPts.length,
        kcalDays: kcalPts.length,
        message: `Log at least 3 days of calories (${kcalPts.length}/3) and 2 weigh-ins (${bwPts.length}/2) in the past ${windowDays} days to unlock Adaptive TDEE.`
      };
    }

    const avgKcal = Math.round(kcalPts.reduce((s, x) => s + x.kcal, 0) / kcalPts.length);
    const firstBw = bwPts[0];
    const lastBw = bwPts[bwPts.length - 1];
    const [y1, m1, d1] = firstBw.date.split('-').map(Number);
    const [y2, m2, d2] = lastBw.date.split('-').map(Number);
    const weeksSpan = Math.max(0.5, (new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / (7 * 86400000));
    const weeklyBwDelta = Math.round(((lastBw.w - firstBw.w) / weeksSpan) * 100) / 100;

    // 1 lb bodyweight ~= 3,500 kcal -> 500 kcal/day per lb/week
    const estimatedTdee = Math.max(1200, Math.round(avgKcal - (weeklyBwDelta * 500)));
    const confidence = (kcalPts.length >= 10 && bwPts.length >= 5) ? 'High' : ((kcalPts.length >= 6 && bwPts.length >= 3) ? 'Moderate' : 'Early');

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
    tab: 'log', // 'log' | 'search' | 'saved' | 'targets'
    aiLoading: false,
    searchLoading: false,
    searchQuery: '',
    searchResults: [],
    barcodeLoading: false,
    scannerActive: false,
    mealSlot: 'Lunch'
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

  // Controller Actions
  window.appActions = window.appActions || {};
  Object.assign(window.appActions, {
    openNutritionForDate(dateKey) {
      state.nutritionDateKey = core.normalizeDateKey ? core.normalizeDateKey(dateKey) : dateKey;
      state.dateActionModal.open = false;
      state.drawerOpen = false;
      state.screen = 'nutrition';
      if (typeof window.render === 'function') window.render();
    },

    setNutritionDate(dateKey) {
      state.nutritionDateKey = core.normalizeDateKey ? core.normalizeDateKey(dateKey) : dateKey;
      if (typeof window.render === 'function') window.render();
    },

    setNutritionTab(tab) {
      stopBarcodeScanner();
      state.nutritionUi.tab = tab;
      if (typeof window.render === 'function') window.render();
    },

    setNutritionMealSlot(slot) {
      state.nutritionUi.mealSlot = slot;
      if (typeof window.render === 'function') window.render();
    },

    addNutritionEntry(entry) {
      const k = getSelectedDateKey();
      const nut = getDayNutrition(k);
      nut.entries.push({
        id: 'food_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        name: String(entry.name || 'Food Item').trim(),
        meal: entry.meal || state.nutritionUi.mealSlot || 'Meal',
        kcal: Math.max(0, Math.round(Number(entry.kcal) || 0)),
        p: Math.max(0, Math.round(Number(entry.p) || 0)),
        c: Math.max(0, Math.round(Number(entry.c) || 0)),
        f: Math.max(0, Math.round(Number(entry.f) || 0)),
        source: entry.source || 'manual',
        ts: Date.now()
      });
      recalcDayTotals(k);
      toast(`Logged ${entry.name} (${Math.round(Number(entry.kcal) || 0)} kcal)`);
      saveAndSync();
    },

    deleteNutritionEntry(entryId) {
      const k = getSelectedDateKey();
      const nut = getDayNutrition(k);
      nut.entries = nut.entries.filter(e => e.id !== entryId);
      recalcDayTotals(k);
      saveAndSync();
    },

    addManualFoodFromForm() {
      const name = document.getElementById('nut-manual-name')?.value?.trim();
      const kcal = Number(document.getElementById('nut-manual-kcal')?.value) || 0;
      const p = Number(document.getElementById('nut-manual-p')?.value) || 0;
      const c = Number(document.getElementById('nut-manual-c')?.value) || 0;
      const f = Number(document.getElementById('nut-manual-f')?.value) || 0;
      if (!name) { toast('Enter a food or meal name.'); return; }
      const calcKcal = kcal > 0 ? kcal : Math.round((p * 4) + (c * 4) + (f * 9));
      window.appActions.addNutritionEntry({ name, kcal: calcKcal, p, c, f, source: 'manual' });
    },

    saveMealToLibraryFromForm() {
      const name = document.getElementById('nut-saved-name')?.value?.trim();
      const kcal = Number(document.getElementById('nut-saved-kcal')?.value) || 0;
      const p = Number(document.getElementById('nut-saved-p')?.value) || 0;
      const c = Number(document.getElementById('nut-saved-c')?.value) || 0;
      const f = Number(document.getElementById('nut-saved-f')?.value) || 0;
      if (!name) { toast('Enter a meal name to save.'); return; }
      const calcKcal = kcal > 0 ? kcal : Math.round((p * 4) + (c * 4) + (f * 9));
      const meals = getSavedMeals();
      meals.unshift({ id: 'meal_' + Date.now(), name, kcal: calcKcal, p: Math.round(p), c: Math.round(c), f: Math.round(f) });
      toast(`Saved "${name}" to Meal Library`);
      saveAndSync();
    },

    deleteSavedMeal(mealId) {
      state.settings.savedMeals = getSavedMeals().filter(m => m.id !== mealId);
      saveAndSync();
    },

    updateNutritionTarget(field, val) {
      if (!state.settings) state.settings = {};
      if (!state.settings.nutritionTargets) state.settings.nutritionTargets = getNutritionTargets();
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
                text: `Parse this meal description into accurate USDA-aligned nutrition macros. Return ONLY valid JSON with no markdown fences in this exact schema: {"items":[{"name":"string","kcal":number,"p":number,"c":number,"f":number}]}.\nMeal: ${text}`
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
          nut.entries.push({
            id: 'ai_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            name: String(it.name || 'Food'),
            meal: state.nutritionUi.mealSlot || 'Meal',
            kcal: Math.max(0, Math.round(Number(it.kcal) || 0)),
            p: Math.max(0, Math.round(Number(it.p) || 0)),
            c: Math.max(0, Math.round(Number(it.c) || 0)),
            f: Math.max(0, Math.round(Number(it.f) || 0)),
            source: 'ai',
            ts: Date.now()
          });
        });
        recalcDayTotals(k);
        toast(`AI logged ${items.length} item(s)!`);
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
        const kcal = Math.round(Number(n['energy-kcal_serving'] || n['energy-kcal_100g'] || 0));
        const p = Math.round(Number(n.proteins_serving || n.proteins_100g || 0));
        const c = Math.round(Number(n.carbohydrates_serving || n.carbohydrates_100g || 0));
        const f = Math.round(Number(n.fat_serving || n.fat_100g || 0));
        window.appActions.addNutritionEntry({
          name: `${name} (${prod.serving_size || '100g'})`,
          kcal: kcal || Math.round((p * 4) + (c * 4) + (f * 9)),
          p, c, f,
          source: 'barcode'
        });
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

  // Adaptive TDEE Card Renderer (Mounted inside Analytics -> BW & Nutrition)
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

  // Full Nutrition Screen Renderer
  window.renderNutritionScreen = function() {
    const dKey = getSelectedDateKey();
    const nut = getDayNutrition(dKey);
    const targets = getNutritionTargets();
    const ui = state.nutritionUi;
    const savedMeals = getSavedMeals();
    const usdaKey = localStorage.getItem('apex_usda_key') || '';

    const pct = (val, max) => Math.min(100, Math.round(((Number(val) || 0) / Math.max(1, Number(max) || 1)) * 100));
    const remKcal = targets.kcal - nut.totals.kcal;

    return `
      <main class="flex-1 min-h-0 overflow-y-auto space-y-3.5 w-full pr-0.5" onclick="appActions.closeCardMenu()">
        <div class="flex justify-between items-center border-b border-sub pb-2 text-xs font-bold text-white font-mono w-full">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
            <span>Nutrition & Macros</span>
          </span>
          <div class="flex items-center space-x-2">
            <input type="date" value="${dKey}" onchange="appActions.setNutritionDate(this.value)" class="bg-input border border-sub rounded-xl px-2 py-1 text-[10px] text-white font-mono">
            <button type="button" onclick="appActions.navigate('calendar', event)" class="text-slate-400 hover:text-white underline">Schedule</button>
          </div>
        </div>

        <!-- Daily Macro Dashboard -->
        <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-xl">
          <div class="flex justify-between items-end">
            <div>
              <div class="text-[9px] text-slate-400 uppercase font-bold">Daily Calories (${dKey})</div>
              <div class="text-xl font-black text-white">${nut.totals.kcal} <span class="text-xs font-normal text-slate-400">/ ${targets.kcal} kcal</span></div>
            </div>
            <div class="text-right">
              <div class="text-[9px] text-slate-400 uppercase font-bold">${remKcal >= 0 ? 'Remaining' : 'Over Target'}</div>
              <div class="text-sm font-black ${remKcal >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${Math.abs(remKcal)} kcal</div>
            </div>
          </div>

          <div class="w-full h-2.5 bg-input rounded-full overflow-hidden border border-sub">
            <div class="h-full bg-accent rounded-full transition-all" style="width: ${pct(nut.totals.kcal, targets.kcal)}%"></div>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-1">
            <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
              <div class="flex justify-between text-[9px]"><span class="text-blue-300 font-bold">Protein</span><span>${nut.totals.p}/${targets.p}g</span></div>
              <div class="w-full h-1.5 bg-card-sub rounded-full overflow-hidden"><div class="h-full bg-blue-500" style="width: ${pct(nut.totals.p, targets.p)}%"></div></div>
            </div>
            <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
              <div class="flex justify-between text-[9px]"><span class="text-emerald-300 font-bold">Carbs</span><span>${nut.totals.c}/${targets.c}g</span></div>
              <div class="w-full h-1.5 bg-card-sub rounded-full overflow-hidden"><div class="h-full bg-emerald-500" style="width: ${pct(nut.totals.c, targets.c)}%"></div></div>
            </div>
            <div class="bg-input p-2.5 rounded-2xl border border-sub space-y-1">
              <div class="flex justify-between text-[9px]"><span class="text-amber-300 font-bold">Fat</span><span>${nut.totals.f}/${targets.f}g</span></div>
              <div class="w-full h-1.5 bg-card-sub rounded-full overflow-hidden"><div class="h-full bg-amber-500" style="width: ${pct(nut.totals.f, targets.f)}%"></div></div>
            </div>
          </div>
        </div>

        <!-- Sub-Tab Switcher -->
        <div class="grid grid-cols-4 gap-1 p-1 bg-input rounded-2xl border border-sub font-mono text-[10.5px]">
          <button type="button" onclick="appActions.setNutritionTab('log')" class="py-1.5 rounded-xl font-bold transition ${ui.tab === 'log' ? 'bg-accent text-black shadow' : 'text-slate-400'}">Quick Log</button>
          <button type="button" onclick="appActions.setNutritionTab('search')" class="py-1.5 rounded-xl font-bold transition ${ui.tab === 'search' ? 'bg-accent text-black shadow' : 'text-slate-400'}">USDA / UPC</button>
          <button type="button" onclick="appActions.setNutritionTab('saved')" class="py-1.5 rounded-xl font-bold transition ${ui.tab === 'saved' ? 'bg-accent text-black shadow' : 'text-slate-400'}">Saved Meals</button>
          <button type="button" onclick="appActions.setNutritionTab('targets')" class="py-1.5 rounded-xl font-bold transition ${ui.tab === 'targets' ? 'bg-accent text-black shadow' : 'text-slate-400'}">Targets</button>
        </div>

        ${ui.tab === 'log' ? `
          <!-- AI Natural Language Quick-Log -->
          <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-md">
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-accent font-bold uppercase">✦ AI Meal Quick-Log</span>
              <select onchange="appActions.setNutritionMealSlot(this.value)" class="bg-input border border-sub rounded-lg px-2 py-0.5 text-[10px] text-white font-bold">
                ${['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout'].map(m => `<option value="${m}" ${ui.mealSlot === m ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
            </div>
            <div class="flex gap-2">
              <input type="text" id="nut-ai-input" placeholder="e.g. 8 oz 93/7 ground turkey, 1 cup rice, 1 tbsp olive oil" class="flex-1 bg-input border border-sub rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-accent" onkeydown="if(event.key==='Enter') appActions.aiQuickLogFood()">
              <button type="button" onclick="appActions.aiQuickLogFood()" ${ui.aiLoading ? 'disabled' : ''} class="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tactile shrink-0">
                ${ui.aiLoading ? '...' : 'Log'}
              </button>
            </div>
          </div>

          <!-- Manual Macro Quick-Add -->
          <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-md">
            <span class="text-[10px] text-slate-400 font-bold uppercase">Manual Entry</span>
            <div class="grid grid-cols-12 gap-1.5">
              <input type="text" id="nut-manual-name" placeholder="Food name..." class="col-span-12 sm:col-span-4 bg-input border border-sub rounded-xl px-2.5 py-1.5 text-white text-xs">
              <input type="number" id="nut-manual-kcal" placeholder="kcal" class="col-span-3 sm:col-span-2 bg-input border border-sub rounded-xl px-2 py-1.5 text-center text-white text-xs">
              <input type="number" id="nut-manual-p" placeholder="P(g)" class="col-span-3 sm:col-span-2 bg-input border border-sub rounded-xl px-2 py-1.5 text-center text-blue-300 text-xs">
              <input type="number" id="nut-manual-c" placeholder="C(g)" class="col-span-3 sm:col-span-2 bg-input border border-sub rounded-xl px-2 py-1.5 text-center text-emerald-300 text-xs">
              <input type="number" id="nut-manual-f" placeholder="F(g)" class="col-span-3 sm:col-span-2 bg-input border border-sub rounded-xl px-2 py-1.5 text-center text-amber-300 text-xs">
            </div>
            <button type="button" onclick="appActions.addManualFoodFromForm()" class="w-full py-2 bg-input hover:bg-slate-800 border border-sub text-white font-bold rounded-xl text-xs tactile">+ Add Food Entry</button>
          </div>

          <!-- Today's Logged Foods -->
          <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-2 font-mono text-xs shadow-md">
            <div class="flex justify-between items-center border-b border-sub pb-1.5">
              <span class="text-[10px] text-accent font-bold uppercase">Logged Entries (${nut.entries.length})</span>
            </div>
            <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              ${nut.entries.length ? nut.entries.slice().reverse().map(e => `
                <div class="bg-input p-2.5 rounded-xl border border-sub flex justify-between items-center text-[10.5px]">
                  <div class="min-w-0 pr-2">
                    <div class="font-bold text-white truncate">${e.name}</div>
                    <div class="text-[9px] text-slate-400 mt-0.5">${e.meal} • <span class="text-blue-300">${e.p}P</span> / <span class="text-emerald-300">${e.c}C</span> / <span class="text-amber-300">${e.f}F</span></div>
                  </div>
                  <div class="flex items-center space-x-2 shrink-0">
                    <span class="font-black text-accent">${e.kcal}</span>
                    <button type="button" onclick="appActions.deleteNutritionEntry('${e.id}')" class="text-slate-500 hover:text-rose-400 px-1 font-bold">✕</button>
                  </div>
                </div>
              `).join('') : `<div class="text-center py-5 text-slate-500 text-[10px]">No foods logged for ${dKey} yet.</div>`}
            </div>
          </div>
        ` : ''}

        ${ui.tab === 'search' ? `
          <!-- Barcode / UPC Lookup -->
          <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-2.5 font-mono text-xs shadow-md">
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-accent font-bold uppercase">Barcode Lookup (Open Food Facts)</span>
              <button type="button" onclick="appActions.toggleBarcodeScanner()" class="px-2.5 py-1 bg-input border border-sub rounded-xl text-[10px] text-white font-bold tactile">
                ${ui.scannerActive ? '✕ Close Camera' : '📷 Scan Barcode'}
              </button>
            </div>
            ${ui.scannerActive ? `<div id="apex-barcode-reader" class="w-full rounded-2xl overflow-hidden border border-sub"></div>` : ''}
            <div class="flex gap-2">
              <input type="text" id="nut-barcode-input" inputmode="numeric" placeholder="Enter UPC barcode digits..." class="flex-1 bg-input border border-sub rounded-xl px-3 py-2 text-white text-xs" onkeydown="if(event.key==='Enter') appActions.lookupBarcode()">
              <button type="button" onclick="appActions.lookupBarcode()" ${ui.barcodeLoading ? 'disabled' : ''} class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs tactile">
                ${ui.barcodeLoading ? '...' : 'Lookup'}
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
                <div class="bg-input p-2.5 rounded-xl border border-sub flex justify-between items-center text-[10px]">
                  <div class="min-w-0 pr-2">
                    <div class="font-bold text-white truncate">${r.name}</div>
                    <div class="text-[9px] text-slate-400">${r.serving} • ${r.kcal} kcal • ${r.p}P / ${r.c}C / ${r.f}F</div>
                  </div>
                  <button type="button" onclick="appActions.addNutritionEntry(state.nutritionUi.searchResults[${idx}])" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] tactile shrink-0">+ Log</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${ui.tab === 'saved' ? `
          <!-- Saved Meals & Batch-Cook Library -->
          <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-md">
            <span class="text-[10px] text-accent font-bold uppercase">Save Go-To Meal / Batch-Cook Portion</span>
            <div class="grid grid-cols-12 gap-1.5">
              <input type="text" id="nut-saved-name" placeholder="e.g. Ground Turkey Taco Bowl" class="col-span-12 sm:col-span-4 bg-input border border-sub rounded-xl px-2.5 py-1.5 text-white text-xs">
              <input type="number" id="nut-saved-kcal" placeholder="kcal" class="col-span-3 sm:col-span-2 bg-input border border-sub rounded-xl px-2 py-1.5 text-center text-white text-xs">
              <input type="number" id="nut-saved-p" placeholder="P(g)" class="col-span-3 sm:col-span-2 bg-input border border-sub rounded-xl px-2 py-1.5 text-center text-blue-300 text-xs">
              <input type="number" id="nut-saved-c" placeholder="C(g)" class="col-span-3 sm:col-span-2 bg-input border border-sub rounded-xl px-2 py-1.5 text-center text-emerald-300 text-xs">
              <input type="number" id="nut-saved-f" placeholder="F(g)" class="col-span-3 sm:col-span-2 bg-input border border-sub rounded-xl px-2 py-1.5 text-center text-amber-300 text-xs">
            </div>
            <button type="button" onclick="appActions.saveMealToLibraryFromForm()" class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs tactile">Save to Meal Library</button>

            <div class="space-y-1.5 pt-2 border-t border-sub/50">
              ${savedMeals.length ? savedMeals.map((m, idx) => `
                <div class="bg-input p-2.5 rounded-xl border border-sub flex justify-between items-center text-[10.5px]">
                  <div class="min-w-0 pr-2">
                    <div class="font-bold text-white truncate">${m.name}</div>
                    <div class="text-[9px] text-slate-400">${m.kcal} kcal • ${m.p}P / ${m.c}C / ${m.f}F</div>
                  </div>
                  <div class="flex items-center space-x-1.5 shrink-0">
                    <button type="button" onclick="appActions.addNutritionEntry(state.settings.savedMeals[${idx}])" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] tactile">+ Log</button>
                    <button type="button" onclick="appActions.deleteSavedMeal('${m.id}')" class="text-slate-500 hover:text-rose-400 px-1 font-bold">✕</button>
                  </div>
                </div>
              `).join('') : `<div class="text-center py-4 text-slate-500 text-[10px]">No saved meals yet. Add your recurring meals above for 1-tap logging.</div>`}
            </div>
          </div>
        ` : ''}

        ${ui.tab === 'targets' ? `
          <!-- Daily Macro Targets & USDA Key -->
          <div class="bg-card-sub p-4 rounded-3xl border border-sub space-y-3 font-mono text-xs shadow-md">
            <span class="text-[10px] text-accent font-bold uppercase">Daily Macro Targets</span>
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
              <label class="text-[9px] text-slate-400 uppercase font-bold">USDA FoodData Central API Key (Optional — Free at api.data.gov)</label>
              <input type="password" value="${usdaKey}" placeholder="Leave blank to use DEMO_KEY (rate-limited)" onchange="appActions.saveUsdaApiKey(this.value)" class="w-full bg-input border border-sub rounded-xl px-3 py-2 text-white text-xs">
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