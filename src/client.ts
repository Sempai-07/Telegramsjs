import { Api } from "./api";
import { isRegExp } from "node:util";
import { Context } from "./core/context";
import type { ReadStream } from "node:fs";
import type { TlsOptions } from "node:tls";
import type { Buffer } from "node:buffer";
import type { RequestInit } from "node-fetch";
import { Webhook, Polling } from "./core/client/";
import type { MethodParameters } from "./core/types";
import type { ISearchResult } from "./core/structures/";
import type { ServerResponse, RequestListener } from "node:http";
import { TelegramTypeError, DefaultParameters } from "./core/util";
import { type EventKeysFunctions, EventAvaliableUpdates } from "./core/events";
import type {
  Update,
  Message,
  UserFromGetMe,
  ReactionTypeEmoji,
} from "@telegram.ts/types";

type ContextHandler = (Update["channel_post"] | Update["message"]) & Context;

interface ILoginOptions {
  polling?: {
    offset?: number;
    limit?: number;
    timeout?: number;
    allowed_updates?: MethodParameters["setWebhook"]["allowed_updates"];
    drop_pending_updates?: boolean;
  };
  webhook?: {
    url: string;
    port?: number;
    host?: string;
    path?: string;
    certificate?: Buffer | ReadStream | string;
    ip_address?: string;
    max_connections?: number;
    tlsOptions?: TlsOptions;
    requestCallback?: RequestListener;
    allowed_updates?: MethodParameters["setWebhook"]["allowed_updates"];
    drop_pending_updates?: boolean;
    secret_token?: string;
  };
}

class TelegramBot extends Api {
  webhook?: Webhook;
  polling?: Polling;
  botInfo: UserFromGetMe = {} as UserFromGetMe;

  constructor(authToken: string, requestOptions?: RequestInit) {
    if (!authToken) {
      throw new TelegramTypeError(
        "Specify a token to receive updates from Telegram",
      );
    }
    super(authToken, requestOptions);
  }

  command(
    name: string | string[] | RegExp,
    callback: (
      ctx: Update["message"] &
        Message.TextMessage &
        Context & {
          args: string[];
          command: string;
          payload: string;
        },
    ) => void,
  ) {
    this.on("message:text", async (ctx) => {
      const cmdMessage = ctx.entities.botCommand;
      const cmdName =
        cmdMessage.length > 0 &&
        cmdMessage[0].index === 0 &&
        cmdMessage[0].search;
      if (typeof cmdName !== "string" || cmdName === "") return;

      const callbackContext = Object.assign(ctx, {
        args: ctx.text.split(/\s+/).slice(1),
        command: cmdName,
        payload: ctx.text.split(/\s+/).join(" "),
      });

      if (
        typeof name === "string" &&
        (cmdName === `/${name}` ||
          cmdName === `/${name}@${this.botInfo.username}`)
      ) {
        await callback(callbackContext);
      } else if (Array.isArray(name)) {
        if (
          name.some(
            (commandName) =>
              cmdName === `/${commandName}` ||
              cmdName === `/${commandName}@${this.botInfo.username}`,
          )
        ) {
          await callback(callbackContext);
        }
      } else if (isRegExp(name)) {
        if (name.test(cmdName)) {
          await callback(callbackContext);
        }
      }
    });
    return this;
  }

  action(
    name: string | string[] | RegExp,
    callback: (
      ctx: Update["callback_query"] & { data: string } & Context,
    ) => void,
  ) {
    this.on("callback_query:data", async (ctx) => {
      if (typeof name === "string" && ctx.data === name) {
        await callback(ctx);
      } else if (Array.isArray(name)) {
        if (name.some((actionData) => ctx.data === actionData)) {
          await callback(ctx);
        }
      } else if (isRegExp(name)) {
        if (name.test(ctx.data)) {
          await callback(ctx);
        }
      }
    });
    return this;
  }

  reaction(
    reactions: ReactionTypeEmoji["emoji"] | ReactionTypeEmoji["emoji"][],
    callback: (reaction: Update["message_reaction"] & Context) => void,
    reactionType: "all" | "newReaction" | "oldReaction" = "all",
  ) {
    this.on("message_reaction", async (reaction) => {
      const newReactionIndex = reaction.reactions.emojiAdded.findIndex(
        (added) => {
          if (typeof reactions === "string") {
            return added.includes(reactions);
          } else if (Array.isArray(reactions)) {
            return reactions.some((emoji) => added.includes(emoji));
          }
        },
      );
      const oldReactionIndex = reaction.reactions.emojiRemoved.findIndex(
        (remove) => {
          if (typeof reactions === "string") {
            return remove.includes(reactions);
          } else if (Array.isArray(reactions)) {
            return reactions.some((emoji) => remove.includes(emoji));
          }
        },
      );

      if (reactionType === "newReaction" && newReactionIndex !== -1) {
        await callback(reaction);
      } else if (reactionType === "oldReaction" && oldReactionIndex !== -1) {
        await callback(reaction);
      } else if (
        reactionType === "all" &&
        (newReactionIndex !== 1 || oldReactionIndex !== -1)
      ) {
        await callback(reaction);
      }
    });
    return this;
  }

  hears(
    text: string | string[] | RegExp,
    callback: (
      message: Update["message"] & Message.TextMessage & Context,
      args: string[],
    ) => void,
  ) {
    this.on("message:text", async (ctx) => {
      const content = ctx.text;
      const args = content.split(/\s+/);

      if (typeof name === "string" && ctx.text.includes(name)) {
        await callback(ctx, args);
      } else if (Array.isArray(name)) {
        if (name.some((search) => ctx.text.includes(search))) {
          await callback(ctx, args);
        }
      } else if (isRegExp(name)) {
        if (name.test(ctx.text)) {
          await callback(ctx, args);
        }
      }
    });
    return this;
  }

  gameQuery(
    game: string | string[] | RegExp,
    callback: (
      gameQuery: Update["callback_query"] & {
        game_short_name: string;
      } & Context,
    ) => void,
  ) {
    this.on("callback_query", async (ctx) => {
      if (!ctx.game_short_name) return;
      const gameShortName = ctx.game_short_name;
      const callbackQueryGame = Object.assign(ctx, {
        game_short_name: gameShortName,
      });

      if (typeof name === "string" && gameShortName.includes(name)) {
        await callback(callbackQueryGame);
      } else if (Array.isArray(name)) {
        if (name.some((game) => gameShortName.includes(game))) {
          await callback(callbackQueryGame);
        }
      } else if (isRegExp(name)) {
        if (name.test(gameShortName)) {
          await callback(callbackQueryGame);
        }
      }
    });
    return this;
  }

  inlineQuery(
    text: string | string[] | RegExp,
    callback: (inlineQuery: Update["inline_query"] & Context) => void,
  ) {
    this.on("inline_query", async (ctx) => {
      if (typeof name === "string" && ctx.query.includes(name)) {
        await callback(ctx);
      } else if (Array.isArray(name)) {
        if (name.some((search) => ctx.query.includes(search))) {
          await callback(ctx);
        }
      } else if (isRegExp(name)) {
        if (name.test(ctx.query)) {
          await callback(ctx);
        }
      }
    });
    return this;
  }

  start(
    callback: (ctx: Update["message"] & Message.TextMessage & Context) => void,
  ) {
    this.on("message:text", async (ctx) => {
      const [cmd] = ctx.text.split(/\s+/);
      if (!["/start", `/start@${this.botInfo.username}`].includes(cmd)) return;
      await callback(ctx);
    });
  }

  help(
    callback: (ctx: Update["message"] & Message.TextMessage & Context) => void,
  ) {
    this.on("message:text", async (ctx) => {
      const [cmd] = ctx.text.split(/\s+/);
      if (!["/help", `/help@${this.botInfo.username}`].includes(cmd)) return;
      await callback(ctx);
    });
  }

  settings(
    callback: (ctx: Update["message"] & Message.TextMessage & Context) => void,
  ) {
    this.on("message:text", async (ctx) => {
      const [cmd] = ctx.text.split(/\s+/);
      if (!["/settings", `/settings@${this.botInfo.username}`].includes(cmd))
        return;
      await callback(ctx);
    });
  }

  textLink(
    link: string | string[] | RegExp,
    callback: (ctx: ContextHandler) => void,
  ) {
    const textLinkHandler = async (ctx: ContextHandler) => {
      await this.handleText(ctx, ctx.entities.url, link, callback);
    };
    this.on("message", textLinkHandler);
    this.on("channel_post", textLinkHandler);
  }

  textMention(
    mention: string | string[] | RegExp,
    callback: (ctx: ContextHandler) => void,
  ) {
    const textMentionHandler = async (ctx: ContextHandler) => {
      await this.handleText(ctx, ctx.entities.mention, mention, callback);
    };
    this.on("message", textMentionHandler);
    this.on("channel_post", textMentionHandler);
  }

  textEmail(
    email: string | string[] | RegExp,
    callback: (ctx: ContextHandler) => void,
  ) {
    const textEmailHandler = async (ctx: ContextHandler) => {
      await this.handleText(ctx, ctx.entities.email, email, callback);
    };
    this.on("message", textEmailHandler);
    this.on("channel_post", textEmailHandler);
  }

  textHashtag(
    hashtag: string | string[] | RegExp,
    callback: (ctx: ContextHandler) => void,
  ) {
    const textHashtagHandler = async (ctx: ContextHandler) => {
      await this.handleText(ctx, ctx.entities.hashtag, hashtag, callback);
    };
    this.on("message", textHashtagHandler);
    this.on("channel_post", textHashtagHandler);
  }

  textCashtag(
    cashtag: string | string[] | RegExp,
    callback: (ctx: ContextHandler) => void,
  ) {
    const textCashtagHandler = async (ctx: ContextHandler) => {
      await this.handleText(ctx, ctx.entities.cashtag, cashtag, callback);
    };
    this.on("message", textCashtagHandler);
    this.on("channel_post", textCashtagHandler);
  }

  textPhoneNumber(
    phoneNumber: string | string[] | RegExp,
    callback: (ctx: ContextHandler) => void,
  ) {
    const textPhoneNumberHandler = async (ctx: ContextHandler) => {
      await this.handleText(
        ctx,
        ctx.entities.phoneNumber,
        phoneNumber,
        callback,
      );
    };
    this.on("message", textPhoneNumberHandler);
    this.on("channel_post", textPhoneNumberHandler);
  }

  disconnect(reason?: string) {
    this.polling?.close();
    this.webhook?.close();
    this.emit("disconnect", Object.assign(this, { reason }));
  }

  async login(options: ILoginOptions = { polling: DefaultParameters }) {
    try {
      const botInfo = await this.getMe();
      this.emit("ready", botInfo);
      this.botInfo = botInfo;
    } catch (err) {
      throw err;
    }
    if (options.polling) {
      this.polling = new Polling(this, options.polling);
      await this.deleteWebhook(options.polling?.drop_pending_updates);
      await this.polling.startPolling();
      return;
    }
    if (options.webhook) {
      this.webhook = new Webhook(
        this,
        options.webhook.path,
        options.webhook.secret_token,
      );
      await this.setWebhook(options.webhook);
      await this.webhook.startWebhook({
        port: options.webhook.port,
        host: options.webhook.host,
        tlsOptions: options.webhook.tlsOptions,
        requestCallback: options.webhook.requestCallback,
      });
      return;
    }
  }

  private async handleText(
    ctx: ContextHandler,
    entities: ISearchResult[],
    target: string | string[] | RegExp,
    callback: (ctx: ContextHandler) => void,
  ) {
    if (!entities || entities.length === 0) return;

    const targets = Array.isArray(target) ? target : [target];
    const searches = entities.map((entity) => entity.search);

    if (typeof target === "string") {
      if (!searches.some((search) => search === target)) return;
    } else if (Array.isArray(target)) {
      if (!target.some((t) => searches.find((s) => s === t))) return;
    } else if (isRegExp(target)) {
      if (!searches.some((search) => target.test(search))) return;
    }

    await callback(ctx);
  }
}

export { TelegramBot, ILoginOptions, ContextHandler };
