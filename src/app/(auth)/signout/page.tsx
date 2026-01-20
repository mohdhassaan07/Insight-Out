"use client";

import { signOut } from "next-auth/react";

export default function SignOutPage() {
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold">Sign Out</h1>
            <p>Are you sure you want to sign out?</p>
            <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="px-4 py-2 dark:bg-red-500 text-white border border-blue-500 rounded hover:bg-red-600 transition"
            >
                Confirm Sign Out
            </button>
        </div>
    );
}