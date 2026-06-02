'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/NavbarAdmin';
import { INITIAL_MENU, MenuItem } from './data/menuData';

export default function MenuCrudPage(): React.JSX.Element {
  const [menuList, setMenuList] = useState<MenuItem[]>(INITIAL_MENU);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCategory, setFormCategory] = useState<string>('Main');
  const [formDescription, setFormDescription] = useState<string>('');

  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formPrice <= 0) return alert("Data tidak valid");

    if (isEditing && currentId !== null) {
      setMenuList(menuList.map(item => item.id === currentId ? { ...item, name: formName, price: formPrice, category: formCategory } : item));
      setIsEditing(false);
      setCurrentId(null);
    } else {
      setMenuList([...menuList, { id: Date.now(), name: formName, price: formPrice, category: formCategory }]);
    }
    setFormName('');
    setFormPrice(0);
  };

  const startEdit = (item: MenuItem) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormName(item.name);
    setFormPrice(item.price);
    setFormCategory(item.category);
  };

  const deleteMenu = (id: number) => {
    if (confirm("Hapus hidangan ini dari sistem?")) {
      setMenuList(menuList.filter(item => item.id !== id));
    }
  };

  return (
    <main className="bg-[#090705] min-h-screen text-[#f3f1ed] antialiased pb-24">
      <Navbar />

      <div className="px-6 md:px-16 pt-32 pb-10">
        <div className="text-[10px] tracking-[0.3em] text-brand-goldDim uppercase mb-2">Admin Portal</div>
        <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide">
          Manajemen <span className="text-brand-gold italic">Menu Restoran</span>
        </h1>
        <hr className="w-12 border-brand-goldDim/30 mt-6 mb-8" />

        {/* Tab Navigasi Alternatif */}
        <div className="flex gap-4">
          <div className="flex gap-4">
            <Link href="/admin/dashboard" className="border border-white/10 text-gray-500 font-medium text-xs tracking-widest uppercase px-6 py-3 flex items-center gap-2 hover:text-[#f3f1ed] hover:border-white/20 transition duration-300">
              <span>⊞</span> Kembali
            </Link>
          </div>
          <button className="bg-brand-gold text-[#090705] font-medium text-xs tracking-widest uppercase px-6 py-3 flex items-center gap-2 border border-brand-gold">
            <span>⚙</span> Kelola Menu
          </button>
        </div>
      </div>

      <div className="px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

{/* KIRI: FORM ENTRI (CREATE / UPDATE) */}
        <div className="lg:col-span-4 bg-[#120f0b] border border-white/[0.03] p-8 space-y-6">
          <h2 className="font-serif text-lg text-brand-gold font-light">{isEditing ? "Edit Detail Menu" : "Tambah Menu Baru"}</h2>

          <form onSubmit={handleSaveMenu} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase">Nama Hidangan</label>
              <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required className="w-full bg-black/20 border border-white/[0.05] text-xs px-4 py-3 text-[#f3f1ed] outline-none focus:border-brand-gold" placeholder="Nama makanan..." />
            </div>

            {/* FIELD TAMBAHAN: DESKRIPSI HIDANGAN */}
            <div className="space-y-1">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase">Deskripsi</label>
              <textarea 
                value={formDescription} 
                onChange={(e) => setFormDescription(e.target.value)} 
                rows={3} 
                className="w-full bg-black/20 border border-white/[0.05] text-xs px-4 py-3 text-[#f3f1ed] outline-none focus:border-brand-gold resize-none placeholder:opacity-30 custom-scrollbar" 
                placeholder="Komposisi bahan hidangan, detail rasa, atau porsi..."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] tracking-widest text-brand-goldDim uppercase">Harga (Rp)</label>
              <input type="number" value={formPrice || ''} onChange={(e) => setFormPrice(Number(e.target.value))} required className="w-full bg-black/20 border border-white/[0.05] text-xs px-4 py-3 text-[#f3f1ed] outline-none focus:border-brand-gold" placeholder="Contoh: 150000" />
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
                <button type="button" onClick={() => { setIsEditing(false); setFormName(''); setFormDescription(''); setFormPrice(0); }} className="w-1/2 border border-white/10 text-gray-400 text-xs uppercase tracking-wider py-3 hover:text-white">Batal</button>
              )}
            </div>
          </form>
        </div>
        {/* KANAN: TABEL DAFTAR DATA MENU AKTIF */}
        <div className="lg:col-span-8 space-y-4">
          <div className="text-[10px] tracking-widest text-brand-goldDim uppercase font-semibold">Daftar Menu Aktif Berjalan</div>

          <div className="border border-white/[0.03] overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-light">
              <thead>
                <tr className="border-b border-white/[0.05] bg-[#120f0b]/60 text-brand-goldDim text-[10px] tracking-wider uppercase">
                  <th className="p-4 font-medium">Nama Menu</th>
                  <th className="p-4 font-medium">Kategori</th>
                  <th className="p-4 font-medium">Harga</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {menuList.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.01] transition">
                    <td className="p-4 font-serif text-sm tracking-wide text-[#f3f1ed]">{item.name}</td>
                    <td className="p-4 text-gray-500 uppercase text-[10px] tracking-wider">{item.category}</td>
                    <td className="p-4 text-brand-gold">Rp {item.price.toLocaleString('id-ID')}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-brand-gold transition cursor-pointer" title="Ubah">✎ Edit</button>
                        <button onClick={() => deleteMenu(item.id)} className="text-gray-500 hover:text-red-400 transition cursor-pointer" title="Hapus">✕ Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}