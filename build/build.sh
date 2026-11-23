#!/bin/bash
PRJ=~/src/SystmSync
SRC=$PRJ/src
STAGE=$PRJ/staging
PUB=$PRJ/publish
if [ ! -d $PUB ] 
then
  mkdir $PUB
fi
if [ -d $STAGE ]
then
  rm -r -f $STAGE/*
  rmdir $STAGE
fi
mkdir $STAGE
cp -r $SRC/* $STAGE
# jq 'del(.background.service_worker)' $SRC/manifest.json \
#  | jq 'del(.background.scripts)' \
#  | jq '.background.scripts[0] = "background/background.js"' > $STAGE/manifest.json
cp $STAGE/manifest.ch.json $STAGE/manifest.json
export PACKVER="`jq -r '.version' $STAGE/manifest.json`"
(cd $STAGE && zip -r $PUB/SystmCalendarSync_CH.$PACKVER.zip *)
# jq 'del(.background.service_worker)' $SRC/manifest.json \
#  | jq 'del(.background.scripts)' \
#  | jq '.background.service_worker = "background/background.js"' > $STAGE/manifest.json
cp $STAGE/manifest.ff.json $STAGE/manifest.json
export PACKVER="`jq -r '.version' $STAGE/manifest.json`"
(cd $STAGE && zip -r $PUB/SystmCalendarSync_FF.$PACKVER.zip *)
