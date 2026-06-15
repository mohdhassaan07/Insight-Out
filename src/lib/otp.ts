import { Redis } from "@upstash/redis";
import crypto from "crypto";

const redis = Redis.fromEnv();
//TTL = time to live
const OTP_TTL_SECONDS = 300;
const OTP_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 50;

const hashOtp = (otp: string) =>
    crypto.createHash("sha256").update(otp).digest("hex");

const otpKey = (email: string) => `otp:email:${email}`;
const attemptsKey = (email: string) => `otp:attempts:${email}`;
const cooldownKey = (email: string) => `otp:cooldown:${email}`;

export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtp(email: string) {
    const cooldown = await redis.get(cooldownKey(email));
    if (cooldown) {
        throw new Error("Please wait before requesting another OTP");
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await redis.set(otpKey(email), hashedOtp, { ex: OTP_TTL_SECONDS });
    await redis.set(attemptsKey(email), 0, { ex: OTP_TTL_SECONDS });
    await redis.set(cooldownKey(email), "1", { ex: OTP_COOLDOWN_SECONDS });

    return otp;
}

export async function getOtpCooldownRemaining(email: string) {
    const ttl = await redis.ttl(cooldownKey(email));
    return ttl > 0 ? ttl : 0;
}

export async function verifyOtp(email: string, otp: string) {
    const [storedHash, attempts] = await Promise.all([
        redis.get<string>(otpKey(email)),
        redis.get<number>(attemptsKey(email)),
    ]);

    if (!storedHash) {
        return { ok: false, message: "OTP expired or not found" };
    }

    if ((attempts ?? 0) >= MAX_ATTEMPTS) {
        await deleteOtp(email);
        return { ok: false, message: "Too many failed attempts" };
    }

    const isValid = storedHash === hashOtp(otp);

    if (!isValid) {
        await redis.incr(attemptsKey(email));
        return { ok: false, message: "Invalid OTP" };
    }

    await deleteOtp(email);
    return { ok: true, message: "OTP verified" };
}

export async function deleteOtp(email: string) {
    await Promise.all([
        redis.del(otpKey(email)),
        redis.del(attemptsKey(email)),
        redis.del(cooldownKey(email)),
    ]);
}
