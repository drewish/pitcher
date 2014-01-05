var Lesson = require('./lesson');

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


var lesson = new Lesson();
var note;
var streak = 0;


// Start state
pick();

// This is roughtly setup as a state machine with each function being a state.
// Timeouts and MIDI events are used to transition between the states.

// Pick a new note, then we'll play it.
function pick() {
  note = lesson.next();
  console.log("note:", note, "streak:", streak);
  setTimeout(play, 250);
}

// Play the note, then we'll wait for them.
function play() {
  midi.noteOn(note).rest(500).noteOff(note);
  // Let them guess while it's still playing.
  setTimeout(wait, 100);
}

// Wait for a guess, mark it as right or wrong and if we wait too long let's
// play the note again.
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

// They got it right, give feedback then pick another note.
function right() {
  lesson.right();
  streak += 1;

  midi
    .noteOn(note)
    // .rest(25)
    // .noteOn(note + 4)
    // .noteOn(note - 3)
    .rest(400)
    .noteOff()
    ;
  setTimeout(pick, 500);
}

// They were wrong, give feed back then play it again.
function wrong(picked) {
  lesson.wrong(picked);
  streak = 0;

  midi
    .noteOn(picked)
    //  .rest(100)
    .noteOn(picked + 1)
    .noteOn(picked - 1)
    .rest(50)
    .noteOff(picked + 1)
    .noteOff(picked - 1)
    .rest(500)
    .noteOff(picked)
    ;

  setTimeout(play, 1000);
}
