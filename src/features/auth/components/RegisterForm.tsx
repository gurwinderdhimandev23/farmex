"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LocationPicker } from "@/components/ui/LocationPicker";
import { DocumentUploader } from "@/components/ui/DocumentUploader";
import { Phone, Lock, User, Eye, EyeOff, ArrowRight, Truck, Tractor, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type PublicRegisterRole = "FARMER" | "TRANSPORTER";

export const RegisterForm: React.FC = () => {
  const searchParams = useSearchParams();
  const initialPhone = searchParams?.get("phone") || "";
  const { register, isLoading } = useAuth();
  const [role, setRole] = useState<PublicRegisterRole>("FARMER");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(initialPhone.replace(/\D/g, "").slice(0, 10));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const qPhone = searchParams?.get("phone");
    if (qPhone) {
      const cleanPhone = qPhone.replace(/\D/g, "").slice(0, 10);
      if (cleanPhone) {
        setPhone(cleanPhone);
      }
    }
  }, [searchParams]);

  // Address & Coordinates
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pincode, setPincode] = useState("");

  // Transporter KYC fields
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licensePhotoUrl, setLicensePhotoUrl] = useState<string | null>(null);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState<string | null>(null);
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(true);

  const [error, setError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(numericValue);
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format 12-digit Aadhaar as 4-4-4
    const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
    setAadhaarNumber(raw);
  };

  const formattedAadhaarDisplay = aadhaarNumber
    ? aadhaarNumber.replace(/(\d{4})(?=\d)/g, "$1 ")
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!phone.trim() || phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (role === "TRANSPORTER") {
      if (!licenseNumber.trim()) {
        setError("Please enter your Commercial Driving License number");
        return;
      }
      if (aadhaarNumber.trim() && aadhaarNumber.replace(/\s/g, "").length !== 12) {
        setError("Aadhaar number must be exactly 12 digits");
        return;
      }
    }

    const success = await register({
      name: name.trim(),
      phone: phone.trim(),
      password,
      role,
      address: address.trim() || undefined,
      latitude: latitude !== null ? latitude : undefined,
      longitude: longitude !== null ? longitude : undefined,
      village: village.trim() || undefined,
      district: district.trim() || undefined,
      state: stateVal.trim() || undefined,
      pincode: pincode.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      licensePhotoUrl: licensePhotoUrl || undefined,
      aadhaarNumber: aadhaarNumber.trim() || undefined,
      aadhaarFrontUrl: aadhaarFrontUrl || undefined,
      aadhaarBackUrl: aadhaarBackUrl || undefined,
    });

    if (!success) {
      setError("Registration failed. Please check if this phone number is already registered.");
    }
  };

  const roleOptions: { id: PublicRegisterRole; title: string; desc: string; icon: React.ElementType }[] = [
    { id: "FARMER", title: "Farmer / Kisan", desc: "Book Mandi Transport", icon: Tractor },
    { id: "TRANSPORTER", title: "Transporter", desc: "Accept & Deliver Loads", icon: Truck },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Role Selection (Only Farmer & Transporter) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
          I want to register as a <span className="text-emerald-600">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = role === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => setRole(opt.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer",
                  isSelected
                    ? "bg-emerald-50/90 border-emerald-500 text-emerald-800 shadow-2xs ring-2 ring-emerald-500/20"
                    : "bg-white/70 border-slate-200/80 text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("w-6 h-6 mb-1.5", isSelected ? "text-emerald-600" : "text-slate-400")} />
                <span className="text-xs font-extrabold block">{opt.title}</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Input
        label="Full Name"
        type="text"
        placeholder="e.g. Ramesh Kumar"
        value={name}
        onChange={(e) => setName(e.target.value)}
        leftIcon={<User className="w-4 h-4" />}
        required
      />

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
        placeholder="Create a strong password (min 6 chars)"
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

      {/* Base Location Picker for Farmers and Transporters */}
      <LocationPicker
        label={role === "FARMER" ? "Farm / Village Location" : "Transporter Garage / Station Location"}
        placeholder={role === "FARMER" ? "Search farm village or city..." : "Search parking station or city..."}
        value={address}
        latitude={latitude}
        longitude={longitude}
        onChange={(loc) => {
          setAddress(loc.address);
          setLatitude(loc.latitude);
          setLongitude(loc.longitude);
          if (loc.city) setDistrict(loc.city);
          if (loc.state) setStateVal(loc.state);
        }}
        helperText="Tip: You can use GPS to automatically detect and lock your location."
      />

      {role === "FARMER" && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Input
            label="Village / Town"
            placeholder="e.g. Rampur"
            value={village}
            onChange={(e) => setVillage(e.target.value)}
          />
          <Input
            label="District"
            placeholder="e.g. Ludhiana"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
          <Input
            label="State"
            placeholder="e.g. Punjab"
            value={stateVal}
            onChange={(e) => setStateVal(e.target.value)}
          />
          <Input
            label="Pincode"
            placeholder="e.g. 141001"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />
        </div>
      )}

      {role === "TRANSPORTER" && (
        <div className="space-y-3.5 pt-1">
          <Input
            label="Commercial Driving License No."
            placeholder="e.g. DL-0420110012345"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            required
            helperText="Required by Transport Regulations for commercial load transport."
          />

          <DocumentUploader
            label="Commercial Driving License Photo"
            value={licensePhotoUrl}
            onChange={setLicensePhotoUrl}
            folder="kyc"
            description="Clear photo of your Driving License"
          />

          <Input
            label="12-Digit Aadhaar Number (Optional / Masked)"
            placeholder="e.g. 1234 5678 9012"
            value={formattedAadhaarDisplay}
            onChange={handleAadhaarChange}
            maxLength={14}
            helperText="Your Aadhaar will be masked & securely stored for Admin KYC approval."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <DocumentUploader
              label="Aadhaar Front Photo"
              value={aadhaarFrontUrl}
              onChange={setAadhaarFrontUrl}
              folder="kyc"
              description="Front side with photo"
            />
            <DocumentUploader
              label="Aadhaar Back Photo"
              value={aadhaarBackUrl}
              onChange={setAadhaarBackUrl}
              folder="kyc"
              description="Back side with address"
            />
          </div>

          <label className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              required
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-slate-600 leading-tight">
              I voluntarily provide my Commercial License & ID credentials for driver verification on FarmEx under DPDP regulations.
            </span>
          </label>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        disabled={!consentGiven && role === "TRANSPORTER"}
        rightIcon={<ArrowRight className="w-4 h-4" />}
        className="w-full mt-2"
      >
        Complete Registration
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </form>
  );
};
