import { Component, computed, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    IonicModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  readonly email = signal('');
  readonly password = signal('');
  readonly hidePassword = signal(true);
  readonly isLoading = signal(false);

  readonly isFormValid = computed(() => {
    return (
      this.email().trim().length > 0 &&
      this.password().trim().length >= 6
    );
  });

  updateEmail(value: string): void {
    this.email.set(value);
  }

  updatePassword(value: string): void {
    this.password.set(value);
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  login(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading.set(true);

    const credentials = {
      email: this.email(),
      password: this.password(),
    };

    console.log(credentials);

    // Futuramente:
    // this.authService.login(credentials)
  }
}
