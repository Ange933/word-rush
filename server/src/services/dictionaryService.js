const FRENCH_WORDS = require('../data/words');
const fetch = require('node-fetch');

const GAME_DURATION = 90;

const apiCache = new Map();

function normalize(str) {
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z]/g, '');
}

function canFormWord(word, letters) {
  const available = [...letters];
  for (const char of word) {
    const idx = available.indexOf(char);
    if (idx === -1) return false;
    available.splice(idx, 1);
  }
  return true;
}

// Score quadratique : mot de 5 lettres = 16 pts, 7 lettres = 36 pts
function calculatePoints(word) {
  return Math.pow(word.length - 1, 2);
}

async function isInDictionary(word) {
  if (FRENCH_WORDS.has(word)) return true;
  if (apiCache.has(word)) return apiCache.get(word);

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/fr/${word.toLowerCase()}`,
      { timeout: 2000 }
    );
    const valid = res.ok;
    apiCache.set(word, valid);
    return valid;
  } catch {
    // API indisponible : on accepte si le mot a au moins 4 lettres (fallback permissif)
    return word.length >= 4;
  }
}

async function validateWord(word, letters) {
  if (!word || word.length < 2) {
    return { valid: false, reason: 'Mot trop court' };
  }
  if (!canFormWord(word, letters)) {
    return { valid: false, reason: 'Lettres non disponibles' };
  }
  const inDict = await isInDictionary(word);
  if (!inDict) {
    return { valid: false, reason: 'Mot inconnu' };
  }
  return { valid: true, points: calculatePoints(word) };
}

// Distribution française pondérée : 4 voyelles + 6 consonnes
const VOWEL_POOL = [
  ...Array(15).fill('E'), ...Array(9).fill('A'), ...Array(8).fill('I'),
  ...Array(6).fill('U'), ...Array(5).fill('O'),
];
const CONSONANT_POOL = [
  ...Array(8).fill('S'), ...Array(7).fill('N'), ...Array(7).fill('T'),
  ...Array(6).fill('R'), ...Array(5).fill('L'), ...Array(4).fill('D'),
  ...Array(4).fill('C'), ...Array(4).fill('P'), ...Array(3).fill('M'),
  ...Array(2).fill('V'), ...Array(2).fill('F'), ...Array(2).fill('G'),
  ...Array(2).fill('B'), ...Array(2).fill('H'), 'J', 'Q', 'X', 'Y', 'Z',
];

function pickRandom(pool) {
  const copy = [...pool];
  const picked = [];
  for (let i = 0; i < Math.min(4, copy.length); i++) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(idx, 1)[0]);
  }
  return picked;
}

function generateLetters() {
  const vowels = pickRandom(VOWEL_POOL);
  const cPool = [...CONSONANT_POOL];
  const consonants = [];
  for (let i = 0; i < 6 && cPool.length; i++) {
    const idx = Math.floor(Math.random() * cPool.length);
    consonants.push(cPool.splice(idx, 1)[0]);
  }
  const all = [...vowels, ...consonants];
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

module.exports = { validateWord, generateLetters, normalize, calculatePoints, GAME_DURATION };
