// Generates a random 2d array of width w.
function noise(w) {
  this.data = [];
  for (var y = 0; y < w; ++y) {
    var row = [];
    for (var x = 0; x < w; ++x) {
      row.push(Math.random());
    }
    this.data.push(row);
  }

  this.get = function(x, y) {
    return this.data[x][y];
  }
}

// A random 2d array of width w, but with a blowupFactor. If blowupFactor is
// 2, the actual underlying array will have a size of w/2. The missing
// pixels in between are interpolated.
// This does not generate any random data though. All the data is extracted
// from the given noises arrays here, rightNoise, bottomNoise and
// bottomRightNoise. here is the noise array of size w/blowupFactor, and the
// other are the noise arrays, also of size w/blowupFactor, of the
// neibourgh cells.
function interpolatedNoise(w, blowupFactor,
    here, rightNoise, bottomNoise, bottomRightNoise) {
  this.blowupFactor = blowupFactor;
  this.data = [];
  for (var x = 0; x < w / blowupFactor; ++x) {
    var col = [];
    for (var y = 0; y < w / blowupFactor; ++y) {
      col.push(here.get(x, y));
    }
    // Last row comes from bottomNoise.
    col.push(bottomNoise.get(x, 0));
    this.data.push(col);
  }
  // Last col comes from rightNoise and bottomRightNoise.
  var col = [];
  for (var y = 0; y < w / blowupFactor; ++y) {
    col.push(rightNoise.get(0, y));
  }
  col.push(bottomRightNoise.get(0, 0));
  this.data.push(col);

  // if blowup = 2:
  // 0 -> from = 0, to = 1
  // 1 -> from = 0, to = 1
  // 2 -> from = 1, to = 2
  // 16 -> from = 8, to = 9
  //
  //   tl      tr
  //     +----+
  //     |    |
  //     +----+
  //   bl      br
  this.get = function(x, y) {
    var tl = [x / this.blowupFactor | 0, y / this.blowupFactor | 0];
    var tr = [tl[0] + 1, tl[1]];
    var bl = [tl[0],     tl[1] + 1];
    var br = [tl[0] + 1, tl[1] + 1];

    var tlC = this.data[tl[0]][tl[1]];
    var trC = this.data[tr[0]][tr[1]];
    var blC = this.data[bl[0]][bl[1]];
    var brC = this.data[br[0]][br[1]];
    // First, interpolate between tl and tr colors.
    var topMiddle = interpolate(tlC, trC,
        (x - tl[0] * this.blowupFactor) / this.blowupFactor);
    // Then between bl and br colors,
    var bottomMiddle = interpolate(blC, brC,
        (x - bl[0] * this.blowupFactor) / this.blowupFactor);
    // Finally, between the 2 colors obtained previously.
    return interpolate(topMiddle, bottomMiddle,
        (y - tl[1] * this.blowupFactor) / this.blowupFactor);
  }
}

function combinedNoise(noises) {
  this.noises = noises;

  this.get = function(x, y) {
    var accumul = 0;
    var num = this.noises.length;
    for (var n in this.noises) {
      if (n == 0) {
        accumul = this.noises[n].get(x, y);
      } else {
        accumul = (accumul + this.noises[n].get(x, y)) / 2;
      }
    }
    return accumul;
  }
}

function stretch(noise, w) {
  this.noise = noise;
  this.min = 1;
  this.max = 0;

  for (var y = 0; y < w; ++y) {
    for (var x = 0; x < w; ++x) {
      var n = this.noise.get(x, y);
      if (n < this.min) this.min = n;
      if (n > this.max) this.max = n;
    }
  }
  this.diff = 1 / (this.max - this.min);

  this.get = function(x, y) {
    return (this.noise.get(x, y) - this.min) * this.diff;
  }
}

// =================================================================

var noiseCache = {};
function getNoiseFor(seed, x, y, n, size) {
  var key = ""+x+":"+y;
  if (noiseCache[key] == undefined) {
    var hash = seed;
    hash = hash * 31 + x;
    hash = hash * 31 + y;
    Math.seedrandom(hash);
    noiseCache[key] = new noise(size / n);
  }
  return noiseCache[key];
}

function getInterpolatedNoise(seed, x, y, n, size) {
  var here = getNoiseFor(seed, x, y, n, size);
  var right = getNoiseFor(seed, x + 1, y, n, size);
  var bottom = getNoiseFor(seed, x, y + 1, n, size);
  var bottomRight = getNoiseFor(seed, x + 1, y + 1, n, size);
  return new interpolatedNoise(size, Math.pow(2, n), here, right, bottom, bottomRight);
}

// =================================================================

function interpolate(from, to, percent) {
  return from * (1-percent) + to * percent;
}

function setGrey(imageData, x, y, grey) {
  var index = 4 * (x + y * imageData.width);
  grey = grey * 255;
  imageData.data[index] = grey;
  imageData.data[index + 1] = grey;
  imageData.data[index + 2] = grey;
  imageData.data[index + 3] = 255;
}

function drawNoise(data, x, y, noise, size) {
  for (var dx = 0; dx < size; ++dx) {
    for (var dy = 0; dy < size; ++dy) {
      setGrey(data, x + dx, y + dy, noise.get(dx, dy));
    }
  }
}
