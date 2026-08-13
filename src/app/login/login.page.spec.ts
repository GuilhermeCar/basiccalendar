/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Login.pageComponent } from './login.page.component';

describe('Login.pageComponent', () => {
  let component: Login.pageComponent;
  let fixture: ComponentFixture<Login.pageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Login.pageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Login.pageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
