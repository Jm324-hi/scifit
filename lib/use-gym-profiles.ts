import { useState, useEffect } from "react";

export const AVAILABLE_EQUIPMENT = [
  { id: "barbell", label: "Barbell" },
  { id: "dumbbell", label: "Dumbbell" },
  { id: "machine", label: "Machine" },
  { id: "cable", label: "Cable" },
  { id: "bodyweight", label: "Bodyweight" },
  { id: "band", label: "Resistance Band" },
];

export interface GymProfile {
  id: string;
  name: string;
  equipment: string[];
}

export const DEFAULT_PROFILES: GymProfile[] = [
  {
    id: "default-gym",
    name: "Commercial Gym",
    equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight", "band"],
  },
  {
    id: "default-home",
    name: "Home Setup",
    equipment: ["dumbbell", "bodyweight", "band"],
  },
  {
    id: "default-hotel",
    name: "Hotel Gym",
    equipment: ["dumbbell", "machine", "cable", "bodyweight"],
  },
];

export function useGymProfiles() {
  const [profiles, setProfiles] = useState<GymProfile[]>(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>("default-gym");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem("kineroz_gym_profiles");
      const storedActive = localStorage.getItem("kineroz_active_profile");

      if (storedProfiles) {
        setProfiles(JSON.parse(storedProfiles));
      }
      if (storedActive) {
        setActiveProfileId(storedActive);
      }
    } catch (e) {
      console.error("Failed to load gym profiles", e);
    }
    setIsLoaded(true);
  }, []);

  const saveProfiles = (newProfiles: GymProfile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem("kineroz_gym_profiles", JSON.stringify(newProfiles));
  };

  const saveActiveProfile = (id: string) => {
    setActiveProfileId(id);
    localStorage.setItem("kineroz_active_profile", id);
  };

  const addProfile = (profile: Omit<GymProfile, "id">) => {
    const newProfile = { ...profile, id: `profile_${Date.now()}` };
    saveProfiles([...profiles, newProfile]);
    return newProfile.id;
  };

  const updateProfile = (id: string, updates: Partial<Omit<GymProfile, "id">>) => {
    saveProfiles(
      profiles.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProfile = (id: string) => {
    saveProfiles(profiles.filter((p) => p.id !== id));
    if (activeProfileId === id) {
      saveActiveProfile(DEFAULT_PROFILES[0].id);
    }
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  return {
    profiles,
    activeProfileId,
    activeProfile,
    isLoaded,
    setActiveProfileId: saveActiveProfile,
    addProfile,
    updateProfile,
    deleteProfile,
  };
}
