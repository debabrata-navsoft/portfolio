import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminArticleForm } from './admin-article-form';

describe('AdminArticleForm', () => {
  let component: AdminArticleForm;
  let fixture: ComponentFixture<AdminArticleForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminArticleForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminArticleForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
