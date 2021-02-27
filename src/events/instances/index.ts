import { Event } from '../../types';
import CompetitionCreated from './CompetitionCreated';
import CompetitionEnded from './CompetitionEnded';
import CompetitionEnding from './CompetitionEnding';
import CompetitionStarted from './CompetitionStarted';
import CompetitionStarting from './CompetitionStarting';
import MemberAchievements from './MemberAchievements';
import MemberHardcoreDied from './MemberHardcoreDied';
import MemberNameChanged from './MemberNameChanged';
import MembersJoined from './MembersJoined';
import MembersLeft from './MembersLeft';

const events: Event[] = [
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

export default events;
