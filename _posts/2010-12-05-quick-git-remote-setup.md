---
layout: post
title: Quick git remote setup

post_id: 359
categories:
- Code
- git
- hack
- Linux
- Software
---

After working on a project for some time, the project is way bigger, and it is necessary to backup the git client on a remote server ?

On the remote server: (e.g. after ssh foo@bar.baz...)

{% highlight bash %}
mkdi -p project/git
cd git
git init --bare
{% endhighlight %}

In the local git tree

{% highlight bash %}
git remote add barbaz foo@bar.baz:~/project/git
git push --all barbaz
{% endhighlight %}

Done !

Now, to have another copy on the remote server, for example, if the project is a web server, and you what to run the binary, etc:

{% highlight bash %}
mkdir project/prod
cd project/prod
git clone ../git/ .
# make, whatever
{% endhighlight %}

After changes on the local copy: (from local dir)

{% highlight bash %}
git push barbaz
{% endhighlight %}

Update the prod tree on the server:

{% highlight bash %}
gut pull origin
# again: make...
{% endhighlight %}
