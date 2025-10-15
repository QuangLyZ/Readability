// script/app.js
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const inputBox = document.getElementById('input');       // usr-in
  const outputBox = document.getElementById('output');     // result wrapper
  const textarea = document.getElementById('inputText');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const doneBtn = document.getElementById('doneBtn');
  const modeSwitch = document.getElementById('modeSwitch');
  const header = document.getElementById('headr');
  const progName = document.getElementById('progname'); // note: your HTML uses id="progname"
  const gradeBox = document.querySelector('.gradebx');
  const gradeSpan = document.getElementById('grade');

  // Table fields
  const elLetters = document.getElementById('letters');
  const elWords = document.getElementById('words');
  const elSentence = document.getElementById('sentence'); // your HTML uses `sentence`
  const elL = document.getElementById('L');
  const elS = document.getElementById('S');
  const elIndex = document.getElementById('index');

  // Safety checks
  if (!inputBox || !outputBox || !textarea || !analyzeBtn || !doneBtn) {
    console.warn('Required elements missing. Check IDs in HTML.');
    return;
  }

  // Helper: apply gradient stroke
function applyGradientStroke(wrapper) {
  wrapper.style.borderImage = 'linear-gradient(45deg, #FFFFFF, #3BB2FF) 1';
}
function removeGradientStroke(wrapper) {
  wrapper.style.borderImage = '';
  wrapper.style.border = '';
}

  // Helper: remove gradient stroke
  function removeGradientStroke(el) {
    el.style.borderImage = '';
    el.style.border = '';
  }

  // Theme handling (auto by hour unless user set in localStorage)
  function getAutoMode() {
    const h = new Date().getHours();
    return (h >= 6 && h < 18) ? 'light' : 'dark';
  }

  // Apply a mode ('light' or 'dark')
  function applyMode(mode, save = false) {
    const isDark = mode === 'dark';

    // body colors
    document.body.classList.remove('bg-light', 'bg-dark', 'text-dark', 'text-light');
    document.body.classList.add(isDark ? 'bg-dark' : 'bg-light');
    // text color set via class names in your CSS; if missing, enforce inline
    document.body.style.color = isDark ? '#F6F6F6' : '#949494';

    // header
    if (header) {
      header.classList.remove('headr-white', 'headr-blue');
      header.classList.add(isDark ? 'headr-blue' : 'headr-white');
      header.style.color = isDark ? '#F6F6F6' : '#949494';

    }

    // progname color
    if (progName) {
      progName.style.color = isDark ? '#204E6B' : '#3BB2FF';
    }

    // input / output boxes background & stroke
    // Input box
    if (inputBox) {
      inputBox.style.borderRadius = '16px';
      if (isDark) {
        inputBox.style.background = '#272A2F';
        
        // stroke gradient
        applyGradientStroke(inputBox);

      } else {
        inputBox.style.background = '#F6F6F6';
        removeGradientStroke(inputBox);
      }
    }

    // Output box
    if (outputBox) {
      outputBox.style.borderRadius = '16px';
      if (isDark) {
        outputBox.style.background = '#272A2F';
        applyGradientStroke(outputBox);
      } else {
        outputBox.style.background = '#F6F6F6';
        removeGradientStroke(outputBox);
      }
    }

    // Buttons: analyzeBtn & doneBtn
    [analyzeBtn, doneBtn].forEach(btn => {
      if (!btn) return;
      btn.style.borderRadius = '8px';
      btn.style.padding = '12px';
      btn.style.fontSize = '18px';
      if (isDark) {
        btn.style.background = '#272A2F';
        btn.style.color = '#F6F6F6';
        applyGradientStroke(btn);
      } else {
        btn.style.background = '#3BB2FF';
        btn.style.color = '#FFFFFF';
        removeGradientStroke(btn);
      }
    });

    // Grade box style & grade span color:
    if (gradeBox) {
      gradeBox.style.borderRadius = '12px';
      gradeBox.style.padding = '20px';
      gradeBox.style.minWidth = '160px';
      // In light mode: gradebox background = #3BB2FF, grade text color white, span#grade color = #3BB2FF? 
      // You requested: ".gradebx id='grade' đổi màu theo mode: if light mode thì màu 3BB2FF; if darkmode then background none + stroke"
      if (!isDark) {
        // light mode: show solid blue box, grade span colored (we'll set span color to white and overall background blue)
        gradeBox.style.background = '#3BB2FF';
        gradeBox.style.color = '#FFFFFF';
        gradeBox.style.border = 'none';
        gradeSpan && (gradeSpan.style.color = '#FFFFFF'); // grade number white
      } else {
        // dark mode: transparent background, gradient stroke
        gradeBox.style.background = 'transparent';
        gradeBox.style.color = '#F6F6F6';
        applyGradientStroke(gradeBox);
        // make grade number stand out with primary blue for light contrast? you requested grade color -> keep grade number same text color
        gradeSpan && (gradeSpan.style.color = '#F6F6F6');
      }
    }

    // Mode switch icon
    if (modeSwitch) {
      modeSwitch.src = isDark ? './assets/Darkmode.svg' : './assets/Lightmode.svg';
    }

    // Save preference if user toggled
    if (save) localStorage.setItem('mode', mode);
  }

  // initialize mode (localStorage overrides auto)
  const savedMode = localStorage.getItem('mode');
  if (savedMode === 'light' || savedMode === 'dark') {
    applyMode(savedMode);
  } else {
    applyMode(getAutoMode());
  }

  // toggle by clicking switch (persist to localStorage)
  if (modeSwitch) {
    modeSwitch.addEventListener('click', (e) => {
      e.preventDefault();
      const current = (localStorage.getItem('mode') === 'dark') ? 'dark' : null;
      // If no saved, derive from body bg
      const bodyIsDark = document.body.classList.contains('bg-dark') || document.body.style.backgroundColor === '#272A2F';
      const newMode = bodyIsDark ? 'light' : 'dark';
      applyMode(newMode, true);
    });
  }

  // Initially hide output
  outputBox.style.display = 'none';

  // ANALYSE handler (compute Coleman-Liau and show output)
  analyzeBtn.addEventListener('click', () => {
    const text = textarea.value || '';
    if (text.trim().length === 0) {
      alert('Please enter some text.');
      return;
    }

    // Letters: count a-zA-Z
    const letters = (text.match(/[a-zA-Z]/g) || []).length;

    // Words: split on whitespace
    const wordsArray = text.trim().split(/\s+/).filter(Boolean);
    const words = wordsArray.length;

    // Sentences: count occurrences of . ! ? (consecutive punctuation counts as one)
    const sentences = (text.match(/[.!?]+/g) || []).length || 0;

    // Coleman-Liau index:
    const L = words === 0 ? 0 : (letters / words) * 100;
    const S = words === 0 ? 0 : (sentences / words) * 100;
    const index = 0.0588 * L - 0.296 * S - 15.8;
    const roundedGrade = Math.round(index);

    // Fill table (IDs exactly as in your HTML)
    if (elLetters) elLetters.textContent = letters;
    if (elWords) elWords.textContent = words;
    if (elSentence) elSentence.textContent = sentences;
    if (elL) elL.textContent = L.toFixed(2);
    if (elS) elS.textContent = S.toFixed(2);
    if (elIndex) elIndex.textContent = index.toFixed(2);
    if (gradeSpan) gradeSpan.textContent = isFinite(roundedGrade) ? roundedGrade : 'N/A';

    // grade description
    const descEl = document.getElementById('gradeDescription');
    if (descEl) {
      let desc = '';
      if (roundedGrade < 1) desc = 'Before Grade 1';
      else if (roundedGrade <= 3) desc = 'Elementary';
      else if (roundedGrade <= 6) desc = 'Middle/High school';
      else if (roundedGrade <= 9) desc = 'College';
      else if (roundedGrade <= 12) desc = 'University';
      else if (roundedGrade <= 16) desc = 'Postgraduate / Professional';
      else desc = 'Expert';
      descEl.textContent = desc;
    }

    // gradeBox coloring depends on current mode (re-apply to ensure stroke/rounded)
    const currentMode = (localStorage.getItem('mode') === 'dark') ? 'dark' : (document.body.classList.contains('bg-dark') ? 'dark' : 'light');
    applyMode(currentMode); // reapply so stroke/background correct for gradeBox

    // Show output (hide input)
    inputBox.style.display = 'none';
    // show output as flex-column aligned center
    outputBox.style.display = 'flex';
    outputBox.style.flexDirection = 'column';
    outputBox.style.alignItems = 'center';
    outputBox.style.justifyContent = 'center';
    // smooth scroll to output
    setTimeout(() => {
      outputBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  });

  // DONE handler: hide output, show input
  doneBtn.addEventListener('click', () => {
    outputBox.style.display = 'none';
    inputBox.style.display = 'flex';
    // clear results if desired (not clearing now, but you can)
    // textarea.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});