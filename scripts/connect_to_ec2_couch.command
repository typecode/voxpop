#!/usr/bin/env bash

cd "`dirname "$0"`"

ssh -L 5985:localhost:5984 -l ubuntu dev.voxpop.tc