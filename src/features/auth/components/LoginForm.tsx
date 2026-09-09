"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Phone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim() || phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    const res = await login({ phone: phone.trim(), password });
    if (!res.success) {
      if (res.errorCode === "USER_NOT_FOUND") {
        toast.info("No account found with this number. Redirecting to registration...", {
          duration: 3000,
        });
        router.push(`/register?phone=${encodeURIComponent(phone.trim())}`);
        return;
      }
      const msg = res.errorMessage || "Invalid phone number or password. Please try again.";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <Input
        label="Phone Number"
        type="tel"
        placeholder="10-digit mobile number"
        value={phone}
        onChange={handlePhoneChange}
        maxLength={10}
        leftIcon={<Phone className="w-4 h-4" />}
        required
      />


      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock className="w-4 h-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        rightIcon={<ArrowRight className="w-4 h-4" />}
        className="w-full mt-2"
      >
        Sign In to Portal
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
};
