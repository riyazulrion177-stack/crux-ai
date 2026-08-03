// ==========================================
// CRUX Life OS - Analytics Service
// Monetization & Conversion Telemetry Architecture
// ==========================================

export interface MonetizationEvent {
  eventName:
    | 'PAYWALL_VIEWED'
    | 'PLAN_SELECTED'
    | 'CHECKOUT_INITIATED'
    | 'FEATURE_GATED'
    | 'AD_REQUESTED'
    | 'COIN_SPENT'
    | 'BATTLE_PASS_CLAIMED';
  userId: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

export class AnalyticsService {
  private events: MonetizationEvent[] = [];

  public track(
    eventName: MonetizationEvent['eventName'],
    userId: string,
    properties?: Record<string, unknown>
  ): void {
    const event: MonetizationEvent = {
      eventName,
      userId,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    if (this.events.length > 200) {
      this.events.shift();
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Monetization Analytics] ${eventName}:`, properties);
    }
  }

  public getEvents(): MonetizationEvent[] {
    return [...this.events];
  }
}

export const analyticsService = new AnalyticsService();
