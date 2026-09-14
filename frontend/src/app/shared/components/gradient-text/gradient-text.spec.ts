import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradientText } from './gradient-text';

describe('GradientText', () => {
  let component: GradientText;
  let fixture: ComponentFixture<GradientText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradientText]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradientText);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
