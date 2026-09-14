import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactFooter } from './contact-footer';

describe('ContactFooter', () => {
  let component: ContactFooter;
  let fixture: ComponentFixture<ContactFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFooter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactFooter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
