import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProjectList } from './admin-project-list';

describe('AdminProjectList', () => {
  let component: AdminProjectList;
  let fixture: ComponentFixture<AdminProjectList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProjectList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProjectList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
