import { Injectable } from '@angular/core';

export type AppThemeMode = 'system' | 'light' | 'dark';

export interface UserProfileData {
  fullName: string;
}

export interface AppSettingsData {
  themeMode: AppThemeMode;
  fontScale: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private readonly profileKey = 'finapp_profile';
  private readonly settingsKey = 'finapp_settings';

  private profile: UserProfileData = {
    fullName: ''
  };

  private settings: AppSettingsData = {
    themeMode: 'system',
    fontScale: 1
  };

  constructor() {
    this.load();
  }

  getProfile(): UserProfileData {
    return { ...this.profile };
  }

  saveProfile(data: UserProfileData): void {
    this.profile = {
      fullName: (data.fullName || '').trim()
    };
    localStorage.setItem(this.profileKey, JSON.stringify(this.profile));
  }

  getSettings(): AppSettingsData {
    return { ...this.settings };
  }

  saveSettings(data: AppSettingsData): void {
    this.settings = {
      themeMode: data.themeMode,
      fontScale: this.normalizeFontScale(data.fontScale)
    };
    localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    this.applySettings();
  }

  resetPreferences(): void {
    this.profile = {
      fullName: ''
    };

    this.settings = {
      themeMode: 'system',
      fontScale: 1
    };

    localStorage.removeItem(this.profileKey);
    localStorage.removeItem(this.settingsKey);
    this.applySettings();
  }

  applySettings(): void {
    this.applyThemeMode(this.settings.themeMode);
    this.applyFontScale(this.settings.fontScale);
  }

  private load(): void {
    const profileRaw = localStorage.getItem(this.profileKey);
    if (profileRaw) {
      try {
        const parsed = JSON.parse(profileRaw) as UserProfileData;
        this.profile = {
          fullName: (parsed.fullName || '').trim()
        };
      } catch {
        this.profile = { fullName: '' };
      }
    }

    const settingsRaw = localStorage.getItem(this.settingsKey);
    if (settingsRaw) {
      try {
        const parsed = JSON.parse(settingsRaw) as AppSettingsData;
        this.settings = {
          themeMode: this.normalizeThemeMode(parsed.themeMode),
          fontScale: this.normalizeFontScale(parsed.fontScale)
        };
      } catch {
        this.settings = { themeMode: 'system', fontScale: 1 };
      }
    }

    this.applySettings();
  }

  private applyThemeMode(mode: AppThemeMode): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = mode === 'dark' || (mode === 'system' && prefersDark);
    document.body.classList.toggle('ion-palette-dark', isDark);
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
  }

  private applyFontScale(scale: number): void {
    const normalized = this.normalizeFontScale(scale);
    document.documentElement.style.setProperty('--app-font-scale', `${normalized}`);
    document.documentElement.style.fontSize = `${16 * normalized}px`;
  }

  private normalizeThemeMode(mode: AppThemeMode): AppThemeMode {
    if (mode === 'light' || mode === 'dark' || mode === 'system') {
      return mode;
    }
    return 'system';
  }

  private normalizeFontScale(scale: number): number {
    if (!Number.isFinite(scale)) {
      return 1;
    }
    return Math.min(1.3, Math.max(0.9, Number(scale)));
  }
}
