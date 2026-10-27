import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Header/Navbar';
import { Hero } from './components/Hero/Hero';
import { QuickHighlights } from './components/Highlights/QuickHighlights';
import { HouseDetails } from './components/House/HouseDetails';
import { GalleryGrid } from './components/Gallery/GalleryGrid';
import { AvailabilitySection } from './components/Availability/AvailabilitySection';
import { LocationSection } from './components/Location/LocationSection';
import { ReviewsSection } from './components/Reviews/ReviewsSection';
import { ContactSection } from './components/Contact/ContactSection';
import { Footer } from './components/Footer/Footer';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { AdminRouter } from './admin/router/AdminRouter';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Admin management route
  if (currentPath.startsWith('/admin')) {
    return (
      <AdminAuthProvider>
        <AdminRouter />
      </AdminAuthProvider>
    );
  }

  // Public website (100% intact and preserved)
  return (
    <div className="min-h-screen flex flex-col bg-sand-50 text-timber-900 selection:bg-terracotta-500/20 selection:text-timber-950">
      {/* Sticky Header */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero />
        <QuickHighlights />
        <HouseDetails />
        <GalleryGrid />
        <AvailabilitySection />
        <LocationSection />
        <ReviewsSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;

