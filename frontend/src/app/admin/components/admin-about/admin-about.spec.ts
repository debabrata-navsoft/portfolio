import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAbout } from './admin-about';

describe('AdminAbout', () => {
  let component: AdminAbout;
  let fixture: ComponentFixture<AdminAbout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAbout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAbout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
