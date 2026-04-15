import { PlatformNav } from "@/components/common/PlatformNav";
import { FacebookDashboard } from "@/components/facebook/FacebookDashboard";

export default function FacebookPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-[1600px] min-w-0 gap-6 overflow-x-clip px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
      <PlatformNav />
      <FacebookDashboard />
      {/*
            A base estrutural já está pronta. A camada Facebook será adicionada sem refatorar o módulo do Instagram.
      */}
    </main>
  );
}
