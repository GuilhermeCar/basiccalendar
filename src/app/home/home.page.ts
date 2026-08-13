import { Component, computed, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';

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
  readonly userName = signal('Lucas');
  readonly userPhoto = signal('assets/images/user-placeholder.jpg');

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
