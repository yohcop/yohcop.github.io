---
layout: post
title: "Operation: Arduino Lo-jack"

categories:
- Arduino
- electronics
- stuff
- hack
- gps
- make
---

Here is my car lo-jack system I just finished prototyping.

<a href="https://picasaweb.google.com/lh/photo/R8FE4SWTkV7fEtD7TAVobLwsYktx8mh5VMZRjcgUh04?feat=embedwebsite"><img src="https://lh6.googleusercontent.com/_6NXBGgdOHko/TbMl_wgLFZI/AAAAAAAABDQ/5jxxJLXR-AY/s400/IMG_20110423_121212.jpg" height="247" width="400" /></a>

It uses an Arduino, a cellular shield with a SIM card, a GPS, and a RFID reader.

The basic idea is that when I get in car, I have with me a RFID card. Before starting the engine, I have to scan the RFID card. Since it's RFID, there is no contact needed, and the reader can be completely hidden inside the dashboard and I don't even have to take the card out of my wallet. If the card is correctly detected, nothing happens.

However, if someone wants to "borrow" the car without my permission, this person probably

- doesn't know the system exists,
- wouldn't know where to scan the card,
- doesn't have a valid RFID card,
- is not willing to do a full car inspection at this moment.

Assuming all this, this is what happens next: so he gets in the car, do his ignition magic to get the car started, and take it for a ride. Since no valid RFID card was scanned, the system enters a "silent alarm mode". The first thing it does is get a GPS position, and connect to the cellphone network. Then it sends me a first text message, with the latest GPS position, and other useful information (speed, heading, etc)

As long as the car is running, the system will send me those text messages every 5 minutes, while tracking the car's position.

Now, since the system basically includes a cellphone, I can also text the car, and remotely configure the system. I can for example:

- enable or disable the alarm - if a card was actually scanned, I can still enable the alarm - vice versa: if I forget the RFID tag, I can still turn off the alarm,
- enable or disable tracking - similar to "alarm" mode, but with tunable SMS frequency. More on that later.
- set tracking update frequency,
- change tracking phone number,
- ping the Arduino, and get a one time position message.

## The 'System'

As I said, there are 4 main components: Arduino, Cellular shield with SIM card, RFID tag reader and GPS receiver.

I used the <a href="http://arduiniana.org/libraries/newsoftserial/">NewSoftSerial library</a> for every serial communications between the Arduino, and the different parts (Cell shield, GPS and RFID reader). I wanted to have the hardware serial free for debugging. This created a bunch of extra challenges as well, since with NewSoftSerial, it is only possible to communicate with 1 of the serial components at a time, meanwhile all other serial input from other components is lost. Forever.

### Cell shield

Here is the Cell shield and the antenna:

<a href="https://picasaweb.google.com/lh/photo/Btqyt_nHdjEg6VBJVpvnmbwsYktx8mh5VMZRjcgUh04?feat=embedwebsite"><img src="https://lh5.googleusercontent.com/_6NXBGgdOHko/TbMjTEIxV2I/AAAAAAAAA-k/HQdi_DPD06g/s400/IMG_20110423_120307.jpg" height="300" width="400" /></a>

It embeds a SM5100B chip. It is quite easy to use. The only thing is the lack of nice Arduino library. So I had to parse the messages coming from the cell myself. If I have some time, I will try to make this a library too.

First thing, I changed the baud rate and GSM frequency of the CELL module. This has to be done only once, and is saved permanently in the cell shield memory. I had to use 4800 bauds, as it made it easier to parse the incoming text messages reliably. Then set the frequency I needed - this is for T-mobile (GSM850/PCS1900).

{% highlight c %}
  // Use 4800 bauds to communicate with the Arduino.
  cell.println("AT+IPR=4800");
  // GSM850 / PCS1900
  cell.println("AT+SBAND=7");
{% endhighlight %}


When the system starts, just wait a few seconds, until the cell module is ready:

{% highlight c %}
  if (SerialReadUntil(&cell, "+SIND: 4", 45*1000)) {
    Serial.println("CELL ready");
  } else {
    Serial.println("CELL not yet ready");
  }
{% endhighlight %}

`+SIND: 4` indicates that the cell module is connected to the network, and ready to be used.

Sending a text message is quite easy, once the module is initialized:

{% highlight c %}
  cell.print("AT+CMGS=\"");
  cell.print(sendTrackingSmsTo);  // phone number
  cell.println("\"");
  cell.print(message);
  cell.print(0x1A, BYTE); // this is ctrl-z
  cell.flush();
{% endhighlight %}

Due to the NewSoftSerial limitation, I can not permanently listen to the cell shield. So when a message is received, I may miss it if I am currently reading the GPS position for example. This is not great.

To overcome that, every time the I enter the "CELL" state, I check the first 10 memory positions of the SIM card, see if new messages are there:

{% highlight c %}
void CELLreadMessages() {
  for (int i = 0; i < 10; i++) {
    CELLreadMessage(i);
  }
}
{% endhighlight %}

For each of those positions, I try to retrieve the message at that position. If there is one, the cell shield will answer with a line starting with `+CMGR:`, followed by the message information (origin, time/date, etc) and content.

{% highlight c %}
void CELLreadMessage(int i) {
  cell.print("AT+CMGR=");
  cell.println(i);

  // Wait for a line starting with "+CMGR:". If we got nothing in 500ms, give up.
  if (!SerialReadUntil(&cell, "+CMGR:", 500)) {
    return;
  }
  // Make some LED blink :)
  digitalWrite(LEDPin, HIGH);
  boolean toDelete = CELLparseMessage(false);
  digitalWrite(LEDPin, LOW);
  if (toDelete) {
    // If the message was read correctly, delete it.
    CELLdeleteMessage(i);
  }
}
{% endhighlight %}

What is more tricky is to parse incoming messages. The code is quite long, so I won't put it here. It is available in the <a href="https://github.com/yohcop/jeepalarm">git repos</a> (look at CELLparseMessage());

One important thing is checking where the text message comes from, so not anyone can ping the car, and get its current position, or worst, disable the alarm, or change the delivery phone number. Only text messages coming from my phone number are accepted. I believe it is relatively easy to forge, but technically, I am also the only one who knows the system's phone number anyway. One thing that I will add, is checking for a passphrase as well, so I can control the alarm via any phone, in case of emergency (e.g. the car is stolen, but my phone ran out of battery - I can send a message with the passphrase from a friend's phone).

And finally, once the message is read, it is delete with something like:

{% highlight c %}
void CELLdeleteMessage(int i) {
  // Delete 1 message.
  cell.print("AT+CMGD=");
  cell.print(i);
  cell.println(",0");
  CELLdelay(2000);  // Wait a bit before next operation.
}
{% endhighlight %}

### GPS

<a href="https://picasaweb.google.com/lh/photo/opIk_r1Jiiyx1ya8ws_YcLwsYktx8mh5VMZRjcgUh04?feat=embedwebsite"><img src="https://lh5.googleusercontent.com/_6NXBGgdOHko/TbMnLkYfTFI/AAAAAAAAA_g/m_0QE9qi7ZQ/s400/IMG_20110423_121629.jpg" height="300" width="400" /></a>

The GPS module (the white/beige thing on this picture) is also programmed and read with the NewSoftSerial library.

The first thing I had to do was make sure it was setup to use 9600 bauds, and reduce the frequency of updates to 1Hz. It is enough, even though the chip can go up to 10Hz. This is saved in the chip's memory, so I don't have to do that evey time the system starts.

On startup, I ask for only 3 types of NMEA sequences that I care about:

{% highlight c %}
  gps.begin(9600);
  gps.println(GPSchecksum("PMTK314,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0"));
{% endhighlight %}

When sending commands to the GPS module, all strings need to finish with a checksum. You can compute it separately and send the whole string, but to make it easier, I wrote a GPSchecksum function that takes a string, and returns the same string, with the correct checksum, and header:

{% highlight c %}
String GPSchecksum(String str) {
  int ck = 0;
  for (int i = 0; i < str.length(); i++) {
    ck ^= str.charAt(i);
  }
  return "$" + str + "*" + String(ck % 256, HEX).toUpperCase();
}
{% endhighlight %}

While the system is running, the Arduino reads the serial input for the GPS, and parses it using the <a href="http://arduiniana.org/libraries/tinygps/">TinyGPS library</a>.

{% highlight c %}
void GPSturn() {
  unsigned long start = millis();
  unsigned long lastPrint = start;

  while (millis() - start < GPSturnInMs) {
    if(GPSconsume()) {
      if (millis() - lastPrint > GPSdumpEachMs) {
        GPSdump(gpsinfo);  // Dumps GPS info on serial output.
        lastPrint = millis();
      }
    }
  }
}

boolean GPSconsume() {
  while (gps.available()) {
    if (gpsinfo.encode(gps.read())) {
      return true;
    }
  }
  return false;
}
{% endhighlight %}

The GPSdump is not really needed, it is only present for debugging purposes.

I think most of this code comes from the examples of the TinyGPS library. Yay!

The GPS chip is really fast to get a fix. Usually, by the time the cell is connected to the network, the GPS already have a fix (under 30 seconds).

### RFID

The RFID reader (The black thing with "ID-20" on it) is only used when the system starts, to try to find out who is starting the car.

<a href="https://picasaweb.google.com/lh/photo/E-6fs6MuyRXFVx1mmibbdLwsYktx8mh5VMZRjcgUh04?feat=embedwebsite"><img src="https://lh3.googleusercontent.com/_6NXBGgdOHko/TbMjoBtnsDI/AAAAAAAAA94/ZjxPnnz5yss/s400/IMG_20110423_120420.jpg" height="300" width="400" /></a>

For now, it is mounted on the proto shield, but since it only needs 4/5 wires, I will probably mount it at the end of an Ethernet cable, making it easy to place at the right position in the car.

The code to read a tag is quite simple (mostly from <a href="http://bildr.org/2011/02/rfid-arduino/">this blog</a>)

{% highlight c %}
boolean RFIDread() {
  char tagString[13] = "";
  int index = 0;
  boolean reading = false;

  while(rfid.available()){
    int readByte = rfid.read(); //read next available byte

    if(readByte == 2) {
      reading = true; //beginning of tag
      index = 0;
    } else if(readByte == 3) {
      reading = false; //end of tag
    }

    if(reading && readByte != 2 && readByte != 10 && index < 12){
      //store the tag
      tagString[index] = readByte;
      index ++;
    }
  }

  boolean ok = RFIDcheckTag(tagString); //Check if it is a match
  RFIDclearTag(tagString); //Clear the char of all value
  RFIDresetReader(); //reset the RFID reader
  return ok;
}
{% endhighlight %}

It returns true if a valid (known) tag was scanned, false otherwise.

### Putting it together

This is the layout on the breadboard:

<a href="https://picasaweb.google.com/lh/photo/ZXwa-J8qTuB-BM9PmRdB1LwsYktx8mh5VMZRjcgUh04?feat=embedwebsite"><img src="https://lh6.googleusercontent.com/_6NXBGgdOHko/TbN03_BD_5I/AAAAAAAABDo/zrl0FX7AKWk/s400/JeepAlarmBreadboard.jpg" height="291" width="400" /></a>

With the GPS and RFID reader:

<a href="https://picasaweb.google.com/lh/photo/2cDqXPd9Me_tyROItfPnarwsYktx8mh5VMZRjcgUh04?feat=embedwebsite"><img src="https://lh6.googleusercontent.com/_6NXBGgdOHko/TbMl5HNW28I/AAAAAAAAA_I/oV_6MCd0tSA/s400/IMG_20110423_121502.jpg" height="300" width="400" /></a>

And, the only thing left is to sandwich everything together:

<a href="https://picasaweb.google.com/lh/photo/IwJw9nrHpyInYolkczeckrwsYktx8mh5VMZRjcgUh04?feat=embedwebsite"><img src="https://lh4.googleusercontent.com/_6NXBGgdOHko/TbMmwymthvI/AAAAAAAAA_U/Y42aO8xHx6U/s400/IMG_20110423_121548.jpg" height="300" width="400" /></a>

This is a extract form the `setup()` function. It reads RFID tags, and setup the Cell shield.

{% highlight c %}
void setup() {
  // skipped stuff here... Initialize serial communication between components

  unsigned long start = millis();
  // Try to read a valid RFID tag for a few seconds.
  while (millis() - start < timeToWaitForTagInMs && alarm) {
    alarm = !RFIDread();
  }

  if (alarm) {
    // Uh oh...
    Serial.print("No RFID Tag found in(ms) ");
    Serial.println(timeToWaitForTagInMs);
  } else {
    Serial.println("RFID Ok");
  }

  CELLsetup();
}
{% endhighlight %}

And the main loop here:

{% highlight c %}
void loop() {
  GPSturn();  // Read the GPS info for about 10 sec.
  CELLturn();  // Send/check for sms, etc.
  DEBUGstate();  // Prints some debug info. Not needed once in the car.
}
{% endhighlight %}

We already saw the `GPSturn()` function, here is the `CELLturn()` function:

{% highlight c %}
void CELLturn() {
  // Makes the CELL shield active in the NewSoftSerial library.
  CELLdelay(100);

  cell.println("AT+CMGF=1"); // set SMS mode to text
  if (!SerialReadUntil(&cell, "OK", 5*1000)) {
    Serial.println("Not ready for text?");
    //return;  // Actually, let's try anyway ;)
  }

  // Check if we need to send a sms ?
  if (ShouldSendSMS()) {
    CELLSendSMS();
  }

  // Set SMS delivery options.
  cell.println("AT+CNMI=3,3");
  if (!SerialReadUntil(&cell, "OK", 5*1000)) {
    return;
  }

  CELLreadMessages();
}
{% endhighlight %}

Note that going into SMS mode and setting the SMS delivery options could probably be done in the initialization function. While debugging, I had trouble in situations where the cell module would not register in the network, and I wasn't sure if the `AT+CMGF` and `AT+CNMI` commands were working correctly when not registered.

So for now, I do them in every loop (that's about every 15-20 seconds). It doesn't seem to hurt.

Finally, here is the function that decides if a text message should be sent at every loop:

{% highlight c %}
boolean ShouldSendSMS() {
  unsigned long timeSinceLast = millis() - lastSmsSent;

  boolean sendSMS = false;
  // Check if the alarm wants to send a message.
  if (alarm && (lastSmsSent == 0 || timeSinceLast > alarmFrequencyInMs)) {
    sendSMS = true;
  }

  // Check if we are tracking.
  if (tracking && (lastSmsSent == 0 || timeSinceLast > updateFrequencyInMs)) {
    sendSMS = true;
  }

  // Check if we want a ping
  if (ping) {
    sendSMS = true;
  }

  return sendSMS;
}
{% endhighlight %}

You can see that 3 things can decide to send a text message:

- alarm: set to `true` if no RFID tag was read initially. It sends a message every 5 minutes (hardcoded), the frequency can not be changed.
- tracking: always set to `false` on startup. Can be enabled via SMS, and frequency of messages can be tweaked via SMS
- ping: a one-off thing.

The main motivation behind having two (alarm vs tracking) modes, was to be able to tell what was the event that triggered sending a sms: alarm or tracking instruction sent via sms. I don't think it's really needed, but it's there...


## Text message

This is the type of message sent to my cell phone when the alarm or tracking is on:

    Pos:48.858279,2.294482 Alt:95m Date:2011-04-23T07:45:54 Course:26
    Speed:0mph,0kph (a1t0)

It is pretty self explanatory, except the last block in parenthesis: it says if the alarm (`a`) and tracking (`t`) are on (`1`) or off (`0`). So `a1t0` means "alarm is on, tracking is off".

Here is the function that assembles the text message:

{% highlight c %}
void AssembleSMS(char message[160]) {
  float flat, flon;
  unsigned long age, date, time;
  int year;
  byte month, day, hour, minute, second, hundredths;

  gpsinfo.f_get_position(&flat, &flon, &age);
  gpsinfo.get_datetime(&date, &time, &age);
  gpsinfo.crack_datetime(&year, &month, &day,
      &hour, &minute, &second, &hundredths, &age);

  char strFloat[16];
  dtostrf(flat, 1, 7, strFloat);
  int p = sprintf(message, "Pos:%s,", strFloat);
  // Max: 16 + 5 = 21
  dtostrf(flon, 1, 7, strFloat);
  p += sprintf(message + p, "%s ", strFloat);
  // Max: (21) + 16 + 1 = 38

  dtostrf(gpsinfo.f_altitude(), 1, 0, strFloat);
  p += sprintf(message + p, "Alt:%sm ", strFloat);
  // Max: (38) + 16 + 6 = 60

  p += sprintf(message + p, "Date:%d-%02d-%02dT%02d:%02d:%02d ",
               year, month, day, hour, minute, second);
  // Max: (60) + 25 = 85

  dtostrf(gpsinfo.f_course(), 1, 0, strFloat);
  p += sprintf(message + p, "Course:%s ", strFloat);
  // Max: (85) + 16 + 8 = 109

  dtostrf(gpsinfo.f_speed_mph(), 1, 0, strFloat);
  p += sprintf(message + p, "Speed:%smph,", strFloat);
  // Max: (109) + 16 + 10 = 135

  dtostrf(gpsinfo.f_speed_kmph(), 1, 0, strFloat);
  p += sprintf(message + p, "%skph ", strFloat);
  // Max: (135) + 16 + 4 = 155

  p += sprintf(message + p, "(a%dt%d)", alarm ? 1 : 0, tracking ? 1 : 0);
  // Max: (155) + 6 = 161!!
}
{% endhighlight %}

Comments are my quick calculations of worst-case maximum length. I end up with 161 characters (160 being the max size for a SMS), I am being pessimistic in many places (speed for example should not be more than 3 digits... I hope). Usually real-life text messages are about 95-100 characters, so I am safe.

## Remote control via SMS

When a text message is received, it is parsed and interpreted. Here are the commands it understands:

- `#a0` and `#a1`: disables or enables alarm
- `#t0` and `#t1`: disables or enables tracking
- `#f30s`, `#f2m`, `#f1h`, etc. : sets tracking update frequency in seconds, minutes, or hours. Of course you can give any value before the unit.
- `#n5551110707`: sets the phone number to send updates to, to 5551110707
- `#p`: ping! The arduino will answer with latest position.

Any combination of those is valid. For example:

    #t1 #f90s #n5551230000

turns on tracking with frequency set to 90 seconds, and sets the phone number. If I then realize 90 seconds is way too chatty, I can just send

    #f5m

to set the update frequency to 5 minutes. Pretty simple. The maximum time between updates is 9 hours and something, which is the maximum number of milliseconds an `unsigned long` can hold. Way more than enough.


## Over engineering

Alright, so sending a text message with GPS coordinates is technically all what's needed to find the car. But that's borderline under-engineered.

So...

I actually send the text message to a Google Voice account. This does 2 things:

- forward the SMS to my phone,
- forward the SMS to my gmail account.

In GMail, I have the following filter setup:

    Matches: from:(txt.voice.google.com) Pos Alt Date Course Speed
    Do this: Forward to <secret-email>@<some-app-id>.appspotmail.com, Mark it as important

Basically it says: if an email comes from Google voice, and has the words "Pos", "Alt", etc. in it, forward it to an appengine app.

The appengine app receives the sms via email, and saves it in the datastore:

![Appengine datastore](/files/smsdatastore.png)

Finally, I can simply parse the messages, and visualize the last positions using Google Maps:

![Alarm mapping](/files/alarmmap.png)

Access to the appengine app is password protected, so only *I* can see the map.

## Conclusion, code and more pictures

There you have it. An over-engineered lo-jack car protection, remotely controllable, integrated with appengine and Google Maps.

<a href="https://picasaweb.google.com/lh/photo/IwJw9nrHpyInYolkczeckrwsYktx8mh5VMZRjcgUh04?feat=embedwebsite"><img src="https://lh4.googleusercontent.com/_6NXBGgdOHko/TbMmwymthvI/AAAAAAAAA_U/Y42aO8xHx6U/s400/IMG_20110423_121548.jpg" height="300" width="400" /></a>

All the code (arduino code, and appengine app) is <a href="https://github.com/yohcop/jeepalarm">opensource on Github</a>.

<a href="https://picasaweb.google.com/yohcop/JeepAlarm?authkey=Gv1sRgCLj5rerE36OHlQE&feat=directlink">More pictures</a>

Now, there is probably a bunch of stuff done wrong, especially in controlling the Cell shield. It is working, but if anyone has suggestions or sees mistakes, please let me know!

### Stuff

The list of major components:

- Arduino Duemilanove
- <a href="http://www.sparkfun.com/products/9607">Cell shield</a>
- <a href="http://www.sparkfun.com/products/675">Cell antena</a>
- <a href="http://www.sparkfun.com/products/8628">RFID reader</a>
- <a href="http://www.sparkfun.com/products/8423">RFID breakout board</a>
- <a href="http://www.sparkfun.com/products/8975">GPS module</a>
- plus a bunch of small components, pin headers, LED, etc.

Total is around $250.

### References and inspiration

- <a href="http://bildr.org/2011/02/rfid-arduino/">Blog article</a> about using the ID-20 RFID reader
- <a href="http://arduiniana.org/libraries/newsoftserial/">NewSoftSerial library</a>
- <a href="http://arduiniana.org/libraries/tinygps/">TinyGPS library</a>
- The <a href="http://www.janspace.com/b2evolution/arduino.php/2010/06/26/scooterputer">Scooterputer</a>

