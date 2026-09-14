import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSkillList } from './admin-skill-list';

describe('AdminSkillList', () => {
  let component: AdminSkillList;
  let fixture: ComponentFixture<AdminSkillList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSkillList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSkillList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
