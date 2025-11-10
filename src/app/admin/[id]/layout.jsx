'use client';

import Sidebar from "@/app/components/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 bg-gray-50 min-h-screen p-8 ml-0 md:ml-64 overflow-y-auto transition-all duration-300">
        {children}
      </main>
    </div>
  );
}

