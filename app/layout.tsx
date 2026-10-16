import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toast } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'SideNote Subscriptions | Digital Products, SaaS Accounts & Software Licenses',
  description:
    'Instant automated delivery of verified AI subscriptions, SaaS accounts, enterprise developer templates, software serial licenses, and curated digital courses in Bangladesh.',
  openGraph: {
    title: 'SideNote Subscriptions | Digital Products, SaaS Accounts & Software Licenses',
    description:
      'Instant automated delivery of verified AI subscriptions, SaaS accounts, enterprise developer templates, and software serial licenses.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SideNote Subscriptions',
    description: 'Instant digital products, SaaS subscriptions, and software licenses.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning className="bg-white text-[#1d1d1f] antialiased selection:bg-[#F58220] selection:text-white overflow-x-hidden min-h-screen flex flex-col">
        <CartProvider>
          <Header />
          <div className="flex-1 overflow-x-hidden">{children}</div>
          <Footer />
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
