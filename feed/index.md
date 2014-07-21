---
layout: nil
---
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">

 <title>Dear Future Me</title>
 <link href="http://b.leppoc.net/atom.xml" rel="self"/>
 <link href="http://b.leppoc.net/"/>
 <updated>{{ site.time | date_to_xmlschema }}</updated>
 <id>http://b.leppoc.net/</id>
 <author>
   <name>Yohann Coppel</name>
 </author>

 {% for post in site.posts limit: 30 %}
 <entry>
   <title>{{ post.title }}</title>
   <link href="http://b.leppoc.net{{ post.url }}"/>
   <updated>{{ post.date | date_to_xmlschema }}</updated>
   <id>http://b.leppoc.net{{ post.id }}</id>
   <content type="html">{{ post.content | xml_escape | truncatewords: 200 }}</content>
 </entry>
 {% endfor %}

</feed>
