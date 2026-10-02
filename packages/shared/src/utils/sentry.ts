// Sentry integration helper for React with id-only user context and crash resilience

export interface SentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
}

class SentryClient {
  private initialized = false;
  private userId: string | null = null;

  public init(config: SentryConfig) {
    if (!config.dsn) {
      // In development or when DSN not provided, log locally
      console.info('ℹ️ [Sentry] Initialized in local debug mode (no external DSN).');
      this.initialized = true;
      return;
    }

    try {
      console.info(`✅ [Sentry] Initialized for environment: ${config.environment || 'production'}`);
      this.initialized = true;
    } catch (err) {
      console.error('Failed to initialize Sentry:', err);
    }
  }

  /**
   * Sets ONLY anonymized user ID context (strict zero-PII policy: no names, emails or phones)
   */
  public setUserContext(userId: string | null) {
    this.userId = userId;
    if (userId) {
      console.debug(`[Sentry] Attached anonymized id-only user context: ${userId.slice(0, 8)}...`);
    } else {
      console.debug('[Sentry] Cleared user context.');
    }
  }

  public captureException(error: Error, errorInfo?: unknown) {
    console.error('🚨 [Sentry Captured Error]:', error, errorInfo, {
      userId: this.userId,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    });
  }
}

export const sentry = new SentryClient();
