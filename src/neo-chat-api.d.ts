declare module "koishi" {
  interface Context {
    neochat: NeoChat;
  }
}
declare interface NeoChat {
  chat(
    messages: Message[],
    temperature: number,
    model: "gpt-3.5-turbo-16k" | "gpt-3.5-turbo"
  ): Promise<Message>;
}
declare interface Message {
  content: string;
  role: "user" | "system" | "assistant";
}
export {};
