import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartupLoader } from './startup-loader';

describe('StartupLoader', () => {
  let component: StartupLoader;
  let fixture: ComponentFixture<StartupLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartupLoader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartupLoader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
