import { Component } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { UserPreferencesService } from './services/user-preferences.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private readonly platform: Platform,
    private readonly alertController: AlertController,
    private readonly preferences: UserPreferencesService
  ) {
    this.preferences.applySettings();
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, async () => {
        // Jika berada di root (halaman home), maka tampilkan alert konfirmasi
        if (window.location.pathname === '/home' || window.location.pathname === '/') {
          await this.presentExitAlert();
        }
      });
    });
  }

  async presentExitAlert() {
    const alert = await this.alertController.create({
      header: 'Keluar Aplikasi',
      message: 'Apakah Anda yakin ingin menutup aplikasi ini?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Keluar',
          handler: () => {
            App.exitApp();
          }
        }
      ]
    });

    await alert.present();
  }
}
