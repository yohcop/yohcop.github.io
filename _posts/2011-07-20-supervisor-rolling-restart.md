---
layout: post
title: Supervisor rolling restart

categories:
- Code
- supervisor
- hack
- Linux
- bash
- Software
---

I recently "discovered" Supervisord, while looking at ways to run webservers.
It's much better than doing `while [ 1 ]; do ./main; done` in a screen
session... Well, it's not really hard to do something better than that...

Anyway. It works well, and does what I want, except it's missing rolling
restarts. That is, when you have multiple instances of a program running,
restart the first instance, check if it's running correctly, if it is,
restart the next instance, and so on. Without rolling restart you have the
risk of finding yourself with no running jobs at all, and not being able to
restart them because of some bug (yeah, you should still have the old binary
around, but it may take some time to rollback).

The good news is supervisor comes with the command line supervisorctl, and it
has all the commands we need to implement that ourselves.

So here is the whole script: rolling restart for supervisord:

{% highlight bash %}
#!/bin/bash

PROGRAM=my_program
# Time in seconds.
TIME_BETWEEN_RUNNING_CHECKS=5
TIME_BETWEEN_RESTARTS=10

for f in `supervisorctl status | grep -e "^$PROGRAM:" | awk '{print $1}'`; do
  supervisorctl restart $f

  while [ 1 ]; do
    sleep $TIME_BETWEEN_RUNNING_CHECKS
    status=`supervisorctl status $f | awk '{print $2}'`
    if [ "$status" == "RUNNING" ] ; then
      echo $f restarted
      break
    elif [ "$status" == "FATAL" ] ; then
      echo "Error during restart of $f ($status). Stopping rolling update."
      exit 1
    else
      echo "Now: $status"
    fi
  done

  sleep $TIME_BETWEEN_RESTARTS
done
{% endhighlight %}

Just edit the first 3 variables, and the only thing to do is make the script
executable and run it. Changing my_program to $1 is a good idea, but you have
to type the name of the program to restart every run of course.

If an instance fail to start properly, it will go in the "FATAL" state, and the
rolling update stops. You can then fix the problem, and re-run the script, or
rather manually restart the job that failed with `supervisorctl start`,
before doing the rolling update again.
