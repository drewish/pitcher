var m = require('midi');

// Set up a new input.
var input = new m.input();
console.log(input.getPortName(0));
input.openPort(0);

// Output
var output = new m.output();
output.openPort(0);
var midi = require('midi-api')({ end: false });
midi.pipe(m.createWriteStream(output));

// This is the range of my keyboard
var notes = [36, 48, 60, 72, 84, 96];
var note;
var streak = 0;

// Start state
pick();

function pick() {
  var index;
  // Don't give them the same note two times in a row.
  do {
    index = Math.floor(Math.random() * notes.length);
  } while (note == notes[index]);
  note = notes[index];

  console.log("note:", note, "streak:", streak);
  setTimeout(play, 250);
}

function play() {
  midi.noteOn(note).rest(500).noteOff(note);
  // Let them start a little early if they know it.
  setTimeout(wait, 250);
}

function wait() {
  var timeout;

  function acceptGuess(deltaTime, message) {
    // Ignore note offs
    if (message[2] === 0) {
      input.once('message', acceptGuess);
      return;
    }
    else {
      clearTimeout(timeout);

      if (message[1] == note) {
        right();
      }
      else {
        wrong(message[1]);
      }
    }
  }

  function timedout() {
    input.removeListener('message', acceptGuess);
    play();
  }

  // Accept a guess...
  input.once('message', acceptGuess);
  // ...but don't wait too long.
  timeout = setTimeout(timedout, 5000);
}

function right() {
  streak += 1;

  midi
    .noteOn(note)
    .noteOn(note + 4)
    .noteOn(note - 3)
    .rest(100)
    .noteOff()
    ;

  setTimeout(pick, 500);
}

function wrong(picked) {
  streak = 0;

  midi
    .noteOn(picked)
    .noteOn(picked + 1)
    .noteOn(picked - 1)
    .rest(250)
    .noteOff()
    ;

  setTimeout(play, 500);
}
