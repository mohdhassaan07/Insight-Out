import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
export default async function dashboard() {
    const session = await getServerSession();
    if (!session) redirect("/login");
    return (
        <div>This is dashboard</div>
    )
}