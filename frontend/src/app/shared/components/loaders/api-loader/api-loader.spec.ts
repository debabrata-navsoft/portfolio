import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiLoader } from './api-loader';

describe('Loader', () => {
  let component: ApiLoader;
  let fixture: ComponentFixture<ApiLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiLoader],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiLoader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
