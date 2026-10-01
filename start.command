#!/bin/bash
# Double-click this to open the atlas.
cd "$(dirname "$0")"
if ! curl -s -o /dev/null --max-time 2 http://localhost:8777/app/journey/ ; then
  node tools/serve.js &
  sleep 1
fi
open http://localhost:8777/app/journey/
