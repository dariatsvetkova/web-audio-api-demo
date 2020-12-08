// 1. ACCESSING MICROPHONE & PROCESSING SOUNDS

const audioElement = document.querySelector("audio");
const clapThreshold = 0.9;
const amplitudeDiff = 0.25;

// Checking for microphone availability
function checkMic() {
  if (!!navigator.getUserMedia) {
    // Mic works
  } else if (!navigator.getUserMedia) {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
  } else {
    alert(
      `Ошибка: браузер не может использовать микрофон :(\nУстанови современный браузер или используй двойной клик мышкой вместо хлопков.\n\nYour browser doesn't support microphone usage :( \nInstall a modern browser or use doubleclicks with your mouse instead of claps.`
    );
  }
}

// Getting audio stream from the microphone
function recordMic() {

  let audioContext = new AudioContext();

  navigator.getUserMedia(
    { audio: true, noiseSuppression: true },
    (stream) => connectAudio(stream),
    (e) => alert(`Ошибка: невозможно записать аудио. Используй двойной клик мышкой вместо хлопков.\nError capturing audio. Use doubleclicks with your mouse instead of claps.`)
  );

  // Connecting audio nodes into an audio graph for further processing
  function connectAudio(stream) {

    let recordedAudio = audioContext.createMediaStreamSource(stream),
      gainNode = audioContext.createGain(),
      scriptNode = audioContext.createScriptProcessor(16384, 1, 1);

    scriptNode.connect(audioContext.destination);
    gainNode.connect(audioContext.destination);
    recordedAudio.connect(gainNode);
    recordedAudio.connect(scriptNode);

    gainNode.gain.value = 0; // prevent sound reproduction & feedback from speakers

    scriptNode.onaudioprocess = processAudio;
  }


  // Detecting claps - sharp increases in amplitude that exceed the set threshold
  function processAudio(event) {

    let bufferedAudio = event.inputBuffer.getChannelData(0);

    for (let i = 0; i < bufferedAudio.length; i++) {

      if ((Math.abs(bufferedAudio[i]) >= clapThreshold)
          && (Math.abs(bufferedAudio[i]) > Math.abs(bufferedAudio[i - 3]) + amplitudeDiff)
          && (Math.abs(bufferedAudio[i]) > Math.abs(bufferedAudio[i + 3]) + amplitudeDiff)
          && (Math.abs(bufferedAudio[i]) > Math.abs(bufferedAudio[i - 6]) + amplitudeDiff * 2)
          && (Math.abs(bufferedAudio[i]) > Math.abs(bufferedAudio[i + 6]) + amplitudeDiff * 2)) {

        clapHandler();
        break;
      }
    }
  }
}

// 2. CHANGING INTERFACE BASED ON SOUNDS

let claps = 0;
let animationInt;
let blinkInt = [];
const overlay = document.querySelector(".overlay");
const okButtons = document.querySelectorAll(".ok-button");
const background = document.querySelector(".background");

const lines = {
  light: [
    document.getElementById("line-1-light"),
    document.getElementById("line-2-light"),
    document.getElementById("line-3-light"),
  ],
  dark: [
    document.getElementById("line-1-dark"),
    document.getElementById("line-2-dark"),
    document.getElementById("line-3-dark"),
  ],
};

function lightOn() {
  lines.dark[claps - 1].classList.add("hidden");
  lines.dark[claps - 1].classList.remove("showing");

  lines.light[claps - 1].classList.add("showing");
  lines.light[claps - 1].classList.remove("hidden");

  background.classList.add(`background-${claps}`);
  background.classList.remove(`background-${claps - 1}`);
}

function clapHandler() {
  ++claps;

  switch (claps) {
    case 1:
    case 2:
      lightOn();
      break;

    case 3:
      lightOn();
      blinkAnimation();
      animationInt = setInterval(blinkAnimation, 5000);
      break;

    case 4:
      clearInterval(animationInt);
      blinkInt.forEach((item) => clearTimeout(item));

      lines.light.forEach((line) => {
        line.classList.add("hidden");
        line.classList.remove("showing");
      });
      lines.dark.forEach((line) => {
        line.classList.add("showing");
        line.classList.remove("hidden");
      });

      claps = 0;
      background.classList.remove("background-3", "background-blink");
      break;
  }
}

function blinkOff() {
  lines.dark[1].classList.add("showing");
  lines.dark[1].classList.remove("hidden");

  lines.light[1].classList.add("hidden");
  lines.light[1].classList.remove("showing");

  background.classList.add("background-blink");
}

function blinkOn() {
  lines.dark[1].classList.add("hidden");
  lines.dark[1].classList.remove("showing");

  lines.light[1].classList.add("showing");
  lines.light[1].classList.remove("hidden");

  background.classList.remove("background-blink");
}

function blinkAnimation() {
  blinkInt[0] = setTimeout(blinkOff, 700);
  blinkInt[1] = setTimeout(blinkOn, 1000);
  blinkInt[2] = setTimeout(blinkOff, 1700);
  blinkInt[3] = setTimeout(blinkOn, 2000);
  blinkInt[4] = setTimeout(blinkOff, 2700);
  blinkInt[5] = setTimeout(blinkOn, 3000);
}

window.addEventListener(
  "load",
  function () {
    // Activating the info overlay
    overlay.classList.add("overlay-active");

    // Check if a microphone is available
    checkMic();

    // Remove overlay
    okButtons.forEach(button => button.addEventListener(
      "click",
      function () {
        overlay.classList.remove("overlay-active");

        // Listening for claps and doubleclicks (fallback option)
        document.addEventListener("dblclick", clapHandler, false);
        recordMic();
      },
      false
    ));
  },
  false
);
