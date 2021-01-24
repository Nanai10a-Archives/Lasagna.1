import React from "react";
import * as Next from "next";
import io from "socket.io-client";

type IndexStaticProps = Record<string, never>;

const Index: React.FC<IndexStaticProps> = (): React.ReactElement => {
  const [socket, setSocket] = React.useState<SocketIOClient.Socket | null>(null);
  const [peer, setPeer] = React.useState<RTCPeerConnection | null>(null);
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

  if (peer == null && typeof navigator != "undefined") {
    setPeer(
      new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      }),
    );
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
      <RTCComponent />
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
