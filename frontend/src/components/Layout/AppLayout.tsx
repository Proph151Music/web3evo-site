import { ReactNode } from 'react';
import Footer from './Footer';
import AppBar from './AppBar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative box-content flex flex-col min-h-screen">
      <AppBar className="px-6 md:px-[4%]" />
      <main className="px-6 md:px-[4%] flex-1 mb-5 h-full flex flex-col">
        <div className="flex flex-col max-w-[1400px] m-auto w-full h-full">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
