import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminContactList } from './admin-contact-list';

describe('AdminContactList', () => {
  let component: AdminContactList;
  let fixture: ComponentFixture<AdminContactList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminContactList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminContactList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
