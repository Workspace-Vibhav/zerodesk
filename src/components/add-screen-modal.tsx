"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface AddScreenModalProps {
  onAdd: (screen: { key: string; name: string; path: string }) => Promise<void>;
}

export function AddScreenModal({ onAdd }: AddScreenModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [path, setPath] = useState("");

  // Auto-generate key from name
  const key = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd({ key, name: name.trim(), path: path.trim() || "/" });
      setName("");
      setPath("");
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="flex items-center gap-2" />}>
        <Plus className="w-4 h-4" />
        Add Screen
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Screen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Screen Name</Label>
            <Input
              id="name"
              placeholder="e.g., User Dashboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {key && (
              <p className="text-xs text-muted-foreground">
                Key: <code className="bg-muted px-1 rounded">{key}</code>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">Route Path</Label>
            <Input
              id="path"
              placeholder="e.g., /dashboard"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Screen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
