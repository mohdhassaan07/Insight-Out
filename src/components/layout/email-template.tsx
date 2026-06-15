
interface EmailTemplateProps {
    otp: string;
}

export default function EmailTemplate({ otp }: EmailTemplateProps) {
    return (
        `<div>
            <h1>Insight-Out</h1>
            <p>Your OTP code is: <strong>${otp}</strong></p>
        </div>`
    );
}