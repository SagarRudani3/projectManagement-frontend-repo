import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { OtpInput } from "../../components/ui/otp-input";
import { login, verifyOtp } from "../../lib/api";
import { useToast } from "../../lib/toast";

export const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email);
      setStep("otp");
      addToast("OTP sent to your email.", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to send OTP.", "error");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await verifyOtp(email, otp);
      console.log("%c Line:32 🍷 response", "color:#33a5ff", response);
      if (response.token) {
        localStorage.setItem("authToken", response.token);
        addToast("Login successful!", "success");
        navigate("/");
      } else {
        addToast("Login failed: No token received.", "error");
      }
    } catch (err: any) {
      addToast(err.message || "Invalid OTP.", "error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{step === "email" ? "Login" : "Verify OTP"}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex flex-col items-center">
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter OTP
                </label>
                <OtpInput length={6} onChange={setOtp} />
              </div>
              <Button type="submit" className="w-full">
                Verify
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
