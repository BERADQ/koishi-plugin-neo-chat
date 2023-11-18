import { Context, Schema, Session } from "koishi";
export const name = "neo-chat";
export const inject = { require: ["neochat"] };

export interface Config {
  Manner: {
    isolated: boolean;
    temperature: number;
  };
}

export const Config: Schema<Config> = Schema.object({
  Manner: Schema.object({
    isolated: Schema.boolean().default(true).description("隔离上下文"),
    temperature: Schema.number().default(0.8).description("温度"),
  }),
});

export function apply(ctx: Context, config: Config) {
  const { Manner } = config;
  const global_chain: Message[] = [];
  const local_chain: { [key: string]: Message[] } = {};
  const default_chat = async (
    session: Session,
    message: Message
  ): Promise<Message> => {
    let res_msg: Message = { role: "assistant", content: "NONE" };
    if (Manner.isolated) {
      typeof local_chain[session.cid] == "object"
        ? void 0
        : (local_chain[session.cid] = []);
      local_chain[session.cid].push(message);
      res_msg = await ctx.neochat.chat(
        local_chain[session.cid],
        Manner.temperature,
        "gpt-3.5-turbo-16k"
      );
      local_chain[session.cid].push(res_msg);
    } else {
      global_chain.push(message);
      res_msg = await ctx.neochat.chat(
        global_chain,
        Manner.temperature,
        "gpt-3.5-turbo-16k"
      );
      global_chain.push(res_msg);
    }
    return res_msg;
  };
  ctx
    .command("chat <content:text>", "与ai对话")
    .alias("nh")
    .action(async (s, content) => {
      return (await default_chat(s.session, { role: "user", content })).content;
    });
}

declare interface Message {
  content: string;
  role: "user" | "system" | "assistant";
}
