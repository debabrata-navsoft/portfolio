import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';

import { StartupLoader } from './startup-loader';
import { LoaderService } from '../../../../core/services/loader.service';

describe('StartupLoader timing', () => {
  let fixture: ComponentFixture<StartupLoader>;
  let loader: LoaderService;

  const loaderVisible = () => loader.startupLoading();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartupLoader],
    }).compileComponents();

    loader = TestBed.inject(LoaderService);
    loader.showStartup();
    loader.resetRequests();

    fixture = TestBed.createComponent(StartupLoader);
  });

  it('stays visible past the 2s minimum while requests are pending', fakeAsync(() => {
    loader.trackRequest();
    loader.trackRequest();
    fixture.detectChanges();

    tick(2500);
    fixture.detectChanges();
    expect(loaderVisible()).withContext('after min display, still loading').toBe(true);

    tick(5000);
    fixture.detectChanges();
    expect(loaderVisible()).withContext('7.5s in, still loading').toBe(true);

    flush();
  }));

  it('shows the slow-server hint after 5s', fakeAsync(() => {
    loader.trackRequest();
    fixture.detectChanges();

    tick(4000);
    fixture.detectChanges();
    expect(fixture.componentInstance.showSlowHint()).toBe(false);

    tick(2000);
    fixture.detectChanges();
    expect(fixture.componentInstance.showSlowHint()).toBe(true);

    flush();
  }));

  it('exits once the last request completes after the minimum display time', fakeAsync(() => {
    loader.trackRequest();
    loader.trackRequest();
    fixture.detectChanges();

    tick(3000);
    loader.completeRequest();
    fixture.detectChanges();
    tick(1200);
    fixture.detectChanges();
    expect(loaderVisible()).withContext('one request still pending').toBe(true);

    loader.completeRequest();
    fixture.detectChanges();
    tick(1200); // exit animation fallback
    fixture.detectChanges();
    expect(loaderVisible()).withContext('all requests done').toBe(false);

    flush();
  }));

  it('waits out the minimum display time even when data is instant', fakeAsync(() => {
    fixture.detectChanges();

    tick(500);
    fixture.detectChanges();
    expect(loaderVisible()).withContext('before min display').toBe(true);

    tick(2000);
    fixture.detectChanges();
    tick(1200);
    fixture.detectChanges();
    expect(loaderVisible()).withContext('after min display, nothing pending').toBe(false);

    flush();
  }));

  it('gives up and shows the page at the 20s cap when the API never answers', fakeAsync(() => {
    loader.trackRequest();
    fixture.detectChanges();

    tick(19000);
    fixture.detectChanges();
    expect(loaderVisible()).withContext('before cap').toBe(true);

    tick(2000);
    fixture.detectChanges();
    tick(1200);
    fixture.detectChanges();
    expect(loaderVisible()).withContext('after 20s cap').toBe(false);

    flush();
  }));
});
