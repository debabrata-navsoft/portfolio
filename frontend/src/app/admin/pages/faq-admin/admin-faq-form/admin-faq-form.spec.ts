import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFaqForm } from './admin-faq-form';

describe('AdminFaqForm', () => {
  let component: AdminFaqForm;
  let fixture: ComponentFixture<AdminFaqForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFaqForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFaqForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
