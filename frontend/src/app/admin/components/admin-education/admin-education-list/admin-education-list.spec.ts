import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEducationList } from './admin-education-list';

describe('AdminEducationList', () => {
  let component: AdminEducationList;
  let fixture: ComponentFixture<AdminEducationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEducationList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEducationList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
