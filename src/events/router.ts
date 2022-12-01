import events from './instances';

interface EventPayload {
  type: string;
  data: unknown;
}

function onEventReceived(payload: EventPayload): void {
  events.forEach(e => {
    if (payload.type === e.type) {
      e.execute(payload.data);
    }
  });
}

export { onEventReceived };
