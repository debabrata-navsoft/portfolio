import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProjectForm } from './admin-project-form';

describe('AdminProjectForm', () => {
  let component: AdminProjectForm;
  let fixture: ComponentFixture<AdminProjectForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProjectForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProjectForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
