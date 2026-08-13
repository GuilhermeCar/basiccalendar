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
}


