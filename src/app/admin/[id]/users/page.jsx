'use client';

import axios from 'axios';
import { User, Mail, Phone, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 3;

  useEffect(() => {
    fetchusers();
  }, []);

  const fetchusers = async () => {
    try {
      const res = await axios.get(`${API_URL}/allusers`);
      if (res.status === 200 && res.data.users) {
        setUsers(res.data.users);
      } else {
        toast.error('No users found');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  };

  const indexOfLastuser = currentPage * usersPerPage;
  const indexOfFirstuser = indexOfLastuser - usersPerPage;
  const currentusers = users.slice(indexOfFirstuser, indexOfLastuser);
  const totalPages = Math.ceil(users.length / usersPerPage);


  const handledelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      const res = await axios.delete(`${API_URL}/deleteuser/${id}`);
      if (res.status === 200) {
        toast.success("Product deleted successfully");
        fetchusers();
      } else toast.error("Failed to delete product");
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting product");
    }
  };

  return (
  <div className="space-y-14 animate-fade-in min-h-screen flex flex-col">
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        Users
      </h1>
      <p className="text-gray-600">Manage user accounts and subscriptions</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
      {currentusers.map((user, index) => (
        <div
          key={`${user.id}-${index}`} 
          className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                <img
                  src={user.profile || '/default-avatar.png'}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-1">{user.name}</h3>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{user.name || "Not Provided"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{user.email || "Not Provided"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{user.phone || "Not Provided"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>{user.gender || "Not Provided"}</span>
              </div>
            </div>
          </div>

          {/* Sticky button at bottom */}
          <button
            className="mt-auto w-full px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
            onClick={() => handledelete(user.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>

    {/* Pagination */}
    <div className="flex justify-center items-center mt-auto gap-4 flex-wrap py-6">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
        className={`px-6 py-2 rounded font-semibold transition ${
          currentPage === 1
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Prev
      </button>

      <span className="text-gray-700 font-medium">
        Page {currentPage} of {totalPages || 1}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => prev + 1)}
        className={`px-6 py-2 rounded font-semibold transition ${
          currentPage === totalPages
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Next
      </button>
    </div>
  </div>
);

}
