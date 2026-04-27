import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserPreferencesService } from '../services/user-preferences.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage {
  fullName = '';

  constructor(
    private readonly preferences: UserPreferencesService,
    private readonly router: Router
  ) {
    this.fullName = this.preferences.getProfile().fullName;
  }

  saveProfile(): void {
    this.preferences.saveProfile({ fullName: this.fullName });
    this.router.navigateByUrl('/home');
  }
}
