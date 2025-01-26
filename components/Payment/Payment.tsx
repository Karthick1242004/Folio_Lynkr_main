"use client"
import { useStore } from '@/store/store';
import Script from 'next/script';
import { useState } from 'react';

interface PaymentProps {
  onSuccess: () => void;
  amount: number;
}

const Payment = ({ onSuccess, amount }: PaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { setPaymentComplete } = useStore();

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amount * 100 }),
      });
      
      const data = await response.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "Folio4U",
        description: "Portfolio Creation Payment",
        order_id: data.orderId,
        handler: function (response: any) {
          setPaymentComplete(true);
          onSuccess();
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "",
        },
        theme: {
          color: "#574EFA",
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (error) {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="ml-auto px-6 py-3 bg-[#574EFA] text-white rounded-lg hover:bg-[#4A3FF7] transition-colors disabled:bg-gray-400"
      >
        {isProcessing ? "Processing..." : "Pay & Submit"}
      </button>
    </>
  );
};

export default Payment;
