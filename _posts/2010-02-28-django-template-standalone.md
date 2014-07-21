---
layout: post
title: Django template standalone

post_id: 219
categories:
- Code
- django
- hack
- python
---

When writing a <a href="{{ site.baseurl }}/2010/02/12/simple-webserver-in-python/">python webserver</a>, using django templates is an easy way to print HTML and have access to powerful functionalities.

You may want to use them standalone, without the whole django thing around though. Here are some useful snippet of code to achieve that.

You can also have a look at the <a href="{{ site.baseurl }}/2010/02/28/django-custom-tags-and-filters/">custom tags and filters</a> used in this example.

{% highlight python %}
from django.conf import settings
settings.configure(TEMPLATE_DIRS=('templates',), DEBUG=False,
                   TEMPLATE_DEBUG=False)
from django import template
from django.template import Template, loader, Context

def SetupDjangoFiltersAndTags():
  # See django doc on hwo to define your own tags and filters.
  # Here, imagine I have 2 tags and 1 filter: setvar, split and jsid.
  from templatetags import jsid, setvar, split
  register = template.Library()
  register.filter('jsid', jsid)
  register.tag('setvar', setvar)
  register.tag('split', split)
  template.builtins.append(register)
  # Then your template can use {{ "{{myVar|jsid"}}}}, or
  # {{ "{% setvar myVar newVar "}}%}...
{% endhighlight %}

And then, the usage part:

{% highlight python %}
# In a BaseHTTPRequestHandler subclass for example:
def UseTemplate(self):
  self.send_response(200)
  self.send_header('Content-type', 'text/html')
  self.end_headers()
  t = loader.get_template("mytemplate.html")
  group = {'var': 123, 'user': username}
  c = Context(group)
  self.wfile.write(t.render(c))
{% endhighlight %}

References:

- [Django builtins tags and filters](http://docs.djangoproject.com/en/dev/ref/templates/builtins/)
- [Django custom tags and filters](http://docs.djangoproject.com/en/1.1/howto/custom-template-tags/)
- [Django doc](http://docs.djangoproject.com/en/1.1/)
