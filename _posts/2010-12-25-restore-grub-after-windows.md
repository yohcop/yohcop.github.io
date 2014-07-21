---
layout: post
title: Restore Grub after windows....

post_id: 385
categories:
- argh!
- boot
- Linux
- ubuntu
- windows
---

I don't have windows... but others do, with a linux dual boot, and I sometimes have to fix their computer after windows messes up the boot partition. So in prevision of the next time I have to do it... This worked for me, on a computer that was using grub2.

<!--more-->

### 0\. Boot with a live CD or USB key with ubuntu. ###

### 1\. Everything has to be done as root. ###

It's easier to run that before:

{% highlight bash %}
sudo su
mkdir /media/foo
{% endhighlight %}

### 2\. find the disk and partition containing /boot. ###

Here, it is `/dev/sda` and `/dev/sda5` respectively.
`fdisk -l` can help. At the same time, check the boot flag.

### 3\. mount the partition, and other useful stuff. Chroot into it. ###

{% highlight bash %}
mount /dev/sda5 /media/foo
mount --bind /dev /media/foo/dev
mount --bind /proc /media/foo/proc
mount --bind /sys /media/foo/sys
mount --bind /dev/pts /media/foo/dev/pts
chroot /media/foo
{% endhighlight %}

### 4\. update and reinstall grub2 ###

{% highlight bash %}
update-grub2
{% endhighlight %}

Then leave chroot (ctrl-d)

{% highlight bash %}
grub-install --root-directory=/media/foo /dev/sda
{% endhighlight %}
