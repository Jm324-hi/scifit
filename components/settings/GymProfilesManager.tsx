"use client";

import { useState } from "react";
import { Plus, Check, MapPin, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGymProfiles, AVAILABLE_EQUIPMENT, type GymProfile } from "@/lib/use-gym-profiles";

export function GymProfilesManager() {
  const {
    profiles,
    activeProfile,
    setActiveProfileId,
    addProfile,
    updateProfile,
    deleteProfile,
    isLoaded,
  } = useGymProfiles();

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<GymProfile>>({});

  if (!isLoaded) return null;

  const openCreate = () => {
    setEditingData({ name: "", equipment: [] });
    setIsEditing("new");
  };

  const openEdit = (profile: GymProfile) => {
    setEditingData(profile);
    setIsEditing(profile.id);
  };

  const toggleEquipment = (eqId: string) => {
    setEditingData((prev) => {
      const current = prev.equipment || [];
      if (current.includes(eqId)) {
        return { ...prev, equipment: current.filter((e) => e !== eqId) };
      }
      return { ...prev, equipment: [...current, eqId] };
    });
  };

  const handleSave = () => {
    if (!editingData.name) return;

    if (isEditing === "new") {
      addProfile({
        name: editingData.name,
        equipment: editingData.equipment || [],
      });
    } else if (isEditing) {
      updateProfile(isEditing, {
        name: editingData.name,
        equipment: editingData.equipment || [],
      });
    }
    setIsEditing(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-muted-foreground" />
            Gym Profiles
          </CardTitle>
          <CardDescription>Configure the equipment available in your training locations</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={openCreate}>
          <Plus className="size-4 mr-1" />
          New
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfile?.id;
          return (
            <div
              key={profile.id}
              className={`flex items-start justify-between rounded-lg border p-4 transition-colors ${
                isActive ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{profile.name}</span>
                  {isActive && <Badge variant="default" className="text-[10px] uppercase h-5">Active</Badge>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {profile.equipment.map((eq) => (
                    <Badge key={eq} variant="secondary" className="text-xs">
                      {AVAILABLE_EQUIPMENT.find((a) => a.id === eq)?.label || eq}
                    </Badge>
                  ))}
                  {profile.equipment.length === 0 && (
                    <span className="text-xs text-muted-foreground">No equipment</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0 ml-4">
                {!isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveProfileId(profile.id)}
                    className="h-8 text-xs"
                  >
                    Set Active
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(profile)}
                    className="h-8 w-8"
                  >
                    <Settings2 className="size-4" />
                  </Button>
                  {!profile.id.startsWith("default-") && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteProfile(profile.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <Dialog open={!!isEditing} onOpenChange={(v) => !v && setIsEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing === "new" ? "New Gym Profile" : "Edit Gym Profile"}</DialogTitle>
              <DialogDescription>
                Select what equipment is available to you in this location.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Name</label>
                <Input
                  value={editingData.name || ""}
                  onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                  placeholder="e.g., Planet Fitness, Hotel Gym..."
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Available Equipment</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {AVAILABLE_EQUIPMENT.map((eq) => {
                    const isSelected = editingData.equipment?.includes(eq.id);
                    return (
                      <button
                        key={eq.id}
                        onClick={() => toggleEquipment(eq.id)}
                        className={`flex items-center gap-2 rounded-md border p-3 text-sm transition-colors text-left ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className={`flex size-4 shrink-0 items-center justify-center rounded-sm border ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                          {isSelected && <Check className="size-3" />}
                        </div>
                        {eq.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!editingData.name}>
                Save Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
