'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/NavbarAdmin';
// 1. Import Toaster & Toast Engine
import toast, { Toaster } from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
  category: Category;
  image?: string; // Menambahkan tipe data opsional untuk menyimpan URL gambar hidangan dari server
}

// Pemetaan Nama Dropdown ke ID Kategori backend Anda
const CATEGORY_MAP: Record<string, number> = {
  'Appetizer': 3,
  'Main': 4,
  'Dessert': 5,
  'Drinks': 6
};

const API_BASE_URL = '/api-railway';

export default function MenuCrudPage(): React.JSX.Element {
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Form States
  const [formName, setFormName] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(0);
  const [formCategory, setFormCategory] = useState<string>('Main');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formImage, setFormImage] = useState<string>(''); // State baru untuk melacak ketikan URL gambar pada formulir

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  };

  /** READ (GET ALL MENU)**/
  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/menu`);
      if (!res.ok) throw new Error('Gagal memuat daftar menu dari server');

      const result = await res.json();

      if (result && Array.isArray(result.data)) {
        setMenuList(result.data);
      } else if (Array.isArray(result)) {
        setMenuList(result);
      } else {
        setMenuList([]);
      }
    } catch (error: any) {
      console.error('Error fetching menu:', error);
      toast.error(error.message || 'Gagal mengambil data dari database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  /** 2. CREATE & UPDATE (POST / PUT MENU)**/
  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0 || formStock < 0) {
      toast.error("Pastikan nama hidangan, harga minimal Rp 1, dan stok bernilai positif.");
      return;
    }

    const token = getAuthToken();
    const targetCategoryId = CATEGORY_MAP[formCategory] || 4;

    // Menyatukan seluruh data form ke dalam payload JSON termasuk field link gambar
    const payload = {
      name: formName.trim(),
      description: formDescription.trim(),
      price: Number(formPrice),
      stock: Number(formStock),
      categoryId: Number(targetCategoryId),
      image: formImage.trim() // Melampirkan link gambar ke backend (bisa dikirim string kosong jika tidak ada)
    };

    const loadingToast = toast.loading(isEditing ? 'Memperbarui data menu...' : 'Menyimpan menu baru ke server...');

    try {
      if (isEditing && currentId !== null) {
        const res = await fetch(`${API_BASE_URL}/menu/${currentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const resData = await res.json();

        if (!res.ok) {
          const systemErrorMessage = Array.isArray(resData.message) ? resData.message[0] : resData.message;
          throw new Error(systemErrorMessage || 'Gagal memperbarui hidangan.');
        }

        toast.success('Menu berhasil diperbarui!', { id: loadingToast });
      } else {
        const res = await fetch(`${API_BASE_URL}/menu`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const resData = await res.json();

        if (!res.ok) {
          const systemErrorMessage = Array.isArray(resData.message) ? resData.message[0] : resData.message;
          throw new Error(systemErrorMessage || 'Gagal menambahkan menu baru.');
        }

        toast.success('Menu baru berhasil disimpan!', { id: loadingToast });
      }

      resetForm();
      fetchMenu();
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  /**3. DELETE (DELETE MENU BY ID)**/
  const deleteMenu = async (id: number) => {
    if (!confirm("Hapus hidangan ini secara permanen dari sistem?")) return;

    const token = getAuthToken();
    const deleteToast = toast.loading('Menghapus data...');
    try {
      const res = await fetch(`${API_BASE_URL}/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Gagal menghapus menu. Verifikasi token admin kadaluwarsa.');

      toast.success('Menu berhasil dihapus!', { id: deleteToast });
      fetchMenu();
    } catch (error: any) {
      toast.error(error.message, { id: deleteToast });
    }
  };

  const startEdit = (item: MenuItem) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormName(item.name);
    setFormPrice(item.price);
    setFormStock(item.stock);
    setFormDescription(item.description || '');
    setFormImage(item.image || ''); // Memasukkan URL gambar lama ke kolom input saat tombol edit ditekan

    const activeCatId = item.categoryId || item.category?.id;
    const catName = Object.keys(CATEGORY_MAP).find(key => CATEGORY_MAP[key] === activeCatId);
    if (catName) setFormCategory(catName);
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormName('');
    setFormPrice(0);
    setFormStock(0);
    setFormDescription('');
    setFormCategory('Main');
    setFormImage(''); // Mengosongkan kembali data kolom gambar
  };

  return (
    <main className="bg-[#090705] min-h-screen text-[#f3f1ed] antialiased pb-24">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#120f0b',
            color: '#f3f1ed',
            border: '1px solid rgba(212, 175, 55, 0.2)',
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
        <div className="text-[10px] tracking-[0.3em] text-brand-goldDim uppercase mb-2">Admin Portal</div>
        <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide">
          Manajemen <span className="text-brand-gold italic">Menu Restoran</span>
        </h1>
        <hr className="w-12 border-brand-goldDim/30 mt-6 mb-8" />

        <div className="flex gap-4">
          <Link href="/admin/dashboard" className="border border-white/10 text-gray-500 font-medium text-xs tracking-widest uppercase px-6 py-3 flex items-center gap-2 hover:text-[#f3f1ed] hover:border-white/20 transition duration-300">
            <span>⊞</span> Kembali
          </Link>
          <button className="bg-brand-gold text-[#090705] font-medium text-xs tracking-widest uppercase px-6 py-3 flex items-center gap-2 border border-brand-gold">
            <span>⚙</span> Kelola Menu
          </button>
        </div>
      </div>

      <div className="px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* PANEL FORM DATA */}
        <div className="lg:col-span-4 bg-[#120f0b] border border-white/[0.03] p-8 space-y-6">
          <h2 className="font-serif text-lg text-brand-gold font-light">{isEditing ? "Edit Detail Menu" : "Tambah Menu Baru"}</h2>

          <form onSubmit={handleSaveMenu} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase">Nama Hidangan</label>
              <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required className="w-full bg-black/20 border border-white/[0.05] text-xs px-4 py-3 text-[#f3f1ed] outline-none focus:border-brand-gold" placeholder="Nama makanan..." />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase">Deskripsi</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="w-full bg-black/20 border border-white/[0.05] text-xs px-4 py-3 text-[#f3f1ed] outline-none focus:border-brand-gold resize-none placeholder:opacity-30 custom-scrollbar"
                placeholder="Detail komposisi hidangan..."
              />
            </div>

            {/* BARU: Input Link URL Gambar Menu */}
            <div className="space-y-1">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase">URL Gambar Hidangan</label>
              <input
                type="url"
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                className="w-full bg-black/20 border border-white/[0.05] text-xs px-4 py-3 text-[#f3f1ed] outline-none focus:border-brand-gold placeholder:opacity-30"
                placeholder="https://pinterest.com/image-path.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase">Harga (Rp)</label>
                <input type="number" value={formPrice || ''} onChange={(e) => setFormPrice(Number(e.target.value))} required className="w-full bg-black/20 border border-white/[0.05] text-xs px-4 py-3 text-[#f3f1ed] outline-none focus:border-brand-gold" placeholder="150000" />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase">Stok</label>
                <input type="number" value={formStock || ''} onChange={(e) => setFormStock(Number(e.target.value))} required className="w-full bg-black/20 border border-white/[0.05] text-xs px-4 py-3 text-[#f3f1ed] outline-none focus:border-brand-gold" placeholder="25" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase">Kategori</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full bg-black/20 border border-white/[0.05] text-xs px-4 py-3 text-[#f3f1ed] outline-none focus:border-brand-gold cursor-pointer">
                <option value="Appetizer">Appetizer</option>
                <option value="Main">Main Course</option>
                <option value="Dessert">Dessert</option>
                <option value="Drinks">Drinks</option>
              </select>
            </div>

            <div className="pt-2 flex gap-2">
              <button type="submit" className="w-full bg-brand-gold text-[#090705] text-xs font-semibold tracking-wider uppercase py-3 hover:bg-brand-gold/90 transition cursor-pointer">
                {isEditing ? "Perbarui" : "Simpan"}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="w-1/2 border border-white/10 text-gray-400 text-xs uppercase tracking-wider py-3 hover:text-white">Batal</button>
              )}
            </div>
          </form>
        </div>

        {/* TABEL DAFTAR MENU */}
        <div className="lg:col-span-8 space-y-4">
          <div className="text-[10px] tracking-widest text-brand-goldDim uppercase font-semibold">Daftar Menu Aktif Berjalan</div>

          <div className="border border-white/[0.03] overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-xs text-brand-goldDim tracking-widest uppercase animate-pulse">
                Menghubungkan ke API Restoran...
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-light">
                <thead>
                  <tr className="border-b border-white/[0.05] bg-[#120f0b]/60 text-brand-goldDim text-[10px] tracking-wider uppercase">
                    {/* BARU: Kolom header visual mini gambar */}
                    <th className="p-4 font-medium w-16">Gambar</th>
                    <th className="p-4 font-medium">Nama Menu</th>
                    <th className="p-4 font-medium">Kategori</th>
                    <th className="p-4 font-medium">Stok</th>
                    <th className="p-4 font-medium">Harga</th>
                    <th className="p-4 font-medium text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {menuList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                        Tidak ada data menu yang tersimpan di server.
                      </td>
                    </tr>
                  ) : (
                    menuList.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition">

                        {/* BARU: Merender Kotak Gambar Thumbnail Mini Menu (Sudah Fix Super Gelap) */}
                        <td className="p-4 vertical-middle">
                          {/* 1. Ditambahkan class 'group' agar efek hover anak komponennya aktif */}
                          <div className="w-12 h-12 bg-black/40 border border-white/10 overflow-hidden relative flex items-center justify-center group">
                            {item.image ? (
                              <>
                                {/* 2. Ditambahkan tanda seru (!) pada !brightness-50 untuk memaksa gambar meredup */}
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover !brightness-50 group-hover:!brightness-90 transition duration-500"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/100x100/120f0b/f3f1ed?text=No+Img';
                                  }}
                                />
                                {/* 3. Ditambahkan lapisan bayangan hitam absolut di atas gambar sebagai pengunci kegelapan */}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition duration-500 pointer-events-none" />
                              </>
                            ) : (
                              <span className="text-[8px] uppercase opacity-30 text-center tracking-tighter">No Pic</span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 font-serif text-sm tracking-wide text-[#f3f1ed]">
                          <div>{item.name}</div>
                          {item.description && (
                            <div className="text-[11px] text-gray-500 font-sans mt-0.5 normal-case max-w-xs truncate">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-gray-500 uppercase text-[10px] tracking-wider">
                          {item.category?.name || 'Main'}
                        </td>
                        <td className="p-4 text-gray-400">{item.stock}</td>
                        <td className="p-4 text-brand-gold">Rp {item.price.toLocaleString('id-ID')}</td>
                        <td className="p-4">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-brand-gold transition cursor-pointer" title="Ubah">✎ Edit</button>
                            <button onClick={() => deleteMenu(item.id)} className="text-gray-500 hover:text-red-400 transition cursor-pointer" title="Hapus">✕ Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}