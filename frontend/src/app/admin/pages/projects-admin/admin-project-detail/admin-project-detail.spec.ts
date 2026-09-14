import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProjectDetail } from './admin-project-detail';

describe('AdminProjectDetail', () => {
  let component: AdminProjectDetail;
  let fixture: ComponentFixture<AdminProjectDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProjectDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProjectDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
