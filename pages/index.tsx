import React, { ChangeEvent, FormEvent, PropsWithChildren, useReducer, useState } from "react";
import io from "socket.io-client";
import { GetStaticProps } from "next";

type IndexStaticProps = Record<string, never>;

const Index: React.FC<IndexStaticProps> = (
  props: PropsWithChildren<IndexStaticProps>,
): React.ReactElement => {
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const [input, setInput] = useState<string>("");
  const [state, addMessage] = useReducer(
    (state: { messages: Array<string> }, message: string) => {
      state.messages.push(message);
      return { ...state };
    },
    { messages: Array(0) },
  );

  if (socket == null) {
    const _socket = io.connect({
      secure: true,
      reconnection: true,
      rejectUnauthorized: false,
      transports: ["websocket"],
      autoConnect: true,
    });

    _socket.on("chat message", addMessage);
    _socket.on("connect_error", (error: unknown) => {
      console.log(error);
    });

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
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          socket?.emit("chat message", input);
          setInput("");
          return false;
        }}
      >
        <input
          value={input}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
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

export default Index;

export const getStaticProps: GetStaticProps<IndexStaticProps> = async () => {
  return {
    props: {},
  };
};
