import { RefreshRate } from "./refresh-rate.enum";

export interface RefreshRateOptionModel {
    description: string;
    rateInMilliseconds: RefreshRate;
}