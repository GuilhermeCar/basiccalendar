import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { GoogleCalendarService } from './google-calendar.service';
import { UpdateAppointmentRequest } from '../../interfaces/appointment.model';

export interface CreateAppointmentRequest {
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;

  startAt: Date;
  endAt: Date;

  description?: string;

  googleCalendarId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly googleCalendarService = inject(GoogleCalendarService);

  async create(
    request: CreateAppointmentRequest
  ) {
    const { data: userData, error: userError } =
      await this.supabaseService.getUser();

    if (
      userError ||
      !userData.user
    ) {
      throw new Error(
        'Usuário não autenticado.'
      );
    }

    const { data, error } =
      await this.supabaseService.client
        .from('appointments')
        .insert({
          user_id:
            userData.user.id,

          patient_name:
            request.patientName,

          patient_email:
            request.patientEmail ?? null,

          patient_phone:
            request.patientPhone ?? null,

          description:
            request.description ?? null,

          start_at:
            request.startAt.toISOString(),

          end_at:
            request.endAt.toISOString(),

          google_calendar_id:
            request.googleCalendarId ?? null,

          google_sync_status:
            'pending'
        })
        .select()
        .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getAppointmentsByPeriod(
    start: Date,
    end: Date
  ) {
    const { data, error } =
      await this.supabaseService.client
        .from('appointments')
        .select('*')
        .gte(
          'start_at',
          start.toISOString()
        )
        .lt(
          'start_at',
          end.toISOString()
        )
        .order(
          'start_at',
          {
            ascending: true
          }
        );

    if (error) {
      throw error;
    }

    return data ?? [];
  }


  private buildGoogleDescription(
    patientName: string,
    patientEmail: string | undefined,
    patientPhone: string | undefined,
    description: string | undefined
  ): string {
    return [
      `Paciente: ${patientName}`,
      patientEmail
        ? `E-mail: ${patientEmail}`
        : null,
      patientPhone
        ? `Telefone: ${patientPhone}`
        : null,

      '',

      description
        ? `Descrição:\n${description}`
        : null
    ]
      .filter((item) => item !== null)
      .join('\n');
  }

  async createWithGoogle(
    request: CreateAppointmentRequest
  ) {
    const appointment =
      await this.create(request);

    if (!request.googleCalendarId) {
      return appointment;
    }

    try {
      const googleEvent =
        await this.googleCalendarService.createEvent({
          calendarId:
            request.googleCalendarId,

          title:
            request.patientName,

          description:
            this.buildGoogleDescription(
              request.patientName,
              request.patientEmail,
              request.patientPhone,
              request.description
            ),

          start:
            request.startAt,

          end:
            request.endAt
        });

      const { data, error } =
        await this.supabaseService.client
          .from('appointments')
          .update({
            google_calendar_id:
              request.googleCalendarId,

            google_event_id:
              googleEvent.id,

            google_sync_status:
              'synced',

            updated_at:
              new Date().toISOString()
          })
          .eq(
            'id',
            appointment.id
          )
          .select()
          .single();

      if (error) {
        throw error;
      }

      return data;

    } catch (error) {
      console.error(
        'Erro ao sincronizar com Google:',
        error
      );

      await this.supabaseService.client
        .from('appointments')
        .update({
          google_sync_status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq(
          'id',
          appointment.id
        );

      return {
        ...appointment,
        google_sync_status: 'error'
      };
    }
  }

  async getTodayAppointments() {
    const startOfDay = new Date();

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    const endOfDay = new Date(startOfDay);

    endOfDay.setDate(
      endOfDay.getDate() + 1
    );

    const { data, error } =
      await this.supabaseService.client
        .from('appointments')
        .select(`
        id,
        patient_name,
        patient_email,
        patient_phone,
        start_at,
        end_at,
        description,
        google_sync_status
      `)
        .gte(
          'start_at',
          startOfDay.toISOString()
        )
        .lt(
          'start_at',
          endOfDay.toISOString()
        )
        .order(
          'start_at',
          {
            ascending: true
          }
        );

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async getById(id: string) {
    const { data, error } =
      await this.supabaseService.client
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(
    appointmentId: string,
    request: UpdateAppointmentRequest
  ) {
    const { data, error } =
      await this.supabaseService.client
        .from('appointments')
        .update({
          patient_name:
            request.patientName,

          patient_email:
            request.patientEmail ?? null,

          patient_phone:
            request.patientPhone ?? null,

          description:
            request.description ?? null,

          start_at:
            request.startAt.toISOString(),

          end_at:
            request.endAt.toISOString(),

          google_sync_status:
            'pending',

          updated_at:
            new Date().toISOString()
        })
        .eq(
          'id',
          appointmentId
        )
        .select()
        .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateWithGoogle(
    appointmentId: string,
    request: UpdateAppointmentRequest
  ) {
    const appointment =
      await this.update(
        appointmentId,
        request
      );

    if (
      !appointment.google_calendar_id ||
      !appointment.google_event_id
    ) {
      return appointment;
    }

    try {
      await this.googleCalendarService
        .updateEvent({
          calendarId:
            appointment.google_calendar_id,

          eventId:
            appointment.google_event_id,

          title:
            request.patientName,

          description:
            this.buildGoogleDescription(
              request.patientName,
              request.patientEmail,
              request.patientPhone,
              request.description
            ),

          start:
            request.startAt,

          end:
            request.endAt
        });

      const { data, error } =
        await this.supabaseService.client
          .from('appointments')
          .update({
            google_sync_status:
              'synced',

            updated_at:
              new Date().toISOString()
          })
          .eq(
            'id',
            appointmentId
          )
          .select()
          .single();

      if (error) {
        throw error;
      }

      return data;

    } catch (error) {

      console.error(
        'Erro ao sincronizar alteração com Google:',
        error
      );

      await this.supabaseService.client
        .from('appointments')
        .update({
          google_sync_status:
            'error',

          updated_at:
            new Date().toISOString()
        })
        .eq(
          'id',
          appointmentId
        );

      return {
        ...appointment,
        google_sync_status: 'error'
      };
    }
  }

  async deleteWithGoogle(
    appointmentId: string
  ): Promise<void> {
    const appointment =
      await this.getById(appointmentId);

    const { error } =
      await this.supabaseService.client
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

    if (error) {
      throw error;
    }

    if (
      !appointment.google_calendar_id ||
      !appointment.google_event_id
    ) {
      return;
    }

    try {
      await this.googleCalendarService.deleteEvent(
        appointment.google_calendar_id,
        appointment.google_event_id
      );
    } catch (error) {
      console.error(
        'Appointment removido do Axis, mas não foi possível remover do Google Calendar:',
        error
      );
    }
  }
}
