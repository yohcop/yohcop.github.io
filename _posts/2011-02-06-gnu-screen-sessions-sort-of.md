---
layout: post
title: GNU Screen sessions - sort of.

post_id: 399
categories:
- Code
- GNU Screen
- hack
- Linux
- Session
- Software
---

When working on some projects, I usually have to repeat a bunch of operations every time I start a "work session". Like cd project-dir, opening a set of terminals, running a database server, compiling and starting the server, etc.

At some point I was creating a bash script that would do all that, starting xterms, etc. but that's not really scalable.

But I just found how to fake sessions with GNU screen <a href="http://log.bthomson.com/2009/06/saving-your-sessions-with-gnu-screen.html">here</a>. Basically, at the root of my project, I create a file "screenrc", containing for example:

{% highlight bash %}
screen -t "client-src"
stuff "cd src/client-js/static/^M"

screen -t "server-src"
stuff "cd src/server-go/src/^M"

screen -t "server-run"
stuff "cd src/server-go/src/^M"
stuff "./run.sh^M"

screen -t "db"
stuff "cd src/server-go/^M"
stuff "./start-db.sh^M"
{% endhighlight %}

Each `screen -t foo` creates a new screen tab with the given name (foo). And each following `stuff "command^M"` will literaly type the given command in the tab. ^M is needed, and is obtained in vim with ctrl-v ctrl-m.

Then I just have to run `screen -c screenrc` from the root of my project, and a screen with all the terminal sessions is set up, the database server starts, my dev server is compiled and ran, etc. in one command I am ready to code.

Hope that helps!
