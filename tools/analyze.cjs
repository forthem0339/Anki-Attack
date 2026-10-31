'use strict';
/**
 * Analisis statis index.html asli (dari _backup/).
 *
 * Tujuan: menemukan semua statement top-level yang JALAN SAAT LOAD dan memanggil fungsi
 * yang baru didefinisikan LEBIH BELAKANG di file. Di satu <script> hal ini aman karena
 * deklarasi fungsi di-hoist; setelah file dipecah, urutan muat harus menjamin definisinya
 * sudah ada. Hasil: tools/out/report.txt, banners.txt, statements.tsv
 */
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const eslintScope = require('eslint-scope');
const { load, ROOT, sliceLines } = require('./lib/source.cjs');

const OUT = path.join(ROOT, 'tools', 'out');
fs.mkdirSync(OUT, { recursive: true });

const src = load();
const body = sliceLines(src, src.jsFirstLine, src.jsLastLine);
const base = src.jsFirstLine - 1; // + nomor baris di body = nomor baris file asli

const comments = [];
const ast = acorn.parse(body, {
  ecmaVersion: 'latest',
  sourceType: 'script',
  locations: true,
  ranges: true,
  onComment: comments,
});
const sm = eslintScope.analyze(ast, {
  ecmaVersion: 2022,
  sourceType: 'script',
  optimistic: true,
  ignoreEval: true,
});
const gscope = sm.globalScope;

const parentOf = new WeakMap();
(function walk(node, parent) {
  parentOf.set(node, parent);
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'range') continue;
    const val = node[key];
    if (Array.isArray(val)) {
      for (const c of val) if (c && typeof c.type === 'string') walk(c, node);
    } else if (val && typeof val.type === 'string') {
      walk(val, node);
    }
  }
})(ast, null);

const L = (n) => n.loc.start.line + base;
const LE = (n) => n.loc.end.line + base;
const snippet = (n, len) =>
  body.slice(n.range[0], Math.min(n.range[1], n.range[0] + (len || 80))).replace(/\s+/g, ' ');

function stmtIndexAt(pos) {
  let lo = 0;
  let hi = ast.body.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const r = ast.body[mid].range;
    if (pos < r[0]) hi = mid - 1;
    else if (pos >= r[1]) lo = mid + 1;
    else return mid;
  }
  return -1;
}

function nameOf(n) {
  switch (n.type) {
    case 'FunctionDeclaration':
      return n.id.name + '()';
    case 'ClassDeclaration':
      return 'class ' + n.id.name;
    case 'VariableDeclaration':
      return (
        n.kind +
        ' ' +
        n.declarations.map((d) => (d.id.type === 'Identifier' ? d.id.name : '{destructure}')).join(',')
      );
    default:
      return snippet(n, 70);
  }
}

/* ---------- variabel/fungsi global ---------- */
const globals = new Map();
for (const v of gscope.variables) {
  if (!v.defs.length) continue;
  const defs = v.defs.map((d) => ({
    type: d.type,
    kind: d.parent && d.parent.kind,
    idx: stmtIndexAt(d.node.range[0]),
  }));
  globals.set(v.name, {
    name: v.name,
    defs,
    isFunction: defs.every((d) => d.type === 'FunctionName'),
    firstIdx: Math.min(...defs.map((d) => d.idx)),
    lastIdx: Math.max(...defs.map((d) => d.idx)),
  });
}

/* ---------- jenis eksekusi sebuah fungsi ---------- */
const SYNC_CB = new Set([
  'forEach', 'map', 'filter', 'reduce', 'reduceRight', 'some', 'every', 'find', 'findIndex',
  'findLast', 'findLastIndex', 'flatMap', 'sort', 'replace', 'replaceAll', 'from', 'call', 'apply',
]);
function execKind(fn) {
  if (fn.type === 'FunctionDeclaration') return 'declared';
  const p = parentOf.get(fn);
  if (p) {
    if (p.type === 'CallExpression' && p.callee === fn) return 'iife';
    if (
      p.type === 'MemberExpression' &&
      p.object === fn &&
      parentOf.get(p) &&
      parentOf.get(p).type === 'CallExpression' &&
      parentOf.get(p).callee === p
    )
      return 'iife';
    if (p.type === 'CallExpression' && p.arguments.includes(fn)) {
      const c = p.callee;
      if (c.type === 'MemberExpression' && !c.computed && SYNC_CB.has(c.property.name)) return 'sync-cb';
    }
  }
  return 'deferred';
}
const isSync = (fn) => {
  const k = execKind(fn);
  return k === 'iife' || k === 'sync-cb';
};

/* ---------- referensi ke global ---------- */
const refs = [];
for (const scope of sm.scopes) {
  for (const ref of scope.references) {
    const v = ref.resolved;
    if (!v || v.scope !== gscope) continue;
    const g = globals.get(v.name);
    if (!g) continue;
    const from = stmtIndexAt(ref.identifier.range[0]);
    const chain = [];
    for (let s = ref.from; s; s = s.upper) if (s.type === 'function') chain.push(s.block);
    refs.push({ from, name: v.name, g, chain, line: ref.identifier.loc.start.line + base });
  }
}

const stmts = ast.body.map((n, i) => ({ i, n, type: n.type, start: L(n), end: LE(n), name: nameOf(n) }));

/* ---------- statement yang aktif saat load ---------- */
function hasLoadCall(node) {
  let found = false;
  (function w(n) {
    if (found || !n || typeof n.type !== 'string') return;
    if (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') return;
    if (n.type === 'CallExpression' || n.type === 'NewExpression' || n.type === 'TaggedTemplateExpression') {
      found = true;
      return;
    }
    for (const key of Object.keys(n)) {
      if (key === 'loc' || key === 'range') continue;
      const val = n[key];
      if (Array.isArray(val)) val.forEach(w);
      else if (val && typeof val.type === 'string') w(val);
    }
  })(node);
  return found;
}
function isActive(s) {
  switch (s.type) {
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
      return false;
    case 'VariableDeclaration':
      return s.n.declarations.some((d) => d.init && hasLoadCall(d.init));
    default:
      return true;
  }
}

/* ---------- hazard: referensi maju saat load ---------- */
const hazards = [];
const loadRefs = refs.filter((r) => {
  const t = ast.body[r.from].type;
  if (t === 'FunctionDeclaration' || t === 'ClassDeclaration') return false;
  return r.chain.every(isSync);
});
for (const r of loadRefs) {
  const g = r.g;
  if (g.isFunction) {
    if (g.lastIdx > r.from)
      hazards.push({ kind: 'FORWARD-FUNCTION', stmt: r.from, line: r.line, name: r.name, defLine: stmts[g.lastIdx].start });
  } else if (g.firstIdx > r.from) {
    hazards.push({ kind: 'USED-BEFORE-DECL', stmt: r.from, line: r.line, name: r.name, defLine: stmts[g.firstIdx].start });
  }
}

// referensi sinkron di dalam tiap deklarasi fungsi (untuk closure transitif)
const syncRefsByStmt = new Map();
for (const r of refs) {
  if (ast.body[r.from].type !== 'FunctionDeclaration') continue;
  if (!r.g.isFunction) continue;
  if (r.chain.slice(0, -1).every(isSync)) {
    if (!syncRefsByStmt.has(r.from)) syncRefsByStmt.set(r.from, new Set());
    syncRefsByStmt.get(r.from).add(r.name);
  }
}
const transitive = [];
const loadRefsByStmt = new Map();
for (const r of loadRefs) {
  if (!r.g.isFunction) continue;
  if (!loadRefsByStmt.has(r.from)) loadRefsByStmt.set(r.from, new Set());
  loadRefsByStmt.get(r.from).add(r.name);
}
for (const [stmtIdx, names] of loadRefsByStmt) {
  const parent = new Map();
  const queue = [];
  for (const nme of names) {
    parent.set(nme, null);
    queue.push(nme);
  }
  while (queue.length) {
    const cur = queue.shift();
    const g = globals.get(cur);
    if (!g) continue;
    const refsIn = new Set();
    for (const d of g.defs) (syncRefsByStmt.get(d.idx) || []).forEach((x) => refsIn.add(x));
    for (const nxt of refsIn) {
      if (!parent.has(nxt)) {
        parent.set(nxt, cur);
        queue.push(nxt);
      }
    }
  }
  for (const [nme, par] of parent) {
    const g = globals.get(nme);
    if (g && g.lastIdx > stmtIdx && par !== null) {
      const pathNames = [];
      for (let c = nme; c !== null; c = parent.get(c)) pathNames.unshift(c);
      transitive.push({ stmt: stmtIdx, line: stmts[stmtIdx].start, target: nme, defLine: stmts[g.lastIdx].start, path: pathNames.join(' -> ') });
    }
  }
}

/* ---------- laporan ---------- */
const rep = [];
const P = (s) => rep.push(s);
P('ANALISIS index.html ASLI');
P('BOM: ' + src.bom + ' | CRLF: ' + (src.raw.match(/\r\n/g) || []).length + ' | LF total: ' + (src.raw.match(/\n/g) || []).length);
P('CSS baris ' + src.cssFirstLine + '-' + src.cssLastLine + ' | JS baris ' + src.jsFirstLine + '-' + src.jsLastLine);
const typeCount = {};
stmts.forEach((s) => (typeCount[s.type] = (typeCount[s.type] || 0) + 1));
P('Statement top-level: ' + stmts.length + ' ' + JSON.stringify(typeCount));
const active = stmts.filter(isActive);
P('Statement aktif-saat-load: ' + active.length);
P('');
P('== DEKLARASI GANDA (nama yang didefinisikan lebih dari sekali di top-level) ==');
for (const g of globals.values()) {
  if (g.defs.length > 1) P(g.name + ' -> baris ' + g.defs.map((d) => stmts[d.idx].start).join(', '));
}
P('');
P('== var / function = properti window; let/const/class = TIDAK di window. Daftar var top-level ==');
for (const g of globals.values()) {
  if (g.defs.some((d) => d.kind === 'var')) P('var ' + g.name + ' @' + stmts[g.firstIdx].start);
}
P('');
P('== HAZARD LANGSUNG (statement aktif-saat-load memakai sesuatu yang didefinisikan lebih belakang) ==');
if (!hazards.length) P('(tidak ada)');
hazards.forEach((h) =>
  P(h.kind + ' | statement L' + stmts[h.stmt].start + ' ref di L' + h.line + ' -> ' + h.name + ' (didefinisikan L' + h.defLine + ')')
);
P('');
P('== HAZARD TRANSITIF (fungsi yang dipanggil saat load memanggil fungsi yang didefinisikan lebih belakang) ==');
if (!transitive.length) P('(tidak ada)');
transitive.forEach((h) => P('statement L' + h.line + ' => ' + h.path + ' | ' + h.target + ' didefinisikan L' + h.defLine));
P('');
P('== STATEMENT AKTIF-SAAT-LOAD ==');
active.forEach((s) => P('L' + s.start + '-' + s.end + ' [' + s.type + '] ' + s.name));

fs.writeFileSync(path.join(OUT, 'report.txt'), rep.join('\n') + '\n');

/* banner/section */
const banners = [];
for (const c of comments) {
  if (c.loc.start.column !== 0) continue;
  if (!/[═─]{2,}/.test(c.value)) continue;
  const text = c.value
    .split(/\r?\n/)
    .map((l) => l.replace(/[═─*\/]/g, '').trim())
    .filter((l) => /[A-Za-z0-9]/.test(l))[0];
  banners.push('L' + (c.loc.start.line + base) + '-' + (c.loc.end.line + base) + '  ' + (text || '').slice(0, 100));
}
fs.writeFileSync(path.join(OUT, 'banners.txt'), banners.join('\n') + '\n');

/* tabel penuh */
fs.writeFileSync(
  path.join(OUT, 'statements.tsv'),
  stmts.map((s) => [s.i, s.start, s.end, s.type, s.name, isActive(s) ? 'ACTIVE' : ''].join('\t')).join('\n') + '\n'
);

console.log(rep.slice(0, 6).join('\n'));
console.log('hazard langsung:', hazards.length, '| transitif:', transitive.length, '| banner:', banners.length);
