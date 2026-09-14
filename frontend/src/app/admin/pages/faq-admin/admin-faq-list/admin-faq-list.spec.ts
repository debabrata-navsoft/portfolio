import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFaqList } from './admin-faq-list';

describe('AdminFaqList', () => {
  let component: AdminFaqList;
  let fixture: ComponentFixture<AdminFaqList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFaqList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFaqList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
