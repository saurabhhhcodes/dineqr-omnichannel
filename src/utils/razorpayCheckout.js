// src/utils/razorpayCheckout.js - Standard Web Checkout integration for Razorpay
/**
 * Triggers standard Razorpay Checkout:
 * 1. Calls POST /api/create-order to create order on backend
 * 2. Opens Razorpay standard checkout popup with order_id
 * 3. On success: calls POST /api/verify-payment with razorpay_order_id, razorpay_payment_id, razorpay_signature
 * 4. Handles modal dismiss (user cancelled) and payment.failed events
 */
export async function triggerRazorpayCheckout({
  amountInRupees,
  amountInPaise,
  currency = 'INR',
  name = 'DineQR Restaurant POS',
  description = 'Order Payment',
  receipt,
  prefill = {},
  notes = {},
  themeColor = '#f59e0b',
  onStart,
  onSuccess,
  onFailure,
  onDismiss,
}) {
  try {
    if (onStart) onStart();

    // Ensure amount in paise (minimum 100 paise = ₹1)
    const totalPaise = amountInPaise || Math.round(Number(amountInRupees || 0) * 100);
    if (!totalPaise || totalPaise < 100) {
      throw new Error('Minimum payment amount is ₹1.00 (100 paise)');
    }

    // Step 1: Create Order via Backend
    const createRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes,
      }),
    });

    const orderData = await createRes.json();
    if (!createRes.ok || !orderData.success) {
      throw new Error(orderData.error || 'Failed to create Razorpay checkout order');
    }

    // Ensure Razorpay SDK is loaded
    if (!window.Razorpay) {
      throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
    }

    const keyId =
      orderData.key_id ||
      import.meta.env.VITE_RAZORPAY_KEY_ID ||
      'rzp_test_TxIAxSWbhZU5bk';

    // Step 2: Open Standard Razorpay Modal
    const options = {
      key: keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name,
      description,
      order_id: orderData.order_id,
      prefill: {
        name: prefill.name || 'Valued Guest',
        email: prefill.email || 'guest@dineqr.com',
        contact: prefill.contact || '9876543210',
      },
      notes: {
        ...notes,
        order_id: orderData.order_id,
      },
      theme: {
        color: themeColor,
      },
      modal: {
        confirm_close: true,
        ondismiss: function () {
          console.log('[Razorpay] Modal dismissed by user');
          if (onDismiss) onDismiss();
        },
      },
      // Step 3: Handle Payment Success -> Send to /api/verify-payment
      handler: async function (response) {
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: notes.order_id || receipt,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            if (onSuccess) {
              onSuccess({
                ...verifyData,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
              });
            }
          } else {
            const err = new Error(verifyData.error || 'Payment signature verification failed');
            if (onFailure) onFailure(err);
          }
        } catch (verifyErr) {
          if (onFailure) onFailure(verifyErr);
        }
      },
    };

    const rzpInstance = new window.Razorpay(options);

    // Handle payment failure event
    rzpInstance.on('payment.failed', function (response) {
      console.error('[Razorpay] Payment failed event:', response.error);
      if (onFailure) {
        onFailure(new Error(response.error?.description || 'Payment was declined or failed'));
      }
    });

    rzpInstance.open();
  } catch (err) {
    console.error('[Razorpay Checkout Error]:', err);
    if (onFailure) onFailure(err);
  }
}
