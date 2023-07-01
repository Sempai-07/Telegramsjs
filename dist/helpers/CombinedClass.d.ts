import { TelegramBot } from "../TelegramBot";
type ResponseApi = {
    update_id?: number;
    message_id?: number;
    message?: object;
    chat?: object;
    from?: object;
    edited_message?: object;
    channel_post?: object;
    edited_channel_post?: object;
    inline_query?: object;
    chosen_inline_result?: object;
    callback_query?: object;
    shipping_query?: object;
    pre_checkout_query?: object;
    poll?: object;
    poll_answer?: object;
    my_chat_member?: object;
    chat_member?: object;
    chat_join_request?: object;
    pinned_message?: object;
    sender_chat?: object;
};
type botInfo = {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
    setCommands: Function;
    getCommands: Function;
    deleteCommands: Function;
    setDescription: Function;
    getDescription: Function;
    setShortDescription: Function;
    getShortDescription: Function;
    getName: Function;
    setName: Function;
};
declare class CombinedClass {
    bot: TelegramBot;
    updates: ResponseApi;
    botInfo?: botInfo;
    constructor(bot: TelegramBot, botInfo?: botInfo);
    get me(): string | undefined;
    get message(): object | undefined;
    get messageId(): number | undefined;
    get editedMessage(): object | undefined;
    get inlineQuery(): object | undefined;
    get shippingQuery(): object | undefined;
    get preCheckoutQuery(): object | undefined;
    get chosenInlineResult(): object | undefined;
    get channelPost(): object | undefined;
    get editedChannelPost(): object | undefined;
    get callbackQuery(): object | undefined;
    get poll(): object | undefined;
    get pollAnswer(): object | undefined;
    get myChatMember(): object | undefined;
    get chatMember(): object | undefined;
    get chatJoinRequest(): object | undefined;
    get chat(): any;
    get senderChat(): object | undefined;
    reply(text: string, args?: {
        replyMarkup?: any;
        allowReply?: boolean;
        notification?: boolean;
        content?: boolean | undefined;
        threadId?: number;
        parseMode?: string;
    }): Promise<object | undefined>;
    send(text: string, args?: {
        replyMarkup?: any;
        allowReply?: boolean;
        notification?: boolean;
        content?: boolean | undefined;
        replyToMessageId?: number;
        threadId?: number;
        parseMode?: string;
    }): Promise<object | undefined>;
    leave(): Promise<object | undefined>;
    processUpdate(): Promise<void>;
}
export { CombinedClass };
//# sourceMappingURL=CombinedClass.d.ts.map