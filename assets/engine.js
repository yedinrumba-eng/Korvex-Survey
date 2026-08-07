/* KORVEX SURVEY — motor de encuestas
 * Una pregunta a la vez, navegación por teclado, lógica condicional,
 * guardado automático local y envío a Supabase.
 * No depende de ninguna librería externa. */

(function (global) {
  'use strict';

  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
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

  /* ---------------- capa de persistencia ---------------- */

  function Store(cfg, surveyType, sessionId, meta) {
    const on = !!(cfg && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
      !/TU_/.test(cfg.SUPABASE_URL) && !/TU_/.test(cfg.SUPABASE_ANON_KEY));
    const url = on ? cfg.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/survey_responses' : null;
    const headers = on ? {
      'apikey': cfg.SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + cfg.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    } : null;
    let created = false;

    return {
      enabled: on,
      async start() {
        if (!on || created) return;
        try {
          const r = await fetch(url, {
            method: 'POST', headers,
            body: JSON.stringify([Object.assign({
              session_id: sessionId,
              survey_type: surveyType,
              answers: {},
              completed: false,
              last_question_index: 0
            }, meta)])
          });
          created = r.ok;
          if (!r.ok) console.warn('[korvex] no se pudo crear la sesión', r.status, await r.text());
        } catch (e) { console.warn('[korvex] error de red al iniciar', e); }
      },
      async patch(payload, keepalive) {
        if (!on || !created) return false;
        try {
          const r = await fetch(`${url}?session_id=eq.${sessionId}`, {
            method: 'PATCH', headers,
            body: JSON.stringify(payload),
            keepalive: !!keepalive
          });
          return r.ok;
        } catch (e) { console.warn('[korvex] error al guardar', e); return false; }
      }
    };
  }

  /* ---------------- motor ---------------- */

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
    let autoTimer = null;   // temporizador de avance automático del radio
    let moving = false;     // evita avanzar dos veces con un doble clic rápido

    // recuperar sesión previa (si el navegador se cerró a media encuesta)
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.sessionId && Date.now() - s.startedAt < 1000 * 60 * 60 * 6 && !s.finished) {
          Object.assign(answers, s.answers || {});
          sessionId = s.sessionId;
          startedAt = s.startedAt;
          idx = s.idx || 0;
        }
      }
    } catch (e) { /* localStorage bloqueado — seguimos sin recuperar */ }

    const meta = collectMeta();
    const store = Store(cfg, type, sessionId, meta);

    const stage = document.getElementById('stage');
    const fill = document.getElementById('progressFill');
    const counter = document.getElementById('counter');
    const btnUp = document.getElementById('navUp');
    const btnDown = document.getElementById('navDown');

    const saveLocal = () => {
      try {
        localStorage.setItem(storeKey, JSON.stringify({ sessionId, startedAt, answers, idx, finished }));
      } catch (e) { /* sin espacio o bloqueado */ }
    };

    /* --- preguntas visibles según la lógica condicional --- */
    const visible = () => questions.filter((q) => !q.showIf || q.showIf(answers));

    const current = () => visible()[Math.min(idx, visible().length - 1)];

    const countSkipped = () =>
      visible().filter((q) => !q.required && (answers[q.id] == null || answers[q.id] === '')).length;

    /* --- validación --- */
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

    /* --- navegación --- */
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

    /* --- envío final --- */
    async function submit() {
      if (sending) return;
      // trampa antibots: si el campo oculto viene lleno, es un robot
      const hp = document.querySelector('.hp input');
      if (hp && hp.value) { renderDone(); return; }

      sending = true;
      const btn = stage.querySelector('.btn:not(.ghost)');
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Enviando…'; }

      const duration = Math.round((Date.now() - startedAt) / 1000);
      const payload = {
        answers,
        completed: true,
        submitted_at: new Date().toISOString(),
        duration_seconds: duration,
        last_question_index: visible().length,
        total_questions: visible().length,
        skipped_optional: countSkipped(),
        updated_at: new Date().toISOString()
      };

      let ok = await store.patch(payload);
      if (!ok && store.enabled) ok = await store.patch(payload); // un reintento

      finished = true;
      saveLocal();
      try { localStorage.removeItem(storeKey); } catch (e) {}

      if (!ok && store.enabled) {
        // no se perdió nada: queda en el navegador para recuperarlo manualmente
        try { localStorage.setItem('korvex_pendiente_' + sessionId, JSON.stringify(payload)); } catch (e) {}
      }
      renderDone();
    }

    /* --- dibujado de cada tipo de pregunta --- */

    function optionsHTML(q, sel, otherVal) {
      const isCheck = q.type === 'checkbox';
      const selected = isCheck ? (sel || []) : (sel ? [sel] : []);
      const atMax = isCheck && q.maxSelect && selected.length >= q.maxSelect;

      return q.options.map((o, i) => {
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

      fill.style.width = ((idx) / total * 100).toFixed(1) + '%';
      counter.textContent = `${idx + 1} / ${total}`;
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
      const opt = q.options.find((o) => o.value === value);
      if (!opt) return;
      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }

      if (q.type === 'radio') {
        const prev = answers[q.id] || {};
        answers[q.id] = { value, label: opt.label, other: opt.other ? (prev.other || '') : undefined };
        saveLocal();
        if (opt.other) { render(); setTimeout(() => { const o = stage.querySelector('[data-other]'); if (o) o.focus(); }, 60); return; }
        // avance automático con un respiro visual para que se vea la selección
        render();
        autoTimer = setTimeout(() => { autoTimer = null; if (!validate(q)) go(1); }, 340);
        return;
      }

      // checkbox
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

    /* --- teclado --- */
    document.addEventListener('keydown', (e) => {
      if (finished) return;
      const q = current();
      if (!q) return;
      const typing = /INPUT|TEXTAREA/.test((e.target.tagName || ''));

      if (e.key === 'Enter') {
        if (q.type === 'longtext' && typing && !e.metaKey && !e.ctrlKey) return; // permitir saltos de línea
        e.preventDefault();
        go(1);
        return;
      }
      if (typing) return;

      if ((q.type === 'radio' || q.type === 'checkbox') && /^[a-zA-Z]$/.test(e.key)) {
        const i = LETTERS.indexOf(e.key.toUpperCase());
        if (i > -1 && q.options[i]) { e.preventDefault(); pick(q, q.options[i].value); }
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
    });

    btnUp.addEventListener('click', () => go(-1));
    btnDown.addEventListener('click', () => go(1));

    // guardar el progreso si cierran la pestaña a media encuesta
    global.addEventListener('pagehide', () => {
      if (finished) return;
      store.patch({
        answers,
        last_question_index: idx,
        last_question_id: (current() || {}).id || null,
        updated_at: new Date().toISOString()
      }, true);
    });

    /* --- arranque --- */
    this.start = async function () {
      await store.start();
      render();
    };
  }

  global.KorvexSurvey = Survey;
  global.KorvexIcons = ICON;
})(window);
