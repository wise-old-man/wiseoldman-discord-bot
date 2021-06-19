import { CustomCommand } from '../types';

export const customCommands: Array<CustomCommand> = [
  {
    command: "runelite",
    message: "Enabling the XP Updater plugin on Runelite is an easy, reliable way to keep your Wise Old Man profile up to date.",
    image: "https://imgur.com/tv0Jro8"
  },
  {
    command: "verified",
    message: "To verify your group, please DM any Mod/Admin with a screenshot to prove ownership. We have attached an example screenshot below. This must contain:\n\n- Your WOM group number, Discord name, and today’s date typed in the chatbox.\n- The Clan tab open showing your rank. **For clans, you must be Owner or Deputy Owner to verify the group.** For the old clan chat, you must be Owner or General(gold star).\n\nAfter verification is complete, we can reset the verification code for you if needed",
    image: "https://imgur.com/ULvoPlH"
  },
  {
    command: "permissions",
    message: "Is the bot not responding, or saying 'missing permissions'? Check out this guide: <https://github.com/wise-old-man/wise-old-man/wiki/User-Guide:-How-To-Configure-The-Bot%27s-Required-Permissions>"
  },
  {
    command: "faq",
    message: "We are currently working on a FAQ for your most common questions. For now, please ask us in our support server here: https://discord.gg/599UrJ2VNe"
  },
  {
    command: "flag",
    message: "**How to give your profile a country flag:**\n**Step 1-** Join our discord server: https://discord.gg/kJPakrJ2kW\n**Step 2-** Make sure you are in the `#change-flag` channel\n**Step 3-** Use the command `!setflag {username} {country_code / flag_emoji}`, replacing the brackets with your information\n**Examples:**\n- !setflag Psikoi PT\n- !setflag Zulu 🇺🇸\n\nFor a full list of supported country codes please see: <https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2>"
  }
]
