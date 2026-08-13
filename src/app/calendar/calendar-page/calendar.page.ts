import { Component, signal, viewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DatesSetArg } from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

import ptBrLocale from '@fullcalendar/core/locales/pt-br';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    IonicModule,
    FullCalendarModule
  ],
  templateUrl: './calendar.page.html',
  styleUrl: './calendar.page.scss'
})
export class CalendarPage {
  private readonly calendar = viewChild<FullCalendarComponent>('calendar');

  readonly calendarTitle = signal('');
  readonly currentView = signal('timeGridWeek');

  readonly calendarOptions = signal<CalendarOptions>({
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin
    ],

    locale: ptBrLocale,
    initialView: 'timeGridWeek',


    headerToolbar: false,

    firstDay: 1,
    allDaySlot: false,

    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',

    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',

    height: 'auto',

    nowIndicator: true,
    selectable: true,
    editable: true,

    datesSet: (info) => this.onDatesSet(info),

    events: [
      {
        id: '1',
        title: 'Maria Silva',
        start: '2026-08-13T09:00:00',
        end: '2026-08-13T10:00:00'
      }
    ]
  });

  onPrevious(): void {
    this.calendar()?.getApi().prev();
  }

  onNext(): void {
    this.calendar()?.getApi().next();
  }

  onViewChange(view: string | number | null | undefined): void {
    if (!view || typeof view !== 'string') {
      return;
    }

    this.currentView.set(view);

    this.calendar()
      ?.getApi()
      .changeView(view);
  }

  private onDatesSet(info: DatesSetArg): void {
    const date = info.view.currentStart;

    this.calendarTitle.set(
      new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric'
      }).format(date)
    );
  }
}
