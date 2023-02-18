ALTER TABLE "channelPreferences" RENAME TO "notificationPreferences";

ALTER TABLE "notificationPreferences" RENAME CONSTRAINT "channelPreferences_pkey" TO "notificationPreferences_pkey";