# Hoople — Mock JSON Response (DTO)

Contoh response API untuk seluruh permukaan aplikasi Hoople. Dua kegunaannya:

1. **Acuan tim backend** saat membangun endpoint di Bruno/Postman — bentuk payload,
   nama field, enum, dan shape error sudah ditetapkan di sini.
2. **Mock data frontend** sementara endpoint asli belum siap. Nanti tinggal ganti
   import file JSON dengan `fetch` ke URL sungguhan; bentuk datanya tidak berubah.

94 file JSON, 9 domain. Semua sudah divalidasi parse dan konsisten terhadap envelope.

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
| Field nullable | ditulis eksplisit `null` | Supaya backend tahu shape lengkapnya. |

### Enum

Semua enum **lowercase snake_case**. Daftar lengkap ada di
[`common/enums.reference.json`](common/enums.reference.json).

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
| `userRole` | `participant` \| `organizer` \| `teams_admin` |

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

### `common/` — dipakai semua domain

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

### `auth/` — autentikasi & profil

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `register.request.json` / `.response.json` | `POST` | `/auth/register` | Daftar akun baru + minat awal. |
| `login.request.json` / `.response.json` | `POST` | `/auth/login` | Masuk, mengembalikan token. |
| `login-invalid.response.json` | `401` | `/auth/login` | Kredensial salah. |
| `refresh.request.json` / `.response.json` | `POST` | `/auth/refresh` | Perpanjang access token. |
| `logout.response.json` | `POST` | `/auth/logout` | Cabut refresh token. |
| `profile.response.json` | `GET` | `/auth/me` | Profil + statistik ringkas. |
| `profile-update.request.json` / `.response.json` | `PATCH` | `/auth/me` | Ubah profil & preferensi notifikasi. |
| `password-forgot.request.json` / `.response.json` | `POST` | `/auth/password/forgot` | Kirim tautan reset. |
| `password-reset.request.json` / `.response.json` | `POST` | `/auth/password/reset` | Set password baru. |

### `catalog/` — katalog publik (situs peserta)

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

### `bookings/` — pemesanan peserta

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `booking-create.request.json` / `.response.json` | `POST` | `/bookings` | Buat pesanan dari checkout. Response awal berstatus `pending`. |
| `booking-slot-unavailable.response.json` | `409` | `/bookings` | Slot habis saat submit. |
| `booking-list.response.json` | `GET` | `/bookings` | "Pesanan Saya" — variasi confirmed/completed/cancelled. |
| `booking-detail.response.json` | `GET` | `/bookings/{id}` | Detail + timeline + kebijakan. |
| `booking-cancel.request.json` / `.response.json` | `POST` | `/bookings/{id}/cancel` | Batalkan + info refund. |
| `eticket.response.json` | `GET` | `/bookings/{id}/ticket` | E-tiket: QR, kode per peserta, `.ics`. |

### `saved/` — daftar simpanan

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `saved-list.response.json` | `GET` | `/saved` | Semua yang disimpan. |
| `saved-toggle.request.json` / `.response.json` | `POST` | `/saved/toggle` | Simpan/lepas. Idempoten, mengembalikan `isSaved` terbaru. |

### `payments/` — pembayaran

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `payment-method-list.response.json` | `GET` | `/payment-methods` | VA, e-wallet, QRIS, kartu + biaya masing-masing. |
| `payment-charge.request.json` / `.response.json` | `POST` | `/payments/charge` | Terbitkan instruksi bayar (nomor VA, QR, deeplink). |
| `payment-status.response.json` | `GET` | `/payments/{paymentId}` | Polling status bayar. |
| `payment-webhook.request.json` | `POST` | `/webhooks/payment` | Callback dari payment gateway ke backend. |

### `content/` — halaman statis & dukungan

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `pricing-plan-list.response.json` | `GET` | `/pricing-plans` | Paket Starter/Pro/Enterprise. |
| `help-topic-list.response.json` | `GET` | `/help/topics` | Pusat bantuan, FAQ per topik. |
| `support-contact.request.json` / `.response.json` | `POST` | `/support/tickets` | Form hubungi kami. |
| `newsletter-subscribe.request.json` / `.response.json` | `POST` | `/newsletter/subscribe` | Langganan newsletter footer. |

### `organizer/` — konsol penyelenggara

| File | HTTP | Endpoint | Deskripsi |
| --- | --- | --- | --- |
| `dashboard.response.json` | `GET` | `/organizer/dashboard` | Kartu statistik, sesi mendatang, registrasi terbaru, tren. |
| `experience-list.response.json` | `GET` | `/organizer/experiences?scope=all\|events\|activities\|drafts` | Daftar experience; `scope` menggerakkan keempat tab. |
| `experience-detail.response.json` | `GET` | `/organizer/experiences/{id}` | Detail penuh untuk mode edit builder. |
| `activity-create.request.json` / `.response.json` | `POST` | `/organizer/experiences/activities` | Submit builder aktivitas (5 langkah). |
| `event-create.request.json` / `.response.json` | `POST` | `/organizer/experiences/events` | Submit builder event (4 langkah). |
| `experience-update.request.json` | `PATCH` | `/organizer/experiences/{id}` | Update parsial. |
| `experience-publish.response.json` | `POST` | `/organizer/experiences/{id}/publish` | Draft → published. |
| `experience-delete.response.json` | `DELETE` | `/organizer/experiences/{id}` | Hapus (soft delete). |
| `session-list.response.json` | `GET` | `/organizer/sessions` | Semua sesi lintas experience. |
| `registration-list.response.json` | `GET` | `/organizer/registrations` | Registrasi + status bayar + kehadiran. |
| `checkin-scan.request.json` / `.response.json` | `POST` | `/organizer/check-in/scan` | Scan QR di pintu. |
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
| `event-create.request.json` / `.response.json` | `POST` | `/teams/events` | Buat event internal. |
| `session-list.response.json` | `GET` | `/teams/sessions?eventId=` | Sesi/agenda per event. |
| `registration-list.response.json` | `GET` | `/teams/registrations?eventId=` | Peserta + data kepegawaian. |
| `order-list.response.json` | `GET` | `/teams/orders?eventId=` | Pesanan berbayar (plus one, patungan). |
| `analytics.response.json` | `GET` | `/teams/analytics?eventId=` | Funnel, respons per departemen, tren, kurva check-in. |
| `checkin-scan.request.json` / `.response.json` | `POST` | `/teams/check-in/scan` | Scan di gate. |
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
2. **Satu akun bisa berperan ganda.** `userRole` saya buat enum tunggal, tapi
   kenyataannya satu orang bisa jadi peserta sekaligus penyelenggara. Kalau backend
   ingin mendukung itu, ubah jadi array `roles` — frontend tinggal menyesuaikan.
3. **Booking dibuat dulu, baru dibayar.** `POST /bookings` mengembalikan status
   `pending` + instruksi bayar; konfirmasi datang lewat webhook gateway. Alternatifnya
   satu langkah, tapi VA memang tidak bisa begitu.
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

Ada dua file lama di `src/dto/` — `SignInReq.json` dan `SignInRes.json` — yang
digantikan oleh `dto/auth/login.request.json` dan `dto/auth/login.response.json`
(bentuknya kini pakai envelope dan lengkap dengan token). Saya **tidak menghapusnya**
karena bukan milik saya untuk dibuang; silakan hapus `src/dto/` kalau sudah tidak
dipakai, supaya tidak ada dua sumber kebenaran.

---

## 5. Cara memakai sebagai mock di frontend

```ts
// Sekarang — baca file lokal
import activityList from '@/../dto/catalog/activity-list.response.json';

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
