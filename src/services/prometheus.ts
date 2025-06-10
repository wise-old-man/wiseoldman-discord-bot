import axios from 'axios';
import prometheus, { Histogram, Registry } from 'prom-client';

class PrometheusService {
  private registry: Registry;
  private eventHistogram: Histogram;
  private commandHistogram: Histogram;

  private pushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.registry = new prometheus.Registry();
    this.registry.setDefaultLabels({ app: 'discord-bot' });

    prometheus.collectDefaultMetrics({ register: this.registry });

    this.eventHistogram = new prometheus.Histogram({
      name: 'event_duration_seconds',
      help: 'Duration of event execution in microseconds',
      labelNames: ['event', 'status'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10, 30]
    });

    this.commandHistogram = new prometheus.Histogram({
      name: 'command_duration_seconds',
      help: 'Duration of command execution in microseconds',
      labelNames: ['command', 'status', 'guild'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10, 30]
    });

    this.registry.registerMetric(this.eventHistogram);
    this.registry.registerMetric(this.commandHistogram);
  }

  init() {
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    this.pushInterval = setInterval(() => {
      this.pushMetrics();
    }, 60_000);
  }

  shutdown() {
    if (this.pushInterval !== null) {
      clearInterval(this.pushInterval);
    }
  }

  async pushMetrics() {
    if (!process.env.PROMETHEUS_METRICS_SERVICE_URL) {
      throw new Error('PROMETHEUS_METRICS_SERVICE_URL is not set');
    }

    const metrics = await this.registry.getMetricsAsJSON();

    try {
      await axios.post(process.env.PROMETHEUS_METRICS_SERVICE_URL, {
        source: 'discord-bot',
        data: metrics
      });
    } catch (error) {
      console.error('Failed to push metrics:', error);
    }
  }

  trackCommand() {
    const endTimerFn = this.commandHistogram.startTimer();

    return {
      endTracking: (command: string, status: number, guild?: string) => {
        endTimerFn({ command, status, guild });
      }
    };
  }

  trackEvent() {
    const endTimerFn = this.eventHistogram.startTimer();

    return {
      endTracking: (event: string, status: number) => {
        endTimerFn({ event, status });
      }
    };
  }
}

export default new PrometheusService();
