import { Component, inject, signal, viewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DatesSetArg } from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { GoogleCalendarService } from '../../core/services/google-calendar.service';
import { ModalController } from '@ionic/angular';
import { AppointmentModalComponent } from '../appointment-modal/appointment-modal.component';

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

  private readonly googleCalendarService = inject(GoogleCalendarService);
  private readonly modalController = inject(ModalController);

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
    dateClick: (info) => {
      void this.openAppointmentModal(info.date);
    },

    eventClick: (info) => {
      const source = info.event.extendedProps['source'];

      if (source !== 'axis') {
        return;
      }

      void this.openEditAppointmentModal(
        info.event.id
      );
    },
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

  private async onDatesSet(info: DatesSetArg): Promise<void> {
    this.updateCalendarTitle(info);

    await this.loadGoogleEvents(
      info.start,
      info.end
    );
  }

  private updateCalendarTitle(info: DatesSetArg): void {
    const date = info.view.currentStart;

    this.calendarTitle.set(
      new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric'
      }).format(date)
    );
  }

  private async loadGoogleEvents(
    start: Date,
    end: Date
  ): Promise<void> {
    try {
      const calendars =
        await this.googleCalendarService.getCalendars();

      const googleEvents = [];

      for (const calendar of calendars) {
        const events =
          await this.googleCalendarService.getEvents(
            calendar.id,
            start,
            end
          );

        googleEvents.push(
          ...events.map((event) => ({
            id: `google-${calendar.id}-${event.id}`,

            title: event.summary ?? 'Sem título',

            start:
              event.start.dateTime ??
              event.start.date,

            end:
              event.end.dateTime ??
              event.end.date,

            extendedProps: {
              source: 'google',
              googleCalendarId: calendar.id,
              googleEventId: event.id
            }
          }))
        );
      }

      this.calendar()
        ?.getApi()
        .removeAllEvents();

      this.calendar()
        ?.getApi()
        .addEventSource(googleEvents);

    } catch (error) {
      console.error(
        'Erro ao carregar Google Calendar:',
        error
      );
    }
  }

  private async openAppointmentModal(
    date: Date
  ): Promise<void> {
    const modal =
      await this.modalController.create({
        component: AppointmentModalComponent,

        componentProps: {
          startDate: date
        },

        breakpoints: [
          0,
          0.75,
          1
        ],

        initialBreakpoint: 0.75
      });

    await modal.present();

    const { data, role } =
      await modal.onWillDismiss();

    if (
      role === 'created' &&
      data
    ) {
      this.addAppointmentToCalendar(data);
    }
  }

  private addAppointmentToCalendar(
    appointment: any
  ): void {
    this.calendar()
      ?.getApi()
      .addEvent({
        id: appointment.id,

        title: appointment.patient_name,

        start: appointment.start_at,
        end: appointment.end_at,

        extendedProps: {
          source: 'axis',
          patientEmail:
            appointment.patient_email,

          patientPhone:
            appointment.patient_phone,

          description:
            appointment.description,

          googleEventId:
            appointment.google_event_id,

          googleSyncStatus:
            appointment.google_sync_status
        }
      });
  }

  private async openEditAppointmentModal(
    appointmentId: string
  ): Promise<void> {
    const modal =
      await this.modalController.create({
        component:
          AppointmentModalComponent,

        componentProps: {
          appointmentId
        },

        breakpoints: [
          0,
          0.75,
          1
        ],

        initialBreakpoint:
          0.75
      });

    await modal.present();

    const { data, role } =
      await modal.onWillDismiss();

    if (
      role === 'updated' &&
      data
    ) {
      this.updateAppointmentOnCalendar(
        data
      );
    }
  }

  private updateAppointmentOnCalendar(
    appointment: any
  ): void {
    const event =
      this.calendar()
        ?.getApi()
        .getEventById(
          appointment.id
        );

    if (!event) {
      return;
    }

    event.setProp(
      'title',
      appointment.patient_name
    );

    event.setStart(
      appointment.start_at
    );

    event.setEnd(
      appointment.end_at
    );

    event.setExtendedProp(
      'patientEmail',
      appointment.patient_email
    );

    event.setExtendedProp(
      'patientPhone',
      appointment.patient_phone
    );

    event.setExtendedProp(
      'description',
      appointment.description
    );

    event.setExtendedProp(
      'googleSyncStatus',
      appointment.google_sync_status
    );
  }
}
