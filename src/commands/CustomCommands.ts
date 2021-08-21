import { CustomCommand } from '../types';

export const customCommands: Array<CustomCommand> = [
  {
    command: "runelite",
    message: "Enabling the XP Updater plugin on Runelite is an easy, reliable way to keep your Wise Old Man profile up to date.",
    image: "https://imgur.com/tv0Jro8",
    public: true
  },
  {
    command: "sync",
    message: "The Wise Old Man plugin makes managing groups easy. With just a few clicks, group leaders can synchronize their clan list with their Wise Old Man group. Syncing cross references your clan members with your WOM group, then gives you the option to either add new members or overwrite the whole group.\nTo use this feature, make sure you have your plugin configured correctly. Check the “Sync Clan Button” box, enter your group number (ID), and your group’s verification code. **The sync button will not appear if your group number and verification code are incorrect.**\n**Example:** https://imgur.com/STTVZ6S",
    image: "https://imgur.com/5KY526c",
    public: true
  },
  {
    command: "verified",
    message: "To verify your group, please privately message any Moderator (sethmare#1280, Boom#0675, or Psikoi#4925) with a screenshot to prove ownership. We have attached an example of what we need to see below. The screenshot must contain:\n\n- Your WOM group number, Discord ID, and today’s date typed into your in-game chatbox.\n- Your Clan tab open showing your rank. **For clans, you must be Owner or Deputy Owner to verify the group.** For the old clan chat, you must be Owner or General(gold star).\n\nAfter verification is complete, we can reset the verification code for you if needed.\n**Example:**",
    image: "https://imgur.com/ULvoPlH",
    public: false
  },
  {
    command: "permissions",
    message: "Is the bot not responding, or saying 'missing permissions'? Check out this guide: <https://github.com/wise-old-man/wise-old-man/wiki/User-Guide:-How-To-Configure-The-Bot%27s-Required-Permissions>",
    public: false
  },
  {
    command: "faq",
    message: "We are currently working on a FAQ for your most common questions. For now, please ask us in our support server here: https://discord.gg/599UrJ2VNe",
    public: true
  },
  {
    command: "flag",
    message: "**How to give your profile a country flag:**\n**Step 1-** Join our discord server: https://discord.gg/kJPakrJ2kW\n**Step 2-** Make sure you are in the `#change-flag` channel\n**Step 3-** Use the command `!setflag {username} {country_code / flag_emoji}`, replacing the brackets with your information\n**Examples:**\n- !setflag Psikoi PT\n- !setflag Zulu 🇺🇸\n\nFor a full list of supported country codes please see: <https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2>",
    public: true
  }
]
