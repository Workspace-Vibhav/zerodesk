import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ key: string }>;
}

// Helper to check if 2+ reviewers approved
function shouldAutoDone(approvals: { vibhav: boolean; anushree: boolean; felix: boolean }) {
  const count = [approvals.vibhav, approvals.anushree, approvals.felix].filter(Boolean).length;
  return count >= 2;
}

// PUT /api/screens/[key] - Update screen status or approvals
export async function PUT(request: Request, { params }: RouteParams) {
  const { key } = await params;
  const body = await request.json();

  const screen = await prisma.screen.findUnique({
    where: { key },
  });

  if (!screen) {
    return NextResponse.json({ error: "Screen not found" }, { status: 404 });
  }

  // Build update data
  const updateData: Record<string, unknown> = {};

  // Handle status changes
  if (body.desktopStatus) updateData.desktopStatus = body.desktopStatus;
  if (body.mobileStatus) updateData.mobileStatus = body.mobileStatus;

  // Handle desktop approvals
  if (body.desktopVibhav !== undefined) updateData.desktopVibhav = body.desktopVibhav;
  if (body.desktopAnushree !== undefined) updateData.desktopAnushree = body.desktopAnushree;
  if (body.desktopFelix !== undefined) updateData.desktopFelix = body.desktopFelix;

  // Handle mobile approvals
  if (body.mobileVibhav !== undefined) updateData.mobileVibhav = body.mobileVibhav;
  if (body.mobileAnushree !== undefined) updateData.mobileAnushree = body.mobileAnushree;
  if (body.mobileFelix !== undefined) updateData.mobileFelix = body.mobileFelix;

  // Dev verification
  if (body.desktopDevVerified !== undefined) updateData.desktopDevVerified = body.desktopDevVerified;
  if (body.mobileDevVerified !== undefined) updateData.mobileDevVerified = body.mobileDevVerified;

  // Figma links
  if (body.desktopFigmaLink !== undefined) updateData.desktopFigmaLink = body.desktopFigmaLink;
  if (body.mobileFigmaLink !== undefined) updateData.mobileFigmaLink = body.mobileFigmaLink;

  // Other fields
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.updatedBy) updateData.updatedBy = body.updatedBy;

  // Update the screen first
  let updated = await prisma.screen.update({
    where: { key },
    data: updateData,
  });

  // Check auto-transition to DONE for desktop
  if (updated.desktopStatus === "NEEDS_REVIEW") {
    const desktopApprovals = {
      vibhav: updated.desktopVibhav,
      anushree: updated.desktopAnushree,
      felix: updated.desktopFelix,
    };
    if (shouldAutoDone(desktopApprovals)) {
      updated = await prisma.screen.update({
        where: { key },
        data: { desktopStatus: "DONE" },
      });
    }
  }

  // Check auto-transition to DONE for mobile
  if (updated.mobileStatus === "NEEDS_REVIEW") {
    const mobileApprovals = {
      vibhav: updated.mobileVibhav,
      anushree: updated.mobileAnushree,
      felix: updated.mobileFelix,
    };
    if (shouldAutoDone(mobileApprovals)) {
      updated = await prisma.screen.update({
        where: { key },
        data: { mobileStatus: "DONE" },
      });
    }
  }

  return NextResponse.json(updated);
}

// GET /api/screens/[key] - Get single screen
export async function GET(request: Request, { params }: RouteParams) {
  const { key } = await params;

  const screen = await prisma.screen.findUnique({
    where: { key },
  });

  if (!screen) {
    return NextResponse.json({ error: "Screen not found" }, { status: 404 });
  }

  return NextResponse.json(screen);
}

// DELETE /api/screens/[key] - Delete a screen
export async function DELETE(request: Request, { params }: RouteParams) {
  const { key } = await params;

  const screen = await prisma.screen.findUnique({
    where: { key },
  });

  if (!screen) {
    return NextResponse.json({ error: "Screen not found" }, { status: 404 });
  }

  await prisma.screen.delete({
    where: { key },
  });

  return NextResponse.json({ message: "Screen deleted" });
}
