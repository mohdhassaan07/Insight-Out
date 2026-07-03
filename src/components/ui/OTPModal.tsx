import { AxiosError } from "axios";
import Button from "./Button";
import Input from "./Input";
import { useEffect, useState } from "react";
import { useToast } from "../providers/ToastProvider";
import axios from "axios";

const OTP_RESEND_SECONDS = 60;

export default function OTPModal({ isModalOpen, setIsModalOpen }: { isModalOpen: boolean, setIsModalOpen: (open: boolean) => void }) {
    const { showToast } = useToast();
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpResendTimer, setOtpResendTimer] = useState(0);

    useEffect(() => {
        if (isModalOpen) {
            setOtp("");
            setOtpResendTimer(0);
            sendOtp();
        }
    }, [isModalOpen]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setOtp("");
    };

    const handleVerify = async () => {
        if (!otp) {
            showToast("Please enter the OTP", "error");
            return;
        }
        try {
            setIsLoading(true);
            const res = await axios.post("/api/v1/verifyOtp", { otp });
            if (res.status === 200) {
                showToast("OTP verified successfully", "success");
            }
        } catch (error) {
            const axiosError = error as AxiosError<{ error?: string }>;
            showToast(axiosError.response?.data?.error || "Failed to verify OTP", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const sendOtp = async () => {
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

    return (
        isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Forgot Password</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
                        Enter the otp send to your email to reset your password.
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
                            onClick={sendOtp}
                        >
                            Resend OTP
                        </Button>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="danger" isLoading={isLoading} onClick={handleVerify}>Verify</Button>
                    </div>
                </div>
            </div>
        )
    )
}