"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const userId = id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [otherImages, setOtherImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all categories (from existing products)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/getproducts`);
        if (res.status === 200 && res.data.products) {
          const uniqueCategories = [
            ...new Set(res.data.products.map((p) => p.category).filter(Boolean)),
          ];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Handle input change
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Handle main image upload
  function handleMainImageChange(e) {
    const file = e.target.files[0];
    if (file) setMainImage(file);
  }

  // Handle multiple images
  function handleOtherImagesChange(e) {
    const files = Array.from(e.target.files);
    const combined = [...otherImages, ...files];
    if (combined.length > 5) {
      toast.error("You can upload a maximum of 5 images total.");
      return;
    }
    setOtherImages(combined);
  }

  // Add new category dynamically and auto-select it
  function handleAddCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty");
      return;
    }
    if (categories.includes(trimmed)) {
      toast.info("Category already exists — selected automatically");
      setFormData((prev) => ({ ...prev, category: trimmed }));
      return;
    }

    setCategories((prev) => [...prev, trimmed]);
    setFormData((prev) => ({ ...prev, category: trimmed }));
    setNewCategory("");
    toast.success(`New category "${trimmed}" added and selected!`);
  }

  // Submit form
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("category", formData.category);

      if (mainImage) data.append("main_image", mainImage);
      otherImages.forEach((img) => data.append("image", img));

      await axios.post(`${API_URL}/addproduct`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product created successfully!");
      router.push(`/admin/${userId}/products`);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Create Product
        </h1>
        <p className="text-gray-600">Add a new product to your inventory</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl text-gray-700 border border-gray-200 focus:ring-2 focus:ring-purple-500"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-gray-700 border border-gray-200 focus:ring-2 focus:ring-purple-500"
              placeholder="Enter product description"
            />
          </div>

          {/* Price, Stock, Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl text-gray-700 border border-gray-200 focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border text-gray-700 border-gray-200 focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border text-gray-700 border-gray-200 focus:ring-2 focus:ring-purple-500 mb-2"
              >
                <option value="">Select</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

              {/* Add new category */}
              <div className="relative w-full max-w-sm">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                  className="w-full px-2 py-2 pr-20 border text-gray-700 border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="absolute right-1 top-1 bottom-1 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform duration-300"
                >
                  Add
                </button>
              </div>

              {/* Show currently selected category */}
              {formData.category && (
                <p className="text-xs text-gray-500 mt-2">
                  Selected category:{" "}
                  <span className="font-semibold text-purple-600">
                    {formData.category}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Main Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              className="w-full border text-gray-700 border-gray-200 rounded-xl px-4 py-3"
            />
            {mainImage && (
              <div className="w-24 h-24 mt-3 rounded-xl overflow-hidden border border-gray-300 shadow-sm">
                <img
                  src={URL.createObjectURL(mainImage)}
                  alt="Main preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Other Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Images (Max 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleOtherImagesChange}
              className="w-full border text-gray-700 border-gray-200 rounded-xl px-4 py-3"
            />

            {otherImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {otherImages.map((img, i) => (
                  <div
                    key={i}
                    className="w-24 h-24 rounded-xl overflow-hidden border border-gray-300 shadow-sm"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Preview ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? "Creating..." : "Create Product"}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/admin/${userId}/products`)}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
