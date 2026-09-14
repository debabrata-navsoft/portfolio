import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEducationForm } from './admin-education-form';

describe('AdminEducationForm', () => {
  let component: AdminEducationForm;
  let fixture: ComponentFixture<AdminEducationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEducationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEducationForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
