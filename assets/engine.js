(function (global) {
  'use strict';

  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
  };

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function uuid() {
    if (global.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  /* ---------- Aleatoriedad reproducible ----------
   * El orden de las opciones se deriva del id de sesión, así que es distinto
   * entre personas pero estable para la misma persona: si vuelve atrás, las
   * opciones siguen donde estaban. */
  function semillaDe(txt) {
    let h = 2166136261;
    for (let i = 0; i < txt.length; i++) {
      h ^= txt.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function prng(semilla) {
    let s = semilla >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function collectMeta() {
    const p = new URLSearchParams(location.search);
    const ua = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod|Mobile|Opera Mini/i.test(ua);
    const tablet = /iPad|Tablet/i.test(ua);
    return {
      source: p.get('src') || p.get('utm_source') || 'directo',
      campaign: p.get('utm_campaign') || null,
      referrer: document.referrer || null,
      device_type: tablet ? 'tablet' : (mobile ? 'movil' : 'escritorio'),
      user_agent: ua.slice(0, 400),
      language: navigator.language || null,
      screen: `${screen.width}x${screen.height}`,
      timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone) || null
    };
  }

  function Store(cfg, surveyType, sessionId, meta) {
    const on = !!(cfg && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
      !/TU_/.test(cfg.SUPABASE_URL) && !/TU_/.test(cfg.SUPABASE_ANON_KEY));
    const url = on ? cfg.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/rpc/guardar_respuesta' : null;
    const headers = on ? {
      'apikey': cfg.SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + cfg.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    } : null;

    async function enviar(payload, keepalive) {
      if (!on) return false;
      try {
        const r = await fetch(url, {
          method: 'POST', headers,
          keepalive: !!keepalive,
          body: JSON.stringify({
            p_session_id: sessionId,
            p_survey_type: surveyType,
            p_payload: Object.assign({}, meta, payload)
          })
        });
        if (!r.ok) console.warn('[korvex] no se pudo guardar', r.status, await r.text());
        return r.ok;
      } catch (e) { console.warn('[korvex] error de red al guardar', e); return false; }
    }

    return {
      enabled: on,
      start: () => enviar({ answers: {}, completed: false, last_question_index: 0 }),
      patch: (payload, keepalive) => enviar(payload, keepalive)
    };
  }

  function Survey(opts) {
    const questions = opts.questions;
    const type = opts.surveyType;
    const cfg = global.KORVEX_CONFIG || {};
    const storeKey = 'korvex_survey_' + type;

    const answers = {};
    let sessionId = uuid();
    let startedAt = Date.now();
    let idx = 0;
    let dir = 1;
    let sending = false;
    let finished = false;
    let autoTimer = null;
    let moving = false;

    /* Tiempo por pregunta, para detectar quien pasa sin leer. */
    const tiempos = {};
    let tsPregunta = Date.now();

    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.sessionId && Date.now() - s.startedAt < 1000 * 60 * 60 * 6 && !s.finished) {
          Object.assign(answers, s.answers || {});
          sessionId = s.sessionId;
          startedAt = s.startedAt;
          idx = s.idx || 0;
          Object.assign(tiempos, s.tiempos || {});
        }
      }
    } catch (e) { /* localStorage bloqueado: seguimos sin recuperación */ }

    const meta = collectMeta();
    const store = Store(cfg, type, sessionId, meta);

    const stage = document.getElementById('stage');
    const fill = document.getElementById('progressFill');
    const counter = document.getElementById('counter');
    const btnUp = document.getElementById('navUp');
    const btnDown = document.getElementById('navDown');

    const saveLocal = () => {
      try {
        localStorage.setItem(storeKey, JSON.stringify({
          sessionId, startedAt, answers, idx, finished, tiempos
        }));
      } catch (e) { /* sin persistencia, la encuesta sigue funcionando */ }
    };

    /* ---------- Rotación de opciones ----------
     * Solo rota las preguntas marcadas con rotate:true. Las opciones
     * exclusivas ("Ninguno", "No hacemos nada") y las de "Otro" quedan
     * ancladas al final: moverlas confunde en vez de quitar sesgo.
     * Las escalas nunca se rotan, ahí el orden ES el dato. */
    const ordenCache = {};

    function opcionesDe(q) {
      if (!q.options) return [];

      /* En un best-worst, la opción elegida como "la mejor" no puede volver a
       * ofrecerse como "la peor": alguien ya marcó la misma en las dos y esa
       * respuesta no se puede usar. */
      let base = q.options;
      if (q.excluirDe) {
        const ya = answers[q.excluirDe];
        if (ya && ya.value) base = base.filter((o) => o.value !== ya.value);
      }

      if (!q.rotate) return base;

      const clave = q.id + (q.excluirDe ? '|' + base.length : '');
      if (ordenCache[clave]) return ordenCache[clave];

      const libres = [];
      const ancladas = [];
      base.forEach((o) => {
        if (o.exclusive || o.other) ancladas.push(o);
        else libres.push(o);
      });

      const r = prng(semillaDe(sessionId + '|' + q.id));
      for (let i = libres.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        const t = libres[i]; libres[i] = libres[j]; libres[j] = t;
      }

      ordenCache[clave] = libres.concat(ancladas);
      return ordenCache[clave];
    }

    const visible = () => questions.filter((q) => !q.showIf || q.showIf(answers));
    const current = () => visible()[Math.min(idx, visible().length - 1)];

    const countSkipped = () =>
      visible().filter((q) => !q.required && (answers[q.id] == null || answers[q.id] === '')).length;

    function validate(q) {
      const v = answers[q.id];
      if (!q.required) return null;

      if (q.type === 'checkbox') {
        if (!v || !v.selected || !v.selected.length) return 'Selecciona al menos una opción.';
        if (q.maxSelect && v.selected.length > q.maxSelect) return `Puedes elegir hasta ${q.maxSelect}.`;
        const needsOther = (v.selected || []).some((s) => {
          const o = q.options.find((x) => x.value === s);
          return o && o.other;
        });
        if (needsOther && !(v.other || '').trim()) return 'Especifica tu respuesta en el campo de texto.';
        return null;
      }

      if (q.type === 'radio') {
        if (!v || !v.value) return 'Selecciona una opción para continuar.';
        const o = q.options.find((x) => x.value === v.value);
        if (o && o.other && !(v.other || '').trim()) return 'Especifica tu respuesta en el campo de texto.';
        return null;
      }

      if (q.type === 'text' || q.type === 'longtext') {
        const t = (v || '').trim();
        if (!t) return 'Esta pregunta es necesaria para el estudio.';
        if (q.type === 'longtext' && t.length < 8) return 'Cuéntanos un poco más, por favor.';
        return null;
      }

      return null;
    }

    /* ---------- Marcadores de calidad ----------
     * No descartan a nadie automáticamente. Se guardan como banderas para
     * poder filtrar al analizar, que es como trabaja una casa encuestadora. */
    function calidad() {
      const lista = visible();
      const segundos = Math.round((Date.now() - startedAt) / 1000);

      /* Trampa de atención: comparamos contra el valor que la pregunta pedía. */
      let atencion = null;
      lista.forEach((q) => {
        if (!q.atencion) return;
        const v = answers[q.id];
        atencion = !!(v && v.value === q.atencion);
      });

      /* Línea recta: la racha más larga de radios seguidos contestados en la
       * misma posición de pantalla. Con rotación activa esto es aún más
       * revelador, porque la misma posición ya no significa la misma opción. */
      let racha = 0, mejorRacha = 0, previa = null;
      lista.forEach((q) => {
        if (q.type !== 'radio') { racha = 0; previa = null; return; }
        const v = answers[q.id];
        if (!v || typeof v.pos !== 'number') { racha = 0; previa = null; return; }
        if (previa !== null && v.pos === previa) { racha += 1; } else { racha = 1; }
        previa = v.pos;
        if (racha > mejorRacha) mejorRacha = racha;
      });

      /* Coherencia de Van Westendorp. Las cuatro respuestas tienen que subir:
       * "tan barato que desconfío" ≤ "buena oferta" ≤ "empieza a ser caro"
       * ≤ "ni lo considero". Quien las cruza no entendió la pregunta, y su
       * curva ensucia el cálculo del precio. Se marca, no se descarta. */
      const esc = [];
      lista.forEach((q) => {
        if (!q.vw) return;
        const v = answers[q.id];
        const num = v && v.value != null ? Number(v.value) : NaN;
        esc[q.vw] = isFinite(num) ? num : null;
      });
      let vwCoherente = null, vwTecho = null;
      const pasos = esc.filter((v) => v != null);
      const total = lista.filter((q) => q.vw).length;
      if (total > 0 && pasos.length === total) {
        vwCoherente = pasos.every((v, i) => i === 0 || pasos[i - 1] <= v);
        /* Cuántas se fueron al tope de la escalera. Si son muchas, la
         * escalera se quedó corta y hay que subirle el techo. */
        const q1 = lista.find((x) => x.vw === 1);
        const tope = q1 ? Number(q1.options[q1.options.length - 1].value) : null;
        vwTecho = tope == null ? null : pasos.filter((v) => v === tope).length;
      }

      /* Longitud media de las respuestas abiertas: otra señal de esfuerzo. */
      const abiertas = lista.filter((q) => q.type === 'longtext' || q.type === 'text');
      const largos = abiertas.map((q) => String(answers[q.id] || '').trim().length);
      const largoMedio = largos.length
        ? Math.round(largos.reduce((a, b) => a + b, 0) / largos.length)
        : 0;

      return {
        duracion_segundos: segundos,
        segundos_por_pregunta: lista.length ? +(segundos / lista.length).toFixed(1) : 0,
        apurado: segundos < lista.length * 3,
        linea_recta_max: mejorRacha,
        sospecha_linea_recta: mejorRacha >= 6,
        atencion_ok: atencion,
        vw_coherente: vwCoherente,
        vw_en_el_tope: vwTecho,
        largo_medio_abiertas: largoMedio,
        tiempos_por_pregunta: tiempos
      };
    }

    function registrarTiempo(q) {
      if (!q) return;
      const t = Math.round((Date.now() - tsPregunta) / 1000);
      tiempos[q.id] = (tiempos[q.id] || 0) + Math.max(0, Math.min(t, 600));
      tsPregunta = Date.now();
    }

    function go(delta) {
      if (moving || finished) return;
      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }

      const list = visible();
      if (delta > 0) {
        const q = list[idx];
        const err = validate(q);
        if (err) { showError(err); return; }
        if (idx >= list.length - 1) return submit();
      }
      if (delta < 0 && idx === 0) return;

      registrarTiempo(list[idx]);

      moving = true;
      dir = delta;

      const old = stage.querySelector('.slide');
      if (old) old.classList.add('leaving');

      idx = Math.max(0, idx + delta);
      saveLocal();

      store.patch({
        answers,
        last_question_index: idx,
        last_question_id: (visible()[idx] || {}).id || null,
        updated_at: new Date().toISOString()
      });

      setTimeout(function () { moving = false; render(); }, old ? 150 : 0);
    }

    function showError(msg) {
      const e = stage.querySelector('.err');
      if (e) { e.textContent = msg; }
    }

    async function submit() {
      if (sending) return;

      const hp = document.querySelector('.hp input');
      if (hp && hp.value) { renderDone(); return; }

      sending = true;
      registrarTiempo(current());

      const btn = stage.querySelector('.btn:not(.ghost)');
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Enviando…'; }

      const payload = {
        answers,
        completed: true,
        submitted_at: new Date().toISOString(),
        duration_seconds: Math.round((Date.now() - startedAt) / 1000),
        last_question_index: visible().length,
        total_questions: visible().length,
        skipped_optional: countSkipped(),
        calidad: calidad(),
        updated_at: new Date().toISOString()
      };

      let ok = await store.patch(payload);
      if (!ok && store.enabled) ok = await store.patch(payload);

      finished = true;
      saveLocal();
      try { localStorage.removeItem(storeKey); } catch (e) {}

      if (!ok && store.enabled) {
        try { localStorage.setItem('korvex_pendiente_' + sessionId, JSON.stringify(payload)); } catch (e) {}
      }

      renderDone();
    }

    function optionsHTML(q, sel, otherVal) {
      const isCheck = q.type === 'checkbox';
      const selected = isCheck ? (sel || []) : (sel ? [sel] : []);
      const atMax = isCheck && q.maxSelect && selected.length >= q.maxSelect;
      const lista = opcionesDe(q);

      return lista.map((o, i) => {
        const on = selected.indexOf(o.value) > -1;
        const blocked = atMax && !on;
        const rows = [
          `<button type="button" class="opt${on ? ' selected' : ''}${blocked ? ' disabled' : ''}" data-val="${esc(o.value)}"${blocked ? ' disabled' : ''}>
            <span class="key">${LETTERS[i] || (i + 1)}</span>
            <span class="opt-label">${esc(o.label)}</span>
            <span class="tick">${ICON.check}</span>
          </button>`
        ];
        if (o.other && on) {
          rows.push(`<input class="other-input" data-other="1" placeholder="Escribe cuál…" value="${esc(otherVal || '')}" autocomplete="off">`);
        }
        return rows.join('');
      }).join('');
    }

    function render() {
      const list = visible();
      if (idx >= list.length) { submit(); return; }

      const q = list[idx];
      const total = list.length;
      const a = answers[q.id];

      tsPregunta = Date.now();

      fill.style.width = ((idx) / total * 100).toFixed(1) + '%';
      const pad = (n) => String(n).padStart(String(total).length, '0');
      counter.textContent = `${pad(idx + 1)} / ${total}`;
      btnUp.disabled = idx === 0;

      let body = '';
      if (q.type === 'radio' || q.type === 'checkbox') {
        body = `<div class="options">${optionsHTML(q, q.type === 'checkbox' ? (a && a.selected) : (a && a.value), a && a.other)}</div>`;
      } else if (q.type === 'text') {
        body = `<div class="options"><input class="field" id="inp" placeholder="${esc(q.placeholder || 'Escribe tu respuesta…')}" value="${esc(a || '')}" autocomplete="off"></div>`;
      } else if (q.type === 'longtext') {
        body = `<div class="options"><textarea class="textarea" id="inp" placeholder="${esc(q.placeholder || 'Escribe con tus palabras…')}">${esc(a || '')}</textarea></div>`;
      } else if (q.type === 'contact') {
        const c = a || {};
        body = `<div class="contact-grid">` + q.fields.map((f) =>
          `<div><label>${esc(f.label)}</label><input class="field" data-cf="${esc(f.key)}" type="${f.type || 'text'}" placeholder="${esc(f.placeholder || '')}" value="${esc(c[f.key] || '')}" autocomplete="${esc(f.autocomplete || 'off')}"></div>`
        ).join('') + `</div>`;
      }

      const isLast = idx === total - 1;
      const canSkip = !q.required && (q.type === 'longtext' || q.type === 'text');
      const cta = isLast ? 'Enviar respuestas' : 'Continuar';

      let badge = '';
      if (q.type === 'checkbox') {
        badge = q.maxSelect
          ? `<span class="qmeta">Elige hasta ${q.maxSelect}</span>`
          : `<span class="qmeta">Puedes elegir varias</span>`;
      } else if (!q.required) {
        badge = `<span class="qmeta">Opcional</span>`;
      }

      stage.innerHTML = `
        <div class="slide${dir < 0 ? ' back' : ''}">
          <div class="qnum">${idx + 1} ${ICON.arrow}</div>
          <h2 class="qtitle">${esc(q.title)}</h2>
          ${q.help ? `<p class="qhelp">${esc(q.help)}</p>` : ''}
          ${badge}
          ${body}
          <div class="err"></div>
          <div class="actions">
            <button type="button" class="btn" id="next">${cta} ${ICON.check}</button>
            ${canSkip ? '<button type="button" class="btn ghost" id="skip">Saltar</button>' : ''}
            <span class="hint">o presiona <kbd>Enter</kbd></span>
          </div>
          <div class="hp"><input tabindex="-1" autocomplete="off" name="website" aria-hidden="true"></div>
        </div>`;

      wire(q);

      const inp = document.getElementById('inp');
      if (inp && window.matchMedia('(min-width: 720px)').matches) inp.focus();
    }

    function wire(q) {
      const slide = stage.querySelector('.slide');

      slide.querySelectorAll('.opt').forEach((btn) => {
        btn.addEventListener('click', () => pick(q, btn.dataset.val));
      });

      const otherInp = slide.querySelector('[data-other]');
      if (otherInp) {
        otherInp.addEventListener('input', (e) => {
          answers[q.id] = Object.assign({}, answers[q.id], { other: e.target.value });
          saveLocal();
        });
      }

      const inp = document.getElementById('inp');
      if (inp) {
        inp.addEventListener('input', (e) => { answers[q.id] = e.target.value; saveLocal(); });
      }

      slide.querySelectorAll('[data-cf]').forEach((f) => {
        f.addEventListener('input', (e) => {
          answers[q.id] = Object.assign({}, answers[q.id], { [e.target.dataset.cf]: e.target.value });
          saveLocal();
        });
      });

      slide.querySelector('#next').addEventListener('click', () => go(1));

      const sk = slide.querySelector('#skip');
      if (sk) sk.addEventListener('click', () => { answers[q.id] = ''; go(1); });
    }

    function pick(q, value) {
      if (moving) return;

      const lista = opcionesDe(q);
      const pos = lista.findIndex((o) => o.value === value);
      const opt = lista[pos];
      if (!opt) return;

      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }

      if (q.type === 'radio') {
        const prev = answers[q.id] || {};
        answers[q.id] = {
          value,
          label: opt.label,
          pos,
          other: opt.other ? (prev.other || '') : undefined
        };
        saveLocal();

        if (opt.other) {
          render();
          setTimeout(() => { const o = stage.querySelector('[data-other]'); if (o) o.focus(); }, 60);
          return;
        }

        render();
        autoTimer = setTimeout(() => { autoTimer = null; if (!validate(q)) go(1); }, 340);
        return;
      }

      const cur = (answers[q.id] && answers[q.id].selected) || [];
      let next;
      if (cur.indexOf(value) > -1) {
        next = cur.filter((v) => v !== value);
      } else {
        if (opt.exclusive) {
          next = [value];
        } else {
          const exclusives = q.options.filter((o) => o.exclusive).map((o) => o.value);
          next = cur.filter((v) => exclusives.indexOf(v) === -1).concat([value]);
        }
        if (q.maxSelect && next.length > q.maxSelect) next = next.slice(-q.maxSelect);
      }

      const labels = next.map((v) => (q.options.find((o) => o.value === v) || {}).label);
      answers[q.id] = Object.assign({}, answers[q.id], { selected: next, labels });
      saveLocal();
      render();
    }

    function renderDone() {
      fill.style.width = '100%';
      counter.textContent = '';
      btnUp.disabled = true;
      btnDown.disabled = true;
      stage.innerHTML = `
        <div class="slide done">
          <div class="check">${ICON.check}</div>
          <h2>${esc(opts.doneTitle || '¡Listo! Gracias.')}</h2>
          <p>${esc(opts.doneText || 'Tus respuestas quedaron registradas.')}</p>
        </div>`;
    }

    document.addEventListener('keydown', (e) => {
      if (finished) return;
      const q = current();
      if (!q) return;

      const typing = /INPUT|TEXTAREA/.test((e.target.tagName || ''));

      if (e.key === 'Enter') {
        if (q.type === 'longtext' && typing && !e.metaKey && !e.ctrlKey) return;
        e.preventDefault();
        go(1);
        return;
      }

      if (typing) return;

      if ((q.type === 'radio' || q.type === 'checkbox') && /^[a-zA-Z]$/.test(e.key)) {
        const i = LETTERS.indexOf(e.key.toUpperCase());
        const lista = opcionesDe(q);
        if (i > -1 && lista[i]) { e.preventDefault(); pick(q, lista[i].value); }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
    });

    btnUp.addEventListener('click', () => go(-1));
    btnDown.addEventListener('click', () => go(1));

    global.addEventListener('pagehide', () => {
      if (finished) return;
      registrarTiempo(current());
      store.patch({
        answers,
        last_question_index: idx,
        last_question_id: (current() || {}).id || null,
        calidad: calidad(),
        updated_at: new Date().toISOString()
      }, true);
    });

    this.start = async function () {
      await store.start();
      render();
    };
  }

  global.KorvexSurvey = Survey;
  global.KorvexIcons = ICON;
})(window);
