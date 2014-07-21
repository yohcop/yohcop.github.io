---
layout: post
title: Starting a dev server with the right IP address

post_id: 405
categories:
- Code
- hack
- IP address
- webserver
---

I often need to start a dev server with my current IP address. I don't want to use 127.0.0.1, because other computers on the network, or mobile phones on wifi, etc, can't access it. So I need the IP address attributed by my router to my computer. Here is how to get it in 1 line of bash:

{% highlight bash %}
IP=`ifconfig wlan0 | \
    grep 'inet addr:'| \
    cut -d: -f2 | \
    awk '{ print $1}'`

# Then, for example start the server with:
./main --ip=$IP
{% endhighlight %}

I suppose it works on ubuntu linux as of today, but is pretty dependent on the output of the ifconfig command. Should be easy to adapt if needed.
