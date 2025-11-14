import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PaypalButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

const PaypalButton: React.FC<PaypalButtonProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  

  return (
    <div>
      <PayPalScriptProvider
        options={{
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
          currency: "USD", // ✅ keep only currency
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical", color: "gold" }}
          createOrder={(data, actions) => {
            return actions.order.create({
              // ✅ intent moved inside createOrder
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    currency_code: "USD",
                    value: amount.toFixed(2),
                  },
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            if (!actions.order) return;
            const details = await actions.order.capture();
            onSuccess(details);
          }}
          onError={(err) => {
            console.error("PayPal error:", err);
            onError(err);
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PaypalButton;
