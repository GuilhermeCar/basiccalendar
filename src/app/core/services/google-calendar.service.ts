import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;

  start: {
    dateTime?: string;
    date?: string;
  };

  end: {
    dateTime?: string;
    date?: string;
  };
}

export interface CreateGoogleEventRequest {
  calendarId: string;

  title: string;
  description?: string;

  start: Date;
  end: Date;
}

export interface UpdateGoogleEventRequest {
  calendarId: string;
  eventId: string;

  title: string;
  description?: string;

  start: Date;
  end: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private readonly supabaseService = inject(SupabaseService);

  async getCalendars(): Promise<GoogleCalendar[]> {
    const token =
      await this.supabaseService.getProviderToken();

    if (!token) {
      throw new Error('Google provider token não encontrado.');
    }

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        'Não foi possível carregar as agendas do Google.'
      );
    }

    const data = await response.json();

    return data.items ?? [];
  }

  async getEvents(
    calendarId: string,
    start: Date,
    end: Date
  ): Promise<GoogleCalendarEvent[]> {
    const token =
      await this.supabaseService.getProviderToken();

    if (!token) {
      throw new Error('Google provider token não encontrado.');
    }

    const params = new URLSearchParams({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime'
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        'Não foi possível carregar os eventos do Google.'
      );
    }

    const data = await response.json();

    return data.items ?? [];
  }

  async createEvent(request: CreateGoogleEventRequest) {
    const token =
      await this.supabaseService.getProviderToken();

    if (!token) {
      throw new Error(
        'Token do Google não encontrado.'
      );
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(request.calendarId)}/events`,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          summary: request.title,

          description: request.description,

          start: {
            dateTime: request.start.toISOString()
          },

          end: {
            dateTime: request.end.toISOString()
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();

      console.error(error);

      throw new Error(
        'Não foi possível criar o evento no Google Calendar.'
      );
    }

    return response.json();
  }

  async updateEvent(
    request: UpdateGoogleEventRequest
  ) {
    const token =
      await this.supabaseService.getProviderToken();

    if (!token) {
      throw new Error(
        'Token do Google não encontrado.'
      );
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(request.calendarId)}/events/${encodeURIComponent(request.eventId)}`,
      {
        method: 'PUT',

        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          summary:
            request.title,

          description:
            request.description,

          start: {
            dateTime:
              request.start.toISOString()
          },

          end: {
            dateTime:
              request.end.toISOString()
          }
        })
      }
    );

    if (!response.ok) {
      const error =
        await response.json();

      console.error(error);

      throw new Error(
        'Não foi possível atualizar o evento no Google Calendar.'
      );
    }

    return response.json();
  }

}


