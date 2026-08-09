async function testOtp() {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: "9876543210" }),
    });
    const data = await res.json();
    console.log("Send OTP Response:", data);
  } catch (err) {
    console.error("Test OTP Error:", err.message);
  }
}

testOtp();
