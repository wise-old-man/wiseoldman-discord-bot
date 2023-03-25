---
sidebar_position: 1
---

# How to setup

:::caution
Are you having issues with the bot? is it not responding or not sending notifications? Check out the [Troubleshooting](/troubleshooting) page.
:::

## Installing the bot

First, you need to invite the bot to your server, you can find the invite button [here](https://bot.wiseoldman.net).

## As a server admin

**Configuring the group**

You can (and should) configure the selected `group` for the Discord server. This is the group that will be used for all commands and notifications.

You can do this with the [`/config group` command](/commands#config-group).

<br />

**Configuring notifications**

Then, you can also tell the bot where you want certain group-related notifications to be sent to. For example, you might want member achievements to go to some `#achievements` channel, and you might want to send a message to `#general` when a new member joins.

Note: you can also use this command to **disable certain notification types**.

You can do this with the [`/config notifications` command](/commands#config-notifications).

<br />

**Checking current configurations**

You can check your current configurations by using the `/help` command (with no category selected).

## As a regular player/member

You can use the [`/setrsn` command](/commands#setrsn) to tell the bot your OSRS name, this allows you to use player commands without having to specify your RSN every time.
