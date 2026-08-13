import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacientsFormPage } from './pacient-form.page';

describe('PacientsFormPage', () => {
  let component: PacientsFormPage;
  let fixture: ComponentFixture<PacientsFormPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(PacientsFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
