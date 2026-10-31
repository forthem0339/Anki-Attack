'use strict';
/**
 * Pembaca sumber untuk _backup/index.original.html.
 * Semua nomor baris yang dikembalikan di sini 1-based dan merujuk ke FILE ASLI,
 * supaya cocok dengan nomor baris yang dilihat di editor.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ORIGINAL = path.join(ROOT, '_backup', 'index.original.html');
const WWW = path.join(ROOT, 'www');

function splitLinesKeepEol(text) {
  return text.match(/[^\n]*\n|[^\n]+$/g) || [];
}

function load() {
  const raw = fs.readFileSync(ORIGINAL, 'utf8');
  const lines = splitLinesKeepEol(raw);
  const find = (re, from) => {
    for (let i = from || 0; i < lines.length; i++) if (re.test(lines[i])) return i;
    return -1;
  };
  const styleOpen = find(/^<style>\s*$/);
  const styleClose = find(/^<\/style>\s*$/, styleOpen + 1);
  const scriptOpen = find(/^<script>\s*$/);
  const scriptClose = find(/^<\/script>\s*$/, scriptOpen + 1);
  if ([styleOpen, styleClose, scriptOpen, scriptClose].some((n) => n < 0)) {
    throw new Error('Tidak menemukan blok <style>/<script> di file asli');
  }
  return {
    raw,
    lines,
    bom: raw.charCodeAt(0) === 0xfeff,
    // indeks 0-based di array `lines`
    styleOpen,
    styleClose,
    scriptOpen,
    scriptClose,
    // nomor baris 1-based (file asli) dari isi blok
    cssFirstLine: styleOpen + 2,
    cssLastLine: styleClose, // baris terakhir isi = baris sebelum </style> (1-based = styleClose)
    jsFirstLine: scriptOpen + 2,
    jsLastLine: scriptClose, // 1-based
  };
}

/** Ambil baris [a..b] (1-based, inklusif) dari file asli sebagai satu string. */
function sliceLines(src, a, b) {
  return src.lines.slice(a - 1, b).join('');
}

module.exports = { ROOT, ORIGINAL, WWW, load, sliceLines, splitLinesKeepEol };
