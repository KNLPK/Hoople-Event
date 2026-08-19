# Hoople — Mock JSON Response (DTO)

Contoh response API untuk seluruh permukaan aplikasi Hoople. Dua kegunaannya:

1. **Acuan tim backend** saat membangun endpoint di Bruno/Postman — bentuk payload,
   nama field, enum, dan shape error sudah ditetapkan di sini.
2. **Mock data frontend** sementara endpoint asli belum siap. Nanti tinggal ganti
   import file JSON dengan `fetch` ke URL sungguhan; bentuk datanya tidak berubah.

95 file JSON, tersusun jadi **tiga section + satu inti bersama**. Seluruhnya lolos audit otomatis: parse, envelope, camelCase,
casing enum, bentuk uang, format tanggal, aritmetika pagination, dan integritas
referensi id/slug. Lihat [Hasil audit](#6-hasil-audit-finalisasi).

---

## 0. Tiga section, satu inti bersama

Hoople akan dipecah jadi **tiga website terpisah**, jadi kontraknya disusun
begitu juga. Setiap section bisa diserahkan ke tim yang berbeda tanpa saling
menunggu.

```
dto/
  shared/       ← dipakai ketiganya
    common/     envelope, pagination, enum, semua bentuk error
    auth/       login, register, refresh, /auth/me
    media/      unggah gambar
  participant/  ← Website 1 — situs peserta
    catalog/ bookings/ saved/ payments/ content/
  organizer/    ← Website 2 — konsol penyelenggara
  teams/        ← Website 3 — konsol event internal perusahaan
```

**Kenapa ada `shared/` dan bukan tiga section bulat-bulat.** Autentikasi, bentuk
error, dan daftar enum dibutuhkan ketiga situs. Menyalinnya tiga kali justru
sumber utama perbedaan versi di kemudian hari — satu situs memperbaiki enum,
dua lainnya tidak. Jadi `shared/` bukan pelanggaran pemisahan; itu justru yang
menjaganya.

### Pembagian jalur URL

| Section | Awalan | Jumlah endpoint | Autentikasi |
| --- | --- | --- | --- |
| `shared` | `/auth/*`, `/media/*` | 9 | campuran |
| `participant` | tanpa awalan — `/activities`, `/events`, `/bookings`, `/saved`, `/search`, … | 24 | katalog publik; `/bookings` & `/saved` perlu token |
| `organizer` | `/organizer/*` | 17 | wajib, `roles` memuat `organizer` |
| `teams` | `/teams/*` | 15 | wajib, `roles` memuat `teams_admin` |
| *(bukan situs)* | `/webhooks/payment` | 1 | tanda tangan gateway |

Dua konsol sudah bernama ruang sendiri, jadi gateway bisa memakai aturan
sederhana: `/organizer/*` → app B, `/teams/*` → app C, `/auth/*` dan `/media/*`
→ layanan bersama, sisanya → app A.

> **Situs peserta sengaja tidak diberi awalan `/participant`.** Katalognya
> publik dan terindeks mesin pencari; URL API-nya mengikuti URL halaman
> (`/activities/morning-yoga-flow`). Menambah awalan hanya memperpanjang tanpa
> memisahkan apa pun — tidak ada satu pun jalur peserta yang bertabrakan dengan
> `/organizer/*` atau `/teams/*`.

### Aturan yang menjaga ketiganya tidak bentrok

Lima aturan berikut ditegakkan lewat skrip, bukan kesepakatan lisan. Melanggar
salah satunya berarti dua situs menyebut hal yang sama dengan cara berbeda.

| # | Aturan | Kenapa |
| --- | --- | --- |
| 1 | **Satu organisasi = satu UUID**, baik muncul sebagai `community.id`, `host.id`, maupun `workspace.id`. | Kalau berbeda, situs peserta dan konsol organizer tidak bisa di-join sama sekali. |
| 2 | **Satu akun = satu UUID dan satu `roles`**, sama persis di semua section. | Akun yang sama tidak boleh punya daftar peran berbeda tergantung situs mana yang bertanya. |
| 3 | **Experience yang dimiliki konsol organizer wajib berhost workspace itu juga di katalog publik.** | Kalau tidak, publik melihat pemilik yang berbeda dari yang tertulis di konsol. |
| 4 | **Satu nama field tidak boleh punya dua tipe.** | Klien bertipe pecah begitu ketiga situs dipisah dan berbagi satu paket tipe. |
| 5 | **Email akun ≠ email kantor.** `email` selalu alamat akun Hoople; alamat korporat bernama `workEmail`. | Satu orang bisa masuk Teams lewat email kantor tapi memesan kelas akhir pekan dengan email pribadi. |

Penerapan aturan 4 pada nama yang sempat bertabrakan:

| Field | Artinya sekarang | Dulu |
| --- | --- | --- |
| `host` | **selalu objek** `{ id, name, slug }` | string di endpoint list, objek di endpoint detail |
| `price` | **selalu** objek uang `{ amount, currency }` | juga dipakai untuk rincian checkout |
| `priceBreakdown` | rincian checkout (`unitPrice`, `subtotal`, `platformFee`, `total`) | dulu bernama `price` |
| `pricing` | langkah harga di builder organizer (`basePrice`, `defaultCapacity`) | — |
| `stats` | **selalu objek** counter milik entitas induknya | juga dipakai untuk larik kartu dashboard |
| `statCards` | larik kartu statistik dashboard (`key`, `label`, `value`, `unit`) | dulu bernama `stats` |
| `scheduleSummary` | baris tampilan `{ label, time }` di katalog | dulu bernama `schedule` |
| `schedule` | konfigurasi jadwal builder (`operatingDays`, `repeatWeekly`, …) | — |
| `rundown` | susunan acara `[{ time, label }]` di event | dulu bernama `schedule` |
| `payout.payoutSchedule` | irama pencairan (`daily` | `weekly` | `monthly`) | dulu `payout.schedule` |

> **`summary` sengaja dibiarkan berbeda** antara `organizer/analytics` dan
> `teams/analytics`. Keduanya berarti "ringkasan analitik konsol ini", metriknya
> memang berlainan, dan keduanya tidak pernah tampil di situs yang sama. Yang
> penting: jangan bikin satu tipe `Summary` global — biarkan tiap section
> mengetikkan miliknya sendiri. Hal yang sama berlaku untuk `stats`.

---

## 1. Standar yang dipakai

### Envelope

Setiap response — sukses maupun gagal — memakai bentuk yang sama:

```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": {},
  "meta": null
}
```

- `success` — boolean, bukan string, bukan kode.
- `message` — Bahasa Indonesia, layak ditampilkan langsung ke pengguna.
- `data` — objek untuk detail, array untuk list, `null` untuk aksi tanpa hasil.
- `meta` — `null` kecuali response berupa list berhalaman.

Response gagal menambahkan satu field `error`:

```json
{
  "success": false,
  "message": "Data yang dikirim tidak valid",
  "data": null,
  "meta": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "errors": { "email": ["Format email tidak valid"] }
  }
}
```

`error.errors` dipetakan per nama field agar frontend bisa menempelkan pesan ke input
yang tepat. Nested field memakai dot-path: `"participants.0.phone"`.

### Pagination

Wajib untuk semua endpoint list:

```json
"meta": { "page": 1, "perPage": 10, "total": 57, "totalPages": 6 }
```

### Konvensi lain

| Aspek | Keputusan | Alasan |
| --- | --- | --- |
| Nama field | **camelCase** | Sudah dipakai konsisten di seluruh `src/data/*.ts`. Nol kemunculan snake_case, jadi tidak ada yang perlu diubah di frontend. |
| ID | **UUID v4** pada field `id` | Sesuai instruksi. |
| Slug | `slug` terpisah dari `id` | URL publik memakai slug (`/activities/morning-yoga-flow`), jadi slug tetap perlu ada sebagai field sendiri — bukan pengganti `id`. |
| Kode bisnis | `orderId`, `ticketId`, `reference`, `code` | Kode yang dibaca manusia dan disebut di CS/struk (`ORD-20260314-0001`). Sengaja bukan UUID. |
| Waktu | **ISO 8601 + offset** `2026-03-14T09:30:00+07:00` | Untuk semua *instant*: `createdAt`, `paidAt`, `startsAt`, `endsAt`. |
| Tanggal/jam lokal | `date` = `"2026-03-16"`, `startTime` = `"14:00"` | Khusus template sesi berulang yang **belum** punya tanggal. Jadwal mingguan tidak punya instant, jadi memaksakan ISO di situ malah keliru. |
| Uang | objek `{ "amount": 150000, "currency": "IDR" }` | Integer Rupiah sesuai instruksi, dibungkus objek agar currency tidak pernah tersirat. Di **request** payload harga dikirim sebagai integer polos (`"price": 250000`) karena currency sudah ditentukan workspace. |
| Rate/persentase | desimal `0.03`, bukan `3` | Menghindari ambiguitas 3% vs 3.0. |
| Durasi relatif | `"30d"`, `"2h"` pada `opensBefore` / `closesBefore` | Jendela pemesanan itu **aturan**, bukan titik waktu. Dulu bernama `opensAt`/`closesAt` berisi kalimat `"30 hari sebelum sesi"` — akhiran `At` menjanjikan instant yang tidak pernah ada. Frontend yang menyusun kalimatnya. |

**Asimetri uang, disengaja.** Response membungkus (`{ "amount": 150000, "currency": "IDR" }`),
request tidak (`"price": 250000`). Alasannya: response dibaca banyak permukaan yang
tidak boleh menebak mata uang, sedangkan request selalu berada dalam konteks satu
workspace yang mata uangnya sudah pasti. Auditor menegakkan kedua arah — objek uang
di request dan integer polos di response sama-sama dianggap pelanggaran.

**Satu pengecualian yang disengaja: `stats[].value`.** Larik kartu statistik di
dashboard bersifat polimorfik — nilainya bisa jumlah, rupiah, atau rasio — dan
jenisnya ditandai `unit` (`count` / `idr` / `rate`):

```json
{ "key": "revenue", "label": "Pendapatan", "value": 128450000, "unit": "idr" }
```

Membungkus yang `idr` saja akan membuat `value` berubah tipe antar-baris dan merusak
bentuk seragam larik itu. Jadi `value` tetap angka polos, dan `unit` yang menjelaskan.
Ini satu-satunya tempat nominal rupiah tidak dibungkus.
| Field nullable | ditulis eksplisit `null` | Supaya backend tahu shape lengkapnya. |

### Enum

Semua enum **lowercase snake_case**. Daftar lengkap ada di
[`shared/common/enums.reference.json`](shared/common/enums.reference.json).

| Enum | Nilai |
| --- | --- |
| `experienceKind` | `event` \| `activity` |
| `experienceStatus` | `draft` \| `published` \| `ongoing` \| `completed` \| `cancelled` |
| `bookingStatus` | `pending` \| `confirmed` \| `completed` \| `cancelled` \| `refunded` |
| `paymentStatus` | `pending` \| `paid` \| `failed` \| `refunded` \| `covered` |
| `attendanceStatus` | `not_checked_in` \| `checked_in` \| `no_show` |
| `payoutStatus` | `scheduled` \| `paid` \| `on_hold` \| `failed` |
| `eventFormat` | `onsite` \| `online` \| `hybrid` |
| `costModel` | `company_paid` \| `cost_shared` \| `free` |
| `difficulty` | `beginner` \| `intermediate` \| `advanced` |
| `visibility` | `public` \| `unlisted` \| `private` |
| `role` | `participant` \| `organizer` \| `teams_admin` |
| `workspaceRole` | `owner` \| `admin` \| `staff` |
| `sessionAvailability` | `open` \| `sold_out` |
| `sessionStatus` | `scheduled` \| `cancelled` \| `completed` |
| `teamSessionState` | `upcoming` \| `ongoing` \| `ended` |
| `bookingTimelineStatus` | `created` \| `paid` \| `confirmed` \| `cancelled` \| `refunded` |
| `bookingConfirmation` | `instant` \| `manual` |
| `publishMode` | `now` \| `scheduled` \| `draft` |
| `scanResult` | `accepted` \| `already_used` \| `invalid` \| `expired` \| `wrong_event` |
| `transactionType` | `sale` \| `refund` \| `payout` \| `adjustment` |
| `paymentMethodGroup` | `virtual_account` \| `ewallet` \| `qris` \| `card` |
| `payoutSchedule` | `daily` \| `weekly` \| `monthly` |
| `payoutStepStatus` | `done` \| `pending` \| `failed` |
| `disbursement` | `after_event` \| `weekly` \| `manual` |
| `membershipRule` | `email_domain` \| `invite_only` \| `manual` |
| `statUnit` | `count` \| `idr` \| `rate` |
| `activityFeedType` | `registration` \| `checkin` \| `publish` \| `cancellation` |
| `subscriptionStatus` | `subscribed` \| `unsubscribed` \| `pending` |
| `supportTicketStatus` | `open` \| `in_progress` \| `resolved` \| `closed` |
| `device` | `mobile` \| `desktop` \| `tablet` |

> **Dua enum berbeda pernah memakai kunci `status` yang sama pada objek sesi.**
> Sudah dipisah: katalog publik memakai **`availability`** (`open` / `sold_out` —
> masih bisa dipesan atau tidak), konsol memakai **`status`** (`scheduled` /
> `cancelled` — keadaan sesinya sendiri). Keduanya tidak pernah muncul bersamaan
> pada satu objek.
>
> Sebagian nilai sengaja terdaftar tanpa dipakai fixture — `invalid`, `expired`,
> `wrong_event`, `staff`, `online`, `adjustment`, dan seterusnya. Enum mencatat
> nilai yang **sah**, bukan hanya yang kebetulan ada contohnya.

### Peran: `roles` adalah array

Satu akun bisa memegang lebih dari satu peran — orang yang memesan kelas di akhir
pekan bisa juga penyelenggara kelas itu. Karena itu field akun bernama **`roles`**
dan bertipe **array**, bukan skalar:

```json
"roles": ["participant", "organizer"]
```

> **Implikasi untuk guard di frontend.** Semua pengecekan peran harus berbentuk
> keanggotaan, bukan kesamaan:
>
> ```ts
> // salah — akan gagal begitu seseorang punya dua peran
> if (user.role === 'organizer') { … }
>
> // benar
> if (user.roles.includes('organizer')) { … }
> ```
>
> Berlaku juga untuk routing: `RequireAuth` yang menjaga `/organizer` dan `/teams`
> perlu memeriksa `roles.includes(...)`, dan seseorang bisa lolos keduanya.

**Hati-hati: ada tiga hal berbeda yang sama-sama bernama "role" di API ini.**
Ketiganya sengaja tidak digabung.

| Field | Contoh | Artinya |
| --- | --- | --- |
| `roles` (array) | `["participant", "organizer"]` | Peran **akun** di platform. Enum `role`. |
| `role` (skalar) di `workspace`, `owner`, `admins[]` | `"owner"`, `"admin"` | Kedudukan di dalam **satu workspace/organisasi**. Enum `workspaceRole`. Satu orang bisa `owner` di satu workspace dan `admin` di workspace lain, jadi ini melekat pada keanggotaan, bukan pada akun. |
| `role` (skalar) di `instructors[]`, `lineup[]`, `organizers[]` | `"Pottery Instructor"`, `"Q Grader"` | **Jabatan bebas** yang diketik penyelenggara. Bukan enum, tidak divalidasi, hanya untuk ditampilkan. |

> **Perlu diperhatikan frontend.** Kode saat ini menyimpan status dalam Title Case
> (`'Confirmed'`, `'Published'`, `'Upcoming'`) karena nilainya langsung dirender ke
> layar. API mengirim lowercase, jadi butuh satu lapisan pemetaan
> enum → label saat integrasi. Ini disengaja: label yang tampil ke pengguna
> sebaiknya ditentukan frontend (dan bisa diterjemahkan), bukan dikunci di API.

### Base URL & header

```
https://api.hoople.id/v1
Authorization: Bearer <accessToken>
Accept: application/json
Content-Type: application/json
```

---

## 2. Pemetaan file → endpoint

### `shared/common/` — dipakai semua domain

| File | HTTP | Deskripsi |
| --- | --- | --- |
| `envelope.example.json` | — | Bentuk envelope standar. |
| `pagination.example.json` | — | Bentuk `meta` untuk list. |
| `enums.reference.json` | — | Semua enum dalam satu berkas. |
| `error-validation.response.json` | `422` | Input gagal validasi, per field. |
| `error-unauthorized.response.json` | `401` | Token hilang/kedaluwarsa. |
| `error-forbidden.response.json` | `403` | Token valid, hak akses kurang. |
| `error-not-found.response.json` | `404` | Resource tidak ada. |
| `error-conflict.response.json` | `409` | Bentrok state, mis. slot habis. |
| `error-server.response.json` | `500` | Kesalahan tak terduga. |

### `shared/auth/` — autentikasi & profil

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `register.request.json`<br>`register.response.json` | `POST` | `/auth/register` | Daftar akun baru + minat awal. |
| `login.request.json`<br>`login.response.json` | `POST` | `/auth/login` | Masuk, mengembalikan token. |
| `login-invalid.response.json` | `401` | `/auth/login` | Kredensial salah. |
| `refresh.request.json`<br>`refresh.response.json` | `POST` | `/auth/refresh` | Perpanjang access token. |
| `logout.response.json` | `POST` | `/auth/logout` | Cabut refresh token. |
| `profile.response.json` | `GET` | `/auth/me` | Profil + statistik ringkas. |
| `profile-update.request.json`<br>`profile-update.response.json` | `PATCH` | `/auth/me` | Ubah profil & preferensi notifikasi. |
| `password-forgot.request.json`<br>`password-forgot.response.json` | `POST` | `/auth/password/forgot` | Kirim tautan reset. |
| `password-reset.request.json`<br>`password-reset.response.json` | `POST` | `/auth/password/reset` | Set password baru. |

### `participant/catalog/` — katalog publik (situs peserta)

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `home-feed.response.json` | `GET` | `/home` | Hero + section beranda + kategori. |
| `search.response.json` | `GET` | `/search?q=&category=&city=` | Hasil pencarian + facet filter. |
| `activity-list.response.json` | `GET` | `/activities` | Daftar aktivitas (berulang). |
| `activity-detail.response.json` | `GET` | `/activities/{slug}` | Detail lengkap + ulasan + FAQ. |
| `activity-sessions.response.json` | `GET` | `/activities/{slug}/sessions?from=&to=` | Sesi bookable pada rentang tanggal. |
| `event-list.response.json` | `GET` | `/events` | Daftar event (sekali jalan). |
| `event-detail.response.json` | `GET` | `/events/{slug}` | Detail + jenis tiket + rundown. |
| `community-list.response.json` | `GET` | `/communities` | Daftar komunitas. |
| `community-detail.response.json` | `GET` | `/communities/{slug}` | Profil komunitas + experience mendatang. |
| `category-list.response.json` | `GET` | `/categories` | Kategori untuk filter & navigasi. |

### `participant/bookings/` — pemesanan peserta

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `booking-create.request.json`<br>`booking-create.response.json` | `POST` | `/bookings` | Buat pesanan dari checkout. Response awal berstatus `pending`. |
| `booking-slot-unavailable.response.json` | `409` | `/bookings` | Slot habis saat submit. |
| `booking-list.response.json` | `GET` | `/bookings` | "Pesanan Saya" — variasi confirmed/completed/cancelled. |
| `booking-detail.response.json` | `GET` | `/bookings/{id}` | Detail + timeline + kebijakan. |
| `booking-cancel.request.json`<br>`booking-cancel.response.json` | `POST` | `/bookings/{id}/cancel` | Batalkan + info refund. |
| `eticket.response.json` | `GET` | `/bookings/{id}/ticket` | E-tiket: QR, kode per peserta, `.ics`. |

### `participant/saved/` — daftar simpanan

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `saved-list.response.json` | `GET` | `/saved` | Semua yang disimpan. |
| `saved-toggle.request.json`<br>`saved-toggle.response.json` | `POST` | `/saved/toggle` | Simpan/lepas. Idempoten, mengembalikan `isSaved` terbaru. |

### `participant/payments/` — pembayaran

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `payment-method-list.response.json` | `GET` | `/payment-methods` | VA, e-wallet, QRIS, kartu + biaya masing-masing. |
| `payment-charge.request.json`<br>`payment-charge.response.json` | `POST` | `/payments/charge` | Terbitkan instruksi bayar (nomor VA, QR, deeplink). |
| `payment-status.response.json` | `GET` | `/payments/{paymentId}` | Polling status bayar. |
| `payment-webhook.request.json` | `POST` | `/webhooks/payment` | Callback dari payment gateway ke backend. |

### `participant/content/` — halaman statis & dukungan

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `pricing-plan-list.response.json` | `GET` | `/pricing-plans` | Paket Starter/Pro/Enterprise. |
| `help-topic-list.response.json` | `GET` | `/help/topics` | Pusat bantuan, FAQ per topik. |
| `support-contact.request.json`<br>`support-contact.response.json` | `POST` | `/support/tickets` | Form hubungi kami. |
| `newsletter-subscribe.request.json`<br>`newsletter-subscribe.response.json` | `POST` | `/newsletter/subscribe` | Langganan newsletter footer. |

### `shared/media/` — unggah berkas

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `upload.response.json` | `POST` | `/media/upload` | Unggah gambar (cover, galeri, logo, avatar). Mengembalikan `url` yang dipakai payload builder. |

> **Body-nya `multipart/form-data`, bukan JSON.** Field berkas bernama `file`,
> dengan field opsional `purpose` (`cover` \| `gallery` \| `logo` \| `avatar`)
> supaya backend bisa menentukan batas ukuran dan rasio. Karena itu tidak ada
> `upload.request.json` di sini — request-nya tidak bisa diwakili JSON. Yang
> berbentuk JSON hanya response-nya, dan itulah yang ada di file ini.
>
> Alurnya: frontend unggah dulu → dapat `url` → `url` itu yang dikirim sebagai
> `coverImageUrl` / `gallery[]` saat submit builder. Jadi submit builder tetap
> JSON murni.

### `organizer/` — konsol penyelenggara

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `dashboard.response.json` | `GET` | `/organizer/dashboard` | Kartu statistik, sesi mendatang, registrasi terbaru, tren. |
| `experience-list.response.json` | `GET` | `/organizer/experiences?scope=all\|events\|activities\|drafts` | Daftar experience; `scope` menggerakkan keempat tab. |
| `experience-detail.response.json` | `GET` | `/organizer/experiences/{id}` | Detail penuh untuk mode edit builder. |
| `activity-create.request.json`<br>`activity-create.response.json` | `POST` | `/organizer/experiences/activities` | Submit builder aktivitas (5 langkah). |
| `event-create.request.json`<br>`event-create.response.json` | `POST` | `/organizer/experiences/events` | Submit builder event (4 langkah). |
| `experience-update.request.json` | `PATCH` | `/organizer/experiences/{id}` | Update parsial. |
| `experience-publish.response.json` | `POST` | `/organizer/experiences/{id}/publish` | Draft → published. |
| `experience-delete.response.json` | `DELETE` | `/organizer/experiences/{id}` | Hapus (soft delete). |
| `session-list.response.json` | `GET` | `/organizer/sessions` | Semua sesi lintas experience. |
| `registration-list.response.json` | `GET` | `/organizer/registrations` | Registrasi + status bayar + kehadiran. |
| `checkin-scan.request.json`<br>`checkin-scan.response.json` | `POST` | `/organizer/check-in/scan` | Scan QR di pintu. |
| `checkin-scan-rejected.response.json` | `409` | `/organizer/check-in/scan` | Tiket sudah dipakai. |
| `checkin-summary.response.json` | `GET` | `/organizer/check-in/summary?sessionId=` | Progres check-in sesi berjalan. |
| `analytics.response.json` | `GET` | `/organizer/analytics?from=&to=` | Ringkasan, tren bulanan, top experience, sumber trafik. |
| `payout-list.response.json` | `GET` | `/organizer/payouts` | Pencairan + rincian potongan. |
| `transaction-list.response.json` | `GET` | `/organizer/transactions` | Buku transaksi: `sale`, `refund`, `payout`. |
| `settings.response.json` | `GET` | `/organizer/settings` | Workspace, rekening, fee, paket, notifikasi. |
| `settings-update.request.json` | `PATCH` | `/organizer/settings` | Simpan pengaturan. |

### `teams/` — konsol event internal perusahaan

Konsol ini **tidak pernah publik**. Tidak ada slug publik yang bisa diakses orang luar,
dan setiap event punya `memberLink` yang meminta sign-in perusahaan.

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `dashboard.response.json` | `GET` | `/teams/dashboard` | Organisasi, event aktif, statistik, aktivitas terbaru. |
| `event-list.response.json` | `GET` | `/teams/events` | Event internal + jenis pass. |
| `event-detail.response.json` | `GET` | `/teams/events/{id}` | Detail + agenda + funnel + settlement. |
| `event-create.request.json`<br>`event-create.response.json` | `POST` | `/teams/events` | Buat event internal. |
| `session-list.response.json` | `GET` | `/teams/sessions?eventId=` | Sesi/agenda per event. |
| `registration-list.response.json` | `GET` | `/teams/registrations?eventId=` | Peserta + data kepegawaian. |
| `order-list.response.json` | `GET` | `/teams/orders?eventId=` | Pesanan berbayar (plus one, patungan). |
| `analytics.response.json` | `GET` | `/teams/analytics?eventId=` | Funnel, respons per departemen, tren, kurva check-in. |
| `checkin-scan.request.json`<br>`checkin-scan.response.json` | `POST` | `/teams/check-in/scan` | Scan di gate. |
| `checkin-summary.response.json` | `GET` | `/teams/check-in/summary?eventId=` | Progres per scanner. |
| `payment-settlement.response.json` | `GET` | `/teams/payments?eventId=` | Dana terkumpul, potongan, tahapan pencairan. |
| `department-list.response.json` | `GET` | `/teams/departments` | Departemen + headcount, untuk memilih audiens. |
| `settings.response.json` | `GET` | `/teams/settings` | Organisasi, aturan keanggotaan, rekening, admin. |
| `settings-update.request.json` | `PATCH` | `/teams/settings` | Simpan pengaturan. |
| `profile.response.json` | `GET` | `/teams/profile` | Profil anggota + riwayat kehadiran. |

---

## 3. Variasi state yang sengaja disediakan

Supaya UI bisa diuji tanpa mengarang data:

- **Gratis & berbayar** — `padel-friday` dan `pasar-kreatif-kemang` Rp 0;
  sisanya berbayar Rp 95.000–Rp 320.000.
- **Sold out** — `sunset-rooftop-jazz` (event) dan `latte-art-workshop` (aktivitas),
  plus satu sesi dengan `slotsLeft: 0` dan `status: "sold_out"`.
- **Semua status experience** — published, ongoing, completed, draft, cancelled
  hadir di `organizer/experience-list.response.json`.
- **Semua status pembayaran** — paid, pending, failed, refunded, covered
  tersebar di `teams/order-list.response.json` dan `organizer/registration-list.response.json`.
- **Semua status kehadiran** — checked_in, not_checked_in, no_show.
- **Payout** — scheduled, paid, dan satu `on_hold` lengkap dengan `holdReason`.
- **Transaksi bernilai negatif** — refund dan payout, agar tabel keuangan teruji.
- **Booking pending dengan countdown berjalan** — satu baris di
  `participant/bookings/booking-list.response.json` berstatus `pending` dengan
  `payment.expiresAt` di masa depan, supaya hitung mundur teruji **di dalam list**,
  bukan hanya di halaman detail.
- **Kuota terlampaui** — `pass-online` di Town Hall terjual 108 dari kuota 100,
  dan Finance & Legal `registered: 38` dari headcount 36. Ini nyata terjadi
  (orang mengajak rekan), jadi UI jangan berasumsi rasio ≤ 100%.

---

## 4. Asumsi yang diambil

Bagian yang tidak bisa dipastikan dari kode, beserta keputusan yang saya ambil.
Silakan koreksi kalau backend berpendapat lain.

1. **Autentikasi memakai JWT Bearer + refresh token.** Kode hanya menyimpan
   `{ name, email }` di `localStorage` tanpa token sama sekali. Saya asumsikan
   pola standar: access token pendek + refresh token.
2. **Satu akun bisa berperan ganda — sudah diterapkan.** `roles` kini array, bukan
   skalar. `auth/profile` dan `auth/login` memakai `["participant", "organizer"]`
   karena akun contohnya memang memiliki workspace Waktu Luang; `auth/register`
   memakai `["participant"]` supaya kasus satu elemen ikut teruji. Lihat
   [Peran: `roles` adalah array](#peran-roles-adalah-array).
3. **Booking dibuat dulu, baru dibayar.** `POST /bookings` mengembalikan status
   `pending` + instruksi bayar; konfirmasi datang lewat webhook gateway. Alternatifnya
   satu langkah, tapi VA memang tidak bisa begitu.

   Batas waktu bayar ada di **`payment.expiresAt`** — bukan di akar objek booking,
   karena yang kedaluwarsa adalah instruksi pembayarannya, bukan pesanannya. Isinya
   ISO 8601 saat `paymentStatus` masih `pending`, dan `null` begitu lunas, dibatalkan,
   atau selesai. Itulah field yang dipakai frontend untuk countdown. Nilai yang sama
   muncul di `participant/payments/payment-charge.response.json` dan
   `participant/payments/payment-status.response.json`, sehingga polling status tidak perlu
   mengambil ulang seluruh booking hanya demi sisa waktu. Satu baris di
   `participant/bookings/booking-list.response.json` sengaja berstatus `pending` agar hitung
   mundur teruji di dalam daftar, bukan hanya di halaman detail.
4. **Harga sesi bisa berbeda dari harga dasar.** Builder aktivitas sekarang punya
   base price + override per sesi, jadi `activity-detail` memakai `priceFrom` dan
   tiap sesi membawa `price` sendiri.
5. **`slotsLeft` dihitung server, bukan dikirim frontend.** Termasuk pengurangan saat
   booking pending — kalau tidak, dua orang bisa merebut slot terakhir bersamaan.
6. **Upload gambar terpisah dari submit form.** Payload builder mengirim
   `coverImageUrl` berupa URL hasil upload (`/uploads`), bukan base64. File JSON
   untuk endpoint upload tidak saya buat karena `multipart/form-data`, bukan JSON.
7. **Fee ditanggung pembeli.** `platformFee` dan `gatewayFee` ditambahkan di atas
   subtotal. Ada flag `fees.absorbedByOrganizer` di pengaturan kalau nanti dibalik.
8. **Teams tidak memungut platform fee** (`platformRate: 0`) — mengikuti komentar di
   `src/data/teams.ts` bahwa Hoople tidak mengambil potongan untuk event internal.
9. **Analitik dihitung backend.** Frontend menggambar grafik saja, tidak menjumlah.
   Semua `share` dan `rate` sudah berupa desimal siap pakai.
10. **Zona waktu.** Semua contoh `+07:00` (WIB). Field `timezone` tetap disertakan
    karena Hoople bisa melayani Bali/Makassar (WITA) nanti.
11. **Pencarian punya facet.** `search.response.json` menyertakan `facets` agar
    jumlah di sebelah setiap filter tidak perlu dihitung ulang di klien.

### Catatan: `src/dto/` yang lama

Sudah dihapus. `SignInReq.json` dan `SignInRes.json` digantikan oleh
`dto/auth/login.request.json` dan `dto/auth/login.response.json`, yang memakai
envelope standar dan sudah membawa token. Tidak ada satu pun import ke kedua berkas
itu di `src/`, jadi penghapusannya tidak memutus apa pun.

---

## 5. Cara memakai sebagai mock di frontend

```ts
// Sekarang — baca file lokal
import activityList from '@/../dto/participant/catalog/activity-list.response.json';

// Nanti — tinggal ganti sumbernya, bentuk datanya sama
const activityList = await fetch(`${API_BASE}/activities`).then((r) => r.json());
```

Karena setiap response memakai envelope yang sama, satu helper cukup untuk keduanya:

```ts
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  const body = await res.json();
  if (!body.success) throw new ApiError(body.message, body.error);
  return body.data as T;
}
```

---

## 6. Hasil audit finalisasi

Seluruh 95 berkas diperiksa dengan skrip, bukan dibaca satu per satu. Delapan
ketidakkonsistenan ditemukan dan sudah diperbaiki:

| # | Temuan | Perbaikan |
| --- | --- | --- |
| 1 | `refund.amount` berupa integer polos di response | Jadi `refund.total` bertipe objek uang |
| 2 | `revenue` pada deret waktu analitik & dashboard masih integer polos (14 titik) | Semua dibungkus `{ amount, currency }` |
| 3 | `opensAt` / `closesAt` berakhiran `At` tapi isinya kalimat, bukan instant | Jadi `opensBefore` / `closesBefore` bernilai `"30d"` / `"2h"` |
| 4 | `holdReason` hanya ada pada 1 dari 5 baris payout | Hadir sebagai `null` di semua baris |
| 5 | Kunci `status` pada sesi berarti dua enum berbeda antar-endpoint | Katalog memakai `availability`, konsol tetap `status` |
| 6 | `eventId` pada webhook bentrok dengan `eventId` milik Teams | Jadi `deliveryId` |
| 7 | Slug `padel-friday` menunjuk dua entitas berbeda | Event internal jadi `padel-friday-club` |
| 8 | 16 nilai enum dipakai tapi tidak terdaftar | Semua didaftarkan di `shared/common/enums.reference.json` |

### Audit pemisahan tiga section

Setelah kontrak dibelah jadi tiga section, seluruh 95 berkas diperiksa ulang
untuk mencari hal yang disebut berbeda oleh dua situs. Sembilan ditemukan:

| # | Temuan | Perbaikan |
| --- | --- | --- |
| 9 | Satu UUID `…0401` dipakai tiga organisasi berbeda — Flow with Me Studio, Kopi Karya, dan workspace Waktu Luang | Tiap organisasi diberi UUID sendiri (`…0401`–`…0407`) |
| 10 | Komunitas memakai id `cm-0001-…` yang bukan UUID, dan terpisah dari `host.id` organisasi yang sama | Komunitas, host, dan workspace kini berbagi satu UUID per organisasi |
| 11 | Empat experience milik konsol organizer tercatat berhost studio lain di katalog publik (`morning-yoga-flow`, `pasar-kreatif-kemang`, `ux-in-practice`, `latte-art-workshop`) | Host di katalog disamakan dengan workspace pemiliknya |
| 12 | Halaman komunitas Kopi Karya masih menampilkan experience yang bukan miliknya | Daftar `upcomingExperiences` disaring ke host sendiri |
| 13 | Akun yang sama punya `roles` berbeda — `["participant","organizer"]` di `auth`, `["participant","teams_admin"]` di `teams` | Satu akun, satu daftar: `["participant","organizer","teams_admin"]` |
| 14 | `auth/register` mengembalikan id akun yang sudah ada, seolah pendaftaran baru mencetak akun lama | Register mencetak akun baru (Nadia Puspita, UUID sendiri, `["participant"]`) |
| 15 | Satu akun punya dua `email` berbeda — pribadi di `auth`, korporat di `teams` | `email` = alamat akun; alamat korporat jadi `workEmail` |
| 16 | `host` bertipe string di endpoint list dan objek di endpoint detail | Selalu objek `{ id, name, slug }` |
| 17 | `price` berarti objek uang sekaligus rincian checkout; `stats` berarti objek counter sekaligus larik kartu | Dipisah jadi `priceBreakdown` dan `statCards` |
| 18 | `schedule` berarti **empat** hal: baris tampilan katalog, susunan acara, konfigurasi builder, dan jadwal pencairan | Jadi `scheduleSummary`, `rundown`, `schedule`, dan `payout.payoutSchedule` |

Seluruhnya ditegakkan ulang lewat `npm run dto:verify` ([`scripts/dto-verify.mjs`](../scripts/dto-verify.mjs)),
yang gagal dengan exit code 1 begitu salah satu aturan dilanggar. Jalankan
setiap kali menambah atau mengubah berkas di sini.

Temuan 11–12 adalah yang paling penting: keduanya mengajarkan backend membangun
join yang salah, dan baru terlihat setelah kedua situs dibandingkan berdampingan.

Yang **sengaja dibiarkan**, dan alasannya:

- **Kuota terlampaui** — `pass-online` 108/100 dan Finance & Legal 38/36. Ini kondisi
  nyata (orang mengajak rekan) dan ada supaya UI tidak berasumsi rasio ≤ 100%.
  Auditor secara khusus menjaga keduanya tetap utuh.
- **Nilai enum tanpa fixture** — `invalid`, `expired`, `wrong_event`, `staff`,
  `online`, `adjustment`, `unsubscribed`, `in_progress`, `resolved`, `closed`,
  `invite_only`, `cancellation`. Sah, hanya belum ada contohnya.
- **`stats[].value` tidak dibungkus** — lihat [Asimetri uang](#konvensi-lain).

## 7. Menunggu keputusan tim backend

Empat hal yang saya putuskan sepihak agar kontrak bisa jalan, tapi backend berhak
membatalkannya. Semuanya murah diubah **sekarang**, mahal setelah endpoint jadi.

| Hal | Yang saya pakai | Kalau backend tidak setuju |
| --- | --- | --- |
| **`roles` sebagai array** | `["participant", "organizer"]` | Kembali ke skalar berarti satu orang tidak bisa jadi peserta sekaligus penyelenggara — batasan produk, bukan teknis. Semua guard frontend sudah menuju `roles.includes(...)`. |
| **Uang sebagai objek di response** | `{ amount, currency }` | Kalau dipilih integer polos, `currency` harus pindah ke envelope atau ke level entitas. Jangan dibiarkan tersirat. |
| **Booking dibuat `pending` lalu webhook** | `POST /bookings` → `pending` + instruksi bayar | Alternatif satu langkah hanya mungkin untuk e-wallet/QRIS, tidak untuk virtual account. |
| **Enum lowercase, label milik frontend** | `"confirmed"` | Kalau API mengirim label siap tampil, penerjemahan dan perubahan wording jadi urusan backend. |

Selain itu, satu hal yang belum diputuskan sama sekali: **paginasi berbasis cursor**.
Saat ini semuanya `page` / `perPage`. Untuk daftar registrasi yang bisa mencapai
puluhan ribu baris, cursor lebih tahan banting. Belum saya terapkan karena UI
sekarang memakai nomor halaman.
