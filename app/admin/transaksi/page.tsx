'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/NavbarAdmin';
import Link from 'next/link';
// Import library react-hot-toast untuk animasi feedback secara global di page ini
import toast, { Toaster } from 'react-hot-toast';

// Menggunakan proxy lokal /api-railway untuk menghindari blokir CORS browser
const API_BASE_URL = '/api-railway';

// --- DEFINISI INTERFACE SESUAI DATA REAL POSTMAN ---
interface CategoryBackend {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MenuBackend {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
  createdAt?: string;
  updatedAt?: string;
  category: CategoryBackend; 
}

interface OrderDetailBackend {
  id: number;
  transactionId: number;
  menuId: number;
  quantity: number;
  subtotal: number;
  createdAt?: string;
  updatedAt?: string;
  menu: Omit<MenuBackend, 'category'>; 
}

interface TransactionBackend {
  id: number;
  customerName: string;
  totalPrice: number;
  paymentMethod: 'CASH' | 'QRIS' | 'DEBIT';
  status: 'PAID' | 'PENDING';
  cashierId: number;
  createdAt?: string;
  updatedAt?: string;
  details?: OrderDetailBackend[]; 
  cashier?: {
    id: number;
    username: string;
  };
}

interface CartItem {
  menuItem: MenuBackend;
  quantity: number;
}

export default function AdminTransaksiPage(): React.JSX.Element {
  // --- STATE MANAGEMENT ---
  const [transaksis, setTransaksis] = useState<TransactionBackend[]>([]);
  const [menuList, setMenuList] = useState<MenuBackend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- STATE FORM POS KASIR ---
  const [custName, setCustName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'DEBIT'>('CASH');
  const [cart, setCart] = useState<CartItem[]>([]);

  // --- FEATURE 1: READ DATA (GET MENU & GET TRANSACTION) ---
  const fetchDataOperational = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      };

      // Tarik Data Menu Restoran
      const menuRes = await fetch(`${API_BASE_URL}/menu`, { headers });
      const menuData = await menuRes.json();

      // Tarik Data Riwayat Log Transaksi
      const transRes = await fetch(`${API_BASE_URL}/transaction`, { headers });
      const transData = await transRes.json();

      // EKSTRAKSI DATA: Mengantisipasi jika data dibungkus dalam properti .data oleh backend
      if (menuRes.ok) {
        setMenuList(Array.isArray(menuData.data) ? menuData.data : menuData);
      }
      if (transRes.ok) {
        setTransaksis(Array.isArray(transData.data) ? transData.data : transData);
      }
    } catch (error) {
      console.error('Koneksi API bermasalah:', error);
      toast.error('Gagal memuat log transaksi dari database Restoran.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataOperational();
  }, []);

  // --- HANDLER OPERASI KERANJANG BELANJA (POS) ---
  const addToCart = (item: MenuBackend) => {
    const existing = cart.find(cartItem => cartItem.menuItem.id === item.id);
    if (existing) {
      setCart(cart.map(cartItem => 
        cartItem.menuItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      ));
    } else {
      setCart([...cart, { menuItem: item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: number) => {
    const existing = cart.find(cartItem => cartItem.menuItem.id === itemId);
    if (!existing) return;

    if (existing.quantity === 1) {
      setCart(cart.filter(cartItem => cartItem.menuItem.id !== itemId));
    } else {
      setCart(cart.map(cartItem =>
        cartItem.menuItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
      ));
    }
  };

  const calculateTotal = () => cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);

  // --- FEATURE 2: CREATE TRANSACTION (POST DATA) ---
  const handleProsesTransaksi = async () => {
    if (cart.length === 0) {
      toast.error('Mohon pilih menu terlebih dahulu ke dalam keranjang!');
      return;
    }
    if (!custName.trim()) {
      toast.error('Nama lengkap pelanggan wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    const orderToastId = toast.loading('Memproses invoice pembayaran POS...');

    // Format payload body disamakan persis dengan parameter Postman Anda ({ menuId, quantity })
    const detailsPayload = cart.map(item => ({
      menuId: Number(item.menuItem.id),
      quantity: Number(item.quantity)
    }));

    const payload = {
      customerName: custName.trim(),
      paymentMethod: paymentMethod,
      details: detailsPayload
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        const errorMsg = Array.isArray(result.message) ? result.message[0] : result.message;
        throw new Error(errorMsg || 'Gagal memproses pembuatan transaksi baru.');
      }

      toast.success('Transaksi POS Berhasil Disimpan ke Sistem!', { id: orderToastId });
      setCart([]);
      setCustName('');
      setPaymentMethod('CASH');
      fetchDataOperational(); // Tarik ulang data untuk memperbarui stok & tabel riwayat log
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan jaringan.', { id: orderToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FEATURE 3: DELETE TRANSACTION ---
  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Hapus record riwayat transaksi ini secara permanen dari server?')) return;

    const deletionToastId = toast.loading('Menghapus log pembayaran...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/transaction/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });

      if (!response.ok) {
        const result = await response.json();
        const errorMsg = Array.isArray(result.message) ? result.message[0] : result.message;
        throw new Error(errorMsg || 'Gagal menghapus entri log transaksi.');
      }

      toast.success('Log transaksi berhasil dihapus dari sistem.', { id: deletionToastId });
      fetchDataOperational();
    } catch (error: any) {
      toast.error(error.message, { id: deletionToastId });
    }
  };

  return (
    <main className="bg-[#090705] min-h-screen text-[#f3f1ed] antialiased pb-24">
      {/* Provider Toast dengan kustomisasi Luxury UI Theme */}
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

      <div className="max-w-7xl mx-auto pt-28 px-6 md:px-12 animate-fadeIn">
        
        {/* HEADER PORTAL */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-brand-goldDim uppercase mb-1 font-medium">Admin Portal</div>
            <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide">
              Manajemen <span className="text-brand-gold italic">Transaksi</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/admin/dashboard" className="border border-white/10 text-gray-500 font-medium text-xs tracking-widest uppercase px-5 py-3 flex items-center gap-2 hover:text-[#f3f1ed] hover:border-white/20 transition duration-300">
              <span>⊞</span> Kembali
            </Link>
            <button className="bg-brand-gold text-[#090705] font-semibold text-xs tracking-widest uppercase px-5 py-3 flex items-center gap-2 border border-brand-gold cursor-pointer">
              <span>⚙</span> Kelola Transaksi
            </button>
          </div>
        </div>

        <hr className="w-full border-white/[0.05] mb-8" />

        {/* --- GRID UTAMA POS RESTORAN --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* BAGIAN KIRI: SELEKSI PILIHAN MENU */}
          <div className="lg:col-span-7 space-y-4">
            <div className="text-[10px] tracking-widest text-brand-goldDim uppercase font-semibold mb-2">Pilih Menu Restoran</div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {menuList.length === 0 ? (
                <div className="text-xs text-gray-500 italic p-4">Tidak ada katalog menu yang tersedia.</div>
              ) : (
                menuList.map((item) => (
                  <div key={item.id} className="bg-[#120f0b]/40 border border-white/[0.04] p-5 flex justify-between items-center hover:border-brand-goldDim/40 transition duration-300">
                    <div>
                      <h3 className="font-serif text-base font-light tracking-wide text-[#f3f1ed]">{item.name}</h3>
                      <p className="text-[10px] text-gray-600 font-light mt-1 uppercase tracking-wider">
                        {item.category ? item.category.name : 'Uncategorized'}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-serif text-brand-gold text-sm">Rp {item.price.toLocaleString('id-ID')}</span>
                      <button onClick={() => addToCart(item)} className="bg-transparent border border-brand-goldDim/40 hover:bg-brand-gold hover:text-[#090705] text-brand-gold w-8 h-8 flex items-center justify-center font-medium transition duration-200 text-sm cursor-pointer">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BAGIAN KANAN: RINCIAN BELANJA & RINCIAN ORDER */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-[#120f0b] border border-white/[0.03] p-8 md:p-10 space-y-5 shadow-xl">
              <h2 className="font-serif text-xl font-light text-[#f3f1ed] tracking-wide">Rincian Order</h2>

              <div className="divide-y divide-white/[0.03] max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                {cart.length === 0 ? (
                  <p className="text-xs text-gray-600 italic py-4">Keranjang kasir masih kosong</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.menuItem.id} className="flex justify-between items-center py-3 text-xs font-light">
                      <div className="flex items-center gap-2">
                        <span className="text-brand-goldDim font-mono text-[10px] bg-brand-goldDim/10 px-1.5 py-0.5">{item.quantity}×</span>
                        <span className="text-[#f3f1ed]">{item.menuItem.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">Rp {(item.menuItem.price * item.quantity).toLocaleString('id-ID')}</span>
                        <button onClick={() => removeFromCart(item.menuItem.id)} className="text-gray-600 hover:text-red-400 font-bold px-1 transition cursor-pointer">—</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* INPUT FORM DETAIL KONSUMEN */}
              <div className="space-y-3 pt-2 border-t border-white/[0.05]">
                <div>
                  <label className="text-[10px] text-brand-goldDim uppercase tracking-wider block mb-1">Nama Customer</label>
                  <input type="text" placeholder="Masukkan nama pelanggan..." value={custName} onChange={e => setCustName(e.target.value)} className="w-full bg-black/40 border border-white/5 p-2 text-xs outline-none focus:border-brand-gold text-white" />
                </div>

                <div>
                  <label className="text-[10px] text-brand-goldDim uppercase tracking-wider block mb-1">Metode Pemilik Pembayaran</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full bg-black/40 border border-white/5 p-2 text-xs outline-none focus:border-brand-gold text-white cursor-pointer">
                    <option value="CASH" className="bg-[#120f0b]">CASH</option>
                    <option value="QRIS" className="bg-[#120f0b]">QRIS</option>
                    <option value="DEBIT" className="bg-[#120f0b]">DEBIT</option>
                  </select>
                </div>
              </div>

              <hr className="border-white/[0.05]" />
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] tracking-[0.2em] text-brand-goldDim uppercase font-medium">Total Tagihan</span>
                <span className="font-serif text-2xl text-brand-gold font-light tracking-wide">Rp {calculateTotal().toLocaleString('id-ID')}</span>
              </div>

              <button onClick={handleProsesTransaksi} disabled={isSubmitting} className="w-full bg-brand-gold text-[#090705] font-semibold text-xs tracking-[0.25em] uppercase py-4 hover:bg-brand-gold/90 transition duration-300 cursor-pointer disabled:opacity-40">
                {isSubmitting ? 'MEMPROSES...' : 'PROSES TRANSAKSI'}
              </button>
            </div>
          </div>
        </div>

        {/* --- BAGIAN BAWAH: LOG RIWAYAT PEMBAYARAN DARI DATABASE --- */}
        <div className="bg-[#120f0b]/40 border border-white/[0.02] p-6 shadow-md">
          <h3 className="font-serif text-sm tracking-wide text-[#9f9990] mb-4 uppercase font-light">📋 Riwayat Pembayaran Sistem</h3>
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left text-xs font-light whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-brand-goldDim text-[10px] uppercase font-mono tracking-wider">
                  <th className="pb-3 px-3">ID Transaksi</th>
                  <th className="pb-3 px-3">Customer</th>
                  <th className="pb-3 px-3">Total Pembayaran</th>
                  <th className="pb-3 px-3">Metode</th>
                  <th className="pb-3 px-3">Petugas Kasir</th>
                  <th className="pb-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-brand-goldDim tracking-widest animate-pulse">
                      SINKRONISASI DATABASE...
                    </td>
                  </tr>
                ) : transaksis.length > 0 ? (
                  transaksis.map(t => (
                    <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 font-mono text-gray-400">#TRX-{t.id}</td>
                      <td className="p-3 font-medium text-[#f3f1ed]">{t.customerName}</td>
                      <td className="p-3 text-brand-gold font-mono">Rp {t.totalPrice.toLocaleString('id-ID')}</td>
                      <td className="p-3">
                        <span className="bg-white/5 px-2 py-0.5 text-[10px] text-gray-300 rounded font-mono">{t.paymentMethod}</span>
                      </td>
                      <td className="p-3 text-gray-400 font-mono text-[11px]">{t.cashier?.username || `ID: ${t.cashierId}`}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-600 hover:text-red-400 cursor-pointer text-xs transition font-medium">
                          ✕ Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-600 italic">
                      Belum terdapat rekaman log transaksi pembayaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}