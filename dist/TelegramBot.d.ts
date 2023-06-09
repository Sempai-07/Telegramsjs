import { BaseClient } from "./BaseClient";
import { CombinedClass } from "./helpers/CombinedClass";
import type { CallbackQuery, Message } from "@telegram.ts/types";
/**
 * A class representing a Telegram Bot client.
 * @extends BaseClient
 */
export declare class TelegramBot<F> extends BaseClient<F> {
    token: string;
    intents: string[] | number[] | null;
    offSetType?: any;
    baseUrl: string;
    updatesProcess?: CombinedClass<F>;
    /**
     * Creates a new TelegramBot client.
     * @param {string} token - The Telegram Bot API token.
     * @param {Object} [options] - The client options.
     * @param {string | array | number} [options.intents] - The client intents.
     * @param {string} [options.parseMode] - The parse mode for message formatting.
     * @param {string | number} [options.chatId] - The default chat ID for sending messages.
     * @param {string} [options.queryString] - The default query string for API requests.
     * @param {string | object} [options.offSetType] - The type of offset to use for updates.
     */
    constructor(token: string, options?: {
        intents?: readonly string[] | number[] | null;
    });
    /**
     * Defines a command handler.
     * @param {string | string[]} command - The command string or an array of command strings.
     * @param {(message: Message.TextMessage, args?: string[]) => void} callback - The callback function to handle the command.
     */
    command(command: string | string[], callback: (message: Message.TextMessage, args?: string[]) => void): void;
    /**
     * Defines an action handler.
     * @param {string | string[]} data - The action data string or an array of action data strings.
     * @param {(callbackQuery: CallbackQuery) => void} callback - The callback function to handle the action.
     * @param {boolean} [answer=false] - Whether to answer the action.
     */
    action(data: string | string[], callback: (callbackQuery: CallbackQuery) => void, answer?: boolean): void;
    /**
     * The function that starts the whole process.
     */
    login(): Promise<void>;
}
//# sourceMappingURL=TelegramBot.d.ts.map