"use client";

import axios, { AxiosError } from "axios";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

type MeResponse = {
    user: {
        role: "Admin" | "Manager" | "Member";
        sessionVersion: number;
    };
};

const CHECK_INTERVAL_MS = 30000;

export default function SessionGuard() {
    const { data: session, status } = useSession();
    const isSigningOut = useRef(false);

    useEffect(() => {
        if (status !== "authenticated" || !session?.user) return;

        const checkAccess = async () => {
            if (isSigningOut.current) return;

            try {
                const response = await axios.get<MeResponse>("/api/v1/me");
                const dbUser = response.data.user;
                const sessionVersion = session.user.sessionVersion || 0;

                if (
                    dbUser.role !== session.user.role ||
                    (sessionVersion > 0 && dbUser.sessionVersion > sessionVersion)
                ) {
                    isSigningOut.current = true;
                    await signOut({ callbackUrl: "/signin?reason=access-changed" });
                }
            } catch (error) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                    isSigningOut.current = true;
                    await signOut({ callbackUrl: "/signin?reason=session-expired" });
                }
            }
        };

        void checkAccess();
        const intervalId = window.setInterval(checkAccess, CHECK_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [session, status]);

    return null;
}
