import { Client } from 'discord.js';
import { Event } from '../utils/events';
import prometheus from '../services/prometheus';
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

async function onEventReceived(
  client: Client,
  payload: {
    eventId: string;
    type: string;
    data: unknown;
  }
) {
  const matchingEvent = EVENTS.find(event => event.type === payload.type);

  if (!matchingEvent) {
    throw new Error('Event type not found: ' + payload.type);
  }

  const eventMonitor = prometheus.trackEvent();

  try {
    await matchingEvent.execute(payload.data, client);

    console.log('Event executed successfully:', payload);
    eventMonitor.endTracking(matchingEvent.type, 1);
  } catch (error) {
    console.log('Error executing event', payload, error);
    eventMonitor.endTracking(matchingEvent.type, 0);
  }
}

export { onEventReceived };
