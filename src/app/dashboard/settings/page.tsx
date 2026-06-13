"use client";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import Card, { CardContent, CardHeader } from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Badge from "@/src/components/ui/Badge";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

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
  const { data: session } = useSession();
  const [formData, setformData] = useState({
    name: "",
    organizationName: "",
    profilePic: ""
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
  
  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setformData((prev)=>({
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

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      setSaveError(null);

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
      setSaveMessage(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      setSaveError(axiosError.response?.data?.error || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }

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
                <Button onClick={handleSaveChanges} isLoading={isSaving}>Save Changes</Button>
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
                <Button onClick={handleSaveChanges} isLoading={isSaving}>Save Changes</Button>
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
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="New Password" type="password" placeholder="••••••••" />
                <Input label="Confirm Password" type="password" placeholder="••••••••" />
              </div>
              <div className="pt-2">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          {/* <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                API Access
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  API Key
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value="sk-••••••••••••••••••••••••••••" 
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 font-mono text-sm"
                  />
                  <Button variant="outline">Copy</Button>
                  <Button variant="outline">Regenerate</Button>
                </div>
              </div>
              <p className="text-sm text-zinc-500">
                Use this API key to authenticate requests to the Insight-Out API. Keep it secret!
              </p>
            </CardContent>
          </Card> */}

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
                <Button variant="danger">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
