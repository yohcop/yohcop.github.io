---
layout: post
title: Simple webserver in python

post_id: 234
categories:
- Code
- hack
- python
- webserver
---

Ok, all this code is somewhere on the web, but at least I will know how to find it again....

It shows how to:
<ul>
	<li>Write a quick simple python web server</li>
	<li>Handle GET and POST requests</li>
	<li>Parse parameters from a GET request (there may be a better way though)</li>
	<li>Parse parameters from a POST request</li>
	<li>File upload</li>
	<li>Set a cookie and read it back</li>
	<li>Do a simple HTTP redirect</li>
</ul>

The code is dirty and was extracted from the app I already wrote, trying to remove irrelevant stuff.
The HTML in particular are just bits, and do not produce valid HTML pages. But you get the idea.

<!--more-->

{% highlight python linenos %}
import cgi
import Cookie
import sys
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer

class MainHandler(BaseHTTPRequestHandler):
  def do_GET(self):
    if self.path=='/favicon.ico':
      return
    p = self.path.split("?")
    path = p[0][1:].split("/")
    params = {}
    if len(p) > 1:
      params = cgi.parse_qs(p[1], True, True)
    # do stuff...

  def do_POST(self):
    # Pretty much the same as do_READ()
    # call WriteCookie() or DoSomethingWithUploadedFile()...
    # other stuff....

  def DoSomethingWithUploadedFile(self, groupId):
    ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
    query = cgi.parse_multipart(self.rfile, pdict)
    self.send_response(200)
    self.end_headers()
    fileContent = query.get('file')[0]
    # do something with fileContent
    self.wfile.write("POST OK.");

  def RedirectTo(self, url, timeout=0):
    self.wfile.write("""<html><head>
      <meta HTTP-EQUIV="REFRESH"
            content="%i; url=%s"/></head>""" % (timeout, url))

  def WriteCookie(self):
    # Shows how to read form values from a POST request
    # and write a cookie with a value from the form
    form = cgi.FieldStorage(headers=self.headers, fp=self.rfile,
    environ={'REQUEST_METHOD':'POST',
             'CONTENT_TYPE':self.headers['Content-Type']})

    val = form.getfirst('myvalue', None)
    self.send_response(200)
    self.send_header('Content-type', 'text/html')
    if val:
      c = Cookie.SimpleCookie()
      c['value'] = val
      self.send_header('Set-Cookie', c.output(header=''))
      self.end_headers()
      self.RedirectTo(form.getfirst('follow', '/'))
    else:
      self.end_headers()
      self.wfile.write("No username ?")

  def ReadCookie(self):
    if "Cookie" in self.headers:
      c = Cookie.SimpleCookie(self.headers["Cookie"])
      return c['value'].value
    return None

def main(port):
  try:
    server = HTTPServer(('', int(port)), MainHandler)
    print 'started httpserver...'
    server.serve_forever()
  except KeyboardInterrupt:
    print '^C received, shutting down server'
    server.socket.close()

if __name__ == '__main__':
  main(sys.argv[1])
{% endhighlight %}
