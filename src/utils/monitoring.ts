import prometheus, { Histogram, Registry } from 'prom-client';

class MonitoringService {
  private registry: Registry;
  private eventHistogram: Histogram;
  private commandHistogram: Histogram;

  constructor() {
    this.registry = new prometheus.Registry();
    this.registry.setDefaultLabels({ app: 'discord-bot' });

    prometheus.collectDefaultMetrics({ register: this.registry });

    this.setupEventHistogram();
    this.setupCommandHistogram();
  }

  private setupEventHistogram() {
    this.eventHistogram = new prometheus.Histogram({
      name: 'event_duration_seconds',
      help: 'Duration of event execution in microseconds',
      labelNames: ['event', 'status'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10, 30]
    });

    this.registry.registerMetric(this.eventHistogram);
  }

  private setupCommandHistogram() {
    this.commandHistogram = new prometheus.Histogram({
      name: 'command_duration_seconds',
      help: 'Duration of command execution in microseconds',
      labelNames: ['command', 'status', 'guild'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10, 30]
    });

    this.registry.registerMetric(this.commandHistogram);
  }

  trackCommand() {
    const endTimerFn = this.commandHistogram.startTimer();

    return {
      endTracking: (command: string, status: number, guild: string) => {
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

  getMetrics() {
    return this.registry.getMetricsAsJSON();
  }
}

export default new MonitoringService();
