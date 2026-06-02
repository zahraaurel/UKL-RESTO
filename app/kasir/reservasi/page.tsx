'use client'; // Menandakan bahwa komponen ini adalah Client Component yang berjalan di browser user
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/NavbarKasir'; // Memanggil komponen navigasi khusus kasir
import Link from 'next/link'; // Menggunakan fitur navigasi internal khas Next.js
// Import library react-hot-toast untuk animasi pop-up notifikasi (sukses/gagal)
import toast, { Toaster } from 'react-hot-toast';

// Base URL Proxy untuk mengantisipasi error CORS di browser dan menyambung ke server backend (Railway)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api-railway';

// --- INTERFACE TYPESCRIPT ---
// Mendefinisikan struktur objek data reservasi yang datang dari backend secara ketat
interface BackendReservation {
  id: number;
  customerName: string;
  phoneNumber: string;
  reservationDate: string; // Format ISO string dari database, contoh: "2026-06-02T19:00:00.000Z"
  totalGuest: number;
  tableNumber: number;
  status: 'CONFIRMED' | 'PENDING' // Membatasi isi status agar hanya menerima salah satu dari dua opsi ini
  cashierId?: number; // Tanda tanya (?) berarti properti ini opsional (boleh ada/tidak)
  createdAt?: string;
  updatedAt?: string;
  cashier?: {
    id: number;
    username: string;
  };
}

export default function AdminReservasiPage(): React.JSX.Element {
  // --- SECTION STATE UTAMA ---
  // `reservasis`: Wadah array untuk menampung seluruh baris data reservasi dari server backend
  const [reservasis, setReservasis] = useState<BackendReservation[]>([]);
  // `isLoading`: Status indikator untuk memunculkan efek loading saat sistem sedang mendownload data API
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // `isSubmitting`: Mengunci tombol submit agar user tidak menekan tombol simpan berkali-kali saat proses simpan berjalan
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // `form`: State terpusat untuk menampung inputan formulir (Mode Tambah Baru & Mode Edit)
  const [form, setForm] = useState({
    id: null as number | null, // Jika id terisi angka, berarti form sedang dalam mode EDIT data
    nama: '',
    telepon: '',
    meja: '',
    tanggal: '',
    jam: '',
    jumlahOrang: 2,
    status: 'PENDING' as 'CONFIRMED' | 'PENDING' 
  });

  // State pencarian global di frontend
  const [searchQuery, setSearchQuery] = useState(''); // Menyimpan teks filter nama pelanggan
  const [filterDate, setFilterDate] = useState('');   // Menyimpan teks filter tanggal kedatangan

  // --- FEATURE 1: GET (READ) DATA RESERVASI ---
  // Fungsi asinkronus untuk menjemput data dari endpoint `/reservation`
  const fetchArticles = async () => {
    setIsLoading(true); // Hidupkan indikator memuat data
    try {
      // Mengambil token JWT dari penyimpanan lokal browser untuk otentikasi keamanan backend
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/reservation`, {
        headers: {
          // Menyisipkan token ke dalam header dengan skema 'Bearer token_kamu'
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (!response.ok) throw new Error('Gagal mengambil data reservasi.');
      
      const data = await response.json(); // Mengonversi respon mentah menjadi objek JSON
      setReservasis(data); // Simpan hasil konversi ke dalam state utama `reservasis`
    } catch (error) {
      console.error('Error Fetch:', error);
      toast.error('Gagal memuat daftar reservasi dari database.'); // Memunculkan pop-up merah tanda error
    } finally {
      setIsLoading(false); // Matikan efek loading, baik ketika sukses maupun gagal
    }
  };

  // React Lifecycle: Menjalankan fungsi `fetchArticles()` tepat setelah komponen pertama kali terpasang di layar browser
  useEffect(() => {
    fetchArticles();
  }, []);

  // --- FEATURE 2: POST (ADD) / PUT (EDIT) ---
  // Satu fungsi pintar yang menangani dua skenario sekaligus (Tambah data baru ATAU Update data lama)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // Menghentikan perilaku bawaan browser agar halaman tidak me-refresh otomatis
    setIsSubmitting(true); // Kunci tombol submit

    // 1. VALIDASI: Memastikan nomor meja diinput dalam format angka asli
    const parsedTableNumber = parseInt(form.meja, 10);
    if (isNaN(parsedTableNumber)) {
      toast.error('Nomor meja harus berupa angka! (Contoh: 6)');
      setIsSubmitting(false);
      return; // Batalkan eksekusi kodingan di bawah jika tidak valid
    }

    // 2. FORMATTING TANGGAL: Menggabungkan input tanggal dan jam menjadi format ISO Standard yang dimengerti database MySQL/Postgres
    let validIsoDate: string;
    try {
      // Menggabungkan string, contoh: "2026-06-02" + "T" + "19:00"
      const localDateTime = new Date(`${form.tanggal}T${form.jam}`);
      if (isNaN(localDateTime.getTime())) {
        throw new Error("Format tanggal atau jam tidak valid.");
      }
      validIsoDate = localDateTime.toISOString(); // Menghasilkan format standar internasional, contoh: 2026-06-02T12:00:00.000Z
    } catch (err) {
      toast.error('Format tanggal atau jam salah. Mohon periksa kembali inputan Anda.');
      setIsSubmitting(false);
      return;
    }

    // Memicu animasi loading berjalan di pojok kanan atas screen
    const reservationToastId = toast.loading(form.id ? 'Memperbarui data reservasi...' : 'Menyimpan reservasi baru...');

    // 3. CLEAN PAYLOAD: Membangun objek data bersih yang siap dikirim via body JSON ke backend
    const payload: any = {
      customerName: form.nama.trim(), // `.trim()` menghapus spasi kosong yang tidak sengaja terketik di awal/akhir nama
      phoneNumber: form.telepon.trim(),
      reservationDate: validIsoDate,
      totalGuest: Number(form.jumlahOrang),
      tableNumber: parsedTableNumber,
      status: form.status 
    };

    try {
      const token = localStorage.getItem('token');
      
      // LOGIKA KONDISIONAL URL & METHOD: 
      // Jika `form.id` ada -> Arahkan ke URL spesifik id dengan method PUT (Edit)
      // Jika `form.id` null -> Arahkan ke URL dasar dengan method POST (Tambah Baru)
      const url = form.id
        ? `${API_BASE_URL}/reservation/${form.id}`
        : `${API_BASE_URL}/reservation`;
      const method = form.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json', // Menegaskan bahwa data yang dikirim berwujud JSON string
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload) // Mengubah objek javascript menjadi string teks JSON
      });

      const result = await response.json();
      if (!response.ok) {
        // Mengamankan pesan error, jika backend mengembalikan pesan error dalam bentuk array, ambil indeks pertama
        const errorMsg = Array.isArray(result.message) ? result.message[0] : result.message;
        throw new Error(errorMsg || 'Gagal menyimpan data.');
      }

      // Mengubah loading toast sebelumnya menjadi pemberitahuan sukses tanpa membuat pop-up baru
      toast.success(form.id ? 'Data reservasi diperbarui!' : 'Reservasi baru berhasil dibuat!', { id: reservationToastId });

      // RESET FORM: Mengosongkan kembali seluruh inputan form setelah proses input sukses meluncur ke database
      setForm({ id: null, nama: '', telepon: '', meja: '', tanggal: '', jam: '', jumlahOrang: 2, status: 'PENDING' });
      fetchArticles(); // REFRESH DATA: Mengambil data terbaru secara realtime agar tabel langsung terupdate otomatis
    } catch (error: any) {
      console.error('Submit Error:', error);
      toast.error(error.message || 'Terjadi kesalahan internal pada server.', { id: reservationToastId });
    } finally {
      setIsSubmitting(false); // Buka kembali kunci tombol submit
    }
  };

  // --- FEATURE 3: LIVE FILTER & SEARCH FRONTEND ---
  // Fungsi ini otomatis berjalan setiap kali user mengetik sesuatu di pencarian nama atau mengganti filter tanggal
  const filteredReservasis = reservasis.filter(r => {
    const nameToClean = r.customerName || '';
    // Mencocokkan nama customer dengan query ketikan (diubah ke lowercase agar tidak sensitif huruf besar/kecil)
    const matchesSearch = nameToClean.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Memotong string tanggal ISO ("2026-06-02T19:00...") agar hanya diambil bagian tanggalnya saja ("2026-06-02")
    const cleanResDate = r.reservationDate ? r.reservationDate.split('T')[0] : '';
    // Jika input filter tanggal kosong, otomatis dianggap lolos seleksi (`true`)
    const matchesDate = filterDate ? cleanResDate === filterDate : true;
    
    return matchesSearch && matchesDate; // Menyaring baris data yang lolos kedua kriteria filter di atas
  });

  return (
    <main className="bg-[#090705] min-h-screen text-[#f3f1ed] antialiased">
      {/* KONTROLLER POP-UP NOTIFIKASI: Mengonfigurasi warna, font, dan kosmetik UI kemunculan Toast */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#120f0b',
            color: '#f3f1ed',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            fontSize: '12px',
          },
          success: {
            iconTheme: {
              primary: '#d4af37', // Menggunakan warna gold luxury khas tema resto
              secondary: '#090705',
            },
          },
        }}
      />

      {/* Menampilkan Navigasi Atas */}
      <Navbar />

      <div className="max-w-8xl mx-auto pt-28 px-6 md:px-12 pb-12 animate-fadeIn">
        <div className="space-y-4 mb-6">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-brand-goldDim uppercase mb-1 font-medium">Staff Portal</div>
            <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide">
              Portal <span className="text-brand-gold italic">Operasional</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {/* Navigasi Pindah Halaman ke Kasir POS (Point of Sales) */}
            <Link href="/kasir/transaksi" className="border border-white/10 text-gray-500 font-medium text-xs tracking-widest uppercase px-5 py-3 flex items-center gap-2 hover:text-[#f3f1ed] hover:border-white/20 transition duration-300">
              <span>⊞</span> Ke Kasir POS
            </Link>
            <button className="bg-brand-gold text-[#090705] font-semibold text-xs tracking-widest uppercase px-5 py-3 flex items-center gap-2 border border-brand-gold cursor-pointer">
              <span>⚙</span> Kelola Reservasi
            </button>
          </div>
        </div>

        <hr className="w-full border-white/[0.05] mt-6 mb-8" />

        {/* --- UI INPUT PENCARIAN & FILTER --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Kolom Teks Pencarian Nama */}
          <div>
            <label className="text-[10px] text-brand-goldDim uppercase tracking-wider block mb-1">Cari Nama Customer</label>
            <input
              type="text"
              placeholder="Ketik nama customer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} // Mengupdate isi query setiap user mengetik huruf baru
              className="w-full bg-[#120f0b] border border-white/5 p-3 text-xs outline-none focus:border-brand-gold text-white transition placeholder:opacity-30"
            />
          </div>
          {/* Kalender Filter Tanggal */}
          <div>
            <label className="text-[10px] text-brand-goldDim uppercase tracking-wider block mb-1">Filter Tanggal</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="w-full bg-[#120f0b] border border-white/5 p-3 text-xs outline-none focus:border-brand-gold text-white transition"
              />
              {/* Tombol Reset: Hanya muncul apabila filter kalender sedang terisi sesuatu */}
              {filterDate && (
                <button onClick={() => setFilterDate('')} className="bg-white/5 border border-white/10 text-xs px-3 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer">
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- AREA UTAMA COMPONENT GRID (FORM & TABEL) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* SISI KIRI: PANEL INPUT FORMULIR */}
          <div className="lg:col-span-4 bg-[#120f0b] p-6 border border-white/[0.03] sticky top-28 shadow-xl">
            {/* Judul form dinamis mengikuti kondisi state `form.id` */}
            <h3 className="font-serif text-sm tracking-wide text-brand-gold mb-4 uppercase">
              {form.id ? "🖋️ Edit Data Reservasi" : " Buka Buku Reservasi"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <input type="text" placeholder="Nama Tamu" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required className="w-full bg-black/40 border border-white/5 p-3 text-xs outline-none focus:border-brand-gold text-white transition placeholder:opacity-30" />
              </div>

              <div>
                <input type="text" placeholder="Nomor Telepon" value={form.telepon} onChange={e => setForm({ ...form, telepon: e.target.value })} required className="w-full bg-black/40 border border-white/5 p-3 text-xs outline-none focus:border-brand-gold text-white transition placeholder:opacity-30" />
              </div>

              <div>
                <input type="number" placeholder="Nomor Meja (Angka, contoh: 6)" value={form.meja} onChange={e => setForm({ ...form, meja: e.target.value })} required className="w-full bg-black/40 border border-white/5 p-3 text-xs outline-none focus:border-brand-gold text-white transition placeholder:opacity-30" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} required className="bg-black/40 border border-white/5 p-3 text-xs outline-none focus:border-brand-gold text-white transition cursor-pointer" />
                <input type="time" value={form.jam} onChange={e => setForm({ ...form, jam: e.target.value })} required className="bg-black/40 border border-white/5 p-3 text-xs outline-none focus:border-brand-gold text-white transition cursor-pointer" />
              </div>

              <div>
                <input type="number" placeholder="Jumlah Pax" value={form.jumlahOrang || ''} onChange={e => setForm({ ...form, jumlahOrang: Number(e.target.value) })} required className="w-full bg-black/40 border border-white/5 p-3 text-xs outline-none focus:border-brand-gold text-white transition placeholder:opacity-30" />
              </div>

              <div>
                <label className="text-[10px] text-brand-goldDim uppercase tracking-wider block mb-1">Status Reservasi</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full bg-black/40 border border-white/5 p-3 text-xs outline-none focus:border-brand-gold text-white cursor-pointer transition">
                  <option value="PENDING" className="bg-[#120f0b]"> PENDING</option>
                  <option value="CONFIRMED" className="bg-[#120f0b]"> CONFIRMED</option>
                </select>
              </div>

              {/* Tombol Eksekusi Utama */}
              <button type="submit" disabled={isSubmitting} className="w-full bg-brand-gold text-[#090705] text-xs font-semibold py-3.5 uppercase tracking-widest hover:opacity-90 transition duration-300 cursor-pointer disabled:opacity-40">
                {isSubmitting ? "Memproses..." : form.id ? "Perbarui Jadwal" : "Simpan Jadwal"}
              </button>
              
              {/* Tombol Tambahan: Hanya muncul saat form sedang berada di dalam mode Edit data */}
              {form.id && (
                <button type="button" onClick={() => setForm({ id: null, nama: '', telepon: '', meja: '', tanggal: '', jam: '', jumlahOrang: 2, status: 'PENDING' })} className="w-full bg-white/5 border border-white/10 text-xs py-2 text-gray-400 hover:text-white uppercase tracking-widest transition mt-1 cursor-pointer">
                  Batal Edit
                </button>
              )}
            </form>
          </div>

          {/* SISI KANAN: TABEL REKAP DATA RESERVASI */}
          <div className="lg:col-span-8 bg-[#120f0b]/40 border border-white/[0.02] p-4 sm:p-6 shadow-md overflow-hidden">
            <h3 className="font-serif text-sm tracking-wide text-[#9f9990] mb-4 uppercase font-light"> Daftar Reservasi Terjadwal</h3>

            <div className="overflow-x-auto w-full custom-scrollbar">
              <table className="w-full text-left text-xs font-light whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-brand-goldDim text-[10px] uppercase font-mono tracking-wider">
                    <th className="pb-3 px-2">Nama Tamu / Telp</th>
                    <th className="pb-3 px-2">Meja</th>
                    <th className="pb-3 px-2">Jadwal Kedatangan</th>
                    <th className="pb-3 px-2">Pax</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {/* PENGKONDISIAN 1: Jika server sedang sibuk mendownload data */}
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs tracking-widest text-brand-goldDim animate-pulse">
                        MENYINKRONKAN DATA RESERVASI...
                      </td>
                    </tr>
                  ) : filteredReservasis.length > 0 ? (
                    // PENGKONDISIAN 2: Jika data berhasil dimuat dan jumlahnya di atas 0 baris
                    filteredReservasis.map(r => {
                      // Memilah string ISO gabungan database menjadi teks tanggal terpisah (YYYY-MM-DD)
                      const displayDate = r.reservationDate ? r.reservationDate.split('T')[0] : '—';
                      // Memilah string ISO gabungan menjadi jam dan menit terpisah (HH:MM)
                      const displayTime = r.reservationDate && r.reservationDate.includes('T')
                        ? r.reservationDate.split('T')[1].substring(0, 5)
                        : '00:00';

                      return (
                        <tr key={r.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-3.5 px-2 font-serif text-sm text-[#f3f1ed]">
                            <div>{r.customerName}</div>
                            <div className="text-[10px] text-gray-500 font-mono tracking-wide mt-0.5">{r.phoneNumber || '—'}</div>
                          </td>
                          <td className="py-3.5 px-2 font-serif text-xs text-brand-gold">Meja {r.tableNumber}</td>
                          <td className="py-3.5 px-2 font-mono text-[11px] text-gray-400">
                            {displayDate} · <span className="text-brand-goldDim">{displayTime}</span>
                          </td>
                          <td className="py-3.5 px-2 font-medium">{r.totalGuest} Pax</td>
                          <td className="py-3.5 px-2">
                            {/* Mewarnai lencana status (Badge) secara dinamis menggunakan logika ternary CSS */}
                            <span className={`px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider border ${r.status === 'CONFIRMED' ? 'text-green-400 border-green-500/20 bg-green-500/5' :
                                r.status === 'PENDING' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' :
                                  'text-red-400 border-red-500/20 bg-red-500/5'
                              }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <div className="flex items-center justify-center">
                              {/* TOMBOL EDIT: Saat diklik, fungsi ini akan melempar seluruh data baris tabel ini ke dalam state `form` sehingga panel kiri otomatis berubah isi inputannya menjadi data lama yang siap diedit */}
                              <button
                                onClick={() => setForm({
                                  id: r.id,
                                  nama: r.customerName,
                                  telepon: r.phoneNumber || '',
                                  meja: String(r.tableNumber),
                                  tanggal: displayDate,
                                  jam: displayTime,
                                  jumlahOrang: r.totalGuest,
                                  status: r.status
                                })}
                                className="text-gray-400 hover:text-brand-gold text-xs transition font-medium cursor-pointer"
                              >
                                ✎ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    // PENGKONDISIAN 3: Jika data kosong / tidak ada hasil pencarian yang cocok
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-600 italic">
                        Tidak ada data reservasi ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}