import { PlatformNav } from "@/components/common/PlatformNav";
import { InstagramDashboard } from "@/components/instagram/InstagramDashboard";

export default function InstagramPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-[1600px] min-w-0 gap-6 overflow-x-clip px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
      <PlatformNav />
      <InstagramDashboard />
    </main>
  );
}
