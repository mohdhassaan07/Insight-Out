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

type Role = "Admin" | "Manager" | "Member";

type TeamMember = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  profilePic: string | null;
  createdAt: string;
};

type TeamInvite = {
  id: string;
  email: string;
  role: "Manager" | "Member";
  expiresAt: string;
  createdAt: string;
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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Manager" | "Member">("Member");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [memberActionId, setMemberActionId] = useState<string | null>(null);
  const currentRole = session?.user?.role as Role | undefined;
  const canManageTeam = currentRole === "Admin";
  const canViewTeam = currentRole === "Admin" || currentRole === "Manager";

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
      if (section === "profile") {
        payload.append("name", formData.name);
      }
      if (section === "organization") {
        payload.append("organizationName", formData.organizationName);
      }
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

  const fetchTeam = async () => {
    if (!canViewTeam) return;
    try {
      setTeamLoading(true);
      const response = await axios.get<{ members: TeamMember[]; invites: TeamInvite[] }>("/api/v1/team/members");
      setTeamMembers(response.data.members);
      setTeamInvites(response.data.invites);
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      showToast(axiosError.response?.data?.error || "Failed to load team", "error");
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    void fetchTeam();
  }, [canViewTeam]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setInviteLoading(true);
      await axios.post("/api/v1/team/invites", {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteRole("Member");
      showToast("Invite sent successfully", "success");
      await fetchTeam();
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      showToast(axiosError.response?.data?.error || "Failed to send invite", "error");
    } finally {
      setInviteLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, role: "Manager" | "Member") => {
    try {
      setMemberActionId(memberId);
      await axios.patch(`/api/v1/team/members/${memberId}/role`, { role });
      showToast("Member role updated", "success");
      await fetchTeam();
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      showToast(axiosError.response?.data?.error || "Failed to update member", "error");
    } finally {
      setMemberActionId(null);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!window.confirm("Remove this member from the organization?")) return;
    try {
      setMemberActionId(memberId);
      await axios.delete(`/api/v1/team/members/${memberId}`);
      showToast("Member removed", "success");
      await fetchTeam();
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      showToast(axiosError.response?.data?.error || "Failed to remove member", "error");
    } finally {
      setMemberActionId(null);
    }
  };

  const transferAdmin = async (memberId: string) => {
    if (!window.confirm("Transfer admin ownership to this member? You will become a Manager.")) return;
    try {
      setMemberActionId(memberId);
      await axios.post("/api/v1/team/transfer-admin", { userId: memberId });
      showToast("Admin ownership transferred. Please sign in again to refresh your session.", "success");
      await signOut({ callbackUrl: "/signin" });
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      showToast(axiosError.response?.data?.error || "Failed to transfer admin", "error");
    } finally {
      setMemberActionId(null);
    }
  };

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
              <Input label="Organization Name" placeholder="Acme Inc." name="organizationName" onChange={handlechange} value={formData.organizationName} disabled={!canManageTeam} />
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
                <Button onClick={() => handleSaveChanges("organization")} isLoading={savingSection === "organization"} disabled={!canManageTeam}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {canViewTeam && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                      <svg className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Team
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{teamMembers.length} members</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {canManageTeam && (
                  <div className="relative overflow-hidden rounded-xl border border-indigo-100 dark:border-indigo-500/10 bg-linear-to-brrom-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-500/5 dark:via-zinc-900 dark:to-purple-500/5">
                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />
                    <form onSubmit={handleInvite} className="grid gap-4 p-5 md:grid-cols-[1fr_150px_auto]">
                      <div>
                        <label className="block text-[11px] font-mono tracking-[0.12em] uppercase text-zinc-500 dark:text-zinc-400 mb-2">
                          Invite Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="teammate@example.com"
                            required
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono tracking-[0.12em] uppercase text-zinc-500 dark:text-zinc-400 mb-2">
                          Role
                        </label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as "Manager" | "Member")}
                          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 transition-all duration-300 cursor-pointer appearance-none 
                          bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] 
                          bg-size-[1.25rem] bg-position-[right_0.5rem_center] bg-no-repeat pr-8"
                        >
                          <option value="Member">Member</option>
                          <option value="Manager">Manager</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button type="submit" isLoading={inviteLoading} className="w-full py-2.5">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Send Invite
                          </span>
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Members list */}
                <div className="space-y-2">
                  {teamLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Loading team members...</span>
                      </div>
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="group flex flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-4 transition-all duration-300 hover:border-zinc-200 hover:shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:hover:border-zinc-700 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3.5">
                          <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold ring-2 transition-all duration-300 ${member.role === "Admin"
                            ? "ring-purple-200 dark:ring-purple-500/30 bg-linear-to-br from-purple-100 to-purple-50 text-purple-700 dark:from-purple-500/20 dark:to-purple-500/10 dark:text-purple-300"
                            : member.role === "Manager"
                              ? "ring-blue-200 dark:ring-blue-500/30 bg-linear-to-br from-blue-100 to-blue-50 text-blue-700 dark:from-blue-500/20 dark:to-blue-500/10 dark:text-blue-300"
                              : "ring-zinc-200 dark:ring-zinc-700 bg-linear-to-br from-zinc-100 to-zinc-50 text-zinc-700 dark:from-zinc-800 dark:to-zinc-800/50 dark:text-zinc-300"
                            }`}>
                            {member.profilePic ? (
                              <img src={member.profilePic} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-base">{member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}</span>
                            )}
                            {member.role === "Admin" && (
                              <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-white ring-2 ring-white dark:ring-zinc-900">
                                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{member.name || "Unnamed user"}</p>
                              <Badge size="sm" variant={member.role === "Admin" ? "purple" : member.role === "Manager" ? "info" : "default"}>{member.role}</Badge>
                            </div>
                            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{member.email}</p>
                          </div>
                        </div>
                        {canManageTeam && member.role !== "Admin" && (
                          <div className="flex flex-wrap items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                            <select
                              value={member.role}
                              disabled={memberActionId === member.id}
                              onChange={(e) => updateMemberRole(member.id, e.target.value as "Manager" | "Member")}
                              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 cursor-pointer transition-all duration-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-size-[1rem] bg-position-[right_0.35rem_center] bg-no-repeat pr-6"
                            >
                              <option value="Member">Member</option>
                              <option value="Manager">Manager</option>
                            </select>
                            <button
                              disabled={memberActionId === member.id}
                              onClick={() => transferAdmin(member.id)}
                              title="Transfer admin role"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-all duration-200 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-purple-500/30 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                              </svg>
                              Make Admin
                            </button>
                            <button
                              disabled={memberActionId === member.id}
                              onClick={() => removeMember(member.id)}
                              title="Remove member"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                              </svg>
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Pending invites */}
                {teamInvites.length > 0 && (
                  <div className="space-y-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Pending Invites</h3>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">({teamInvites.length})</span>
                    </div>
                    {teamInvites.map((invite) => (
                      <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-3.5 transition-colors duration-300 hover:bg-zinc-50 dark:border-zinc-700/50 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                            <svg className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{invite.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge size="sm">{invite.role}</Badge>
                          <div className="flex items-center gap-1.5">
                            <svg className="h-3 w-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Expires {new Date(invite.expiresAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                required
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
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
