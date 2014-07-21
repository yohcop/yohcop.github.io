---
layout: post
title: Ubuntu, KVM, vm-builder

post_id: 363
categories:
- kvm
- Linux
- qemu
- ubuntu
- virtualization
- vm
---

How to set up a KVM virtual machine running Ubuntu 10.10 Maverick / JeOS, under my Ubuntu 10.10 dist.

<!--more-->

(Edit: If you want to know why your VM hangs on boot, read the last section right away !)

First, I think all this is needed: (unfortunately, I didn't take exact notes when running them):
`sudo apt-get install python-vm-builder qemu-kvm kvm libvirt-bin virt-viewer apt-cacher`

### 1\. Prepare apt-cacher (optional) ###

When the VM is built, potentially a lot of packages are fetched from the network. It may take some time, so it's best to run a apt server, that will use the files you already have on your disk. That's apt-cacher (installed previously)

Edit /etc/apt-cacher/apt-cacher.conf, find path_map, and set it to something like:
`path_map = ubuntu archive.ubuntu.com/ubuntu ;`
It says that http://IP_ADDRESS:3142/ubuntu is a mirror for archive.ubutun.com/ubuntu.

{% highlight bash %}
# Import all the .deb you have in apt-cacher's cache:
sudo /usr/share/apt-cacher/apt-cacher-import.pl -s /var/cache/apt/archives/

# And run apt-cacher:
sudo apt-cacher &

# Monitor access and error logs while the VM is prepared
sudo tail -f /var/log/apt-cacher/{error,access}.log
{% endhighlight %}

### 2\. Create a disk partition config ###

Basically just a file (I named it vmbuilder.partition) that contains something like:

    root 8000
    swap 4000
    ---
    /var 1000

### 3\. Create a VM image ###

The whole command used is:

{% highlight bash %}
sudo vmbuilder kvm ubuntu \
  --suite maverick \
  --flavour virtual \
  --arch i386
  -o \
  --libvirt qemu:///system \
  --part vmbuilder.partition \
  --ip 192.168.2.50 \
  --hostname myvm \
  --user user \
  --name user \
  --pass default \
  --addpkg unattended-upgrades
  --addpkg acpid \
  --addpkg openssh-server \
  --addpkg lighttpd \
  --mirror http://192.168.2.2:3142/ubuntu
{% endhighlight %}

This is just an example, but basically: it builds a maverick VM, using JeOS, for i386, and use the previously defined disk partitions. The VM will use a given IP address, hostname, user/password. we will also install by default the packages unattended-upgrades, acpid, openssh-server and lighttpd.

The list flag "--mirror" specifies the IP of apt-cacher that we set up in 1.

Run that, and a VM should be ready in about 15 min (on my old laptop).

### 4\. Run the VM ###

A directory is created, with a run.sh file. Executing this script will run the VM. It is also possible to use virt-manager: `sudo virt-manager -c qemu:///system`
That's nice to have an overview of multiple VMs running.

### 5\. Never sleep. Ever ###

I spent 1 night not being able to start the VM. The image was here, but kvm would not boot it.

The next day after very little sleep, I found a <a href="http://www.mail-archive.com/kvm@vger.kernel.org/msg39396.html" target="_blank">bug report and patch</a> for my current kernel: the kernel I was running (uname -r) was 2.6.35-something-something. Turns out that there is a bug in this kernel, for some intel CPUs, etc. Booting ubuntu with another kernel (hold shift when Grub boots) "fixed" the problem automagically.

### References ###

<a href="https://help.ubuntu.com/10.10/serverguide/C/virtualization.html">https://help.ubuntu.com/10.10/serverguide/C/virtualization.html</a>
