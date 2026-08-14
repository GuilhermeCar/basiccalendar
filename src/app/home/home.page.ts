import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';

import { SupabaseService } from '../core/services/supabase.service';
import { AppointmentService } from '../core/services/appointment.service';
import { WhatsAppService } from '../core/services/whatsapp.service';

interface TodayPatient {
  id: string;
  name: string;
  phone: string | null;
  time: string;
  procedure: string;
  initials: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonicModule,
    MatIconModule
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePage {
  private readonly supabaseService =
    inject(SupabaseService);

  private readonly appointmentService =
    inject(AppointmentService);

  private readonly whatsAppService =
    inject(WhatsAppService);

  readonly userName = signal('');
  readonly userAvatar = signal<string | null>(null);
  readonly userEmail = signal('');

  readonly todayLabel =
    new Intl.DateTimeFormat(
      'pt-BR',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }
    ).format(new Date());

  readonly patients =
    signal<TodayPatient[]>([]);

  readonly loadingAppointments =
    signal(false);

  readonly totalPatients =
    computed(() => this.patients().length);

  async ionViewWillEnter(): Promise<void> {
    await Promise.all([
      this.loadUser(),
      this.loadAppointments()
    ]);
  }

  private async loadUser(): Promise<void> {
    const { data } =
      await this.supabaseService.getUser();

    const user = data.user;

    if (!user) {
      return;
    }

    this.userName.set(
      user.user_metadata?.['full_name'] ??
      user.user_metadata?.['name'] ??
      user.email ??
      ''
    );

    this.userAvatar.set(
      user.user_metadata?.['avatar_url'] ??
      user.user_metadata?.['picture'] ??
      null
    );

    this.userEmail.set(
      user.email ?? ''
    );
  }

  private async loadAppointments(): Promise<void> {
    this.loadingAppointments.set(true);

    try {
      const appointments =
        await this.appointmentService
          .getTodayAppointments();

      this.patients.set(
        appointments.map(
          (appointment) => ({
            id:
              appointment.id,

            name:
              appointment.patient_name,

            phone:
              appointment.patient_phone,

            time:
              this.formatTime(
                appointment.start_at
              ),

            procedure:
              appointment.description ||
              'Agendamento',

            initials:
              this.getInitials(
                appointment.patient_name
              )
          })
        )
      );
    } catch (error) {
      console.error(
        'Erro ao carregar agendamentos:',
        error
      );

      this.patients.set([]);
    } finally {
      this.loadingAppointments.set(false);
    }
  }

  private formatTime(
    date: string
  ): string {
    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(new Date(date));
  }

  private getInitials(
    name: string
  ): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join('');
  }

  async logout(): Promise<void> {
    await this.supabaseService.signOut();
  }

  openWhatsApp(
    patient: TodayPatient
  ): void {
    if (!patient.phone) {
      return;
    }

    this.whatsAppService.open(
      patient.phone
    );
  }
}
