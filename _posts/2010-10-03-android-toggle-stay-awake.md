---
layout: post
title: Android toggle "stay awake"

post_id: 311
categories:
- Android
- argh!
- Code
- Software
---

If you develop stuff on android, you may find yourself often going into settings, and toggle the "stay awake" setting under Development. It takes about... I don't know... maybe 15 seconds to do so. But I do it quite often. If I don't, I either have to unlock the phone every 3 minutes, or, if I forget to uncheck the option, my phone screen will stay on all night while charging.... not good.

So I looked for "stay awake" in the android market, looking for a home screen widget that would do the (simple) trick....

There are basically these apps at the time of this writing: AppInventor Toggle, Free Power Widget and the full paying version, Development Control and Stay Awake. But they all have some problems (according to me):

- AppInventor Toggle cost $0.97
- Free Power Widget is free, but shows a notification message, just to be annoying, to get you to buy the paying version
- Power Widget, the full version, cost $2.05
- Development Control requires access to my location and full Internet access: WTF ???? I guess it's for ads...
- Stay Awake cost $1.99

WHAT ?

Some of these apps are a just a simple button, you click on it, and it toggles some settings in the system. That's all they are supposed to do, that's all I want them to do. No, I don't want to pay $2  for such a simple thing. It doesn't need ads either, and it doesn't need to bug me with a status message until I buy the full version.

So, just to make sure, I decided to write my own, to see how long it would take me, and how complicated it is.

It took me about 3 hours, including designing the 4 icons (they are maybe not the best ever, granted), finding and reading documentation on how to access and modify system settings, how to create a home screen widget, intents and permissions. The code itself is exactly 128 lines long, plus about 20 lines of XML for configuration files.

What can I do with it ? I would really feel bad to put ads on an app that took me 3 hours to build. Or ask $2 for it. Not even talking about looking at my users' location or accessing internet through this app.
I am not saying that all the above apps are all this simple. Power Widget in particular seems to have a lot of different widgets and a lot of configuration. Mine doesn't have all that, it just does what I want: toggle a simple system setting. I will just put it for free on the market, if it helps someone.... :) Oh, and if I find some time, I will also put the code open source on github.

