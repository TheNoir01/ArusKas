import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter, ViewDidEnter, ViewWillLeave, ViewDidLeave } from '@ionic/angular';
import { UserPreferencesService } from '../services/user-preferences.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements ViewWillEnter, ViewDidEnter, ViewWillLeave, ViewDidLeave {
  fullName = '';

  constructor(
    private readonly preferences: UserPreferencesService,
    private readonly router: Router
  ) { }

  ionViewWillEnter(): void {
    console.log('ProfilePage: ionViewWillEnter');
    // Load/refresh profile data
    this.fullName = this.preferences.getProfile().fullName;
  }

  ionViewDidEnter(): void {
    console.log('ProfilePage: ionViewDidEnter');
  }

  ionViewWillLeave(): void {
    console.log('ProfilePage: ionViewWillLeave');
  }

  ionViewDidLeave(): void {
    console.log('ProfilePage: ionViewDidLeave');
  }

  saveProfile(): void {
    this.preferences.saveProfile({ fullName: this.fullName });
    this.router.navigateByUrl('/home');
  }
}
