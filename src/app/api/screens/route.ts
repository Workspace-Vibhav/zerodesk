import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadScreensConfig } from "@/lib/screens";

// GET /api/screens - List all screens with status
export async function GET() {
  const screens = await prisma.screen.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(screens);
}

// POST /api/screens - Add single screen OR sync from config
export async function POST(request: Request) {
  // Check if body has screen data
  const contentType = request.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    // Add single screen
    const body = await request.json();
    const { key, name, path } = body;

    if (!key || !name) {
      return NextResponse.json(
        { error: "key and name are required" },
        { status: 400 }
      );
    }

    // Check if key already exists
    const existing = await prisma.screen.findUnique({
      where: { key },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Screen with this key already exists" },
        { status: 409 }
      );
    }

    const screen = await prisma.screen.create({
      data: {
        key,
        name,
        path: path || null,
        desktopStatus: "NOT_STARTED",
        mobileStatus: "NOT_STARTED",
      },
    });

    return NextResponse.json(screen, { status: 201 });
  }

  // Sync from config file
  const configScreens = loadScreensConfig();

  const results = {
    created: 0,
    updated: 0,
    removed: 0,
  };

  // Get existing screen keys
  const existingScreens = await prisma.screen.findMany({
    select: { key: true },
  });
  const existingKeys = new Set(existingScreens.map((s) => s.key));
  const configKeys = new Set(configScreens.map((s) => s.key));

  // Upsert screens from config
  for (const screen of configScreens) {
    const existing = existingKeys.has(screen.key);

    await prisma.screen.upsert({
      where: { key: screen.key },
      update: {
        name: screen.name,
        path: screen.path,
      },
      create: {
        key: screen.key,
        name: screen.name,
        path: screen.path,
        desktopStatus: "NOT_STARTED",
        mobileStatus: "NOT_STARTED",
      },
    });

    if (existing) {
      results.updated++;
    } else {
      results.created++;
    }
  }

  // Remove screens not in config
  for (const key of existingKeys) {
    if (!configKeys.has(key)) {
      await prisma.screen.delete({ where: { key } });
      results.removed++;
    }
  }

  return NextResponse.json({
    message: "Sync complete",
    ...results,
  });
}
