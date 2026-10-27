import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Phone, MapPin } from 'lucide-react';
import { HOUSE_INFO } from '../../data/houseData';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'La Casa', href: '#la-casa' },
    { label: 'Galería', href: '#galeria' },
    { label: 'Ubicación', href: '#ubicacion' },
    { label: 'Opiniones', href: '#opiniones' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-sand-50/95 backdrop-blur-md shadow-sm py-3 border-b border-sand-200'
          : 'bg-gradient-to-b from-timber-950/70 via-timber-950/30 to-transparent py-5 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand & RTA */}
        <a href="#" className="flex flex-col group">
          <span
            className={`font-serif text-lg sm:text-2xl font-bold tracking-tight transition-colors ${
              isScrolled ? 'text-timber-950 group-hover:text-terracotta-600' : 'text-white'
            }`}
          >
            Casa Vacacional Imasaru
          </span>
          <span
            className={`text-xs tracking-wider font-medium flex items-center gap-1 ${
              isScrolled ? 'text-timber-600' : 'text-sand-200'
            }`}
          >
            <MapPin className="w-3 h-3 text-terracotta-500" />
            Conil de la Frontera · {HOUSE_INFO.registrationNumber}
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-terracotta-500 ${
                isScrolled ? 'text-timber-700' : 'text-sand-100 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#disponibilidad"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all duration-200 ${
              isScrolled
                ? 'bg-timber-900 text-sand-50 hover:bg-terracotta-600'
                : 'bg-white text-timber-900 hover:bg-sand-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-terracotta-500" />
            Consultar Disponibilidad
          </a>
        </nav>

        {/* Mobile / Tablet menu button */}
        <div className="lg:hidden flex items-center gap-2">
          <a
            href="tel:+34699278630"
            className={`p-2 rounded-full transition-colors ${
              isScrolled ? 'text-timber-900 hover:bg-sand-100' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Llamar a los propietarios"
          >
            <Phone className="w-5 h-5" />
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-timber-900 hover:bg-sand-100' : 'text-white hover:bg-white/10'
            }`}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-sand-50 border-b border-sand-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-base font-medium text-timber-800 hover:bg-sand-200/60 hover:text-terracotta-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <a
                href="#disponibilidad"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-timber-900 text-white font-medium text-sm shadow hover:bg-terracotta-600 transition-colors"
              >
                <Calendar className="w-4 h-4 text-terracotta-400" />
                Consultar Disponibilidad
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

