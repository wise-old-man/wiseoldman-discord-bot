// Make sure to export "Competition" type in client-js types, and then delete this

export * from '@wise-old-man/utils';

declare module '@wise-old-man/utils' {
  export type Competition = {
    id: number;
    title: string;
    metric: Metric;
    type: CompetitionType;
    startsAt: Date;
    endsAt: Date;
    groupId: number | null;
    score: number;
    verificationHash: string;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
}
