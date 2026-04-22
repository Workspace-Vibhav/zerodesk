"use client";

import { useState } from "react";
import { ScreenCard } from "./screen-card";
import { StatsBar } from "./stats-bar";
import { AddScreenModal } from "./add-screen-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_OPTIONS, Status } from "@/lib/constants";
import { Monitor, Smartphone, Search } from "lucide-react";

type Variation = "desktop" | "mobile";

interface Screen {
  id: string;
  key: string;
  name: string;
  path?: string | null;
  desktopFigmaLink?: string | null;
  mobileFigmaLink?: string | null;
  desktopStatus: string;
  mobileStatus: string;
  desktopVibhav: boolean;
  desktopAnushree: boolean;
  desktopFelix: boolean;
  mobileVibhav: boolean;
  mobileAnushree: boolean;
  mobileFelix: boolean;
  desktopDevVerified: boolean;
  mobileDevVerified: boolean;
  updatedAt: string;
  notes?: string | null;
}

interface ScreenGridProps {
  initialScreens: Screen[];
}

export function ScreenGrid({ initialScreens }: ScreenGridProps) {
  const [screens, setScreens] = useState<Screen[]>(initialScreens);
  const [filter, setFilter] = useState<string>("ALL");
  const [variation, setVariation] = useState<Variation>("desktop");
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState("");

  const getStatus = (screen: Screen) => {
    return variation === "desktop" ? screen.desktopStatus : screen.mobileStatus;
  };

  const getCategory = (path?: string | null): string => {
    if (!path) return "Uncategorized";
    const segments = path.split("/").filter(Boolean);
    return segments[0] ? segments[0].charAt(0).toUpperCase() + segments[0].slice(1) : "Uncategorized";
  };

  const handleStatusChange = async (key: string, status: Status) => {
    const field = variation === "desktop" ? "desktopStatus" : "mobileStatus";

    // Optimistic update
    setScreens((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: status } : s))
    );

    const response = await fetch(`/api/screens/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: status }),
    });

    if (response.ok) {
      const updated = await response.json();
      setScreens((prev) =>
        prev.map((s) => (s.key === key ? updated : s))
      );
    }
  };

  const handleApprovalChange = async (key: string, field: string, value: boolean) => {
    // Optimistic update
    setScreens((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    );

    const response = await fetch(`/api/screens/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });

    if (response.ok) {
      // Get the full updated screen (may have auto-transitioned to DONE)
      const updated = await response.json();
      setScreens((prev) =>
        prev.map((s) => (s.key === key ? updated : s))
      );
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const syncResponse = await fetch("/api/screens", { method: "POST" });
      if (syncResponse.ok) {
        const listResponse = await fetch("/api/screens");
        if (listResponse.ok) {
          const data = await listResponse.json();
          setScreens(data);
        }
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (key: string) => {
    const response = await fetch(`/api/screens/${key}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setScreens((prev) => prev.filter((s) => s.key !== key));
    }
  };

  const handleAdd = async (newScreen: { key: string; name: string; path: string }) => {
    const response = await fetch("/api/screens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newScreen),
    });

    if (response.ok) {
      const created = await response.json();
      setScreens((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const handleFigmaLinkChange = async (key: string, figmaLink: string) => {
    const field = variation === "desktop" ? "desktopFigmaLink" : "mobileFigmaLink";

    // Optimistic update
    setScreens((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: figmaLink } : s))
    );

    await fetch(`/api/screens/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: figmaLink }),
    });
  };

  const handleDevVerifiedChange = async (key: string, verified: boolean) => {
    const field = variation === "desktop" ? "desktopDevVerified" : "mobileDevVerified";

    // Optimistic update
    setScreens((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: verified } : s))
    );

    await fetch(`/api/screens/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: verified }),
    });
  };

  const getDevVerified = (screen: Screen) => {
    return variation === "desktop" ? screen.desktopDevVerified : screen.mobileDevVerified;
  };

  const filteredScreens = screens.filter((s) => {
    const status = getStatus(s);
    let matchesFilter = false;

    if (filter === "ALL") {
      matchesFilter = true;
    } else if (filter === "DONE_UNVERIFIED") {
      matchesFilter = status === "DONE" && !getDevVerified(s);
    } else {
      matchesFilter = status === filter;
    }

    const matchesSearch = search === "" || s.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedScreens = filteredScreens.reduce((acc, screen) => {
    const category = getCategory(screen.path);
    if (!acc[category]) acc[category] = [];
    acc[category].push(screen);
    return acc;
  }, {} as Record<string, Screen[]>);

  return (
    <div className="space-y-6">
      {/* Global Variation Toggle */}
      <div className="flex items-center justify-center gap-2 p-2 bg-white rounded-lg border">
        <Button
          variant={variation === "desktop" ? "default" : "outline"}
          onClick={() => setVariation("desktop")}
          className="flex items-center gap-2"
        >
          <Monitor className="w-4 h-4" />
          Desktop
        </Button>
        <Button
          variant={variation === "mobile" ? "default" : "outline"}
          onClick={() => setVariation("mobile")}
          className="flex items-center gap-2"
        >
          <Smartphone className="w-4 h-4" />
          Mobile
        </Button>
      </div>

      <StatsBar screens={screens} variation={variation} />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search screens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("ALL")}
        >
          All ({screens.length})
        </Button>
        {STATUS_OPTIONS.map((option) => {
          const count = screens.filter((s) => getStatus(s) === option.value).length;
          return (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
            >
              {option.label} ({count})
            </Button>
          );
        })}

        {/* Dev Unverified filter */}
        {(() => {
          const unverifiedCount = screens.filter(
            (s) => getStatus(s) === "DONE" && !getDevVerified(s)
          ).length;
          return unverifiedCount > 0 ? (
            <Button
              variant={filter === "DONE_UNVERIFIED" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("DONE_UNVERIFIED")}
              className="text-orange-600 border-orange-300"
            >
              Dev Pending ({unverifiedCount})
            </Button>
          ) : null;
        })()}

        <div className="flex-1" />

        <Button onClick={handleSync} disabled={isSyncing} variant="outline">
          {isSyncing ? "Syncing..." : "Sync from Config"}
        </Button>

        <AddScreenModal onAdd={handleAdd} />
      </div>

      {filteredScreens.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No screens found.</p>
          <Button onClick={handleSync} className="mt-4" disabled={isSyncing}>
            {isSyncing ? "Syncing..." : "Sync Screens from Config"}
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedScreens)
            .sort(([a], [b]) => a === "Uncategorized" ? 1 : b === "Uncategorized" ? -1 : a.localeCompare(b))
            .map(([category, categoryScreens]) => (
              <div key={category}>
                <h3 className="font-semibold text-lg mb-3 text-muted-foreground">
                  {category} <span className="text-sm font-normal">({categoryScreens.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryScreens.map((screen) => (
                    <ScreenCard
                      key={screen.id}
                      screen={screen}
                      variation={variation}
                      onStatusChange={handleStatusChange}
                      onApprovalChange={handleApprovalChange}
                      onFigmaLinkChange={handleFigmaLinkChange}
                      onDelete={handleDelete}
                      onDevVerifiedChange={handleDevVerifiedChange}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
