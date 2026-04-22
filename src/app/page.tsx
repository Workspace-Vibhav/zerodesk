import { prisma } from "@/lib/prisma";
import { ScreenGrid } from "@/components/screen-grid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const screens = await prisma.screen.findMany({
    orderBy: { name: "asc" },
  });

  // Serialize dates for client component
  const serializedScreens = screens.map((screen) => ({
    ...screen,
    updatedAt: screen.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Zerodesk</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track design implementation status
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScreenGrid initialScreens={serializedScreens} />
      </main>
    </div>
  );
}
