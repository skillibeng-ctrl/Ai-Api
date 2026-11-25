document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initNav();
  initSpeechRecognition();
  initSpeechSynthesis();
});

/* ---------- STARS ---------- */
function initStars() {
  const container = document.getElementById('stars-container');
  if (!container) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 150; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 1; // 1–3px
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.top = Math.random() * 100 + 'vh';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.animationDuration = (Math.random() * 3 + 2) + 's';
    star.style.animationDelay = (Math.random() * 3) + 's';
    star.style.opacity = (Math.random() * 0.7 + 0.3).toFixed(2);
    frag.appendChild(star);
  }
  container.appendChild(frag);
}

/* ---------- NAV ---------- */
function initNav() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (!navLinks || !hamburger) return;

  const toggleMenu = () => {
    const open = navLinks.classList.toggle('active');
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const closeMenu = () => {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', toggleMenu);
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
}

/* ---------- SPEECH RECOGNITION ---------- */
function initSpeechRecognition() {
  const output = document.getElementById('recognition-output');
  const hintsEl = document.getElementById('hints');
  const preview = document.getElementById('color-preview');
  const startBtn = document.getElementById('start-btn');
  if (!output || !hintsEl || !preview || !startBtn) return;

  const colors = [
    'aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate',
    'coral', 'crimson', 'cyan', 'fuchsia', 'gold', 'goldenrod', 'gray',
    'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'magenta',
    'maroon', 'navy', 'olive', 'orange', 'orchid', 'pink', 'plum', 'purple',
    'red', 'salmon', 'silver', 'teal', 'tomato', 'turquoise', 'violet',
    'wheat', 'white', 'yellow'
  ];

  // Render color hints
  hintsEl.innerHTML = colors
    .map(c => `<span class="hint"><i style="background:${c}"></i>${c}</span>`)
    .join('');

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    output.textContent = 'Your browser does not support Speech Recognition.';
    startBtn.disabled = true;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  startBtn.addEventListener('click', () => {
    try {
      recognition.start();
      output.textContent = 'Listening…';
      startBtn.disabled = true;
    } catch (err) {
      output.textContent = 'Could not start listening. Try again.';
      startBtn.disabled = false;
    }
  });

  recognition.onresult = (event) => {
    const raw = event.results[0][0].transcript.trim().toLowerCase();
    const color = raw.replace(/[^\w\s]|_/g, '').trim();

    if (colors.includes(color)) {
      output.textContent = `Recognized: ${color}`;
      preview.style.backgroundColor = color;
      speak(`Color changed to ${color}`);
    } else {
      output.textContent = `Unrecognized color: "${raw}"`;
    }
  };

  recognition.onspeechend = () => recognition.stop();
  recognition.onnomatch = () => { output.textContent = 'No match found.'; };
  recognition.onerror = (e) => { output.textContent = `Error: ${e.error}`; };
  recognition.onend = () => { startBtn.disabled = false; };
}

/* ---------- SPEECH SYNTHESIS ---------- */
function initSpeechSynthesis() {
  const form = document.getElementById('tts-form');
  const input = document.getElementById('tts-input');
  const rate = document.getElementById('rate');
  const pitch = document.getElementById('pitch');
  const rateVal = document.getElementById('rate-value');
  const pitchVal = document.getElementById('pitch-value');
  const voiceSelect = document.getElementById('voiceSelect');
  if (!form || !input || !voiceSelect) return;

  if (!('speechSynthesis' in window)) {
    form.querySelector('button[type="submit"]').disabled = true;
    return;
  }

  const synth = window.speechSynthesis;
  let voices = [];

  const populateVoices = () => {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach((voice) => {
      const opt = document.createElement('option');
      opt.textContent = `${voice.name} (${voice.lang})${voice.default ? ' — DEFAULT' : ''}`;
      opt.value = voice.name;
      voiceSelect.appendChild(opt);
    });
  };

  populateVoices();
  if (typeof synth.onvoiceschanged !== 'undefined') {
    synth.onvoiceschanged = populateVoices;
  }

  rate.addEventListener('input', () => { rateVal.textContent = rate.value; });
  pitch.addEventListener('input', () => { pitchVal.textContent = pitch.value; });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const utter = new SpeechSynthesisUtterance(input.value);
    const chosen = voices.find(v => v.name === voiceSelect.value);
    if (chosen) utter.voice = chosen;
    utter.rate = parseFloat(rate.value);
    utter.pitch = parseFloat(pitch.value);
    synth.cancel();
    synth.speak(utter);
  });
}

/* ---------- SHARED ---------- */
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}