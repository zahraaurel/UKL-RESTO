export interface Menu { id: number; name: string; price: number; category: string; }
export interface Transaksi { id: string; meja: string; total: number; status: 'Selesai' | 'Pending' | 'Batal'; tanggal: string; }
export interface Reservasi { id: number; nama: string; tanggal: string; jam: string; jumlahOrang: number; status: 'Confirmed' | 'Pending' | 'Cancelled'; }

export const INITIAL_MENUS: Menu[] = [
  { id: 1, name: "Foie Gras Torchon", price: 380000, category: "Appetizer" },
  { id: 2, name: "Wagyu Tenderloin A5", price: 950000, category: "Main Course" },
  { id: 3, name: "Soufflé au Chocolat", price: 195000, category: "Dessert" },
];

export const INITIAL_TRANSAKSIS: Transaksi[] = [
  { id: "TRX-101", meja: "Meja 3", total: 1330000, status: "Selesai", tanggal: "2026-05-27" },
  { id: "TRX-102", meja: "Meja 1", total: 380000, status: "Pending", tanggal: "2026-05-27" },
];

export const INITIAL_RESERVASIS: Reservasi[] = [
  { id: 1, nama: "Bima Arya", tanggal: "2026-05-28", jam: "19:00", jumlahOrang: 4, status: "Confirmed" },
  { id: 2, nama: "Citra Kirana", tanggal: "2026-05-29", jam: "18:30", jumlahOrang: 2, status: "Pending" },
];