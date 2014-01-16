bookingdojo
===========

# Installation

    // Install the package
    npm install bookingdojo

    // Enter that directory
    cd node_modules/bookingdojo

    // Use the package for mongodb
    cp package.json.mongo package.json

    // Install extra packages, and dedupe which is always good
    npm install
    npm dedupe

    // Back to the main directory
    cd ../..

Then either:

    NODE_ENV='production' MONGO_URL="mongodb://localhost/hotplate" node server

* Will start the server using mongoDb as the database server.
* Dojo will be taken from the CDN

Or:

    node server

* Will start the server using TingoDb as the database server.
* Dojo will be expected to be in the public/dojo folder (you will need to place it there)

You can change how things are configured by changing the file configServer.js.



