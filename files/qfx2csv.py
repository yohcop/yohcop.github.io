#!/usr/bin/env python

# This program is free software. It comes without any warranty, to
# the extent permitted by applicable law. You can redistribute it
# and/or modify it under the terms of the Do What The Fuck You Want
# To Public License, Version 2, as published by Sam Hocevar. See
# http://sam.zoy.org/wtfpl/COPYING for more details.

# USAGE:
# python thisfile input.qfx output.csv

import sys
import re
import csv

printedTags = ['trntype', 'dtposted', 'dtuser', 'trnamt', 'fitid', 'name', 'memo' ]

class Transaction:
  def __init__(self):
    self.tags = {}
  def set(self, tag, val):
    self.tags[tag] = val
  def csvLine(self):
    line = []
    for tag in printedTags:
      if tag in self.tags:
        line.append(self.tags[tag])
      else:
        line.append("")
    return line

class Qfx:
  def __init__(self):
    self.transactions = []
  def addTransaction(self, trn):
    self.transactions.append(trn)
  def toCsv(self, filename):
    c = csv.writer(open(filename, 'w'))
    for t in self.transactions:
      c.writerow(t.csvLine())

class ParsePos:
  def __init__(self, lines):
    self.lines = lines
    self.i = 0
  def eat(self):
    self.lines = self.lines[1:]
  def lookup(self):
    return self.lines[0]
  def hasNext(self):
    return len(self.lines) > 0

def readQFX(input, output):
  f = open(input)
  parseQFX([l.lower().strip() for l in f]).toCsv(output)

def parseQFX(lines):
  p = ParsePos(lines)

  while p.hasNext():
    l = p.lookup()
    p.eat()
    if "<ofx>" in l:
      return enterQFX(p)

def enterQFX(p):
  qfx = Qfx()
  while p.hasNext():
    l = p.lookup()
    p.eat()
    if '<stmttrn>' in l:
      qfx.addTransaction(enterTransaction(p))
  return qfx

def enterTransaction(p):
  stmt = Transaction()
  while p.hasNext():
    l = p.lookup()
    p.eat()
    if '</stmttrn>' in l:
      return stmt
    tag = re.search('^\W*<([^>]+)>(.*)$', l)
    if tag:
      stmt.set(tag.group(1), tag.group(2))
  return stmt

def main(argv):
  readQFX(argv[1], argv[2])

if __name__ == '__main__':
  main(sys.argv)
