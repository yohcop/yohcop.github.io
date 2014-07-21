---
layout: post
title: Django custom tags and filters

post_id: 215
categories:
- Code
- django
- hack
- python
---

3 examples of django custom tags and filters.

{% highlight python linenos %}
from django.template import Node, Library, resolve_variable

# Tag that set a context variable.
# Example uses are in setvar function. It's kinda stupid/dirty function
# for assigning lists as well. It should probably be 2 different tags.
# But it's easy to do from here.
class SetVar(Node):
  def __init__(self, variable, value, valueIsVariable=False):
    self.valueIsVariable = valueIsVariable
    self.variable = variable
    self.value = value

  def render(self, context):
    if self.valueIsVariable:
      context.dicts[-1][self.variable] = \
          resolve_variable(self.value, context)
    else:
      context.dicts[-1][self.variable] = self.value
    return ''

def setvar(parser, token):
  bits = token.split_contents()
  # first case: {{ "{% setvar myVar as otherVar "}}%}
  if len(bits) == 4 and bits[2] == "as":
    return SetVar(bits[1], bits[3], True)
  # second case: {{ "{% setvar myVar abcd "}}%}
  # myVar = "abcd"
  if len(bits) == 3:
    return SetVar(bits[1], bits[2])
  # {{ "{% setvar myVar "}}%}
  # myVar = None
  elif len(bits) == 2:
    return SetVar(bits[1], None)
  # {{ "{% setvar myVar a b c d e f "}}%}
  # myVar = ['a', 'b', 'c', 'd', 'e', 'f']
  return SetVar(bits[1], bits[2:])

#==========================
# Filter jsid. Very simple replace to make a basic domain
# name a valid javascript ID.

def jsid(value):
  return 'z_' + value.replace('.', '_').replace('-', '__')

#==========================
# Tag that split a string using a separator, and put the result
# in a context variable.
# {{ "{% split myVar "," otherVar "}}%}
# if myVar is "a,b,c,d", then otherVar = ['a', 'b', 'c', 'd']

class SplitStringOn(Node):
  def __init__(self, string, spliton, result):
    self.string = string
    self.spliton = spliton
    self.result = result

  def render(self, context):
    txt = resolve_variable(self.string, context)
    context[self.result] = txt.split(self.spliton)
    return ''

def split(parser, token):
  bits = token.split_contents()
  if len(bits) == 4:
    # the second argument (bits[2]) will be something like "asd" - including the ".
    # So we remove them.
    return SplitStringOn(bits[1], bits[2][1:-1], bits[3])
  raise TemplateSyntaxError, "split tag takes exactly 3 arguments"
{% endhighlight %}
