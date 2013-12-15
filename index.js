// Output
var m = require('midi');
var midi = require('midi-api')({ end: false });

// Set up a new input.
var input = new m.input();
console.log(input.getPortName(0));
input.openPort(0);

var output = new m.output();
output.openPort(0);

midi.pipe(m.createWriteStream(output));
midi.program(34);

var notes = [36, 48, 60, 72, 84, 96];
var note;
var timeout;

pick();

function pick() {
  // Don't give them the same note two times in a row.
  var index;
  do {
    index = Math.floor(Math.random() * notes.length);
  } while (note == notes[index]);
  note = notes[index];

  console.log("note is " + note);
  setTimeout(play, 250);
}

function play() {
  midi.noteOn(note).rest(500).noteOff(note);
  setTimeout(wait, 500);
}

function wait() {
  function acceptGuess(deltaTime, message) {
    // Ignore note offs
    if (message[2] === 0) {
      input.once('message', acceptGuess);
      return;
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    if (message[1] == note) {
      console.log('you got it!');
      right();
    }
    else {
      console.log(message[1] + ' was close to ' + note + ', try again!');
      wrong();
    }
  }

  // Accept a guess...
  input.once('message', acceptGuess);
  // ...but don't wait too long.
  timeout = setTimeout(function() {
    input.removeListener('message', acceptGuess);
    play();
  }, 5000);
}

function right() {
  midi
    .noteOn(note)
//    .rest(50)
    .noteOn(note + 4)
    .noteOn(note - 3)
    .rest(100)
    .noteOff(note)
    .noteOff(note + 4)
    .noteOff(note - 3)
    ;

  setTimeout(pick, 500);
}

function wrong() {
  midi
    .noteOn(note)
    .noteOn(note + 1)
    .noteOn(note - 1)
    .rest(250)
    .noteOff(note)
    .noteOff(note + 1)
    .noteOff(note - 1)
    ;

  setTimeout(play, 500);
}
