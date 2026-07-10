const test = require('node:test');
const assert = require('node:assert/strict');
const { normalize, calculatePoints, generateLetters } = require('./dictionaryService');

test('normalize met en majuscule et retire les accents/caractères non alphabétiques', () => {
  assert.equal(normalize('café'), 'CAFE');
  assert.equal(normalize("l'été"), 'LETE');
  assert.equal(normalize(''), '');
});

test('calculatePoints suit la formule (longueur - 1)^2', () => {
  assert.equal(calculatePoints('RUE'), 4);   // 3 lettres
  assert.equal(calculatePoints('TRAIN'), 16); // 5 lettres
  assert.equal(calculatePoints('SOLEIL'), 25); // 6 lettres
});

test('generateLetters retourne 10 lettres A-Z', () => {
  const letters = generateLetters();
  assert.equal(letters.length, 10);
  for (const l of letters) {
    assert.match(l, /^[A-Z]$/);
  }
});
