#!/usr/bin/env bash

# put in your doc2json directory here
export DOC2JSON_HOME=$HOME

grobid_version=0.8.0

# # Download Grobid
cd $HOME
wget https://github.com/kermitt2/grobid/archive/$grobid_version.zip
unzip $grobid_version.zip
rm $grobid_version.zip
cd $HOME/grobid-$grobid_version
./gradlew clean install

## Grobid configurations
# increase max.connections to slightly more than number of processes
# decrease logging level
# this isn't necessary but is nice to have if you are processing lots of files
# TODO: This would be a nice step to include. Possibly in the dockerfile itself?
# cp $DOC2JSON_HOME/doc2json/grobid2json/grobid/grobid.yaml $HOME/grobid-$grobid_version/grobid-home/config/grobid.yaml

## Start Grobid
#./gradlew run
