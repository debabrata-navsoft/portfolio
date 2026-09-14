import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminExperienceForm } from './admin-experience-form';

describe('AdminExperienceForm', () => {
  let component: AdminExperienceForm;
  let fixture: ComponentFixture<AdminExperienceForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminExperienceForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminExperienceForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
