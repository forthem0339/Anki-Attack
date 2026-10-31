# \# ⚔️ Anki Attack — Kotoba Trainer Pro

# 

# Game belajar kosakata Jepang bergaya \*\*RPG\*\*: setiap jawaban benar memberi XP dan koin, kamu naik level, membeli senjata \& efek, menyelesaikan misi harian, dan membuka achievement. Kosakata kamu sendiri (kanji, hiragana, arti) diimpor ke dalam game, jadi isinya bisa disesuaikan dengan materi yang sedang kamu pelajari.

# 

# Berjalan sebagai \*\*satu halaman web\*\* (HTML/JavaScript tanpa framework) dan dibungkus sebagai \*\*aplikasi Android\*\* dengan \[Capacitor](https://capacitorjs.com/) (`com.game.kotoba`).

# 

# \---

# 

# \## ✨ Fitur

# 

# \### Mode permainan

# | Mode | Cara kerja |

# |---|---|

# | \*\*Pilihan Ganda\*\* | Pilih jawaban benar dari 4 opsi. Cocok untuk belajar cepat. |

# | \*\*Input Manual\*\* | Ketik jawabannya sendiri. Lebih menguatkan ingatan. |

# | \*\*Susun Huruf\*\* | Susun huruf yang teracak menjadi kata yang benar. |

# | \*\*Row (Baris)\*\* | Semua kata antrean tampil dalam satu baris, dijawab satu per satu. Hijau = benar, merah = salah, abu-abu = belum dijawab. |

# | \*\*Hardcore\*\* | Ada timer dan 4 nyawa (❤❤❤❤). Jawaban salah mengurangi 15 XP. Menang tanpa mati membuka achievement \*Speedster\*. |

# 

# Mode pilihan ganda, input manual, dan susun huruf punya 4 arah soal: \*\*Kanji→Hiragana, Kanji→Arti, Hiragana→Kanji, Arti→Kanji\*\*. (Di \*Global Mode\* hanya ada Kata→Arti dan Arti→Kata.)

# 

# \### Modifier (bisa dinyalakan satu per satu di layar pengaturan game)

# \- 🎲 \*\*Random Distractors\*\* — pilihan salah diambil dari kanji/bacaan yang paling mirip di seluruh kosakatamu. \*\*+30% XP\*\*

# \- 🌀 \*\*Bamboozle\*\* — semua opsi dibuat sangat mirip jawaban asli. \*\*+20% XP\*\*

# \- 🔄 \*\*Second Chance\*\* — kata yang salah diulang lagi di sesi yang sama.

# \- 🧠 \*\*Spaced Repetition (SRS)\*\* — jadwal ulang per kata memakai algoritma SM-2.

# \- 🎯 \*\*Hard Focus\*\* — kata yang paling lemah muncul dengan bobot 4×.

# \- 👁 \*\*Show Question First\*\* — (pilihan ganda) opsi disembunyikan sampai kamu mengetuk.

# \- 🕶 \*\*Secret Answer\*\* — menyembunyikan combo, CRIT, dan notifikasi lain selama bermain; hasil ditampilkan di laporan akhir sesi.

# \- 🗂 \*\*Custom Kotoba\*\* — hanya kata dari grup kustom yang aktif yang diujikan.

# 

# \### Progres \& RPG

# \- \*\*XP, level, combo, CRIT\*\* serta streak login harian.

# \- \*\*Daily Missions\*\* dan \*\*Daily Kotoba Review\*\* (sesi 50/100/150/200 kata dari kata yang pernah kamu lihat, berganti setiap hari).

# \- \*\*Achievement\*\* (mulai dari \*First Blood\* sampai \*Supreme Class\*) dengan bonus XP.

# \- \*\*Prestige Reset\*\*: setelah semua achievement selesai, kamu bisa reset untuk tingkat kesulitan lebih tinggi (hingga 4×).

# \- \*\*Leech detection\*\*: kata yang sering salah ditandai sebagai kata bermasalah.

# \- \*\*Final Test\*\* (ujian akhir blok kosakata) dan \*\*Analyst\*\* (analisis data belajar dan riwayat harian).

# 

# \### Toko

# \- \*\*Senjata\*\* tier Common → Rare → Epic → Legendary, mis. Bonk, Katana, Bomb, Light Saber, Sword, Rebellion, dan Crystal (3 slot senjata sekaligus).

# \- \*\*Efek visual\*\*: Slash, Beam, Sakura, Neon, Fire, Void, Ascend, dan lainnya.

# \- \*\*Emblem\*\* (XP, Coin, Crit, Advance, Combo).

# \- \*\*7 tema UI\*\*: Arknights, Devil May Cry, Black \& White, Classic RPG, Cyberpunk, Arknights V2, Duolingo.

# 

# \### Alat bantu belajar

# \- 📝 \*\*Catatan\*\* pada setiap kata dan ⭐ \*\*tanda bintang\*\* (dengan filter).

# \- \*\*Intel Briefing\*\* (daftar kata beserta tingkat penguasaan) dan \*\*Vocabulary Database\*\*.

# \- \*\*Riwayat sesi\*\* dan \*\*Combat Records\*\* (statistik).

# \- Dukungan \*\*keyboard dan gamepad\*\*.

# \- Antarmuka \*\*Bahasa Jepang / Inggris\*\* (tombol JP/EN).

# \- \*\*Backup \& Restore\*\* terenkripsi (`.ktb`), bisa dibagikan ke Google Drive. Di Android, data juga dicerminkan ke file `Documents/KotobaTrainer/kotoba\_savedata.json`.

# \- Pengaturan volume suara, ukuran UI, dan ukuran font.

# 

# \---

# 

# \## 🕹️ Cara Pakai

# 

# \### 1. Menjalankan

# \*\*Di browser:\*\* buka `www/index.html` (klik dua kali atau jalankan server lokal, misalnya `npx serve www`).

# 

# \*\*Di Android:\*\* lihat bagian \[Build Android](#-build-android).

# 

# \### 2. Membuat profil \& mengimpor kosakata

# 1\. Dari menu utama pilih \*\*Start Game\*\*.

# 2\. Pilih \*\*+ NEW OPERATOR\*\*, lalu pilih salah satu: \*\*Choose CSV File\*\*, \*\*Import from Text\*\*, atau \*\*Free Mode\*\*.

# 3\. Isi nama operator.

# 4\. Pilih file CSV/TXT atau tempel teksnya, lalu tekan \*\*Import\*\*.

# 

# \*\*Format Mode Jepang\*\* (3 kolom, dipisah koma, satu kata per baris):

# ```

# 日本語,にほんご,Japanese language

# 学校,がっこう,school

# 食べる,たべる,to eat

# ```

# 

# \*\*Format Global Mode\*\* (kolom ke-2 diabaikan, isi dengan `-`):

# ```

# apple,-,りんご

# 運動,-,exercise

# ```

# Baris header seperti `kanji,...` atau `漢字,...` dilewati otomatis.

# 

# \### 3. Bermain

# 1\. Pilih profil, lalu pilih \*\*grup/blok kata\*\* (atau jumlah kustom / semua kata).

# 2\. Pilih \*\*mode\*\* dan arah soal, lalu aktifkan modifier yang diinginkan.

# 3\. Jawab soal. Combo dan CRIT menambah XP, sedangkan koin dipakai di toko.

# 4\. Setelah sesi selesai, lihat grade, akurasi, XP yang didapat, dan achievement baru.

# 

# \### 4. Membuat grup kata kustom

# 1\. Buka \*\*Intel Briefing\*\* → tab \*\*🗂 CUSTOM\*\*.

# 2\. Tekan \*\*+ New\*\*, beri nama, centang kata, lalu simpan.

# 3\. Nyalakan grup yang ingin dipakai.

# 4\. Aktifkan modifier \*\*Custom Kotoba\*\* sebelum bermain.

# 

# \### 5. Impor kalimat contoh / kuis (opsional)

# Tersedia di fitur kuis, file `.txt` atau tempel teks, dicocokkan otomatis dengan kata yang sudah ada berdasarkan kanji:

# \- Kalimat contoh: `$漢字 $\*kalimat $\*\*furigana $\*\*\*arti`

# \- Kuis: `/kanji //soal ///jawaban \*\*a|b|c ////penjelasan`

# 

# \### 6. Backup progres

# Menu \*\*Backup \& Restore\*\* → ekspor ke file `.ktb` (terenkripsi) atau JSON, atau bagikan ke Drive. Pulihkan dari menu yang sama.

# 

# > Progres disimpan di `localStorage` browser. Membersihkan data browser akan menghapusnya, jadi buat backup secara berkala.

# 

# \---

# 

# \## 📱 Build Android

# 

# Prasyarat: Node.js, Android Studio (SDK 36), JDK sesuai Android Studio.

# 

# ```bash

# npm install

# npx cap sync android     # menyalin www/ ke android/app/src/main/assets/public/

# npx cap open android     # buka di Android Studio, lalu Run / Build APK

# ```

# 

# Konfigurasi: `capacitor.config.json` (`appId: com.game.kotoba`, `webDir: www`). `minSdk 24`.

# Folder `android/app/src/main/assets/public/` dibuat otomatis dan tidak disimpan di Git. File `android/local.properties` (path SDK lokal) juga tidak ikut.

# 

# \---

# 

# \## 🗂️ Struktur Proyek

# 

# ```

# www/                 # sumber game (HTML/JS/CSS)

# android/             # proyek Android (Capacitor)

# tools/               # skrip analisis kode (Node)

# \_backup/             # cadangan file asli index.original.html

# ARSITEKTUR.md        # panduan: kode/data/gaya baru harus ditaruh di mana

# capacitor.config.json

# ```

# 

# Untuk berkontribusi atau menambah fitur, baca \*\*\[ARSITEKTUR.md](ARSITEKTUR.md)\*\*. Dokumen itu menjelaskan aturan penempatan kode, cara menambah layar, item toko, dan data tersimpan.

# 

# \---

# 

# \## 📄 Lisensi

# Belum ditentukan. Tambahkan file `LICENSE` bila ingin membagikannya secara terbuka.

