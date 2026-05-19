import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, ViewWillEnter, ViewDidEnter, ViewWillLeave, ViewDidLeave } from '@ionic/angular';
import { FinanceService } from '../services/finance';
import { AppSettingsData, AppThemeMode, UserPreferencesService } from '../services/user-preferences.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage implements ViewWillEnter, ViewDidEnter, ViewWillLeave, ViewDidLeave {
  themeMode: AppThemeMode = 'system';
  fontScale = 1;

  constructor(
    private readonly preferences: UserPreferencesService,
    private readonly financeService: FinanceService,
    private readonly alertController: AlertController,
    private readonly toastController: ToastController,
    private readonly router: Router
  ) { }

  ionViewWillEnter(): void {
    console.log('SettingsPage: ionViewWillEnter');
    // Refresh settings data
    const settings = this.preferences.getSettings();
    this.themeMode = settings.themeMode;
    this.fontScale = settings.fontScale;
  }

  ionViewDidEnter(): void {
    console.log('SettingsPage: ionViewDidEnter');
  }

  ionViewWillLeave(): void {
    console.log('SettingsPage: ionViewWillLeave');
  }

  ionViewDidLeave(): void {
    console.log('SettingsPage: ionViewDidLeave');
  }

  saveSettings(): void {
    const payload: AppSettingsData = {
      themeMode: this.themeMode,
      fontScale: this.fontScale
    };

    this.preferences.saveSettings(payload);
    this.router.navigateByUrl('/home');
  }

  async confirmResetAppData(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Reset Aplikasi',
      message: 'Semua data aplikasi akan dihapus permanen. Lanjutkan reset?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Reset',
          role: 'destructive',
          handler: () => {
            void this.resetAppData();
          }
        }
      ]
    });

    await alert.present();
  }

  private async resetAppData(): Promise<void> {
    this.financeService.resetAllData();
    this.preferences.resetPreferences();

    const toast = await this.toastController.create({
      message: 'Data aplikasi berhasil direset.',
      duration: 1800,
      position: 'bottom',
      color: 'success'
    });

    await this.router.navigateByUrl('/home', { replaceUrl: true });
    await toast.present();
  }
}
