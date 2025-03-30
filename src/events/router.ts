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
import PlayerFlaggedReview from './instances/PlayerFlaggedReview';
import MembersRolesChanged from './instances/MembersRolesChanged';
import PotentialCreationSpam from './instances/PotentialCreationSpam';
import OffensiveNamesFound from './instances/OffensiveNamesFound';

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
  MemberAchievements,
  PlayerFlaggedReview,
  MembersRolesChanged,
  PotentialCreationSpam,
  OffensiveNamesFound
];

function onEventReceived(client: Client, payload: { type: string; data: unknown }): void {
  EVENTS.forEach(event => {
    if (payload.type === event.type) {
      const eventMonitor = monitoring.trackEvent();

      event
        .execute(payload.data, client)
        .then(() => eventMonitor.endTracking(event.type, 1))
        .catch(error => {
          console.log(error);
          eventMonitor.endTracking(event.type, 0);
        });
    }
  });
}

export { onEventReceived };
