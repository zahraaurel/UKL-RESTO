'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    // Fungsi untuk menangani aksi logout
    const handleLogout = (e) => {
        e.preventDefault();
        const konfirmasi = confirm("Apakah Anda yakin ingin keluar dari sistem admin?");
        
        if (konfirmasi) {
            // Hapus session/token di sini jika ada (contoh: localStorage/sessionStorage)
            // localStorage.removeItem('token');
            
            alert("Anda telah berhasil keluar.");
            setSidebarOpen(false); // Tutup sidebar
            router.push('/login'); // Arahkan ke halaman login
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 bg-brand-dark/80 backdrop-blur-md px-8 py-6 flex justify-between items-center border-b border-white/5">
                {/* Logo */}
                <div className="text-xl font-serif italic text-brand-gold tracking-wide cursor-pointer">
                    <a href="/admin/dashboard">Maison d'Or</a>
                </div>

                {/* Tombol Sidebar */}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="border border-brand-gold px-4 py-2 text-xs tracking-widest text-brand-gold hover:bg-brand-gold hover:text-black transition duration-300 cursor-pointer" aria-label="Toggle Sidebar">
                    ☰
                </button>
            </nav>

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-64 bg-brand-dark/95 backdrop-blur-md border-l border-white/5 z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-8 pt-24 text-left flex flex-col space-y-3">
                    <button onClick={() => setSidebarOpen(false)} className="absolute top-6 right-6 text-brand-gold text-xl cursor-pointer">✕</button>
                    
                    {/* Link Navigasi */}
                    <a href="/admin/dashboard" className="block text-brand-gold hover:text-white transition py-2 text-sm tracking-wide">Beranda</a>
                    <a href="/admin/menu" className="block text-brand-gold hover:text-white transition py-2 text-sm tracking-wide">Menu</a>
                    <a href="/admin/transaksi" className="block text-brand-gold hover:text-white transition py-2 text-sm tracking-wide">Transaksi</a>
                    <a href="/admin/reservasi" className="block text-brand-gold hover:text-white transition py-2 text-sm tracking-wide">Reservasi</a>
                    
                    {/* Pembatas Elemen Menu */}
                    <hr className="border-white/10 my-4" />

                    {/* Tombol Logout */}
                    <button 
                        onClick={handleLogout} 
                        className="w-full text-left text-red-400 hover:text-red-500 font-medium transition py-2 text-sm tracking-wide cursor-pointer flex items-center gap-2"
                    >
                        🚪 Keluar (Logout)
                    </button>
                </div>
            </div>
        </>
    );
}