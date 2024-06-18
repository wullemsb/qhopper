import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { RefreshService } from "./refresh.service";
import { RefreshRate } from "../models/refresh-rate.enum";

describe('RefreshService', () => {
  let service: RefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RefreshService]
    });
    service = TestBed.inject(RefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve and set refresh rate correctly', () => {
    const testRefreshRate = RefreshRate.THIRTY_SECONDS;
    service.setRefreshRateInMilliseconds(testRefreshRate);
    expect(service.getRefreshRateInMilliseconds()).toEqual(testRefreshRate);
  });

  it('should set refresh rate in local storage', () => {
    const testRefreshRate = RefreshRate.THIRTY_SECONDS;
    service.setRefreshRateInMilliseconds(testRefreshRate);
    const storedRefreshRate = localStorage.getItem('selectedRefreshRate');
    expect(storedRefreshRate).toEqual(testRefreshRate.toString());
  });

  it('should trigger refresh notifier when refreshNow() is called', () => {
    let refreshNotifierTriggered = false;
    // @ts-ignore
    service['refreshNotifier'].subscribe(() => {
      refreshNotifierTriggered = true;
    });
    service.refreshNow();
    expect(refreshNotifierTriggered).toBeTrue();
  });

  it('should not trigger refresh notifier during cooldown', () => {
    let refreshNotifierTriggered = false;
    service.refreshNow();
    // @ts-ignore
    service['refreshNotifier'].subscribe(() => {
      refreshNotifierTriggered = true;
    });
    service.refreshNow();
    expect(refreshNotifierTriggered).toBeFalse();
  });

  it('should trigger refresh notifier when refreshNow() is called', () => {
    let refreshNotifierTriggered = false;
    // @ts-ignore
    service['refreshNotifier'].subscribe(() => {
      refreshNotifierTriggered = true;
    });
    service.refreshNow();
    expect(refreshNotifierTriggered).toBeTrue();
  });

  it('should not trigger refresh notifier during cooldown', () => {
    let refreshNotifierTriggered = false;
    service.refreshNow();
    // @ts-ignore
    service['refreshNotifier'].subscribe(() => {
      refreshNotifierTriggered = true;
    });
    service.refreshNow();
    expect(refreshNotifierTriggered).toBeFalse();
  });

  it('should create refresh countdown timer correctly', () => {
    service.setRefreshRateInMilliseconds(RefreshRate.ONE_MINUTE);
    expect(service['refreshCountdownTimerSubscription']).toBeTruthy();
  });
});