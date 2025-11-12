"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const { id } = useParams();
  const userid = id;
  const router = useRouter();

  // Fetch orders page by page
  const fetchOrders = async (pageNumber) => {
    try {
      const res = await axios.get(
        `${API_URL}/getallorders?page=${pageNumber}&limit=7`
      );

      if (res.data.orders.length > 0) {
        setOrders((prev) => [...prev, ...res.data.orders]);
        setHasMore(pageNumber < res.data.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setHasMore(false);
      } else {
        toast.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders(1);
  }, []);

  // Intersection Observer
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setLoading(true);
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Fetch next page when page state changes
  useEffect(() => {
    if (page > 1) fetchOrders(page);
  }, [page]);

  const handleorderstatus = async (e, id) => {
    const newStatus = e.target.value;
    try {
      await axios.patch(`${API_URL}/updateorderstatus/${id}`, {
        status: newStatus,
      });
      toast.success("Order status updated");
      setOrders((prev) =>
        prev.map((o) => (o.orderId === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeliveryStatusChange = async (e, id) => {
    const newDeliveryStatus = e.target.value;
    setUpdatingOrderId(id);
    try {
      await axios.patch(
        `${API_URL}/updatedeliverystatus/${id}`,
        {
          delivery_status: newDeliveryStatus,
        }
      );

      toast.success("Delivery status updated");
      setOrders([]);        // clear existing orders
    setPage(1);           // reset pagination
    setHasMore(true);     // allow infinite scroll or pagination again
    setLoading(true);     // show loader
    fetchOrders(1);       // refetch orders from page 1
    } catch (err) {
      toast.error("Failed to update delivery status");
    }
    finally {
    setUpdatingOrderId(null); // re-enable dropdown
  }
  };

  return (
    <div className="flex flex-col h-screen p-4">
      {/* Sticky header */}
      <div className="fixed top-10 z-20 pb-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Orders
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="fixed top-30 left-66 right-5 bottom-0 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[400px]
        max-md:left-0 max-md:right-0 max-md:top-28 max-md:mx-2 max-md:rounded-lg">
        <div className="max-h-full  overflow-x-auto overflow-y-auto">
          <table className="w-full border-collapse text-sm max-md:text-xs max-md:min-w-[600px]">
            <thead className="sticky top-0 z-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <tr>
                <th className="px-2 py-4 text-center">Order ID</th>
                <th className="px-2 py-4 text-center">User</th>
                <th className="px-2 py-4 text-center">Payable</th>
                <th className="px-2 py-4 text-center">Payment</th>
                <th className="px-2 py-4 text-center">Payment Status</th>
                <th className="px-2 py-4 text-center">Delivery Status</th>
                <th className="px-1 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {orders.map((order, index) => (
                <tr
                  key={`${order.orderId}-${index}`}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition"
                >
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="font-medium">{order.userName}</div>
                    <div className="text-gray-500 text-xs">
                      {order.userEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    ₹{order.payableAmount}
                  </td>
                  <td className="px-6 py-4 text-gray-800">{order.paymentMethod}</td>
                  <td className="px-6 py-4 text-gray-800">
                    {order.paymentMethod === "COD" ? (
                      <select
                        value={order.status}
                        onChange={(e) => handleorderstatus(e, order.orderId)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    ) : (
                      <span
                        className={`font-medium ${
                          order.status === "paid"
                            ? "text-green-600"
                            : order.status === "pending"
                            ? "text-orange-500"
                            : order.status === "cancelled"
                            ? "text-red-600"
                             : order.status === "refunded"
                            ? "text-orange-500"
                            : ""
                        }`}
                      >
                        {order.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-800">
                    <select
                     disabled={updatingOrderId === order.orderId}
                      value={order.deliveryStatus}
                      onChange={(e) =>
                        handleDeliveryStatusChange(e, order.orderId)
                      }
                      className={`border border-gray-300 rounded px-2 py-1 text-sm ${
    updatingOrderId === order.orderId ? "opacity-50 cursor-not-allowed" : ""
  }`}
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {updatingOrderId === order.orderId && (
  <span className="ml-2 inline-block animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
)}
                  </td>
                  <td className="px-2 py-4">
                    <button
                      onClick={() =>
                        router.push(`/admin/${userid}/orders/${order.orderId}`)
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Loader or sentinel */}
          <div ref={loaderRef} className="flex justify-center p-4">
            {hasMore ? (
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            ) : (
              <p className="text-gray-500 text-sm">No more orders</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
