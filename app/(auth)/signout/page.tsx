import { getServerSession } from "next-auth"
import { signOut } from "next-auth/react";
export default async function signOutPage() {
    const session = await getServerSession()
    if (session) {
        console.log("User is signed in:", session.user?.email);
    }
    return(
        <div>
            this is sign out page
            
        </div>
    )
}