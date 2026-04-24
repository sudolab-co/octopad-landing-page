// Tweaks panel — accent color, background tone, hero mascot scale.
// Registers the message listener BEFORE announcing availability.
(function () {
  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#2a9f73",
    "paperTone": "cool",
    "mascotScale": 100
  }/*EDITMODE-END*/;

  const state = { ...DEFAULTS, ...(JSON.parse(localStorage.getItem('octopad-tweaks') || '{}')) };

  const accents = [
    { id: 'green', v: '#2a9f73', label: 'Green (mascot)' },
    { id: 'ink', v: '#1d1d20', label: 'Ink only' },
    { id: 'ochre', v: '#c08a2a', label: 'Ochre' },
    { id: 'plum', v: '#6b3e6b', label: 'Plum' },
  ];
  const tones = [
    { id: 'cool', bg: 'oklch(98.8% 0.003 100)', label: 'Cool paper' },
    { id: 'warm', bg: 'oklch(97.4% 0.012 85)', label: 'Warm paper' },
    { id: 'dark', bg: 'oklch(18% 0.01 250)', label: 'Dark' },
  ];

  function apply() {
    const root = document.documentElement;
    root.style.setProperty('--green', state.accent);
    const tone = tones.find(t => t.id === state.paperTone) || tones[0];
    root.style.setProperty('--paper', tone.bg);
    if (state.paperTone === 'dark') {
      root.style.setProperty('--ink', 'oklch(96% 0.005 250)');
      root.style.setProperty('--ink-soft', 'oklch(78% 0.01 250)');
      root.style.setProperty('--ink-mute', 'oklch(60% 0.008 250)');
      root.style.setProperty('--line', 'oklch(28% 0.012 250)');
      root.style.setProperty('--line-soft', 'oklch(24% 0.01 250)');
      root.style.setProperty('--paper-raised', 'oklch(22% 0.012 250)');
      root.style.setProperty('--green-soft', 'color-mix(in oklab, var(--green) 18%, transparent)');
    } else {
      root.style.setProperty('--ink', 'oklch(22% 0.012 250)');
      root.style.setProperty('--ink-soft', 'oklch(42% 0.01 250)');
      root.style.setProperty('--ink-mute', 'oklch(55% 0.008 250)');
      root.style.setProperty('--line', 'oklch(90% 0.005 250)');
      root.style.setProperty('--line-soft', 'oklch(94% 0.004 250)');
      root.style.setProperty('--paper-raised', '#ffffff');
      root.style.setProperty('--green-soft', '#e8f4ee');
    }
    const mascots = document.querySelectorAll('.hero-art img');
    mascots.forEach(m => { m.style.width = state.mascotScale + '%'; });
    localStorage.setItem('octopad-tweaks', JSON.stringify(state));
  }

  function render() {
    let panel = document.getElementById('tweaks-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'tweaks-panel';
      panel.className = 'tweaks-panel';
      document.body.appendChild(panel);
    }
    panel.innerHTML = `
      <h4>Tweaks</h4>
      <div class="row">
        <label>Accent</label>
        <div class="swatches">
          ${accents.map(a => `<button class="swatch ${a.v === state.accent ? 'active' : ''}" data-accent="${a.v}" title="${a.label}" style="background: ${a.v}"></button>`).join('')}
        </div>
      </div>
      <div class="row">
        <label>Background</label>
        <div class="seg">
          ${tones.map(t => `<button data-tone="${t.id}" class="${t.id === state.paperTone ? 'active' : ''}">${t.label.split(' ')[0]}</button>`).join('')}
        </div>
      </div>
      <div class="row">
        <label>Mascot scale · ${state.mascotScale}%</label>
        <input type="range" min="40" max="110" value="${state.mascotScale}" data-mascot style="accent-color: var(--green);" />
      </div>
    `;
    panel.querySelectorAll('[data-accent]').forEach(b => b.onclick = () => { state.accent = b.dataset.accent; apply(); render(); bridge(); });
    panel.querySelectorAll('[data-tone]').forEach(b => b.onclick = () => { state.paperTone = b.dataset.tone; apply(); render(); bridge(); });
    const slider = panel.querySelector('[data-mascot]');
    if (slider) slider.oninput = (e) => { state.mascotScale = +e.target.value; apply(); render(); bridge(); };
  }

  function bridge() {
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: {
        accent: state.accent, paperTone: state.paperTone, mascotScale: state.mascotScale,
      }}, '*');
    } catch (_) {}
  }

  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode') {
      render();
      document.getElementById('tweaks-panel').classList.add('open');
    }
    if (d.type === '__deactivate_edit_mode') {
      const p = document.getElementById('tweaks-panel');
      if (p) p.classList.remove('open');
    }
  });

  apply();

  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (_) {}
})();
