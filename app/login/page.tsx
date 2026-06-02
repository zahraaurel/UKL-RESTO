'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// Import library react-hot-toast untuk mengaktifkan notifikasi
import toast, { Toaster } from 'react-hot-toast';

// Menggunakan jalur proxy lokal yang sudah dikonfigurasi di next.config.mjs sebelumnya
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api-railway';

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  
  // State untuk menangkap data form
  const [role, setRole] = useState<string>('Kasir');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle pengiriman data login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    // Memicu kemunculan toast loading saat tombol ditekan
    const loginToastId = toast.loading('Memverifikasi kredensial akun Anda...');

    // Payload body diselaraskan dengan JSON mentah di Postman
    const payload = {
      email: email.trim(),
      password: password
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika server mengembalikan pesan error (misal kredensial salah)
        const parsedError = Array.isArray(data.message) ? data.message[0] : data.message;
        throw new Error(parsedError || 'Email atau password Anda salah.');
      }

      // Validasi tambahan: Mencocokkan role pilihan user di form dengan role asli dari database API
      const userRoleFromAPI = data.user?.role; // Menghasilkan string kapital penuh ("KASIR" atau "ADMIN")
      
      if (role.toUpperCase() !== userRoleFromAPI) {
        throw new Error(`Akses ditolak. Akun Anda terdaftar sebagai ${userRoleFromAPI}, bukan ${role}.`);
      }

      // LOGIN BERHASIL: Amankan data token ke penyimpanan lokal browser (localStorage)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Ubah state toast loading menjadi sukses secara instan
      toast.success(`Login Berhasil! Selamat datang, ${data.user.username}.`, { id: loginToastId });

      // Mengarahkan halaman tujuan operasional secara otomatis berdasarkan hak akses role
      if (userRoleFromAPI === 'KASIR') {
        router.push('/kasir/dashboard');
      } else if (userRoleFromAPI === 'ADMIN') {
        router.push('/admin/dashboard');
      }

    } catch (error: any) {
      console.error('Login Error:', error);
      const msg = error.message || 'Terjadi gangguan saat menghubungkan ke server.';
      setErrorMsg(msg);
      // Ubah state toast loading menjadi gagal
      toast.error(msg, { id: loginToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090705] flex justify-center items-center px-4 antialiased selection:bg-brand-gold selection:text-background">
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

      {/* Box Card Login */}
      <div className="w-full max-w-lg bg-[#120f0b] border border-white/[0.03] p-10 md:p-14 relative shadow-2xl">
        
        {/* Tombol Close (X) */}
        <button 
          onClick={() => router.push('/')} 
          className="absolute top-6 right-8 text-gray-500 hover:text-brand-gold text-lg transition duration-200 cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl text-[#f3f1ed] font-light tracking-wide">
            Portal <span className="text-brand-gold italic">Staff</span>
          </h1>
          <p className="text-xs text-[#9f9990] font-light mt-2 tracking-wide">
            Masukkan kredensial Anda untuk mengakses sistem
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Input Pilihan Role */}
          <div className="space-y-2">
            <label className="block text-[10px] tracking-[0.2em] text-[#866d47] font-semibold uppercase">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.05] text-[#f3f1ed] text-sm font-light px-4 py-3.5 outline-none focus:border-brand-gold transition duration-300 rounded-none appearance-none cursor-pointer"
            >
              <option value="Kasir" className="bg-[#120f0b] text-[#f3f1ed]">Kasir</option>
              <option value="Admin" className="bg-[#120f0b] text-[#f3f1ed]">Admin</option>
            </select>
          </div>

          {/* Input Username */}
          <div className="space-y-2">
            <label className="block text-[10px] tracking-[0.2em] text-[#866d47] font-semibold uppercase">
              Email
            </label>
            <input
              type="email"
              placeholder="email@maisondor.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/40 border border-white/[0.05] text-[#f3f1ed] text-sm font-light px-4 py-3.5 outline-none focus:border-brand-gold placeholder:text-gray-700 transition duration-300 rounded-none"
            />
          </div>

          {/* Input Password */}
          <div className="space-y-2">
            <label className="block text-[10px] tracking-[0.2em] text-[#866d47] font-semibold uppercase">
              Password
            </label>
            <input
              type="password"
              placeholder="........"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/40 border border-white/[0.05] text-[#f3f1ed] text-sm font-light px-4 py-3.5 outline-none focus:border-brand-gold placeholder:text-gray-700 transition duration-300 rounded-none"
            />
          </div>

          {/* Pesan Error jika salah input atau ditolak backend */}
          {errorMsg && (
            <div className="text-xs text-red-400 font-light tracking-wide bg-red-950/20 py-2 px-3 border border-red-900/30 animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-gold text-[#090705] font-medium text-xs tracking-[0.3em] uppercase py-4 mt-4 hover:bg-brand-gold/90 transition duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>

        {/* --- REGISTER --- */}
        <div className="text-center pt-8 border-t border-white/[0.02] mt-6">
          <p className="text-xs text-[#9f9990] font-light">
            Belum memiliki akun operasional?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-brand-gold hover:text-white transition duration-200 font-medium cursor-pointer underline underline-offset-4 decoration-brand-gold/40 hover:decoration-white"
            >
              Daftar Akun Baru
            </button>
          </p>
        </div>

      </div>
    </main>
  );
}