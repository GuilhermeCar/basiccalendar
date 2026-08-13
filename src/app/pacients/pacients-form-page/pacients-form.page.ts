import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-pacients-form',
  templateUrl: 'pacients-form.page.html',
  styleUrls: ['pacients-form.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
})
export class PacientsFormPage {
  constructor() {}
}
