"use client";

import { useState } from "react";
import { X, Calendar, Clock } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface BookingModalProps {
  lawyerId: string;
  lawyerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookingModal({
  lawyerId,
  lawyerName,
  isOpen,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      toast.error("Please select both date and time");
      return;
    }

    const dateTimeString = new Date(`${date}T${time}`).toISOString();

    if (new Date(dateTimeString) <= new Date()) {
      toast.error("Please select a future date and time");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/appointments/book", {
        lawyerId,
        date: dateTimeString,
      });

      toast.success("Appointment booked successfully!");
      setDate("");
      setTime("");
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Book Appointment
          </h2>
          <p className="text-gray-600">
            Schedule a consultation with <span className="font-semibold">{lawyerName}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span>Select Date</span>
              </div>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                <span>Select Time</span>
              </div>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
