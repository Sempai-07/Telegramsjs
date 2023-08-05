import { BaseClient } from "./BaseClient";
import { CombinedClass } from "./helpers/CombinedClass";
import { CallbackQuery, Message, Update } from "@telegram.ts/types";
import { Context } from "./Context";
import isRegex from "is-regex";

export class TelegramBot<F = Buffer> extends BaseClient<F> {
  token: string = "";
  intents?: string[] | number[] | number | null;
  baseUrl: string = "";
  processUpdate: (webhook?: Update[] | undefined) => Promise<void>;
  session: any;

  constructor(
    token: string,
    options: {
      intents?: string[] | number[] | number | null;
      session?: any;
    } = {},
  ) {
    super(token, options.intents || null);

    /**
     * The Telegram Bot API token.
     * @type {string}
     */
    this.token = token;

    /**
     * The base URL for the Telegram Bot API.
     * @type {string}
     */
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;

    this.processUpdate = new CombinedClass<F>(this).processUpdate;
  }

  /**
   * Defines a command handler.
   * ```ts
   * // Register a command handler for the "/like" command
   * bot.command("like", (message, args) => {
   *   const username = message.from.first_name;
   *   message.reply(`${username}, wrote like ❤️`);
   * });
   *
   * // Register a command handler for multiple commands: "/like" and "/dislike"
   * bot.command(["like", "dislike"], (message, args) => {
   *   const username = message.from.first_name;
   *   if (args[0] === "like") {
   *     message.reply(`${username}, wrote like ❤️`);
   *   } else if (args[0] === "dislike") {
   *     message.reply(`${username}, wrote on dislike 🫠`);
   *   }
   * });
   *
   * // Register a command handler for the "/dislike" command with interactive answer
   * bot.command("dislike", (message, args) => {
   *   const username = message.from.first_name;
   *   message.reply(`${username}, wrote on dislike 🫠`, true);
   * });
   * ```
   * @param {string | string[]} command - The command string or an array of command strings.
   * @param {(message: (Message.TextMessage & Context<F>), args?: string[]) => void} callback - The callback function to handle the command.
   */
  public command(
    command: string | string[] | RegExp,
    callback: (
      message: Message.TextMessage & Context<F>,
      args?: string[],
    ) => void,
    typeChannel: "private" | "group" | "supergroup" | "channel" | false = false,
  ): void {
    if (typeof command === "string") {
      this.on("message", async (message) => {
        if (typeChannel === message.chat.type || typeChannel === false) {
          const args = message.text.split?.(" ");
          const text = message.text;
          if (text && text.startsWith(`/${command}`)) {
            await callback(message, args);
          }
        }
      });
    } else if (Array.isArray(command)) {
      this.on("message", async (message) => {
        if (typeChannel === message.chat.type || typeChannel === false) {
          const args = message.text.split?.(" ");
          const text = message.text;
          if (text && command.some((cmd) => text.startsWith(`/${cmd}`))) {
            await callback(message, args);
          }
        }
      });
    } else if (isRegex(command)) {
      this.on("message", async (message) => {
        if (typeChannel === message.chat.type || typeChannel === false) {
          const args = message.text.split?.(" ");
          const text = message.text;
          if (text && command.test(text)) {
            await callback(message, args);
          }
        }
      });
    }
  }

  /**
   * Defines an action handler.
   * ```ts
   * // Action allows you to track button click events 'callback_data'
   * bot.action("like", (ctx) => {
   *   const username = ctx.first_name;
   *   ctx.reply(`${username}, clicked like ❤️`);
   * });
   *
   * // Action can track, not only one interaction, but several at once
   * bot.action(["like", "dislike"], (ctx) => {
   *   const username = ctx.first_name;
   *   if (ctx.data === "like") {
   *   ctx.reply(`${username}, clicked like ❤️`);
   *   } else {
   *   ctx.reply(`${username}, clicked on dislike 🫠`);
   *   }
   * });
   *
   * // To answer interactively use the third argument 'answer'
   * bot.action("dislike", (ctx) => {
   *   const username = ctx.first_name;
   *   ctx.reply(`${username}, clicked on dislike 🫠`);
   * }, true);
   * ```
   * @param {string | string[]} data - The action data string or an array of action data strings.
   * @param {(callbackQuery: (CallbackQuery & Context<F>)) => void} callback - The callback function to handle the action.
   * @param {boolean} [answer=false] - Whether to answer the action.
   */
  public action(
    data: string | string[],
    callback: (callbackQuery: CallbackQuery & Context<F>) => void,
    answer: boolean = false,
  ): void {
    if (typeof data === "string") {
      this.on("callback_query", async (ctx) => {
        if (answer) {
          this.answerCallbackQuery({
            callback_query_id: ctx.id,
          }).catch((err) => console.log);
        }
        if (ctx.data === data) {
          await callback(ctx);
        }
      });
    } else if (Array.isArray(data)) {
      this.on("callback_query", async (ctx) => {
        if (answer) {
          this.answerCallbackQuery({
            callback_query_id: ctx.id,
          }).catch((err) => console.log);
        }
        if (data.some((d) => d === ctx.data)) {
          await callback(ctx);
        }
      });
    }
  }

  /**
   * Registers a callback function to be executed when a message is received
   * that includes the specified text.
   * ```ts
   * import { TelegramBot } from "telegramsjs"
   *
   * const bot = new TelegramBot('BOT_TOKEN');
   *
   * bot.hears('hi', (ctx) => ctx.reply('hi!'));
   * bot.hears(['help', 'start'] => ctx.reply('helpers!'))
   *
   * bot.login()
   * ```
   * @param {string | string[]} text - The text to match in the received messages.
   * @param {(message: (Message.TextMessage & Context<F>)) => void} callback - The callback function to be executed when a matching message is received.
   * It receives the matched message object as a parameter.
   * @returns void
   */
  public hears(
    text: string | string[] | RegExp,
    callback: (message: Message.TextMessage & Context<F>) => void,
  ): void {
    this.on("message", async (message: Message.TextMessage & Context<F>) => {
      if (typeof text === "string") {
        if (message.text.includes(text)) {
          await callback(message);
        }
      } else if (Array.isArray(text)) {
        if (text.some((d) => text.includes(d))) {
          await callback(message);
        }
      } else if (isRegex(text)) {
        if (text.test(message.text)) {
          await callback(message);
        }
      }
    });
  }

  public use(session: any): void {
    this.session = session;
  }

  /**
   * The function that starts the whole process.
   * ```ts
   * import { TelegramBot } from "telegramsjs";
   * import { UserFromGetMe } from "@telegram.ts/types";
   *
   * const bot = new TelegramBot('BOT_TOKEN');
   *
   * bot.on('ready', (user: UserFromGetMe) => {
   *  console.log(`Bot ${user.username}`)
   * })
   *
   * bot.login()
   * ```
   */
  public async login(): Promise<void> {
    const updatesProcess = new CombinedClass<F>(this);

    (async () => {
      this.getMe()
        .then((res) => {
          this.emit("ready", res);
        })
        .catch((err) => {
          throw err;
        });
    })();

    await updatesProcess.processUpdate();
  }
}
