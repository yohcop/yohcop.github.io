---
layout: post
title: Capturing keyboard events and keys with JQuery
post_id: 411
categories:
- Code
- hack
- html
- javascript
- jquery
- Software
---

There are tons of tutorials on how to capture keyboard events in javascript, especially to create keyboard shortcuts.

However, I could not find a way to get all the actual keys that were pressed to simulate a text field. For example, punctuation, or special characters such as &, #, @.... would not be returned by `String.fromCharCode(event.which)` (where `event.which` is a normalized field created by JQuery).

It turns out that using keydown and keypress events don't do the same thing. It seems obvious now, but it took me some time to find out.

So, basically:
{% highlight javascript %}
$("body").keydown(function(event) {
  var w = event.which;
  $("body").append("keydown=" + w + ": "
      + String.fromCharCode(w) + "
");
});
{% endhighlight %}

And

{% highlight javascript %}
$("body").keypress(function(event) {
  var w = event.which;
  $("body").append("keypress=" + w + ": "
      + String.fromCharCode(w) + " ");
});
{% endhighlight %}

Are different things. And actually, in the first one, using `String.fromCharCode` is just plain WRONG !

But the keydown event is still needed to capture things like arrow keys, backspace, shift, ctrl. In that case, compare event.which to the key codes: 8 for backspace, 38 for down, etc.
