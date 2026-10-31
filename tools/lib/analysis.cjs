'use strict';
/**
 * Analisis statis sebuah <script> klasik: statement top-level, variabel/fungsi global,
 * dan referensi antar-statement. Dipakai oleh analyze.cjs, split.cjs, dan verify-split.cjs.
 *
 * Konsep penting: di SATU script klasik, deklarasi fungsi di-hoist (bisa dipanggil sebelum baris
 * definisinya). Setelah dipecah jadi BANYAK script, hoisting hanya berlaku di dalam satu file.
 * Jadi statement yang jalan saat load tidak boleh memakai fungsi dari file yang dimuat belakangan.
 */
const acorn = require('acorn');
const eslintScope = require('eslint-scope');

const SYNC_CB = new Set([
  'forEach', 'map', 'filter', 'reduce', 'reduceRight', 'some', 'every', 'find', 'findIndex',
  'findLast', 'findLastIndex', 'flatMap', 'sort', 'replace', 'replaceAll', 'from', 'call', 'apply',
]);

function analyzeScript(body, lineBase) {
  lineBase = lineBase || 0;
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

  const snippet = (n, len) =>
    body.slice(n.range[0], Math.min(n.range[1], n.range[0] + (len || 80))).replace(/\s+/g, ' ');

  function nameOf(n) {
    switch (n.type) {
      case 'FunctionDeclaration':
        return n.id.name + '()';
      case 'ClassDeclaration':
        return 'class ' + n.id.name;
      case 'VariableDeclaration':
        return (
          n.kind + ' ' +
          n.declarations.map((d) => (d.id.type === 'Identifier' ? d.id.name : '{destructure}')).join(',')
        );
      default:
        return snippet(n, 70);
    }
  }

  const stmts = ast.body.map((n, i) => ({
    i,
    n,
    type: n.type,
    start: n.loc.start.line + lineBase,
    end: n.loc.end.line + lineBase,
    name: nameOf(n),
  }));

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

  /* variabel/fungsi global */
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

  /* jenis eksekusi fungsi: kapan badan fungsi dijalankan? */
  function execKind(fn) {
    if (fn.type === 'FunctionDeclaration') return 'declared';
    const p = parentOf.get(fn);
    if (p) {
      if (p.type === 'CallExpression' && p.callee === fn) return 'iife';
      if (
        p.type === 'MemberExpression' && p.object === fn &&
        parentOf.get(p) && parentOf.get(p).type === 'CallExpression' && parentOf.get(p).callee === p
      ) return 'iife';
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

  /* apakah identifier ini DIPANGGIL (bukan sekadar dirujuk sebagai nilai)? */
  function isCallRef(id) {
    const p = parentOf.get(id);
    if (!p) return false;
    if ((p.type === 'CallExpression' || p.type === 'NewExpression') && p.callee === id) return true;
    if (p.type === 'TaggedTemplateExpression' && p.tag === id) return true;
    if (p.type === 'CallExpression' && p.arguments.includes(id)) {
      const c = p.callee;
      if (c.type === 'MemberExpression' && !c.computed && SYNC_CB.has(c.property.name)) return true;
    }
    if (p.type === 'MemberExpression' && p.object === id && !p.computed) {
      const gp = parentOf.get(p);
      if (gp && gp.type === 'CallExpression' && gp.callee === p && (p.property.name === 'call' || p.property.name === 'apply')) return true;
    }
    return false;
  }

  /* semua referensi ke variabel/fungsi global */
  const refs = [];
  for (const scope of sm.scopes) {
    for (const ref of scope.references) {
      const v = ref.resolved;
      if (!v || v.scope !== gscope) continue;
      const g = globals.get(v.name);
      if (!g) continue;
      const chain = [];
      for (let s = ref.from; s; s = s.upper) if (s.type === 'function') chain.push(s.block);
      refs.push({
        from: stmtIndexAt(ref.identifier.range[0]),
        name: v.name,
        g,
        chain,
        isCall: isCallRef(ref.identifier),
        line: ref.identifier.loc.start.line + lineBase,
      });
    }
  }

  /* statement yang menjalankan kode saat load (bukan sekadar mendefinisikan) */
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

  return { ast, comments, stmts, globals, refs, isSync, isActive, stmtIndexAt, parentOf };
}

/**
 * Periksa urutan muat. `chunkOf(stmtIdx)` mengembalikan indeks file (urutan muat) untuk statement.
 * Aturan (meniru semantik banyak <script> klasik yang berbagi scope global):
 *  - fungsi: boleh dipakai jika didefinisikan di file yang sama (hoisting) atau file yang lebih awal
 *  - let/const/class/var: harus sudah dieksekusi (file lebih awal, atau file sama & posisi lebih awal)
 * Pemeriksaan mencakup rujukan langsung saat load DAN rantai pemanggilan fungsi (transitif).
 */
function checkLoadOrder(A, chunkOf) {
  const { ast, stmts, globals, refs, isSync } = A;
  const problems = [];

  const loadRefs = refs.filter((r) => {
    const t = ast.body[r.from].type;
    if (t === 'FunctionDeclaration' || t === 'ClassDeclaration') return false;
    return r.chain.every(isSync);
  });

  // referensi sinkron di dalam tiap deklarasi fungsi (badan fungsi yang dijalankan bila dipanggil)
  const bodyRefs = new Map(); // stmtIdx -> refs
  for (const r of refs) {
    if (ast.body[r.from].type !== 'FunctionDeclaration') continue;
    if (!r.chain.slice(0, -1).every(isSync)) continue;
    if (!bodyRefs.has(r.from)) bodyRefs.set(r.from, []);
    bodyRefs.get(r.from).push(r);
  }

  const available = (g, s0, why) => {
    if (g.isFunction) {
      return chunkOf(g.lastIdx) <= chunkOf(s0) ? null : why + ': fungsi ' + g.name + ' ada di file yang dimuat belakangan';
    }
    const c = chunkOf(g.firstIdx);
    const cs = chunkOf(s0);
    if (c < cs || (c === cs && g.firstIdx < s0)) return null;
    return why + ': ' + g.name + ' belum diinisialisasi saat dipakai';
  };

  const byStmt = new Map();
  for (const r of loadRefs) {
    if (!byStmt.has(r.from)) byStmt.set(r.from, []);
    byStmt.get(r.from).push(r);
  }

  for (const [s0, list] of byStmt) {
    const where = 'statement L' + stmts[s0].start + ' [' + stmts[s0].name.slice(0, 40) + ']';
    const visited = new Set();
    const queue = [];
    for (const r of list) {
      const msg = available(r.g, s0, 'rujukan langsung');
      if (msg) problems.push(where + ' -> ' + msg + ' (L' + r.line + ')');
      if (r.isCall && r.g.isFunction && !visited.has(r.name)) {
        visited.add(r.name);
        queue.push({ name: r.name, path: r.name });
      }
    }
    while (queue.length) {
      const cur = queue.shift();
      const g = globals.get(cur.name);
      if (!g) continue;
      for (const d of g.defs) {
        for (const r of bodyRefs.get(d.idx) || []) {
          const msg = available(r.g, s0, 'rantai ' + cur.path + ' -> ' + r.name);
          if (msg) problems.push(where + ' -> ' + msg);
          if (r.isCall && r.g.isFunction && !visited.has(r.name)) {
            visited.add(r.name);
            queue.push({ name: r.name, path: cur.path + ' -> ' + r.name });
          }
        }
      }
    }
  }
  return problems;
}

module.exports = { analyzeScript, checkLoadOrder };
