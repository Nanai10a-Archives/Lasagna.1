/* eslint-disable */
const { io } = require("socket.io-client");

const RTCPeerConnection = require("wrtc").RTCPeerConnection;
const RTCSessionDescription = require("wrtc").RTCSessionDescription;
const RTCAudioSource = require("wrtc").nonstandard.RTCAudioSource;
const MediaStream = require("wrtc").MediaStream;

// noinspection DuplicatedCode
class Socket {
  constructor(eventHandlers) {
    this.connect = this.connect.bind(this);
    this.request = this.request.bind(this);
    this.answer = this.answer.bind(this);
    this.offer = this.offer.bind(this);
    this.init = this.init.bind(this);
    this.close = this.close.bind(this);
    this.exists = this.exists.bind(this);


    const socket = io.connect("wss://localhost.nanai10a.net:3000", {
      secure: true,
      reconnection: true,
      rejectUnauthorized: false,
      transports: ["websocket"],
      autoConnect: false
    });

    socket.on("connect", () => console.log("connect!"));
    // FIXME: logging制定しましょう : socket.on("connect", () => console.log("connected!"));
    socket.on("connect_error", (err) => console.error(err));
    socket.on("disconnect", (reason) => {
      console.error("disconnected!");
      console.error(reason);
    });

    socket.connect();

    this.socket = socket;
    this.init(eventHandlers);
  }

  connect(callback) {
    this.socket.emit("signaling_connect", callback);
  };

  exists(callback) {
    this.socket.emit("signaling_exists", callback);
  };

  request(targetId, info) {
    this.socket.emit("signaling_request", targetId, JSON.stringify(info));
  };

  offer(targetId, info) {
    this.socket.emit("signaling_offer", targetId, JSON.stringify(info));
  };

  answer(targetId, info) {
    this.socket.emit("signaling_answer", targetId, JSON.stringify(info));
  };

  close(targetId, info) {
    this.socket.emit("signaling_close", targetId, JSON.stringify(info));
  };

  init(eventHandlers) {
    this.socket.on("signaling_request", (rawInfo) =>
      eventHandlers.request(JSON.parse(rawInfo))
    );

    this.socket.on("signaling_offer", (rawInfo) =>
      eventHandlers.offer(JSON.parse(rawInfo))
    );

    this.socket.on("signaling_answer", (rawInfo) =>
      eventHandlers.answer(JSON.parse(rawInfo))
    );

    this.socket.on("signaling_close", (rawInfo) =>
      eventHandlers.close(JSON.parse(rawInfo))
    );
  };
}

// noinspection DuplicatedCode
class Echo {
  constructor() {
    this.getId = this.getId.bind(this);
    this.setState = this.setState.bind(this);
    this.answer = this.answer.bind(this);
    this.close = this.close.bind(this);
    this.createPeer = this.createPeer.bind(this);
    this.offer = this.offer.bind(this);
    this.request = this.request.bind(this);

    this.state = {
      peer: null,
      remoteId: "",
      localId: "",
      receiveSdp: "",
      sendSdp: "",
      socket: new Socket({
        request: this.request,
        offer: this.offer,
        answer: this.answer,
        close: this.close
      })
    };
  }

  setState(newState) {
    this.state = {
      ...this.state,
      ...newState
    };
  };

  async getId() {
    this.state.socket.connect((id) => {
      this.setState({ localId: id });
    });

    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    return this.state.localId;
  }

  request(info) {
    this.setState({ remoteId: info.fromSendId });

    const peer = this.createPeer();

    this.setState({ requested: true });

    peer
      .createOffer()
      .then((offer) => {
        return peer.setLocalDescription(offer);
      })
      .then(() => {
        this.setState({
          peer: peer
        });

        peer.onicecandidate = (e) => {
          if (e.candidate == null) {
            console.log("ok candidate");
            const sdp = peer.localDescription.sdp;
            this.setState({ sendSdp: sdp });

            this.state.socket.offer(this.state.remoteId, {
              fromSendId: this.state.localId,
              sdp: sdp
            });
          }
        };
      });
  };

  offer(info) {
    this.setState({ remoteId: info.fromSendId, receiveSdp: info.sdp });

    const remoteOffer = new RTCSessionDescription({
      type: "offer",
      sdp: this.state.receiveSdp
    });

    const peer = this.createPeer();

    peer
      .setRemoteDescription(remoteOffer)
      .then(() => {
        return peer.createAnswer();
      })
      .then((answer) => {
        return peer.setLocalDescription(answer);
      })
      .then(() => {
        this.setState({
          peer: peer
        });

        peer.onicecandidate = (e) => {
          if (e.candidate == null) {
            console.log("ok candidate");
            const sdp = peer.localDescription.sdp;
            this.setState({ sendSdp: sdp });

            this.state.socket.answer(this.state.remoteId, {
              fromSendId: this.state.localId,
              sdp: sdp
            });
          }
        };
      });
  };

  answer(info) {
    this.setState({ remoteId: info.fromSendId, receiveSdp: info.sdp });
    if (this.state.peer == null) throw Error("");

    const remoteAnswer = new RTCSessionDescription({
      type: "answer",
      sdp: this.state.receiveSdp
    });

    this.state.peer.setRemoteDescription(remoteAnswer).then(() => {
      console.log("signaling complete.");
    });
  };

  close(info) {
    this.setState({ remoteId: info.fromSendId });
  };

  createPeer() {
    const peer = new RTCPeerConnection();

    const noneSource = new RTCAudioSource();

    const data = {
      sampleRate: 48000,
      bitsPerSample: 16,
      channelCount: 1,
      numberOfFrames: 48000 / 100,
      samples: new Int16Array(48000 / 100),
    };

    noneSource.onData(data);

    const track = noneSource.createTrack();
    const stream = new MediaStream();
    stream.addTrack(track);

    const sender = peer.addTrack(track, stream);

    peer.ontrack = (e) => {
      e.streams.forEach((stream) => {
        stream.getTracks().forEach(async (track) => {
          // peer.addTrack(track, stream);
          await sender.replaceTrack(track);
          console.log("replaced!");
        })
      })
    }

    return peer;
  };

}

module.exports = Echo;
