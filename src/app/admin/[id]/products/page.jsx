"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit, Search, X } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Preview states
  const [previewMain, setPreviewMain] = useState(null);
  const [previewOthers, setPreviewOthers] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 3;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/getproducts`);
      setProducts(res.data.products.reverse());
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      const res = await axios.delete(`${API_URL}/deleteproduct/${id}`);
      if (res.status === 200) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else toast.error("Failed to delete product");
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting product");
    }
  };

  const openEditModal = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/getproduct/${id}`);
      setSelectedProduct(res.data.product);
      setPreviewMain(null);
      setPreviewOthers([]);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load product");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Append all fields
    for (const key in selectedProduct) {
      formData.append(key, selectedProduct[key]);
    }

    // Append files
    const mainImageInput = e.target.main_image.files[0];
    if (mainImageInput) formData.append("main_image", mainImageInput);

    const otherImagesInput = Array.from(e.target.image.files);
    if (otherImagesInput.length > 0) {
      otherImagesInput.forEach((file) => formData.append("image", file));
    }

    try {
      const res = await axios.put(
        `${API_URL}/updateproduct/${selectedProduct.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.status === 200) {
        toast.success("Product updated successfully");
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    }
  };

  //  Filter and paginate products
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Products
        </h1>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <th className="px-6 py-4 text-left">Image</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Stock</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentProducts.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-md">
                      <Image
                        src={p.main_image}
                        alt="Product"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full rounded-lg"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-600">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.category}</td>
                  <td className="px-6 py-4 font-bold text-green-600">₹{p.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.stock} units</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(p.id)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 gap-4 flex-wrap">
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

      {/* Edit Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex justify-center items-center z-50 overflow-y-auto">
          <div className="text-gray-600 rounded-2xl p-6 w-[90%] max-w-[500px] my-10 shadow-2xl relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Product
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <input
                type="text"
                name="name"
                value={selectedProduct.name || ""}
                onChange={handleInputChange}
                placeholder="Product Name"
                className="w-full border p-2 rounded-lg"
              />
              <input
                type="number"
                name="price"
                value={selectedProduct.price || ""}
                onChange={handleInputChange}
                placeholder="Price"
                className="w-full border p-2 rounded-lg"
              />
              <input
                type="number"
                name="stock"
                value={selectedProduct.stock || ""}
                onChange={handleInputChange}
                placeholder="Stock"
                className="w-full border p-2 rounded-lg"
              />
              <input
                type="text"
                name="category"
                value={selectedProduct.category || ""}
                onChange={handleInputChange}
                placeholder="Category"
                className="w-full border p-2 rounded-lg"
              />
              <textarea
                name="description"
                value={selectedProduct.description || ""}
                onChange={handleInputChange}
                placeholder="Description"
                className="w-full border p-2 rounded-lg"
              />

              <label className="block font-medium text-gray-700">Main Image:</label>
              <input
                type="file"
                name="main_image"
                accept="image/*"
                className="w-full"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setPreviewMain(URL.createObjectURL(file));
                }}
              />

              <div className="w-24 h-24 rounded-lg overflow-hidden mt-2 border">
                <Image
                  src={previewMain || selectedProduct.main_image}
                  alt="Main"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>

              <label className="block font-medium text-gray-700 mt-3">Other Images (max 5):</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                multiple
                className="w-full"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 5) {
                    toast.error("You can select a maximum of 5 images");
                    return;
                  }
                  setPreviewOthers(files.map((file) => URL.createObjectURL(file)));
                }}
              />

              <div className="flex flex-wrap gap-2 mt-2">
                {(previewOthers.length > 0 ? previewOthers : selectedProduct.image).map((img, i) => (
                  <div key={i} className="w-24 h-24 rounded-lg overflow-hidden border shadow-sm">
                    <Image src={img} alt={`Other ${i}`} width={96} height={96} className="object-cover w-full h-full rounded-lg" />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Update Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



