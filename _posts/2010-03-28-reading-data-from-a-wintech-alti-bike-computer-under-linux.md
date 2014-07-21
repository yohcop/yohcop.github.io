---
layout: post
title: Reading data from a Wintech Alti bike computer under linux

post_id: 260
categories:
- bike
- hack
- Linux
---

I got this Wintech Alti bike computer. It looks like a USB key, and connects to your computer where you can download the data.

Of course, the software only works under Windows.

I tried to look at the serial communication between a virtual machine and the wintech, but with no success so far.
It would be almost ok, if the software that comes with it could export the data in any readable format. But, the only export option is.... JPEG !! Yes, the software can draw a graph of your trip, altitude, etc. But it can only export a picture of it.....

![Bike trip - Wintech Alti](/files/biketripwintech.jpg){:width="600px"}


o_O that's *really* bad. I was at least hoping to get a csv file.

So anyway, the software must have this data somewhere... So I looked at the most recently edited files after downloading the info from the bike computer, and found a file called SiUSB98.dll. I copied it on my linux partition, and opened it with a hex editor (hexedit). You can't see much, but at least the first bytes say "Standard Jet DB". Then, it was easy to find a linux software that could read this file (found gmdb2: `apt-get install mdbtools-gmdb` under debian), and from there, export the data to CSV.

Yay!

I still suspect that the chip used by the wintech is some widely used chip, and that some unix tool already exist to pull the data out of it. I have yet to find what it is though.
