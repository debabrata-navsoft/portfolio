import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminArticleList } from './admin-article-list';

describe('AdminArticleList', () => {
  let component: AdminArticleList;
  let fixture: ComponentFixture<AdminArticleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminArticleList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminArticleList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
