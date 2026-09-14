import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeServices } from './home-services';

describe('HomeServices', () => {
  let component: HomeServices;
  let fixture: ComponentFixture<HomeServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeServices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeServices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
