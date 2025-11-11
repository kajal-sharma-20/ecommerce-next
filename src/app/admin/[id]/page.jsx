"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Package, Users, Info, ShoppingCart } from "lucide-react";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const { id } = useParams();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRequests: 0,
  });

 //  Save token from URL to cookie and remove it from URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      // Save in cookie (expires in 7 days, secure if using HTTPS)
      Cookies.set("token", token, { expires: 2, secure: true, sameSite: "strict" });

      // Remove token from URL
      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  
  // Fetch dashboard stats from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, usersRes, ordersRes,requestsRes] = await Promise.all([
          axios.get(`${API_URL}/getproducts`), // product controller
          axios.get(`${API_URL}/allusers`),    // user controller
          axios.get(`${API_URL}/gettotalorders`),   // order controller
          axios.get(`${API_URL}/gettotalrequests`), 
        ]);

        setStats({
          totalProducts: productsRes.data.products?.length || 0,
          totalUsers: usersRes.data.users?.length || 0,
          totalOrders: ordersRes.data.totalOrders || 0,
          totalRequests: requestsRes.data.totalRequests || 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Heres whats happening with your store today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          gradient="from-orange-500 to-red-500"
        />
        <StatCard
          title="Total Requests"
          value={stats.totalRequests}
          icon={Info}
          gradient="from-green-500 to-teal-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { href: `/admin/${id}/create-product`, label: "Add Product", color: "from-blue-500 to-purple-500" },
            { href: `/admin/${id}/orders`, label: "View Orders", color: "from-pink-500 to-red-500" },
            { href: `/admin/${id}/users`, label: "Users", color: "from-green-500 to-teal-500" },
            { href: `/admin/${id}/requests`, label: "Requests", color: "from-orange-500 to-yellow-500" },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(action.href)}
              className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-300`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, gradient }) {
  return (
    <div
      className={`p-6 rounded-2xl bg-gradient-to-r ${gradient} text-white shadow-lg hover:shadow-2xl transition-shadow duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium opacity-90">{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon className="w-10 h-10 opacity-90" />
      </div>
    </div>
  );
}
