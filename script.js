const passwordInput = document.getElementById('password');
const toggleButton = document.getElementById('toggle');
const clearButton = document.getElementById('clear');
const meterFill = document.getElementById('meter-fill');
const meter = document.querySelector('.meter');
const strengthLabel = document.getElementById('strength-label');
const scoreText = document.getElementById('score-text');
const lengthText = document.getElementById('length-text');
const feedback = document.getElementById('feedback');

const rules = [
  { id: 'check-length', test: p => p.length >= 12 },
  { id: 'check-lower', test: p => /[a-z]/.test(p) },
  { id: 'check-upper', test: p => /[A-Z]/.test(p) },
  { id: 'check-number', test: p => /[0-9]/.test(p) },
  { id: 'check-symbol', test: p => /[^A-Za-z0-9]/.test(p) },
  { id: 'check-common', test: p => !isCommonOrPredictable(p) }
];

const commonPasswords = new Set([
  'password', 'password123', '123456', '123456789', 'qwerty',
  'qwerty123', 'admin', 'letmein', 'welcome', 'iloveyou',
  'abc123', '111111', '000000', 'india123'
]);

function isCommonOrPredictable(password) {
  const lower = password.toLowerCase();
  if (commonPasswords.has(lower)) return true;
  if (/^(.)\1+$/.test(password)) return true;
  if (/^(0123|1234|2345|3456|4567|5678|6789|9876|8765)/.test(password)) return true;
  if (/^(qwerty|asdf|zxcv)/i.test(password)) return true;
  return false;
}

function updateChecklist(password) {
  let passed = 0;
  rules.forEach(rule => {
    const item = document.getElementById(rule.id);
    const success = password.length > 0 && rule.test(password);
    item.classList.toggle('pass', success);
    item.querySelector('.check-icon').textContent = success ? '✓' : '○';
    if (success) passed++;
  });
  return passed;
}

function evaluatePassword(password) {
  const passed = updateChecklist(password);
  lengthText.textContent = `${password.length} character${password.length === 1 ? '' : 's'}`;

  if (!password) {
    meterFill.style.width = '0%';
    meter.setAttribute('aria-valuenow', '0');
    strengthLabel.textContent = 'Not tested';
    scoreText.textContent = 'Start typing to see your result.';
    feedback.textContent = 'Your password is checked locally. It is never sent to a server.';
    return;
  }

  // Score rewards length and variety, while predictable passwords receive a penalty.
  let score = 0;
  if (password.length >= 8) score += 15;
  if (password.length >= 12) score += 20;
  if (password.length >= 16) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  if (new Set(password).size >= 8) score += 10;
  if (isCommonOrPredictable(password)) score = Math.min(score, 20);
  score = Math.min(score, 100);

  let level, color, message;
  if (score < 30) {
    level = 'Very weak'; color = '#ff7185';
    message = 'This password is easy to guess. Use a longer, unique passphrase and add character variety.';
  } else if (score < 50) {
    level = 'Weak'; color = '#ff9b75';
    message = 'This needs improvement. Aim for at least 12 characters and avoid predictable patterns.';
  } else if (score < 75) {
    level = 'Fair'; color = '#ffc66d';
    message = 'A reasonable start. Add more length and make sure this password is unique to one account.';
  } else if (score < 90) {
    level = 'Strong'; color = '#75c9ff';
    message = 'Good work. A longer, unique password is even better. Consider using a password manager.';
  } else {
    level = 'Very strong'; color = '#45d6a1';
    message = 'This scores very well against these basic checks. Never reuse it, and store it in a password manager.';
  }

  meterFill.style.width = `${score}%`;
  meterFill.style.background = color;
  meter.setAttribute('aria-valuenow', String(score));
  strengthLabel.textContent = level;
  strengthLabel.style.color = color;
  scoreText.textContent = `${score}/100 • ${passed} of 6 checks passed`;
  feedback.textContent = message;
}

passwordInput.addEventListener('input', () => evaluatePassword(passwordInput.value));

toggleButton.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  toggleButton.textContent = isHidden ? 'Hide' : 'Show';
  toggleButton.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
});

clearButton.addEventListener('click', () => {
  passwordInput.value = '';
  passwordInput.type = 'password';
  toggleButton.textContent = 'Show';
  toggleButton.setAttribute('aria-label', 'Show password');
  evaluatePassword('');
  passwordInput.focus();
});

evaluatePassword('');
