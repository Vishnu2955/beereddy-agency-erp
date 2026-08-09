import React, { useState } from "react";
import { FaTag, FaCheck, FaLock } from "react-icons/fa";

export default function UiverseCheckoutCard({
  title = "CHECKOUT & PAYMENT",
  shippingAddress = "221B Baker Street, W1U 8ED, London",
  paymentMethod = "Official QR / UPI / Bank Transfer",
  paymentDetail = "BEEREDDY AGENCY ERP • GST Billing",
  subtotal = 0,
  shipping = 0,
  tax = 0,
  discount = 0,
  totalPrice = 0,
  onApplyPromo,
  onCheckout,
  buttonText = "Checkout",
  loading = false,
}) {
  const [promoCode, setPromoCode] = useState("");

  const handlePromoSubmit = (e) => {
    e.preventDefault();
    if (onApplyPromo) {
      onApplyPromo(promoCode);
    }
  };

  return (
    <div className="uiverse-checkout-container my-4">
      <div className="card cart">
        <label className="title">{title}</label>
        <div className="steps">
          <div className="step">
            
            {/* SHIPPING SECTION */}
            <div>
              <span>SHIPPING ADDRESS</span>
              <p>{shippingAddress}</p>
            </div>
            <hr />

            {/* PAYMENT METHOD SECTION */}
            <div>
              <span>PAYMENT METHOD</span>
              <p className="font-bold">{paymentMethod}</p>
              <p>{paymentDetail}</p>
            </div>
            <hr />

            {/* PROMO CODE SECTION */}
            <div className="promo">
              <span>HAVE A PROMO CODE?</span>
              <form className="form" onSubmit={handlePromoSubmit}>
                <input
                  className="input_field"
                  placeholder="Enter Promo Code"
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button type="submit">Apply</button>
              </form>
            </div>
            <hr />

            {/* PAYMENTS SUMMARY */}
            <div className="payments">
              <span>PAYMENT BREAKDOWN</span>
              <div className="details">
                <span>Subtotal (Excl. Tax):</span>
                <span>₹{Number(subtotal).toLocaleString("en-IN")}</span>
                
                {shipping > 0 && (
                  <>
                    <span>Shipping / Freight:</span>
                    <span>₹{Number(shipping).toLocaleString("en-IN")}</span>
                  </>
                )}

                <span>GST (18% Tax):</span>
                <span>₹{Number(tax).toLocaleString("en-IN")}</span>

                {discount > 0 && (
                  <>
                    <span>Discount:</span>
                    <span className="text-emerald-700">-₹{Number(discount).toLocaleString("en-IN")}</span>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CHECKOUT FOOTER */}
      <div className="card checkout">
        <div className="footer">
          <label className="price">₹{Number(totalPrice).toLocaleString("en-IN")}</label>
          <button
            type="button"
            onClick={onCheckout}
            disabled={loading}
            className="checkout-btn"
          >
            {loading ? "Processing..." : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
