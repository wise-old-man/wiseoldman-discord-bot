-- CreateTable
CREATE TABLE IF NOT EXISTS "aliases" (
    "userId" VARCHAR(256) NOT NULL,
    "username" VARCHAR(12) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "aliases_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "channelPreferences" (
    "guildId" VARCHAR(256) NOT NULL,
    "type" VARCHAR(64) NOT NULL,
    "channelId" VARCHAR(256),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "channelPreferences_pkey" PRIMARY KEY ("guildId","type")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "servers" (
    "guildId" VARCHAR(256) NOT NULL,
    "groupId" INTEGER,
    "botChannelId" VARCHAR(256),
    "prefix" VARCHAR(20) NOT NULL DEFAULT '!',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "servers_pkey" PRIMARY KEY ("guildId")
);
