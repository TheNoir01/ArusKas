import { Component } from '@angular/core';
import { UserPreferencesService } from './services/user-preferences.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private readonly preferences: UserPreferencesService) {
    this.preferences.applySettings();
  }
}
