import React from 'react';
import Navbar from '@/components/NavbarCust';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Menu from '@/components/Menu';
import Footer from '@/components/Footer';

export default function CustomerPage(): React.JSX.Element {
  return (
    <main className="bg-[#0B0A08] min-h-screen antialiased selection:bg-brand-gold selection:text-brand-dark">
      <Navbar />
      <Hero />
      <About />
      <Menu />
      <Footer />
    </main>
  );
}