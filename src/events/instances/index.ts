import { Event } from '../../types';
import CompetitionCreated from './CompetitionCreated';
import CompetitionEnded from './CompetitionEnded';
import CompetitionEnding from './CompetitionEnding';
import CompetitionStarted from './CompetitionStarted';
import CompetitionStarting from './CompetitionStarting';
import CompetitionTopChanged from './CompetitionTopChanged';
import MemberAchievements from './MemberAchievements';
import MembersJoined from './MembersJoined';
import MembersLeft from './MembersLeft';

const events: Event[] = [
  CompetitionCreated,
  CompetitionStarted,
  CompetitionStarting,
  CompetitionEnded,
  CompetitionEnding,
  CompetitionTopChanged,
  MembersJoined,
  MembersLeft,
  MemberAchievements
];

export default events;
