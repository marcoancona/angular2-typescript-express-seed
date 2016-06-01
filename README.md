# Angular2 Beta with Gulp, Bower, Lint, Typescript, Jade, Stylus and Express  

## Quick start
Make sure `npm` is installed on your machine.

Grab the dependencies with:

`npm install`

Install `gulp` globally:

`npm install --global gulp-cli`

Finally, compile and run the app:

`gulp compile && gulp develop`

Browse to `http://localhost:3000` to load the application.
This skeleton app uses [nodemon](http://nodemon.io/) for server live-reload on file change.
Any change in client-side files (.ts, .jade, .styl) also triggers the appropriate compiler while the server is running with `gulp develop`.

To clean the build, delete the `dist` folder or run `gulp clean`.
