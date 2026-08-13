import { Component, computed, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { SupabaseService } from '../core/services/supabase.service';

interface TodayPatient {
  id: number;
  name: string;
  time: string;
  procedure: string;
  status: 'confirmed' | 'waiting' | 'completed';
  initials: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonicModule,
    MatIconModule,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly supabaseService = inject(SupabaseService);

  readonly userName = signal('');
  readonly userAvatar = signal<string | null>(null);
  readonly userEmail = signal('');

  async ionViewWillEnter(): Promise<void> {
    const { data } = await this.supabaseService.getUser();

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

    this.userEmail.set(user.email ?? '');
  }

  readonly patients = signal<TodayPatient[]>([
    {
      id: 1,
      name: 'Mariana Oliveira',
      time: '08:30',
      procedure: 'Consulta',
      status: 'confirmed',
      initials: 'MO',
    },
    {
      id: 2,
      name: 'João Ferreira',
      time: '10:00',
      procedure: 'Retorno',
      status: 'waiting',
      initials: 'JF',
    },
    {
      id: 3,
      name: 'Ana Paula Silva',
      time: '13:30',
      procedure: 'Avaliação',
      status: 'confirmed',
      initials: 'AS',
    },
    {
      id: 4,
      name: 'Carlos Mendes',
      time: '15:00',
      procedure: 'Consulta',
      status: 'completed',
      initials: 'CM',
    },
  ]);

  readonly totalPatients = computed(() => this.patients().length);

  getStatusLabel(status: TodayPatient['status']): string {
    const labels = {
      confirmed: 'Confirmado',
      waiting: 'Aguardando',
      completed: 'Concluído',
    };

    return labels[status];
  }
}
