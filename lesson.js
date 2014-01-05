var _ = require('lodash');

var notes;
var sequence;

// This is the range of my keyboard
var low = 36;
var hight = 96;

function octaves(low, high) {
  var n = [];
  for (var i = low; i <= high; i += 12) {
    n.push(i);
  }
  return n;
}

// offset of 0 is a C scale, 1 C#, etc
function majorScale(octave, offset) {
  var n = octave * 12 + (offset || 0);
  return [n, n+2, n+4, n+5, n+7, n+9, n+11, n+12];
}


// Pick randomly from the notes.
function pickRandom(notes) {
  var index;
  // Don't give them the same note two times in a row.
  do {
    index = Math.floor(Math.random() * notes.length);
  } while (this.lastNote == notes[index]);
  return notes[index];
}

// Loop through the sequence from the beginning.
function pickNext(sequence) {
  var n = sequence.shift();
  sequence.push(n);
  return n;
}

function sequenceUpDown(notes) {
  var copy = notes.slice(0).sort();
  return copy.concat(copy.slice(0).reverse());
}


function Lesson(options) {
  options = options || {};

  //this.notes = octave(low, high);
  this.notes = majorScale(3, 0);
  // make the first two notes active
  this.sequence = this.notes.slice(0);
  this.scores = {};
  for (var i = 0; i < 3; i++) {
    this.add();
  }
  this.lastNote = null;
}

Lesson.prototype.add = function() {
console.log("adding!", this.sequence);
  if (this.sequence.length > 0) {
    this.scores[this.sequence.shift()] = 3;
    // Bump all the remaining notes up
    _.forOwn(this.scores, function(v, i, a) {
      a[i] += 1;
    });
  }
};

Lesson.prototype.next = function() {
  // Use the score to determine how many copies of the note to put into the hat
  // higher scores should be drawn more frequently.
  var hat = [];
  process.stdout.write('picking from  ');
  var heights = [' ', '▁','▂','▄','▅','▇','█︎'];
  _.forOwn(this.scores, function(score, n) {
    process.stdout.write(n + ':' + heights[Math.floor(score / 2)] + ' (' + score + ') ');
    for (var i = 0; i < score; i++) { hat.push(n); }
  });
  process.stdout.write("\n");

  this.lastNote = pickRandom(hat);
  return this.lastNote;
};

Lesson.prototype.right = function() {
  // Decrease the score
  if (this.scores[this.lastNote] > 1) {
    this.adjust(this.lastNote, -1);
  }

  // If they're doing well introduce a new score
  var biggestScore = _.values(this.scores).sort().reverse()[0];
console.log("biggest score", biggestScore);
  if(biggestScore < 3 ) {
    this.add();
  }
};

Lesson.prototype.wrong = function(picked) {
  process.stdout.write(picked + " ");

  // When they guess wrong increase the score of both notes.
  this.adjust(this.lastNote, +1);
  this.adjust(picked, +1);
};

Lesson.prototype.adjust = function(note, adjustment) {
  if (note in this.scores) {
    this.scores[note] = Math.min(Math.max(this.scores[note] + adjustment, 0), 12);
  }
};

module.exports = Lesson;