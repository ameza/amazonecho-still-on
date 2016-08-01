#!/bin/bash          
echo Build started
rm -rf dist
mkdir dist
cd dist
mkdir install
cd ..
npm install --prefix dist/install .
rm dist/dist.zip
cd dist/install/node_modules/alexa-still-open/
zip -r ../../../dist.zip * .env
echo files are ready
cd ..
cd ..
cd ..
cd ..
echo uploading code to matrix, please wait...
aws lambda update-function-code --zip-file fileb://dist/dist.zip --function-name alexa-stillopen
echo upload is done, exiting.
