---
layout: post
title: Perlin noise is amazing

categories:
- Software
- Maths
- Pattern
- Game
- Perlin noise
- Random
---

### Disclamer

This is my take on Perlin noise. There are already tons of tutorials about
Perlin noise on the web. There was probably no need for another one. The
only reason that one exists, is that I was playing with it in javascript and
HTML5/canvas, and had all the code ready. I just thought it would be cool to
write a tutorial where each sample image is actually generated on the fly and
painted on the page. So hint: refresh the page and you will see a different
image. But each picture on that page is consistent in the entire tutorial. I
thought that was pretty cool. So sorry if it takes some time to load. And if
you never see images on this page, maybe it is time to upgrade your browser to
a real one, like Chrome or Firefox. Now that we got that out of the way,
let's got to the cool stuff.

### Perlin noise

Perlin noise amazes me. Here is what it looks like in 2D.

<center>
<canvas id="canvasAll1" width="256" height="256"></canvas>
</center>

Imagine that the above image is representing a map. Maybe the darker area are
mountains, and the lighter are valleys.

It may seem relatively hard to generate such image randomly. Fortunately,
some guy, Ken Perlin, developed a cool technique that does just that. He
even won an academy award for it...

The technique can be applied to generate 1D Perlin noise, to generate a
random-looking profile for example. Or to generate 3D Perlin noise, to add
some volume information, like a bunch of clouds. In that example, we will
work with 2D perlin noise. Maybe even 4D noise, but I will let you imagine
what that would look like...

The technique is pretty simple. Basically, it is an average of few random
images of different sizes.

### Step by step

The algorithm starts with a simple random image. Each pixel has a random
value between 0 (black) and 1 (white). In this tutorial, I want to generate an
image of 256 pixels wide. Here is the first random image:

<center>
<canvas id="canvas1" width="256" height="256"></canvas>
</center>

Not very nice yet.

Let's generate another one, that is half the size, so 256/2 = 128 pixels.

<center>
<canvas id="canvas2small" width="128" height="128"></canvas>
</center>

We need to add this second image to the first one. But since they are not of
the same size, we have to take the smaller one, and scale it up by a factor of
2 to get an image of 256 pixels:

<center>
<canvas id="canvas2scale" width="256" height="256"></canvas>
</center>

Now, the magic happens. We just take each pixel of those two 256 pixels
wide images, average them, and save the result to a new image:

<center>
<canvas id="canvas1plus2" width="256" height="256"></canvas>
</center>

Tadaaaa!

Not very impressive. Yet.

Now, the second step is repeated with an image half the size again. We started with 256 pixels, then 128. Now, let's take a 64 pixels image, and resize it to 4 times its size:

<center>
<canvas id="canvas3small" width="64" height="64"></canvas>
</center>

<center>
<canvas id="canvas3scale" width="256" height="256"></canvas>
</center>

And we add it to our previous image:

<center>
<canvas id="canvas1plus2plus3" width="256" height="256"></canvas>
</center>

### Wash, rinse, repeat

These operations are repeated for images of 32, 16, and 8 pixels: generate
random image, resize, add to (or rather average with) the last obtained
image:

<center>
<canvas id="canvasAll2" width="256" height="256"></canvas>
</center>

WOOOOWW !

### The algorithm, visualized

The following image has 3 columns:
the first one is a randomly generated image. The second one is the same
image as the first column, but scaled to be of the same size as our target
image (256 pixels, red lines). The third and last column contains average
images between the image above itself, and the image to its left (blue
lines). The algorithm starts with a randomly generated image (in the top right corner, and images are added together.

<center>
<canvas id="canvasRecap" width="724" height="1596" style="margin-left:-62px"></canvas>
</center>

There are a lot of parameters to play with. For example in that
example we started with an image of size 256. But we could start with a 64
pixels image resized to 256 pixels (basically skip the first 2 images). That
would remove some of the fine grain to the final image. We can also add one or
2 extra steps at the end. Basically, up to a 2x2 pixels image (1x1 does not make any sense, since it would add the same value to every pixel of the image).

Another important factor is how an image is scaled up. In the above
examples I used linear scaling, but other techniques will produce different
results.

It is also possible to change the way two images are added together, in which
order, and what formula is used. Here, much more importance is given to the
last image I add, since it basically accounts for half the value of each
pixels on the result. This can be tuned as well.

Colors ! It is very easy to apply a color map to this black and white map, and
get completely different textures, like lava, ocean, dirt, wood, etc.

Different parameters will work better for different applications.

In a next article, I'll play with colors, and explain how to generate
Perlin noise to infinity, in a way that doesn't require computing an
initial noise the size of... infinity (which is how this whole tutorial
thing actually started)

<script src="{{ site.baseurl }}/files/seedrandom.js"></script>
<script src="{{ site.baseurl }}/files/perlin.js"></script>
<script>
function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}

function drawOnCanvas(noise, id) {
  var element = document.getElementById(id);
  var ctx = element.getContext("2d");
  var w = element.width, h = element.height;
  var imageData = ctx.createImageData(w, h);
  drawNoise(imageData, 0, 0, noise, w);
  ctx.clearRect(0, 0, w, h);
  ctx.putImageData(imageData, 0, 0);
}

addLoadEvent(function() {
  var seed = Math.random();

  var element = document.getElementById("canvasRecap");
  var ctx = element.getContext("2d");

  var w = element.width, h = element.height;
  var imageData = ctx.createImageData(w, h);

  var size = 256;
  var margin = 10;
  var plusWidth = 10;
  var arrowMargin = 40;
  var noises = [];
  var noisesSmall = [];
  var lines = [];
  var red = '#900';
  var blue = '#009';

  for (var step = 0; step < 6; ++step) {
    var pow = Math.pow(2, step);
    Math.seedrandom(seed + step);

    var n = new noise(size / pow);
    var n2 = new interpolatedNoise(size, pow, n, n, n, n);
    noisesSmall.push(n);
    noises.push(n2);

    var delta = (256 - (size / pow)) / 2;
    var top = step * (256 + margin);
    if (step > 0) {
      drawNoise(imageData, delta - 64, top + delta, n, size / pow);
      drawNoise(imageData, 256 + margin - 64, top, n2, size);
    }

    if (step > 0) {
      lines.push([[2 + delta + size / pow - 64, top + delta],
                  [256 + margin - 2 - 64, top], 1, red]);
      lines.push([[2 + delta + size / pow - 64, top + delta + size / pow],
                  [256 + margin - 2 - 64, top + 256], 1, red]);
      lines.push([[256 + 128 + margin + arrowMargin - 64, top + 128],
                  [512 + 128 + 2 * margin - arrowMargin - 64, top + 128], 4, blue]);
      lines.push([[512 + 128 + 2 * margin - 64, top - 128 - margin + arrowMargin],
                  [512 + 128 + 2 * margin - 64, top + 128 - arrowMargin], 4, blue]);
      // + sign
      lines.push([[512 + 2 * margin + 128 - plusWidth - 64, top + 128],
                  [512 + 2 * margin + 128 + plusWidth - 64, top + 128], 5, blue]);
      lines.push([[512 + 2 * margin + 128 - 64, top + 128 - plusWidth],
                  [512 + 2 * margin + 128 - 64, top + 128 + plusWidth], 5, blue]);
    }

    var tmpRes = new combinedNoise(noises);
    drawNoise(imageData, 512 + 2 * margin - 64, step * (256 + margin), tmpRes, size);
    if (step == 1) {
      drawOnCanvas(tmpRes, "canvas1plus2");
    } else if (step == 2) {
      drawOnCanvas(tmpRes, "canvas1plus2plus3");
    }
  }
  ctx.clearRect(0, 0, w, h);
  ctx.putImageData(imageData, 0, 0);

  var final = new combinedNoise(noises);
  drawOnCanvas(final, "canvasAll1");
  drawOnCanvas(final, "canvasAll2");
  drawOnCanvas(noisesSmall[0], "canvas1");
  drawOnCanvas(noisesSmall[1], "canvas2small");
  drawOnCanvas(noises[1], "canvas2scale");
  drawOnCanvas(noisesSmall[2], "canvas3small");
  drawOnCanvas(noises[2], "canvas3scale");

  for (var line in lines) {
    var l = lines[line];
    ctx.lineWidth = l[2];
    ctx.strokeStyle = l[3];
    ctx.beginPath();
    ctx.moveTo(l[0][0], l[0][1]);
    ctx.lineTo(l[1][0], l[1][1]);
    ctx.stroke();
  }
});
</script>
