import { Injectable } from "@angular/core";
import { Observable, Subject, Subscription, repeat, takeUntil, timer } from "rxjs";
import { RefreshRateOptionModel } from "../models/refresh-rate-option.model";
import { RefreshRate } from "../models/refresh-rate.enum";

/**
 * Service that provides logic to refresh an observable manually or automatically after a set time.
 */
@Injectable()
export class RefreshService {
    private readonly refreshNotifier: Subject<void> = new Subject();
    private stopRefreshSubscriptionsNotifier = new Subject<void>();

    private refreshCountdownTimerSubscription!: Subscription | null;

    /**
     * Possible refresh rate options
     */
    public readonly refreshRateOptions: RefreshRateOptionModel[] = [
        {
            description: "15 Seconds",
            rateInMilliseconds: RefreshRate.FIFTEEN_SECONDS
        },
        {
            description: "30 Seconds",
            rateInMilliseconds: RefreshRate.THIRTY_SECONDS
        },
        {
            description: "1 Minute",
            rateInMilliseconds: RefreshRate.ONE_MINUTE
        },
        {
            description: "2 Minutes",
            rateInMilliseconds: RefreshRate.TWO_MINUTES
        },
        {
            description: "Off",
            rateInMilliseconds: RefreshRate.OFF
        },

    ];
    private refreshRateInMilliseconds: RefreshRate = this.refreshRateOptions[4].rateInMilliseconds;

    constructor() {
        const storedRefreshRate = localStorage.getItem('selectedRefreshRate');
        if (storedRefreshRate) {
            this.refreshRateInMilliseconds = parseInt(storedRefreshRate) as RefreshRate;
        }
        this.recreateRefreshCountdownTimer();
    }

    /**
     * Returns an Observable that emits a value whenever a refresh is triggered.
     */
    get refreshObservable(): Observable<void> {
        return this.refreshNotifier.asObservable();
    }

    public stopAllActiveRefreshSubscriptions(): void {
        this.stopRefreshSubscriptionsNotifier.next();
    }

    /**
     * Get current automatic refresh rate in milliseconds
     * @returns current automatic refresh rate in milliseconds
     */
    public getRefreshRateInMilliseconds(): RefreshRate {
        return this.refreshRateInMilliseconds;
    }

    /**
     * Set the automatic refresh rate in milliseconds
     * @param refreshRate automatic refresh rate to be set in milliseconds
     */
    public setRefreshRateInMilliseconds(refreshRate: RefreshRate) {

        if (refreshRate == 0) {
            this.refreshCountdownTimerSubscription!.unsubscribe();
            this.refreshCountdownTimerSubscription = null;
        }

        this.refreshRateInMilliseconds = refreshRate;
        localStorage.setItem('selectedRefreshRate', refreshRate.toString());

        if (this.refreshCountdownTimerSubscription == null) {
            this.recreateRefreshCountdownTimer();
        }

    }

    /**
     * Perform a manual refresh now if not on cooldown
     */
    public refreshNow() {
        this.recreateRefreshCountdownTimer();
        this.refreshNotifier.next();
    }

    /**
     * Wraps refresh logic around an observable
     * @param observable observable to which refresh logic will be added
     * @returns observable with refresh logic added to it
     */
    public wrapWithRefreshLogic<Type>(observable: Observable<Type>): Observable<Type> {
        return observable.pipe(repeat({ delay: () => this.refreshNotifier })).pipe(takeUntil(this.stopRefreshSubscriptionsNotifier));
    }

    /**
     * Creats a new countdown timer for the next automatic refresh
     */
    private recreateRefreshCountdownTimer() {
        // Remove old timer subscription
        if (this.refreshCountdownTimerSubscription != null) {
            this.refreshCountdownTimerSubscription.unsubscribe();
            this.refreshCountdownTimerSubscription = null;
        }

        // Don't create refresh timer if refresh rate is off
        if (this.refreshRateInMilliseconds == RefreshRate.OFF) {
            return;
        }

        let refreshCountdownTimer: Observable<number> = timer(this.refreshRateInMilliseconds);
        this.refreshCountdownTimerSubscription = refreshCountdownTimer.subscribe(() => {
            this.refreshNotifier.next();
            this.recreateRefreshCountdownTimer();
        });
    }
}
