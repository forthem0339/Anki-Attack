'use strict';
/**
 * MANIFEST PEMECAHAN index.html
 *
 * Setiap entri = satu file hasil pecahan, diambil UTUH (tanpa diubah satu byte pun) dari
 * rentang baris [from..to] (1-based, inklusif) di _backup/index.original.html.
 *
 *  - Urutan array = URUTAN MUAT di index.html (tag <script>/<link> ditulis sesuai urutan ini).
 *  - Semua rentang harus saling menyambung tanpa celah/tumpang-tindih (diverifikasi otomatis).
 *  - Satu-satunya pengecualian urutan: js/core/core-score.js (asli L7235-7253) dimuat LEBIH AWAL.
 *    Alasan: IIFE syncGlobalKotoba (asli L438-444) memanggil isMasteredKotoba() saat load. Di satu
 *    <script> itu aman karena deklarasi fungsi di-hoist; setelah dipecah, definisinya harus sudah
 *    ada lebih dulu. Isinya murni deklarasi fungsi (tanpa efek saat load), jadi aman dipindah.
 */

const css = [
  { file: 'css/base.css',         from: 14,  to: 39  }, // token warna, reset, body, overlay CRT, .container, keyframes dasar
  { file: 'css/components.css',   from: 40,  to: 115 }, // header, tombol, kartu, bar XP/progress, form, marquee
  { file: 'css/progression.css',  from: 116, to: 152 }, // achievement, misi harian, level-up, toast, streak
  { file: 'css/misc.css',         from: 153, to: 159 }, // block-grid, corner-deco, ticker, ringkasan, furigana
  { file: 'css/shop.css',         from: 160, to: 173 }, // kartu toko, tab toko, koin
  { file: 'css/stats.css',        from: 174, to: 213 }, // panel statistik, bar progres, buff
  { file: 'css/notes.css',        from: 214, to: 237 }, // catatan, tanda bintang, modal catatan
  { file: 'css/game.css',         from: 238, to: 254 }, // HUD dalam game, indikator senjata, bar core score
  { file: 'css/briefing.css',     from: 255, to: 267 }, // daftar tingkat pemahaman kotoba (Intel Briefing)
];

const js = [
  // ── PRASYARAT ──────────────────────────────────────────────────────────────
  { file: 'js/core/app-root.js',            from: 275,   to: 276,   group: 'PRASYARAT' },
  { file: 'js/core/audio.js',               from: 277,   to: 356,   group: 'PRASYARAT' },
  { file: 'js/core/core-score.js',          from: 7235,  to: 7253,  group: 'PRASYARAT', moved: true },

  // ── STATE & PENYIMPANAN ───────────────────────────────────────────────────
  { file: 'js/core/state.js',               from: 357,   to: 480,   group: 'STATE & PENYIMPANAN' },
  { file: 'js/systems/daily-log.js',        from: 481,   to: 540,   group: 'STATE & PENYIMPANAN' },
  { file: 'js/core/state-settings.js',      from: 541,   to: 580,   group: 'STATE & PENYIMPANAN' },
  { file: 'js/core/state-shop.js',          from: 581,   to: 629,   group: 'STATE & PENYIMPANAN' },
  { file: 'js/core/utils.js',               from: 630,   to: 660,   group: 'STATE & PENYIMPANAN' },
  { file: 'js/core/state-flags.js',         from: 661,   to: 695,   group: 'STATE & PENYIMPANAN' },
  { file: 'js/core/i18n.js',                from: 696,   to: 858,   group: 'STATE & PENYIMPANAN' },
  { file: 'js/data/reset-achievements.js',  from: 859,   to: 867,   group: 'STATE & PENYIMPANAN' },
  { file: 'js/core/storage.js',             from: 868,   to: 929,   group: 'STATE & PENYIMPANAN' },
  { file: 'js/core/native-save.js',         from: 930,   to: 993,   group: 'STATE & PENYIMPANAN' },
  { file: 'js/core/backup.js',              from: 994,   to: 1132,  group: 'STATE & PENYIMPANAN' },

  // ── PROGRESI & DATA GAME ──────────────────────────────────────────────────
  { file: 'js/systems/progression.js',      from: 1133,  to: 1308,  group: 'PROGRESI & DATA GAME' },
  { file: 'js/data/game-data.js',           from: 1309,  to: 1424,  group: 'PROGRESI & DATA GAME' },
  { file: 'js/systems/achievements.js',     from: 1425,  to: 1503,  group: 'PROGRESI & DATA GAME' },
  { file: 'js/systems/missions.js',         from: 1504,  to: 1575,  group: 'PROGRESI & DATA GAME' },
  { file: 'js/ui/streak-levelup-xpbar.js',  from: 1576,  to: 1610,  group: 'PROGRESI & DATA GAME' },
  { file: 'js/data/themes.js',              from: 1611,  to: 1975,  group: 'PROGRESI & DATA GAME' },

  // ── TOKO, SENJATA & UPGRADE ───────────────────────────────────────────────
  { file: 'js/shop/theme-render.js',        from: 1976,  to: 2344,  group: 'TOKO, SENJATA & UPGRADE' },
  { file: 'js/shop/shop-screen.js',         from: 2345,  to: 2865,  group: 'TOKO, SENJATA & UPGRADE' },
  { file: 'js/shop/shop-actions.js',        from: 2866,  to: 3027,  group: 'TOKO, SENJATA & UPGRADE' },
  { file: 'js/systems/weapons.js',          from: 3028,  to: 3500,  group: 'TOKO, SENJATA & UPGRADE' },
  { file: 'js/systems/upgrades.js',         from: 3501,  to: 3661,  group: 'TOKO, SENJATA & UPGRADE' },
  { file: 'js/shop/admin-coins.js',         from: 3662,  to: 3706,  group: 'TOKO, SENJATA & UPGRADE' },

  // ── PROFIL GLOBAL, CATATAN & KUIS ─────────────────────────────────────────
  { file: 'js/screens/global-profile.js',   from: 3707,  to: 3759,  group: 'CATATAN & KUIS' },
  { file: 'js/systems/notes-marks.js',      from: 3760,  to: 3910,  group: 'CATATAN & KUIS' },
  { file: 'js/quiz/quiz-import.js',         from: 3911,  to: 4111,  group: 'CATATAN & KUIS' },
  { file: 'js/quiz/example-sentences.js',   from: 4112,  to: 4337,  group: 'CATATAN & KUIS' },
  { file: 'js/quiz/quiz-modals.js',         from: 4338,  to: 4664,  group: 'CATATAN & KUIS' },
  { file: 'js/quiz/quiz-game.js',           from: 4665,  to: 5328,  group: 'CATATAN & KUIS' },
  { file: 'js/quiz/sentence-test.js',       from: 5329,  to: 5624,  group: 'CATATAN & KUIS' },

  // ── LAYAR UTAMA & PROFIL ──────────────────────────────────────────────────
  { file: 'js/screens/menu.js',             from: 5625,  to: 5857,  group: 'LAYAR UTAMA & PROFIL' },
  { file: 'js/screens/analyst.js',          from: 5858,  to: 6068,  group: 'LAYAR UTAMA & PROFIL' },
  { file: 'js/screens/how-to-play.js',      from: 6069,  to: 6432,  group: 'LAYAR UTAMA & PROFIL' },
  { file: 'js/screens/progress-hub.js',     from: 6433,  to: 6705,  group: 'LAYAR UTAMA & PROFIL' },
  { file: 'js/screens/achievements.js',     from: 6706,  to: 6822,  group: 'LAYAR UTAMA & PROFIL' },
  { file: 'js/screens/profile.js',          from: 6823,  to: 6960,  group: 'LAYAR UTAMA & PROFIL' },
  { file: 'js/systems/kotoba-parser.js',    from: 6961,  to: 7014,  group: 'LAYAR UTAMA & PROFIL' },
  { file: 'js/systems/learning-analytics.js', from: 7015, to: 7234, group: 'LAYAR UTAMA & PROFIL' },
  // (L7235-7253 = js/core/core-score.js, dimuat lebih awal)
  { file: 'js/screens/profile-actions.js',  from: 7254,  to: 7313,  group: 'LAYAR UTAMA & PROFIL' },

  // ── PEMILIHAN MISI, MODE & UJIAN ──────────────────────────────────────────
  { file: 'js/screens/group-select.js',     from: 7314,  to: 7726,  group: 'PEMILIHAN MISI, MODE & UJIAN' },
  { file: 'js/systems/daily-review.js',     from: 7727,  to: 8023,  group: 'PEMILIHAN MISI, MODE & UJIAN' },
  { file: 'js/screens/custom-group-pick.js',from: 8024,  to: 8242,  group: 'PEMILIHAN MISI, MODE & UJIAN' },
  { file: 'js/screens/mode-select.js',      from: 8243,  to: 8778,  group: 'PEMILIHAN MISI, MODE & UJIAN' },
  { file: 'js/systems/final-test.js',       from: 8779,  to: 9232,  group: 'PEMILIHAN MISI, MODE & UJIAN' },
  { file: 'js/screens/briefing.js',         from: 9233,  to: 10068, group: 'PEMILIHAN MISI, MODE & UJIAN' },

  // ── GAME LOOP & EFEK ──────────────────────────────────────────────────────
  { file: 'js/game/game-loop.js',           from: 10069, to: 10340, group: 'GAME LOOP & EFEK' },
  { file: 'js/fx/weapon-fx.js',             from: 10341, to: 11138, group: 'GAME LOOP & EFEK' },
  { file: 'js/fx/crit-flash.js',            from: 11139, to: 11365, group: 'GAME LOOP & EFEK' },
  { file: 'js/fx/mode-overlays.js',         from: 11366, to: 11580, group: 'GAME LOOP & EFEK' },
  { file: 'js/fx/ascend.js',                from: 11581, to: 11742, group: 'GAME LOOP & EFEK' },
  { file: 'js/fx/answer-effects.js',        from: 11743, to: 12231, group: 'GAME LOOP & EFEK' },
  { file: 'js/fx/stylish-rank.js',          from: 12232, to: 12397, group: 'GAME LOOP & EFEK' },
  { file: 'js/game/process-answer.js',      from: 12398, to: 12855, group: 'GAME LOOP & EFEK' },

  // ── RINGKASAN, STATISTIK & DATABASE KATA ──────────────────────────────────
  { file: 'js/screens/summary.js',          from: 12856, to: 13057, group: 'STATISTIK & DATABASE KATA' },
  { file: 'js/screens/stats.js',            from: 13058, to: 13696, group: 'STATISTIK & DATABASE KATA' },
  { file: 'js/screens/kotoba-db.js',        from: 13697, to: 13968, group: 'STATISTIK & DATABASE KATA' },
  { file: 'js/screens/manage-grub.js',      from: 13969, to: 14249, group: 'STATISTIK & DATABASE KATA' },
  { file: 'js/screens/manage-grub-free.js', from: 14250, to: 14547, group: 'STATISTIK & DATABASE KATA' },

  // ── BERBAGI/BACKUP & MODE PERMAINAN ───────────────────────────────────────
  { file: 'js/screens/share.js',            from: 14548, to: 15045, group: 'BACKUP & MODE PERMAINAN' },
  { file: 'js/systems/srs-rank.js',         from: 15046, to: 15113, group: 'BACKUP & MODE PERMAINAN' },
  { file: 'js/game/choice-options.js',      from: 15114, to: 15330, group: 'BACKUP & MODE PERMAINAN' },
  { file: 'js/game/render-choice.js',       from: 15331, to: 15547, group: 'BACKUP & MODE PERMAINAN' },
  { file: 'js/game/row-mode.js',            from: 15548, to: 15628, group: 'BACKUP & MODE PERMAINAN' },
  { file: 'js/game/sort-mode.js',           from: 15629, to: 15998, group: 'BACKUP & MODE PERMAINAN' },

  // ── RIWAYAT, TEMA, NAVIGASI, INPUT & BOOT ─────────────────────────────────
  { file: 'js/screens/history.js',          from: 15999, to: 16047, group: 'NAVIGASI, INPUT & BOOT' },
  { file: 'js/core/theme-apply.js',         from: 16048, to: 16056, group: 'NAVIGASI, INPUT & BOOT' },
  { file: 'js/core/adventure-stubs.js',     from: 16057, to: 16088, group: 'NAVIGASI, INPUT & BOOT' },
  { file: 'js/core/boot-init.js',           from: 16089, to: 16093, group: 'NAVIGASI, INPUT & BOOT' },
  { file: 'js/core/navigation.js',          from: 16094, to: 16253, group: 'NAVIGASI, INPUT & BOOT' },
  { file: 'js/core/event-dispatcher.js',    from: 16254, to: 16369, group: 'NAVIGASI, INPUT & BOOT' },
  { file: 'js/core/input-events.js',        from: 16370, to: 16435, group: 'NAVIGASI, INPUT & BOOT' },
  { file: 'js/core/gamepad.js',             from: 16436, to: 16569, group: 'NAVIGASI, INPUT & BOOT' },
  { file: 'js/core/boot.js',                from: 16570, to: 16614, group: 'NAVIGASI, INPUT & BOOT' },
];

module.exports = { css, js };
