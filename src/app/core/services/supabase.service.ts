import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient
} from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private readonly supabase: SupabaseClient = createClient(
    environment.supabase.url,
    environment.supabase.key
  );

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  async signInWithGoogle() {
    return this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/axis/home`,

        scopes: [
          'openid',
          'email',
          'profile',
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/calendar.events'
        ].join(' '),

        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
  }

  async getProviderToken(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();

    return data.session?.provider_token ?? null;
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async getSession() {
    return this.supabase.auth.getSession();
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async getUser() {
    return this.supabase.auth.getUser();
  }

}
