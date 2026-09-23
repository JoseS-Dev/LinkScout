import { Telegraf } from "telegraf";
import { handlePagination } from "./handlers/handlerPagination.js";
import { commandFavorites, handleFavorite } from "./handlers/handlerFavorite.js";
import { handleSubscribe, handleCategorySelection } from "./handlers/handlerSubscribe.js";
import { commandJobs } from "./jobs.js";
import { commandStart } from "./start.js";
import { commandHelp } from "./help.js";
import { handleAlert } from "./handlers/handlerAlert.js";

export function registerCommands(bot: Telegraf){
    bot.command("jobs", commandJobs);
    bot.command("start", commandStart);
    bot.command("favorites", commandFavorites);
    bot.command("help", commandHelp);
    bot.command("alert", handleAlert);
    bot.command("subscribe", handleSubscribe);

    bot.action(/^page:.+/, handlePagination);
    bot.action(/^fav:.+/, handleFavorite);
    bot.action(/^subscribe:.+/, handleCategorySelection);
}