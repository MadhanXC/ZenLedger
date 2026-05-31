'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { hexToHslValues } from '@/lib/utils';

const THEMES = {
  default: {
    background: '210 17% 98%',
    primary: '210 10% 23%',
    accent: '162 73% 46%',
  },
  blue: {
    background: '220 33% 98%',
    primary: '222 47% 11%',
    accent: '221 83% 53%',
  },
  purple: {
    background: '270 33% 98%',
    primary: '270 47% 11%',
    accent: '271 91% 65%',
  },
  orange: {
    background: '30 33% 98%',
    primary: '30 47% 11%',
    accent: '24 95% 53%',
  },
  emerald: {
    background: '160 33% 98%',
    primary: '161 94% 15%',
    accent: '160 84% 39%',
  },
  rose: {
    background: '350 33% 98%',
    primary: '350 47% 11%',
    accent: '350 89% 60%',
  },
  amber: {
    background: '45 33% 98%',
    primary: '45 47% 11%',
    accent: '45 93% 47%',
  },
  midnight: {
    background: '222 33% 98%',
    primary: '222 47% 4%',
    accent: '222 47% 15%',
  },
  indigo: {
    background: '225 33% 98%',
    primary: '226 100% 8%',
    accent: '239 84% 67%',
  },
  teal: {
    background: '170 33% 98%',
    primary: '171 77% 12%',
    accent: '174 100% 29%',
  },
  slate: {
    background: '210 17% 98%',
    primary: '215 25% 27%',
    accent: '215 16% 47%',
  },
  forest: {
    background: '140 33% 98%',
    primary: '144 61% 10%',
    accent: '142 71% 45%',
  },
  crimson: {
    background: '0 33% 98%',
    primary: '348 83% 20%',
    accent: '348 83% 47%',
  },
};

export function ThemeManager() {
  const { user } = useUser();
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid, "settings", "app");
  }, [db, user]);

  const { data: settings } = useDoc(settingsRef);

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    const themeKey = settings.theme || 'default';
    
    let colors = THEMES[themeKey as keyof typeof THEMES] || THEMES.default;

    if (themeKey === 'custom' && settings.customColors) {
      colors = {
        background: hexToHslValues(settings.customColors.background || '#f8fafc'),
        primary: hexToHslValues(settings.customColors.primary || '#0f172a'),
        accent: hexToHslValues(settings.customColors.accent || '#10b981'),
      };
    }

    // Apply colors to root variables
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--ring', colors.accent);
    root.style.setProperty('--sidebar-primary', colors.accent);
    root.style.setProperty('--sidebar-background', colors.primary);
    root.style.setProperty('--sidebar-foreground', colors.background);

  }, [settings]);

  return null;
}
