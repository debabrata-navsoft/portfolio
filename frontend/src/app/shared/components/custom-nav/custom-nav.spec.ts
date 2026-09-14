import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomNav } from './custom-nav';

describe('CustomNav', () => {
  let component: CustomNav;
  let fixture: ComponentFixture<CustomNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
