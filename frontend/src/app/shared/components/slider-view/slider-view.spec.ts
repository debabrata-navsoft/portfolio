import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderView } from './slider-view';

describe('SliderView', () => {
  let component: SliderView;
  let fixture: ComponentFixture<SliderView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SliderView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
