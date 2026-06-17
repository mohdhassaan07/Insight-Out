"use client";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import Card, { CardContent, CardHeader } from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Badge from "@/src/components/ui/Badge";
import axios, { AxiosError } from "axios";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/src/components/providers/ToastProvider";

const OTP_RESEND_SECONDS = 60;

type UpdateProfileResponse = {
  message: string;
  user: {
    name: string | null;
    profilePic: string | null;
  };
  organization: {
    name: string | null;
  };
};

export default function SettingsPage() {
  const { showToast } = useToast();
  const { data: session } = useSession();
  const [formData, setformData] = useState({
    name: "",
    organizationName: "",
    profilePic: ""
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingSection, setSavingSection] = useState<"profile" | "organization" | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    console.log("Session data:", session);
    if (!session?.user) return;

    setformData({
      name: session.user.name || "",
      organizationName: session.user.organizationName || "",
      profilePic: session.user.profilePic || ""
    });

    if (session.user.profilePic) {
      setAvatarUrl(session.user.profilePic);
    }
  }, [session]);

  useEffect(() => {
    if (!isDeleteModalOpen || otpResendTimer <= 0) return;

    const interval = window.setInterval(() => {
      setOtpResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isDeleteModalOpen, otpResendTimer]);

  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setformData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setPasswords((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const changeAvatar = () => {
    fileInputRef.current?.click();
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleSaveChanges = async (section: "profile" | "organization") => {
    try {
      setSavingSection(section);

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("organizationName", formData.organizationName);
      if (avatarFile) {
        payload.append("profilePic", avatarFile);
      }

      const response = await axios.put<UpdateProfileResponse>("/api/v1/updateProfile", payload);

      setformData({
        name: response.data.user.name || "",
        organizationName: response.data.organization.name || "",
        profilePic: response.data.user.profilePic || ""
      });
      setAvatarFile(null);
      if (response.data.user.profilePic) {
        setAvatarUrl(response.data.user.profilePic);
      }
      if (response.status === 200) {
        showToast(response.data.message, "success");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      showToast(axiosError.response?.data?.error || "Failed to save changes", "error");
    } finally {
      setSavingSection(null);
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUpdatingPassword(true);
      if (passwords.newPassword !== passwords.confirmPassword) {
        showToast("New password and confirm password do not match", "error");
        return;
      }

      const res = await axios.post("/api/v1/upadatePassword", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      if (res.status === 200) {
        showToast("Password updated successfully", "success");
      }
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      showToast(axiosError.response?.data?.error || "Failed to update password", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  const sendDeleteOtp = async () => {
    try {
      setIsSendingOtp(true);
      const response = await axios.post<{ message: string }>("/api/v1/send-otp");

      if (response.status === 200) {
        setOtpResendTimer(OTP_RESEND_SECONDS);
        showToast("OTP sent to your email", "success");
      }

      return true;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; retryAfter?: number }>;
      const retryAfter = axiosError.response?.data?.retryAfter;

      if (typeof retryAfter === "number" && retryAfter > 0) {
        setOtpResendTimer(retryAfter);
      }

      showToast(axiosError.response?.data?.error || "Failed to send OTP", "error");
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleDeleteAccountClick = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setOtp("");
      setIsDeleteModalOpen(true);
      const isOtpSent = await sendDeleteOtp();
      if (!isOtpSent) {
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setOtp("");
  };

  const handleVerifyAndDelete = async () => {
    if (!otp) {
      showToast("Please enter the OTP", "error");
      return;
    }
    try {
      setIsDeleting(true);
      const res = await axios.post("/api/v1/deleteAccount", { otp });
      if (res.status === 200) {
        showToast("Account deleted successfully", "success");
        signOut({ callbackUrl: "/" });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      showToast(axiosError.response?.data?.error || "Failed to delete account", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Settings
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Profile
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/250px-Default_pfp.svg.png" alt="Avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <Button variant="outline" onClick={changeAvatar} size="sm">Change Avatar</Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarChange}
                    hidden
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Full Name" placeholder="John Doe" name="name" onChange={handlechange} value={formData.name} />
                <Input label="Email" type="email" placeholder={`${session?.user.email}`} disabled />
              </div>
              {saveError && <p className="text-sm text-red-500">{saveError}</p>}
              {saveMessage && <p className="text-sm text-emerald-600 dark:text-emerald-400">{saveMessage}</p>}
              <div className="pt-2">
                <Button onClick={() => handleSaveChanges("profile")} isLoading={savingSection === "profile"}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Organization Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Organization
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Organization Name" placeholder="Acme Inc." name="organizationName" onChange={handlechange} value={formData.organizationName} />
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Current Plan
                </label>
                <div className="flex items-center gap-3">
                  <Badge variant="purple">Free</Badge>
                  <Button variant="outline" size="sm">Upgrade Plan</Button>
                </div>
              </div>
              <div className="pt-2">
                <Button onClick={() => handleSaveChanges("organization")} isLoading={savingSection === "organization"}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Password
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Current Password" type="password" name="currentPassword" onChange={handlechange} value={passwords.currentPassword} placeholder="••••••••" />
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="New Password" name="newPassword" onChange={handlechange} value={passwords.newPassword} type="password" placeholder="••••••••" />
                <Input label="Confirm Password" name="confirmPassword" onChange={handlechange} value={passwords.confirmPassword} type="password" placeholder="••••••••" />
              </div>
              <div className="pt-2">
                <Button isLoading={isUpdatingPassword} onClick={handlePasswordUpdate}>Update Password</Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Danger Zone
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">Delete Account</p>
                  <p className="text-sm text-zinc-500">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="danger" onClick={handleDeleteAccountClick}>Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Delete Account</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
              Enter the otp send to your email to confirm account deletion. This action cannot be undone.
            </p>
            <div className="mb-6">
              <Input
                label="OTP Verification"
                placeholder="Enter 6-digit OTP"
                value={otp}
                min={100000}
                type="number"
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <div className="mb-6 flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300">
              <span>
                {otpResendTimer > 0 ? `Resend OTP in ${otpResendTimer}s` : "Didn't receive the OTP?"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                isLoading={isSendingOtp}
                disabled={otpResendTimer > 0}
                onClick={sendDeleteOtp}
              >
                Resend OTP
              </Button>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCloseDeleteModal}>Cancel</Button>
              <Button variant="danger" isLoading={isDeleting} onClick={handleVerifyAndDelete}>Verify & Delete</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
