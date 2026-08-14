export interface Appointment {
  id?: string;

  patientName: string;
  patientEmail?: string;
  patientPhone?: string;

  startAt: Date;
  endAt: Date;

  description?: string;

  googleCalendarId?: string;
  googleEventId?: string;
}

export interface UpdateAppointmentRequest {
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;

  startAt: Date;
  endAt: Date;

  description?: string;
}
