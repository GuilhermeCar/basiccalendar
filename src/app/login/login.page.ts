import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../core/services/supabase.service';
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
  styleUrl: './login.page.scss'
})
export class LoginPage {
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);

  protected email = signal('');
  protected password = signal('');
  protected hidePassword = signal(true);

  protected loading = signal(false);
  protected errorMessage = signal('');

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  async login(): Promise<void> {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Informe seu e-mail e senha.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { data, error } =
        await this.supabaseService.signIn(
          this.email(),
          this.password()
        );

      if (error) {
        this.errorMessage.set(
          'E-mail ou senha inválidos.'
        );

        return;
      }

      console.log('Usuário:', data.user);
      console.log('Sessão:', data.session);

      await this.router.navigateByUrl('/axis/home', {
        replaceUrl: true
      });
    } catch {
      this.errorMessage.set(
        'Não foi possível realizar o login.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { error } =
        await this.supabaseService.signInWithGoogle();

      if (error) {
        this.errorMessage.set(
          'Não foi possível entrar com o Google.'
        );
      }
    } catch {
      this.errorMessage.set(
        'Não foi possível entrar com o Google.'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
