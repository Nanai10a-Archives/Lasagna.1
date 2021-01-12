import React from "react";
import * as Next from "next";
import io from "socket.io-client";

type IndexStaticProps = Record<string, never>;

const Index: React.FC<IndexStaticProps> = (): React.ReactElement => {
  const [socket, setSocket] = React.useState<SocketIOClient.Socket | null>(null);
  const [input, setInput] = React.useState<string>("");
  const [state, addMessage] = React.useReducer(
    (state: { messages: Array<string> }, message: string) => {
      state.messages.push(message);
      return { ...state };
    },
    { messages: Array(0) },
  );

  if (socket == null) {
    const _socket = io.connect("wss://localhost.nanai10a.net:3000", {
      secure: true,
      reconnection: true,
      rejectUnauthorized: false,
      transports: ["websocket"],
      autoConnect: false,
    });

    _socket.on("connect", () => console.log("connected!"));
    _socket.on("chat message", addMessage);
    _socket.on("connect_error", console.error);

    _socket.connect();

    setSocket(_socket);
  }

  return (
    <>
      <h1>Socket.IO chat</h1>
      <ul>
        {state.messages.map((value, index) => {
          return <li key={index}>{value}</li>;
        })}
      </ul>
      <form
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          socket?.emit("chat message", input);
          setInput("");
          return false;
        }}
      >
        <input
          value={input}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            event.preventDefault();
            setInput(event.target.value);
          }}
          autoComplete="off"
        />
        <button type={"submit"}>Send</button>
      </form>
    </>
  );
};

// noinspection JSUnusedGlobalSymbols
export default Index;

// noinspection JSUnusedGlobalSymbols
export const getStaticProps: Next.GetStaticProps<IndexStaticProps> = async () => {
  return {
    props: {},
  };
};
