import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppSettingsData, AppThemeMode, UserPreferencesService } from '../services/user-preferences.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage {
  themeMode: AppThemeMode = 'system';
  fontScale = 1;

  constructor(
    private readonly preferences: UserPreferencesService,
    private readonly router: Router
  ) {
    const settings = this.preferences.getSettings();
    this.themeMode = settings.themeMode;
    this.fontScale = settings.fontScale;
  }

  saveSettings(): void {
    const payload: AppSettingsData = {
      themeMode: this.themeMode,
      fontScale: this.fontScale
    };

    this.preferences.saveSettings(payload);
    this.router.navigateByUrl('/home');
  }
}
