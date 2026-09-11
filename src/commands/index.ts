import { Telegraf } from "telegraf";
import { commandJobs } from "./jobs.js";
import { commandStart } from "./start.js";
import { commandHelp } from "./help.js";

export function registerCommands(bot: Telegraf){
    bot.command("jobs", commandJobs);
    bot.command("start", commandStart);
    bot.command("help", commandHelp);
}