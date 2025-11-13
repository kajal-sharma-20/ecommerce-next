'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package as PackageIcon, Plus, UserCircle, LogOut, ShoppingCart, Info, Menu } from 'lucide-react';
import { toast } from "react-toastify";
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export default function Sidebar() {
  const pathname = usePathname();
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState(false); // for mobile sidebar toggle
  const router=useRouter()

  const menuItems = [
    { href: `/admin/${id}`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `/admin/${id}/users`, label: 'Users', icon: Users },
    { href: `/admin/${id}/products`, label: 'Products', icon: PackageIcon },
    { href: `/admin/${id}/orders`, label: 'Orders', icon: ShoppingCart },
    { href: `/admin/${id}/create-product`, label: 'Create Product', icon: Plus },
    { href: `/admin/${id}/profile`, label: 'Profile', icon: UserCircle },
    { href: `/admin/${id}/requests`, label: 'Requests', icon: Info },
  ];

  const handleLogout = async () => {
    try {
      const res = await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      if (res.status === 200) {
        toast.success("Logged out successfully!");
        router.push("/")
      }
    } catch (err) {
      toast.error("Error logging out");
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="fixed top-1 left-2 z-50 p-1 bg-blue-600 text-white rounded-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-6 shadow-2xl backdrop-blur-lg flex flex-col justify-between transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-40`}
      >
        <div>
          {/* Logo */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Admin Panel</h1>
            <p className="text-sm text-blue-100 mt-1">Management Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile after clicking a link
                    if (window.innerWidth < 768) setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white/30 text-white shadow-lg scale-105 backdrop-blur-md'
                      : 'text-blue-50 hover:bg-white/20 hover:scale-102 hover:shadow-md'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          className="flex items-center justify-center gap-2 bg-white/20 text-white px-4 py-2 rounded-xl w-full hover:bg-white/30 transition-all duration-300"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
