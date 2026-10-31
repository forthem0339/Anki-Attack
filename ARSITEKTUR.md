# ARSITEKTUR — Patokan Penempatan Kode (Kotoba Trainer Pro)

Dokumen ini menjawab satu pertanyaan: **"kode/data/gaya ini harus ditaruh di file mana?"**
Letakkan di root proyek (`kotoba game/ARSITEKTUR.md`).

---

## 0. Aturan emas

1. **`www/` adalah sumber kebenaran.** Edit file di sana langsung. `_backup/index.original.html` hanya cadangan.
   `tools/split.cjs --apply` sengaja DITOLAK kalau `www/js` sudah ada (akan menimpa semua edit). Jangan pakai `--force` kecuali mau mengulang dari nol.
2. **Semua JS adalah script klasik, bukan ES module.** Tidak ada `import`/`export`. Semua file berbagi satu scope global; fungsi saling memanggil lewat namanya.
3. **Urutan `<script>` di `www/index.html` = urutan eksekusi.** Memanggil fungsi dari file lain aman selama pemanggilannya terjadi *setelah semuanya dimuat* (klik, timer, `_kotobaBoot`). Yang dilarang: kode top-level (jalan saat load) yang memakai sesuatu dari file yang dimuat **belakangan**.
4. **Setelah mengubah apa pun, jalankan:** `cd tools && node check.cjs`
5. **Satu file = satu tanggung jawab.** Target kurang dari ±500 baris; kalau lebih, pecah.

---

## 1. Peta folder

### `www/css/` — gaya (urutan muat = urutan di tabel)

| File | Isi |
|---|---|
| `base.css` | variabel warna (`:root`), reset, body, overlay CRT, `.container`, keyframes dasar |
| `components.css` | header, tombol, kartu, bar XP/progress, form, marquee |
| `progression.css` | achievement, misi harian, level-up, toast, streak |
| `misc.css` | block-grid, corner-deco, ticker, ringkasan, furigana |
| `shop.css` | kartu toko, tab toko, koin |
| `stats.css` | panel statistik, bar progres, buff |
| `notes.css` | catatan, tanda bintang, modal catatan |
| `game.css` | HUD dalam game, indikator senjata, bar core score |
| `briefing.css` | daftar tingkat pemahaman kotoba (Intel Briefing) |

### `www/js/core/` — fondasi (state, simpan, navigasi, boot)

| File | Isi |
|---|---|
| `app-root.js` | `const app` (elemen `#app` tempat semua layar dirender) |
| `audio.js` | `_SFX` (efek suara) |
| `core-score.js` | fungsi skor inti (`getCoreScore`, `isMasteredKotoba`, …). **Dimuat paling awal, jangan dipindah** |
| `state.js` | `lsGet()` + data inti: `profiles`, `globalStats`, `playedGroups`, `achievements`, `dailyMissions`, `globalProfile` |
| `state-settings.js` | state sesi/efek + pengaturan tampilan (`appLang`, `sfxVolume`, `uiScale`, `example*`, …) |
| `state-shop.js` | `shopData` |
| `state-flags.js` | flag mode/opsi (`srsEnabled`, `secondChance`, `uiMode`, `quiz*`, …) |
| `utils.js` | helper kecil umum (`levenshtein`, `fmtNum`, …) |
| `i18n.js` | kamus `T` (`jp`/`en`) + `t(key)` |
| `storage.js` | `saveAll()` (debounce 200 ms), `saveAllNow()`, `_flushSave()` |
| `native-save.js` | simpan ke file di Android (Capacitor); `HAS_CAPACITOR` |
| `backup.js` | enkripsi backup + bagikan ke Drive |
| `theme-apply.js` | `applyTheme()` |
| `navigation.js` | stack tombol Back; daftar `_screenNames` |
| `event-dispatcher.js` | satu `click` listener: `data-action` → `switch` |
| `input-events.js`, `gamepad.js` | keyboard & gamepad |
| `adventure-stubs.js`, `boot-init.js`, `boot.js` | stub, inisialisasi, `_kotobaBoot()` (**paling akhir**) |

### `www/js/data/` — konstanta/daftar murni (tanpa logika UI)
`game-data.js` (`WEAPON_*`, `EFFECT_ITEMS`, `EMBLEM_ITEMS`, `CROWN_*`, `ACH_BASE`), `themes.js` (`UI_THEMES`), `reset-achievements.js`.

### `www/js/systems/` — logika/mekanik tanpa layar sendiri
`progression.js` (XP/level), `achievements.js`, `missions.js` (`MISSION_POOL`), `weapons.js`, `upgrades.js`, `notes-marks.js`, `kotoba-parser.js`, `learning-analytics.js`, `daily-review.js`, `daily-log.js`, `final-test.js`, `srs-rank.js`.

### `www/js/screens/` — satu file ≈ satu layar (`renderXxx()`)
`menu`, `profile`, `profile-actions`, `global-profile`, `stats`, `history`, `summary`, `achievements`, `progress-hub`, `analyst`, `how-to-play`, `group-select`, `custom-group-pick`, `mode-select`, `briefing`, `kotoba-db`, `manage-grub`, `manage-grub-free`, `share`.

### `www/js/game/` — loop & cara menjawab
`game-loop`, `process-answer`, `choice-options`, `render-choice`, `row-mode`, `sort-mode`.

### `www/js/fx/` — efek visual saat bermain
`weapon-fx`, `crit-flash`, `mode-overlays`, `ascend`, `answer-effects`, `stylish-rank`.

### `www/js/shop/` — toko
`shop-screen`, `shop-actions`, `theme-render`, `admin-coins`.

### `www/js/quiz/` — kuis & kalimat contoh
`quiz-import`, `quiz-game`, `quiz-modals`, `example-sentences`, `sentence-test`.

### `www/js/ui/`
`streak-levelup-xpbar.js` (komponen UI kecil yang dipakai banyak layar).

---

## 2. Tabel keputusan: "Mau … → taruh di …"

| Mau menambah/mengubah | Taruh di |
|---|---|
| Layar/halaman baru | `js/screens/<nama>.js` (+ CSS di file css yang cocok) — lihat §3 |
| Mekanik/logika baru tanpa layar | `js/systems/<nama>.js` |
| Daftar/konstanta baru (item, harga, tabel) | `js/data/` (`game-data.js` atau file baru) |
| Teks/label tombol | `js/core/i18n.js` — **isi `jp` DAN `en`** |
| Mode menjawab baru | `js/game/<mode>.js` + hubungkan di `process-answer.js` / `mode-select.js` |
| Efek visual/animasi saat bermain | `js/fx/` |
| Suara | `js/core/audio.js` (`_SFX`) |
| Senjata baru | data → `data/game-data.js`; logika → `systems/weapons.js`; efek → `fx/weapon-fx.js` |
| Item toko / harga | data → `data/game-data.js`; tampilan → `shop/shop-screen.js`; beli → `shop/shop-actions.js` |
| Tema UI baru | `data/themes.js` (`UI_THEMES`, CSS tema di properti `css`) + kartu di `shop/theme-render.js` |
| Achievement baru | definisi → `systems/achievements.js`; tampilan → `screens/achievements.js` |
| Misi harian baru | `systems/missions.js` (`MISSION_POOL`) |
| Tombol/aksi klik baru | `core/event-dispatcher.js` (tambah `case`) |
| Helper kecil serbaguna | `core/utils.js` |
| Keyboard / gamepad | `core/input-events.js` / `core/gamepad.js` |
| Variabel yang harus **disimpan** | lihat §4 |
| Variabel sementara (hilang saat tutup app) | `core/state-settings.js` |

Kalau tidak ada yang cocok: buat file baru di folder terdekat (§6), jangan menjejalkan ke file yang sudah >500 baris.

---

## 3. UI: layar, tombol, gaya

### Pola sebuah layar
Setiap layar adalah fungsi `renderXxx()` yang mengisi `app.innerHTML`:

```js
/* ── CONTOH ── */
function renderContoh(){
  let isJP = appLang === 'jp';
  app.innerHTML = `<div class="container">
    <div class="ark-header">
      <button class="back" data-action="goBack">${t('back')}</button>
      <div class="ark-title">${t('contohTitle')}</div>
    </div>
    <button data-action="contohAksi:${id}">${t('contohTombol')}</button>
  </div>`;
}
```

### Checklist layar baru
1. Buat `js/screens/contoh.js` dengan `renderContoh()`.
2. Daftarkan `<script>` di `index.html` (§6).
3. **Tambahkan `"renderContoh"` ke `_screenNames` di `core/navigation.js`** — kalau tidak, tombol Back tidak akan kembali ke layar ini.
4. Tombol: `data-action="nama:arg1:arg2"` → tambah `case "nama":` di `core/event-dispatcher.js` (argumen = `args[0]`, `args[1]`, …).
5. Jika aksi itu berpindah layar, tambahkan namanya ke `navActions` di dispatcher (penangkal ghost-tap).
6. Teks lewat `t('kunci')`; tambah kunci di `T.jp` dan `T.en`.
7. Tambahkan tombol masuknya di `screens/menu.js` (atau layar induk).

### Mengubah tampilan — taruh di mana?
| Yang diubah | Tempat |
|---|---|
| Warna global / variabel (`--accent`, `--bg-card`) | `css/base.css` (`:root`) |
| Tombol, kartu, header, bar | `css/components.css` |
| Toko | `css/shop.css` |
| Statistik | `css/stats.css` |
| Catatan/bintang | `css/notes.css` |
| HUD saat bermain | `css/game.css` |
| Achievement/misi/toast/level-up | `css/progression.css` |
| Struktur HTML sebuah layar | fungsi `render…` di `js/screens/` |
| Tema yang bisa dibeli | `data/themes.js` (properti `css` ditimpa ke `#active-theme-style`) |

Gaya baru: pakai **class** di file CSS, hindari `style="…"` panjang di template.

---

## 4. Penyimpanan

### Peta alur simpan
```
state.js / state-flags.js / state-shop.js   ← baca awal:  lsGet("kunci", default)
storage.js  _flushSave()                    ← tulis:      localStorage.setItem("kunci", JSON.stringify(x))
                                              lalu panggil queueNativeSaveSync()
native-save.js                              ← Android: cermin ke file Documents/KotobaTrainer/kotoba_savedata.json
screens/share.js  _buildFullBackupPayload() ← ekspor backup (satu objek, ada _version)
screens/share.js  _applyFullBackupPayload() ← pulihkan backup (semua langkah dalam try/catch)
core/backup.js                              ← enkripsi (_ENC_KEY) + bagikan ke Drive
```
Panggil `saveAll()` setelah mengubah data (ditunda 200 ms); `saveAllNow()` bila harus langsung (akhir sesi, pindah layar).

### Data milik siapa?
| Jenis data | Letak |
|---|---|
| Data per profil (kata, skor, catatan, `coreScore`, `correct`, `wrong`) | di dalam `profiles[nama]` |
| Statistik global (XP, level, hari main) | `globalStats` / `globalProfile` |
| Toko & kosmetik | `shopData` |
| Opsi/pengaturan | variabel di `state-flags.js` → ikut `settings` di backup |

> **Cara termudah menambah data baru:** tambahkan *field* di dalam objek yang sudah disimpan (`profiles`, `globalStats`, `shopData`, …). Objek itu sudah disimpan **dan** masuk backup, jadi §4 langkah 2–3 tidak perlu. Buat kunci `localStorage` baru hanya jika benar-benar mandiri.

### Resep: variabel baru yang harus disimpan (kunci baru)
1. **Deklarasi** — `let namaBaru = lsGet("namaBaru", nilaiDefault);`
   di `state-flags.js` (opsi/mode), `state.js` (data inti), atau `state-shop.js` (toko).
   Untuk objek yang bisa bertambah field, gabung dengan default: `Object.assign({…default…}, lsGet("namaBaru", {}))`.
2. **Simpan** — tambah `localStorage.setItem("namaBaru", JSON.stringify(namaBaru));` di `_flushSave()` (`core/storage.js`).
3. **Backup** — tambah ke `_buildFullBackupPayload()` (opsi → di dalam `settings`; data → level atas) dan pulihkan di `_applyFullBackupPayload()` dengan pengaman:
   `if(decoded.settings && decoded.settings.namaBaru !== undefined) namaBaru = decoded.settings.namaBaru;`
   Backup lama tidak punya field ini, jadi **jangan** menganggapnya pasti ada.
4. **Skema berubah besar** — naikkan `_version` di payload dan pertahankan kompatibilitas mundur.
5. Panggil `saveAll()` di tempat nilai itu berubah.

### Jangan
- Jangan ubah `_ENC_KEY` (backup lama jadi tidak bisa dibuka).
- Jangan menulis `localStorage` langsung dari file layar; ubah variabel lalu `saveAll()`.
- Jangan membaca `Capacitor`/`Filesystem` di luar `native-save.js` dan `backup.js`.

---

## 5. Resep end-to-end: "fitur baru X"

1. **Data** (kalau ada daftar/konstanta) → `js/data/`.
2. **Logika** → `js/systems/x.js` (fungsi murni dulu; UI belakangan).
3. **Simpan** (kalau perlu) → §4.
4. **Layar** → `js/screens/x.js`, daftarkan di `_screenNames`, `data-action` + `case` (§3).
5. **Teks** → `i18n.js` (jp + en).
6. **Gaya** → file css yang cocok (§3).
7. **Efek/suara** (opsional) → `fx/`, `audio.js`.
8. **Daftarkan file** di `index.html` (§6), lalu `node check.cjs`.
9. **Uji**: buka `www/index.html`, mulai satu sesi, simpan → muat ulang → data tetap ada.

---

## 6. Menambah file baru

1. Buat file di folder yang tepat (§1). Nama: `kebab-case.js`, isi sesuai nama.
2. Tambahkan `<script src="js/…/nama.js"></script>` di `www/index.html`:
   - File yang hanya berisi **deklarasi fungsi** → taruh bersama file sejenis, **sebelum** `js/core/boot.js`.
   - File dengan `let/const` top-level atau kode yang jalan saat load → taruh **setelah** semua file yang dipakainya.
   - File data konstanta yang dipakai kode saat load → taruh **sebelum** pemakainya.
   - `boot.js` tetap **paling akhir**.
3. CSS baru → `<link rel="stylesheet" href="css/nama.css">` setelah css yang ditimpanya.
4. `cd tools && node check.cjs` — harus `SEMUA PEMERIKSAAN LULUS`.

Perlu diingat:
- Nama fungsi/`const`/`let` top-level **harus unik di seluruh proyek** (`check.cjs` menandai duplikat).
- `function` dan `var` top-level menjadi properti `window`; `let/const` tidak. Perilaku ini sama dengan versi satu-file.
- Tidak boleh `export`/`import`/`require` di `www/`.

---

## 7. Konvensi

- Layar: `renderNama()`. Helper privat: awali `_`.
- Judul blok: `/* ── NAMA BLOK ── */`.
- Kunci i18n: camelCase; selalu pasangan `jp` + `en`.
- Satu file ±500 baris maksimum.
- Hindari kode top-level yang jalan saat load di luar file `state*`, `boot*`, dan `app-root` — letakkan di dalam fungsi dan panggil dari `_kotobaBoot()`.

---

## 8. Perintah & rilis

| Perintah (dari `tools/`) | Kapan |
|---|---|
| `node check.cjs` | **Setiap habis edit.** Cek file terdaftar, sintaks, deklarasi ganda, urutan muat |
| `node verify-split.cjs --dir www` | Hanya bila `www/` belum diedit: membuktikan hasil pecahan = file asli |
| `node analyze.cjs` | Laporan statis file asli (hazard urutan muat) |

Rilis Android: dari root proyek `npx cap sync android` (menyalin `www/` ke `android/app/src/main/assets/public/`), lalu build di Android Studio.
**Jangan edit** `android/.../assets/public/` — akan ditimpa. `tools/` dan `_backup/` bukan bagian APK.
