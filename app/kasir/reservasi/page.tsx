'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/NavbarKasir';
import Link from 'next/link';
// Import library react-hot-toast untuk animasi feedback
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = '/api-railway';

// Struktur data disesuaikan persis dengan response JSON yang Anda berikan
interface BackendReservation {
  id: number;
  customerName: string;
  phoneNumber: string;
  reservationDate: string;
  totalGuest: number;
  tableNumber: number;
  status: 'CONFIRMED' | 'PENDING' 
  cashierId?: number;
  createdAt?: string;
  updatedAt?: string;
  cashier?: {
    id: number;
    username: string;
  };
}

export default function AdminReservasiPage(): React.JSX.Element {
  // --- STATE UTAMA ---
  const [reservasis, setReservasis] = useState<BackendReservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [form, setForm] = useState({
    id: null as number | null,
    nama: '',
    telepon: '',
    meja: '',
    tanggal: '',
    jam: '',
    jumlahOrang: 2,
    status: 'PENDING' as 'CONFIRMED' | 'PENDING' 
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // --- FEATURE 1: GET RESERVASI ---
  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/reservation`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (!response.ok) throw new Error('Gagal mengambil data reservasi.');
      const data = await response.json();
      setReservasis(data);
    } catch (error) {
      console.error('Error Fetch:', error);
      toast.error('Gagal memuat daftar reservasi dari database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // --- FEATURE 2: POST (ADD) / PUT (EDIT) ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Validasi Nomor Meja (Wajib Angka)
    const parsedTableNumber = parseInt(form.meja, 10);
    if (isNaN(parsedTableNumber)) {
      toast.error('Nomor meja harus berupa angka! (Contoh: 6)');
      setIsSubmitting(false);
      return;
    }

    // 2. Format Tanggal & Jam Menjadi ISO Standard yang Valid
    let validIsoDate: string;
    try {
      const localDateTime = new Date(`${form.tanggal}T${form.jam}`);
      if (isNaN(localDateTime.getTime())) {
        throw new Error("Format tanggal atau jam tidak valid.");
      }
      validIsoDate = localDateTime.toISOString();
    } catch (err) {
      toast.error('Format tanggal atau jam salah. Mohon periksa kembali inputan Anda.');
      setIsSubmitting(false);
      return;
    }

    // Memicu pemicuan toast loading stream
    const reservationToastId = toast.loading(form.id ? 'Memperbarui data reservasi...' : 'Menyimpan reservasi baru...');

    // 3. Bangun Payload Bersih Sesuai Format JSON Anda
    const payload: any = {
      customerName: form.nama.trim(),
      phoneNumber: form.telepon.trim(),
      reservationDate: validIsoDate,
      totalGuest: Number(form.jumlahOrang),
      tableNumber: parsedTableNumber,
      status: form.status 
    };

    try {
      const token = localStorage.getItem('token');
      const url = form.id
        ? `${API_BASE_URL}/reservation/${form.id}`
        : `${API_BASE_URL}/reservation`;
      const method = form.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        const errorMsg = Array.isArray(result.message) ? result.message[0] : result.message;
        throw new Error(errorMsg || 'Gagal menyimpan data.');
      }

      toast.success(form.id ? 'Data reservasi diperbarui!' : 'Reservasi baru berhasil dibuat!', { id: reservationToastId });

      // Reset Form setelah sukses meluncur ke database
      setForm({ id: null, nama: '', telepon: '', meja: '', tanggal: '', jam: '', jumlahOrang: 2, status: 'PENDING' });
      fetchReservations(); // Refresh tabel data secara realtime
    } catch (error: any) {
      console.error('Submit Error:', error);
      toast.error(error.message || 'Terjadi kesalahan internal pada server.', { id: reservationToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReservasis = reservasis.filter(r => {
    const nameToClean = r.customerName || '';
    const matchesSearch = nameToClean.toLowerCase().includes(searchQuery.toLowerCase());
    const cleanResDate = r.reservationDate ? r.reservationDate.split('T')[0] : '';
    const matchesDate = filterDate ? cleanResDate === filterDate : true;
    return matchesSearch && matchesDate;
  });

  return (
    <main className="bg-[#090705] min-h-screen text-[#f3f1ed] antialiased">
      {/* Provider Toaster Custom Luxury UI Theme */}
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
              primary: '#d4af37',
              secondary: '#090705',
            },
          },
        }}
      />

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
            <Link href="/kasir/transaksi" className="border border-white/10 text-gray-500 font-medium text-xs tracking-widest uppercase px-5 py-3 flex items-center gap-2 hover:text-[#f3f1ed] hover:border-white/20 transition duration-300">
              <span>⊞</span> Ke Kasir POS
            </Link>
            <button className="bg-brand-gold text-[#090705] font-semibold text-xs tracking-widest uppercase px-5 py-3 flex items-center gap-2 border border-brand-gold cursor-pointer">
              <span>⚙</span> Kelola Reservasi
            </button>
          </div>
        </div>

        <hr className="w-full border-white/[0.05] mt-6 mb-8" />

        {/* SEARCH & FILTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-[10px] text-brand-goldDim uppercase tracking-wider block mb-1">Cari Nama Customer</label>
            <input
              type="text"
              placeholder="Ketik nama customer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#120f0b] border border-white/5 p-3 text-xs outline-none focus:border-brand-gold text-white transition placeholder:opacity-30"
            />
          </div>
          <div>
            <label className="text-[10px] text-brand-goldDim uppercase tracking-wider block mb-1">Filter Tanggal</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="w-full bg-[#120f0b] border border-white/5 p-3 text-xs outline-none focus:border-brand-gold text-white transition"
              />
              {filterDate && (
                <button onClick={() => setFilterDate('')} className="bg-white/5 border border-white/10 text-xs px-3 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer">
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* INPUT FORM */}
          <div className="lg:col-span-4 bg-[#120f0b] p-6 border border-white/[0.03] sticky top-28 shadow-xl">
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

              <button type="submit" disabled={isSubmitting} className="w-full bg-brand-gold text-[#090705] text-xs font-semibold py-3.5 uppercase tracking-widest hover:opacity-90 transition duration-300 cursor-pointer disabled:opacity-40">
                {isSubmitting ? "Memproses..." : form.id ? "Perbarui Jadwal" : "Simpan Jadwal"}
              </button>
              {form.id && (
                <button type="button" onClick={() => setForm({ id: null, nama: '', telepon: '', meja: '', tanggal: '', jam: '', jumlahOrang: 2, status: 'PENDING' })} className="w-full bg-white/5 border border-white/10 text-xs py-2 text-gray-400 hover:text-white uppercase tracking-widest transition mt-1 cursor-pointer">
                  Batal Edit
                </button>
              )}
            </form>
          </div>

          {/* TABEL DATA */}
          <div className="lg:col-span-8 bg-[#120f0b]/40 border border-white/[0.02] p-4 sm:p-6 shadow-md overflow-hidden">
            <h3 className="font-serif text-sm tracking-wide text-[#9f9990] mb-4 uppercase font-light">📋 Daftar Reservasi Terjadwal</h3>

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
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs tracking-widest text-brand-goldDim animate-pulse">
                        MENYINKRONKAN DATA RESERVASI...
                      </td>
                    </tr>
                  ) : filteredReservasis.length > 0 ? (
                    filteredReservasis.map(r => {
                      const displayDate = r.reservationDate ? r.reservationDate.split('T')[0] : '—';
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
                            <span className={`px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider border ${r.status === 'CONFIRMED' ? 'text-green-400 border-green-500/20 bg-green-500/5' :
                                r.status === 'PENDING' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' :
                                  'text-red-400 border-red-500/20 bg-red-500/5'
                              }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <div className="flex items-center justify-center">
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