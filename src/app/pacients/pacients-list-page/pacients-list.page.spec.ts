/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PacientsListPage } from './pacients-list.page';

describe('PacientsListPage', () => {
  let component: PacientsListPage;
  let fixture: ComponentFixture<PacientsListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacientsListPage ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacientsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
