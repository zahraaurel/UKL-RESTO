'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/NavbarKasir';
// Import library react-hot-toast untuk animasi feedback
import toast, { Toaster } from 'react-hot-toast';

// Jalur jembatan proxy lokal agar aman dari blokir CORS browser
const API_BASE_URL = '/api-railway';

// Interface disesuaikan dengan struktur objek Menu asli dari Database/Postman Anda
interface BackendMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
}

interface CartItem {
  menuItem: BackendMenuItem; // Menggunakan tipe data item dari backend
  quantity: number;
}

export default function TransaksiKasirPage(): React.JSX.Element {
  // State untuk menampung menu asli hasil hit API
  const [menuList, setMenuList] = useState<BackendMenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]); // Awalnya keranjang kosong belanja dari nol
  const [custName, setCustName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS' | 'Debit'>('Cash');
  
  // State indikator loading dan error
  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- FEATURE 1: GET MENU DARI DATABASE (DIJALANKAN SAAT HALAMAN DIBUKA) ---
  const fetchMenuFromDatabase = async () => {
    setIsLoadingMenu(true);
    try {
      const response = await fetch(`${API_BASE_URL}/menu`);
      if (!response.ok) throw new Error('Gagal mengambil data menu terkini dari server.');
      
      const data = await response.json();
      setMenuList(data); // Simpan array menu dari database ke dalam state
    } catch (error) {
      console.error('Error Fetch Menu:', error);
      toast.error('Gagal memuat daftar menu restoran.');
    } finally {
      setIsLoadingMenu(false);
    }
  };

  useEffect(() => {
    fetchMenuFromDatabase();
  }, []);

  // --- HANDLER KERANJANG BELANJA ---
  const addToCart = (item: BackendMenuItem) => {
    // Validasi pencegahan jika kasir memasukkan menu yang stoknya sudah habis (0)
    if (item.stock <= 0) {
      toast.error(`Stok untuk hidangan "${item.name}" sudah habis!`);
      return;
    }

    const existing = cart.find(cartItem => cartItem.menuItem.id === item.id);
    if (existing) {
      // Validasi pencegahan jika jumlah order melebihi batas stok di database
      if (existing.quantity >= item.stock) {
        toast.error(`Maksimal pemesanan sesuai sisa stok database (${item.stock} porsi).`);
        return;
      }
      setCart(cart.map(cartItem => 
        cartItem.menuItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      ));
    } else {
      setCart([...cart, { menuItem: item, quantity: 1 }]);
    }
    toast.success(`"${item.name}" ditambahkan`, { duration: 1000 });
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

  // --- FEATURE 2: POST CREATE TRANSAKSI KE API ---
  const handleCheckout = async () => {
    if (!custName.trim()) {
      toast.error('Nama customer tidak boleh kosong!');
      return;
    }
    if (cart.length === 0) {
      toast.error('Keranjang belanja masih kosong!');
      return;
    }

    setIsSubmitting(true);
    // Memicu pemicuan toast loading stream
    const checkoutToastId = toast.loading('Memproses transaksi baru ke server...');

    // Formasi data details disamakan dengan struktur array JSON Postman Anda
    const detailsPayload = cart.map(item => ({
      menuId: item.menuItem.id,
      quantity: item.quantity
    }));

    const payload = {
      customerName: custName.trim(),
      paymentMethod: paymentMethod.toUpperCase(), // Ubah format menjadi 'CASH', 'QRIS', atau 'DEBIT'
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
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message[0] : data.message;
        throw new Error(errorMsg || 'Gagal memproses transaksi baru ke server.');
      }

      toast.success(data.message || 'Transaksi Berhasil! Nota penjualan telah diterbitkan.', { id: checkoutToastId });
      
      // Bersihkan form & keranjang setelah berhasil
      setCart([]);
      setCustName('');
      setPaymentMethod('Cash');
      
      // Mengambil ulang data menu agar angka stok berkurang di layar kasir secara real-time
      const updatedResponse = await fetch(`${API_BASE_URL}/menu`);
      const updatedData = await updatedResponse.json();
      setMenuList(updatedData);

    } catch (error: any) {
      console.error('Checkout Error:', error);
      toast.error(error.message || 'Terjadi gangguan jaringan ke server.', { id: checkoutToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-[#090705] min-h-screen text-[#f3f1ed] antialiased pb-24">
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

      <div className="px-6 md:px-16 pt-32 pb-10">
        <div className="text-[10px] tracking-[0.3em] text-brand-goldDim uppercase mb-2">Staff Portal</div>
        <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide">
          Portal <span className="text-brand-gold italic">Operasional</span>
        </h1>
        <hr className="w-12 border-brand-goldDim/30 mt-6 mb-8" />

        {/* Tab Navigasi */}
        <div className="flex gap-4">
          <Link href="/kasir/dashboard" className="border border-white/10 text-gray-500 font-medium text-xs tracking-widest uppercase px-6 py-3 flex items-center gap-2 hover:text-[#f3f1ed] hover:border-white/20 transition duration-300">
            <span>⊞</span> Kembali
          </Link>
          <button className="bg-brand-gold text-[#090705] font-medium text-xs tracking-widest uppercase px-6 py-3 flex items-center gap-2 border border-brand-gold">
            <span>⚙</span> Kelola Transaksi
          </button>
        </div>
      </div>

      {/* Grid POS System */}
      <div className="px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* KIRI: DAFTAR PILIH MENU DARI DATABASE */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-[10px] tracking-widest text-brand-goldDim uppercase font-semibold mb-2">Pilih Menu (Live Database)</div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            
            {isLoadingMenu ? (
              <div className="text-center py-12 text-xs tracking-widest text-brand-goldDim animate-pulse">
                MENYINKRONKAN DAFTAR MENU...
              </div>
            ) : menuList.length > 0 ? (
              menuList.map((item) => (
                <div key={item.id} className={`bg-[#120f0b]/40 border p-5 flex justify-between items-center transition duration-300 ${item.stock === 0 ? 'border-red-900/20 opacity-40' : 'border-white/[0.04] hover:border-brand-goldDim/40'}`}>
                  <div>
                    <h3 className="font-serif text-base font-light tracking-wide text-[#f3f1ed]">{item.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] text-brand-goldDim font-light uppercase tracking-wider">
                        {item.category?.name || 'Umum'}
                      </p>
                      <span className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.2">
                        Stok: {item.stock}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-serif text-brand-gold text-sm">Rp {item.price.toLocaleString('id-ID')}</span>
                    <button 
                      onClick={() => addToCart(item)} 
                      disabled={item.stock === 0}
                      className="bg-transparent border border-brand-goldDim/40 hover:bg-brand-gold hover:text-[#090705] text-brand-gold w-8 h-8 flex items-center justify-center font-medium transition duration-200 text-sm cursor-pointer disabled:border-gray-800 disabled:text-gray-700 disabled:hover:bg-transparent"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-gray-500 italic">
                Tidak ada data menu hidangan di database server Anda.
              </div>
            )}
          </div>
        </div>

        {/* KANAN: RINCIAN ORDERAN */}
        <div className="lg:col-span-5 bg-[#120f0b] border border-white/[0.03] p-8 md:p-10 space-y-8 shadow-xl">
          <h2 className="font-serif text-xl font-light text-[#f3f1ed] tracking-wide">Rincian Order</h2>

          <div className="divide-y divide-white/[0.03] max-h-[250px] overflow-y-auto pr-1">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.menuItem.id} className="flex justify-between items-center py-4 text-xs font-light">
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
            ) : (
              <div className="text-center py-6 text-xs text-gray-600 italic">
                Keranjang kosong. Tambahkan menu pilihan di sebelah kiri.
              </div>
            )}
          </div>

          {/* Form Tambahan Informasi Kasir & Pelanggan */}
          <div className="space-y-3 pt-2 border-t border-white/[0.05]">
            <div>
              <label className="text-[10px] text-brand-goldDim uppercase tracking-wider block mb-1">Nama Customer</label>
              <input type="text" placeholder="Masukkan nama pelanggan..." value={custName} onChange={e => setCustName(e.target.value)} className="w-full bg-black/40 border border-white/5 p-2 text-xs outline-none focus:border-brand-gold text-white placeholder:opacity-30" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-brand-goldDim uppercase tracking-wider block mb-1">Metode Bayar</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full bg-black/40 border border-white/5 p-2 text-xs outline-none focus:border-brand-gold text-white cursor-pointer">
                  <option value="Cash" className="bg-[#120f0b]">Cash</option>
                  <option value="QRIS" className="bg-[#120f0b]">QRIS</option>
                  <option value="Debit" className="bg-[#120f0b]">Debit</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-white/[0.05]" />
          <div className="flex justify-between items-baseline pt-2">
            <span className="text-[10px] tracking-[0.2em] text-brand-goldDim uppercase font-medium">Total</span>
            <span className="font-serif text-2xl text-brand-gold font-light tracking-wide">Rp {calculateTotal().toLocaleString('id-ID')}</span>
          </div>

          <button 
            onClick={handleCheckout} 
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-brand-gold text-[#090705] font-semibold text-xs tracking-[0.25em] uppercase py-4 hover:bg-brand-gold/90 transition duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Memproses ke Server...' : 'Proses Transaksi'}
          </button>
        </div>

      </div>
    </main>
  );
}