import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email);
      setStep("otp");
      addToast("OTP sent to your email.", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to send OTP.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const response = await verifyOtp(email, otp);
      console.log("%c Line:32 🍷 response", "color:#33a5ff", response);
      if (response.statusCode === 201 && response?.data?.token) {
        localStorage.setItem("authToken", response?.data?.token);
        addToast("Login successful!", "success");
        navigate("/dashboard");
      } else {
        addToast("Login failed: No token received.", "error");
      }
    } catch (err: any) {
      addToast(err.message || "Invalid OTP.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-sm sm:max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            {step === "email" ? "Login" : "Verify OTP"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {step === "email" ? (
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-1 h-10 sm:h-11"
                  placeholder="Enter your email"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-10 sm:h-11"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4 sm:space-y-5">
              <div className="flex flex-col items-center">
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-3"
                >
                  Enter OTP
                </label>
                <OtpInput length={6} onChange={setOtp} />
              </div>
              <Button
                type="submit"
                className="w-full h-10 sm:h-11"
                disabled={isVerifying || otp.length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
