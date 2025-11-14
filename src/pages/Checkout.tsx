import {  useState } from "react";
import { useAppSelector, useAppDispatch } from "@/Redux/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PaypalButton from "../components/PaypalButton";
import { createCheckout, clearCheckout } from "@/Redux/slices/checkoutSlice";
import { cleanCart } from "@/Redux/slices/cartSlice";

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

const Checkout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { cart } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const { checkout, loading } = useAppSelector((state) => state.checkout);

  const items = cart?.products || [];

  const [form, setForm] = useState<CheckoutForm>({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
    0
  );

  // ✅ Handle Checkout creation via Redux
  const handleSubmit = async () => {
    if (!form.email || !form.firstName || !form.address) {
      toast.error("Please fill all required fields");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    try {
      const checkoutData = {
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.image,
        })),
        shippingAddress: {
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
        paymentMethod: "PayPal",
        totalPrice: subtotal,
      };

      const result = await dispatch(createCheckout(checkoutData)).unwrap();

      toast.success("Checkout created successfully!");
    } catch (err: any) {
      toast.error(err || "Failed to create checkout");
    }
  };

  // ✅ Handle payment success with Redux + backend finalize
  const handlePaymentSuccess = async (details: any) => {
    try {
      toast.loading("Verifying payment...");

      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");

      if (!checkout?._id) {
        toast.dismiss();
        toast.error("Checkout ID not found. Please try again.");
        return;
      }

      // Step 1: Mark checkout as paid
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkout._id}/pay`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentStatus: "Paid",
            paymentDetails: details,
          }),
        }
      );

      // Step 2: Finalize checkout → Create Order
      const finalizeRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkout._id}/finalize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const order = await finalizeRes.json();

      // Step 3: Clear everything
      dispatch(cleanCart());
      dispatch(clearCheckout());
      localStorage.removeItem("cart");

      await new Promise((res) => setTimeout(res, 300));

      toast.dismiss();
      toast.success("Payment successful! Order confirmed.");

      navigate("/order-confirmation", { state: { orderId: order._id } });
    } catch (err: any) {
      toast.dismiss();
      toast.error("Payment verification failed. Try again.");
    }
  };

  return (
     <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT — Checkout Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contact & Delivery Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  type="email"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input name="city" value={form.city} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-sm font-medium">Postal Code</label>
                  <Input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    type="tel"
                  />
                </div>
              </div>

              <div className="mt-6">
                {!checkout?._id ? (
                  <Button
                    className="w-full mt-6"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Continue to Payment"}
                  </Button>
                ) : (
                  <div>
                    <h3 className="text-lg mb-4 font-semibold">
                      Pay with PayPal
                    </h3>
                    <PaypalButton
                      amount={subtotal}
                      onSuccess={handlePaymentSuccess}
                      onError={(err) =>
                        toast.error("Payment failed: " + err.message)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT — Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your cart is empty</p>
            ) : (
              <>
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between gap-4 border-b pb-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {item.size} | Color: {item.color}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">₹{item.price?.toFixed(2)}</p>
                  </div>
                ))}

                <div className="pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
