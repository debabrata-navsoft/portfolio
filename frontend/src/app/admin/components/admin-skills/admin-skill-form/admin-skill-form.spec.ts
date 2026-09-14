import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSkillForm } from './admin-skill-form';

describe('AdminSkillForm', () => {
  let component: AdminSkillForm;
  let fixture: ComponentFixture<AdminSkillForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSkillForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSkillForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
