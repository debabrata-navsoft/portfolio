import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminExperienceList } from './admin-experience-list';

describe('AdminExperienceList', () => {
  let component: AdminExperienceList;
  let fixture: ComponentFixture<AdminExperienceList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminExperienceList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminExperienceList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
