---
layout: post
title: Split a GPX file into tracks

post_id: 242
categories:
- Code
- gps
- hack
- scala
- Software
---

I almost never clear my GPS data logger. As a result, I keep downloading aobut 3 years of waypoints every time I use it. I needed a way to split the GPX file that it outputs.

After 30 minutes of mining the web, nothing convincing enough came up. I figured it would be faster to write that quickly in Scala.

It also shows how to read, parse and write XML in Scala.

<!--more-->

All input file, output file, and selected tracks are hard coded in the script so just edit that to fit your needs.

I actually started to write datastructures for some of the xml data, but then again, I wanted to finish that in less than 30 minutes, so there are global variables for the currently read track, and more ugly stuff.

The script also output the list of tracks with some stats. This helps to select the ones you want.
So run it once, select your tracks, and edit the lines

{% highlight scala %}
if (name == "2010-01-31T20:49:28Z" ||
    name == "2010-02-01T01:16:49Z" ||
    name == "2010-02-01T01:18:53Z" ||
    name == "2010-02-01T01:33:19Z") {
{% endhighlight %}

in the script, and run it again.

I may or may not clean/improve this script later if I need to.

Download [SpligGpx.scala]({{site.baseurl}}}/files/SpligGpx.scala).

Links:

- [Scala-lang.org](http://scala-lang.org)
- [A Tour of Scala: XML Processing](http://www.scala-lang.org/node/131)
- [Scala XML Book](http://burak.emir.googlepages.com/scalaxbook.docbk.html)
