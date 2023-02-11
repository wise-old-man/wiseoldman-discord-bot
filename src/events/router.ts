import { Client } from 'discord.js';
import { Event } from '../utils/events';
import monitoring from '../utils/monitoring';
import CompetitionCreated from './instances/CompetitionCreated';
import CompetitionEnded from './instances/CompetitionEnded';
import CompetitionEnding from './instances/CompetitionEnding';
import CompetitionStarted from './instances/CompetitionStarted';
import CompetitionStarting from './instances/CompetitionStarting';
import MemberAchievements from './instances/MemberAchievements';
import MemberHardcoreDied from './instances/MemberHardcoreDied';
import MemberNameChanged from './instances/MemberNameChanged';
import MembersJoined from './instances/MembersJoined';
import MembersLeft from './instances/MembersLeft';

const EVENTS: Event[] = [
  CompetitionCreated,
  CompetitionStarted,
  CompetitionStarting,
  CompetitionEnded,
  CompetitionEnding,
  MembersLeft,
  MembersJoined,
  MemberNameChanged,
  MemberHardcoreDied,
  MemberAchievements
];

function onEventReceived(client: Client, payload: { type: string; data: unknown }): void {
  EVENTS.forEach(e => {
    if (payload.type === e.type) {
      const eventMonitor = monitoring.trackEvent();

      e.execute(payload.data, client)
        .then(() => eventMonitor.endTracking(e.type, 1))
        .catch(() => eventMonitor.endTracking(e.type, 0));
    }
  });
}

export { onEventReceived };
