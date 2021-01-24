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
      <Comp />
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

type RTCComponentState = {
  receiveSdp: string;
  sendSdp: string;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  requested: boolean;
  peer: RTCPeerConnection | null;
};

class RTCComponent extends React.Component<Record<string, never>, RTCComponentState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      localStream: null,
      remoteStream: null,
      receiveSdp: "",
      sendSdp: "",
      requested: false,
      peer: null,
    };
  }

  render() {
    return (
      <>
        <div>
          localStart!
          <button
            onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();

              this.setState({
                localStream: await navigator.mediaDevices.getUserMedia({ audio: true }),
              });
            }}
          >
            submit! (1)
          </button>
        </div>
        <div>
          offer!
          <button
            onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();

              await this.sendOffer();
            }}
          >
            submit! (2)
          </button>
        </div>
        <div>
          receiveSdp
          <br />
          <textarea
            rows={10}
            cols={100}
            value={this.state.receiveSdp}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              e.preventDefault();
              this.setState({ receiveSdp: e.target.value });
            }}
          />
          <button
            onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();

              await this.onSdp();
            }}
          >
            submit! (3)
          </button>
        </div>
        <div>
          sendSdp
          <br />
          <textarea
            rows={10}
            cols={100}
            value={this.state.sendSdp}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              e.preventDefault();
              this.setState({ sendSdp: e.target.value });
            }}
          />
        </div>

        <div>
          remote
          <br />
          {this.state.remoteStream == null ? (
            <></>
          ) : (
            <audio
              autoPlay
              controls
              ref={(element: HTMLAudioElement | null) => {
                if (element) {
                  element.srcObject = this.state.remoteStream;
                }
              }}
            />
          )}
        </div>
        <div>
          local
          <br />
          {this.state.localStream == null ? (
            <></>
          ) : (
            <audio
              autoPlay
              controls
              muted
              ref={(element: HTMLAudioElement | null) => {
                if (element) {
                  element.srcObject = this.state.localStream;
                }
              }}
            />
          )}
        </div>
      </>
    );
  }

  sendOffer = async () => {
    if (typeof window == "undefined") return alert("oh");

    const peer = this.createPeer();

    this.setState({ requested: true });

    await peer.setLocalDescription(await peer.createOffer());

    this.setState({
      sendSdp: peer.localDescription?.sdp ?? "",
      peer: peer,
    });
  };

  onSdp = async () => {
    if (this.state.requested) {
      const remoteAnswer = new RTCSessionDescription({
        type: "answer",
        sdp: this.state.receiveSdp,
      });

      await this.state.peer?.setRemoteDescription(remoteAnswer);
    } else {
      const remoteOffer = new RTCSessionDescription({
        type: "offer",
        sdp: this.state.receiveSdp,
      });

      const peer = this.createPeer();

      await peer.setRemoteDescription(remoteOffer);

      await peer.setLocalDescription(await peer.createAnswer());
    }
  };

  createPeer = (): RTCPeerConnection => {
    const peer = new RTCPeerConnection();

    peer.ontrack = (e: RTCTrackEvent) => {
      console.log(e.streams);
      this.setState({ remoteStream: e.streams[0] ?? null });
    };

    peer.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (e.candidate == null) {
        console.log("ok candidate");
        this.setState({ sendSdp: peer.localDescription?.sdp ?? "" });
      }
    };

    this.state.localStream?.getTracks().forEach((track) => {
      peer.addTrack(track, this.state.localStream as MediaStream);
    });

    return peer;
  };
}

type CompState = {
  socket: Socket;
  localId: string;
  remoteId: string;
};

class Comp extends React.Component<Record<string, never>, RTCComponentState & CompState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      localId: "",
      remoteId: "",
      socket: new Socket({
        request: this.request,
        offer: this.offer,
        answer: this.answer,
        close: this.close,
      }),
      localStream: null,
      remoteStream: null,
      receiveSdp: "",
      sendSdp: "",
      requested: false,
      peer: null,
    };

    this.state.socket.connect((id) => {
      this.setState({ localId: id });
    });

    if (typeof navigator !== "undefined")
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream: MediaStream) => {
        this.setState({ localStream: stream });
      });
  }

  render() {
    return (
      <>
        <div>
          receiveSdp
          <br />
          <textarea
            rows={10}
            cols={100}
            value={this.state.receiveSdp}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              e.preventDefault();
              this.setState({ receiveSdp: e.target.value });
            }}
          />
        </div>
        <div>
          sendSdp
          <br />
          <textarea
            rows={10}
            cols={100}
            value={this.state.sendSdp}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              e.preventDefault();
              this.setState({ sendSdp: e.target.value });
            }}
          />
        </div>

        <div>
          remote
          <br />
          {this.state.remoteStream == null ? (
            <></>
          ) : (
            <audio
              autoPlay
              controls
              ref={(element: HTMLAudioElement | null) => {
                if (element) {
                  element.srcObject = this.state.remoteStream;
                }
              }}
            />
          )}
        </div>
        <div>
          local
          <br />
          {this.state.localStream == null ? (
            <></>
          ) : (
            <audio
              autoPlay
              controls
              muted
              ref={(element: HTMLAudioElement | null) => {
                if (element) {
                  element.srcObject = this.state.localStream;
                }
              }}
            />
          )}
        </div>
        <div>
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              this.state.socket.request(this.state.remoteId, { fromSendId: this.state.localId });
            }}
          >
            !auto-signaling connect!
          </button>
        </div>

        {/* --- inputs --- */}

        <input
          value={this.state.remoteId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            this.setState({ remoteId: e.target.value });
          }}
        />
        <div>localId: {this.state.localId}</div>
      </>
    );
  }

  private request = (info: RequestInfo): void => {
    this.setState({ remoteId: info.fromSendId });

    const peer = this.createPeer();

    this.setState({ requested: true });

    peer
      .createOffer()
      .then((offer: RTCSessionDescriptionInit) => {
        return peer.setLocalDescription(offer);
      })
      .then(() => {
        this.setState({
          peer: peer,
        });

        peer.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
          if (e.candidate == null) {
            console.log("ok candidate");
            const sdp = peer.localDescription?.sdp ?? "";
            this.setState({ sendSdp: sdp });

            this.state.socket.offer(this.state.remoteId, {
              fromSendId: this.state.localId,
              sdp: sdp,
            });
          }
        };
      });
  };

  private offer = (info: OfferInfo): void => {
    this.setState({ remoteId: info.fromSendId, receiveSdp: info.sdp });

    const remoteOffer = new RTCSessionDescription({
      type: "offer",
      sdp: this.state.receiveSdp,
    });

    const peer = this.createPeer();

    peer
      .setRemoteDescription(remoteOffer)
      .then(() => {
        return peer.createAnswer();
      })
      .then((answer: RTCSessionDescriptionInit) => {
        return peer.setLocalDescription(answer);
      })
      .then(() => {
        this.setState({
          peer: peer,
        });

        peer.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
          if (e.candidate == null) {
            console.log("ok candidate");
            const sdp = peer.localDescription?.sdp ?? "";
            this.setState({ sendSdp: sdp });

            this.state.socket.answer(this.state.remoteId, {
              fromSendId: this.state.localId,
              sdp: sdp,
            });
          }
        };
      });
  };

  private answer = (info: AnswerInfo): void => {
    this.setState({ remoteId: info.fromSendId, receiveSdp: info.sdp });
    if (this.state.peer == null) throw Error("");

    const remoteAnswer = new RTCSessionDescription({
      type: "answer",
      sdp: this.state.receiveSdp,
    });

    this.state.peer.setRemoteDescription(remoteAnswer).then(() => {
      console.log("signaling complete.");
    });
  };

  private close = (info: CloseInfo): void => {
    this.setState({ remoteId: info.fromSendId });
  };

  private createPeer = (): RTCPeerConnection => {
    if (typeof window == "undefined") throw Error("window is undefined, isn't this place browser?");

    const peer = new RTCPeerConnection();

    peer.ontrack = (e: RTCTrackEvent) => {
      this.setState({ remoteStream: e.streams[0] ?? null });
    };

    this.state.localStream?.getTracks().forEach((track) => {
      peer.addTrack(track, this.state.localStream as MediaStream);
    });

    return peer;
  };
}

class Socket {
  private socket: SocketIOClient.Socket;
  constructor(eventHandlers: SocketEventHandlers) {
    const socket = io.connect("wss://localhost.nanai10a.net:3000", {
      secure: true,
      reconnection: true,
      rejectUnauthorized: false,
      transports: ["websocket"],
      autoConnect: false,
    });

    // FIXME: logging制定しましょう : socket.on("connect", () => console.log("connected!"));
    socket.on("connect_error", console.error);

    socket.connect();

    this.socket = socket;
    this.init(eventHandlers);
  }

  connect = (callback: (id: string) => void) => {
    this.socket.emit("signaling_connect", callback);
  };

  exists = (callback: (isExists: boolean) => void) => {
    this.socket.emit("signaling_exists", callback);
  };

  request = (targetId: string, info: RequestInfo) => {
    this.socket.emit("signaling_request", targetId, JSON.stringify(info));
  };

  offer = (targetId: string, info: OfferInfo) => {
    this.socket.emit("signaling_offer", targetId, JSON.stringify(info));
  };

  answer = (targetId: string, info: AnswerInfo) => {
    this.socket.emit("signaling_answer", targetId, JSON.stringify(info));
  };

  close = (targetId: string, info: CloseInfo) => {
    this.socket.emit("signaling_close", targetId, JSON.stringify(info));
  };

  private init = (eventHandlers: SocketEventHandlers) => {
    this.socket.on("signaling_request", (rawInfo: string) =>
      eventHandlers.request(JSON.parse(rawInfo)),
    );

    this.socket.on("signaling_offer", (rawInfo: string) =>
      eventHandlers.offer(JSON.parse(rawInfo)),
    );

    this.socket.on("signaling_answer", (rawInfo: string) =>
      eventHandlers.answer(JSON.parse(rawInfo)),
    );

    this.socket.on("signaling_close", (rawInfo: string) =>
      eventHandlers.close(JSON.parse(rawInfo)),
    );
  };
}

type RequestInfo = {
  fromSendId: string;
};

type OfferInfo = {
  fromSendId: string;
  sdp: string;
};

type AnswerInfo = {
  fromSendId: string;
  sdp: string;
};

type CloseInfo = {
  fromSendId: string;
};

type SocketEventHandlers = {
  request: (info: RequestInfo) => void;
  offer: (info: OfferInfo) => void;
  answer: (info: AnswerInfo) => void;
  close: (info: CloseInfo) => void;
};
