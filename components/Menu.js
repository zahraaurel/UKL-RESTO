'use client';
import { useState, useEffect } from 'react';

// Jalur proxy lokal agar aman dari CORS browser
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api-railway';

export default function Menu() {
  const [activeTab, setActiveTab] = useState('appetizer');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuList, setMenuList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Array kategori statis untuk filter tab
  const categories = ['appetizer', 'main course', 'dessert', 'drinks'];

  // --- REUSABLE FUNCTION: FETCH DATA DARI API ---
  const loadMenuData = async (url) => {
    setIsLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Gagal memuat data menu');
      const data = await response.json();
      setMenuList(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- EFFECT 1: GET SEMUA MENU ---
  useEffect(() => {
    // Jalankan fetch regular jika kolom pencarian sedang kosong
    if (!searchQuery.trim()) {
      loadMenuData(`${API_BASE_URL}/menu`);
    }
  }, [activeTab, searchQuery]);

  // --- EFFECT 2: FITUR SEARCH NAMA ---
  useEffect(() => {
    if (!searchQuery.trim()) return;

    // Menghindari penembakan API bertubi-tubi saat mengetik (Debounce)
    const delayDebounceFn = setTimeout(() => {
      loadMenuData(`${API_BASE_URL}/menu/search?name=${encodeURIComponent(searchQuery)}`);
    }, 400); // Server akan ditembak 400ms setelah user berhenti mengetik

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- LOGIKA FILTERING TAMPILAN FRONTEND ---
  const getDisplayedMenu = () => {
    if (searchQuery.trim()) {
      // Jika sedang mencari, semua data kembalian API search langsung ditampilkan
      return menuList;
    }
    // Jika tidak mencari, filter array menuList berdasarkan nama kategori tab aktif
    return menuList.filter(
      item => item.category?.name.toLowerCase() === activeTab.toLowerCase()
    );
  };

  const displayedMenu = getDisplayedMenu();

  return (
    <section id="menu" className="min-h-screen bg-[#090705] text-white px-8 md:px-20 py-24 border-t border-white/5">
      <div className="space-y-8">

        {/* 1. Heading */}
        <div>
          <h2 className="font-serif text-4xl md:text-5xl font-light">
            Menu <span className="text-brand-gold italic">Pilihan</span>
          </h2>
          <hr className="w-16 border-brand-goldDim/40 mt-6" />
        </div>

        {/* 2. Tab Kategori */}
        <div className="flex space-x-8 border-b border-white/10 pb-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              disabled={!!searchQuery} // Menonaktifkan klik tab saat user sedang mengetik pencarian
              onClick={() => setActiveTab(category)}
              className={`text-xs tracking-[0.2em] uppercase pb-2 transition-all duration-300 whitespace-nowrap ${searchQuery
                ? 'text-gray-700 cursor-not-allowed border-none'
                : activeTab === category
                  ? 'text-brand-gold border-b-2 border-brand-gold font-medium'
                  : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 3. Kolom Pencarian (Tepat di bawah Category) */}
        <div className="w-full max-w-md space-y-1 pt-2 animate-fadeIn">
          <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase">Cari Menu Hidangan</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Masukkan nama menu (contoh: Wagyu, Truffle)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 text-xs px-4 py-3 text-[#f3f1ed] outline-none focus:border-brand-gold/60 transition placeholder:opacity-30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-[10px] text-brand-goldDim/60 italic pt-1">
              Menampilkan hasil pencarian untuk "<span className="text-brand-gold">{searchQuery}</span>"
            </p>
          )}
        </div>

        {/* 4. Grid Items Menu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12 pt-6">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-xs text-brand-goldDim tracking-widest animate-pulse">
              MEMUAT HIDANGAN MAISON D'OR...
            </div>
          ) : displayedMenu.length > 0 ? (
            displayedMenu.map((item) => (
              /* flex-row & gap-5 agar gambar dan teks bersandingan */
              <div key={item.id} className="flex flex-row items-start gap-5 border-b border-white/5 pb-6 animate-fadeIn">

                {/* --- TEMPAT GAMBAR HIDANGAN --- */}
                <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 overflow-hidden bg-white/[0.02] border border-white/10 relative flex items-center justify-center group">
                  {item.image ? ( 
                    <>
                      <img
                        src={item.image}
                        alt={item.name}
                        // Menggunakan !brightness
                        className="w-full h-full object-cover object-center !brightness-70 group-hover:scale-105 group-hover:!brightness-90 transition duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/400x400/120f0b/f3f1ed?text=Maison+D%27or';
                        }}
                      />
                      {/* Lapisan bayangan malam overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition duration-500 pointer-events-none" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600 uppercase tracking-wider text-center p-2 italic">
                      No Image
                    </div>
                  )}
                </div>

                {/* --- KONTEN DETAIL TEKS (DI SAMPING GAMBAR) --- */}
                <div className="flex-1 flex flex-col justify-between h-full min-h-[96px] md:min-h-[112px]">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-serif text-base md:text-lg text-white font-light tracking-wide">
                        {item.name}
                      </h3>
                      <span className="font-serif text-brand-gold text-sm md:text-base shrink-0">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 font-light mt-1.5 leading-relaxed line-clamp-2 md:line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  {/* Tag Otomatis jika Stok Menipis */}
                  {item.stock <= 5 && item.stock > 0 && (
                    <div className="mt-2">
                      <span className="border border-red-500/30 text-red-400 text-[8px] tracking-widest px-2 py-0.5 uppercase font-medium">
                        STOK TERBATAS
                      </span>
                    </div>
                  )}
                </div>

              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 italic text-sm font-light">
              {searchQuery
                ? `Menu bernama "${searchQuery}" tidak ditemukan di database server.`
                : `Belum ada hidangan aktif di kategori ${activeTab} saat ini.`
              }
            </div>
          )}
        </div>

      </div>
    </section>
  );
}