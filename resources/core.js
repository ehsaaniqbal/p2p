//DOM has mounted
document.addEventListener(
  "DOMContentLoaded",
  event => {
    let peer_id, session, username;

    //Initialize App with getUserMedia

    navigator.getMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true
      })
      .then(stream => {
        //set stream globally
        window.localStream = stream;
        const my_cam = document.getElementById("my_cam");
        my_cam.setAttribute("autoplay", "");
        my_cam.setAttribute("muted", "");
        my_cam.setAttribute("playsinline", "");

        if ("srcObject" in my_cam) {
          my_cam.srcObject = stream;
        } else {
          // old browsers
          my_cam.src = URL.createObjectURL(stream);
        }
      })
      .catch(err => {
        alert("Cannot get access to your camera!");
        console.error(err);
      });

    //Peer constructor

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

    //handle errors
    peer.on("error", err => {
      alert("An error ocurred with peer: " + err);
      console.error(err);
    });

    //On session close
    document.getElementById("end_call").addEventListener("click", () => {
      peer.destroy();
      location.reload();
    });

    //Retrive user ID
    peer.on("open", () => {
      document.getElementById("my_id").innerHTML = "My ID : " + peer.id;
    });

    //set connect -> enabled
    document.getElementById("_id").addEventListener("focus", () => {
      document.getElementById("connect").disabled = false;
    });

    // Start connection
    document.getElementById("connect").addEventListener(
      "click",
      () => {
        username = document.getElementById("_name").value;
        peer_id = document.getElementById("_id").value;

        if (peer_id) {
          session = peer.connect(peer_id, {
            metadata: {
              username: username
            }
          });
        } else {
          alert("Please enter an ID");
          return false;
        }

        document.getElementById("connect_form").hidden = true;
        document.getElementById("chat").hidden = false;
        document.getElementById("remote_user_has_connected").hidden = true;
        document.getElementById("remote_id").innerHTML =
          "Connected to " + peer.id;
      },
      false
    );

    //Handle connections
    peer.on("connection", connection => {
      //update global variables
      session = connection;
      peer_id = connection.peer;
      document.getElementById("_id").value = peer_id;
      document.getElementById("connect_form").hidden = true;
      document.getElementById("remote_user_has_connected").hidden = false;
      document.getElementById("remote_username").innerHTML =
        "Connected to " + session.metadata.username;

      console.log(
        `%c Connected to ${session.metadata.username}`,
        "background: #222; color: #bada55"
      );
    });

    /**
     * Handle on receive call event
     */
    peer.on("call", function(call) {
      let acceptsCall = confirm(
        "Videocall incoming, do you want to accept it?"
      );

      if (acceptsCall) {
        // Answer the call with your own video/audio stream
        call.answer(window.localStream);

        // Receive data
        call.on("stream", function(stream) {
          document.getElementById("chat").hidden = true;
          document.getElementById("remote_user_has_connected").hidden = true;
          document.getElementById("call_controls").hidden = false;
          // Store a global reference of the other user stream
          window.peer_stream = stream;
          // Display the stream of remote user!
          const remote_cam = document.getElementById("remote_cam");
          remote_cam.setAttribute("autoplay", "");
          remote_cam.setAttribute("muted", "");
          remote_cam.setAttribute("playsinline", "");

          if ("srcObject" in remote_cam) {
            remote_cam.srcObject = stream;
          } else {
            // old browsers
            remote_cam.src = URL.createObjectURL(stream);
          }
        });

        // Handle when the call finishes
        call.on("close", function() {
          alert("The videocall has finished");
        });
      } else {
        alert("Call denied!");
      }
    });

    /**
     *  Request a videocall
     */

    document.getElementById("call").addEventListener(
      "click",
      function() {
        console.log(
          `%c Calling ${peer_id}`,
          "background: #222; color: #bada55"
        );

        let call = peer.call(peer_id, window.localStream);

        call.on("stream", stream => {
          window.peer_stream = stream;
          document.getElementById("chat").hidden = true;
          document.getElementById("remote_user_has_connected").hidden = true;
          document.getElementById("call_controls").hidden = false;

          const remote_cam = document.getElementById("remote_cam");
          remote_cam.setAttribute("autoplay", "");
          remote_cam.setAttribute("muted", "");
          remote_cam.setAttribute("playsinline", "");
          if ("srcObject" in remote_cam) {
            remote_cam.srcObject = stream;
          } else {
            // old browsers
            remote_cam.src = URL.createObjectURL(stream);
          }
        });
      },
      false
    );

    /**
     *  Request a videocall from initiated  user
     */

    document.getElementById("remote_call").addEventListener(
      "click",
      function() {
        console.log(
          `%c Calling ${peer_id}`,
          "background: #222; color: #bada55"
        );

        let call = peer.call(peer_id, window.localStream);

        call.on("stream", stream => {
          window.peer_stream = stream;
          document.getElementById("chat").hidden = true;
          document.getElementById("remote_user_has_connected").hidden = true;
          document.getElementById("call_controls").hidden = false;

          const remote_cam = document.getElementById("remote_cam");
          remote_cam.setAttribute("autoplay", "");
          remote_cam.setAttribute("muted", "");
          remote_cam.setAttribute("playsinline", "");
          if ("srcObject" in remote_cam) {
            remote_cam.srcObject = stream;
          } else {
            // old browsers
            remote_cam.src = URL.createObjectURL(stream);
          }
        });
      },
      false
    );
  },
  false
);
