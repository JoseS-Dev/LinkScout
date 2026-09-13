import { Telegraf } from "telegraf";
import { handlePagination } from "./handlerPagination.js";
import { commandFavorites, handleFavorite } from "./handlerFavorite.js";
import { commandJobs } from "./jobs.js";
import { commandStart } from "./start.js";
import { commandHelp } from "./help.js";

export function registerCommands(bot: Telegraf){
    bot.command("jobs", commandJobs);
    bot.command("start", commandStart);
    bot.command("favorites", commandFavorites);
    bot.command("help", commandHelp);

    bot.action(/^page:.+/, handlePagination);
    bot.action(/^fav:.+/, handleFavorite);
}