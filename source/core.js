//DOM has mounted
document.addEventListener(
  "DOMContentLoaded",
  event => {
    let peer_id, username, conn;

    const peer = new Peer({
    
      
      debug: 3,
      config: {
        iceservers: [
          { url: "stun:stun01.sipphone.com" },
          { url: "stun:stun.ekiga.net" },
          { url: "stun:stun.fwdnet.net" },
          { url: "stun:stun.ideasip.com" },
          { url: "stun:stun.iptel.org" },
          { url: "stun:stun.rixtelecom.se" },
          { url: "stun:stun.schlund.de" },
          { url: "stun:stun.l.google.com:19302" },
          { url: "stun:stun1.l.google.com:19302" },
          { url: "stun:stun2.l.google.com:19302" },
          { url: "stun:stun3.l.google.com:19302" },
          { url: "stun:stun4.l.google.com:19302" },
          { url: "stun:stunserver.org" },
          { url: "stun:stun.softjoys.com" },
          { url: "stun:stun.voiparound.com" },
          { url: "stun:stun.voipbuster.com" },
          { url: "stun:stun.voipstunt.com" },
          { url: "stun:stun.voxgratia.org" },
          { url: "stun:stun.xten.com" },
          {
            url: "turn:numb.viagenie.ca",
            credential: "muazkh",
            username: "webrtc@live.com"
          },
          {
            url: "turn:192.158.29.39:3478?transport=udp",
            credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
            username: "28224511:1379330808"
          },
          {
            url: "turn:192.158.29.39:3478?transport=tcp",
            credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
            username: "28224511:1379330808"
          }
        ]
      }
    });

    //My ID
    peer.on("open", () => {
      document.getElementById("peer-id-label").innerHTML = peer.id;
    });

    //handle peer connection
    peer.on("connection", connection => {
      //update global variables
      conn = connection;
      peer_id = connection.peer;

      conn.on("data", handleMessage);

      document.getElementById("peer-id").className += " hidden";
      document.getElementById("peer_id").value = peer_id;
      document.getElementById("connected_peer").innerHTML =
        connection.metadata.username;
    });

    //handle errors
    peer.on("error", function(err) {
      alert("An error ocurred with peer: " + err);
      console.error(err);
    });

    //handle call events
    peer.on("call", call => {
      const acceptCall = confirm(`${connection.metadata.username} is calling!`);

      if (acceptCall) {
        call.answer(window.localStream);

        //recieve data
        call.on("stream", stream => {
          //global ref. of remote stream
          window.peer_stream = stream;
          onRecieveStream(stream, "peer-camera");
        });

        call.on("close", () => {
          alert("Call has ended");
        });
      } else {
        console.log("call declined!");
      }
    });

    
    /**
     * Handle the providen stream (video and audio) to the desired video element
     *
     * @param {*} stream
     * @param {*} element_id
     */

    const onRecieveStream = (stream, element_id) => {
      const video = document.getElementById(element_id);
      video.src = window.URL.createObjectURL(stream);
      window.peer_stream = stream;
    };

    /**
     * Appends the received and sent message to the listview
     *
     * @param {Object} data
     */

    const handleMessage = data => {
      let orientation = "text-left";

      if (data.from == username) {
        orientation = "text-right";
      }

      let messageHTML =
        '<a href="javascript:void(0);" class="list-group-item' +
        orientation +
        '">';
      messageHTML +=
        '<h4 class="list-group-item-heading">' + data.from + "</h4>";
      messageHTML += '<p class="list-group-item-text">' + data.text + "</p>";
      messageHTML += "</a>";

      document.getElementById("messages").innerHTML += messageHTML;
    };

    /**
     * Handle the send message button
     */
    document.getElementById("send-message").addEventListener(
      "click",
      function() {
        // Get the text to send
        const text = document.getElementById("message").value,
          data = {
            from: username,
            text: text
          };
        conn.send(data);
        handleMessage(data);

        document.getElementById("message").value = "";
      },
      false
    );

    /**
     *  Request a videocall the other user
     */
    document.getElementById("call").addEventListener(
      "click",
      function() {
        console.log("Calling to " + peer_id);
        console.log(peer);

        let call = peer.call(peer_id, window.localStream);

        call.on("stream", function(stream) {
          window.peer_stream = stream;

          onReceiveStream(stream, "peer-camera");
        });
      },
      false
    );

    /**
     * On click the connect button, initialize connection with peer
     */
    document.getElementById("connect-to-peer-btn").addEventListener(
      "click",
      function() {
        username = document.getElementById("name").value;
        peer_id = document.getElementById("peer_id").value;

        if (peer_id) {
          conn = peer.connect(peer_id, {
            metadata: {
              username: username
            }
          });

          conn.on("data", handleMessage);
        } else {
          alert("You need to provide a peer to connect with !");
          return false;
        }

        document.getElementById("chat").className = "";
        document.getElementById("connection-form").className += " hidden";
      },
      false
    );


    const requestLocalVideo = () => {
        navigator.getUserMedia = (
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia
        );

      navigator.mediaDevices.getUserMedia(
        {
          video: true,
          audio: true
        }
      )
      .then((stream)=>{
        window.localStream = stream;
        onReceiveStream(stream, "my-camera");
      }).catch((err)=>{
        alert("Cannot get access to your camera and video !");
        console.error(err);
      })
    };

    /**
     * Initialize app
     */
    requestLocalVideo();
  },
  false
);
