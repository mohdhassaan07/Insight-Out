import Image from "next/image";
import { getServerSession } from "next-auth";
export default async function Home() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex text-2xl font-mono min-h-screen min-w-40 flex-col items-center justify-center bg-white dark:bg-black sm:items-start">
        Insight-Out – Your Feedbacks, Clearly Categorized
      </main>
    </div>
  );
}
