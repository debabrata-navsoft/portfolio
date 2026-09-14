import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeArticles } from './home-articles';

describe('HomeArticles', () => {
  let component: HomeArticles;
  let fixture: ComponentFixture<HomeArticles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeArticles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeArticles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
