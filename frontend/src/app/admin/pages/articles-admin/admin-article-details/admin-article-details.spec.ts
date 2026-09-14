import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminArticleDetails } from './admin-article-details';

describe('AdminArticleDetails', () => {
  let component: AdminArticleDetails;
  let fixture: ComponentFixture<AdminArticleDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminArticleDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminArticleDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
