import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ModalController, IonIcon,
  AlertController
} from '@ionic/angular/standalone';

import { AppointmentService } from '../../core/services/appointment.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';

@Component({
  selector: 'app-appointment-modal',
  standalone: true,
  imports: [IonIcon,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea
  ],
  templateUrl: './appointment-modal.component.html',
  styleUrl: './appointment-modal.component.scss'
})
export class AppointmentModalComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalController = inject(ModalController);
  private readonly appointmentService = inject(AppointmentService);
  private readonly whatsAppService = inject(WhatsAppService);
  private readonly alertController = inject(AlertController);

  startDate?: Date;
  appointmentId?: string;

  public loading = signal(false);
  public errorMessage = signal('');

  public form = this.formBuilder.group({
    patientName: ['', Validators.required],
    patientEmail: ['', Validators.email],
    patientPhone: [''],
    description: [''],
    startAt: ['', Validators.required],
    endAt: ['', Validators.required]
  });

  async ngOnInit(): Promise<void> {
    if (this.appointmentId) {
      await this.loadAppointment();

      return;
    }

    const start =
      this.startDate ?? new Date();

    const end =
      new Date(
        start.getTime() +
        60 * 60 * 1000
      );

    this.form.patchValue({
      startAt:
        this.toLocalDateTime(start),

      endAt:
        this.toLocalDateTime(end)
    });
  }

  private async loadAppointment(): Promise<void> {
    if (!this.appointmentId) {
      return;
    }

    const appointment =
      await this.appointmentService
        .getById(this.appointmentId);

    this.form.patchValue({
      patientName:
        appointment.patient_name,

      patientEmail:
        appointment.patient_email ?? '',

      patientPhone:
        appointment.patient_phone ?? '',

      description:
        appointment.description ?? '',

      startAt:
        this.toLocalDateTime(
          new Date(
            appointment.start_at
          )
        ),

      endAt:
        this.toLocalDateTime(
          new Date(
            appointment.end_at
          )
        )
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value =
      this.form.getRawValue();

    this.loading.set(true);
    this.errorMessage.set('');

    const request = {
      patientName:
        value.patientName!,

      patientEmail:
        value.patientEmail || undefined,

      patientPhone:
        value.patientPhone || undefined,

      description:
        value.description || undefined,

      startAt:
        new Date(value.startAt!),

      endAt:
        new Date(value.endAt!)
    };

    try {
      const appointment =
        this.appointmentId
          ? await this.appointmentService
            .updateWithGoogle(
              this.appointmentId,
              request
            )
          : await this.appointmentService
            .createWithGoogle({
              ...request,
              googleCalendarId: 'primary'
            });

      await this.modalController.dismiss(
        appointment,
        this.appointmentId
          ? 'updated'
          : 'created'
      );

    } catch (error) {

      console.error(error);

      this.errorMessage.set(
        this.appointmentId
          ? 'Não foi possível atualizar o agendamento.'
          : 'Não foi possível cadastrar o agendamento.'
      );

    } finally {
      this.loading.set(false);
    }
  }

  async cancel(): Promise<void> {
    await this.modalController.dismiss(
      null,
      'cancel'
    );
  }

  private toLocalDateTime(date: Date): string {
    const offset = date.getTimezoneOffset();

    const localDate = new Date(
      date.getTime() - offset * 60 * 1000
    );

    return localDate
      .toISOString()
      .slice(0, 16);
  }

  openWhatsApp(): void {
    const phone =
      this.form.controls.patientPhone.value;

    if (!phone) {
      return;
    }

    this.whatsAppService.open(
      phone
    );
  }

  async deleteAppointment(): Promise<void> {
    if (!this.appointmentId) {
      return;
    }

    const alert =
      await this.alertController.create({
        header: 'Excluir agendamento?',
        message:
          'Essa ação removerá o agendamento do Axis e também tentará removê-lo do Google Calendar.',

        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Excluir',
            role: 'destructive',
            handler: () => {
              void this.confirmDelete();
            }
          }
        ]
      });

    await alert.present();
  }

  private async confirmDelete(): Promise<void> {
    if (!this.appointmentId) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const id = this.appointmentId;

      await this.appointmentService
        .deleteWithGoogle(id);

      await this.modalController.dismiss(
        {
          id
        },
        'deleted'
      );

    } catch (error) {
      console.error(
        'Erro ao excluir appointment:',
        error
      );

      this.errorMessage.set(
        'Não foi possível excluir o agendamento.'
      );

    } finally {
      this.loading.set(false);
    }
  }
}
