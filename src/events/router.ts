import { AsyncResult, complete, errored, isErrored } from '@attio/fetchable';
import * as Sentry from '@sentry/node';
import { Client } from 'discord.js';
import prometheus from '../services/prometheus';
import { Event } from '../utils/events';
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
import MembersRolesChanged from './instances/MembersRolesChanged';
import OffensiveNamesFound from './instances/OffensiveNamesFound';
import PlayerFlaggedReview from './instances/PlayerFlaggedReview';
import PotentialCreationSpam from './instances/PotentialCreationSpam';

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
): AsyncResult<
  true,
  { code: 'EVENT_TYPE_NOT_FOUND'; type: string } | { code: 'FAILED_TO_EXECUTE_EVENT'; error: unknown }
> {
  const matchingEvent = EVENTS.find(event => event.type === payload.type);

  if (!matchingEvent) {
    return errored({ code: 'EVENT_TYPE_NOT_FOUND', type: payload.type });
  }

  console.log('Received event:', JSON.stringify(payload));
  
  const eventMonitor = prometheus.trackEvent();

  const executionResult = await matchingEvent.execute(payload.data, client);

  if (isErrored(executionResult)) {
    console.error(
      'Error executing event',
      JSON.stringify(payload),
      JSON.stringify(executionResult.error)
    );

    Sentry.captureException(executionResult.error);

    eventMonitor.endTracking(matchingEvent.type, 0);

    return errored({
      code: 'FAILED_TO_EXECUTE_EVENT',
      error: executionResult.error
    });
  }

  console.log('Event executed successfully:', JSON.stringify(payload));
  eventMonitor.endTracking(matchingEvent.type, 1);

  return complete(true);
}

export { onEventReceived };
