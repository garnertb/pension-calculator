#!/bin/sh
set -e

/bin/bash ./clean-build
git clone -b gh-pages git@github.com:ProminentEdge/pension-calculator.git /tmp/pension-calculator-build
rm -rf /tmp/pension-calculator-build/*
mv bin/* /tmp/pension-calculator-build
cd /tmp/pension-calculator-build
git add .
git commit -n -m "Updating the build" --author="Prominent Edge <contact@prominentedge.com>"
git push origin gh-pages 
rm -rf /tmp/pension-calculator-build
