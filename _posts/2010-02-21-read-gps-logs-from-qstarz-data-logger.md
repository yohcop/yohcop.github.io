---
layout: post
title: Read GPS logs from QStarz data logger

post_id: 231
categories:
- gps
- Linux
---

Using <a href="http://www.rigacci.org/wiki/doku.php/doc/appunti/hardware/gps_logger_i_blue_747">MTKBabel</a>:

{% highlight bash %}
mtkbabel -s 115200 -f gpsdata -t -w -p /dev/ttyUSB0
{% endhighlight %}

will write a binary file gpsdata.bin, and 2 files: gpsdata_wpt.gpx with waypoints, and gpsdata_trk.gpx with tracks. Use -c instead of -t -w for a single file with both tracks and waypoints.

To empty the memory:

{% highlight bash %}
mtkbabel -s 115200 -E -p /dev/ttyUSB0
{% endhighlight %}

Then use <a href="http://code.google.com/p/gpicsync/">gpicsync</a> to create a kml with pictures (ready for the web).

Also, it is possible to convert the binary file to csv with gpsbabel:

{% highlight bash %}
gpsbabel -i mtk-bin,csv=extra.csv -f gpsdata.bin -o unicsv -F result.csv
{% endhighlight %}
