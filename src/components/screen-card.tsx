"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StatusSelect } from "./status-select";
import { Status } from "@/lib/constants";
import { useState, useEffect } from "react";
import { Trash2, ExternalLink, PenTool } from "lucide-react";

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

interface ScreenCardProps {
  screen: Screen;
  variation: Variation;
  onStatusChange: (key: string, status: Status) => Promise<void>;
  onApprovalChange: (key: string, field: string, value: boolean) => Promise<void>;
  onFigmaLinkChange: (key: string, figmaLink: string) => Promise<void>;
  onDelete: (key: string) => Promise<void>;
  onDevVerifiedChange: (key: string, verified: boolean) => Promise<void>;
}

const REVIEWERS = [
  { id: "vibhav", name: "Vibhav" },
  { id: "anushree", name: "Anushree" },
  { id: "felix", name: "Felix" },
];

export function ScreenCard({
  screen,
  variation,
  onStatusChange,
  onApprovalChange,
  onFigmaLinkChange,
  onDelete,
  onDevVerifiedChange
}: ScreenCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const currentFigmaLink = variation === "desktop" ? screen.desktopFigmaLink : screen.mobileFigmaLink;
  const [figmaInput, setFigmaInput] = useState(currentFigmaLink || "");

  // Reset figma input when variation changes
  useEffect(() => {
    setFigmaInput(currentFigmaLink || "");
  }, [variation, currentFigmaLink]);

  const currentStatus = variation === "desktop" ? screen.desktopStatus : screen.mobileStatus;
  const isInReview = currentStatus === "NEEDS_REVIEW";
  const isDone = currentStatus === "DONE";
  const isDevVerified = variation === "desktop" ? screen.desktopDevVerified : screen.mobileDevVerified;

  const getApproval = (reviewer: string) => {
    const field = `${variation}${reviewer.charAt(0).toUpperCase() + reviewer.slice(1)}` as keyof Screen;
    return screen[field] as boolean;
  };

  const handleStatusChange = async (newStatus: Status) => {
    setIsUpdating(true);
    try {
      await onStatusChange(screen.key, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprovalChange = async (reviewer: string, checked: boolean) => {
    const field = `${variation}${reviewer.charAt(0).toUpperCase() + reviewer.slice(1)}`;
    await onApprovalChange(screen.key, field, checked);
  };

  const handleFigmaSave = async () => {
    await onFigmaLinkChange(screen.key, figmaInput);
    setPopoverOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${screen.name}"?`)) return;
    setIsDeleting(true);
    try {
      await onDelete(screen.key);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDevVerifiedChange = async (checked: boolean) => {
    await onDevVerifiedChange(screen.key, checked);
  };

  const approvalCount = REVIEWERS.filter(r => getApproval(r.id)).length;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Name + Figma */}
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium leading-tight">{screen.name}</div>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 shrink-0 ${currentFigmaLink ? 'text-purple-600' : 'text-muted-foreground'}`}
                />
              }
            >
              <PenTool className="w-4 h-4" />
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-3">
                <div className="font-medium text-sm">Figma Link</div>
                <Input
                  placeholder="https://figma.com/file/..."
                  value={figmaInput}
                  onChange={(e) => setFigmaInput(e.target.value)}
                />
                <div className="flex justify-between">
                  {currentFigmaLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(currentFigmaLink!, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open
                    </Button>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPopoverOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleFigmaSave}>
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Path + Controls */}
        <div className="flex items-center justify-between gap-2">
          {screen.path ? (
            <code className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
              {screen.path}
            </code>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1 shrink-0">
            <StatusSelect
              value={currentStatus as Status}
              onChange={handleStatusChange}
              disabled={isUpdating}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Reviewer Approvals */}
        {isInReview && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">
              Approvals ({approvalCount}/3 - need 2)
            </div>
            <div className="flex items-center gap-4">
              {REVIEWERS.map((reviewer) => (
                <label key={reviewer.id} className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox
                    checked={getApproval(reviewer.id)}
                    onCheckedChange={(checked) => handleApprovalChange(reviewer.id, checked === true)}
                  />
                  <span className="text-sm">{reviewer.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Dev Verification */}
        {isDone && (
          <div className="pt-2 border-t">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={isDevVerified}
                onCheckedChange={(checked) => handleDevVerifiedChange(checked === true)}
              />
              <span className="text-sm text-muted-foreground">Dev Verified</span>
            </label>
          </div>
        )}
      </div>
    </Card>
  );
}
