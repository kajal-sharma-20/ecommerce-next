"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OrderDetailsPage() {
  const { id,orderid } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const router=useRouter()

  useEffect(() => {
    if (orderid) fetchOrderDetails();
  }, [orderid]);

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/getorderbyid/${orderid}`);
      setOrder(res.data.order);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );

  if (!order)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Order not found
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Order Details
        </h1>
        <button
          onClick={()=>router.push(`/admin/${id}/orders`)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow hover:opacity-90 transition"
        >
          Back to Orders
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* Product Images */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {order.items.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-md">
                <Image
                  src={item.product_image}
                  alt={item.product_name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700 text-center">
                {item.product_name}
              </p>
            </div>
          ))}
        </div>

        {/* Partitioned Details */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Customer Info */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Customer Details</h2>
            <p><strong>Name:</strong> {order.customerName}</p>
            <p><strong>Email:</strong> {order.customerEmail}</p>
            <p><strong>Phone:</strong> {order.customerPhone}</p>
            <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`${
                  order.status === "paid"
                    ? "text-green-600"
                    : order.status === "pending"
                    ? "text-orange-500"
                    : "text-red-600"
                } font-semibold`}
              >
                {order.status}
              </span>
            </p>
            <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Order Summary</h2>
            <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
            <p><strong>Discount:</strong> ₹{order.discount}</p>
            <p><strong>Delivery Fee:</strong> ₹{order.deliveryFee}</p>
            <p className="text-lg font-bold text-green-600">
              <strong>Payable Amount:</strong> ₹{order.payableAmount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
