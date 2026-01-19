"use client"
import { useState } from "react"
import {signIn} from "next-auth/react";
export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await signIn("credentials", {
            email,
            password,
            redirect: true,
            callbackUrl: "/dashboard"
        });

        if (res?.error) {
            setError("Invalid email or password");
            return;
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <h1>Login</h1>

            <input
                type="email"
                placeholder="Email"
                onChange={e => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
                required
            />

            {error && <p>{error}</p>}

            <button type="submit">Login</button>
        </form>
    )
}