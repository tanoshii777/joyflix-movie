"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  Save,
  ArrowLeft,
  Camera,
  Upload,
} from "lucide-react";
import Image from "next/image";
import NavbarWrapper from "../components/NavbarWrapper";
import Footer from "../components/Footer";
import { toast } from "sonner";

type UserType = {
  email: string;
  username?: string;
  createdAt?: string;
  profileImage?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setFormData({
            username: data.user.username || "",
            email: data.user.email || "",
          });
          const savedImage = localStorage.getItem(
            `profile-image-${data.user.email}`
          );
          if (savedImage) {
            setProfileImage(savedImage);
          }
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/login");
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [router]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        // Save to localStorage
        if (user?.email) {
          localStorage.setItem(`profile-image-${user.email}`, result);
        }
        setIsUploading(false);
        toast.success("Profile image updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      // This would typically make an API call to update user profile
      console.log("Saving profile:", formData);

      // For now, update localStorage and local state
      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);

      // Save to localStorage for persistence
      localStorage.setItem(
        `user-profile-${user?.email}`,
        JSON.stringify(updatedUser)
      );

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (!authChecked) {
    return (
      <main className="flex items-center justify-center h-screen text-white bg-black">
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <NavbarWrapper />

      <div className="pt-20 px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-red-600 flex items-center justify-center">
                {profileImage ? (
                  <Image
                    src={profileImage || "/placeholder.svg"}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user.username || "User"}
              </h2>
              <p className="text-gray-400">
                Member since{" "}
                {user.createdAt
                  ? new Date(user.createdAt).getFullYear()
                  : "2024"}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm text-red-500 hover:text-red-400 flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                Change Photo
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <User className="w-4 h-4" />
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  placeholder="Enter your username"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600">
                  {user.username || "Not set"}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  placeholder="Enter your email"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600">
                  {user.email}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </label>
              <div className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "January 2024"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      username: user.username || "",
                      email: user.email || "",
                    });
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
