//#!/bin/sh
//exec scala $0 $@
//!#

import scala.xml._

println("Reading file")
val xml = XML.loadString(scala.io.Source.fromFile("/tmp/gpsdata_trk.gpx").mkString)
assert(xml.isInstanceOf[scala.xml.Elem])

println("Done")

var maxSpeed = 0f
var averageSpeed = 0f
var totalDistance = 0f
var points = 0
var startTime = ""
var endTime = ""
var lastAltitude = 0f
var cumulAltitude = 0f

def resetTrack() {
  points = 0
  maxSpeed = 0f
  averageSpeed = 0f
  totalDistance = 0f
  startTime = ""
  endTime = ""
  lastAltitude = 0f
  cumulAltitude = 0f
}

def printStats() {
  println("way points: " + points)
  println("Max speed: " + maxSpeed)
  println("Avg speed: " + averageSpeed)
  println("Total dist: " + totalDistance)
  println("Start at: " + startTime)
  println("   until: " + endTime)
  println("Elevation: " + cumulAltitude)
}

def processTrkpt(trkpt: Seq[Node]) =
  <trkpt>{for (inTrkpt <- trkpt) yield {
    points += 1
    inTrkpt match {
      case <ele>{ele}</ele> => //println("ele: " + ele)
        val thisEle = java.lang.Float.parseFloat(ele.text)
        if (points != 0 && thisEle > lastAltitude) {
          cumulAltitude += thisEle - lastAltitude
        }
        lastAltitude = thisEle
        <ele>{ele}</ele>
      case <time>{time}</time> => //println("time: " + time)
        if (points == 0) startTime = time.text
        endTime = time.text
        <time>{time}</time>
      case <type>{tpe}</type> => <type>{tpe}</type> //println("type: " + tpe)
      case <fix>{fix}</fix> => <fix>{fix}</fix> //println("fix: " + fix)
      case <sat>{sat}</sat> => <sat>{sat}</sat> //println("sat: " + sat)
      case <hdop>{hdop}</hdop> => //println("hdop: " + hdop)
      case <extensions>{extensions @ _*}</extensions> => for (ext <- extensions) ext match {
        case <wptExtension>{wptExt @ _*}</wptExtension> => for (inWptExt <- wptExt) inWptExt match {
          case <valid>{valid}</valid> => //println("valid: " + valid)
          case <speed>{speed}</speed> => //println("speed: " + speed)
            val thisSpeed = java.lang.Float.parseFloat(speed.text)
            if (thisSpeed > maxSpeed) maxSpeed = thisSpeed
          case <satinview>{satinview}</satinview> => //println("satinview: " + satinview)
          case <distance>{distance}</distance> => //println("distance: " + distance)
            if (points > 0) totalDistance += java.lang.Float.parseFloat(distance.text)
          case _ =>
        }
        case _ =>
      }
      case _ =>
    }
  } }</trkpt>

def trkseg(seg: Seq[Node]) =
  <trkseg>{for (inSeg <- seg) yield inSeg match {
    case <trkpt>{trkpt @ _*}</trkpt> => processTrkpt(trkpt)
    case _ =>
  } }</trkseg>

val res = xml match {
  case <gpx>{gpxdata @ _*}</gpx> => <gpx>{for (data <- gpxdata) yield data match {
    case <metadata>{metadata @ _*}</metadata> => <metadata>{for (inMetadata <- metadata) yield inMetadata match {
      case <time>{time}</time> => <time>{time}</time> //println("time: " + time)
      case <bounds></bounds> => //println("bounds: " + inMetadata)
      case _ =>
    } }</metadata>
    case <trk>{trk @ _*}</trk> =>
      resetTrack()
      var selectTrack = false
      for (inTrk <- trk) yield inTrk match {
        case <name>{name}</name> =>
          println()
          println("Name: " + name)
          if (name == "2010-01-31T20:49:28Z" ||
              name == "2010-02-01T01:16:49Z" ||
              name == "2010-02-01T01:18:53Z" ||
              name == "2010-02-01T01:33:19Z") {
            selectTrack = true
          }
          <name>{name}</name>
        case <trkseg>{seg @ _*}</trkseg> => trkseg(seg)
        case _ => inTrk
      }
      printStats()
      if (selectTrack) {
        data
      } else {}
    case _ =>  // Something unknown in <gpx>
  } }</gpx>
  case _ => println("no gpx data ?")
}

val out = new java.io.FileWriter("/tmp/out.gpx")
out.write(res.toString)
out.close
