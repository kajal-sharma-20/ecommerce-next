'use client';

import { useEffect, useState, useRef } from 'react';
import { Mail, User, Shield, Phone, Edit2 } from 'lucide-react';
import axios from 'axios';
import Modal from 'react-modal';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";

Modal.setAppElement('body'); // Needed for Next.js

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const fileInputRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [disable, setdisable] = useState(false);
  

   const isModalOpen = searchParams.get('modal') === 'open';

  const openModal = () => router.push(`?modal=open`);
  const closeModal = () => router.back();

  const { id } = useParams();
  const userId = id;

  // Form fields
  const [editData, setEditData] = useState({
    name: '',
    email:'',
    phone: '',
    gender: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/userdetails/${userId}`);
      setProfile(res.data);
      setEditData({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        gender: res.data.gender || ''
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setShowSaveButton(true);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  const handleSaveChanges = async () => {
    if (!selectedFile) return;

    setdisable(true)

    const formData = new FormData();
    formData.append('profile', selectedFile);

    try {
      await axios.put(`${API_URL}/updateuser/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setdisable(false)
      setShowSaveButton(false);
      fetchProfile();
      setSelectedFile(null);
      setPreviewImage(null);
      toast.success('Admin image updated successfully');
    } catch (err) {
      console.error('Error updating profile image:', err);
    }
  };

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/updateuser/${userId}`, editData);
      fetchProfile();
      closeModal();
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating details:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold text-red-500">
        Failed to load profile.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto p-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Admin Profile
        </h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      {/* Layout: Left profile + Right info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT: Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 text-center">
          <div className="relative inline-block mb-4">
            <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
              <img
                src={
                  previewImage ||
                  profile.profile ||
                  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
                }
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              onClick={handleEditClick}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 transition-transform duration-200"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">{profile.name}</h2>
          <p className="text-sm text-gray-500 mb-3">{profile.email}</p>

          {showSaveButton ? (
            <button
              disabled={disable}
              onClick={handleSaveChanges}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg disabled:cursor-not-allowed"
            >
              {disable ? "Saving the changes..." : "Update"}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg">
              <Shield className="w-4 h-4" />
              {profile.role === 1 ? 'Admin' : 'User'}
            </div>
          )}
        </div>

        {/* RIGHT: Personal Information */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
            <button
              onClick={openModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
            >
              Edit Profile
            </button>
          </div>

          <div className="space-y-4">
            {/* Same info cards */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <div className="p-3 rounded-xl bg-white shadow-md">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Full Name</p>
                <p className="text-sm font-semibold text-gray-800">{profile.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <div className="p-3 rounded-xl bg-white shadow-md">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
  <p className="text-xs text-gray-500 font-medium">Email Address</p>
  <p className="text-sm font-semibold text-gray-800 break-words">
    {profile.email}
  </p>
</div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <div className="p-3 rounded-xl bg-white shadow-md">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Role</p>
                <p className="text-sm font-semibold text-gray-800">
                  {profile.role === 1 ? 'Admin' : 'User'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <div className="p-3 rounded-xl bg-white shadow-md">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Phone</p>
                <p className="text-sm font-semibold text-gray-800">{profile.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <div className="p-3 rounded-xl bg-white shadow-md">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Gender</p>
                <p className="text-sm font-semibold text-gray-800">{profile.gender}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Edit Profile */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg mx-auto mt-24 relative z-50"
        overlayClassName="fixed inset-0 backdrop-blur-md bg-transparent flex justify-center items-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Profile</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Full Name</label>
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Email Address</label>
            <input
              type="email"
              name="email"
              value={editData.email}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Phone</label>
            <input
              type="text"
              name="phone"
              value={editData.phone}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Gender</label>
            <select
              name="gender"
              value={editData.gender}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border rounded-lg"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
