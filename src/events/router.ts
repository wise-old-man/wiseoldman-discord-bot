import { EventPayload } from '../types';
import events from './instances';

function onEventReceived(payload: EventPayload): void {
  events.forEach(e => {
    if (payload.type === e.type) {
      e.execute(payload.data);
    }
  });
}

export { onEventReceived };
