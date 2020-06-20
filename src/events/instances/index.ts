import { Event } from '../../types';
import CompetitionCreated from './CompetitionCreated';
import CompetitionEnded from './CompetitionEnded';
import CompetitionEnding from './CompetitionEnding';
import CompetitionStarted from './CompetitionStarted';
import CompetitionStarting from './CompetitionStarting';
import CompetitionTopChanged from './CompetitionTopChanged';
import MemberAchievement from './MemberAchievement';
import MemberJoined from './MemberJoined';
import MemberLeft from './MemberLeft';

const events: Event[] = [
  CompetitionCreated,
  CompetitionStarted,
  CompetitionStarting,
  CompetitionEnded,
  CompetitionEnding,
  CompetitionTopChanged,
  MemberJoined,
  MemberLeft,
  MemberAchievement
];

export default events;
