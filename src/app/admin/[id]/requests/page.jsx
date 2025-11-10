'use client';

import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Mail, Phone, ShoppingCart, MapPin, CreditCard } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Requests() {
  const [requests, setRequests] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 4;

  // Loading state for a specific button (approve/reject)
  const [loadingAction, setLoadingAction] = useState({ id: null, type: null });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/getpendingrequests`);
      if (res.status === 200 && res.data.requests?.length > 0) {
        setRequests(res.data.requests);
      } else {
        setRequests([]);
        toast.info("No pending cancel requests");
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setRequests([]);
        toast.info("No pending cancel requests");
      } else {
        console.error(err);
        toast.error("Error fetching requests");
      }
    }
  };

  const handleAction = async (orderId, action) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this cancel request?`
    );
    if (!confirmed) return;

    // Set which button (approve/reject) is loading for which order
    setLoadingAction({ id: orderId, type: action });

    try {
      const res = await axios.patch(
        `${API_URL}/handlerequest/${orderId}`,
        { action }
      );
      if (res.status === 200) {
        toast.success(`Request ${action}ed successfully`);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating request");
    } finally {
      // Reset loading
      setLoadingAction({ id: null, type: null });
    }
  };

  // Pagination logic
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(requests.length / requestsPerPage);

  return (
    <div className="space-y-14 animate-fade-in min-h-screen flex flex-col">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Pending Requests
        </h1>
        <p className="text-gray-600">
          Manage user cancel order requests and take action
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
        {currentRequests.map((req) => (
          <div
            key={req.order_id}
            className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {req.user_name}
                    </h3>
                    <p className="text-sm text-gray-500">{req.user_email}</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                  {req.cancel_request_status}
                </span>
              </div>

              {/* Order Info */}
              <div className="space-y-1 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Order ID: {req.order_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{req.customer_email || "Not Provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{req.customer_phone || "Not Provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{req.shipping_address || "No address provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>{req.payment_method || ""}</span>
                </div>
              </div>

              {/* Amounts */}
              <div className="mt-3 flex justify-between text-gray-700 text-sm font-medium">
                <span>Total: ₹{req.total_amount}</span>
                <span>Payable: ₹{req.payable_amount}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              {/* Approve Button */}
              <button
                onClick={() => handleAction(req.order_id, "approve")}
                disabled={
                  loadingAction.id === req.order_id &&
                  loadingAction.type === "approve"
                }
                className={`flex-1 px-4 py-2 rounded-xl text-white font-semibold shadow-lg transition-transform duration-200 ${
                  loadingAction.id === req.order_id &&
                  loadingAction.type === "approve"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105"
                }`}
              >
                {loadingAction.id === req.order_id &&
                loadingAction.type === "approve"
                  ? "Processing..."
                  : "Approve"}
              </button>

              {/* Reject Button */}
              <button
                onClick={() => handleAction(req.order_id, "reject")}
                disabled={
                  loadingAction.id === req.order_id &&
                  loadingAction.type === "reject"
                }
                className={`flex-1 px-4 py-2 rounded-xl text-white font-semibold shadow-lg transition-transform duration-200 ${
                  loadingAction.id === req.order_id &&
                  loadingAction.type === "reject"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-500 to-pink-500 hover:scale-105"
                }`}
              >
                {loadingAction.id === req.order_id &&
                loadingAction.type === "reject"
                  ? "Processing..."
                  : "Reject"}
              </button>
            </div>
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
