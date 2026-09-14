import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminContactDetail } from './admin-contact-detail';

describe('AdminContactDetail', () => {
  let component: AdminContactDetail;
  let fixture: ComponentFixture<AdminContactDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminContactDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminContactDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
