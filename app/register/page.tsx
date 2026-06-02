'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// Import library react-hot-toast untuk animasi feedback
import toast, { Toaster } from 'react-hot-toast';

// Ganti URL langsung Railway menjadi rute proxy lokal
const API_BASE_URL = '/api-railway';

export default function RegisterPage(): React.JSX.Element {
  const router = useRouter();
  
  // State untuk menentukan peran (Role) yang sedang dipilih
  const [role, setRole] = useState<'kasir' | 'admin'>('kasir');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // State untuk menangkap data dari form input
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: '' // Kunci keamanan khusus untuk pendaftaran Admin lokal frontend
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi lokal kecocokan password dengan feedback toast error
    if (formData.password !== formData.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok!");
      return;
    }

    setIsSubmitting(true);
    // Memicu pemicuan toast loading stream
    const registerToastId = toast.loading('Mendaftarkan akun staf baru ke server...');

    // 3. Sinkronisasi struktur payload dengan Postman (menggunakan uppercase untuk role)
    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: role.toUpperCase() // Mengubah 'kasir' -> 'KASIR', 'admin' -> 'ADMIN'
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const parsedError = Array.isArray(data.message) ? data.message[0] : data.message;
        throw new Error(parsedError || 'Gagal melakukan registrasi');
      }

      // Notifikasi Berhasil Berdasarkan Response API Postman
      toast.success(data.message || 'Akun Anda telah terdaftar berhasil!', { id: registerToastId });
      
      // Alihkan ke halaman login setelah berhasil
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (error: any) {
      console.error('Register Error:', error);
      toast.error(error.message || 'Terjadi kesalahan saat menyambungkan ke server.', { id: registerToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-[#090705] text-[#f3f1ed] min-h-screen antialiased flex flex-col justify-center items-center px-6 py-12">
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

      <div className="w-full max-w-md bg-[#120f0b] border border-white/[0.03] p-8 shadow-xl backdrop-blur-md animate-fadeIn">
        
        {/* Header Form */}
        <div className="text-center space-y-2 mb-8">
          <div className="text-[10px] tracking-[0.3em] text-brand-gold font-medium uppercase">
            Maison d'Or Internal Portal
          </div>
          <h1 className="font-serif text-3xl font-light tracking-wide">
            Pembuatan <span className="italic text-brand-gold">Akun Baru</span>
          </h1>
          <p className="text-xs text-[#9f9990] opacity-60 max-w-xs mx-auto">
            Daftarkan akun staf resmi untuk mengakses panel operasional restoran.
          </p>
        </div>

        {/* Tab Selector Role (Kasir / Admin) */}
        <div className="grid text-[10px] tracking-[0.2em] grid-cols-2 gap-2 p-1 bg-black/40 text-[#866d47] border border-white/[0.05] mb-6">
          <button
            type="button"
            onClick={() => { setRole('kasir'); setFormData(p => ({ ...p, secretKey: '' })); }}
            className={`py-2.5 text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
              role === 'kasir' ? 'bg-[#f3f1ed] text-[#090705] shadow' : 'opacity-60 hover:opacity-100'
            }`}
          >
             Kasir
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`py-2.5 text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
              role === 'admin' ? 'bg-[#f3f1ed] text-[#090705] shadow' : 'opacity-60 hover:opacity-100'
            }`}
          >
             Admin
          </button>
        </div>

        {/* Formulir Pendaftaran */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-[#866d47] font-semibold uppercase">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="Masukkan username"
              className="w-full bg-black/40 border border-white/[0.05] p-3 text-xs outline-none focus:border-brand-gold transition text-[#f3f1ed] placeholder:text-gray-700"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.2em] text-[#866d47] font-semibold uppercase">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="nama@maisondor.com"
              className="w-full bg-black/40 border border-white/[0.05] p-3 text-xs outline-none focus:border-brand-gold transition text-[#f3f1ed] placeholder:text-gray-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-[#866d47] font-semibold uppercase">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/[0.05] p-3 text-xs outline-none focus:border-brand-gold transition text-[#f3f1ed] placeholder:text-gray-700"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-[#866d47] font-semibold uppercase">Konfirmasi Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/[0.05] p-3 text-xs outline-none focus:border-brand-gold transition text-[#f3f1ed] placeholder:text-gray-700"
              />
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-gold text-[#090705] font-semibold text-xs tracking-widest uppercase py-4 mt-2 hover:bg-brand-gold/90 transition duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Memproses...' : `Daftar Sebagai ${role === 'admin' ? 'Admin' : 'Kasir'}`}
          </button>
        </form>

        {/* Link Footer */}
        <div className="text-center pt-6 text-xs text-[#9f9990] opacity-60 font-light">
          Sudah memiliki akun?{' '}
          <a href="/login" className="text-brand-gold hover:underline font-medium">
            Masuk di sini
          </a>
        </div>

      </div>
    </main>
  );
}