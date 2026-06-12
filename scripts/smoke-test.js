const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);

if (scripts.length !== 1) {
  throw new Error(`Expected one inline script, found ${scripts.length}`);
}

function createElement(id) {
  return {
    id,
    value: id === 'group-filter' ? 'ALL' : '',
    innerHTML: '',
    innerText: '',
    classList: {
      add() {},
      remove() {},
    },
  };
}

const elements = new Map();
[
  'fixtures-table-body',
  'standings-container',
  'ko-r32',
  'ko-r16',
  'ko-qf',
  'ko-sf',
  'ko-final',
  'champion-display',
  'group-filter',
  'fixtures-tab',
  'standings-tab',
  'knockout-tab',
  'btn-fixtures-tab',
  'btn-standings-tab',
  'btn-knockout-tab',
].forEach((id) => elements.set(id, createElement(id)));

const storage = new Map();
const context = {
  window: {},
  console,
  confirm: () => true,
  localStorage: {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
  document: {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, createElement(id));
      return elements.get(id);
    },
    querySelectorAll() {
      return [];
    },
  },
};

vm.createContext(context);
vm.runInContext(scripts[0], context, { filename: 'index.html' });
context.window.onload();

for (let id = 1; id <= 72; id += 1) {
  context.updateGroupScore(id, 1, 1);
  context.updateGroupScore(id, 2, 0);
}

const fixtureHtml = elements.get('fixtures-table-body').innerHTML;
const standingsHtml = elements.get('standings-container').innerHTML;
const bracketHtml = elements.get('ko-r32').innerHTML;

if (!fixtureHtml.includes('flag-fixture')) throw new Error('Fixture flags were not rendered');
if (!standingsHtml.includes('flag-standings')) throw new Error('Standing flags were not rendered');
if (!bracketHtml.includes('flag-knockout')) throw new Error('Knockout flags were not rendered');
if (!fixtureHtml.includes('assets/flags/mx.svg')) throw new Error('Expected Mexico flag path was not rendered');
if (!bracketHtml.includes('assets/flags/')) throw new Error('Expected local flag asset paths in bracket');

console.log('Static smoke test passed: fixtures, standings, and knockout flags render.');
