import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
export default async function dashboard() {
    const session = await getServerSession();
    if (!session) redirect("/signin");
    
    return (
        <div>This is dashboard signed in as {session?.user?.email} </div>
    )
}