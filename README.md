# Project Hub

This is a simple web app to manage and view an online project timeline (also known as a "project hub").

View a [demo here](http://test.iestynwilliams.net:3001/#/timeline) – the password to login is `write`.

## What is a project hub and why would I use one?
A project hub is a tool for keeping track of the progress of a design project. The hub lives online (either publically available or password protected), so that everyone involved in the team has access to it.

The benefits of using a project hub:
- Serves as a centralized place for the project's key design/development materials
- Easily and visually view project progress
- Provides an archive for project artifacts
- Keep clients and team members up to speed with design progress
- Lives at a URL that doesn't change

Read more about [project hubs on 24 Ways.](http://24ways.org/2013/project-hubs/)

# The web app

This is a heavy fork of [Brad Frost](http://bradfrostweb.com)'s [Project Hub HTML template](https://github.com/bradfrost/project-hub).

It's made up of a node server with a basic API paired with an ember client-side app.

## Features

- View, create, edit, and delete timeline events.
- Simple permissions modes so you can easily password protect the timeline (or not)
- Server-side perstistance in a simple database so your events can be easily exported

## Permissions

There are 3 possible modes for permission:
- *login*: Anyone can view the timeline, admins have to log in to add/edit/delete events
- *private*: Users must log in to view the timeline. There are two login passwords, one for read-only access, one for admin access. The idea being that you could share the read-only password with clients
- *public*: Anyone can view and edit the timeline.

The permissions are easily configuarable by changing the values in the `config` file.

## Installation

The app currently requires [Node](http://nodejs.org) and bower (`npm install -g bower` after installing node). In future I'll put up a dist package for easier deployment...

1. `git clone` or copy the repo onto a server you want to use
2. `cd` into the repo's directory.
3. `npm install` to install server dependancies.
4. `bower install` to install the client dependancies.
5. Setup your passwords inside the `passwd` file.
6. Run the server: `node server.js &`. You can optionally pass in a port like so: `node server.js 5000 &`
7. Hit the given port (defaults to 3000) on the server to view the timeline. I would probably set up a web server like nginx to forward requests from a url to the server.

## Contributing

If you have any problems or requests, [file an issue](https://github.com/iest/Project-Hub/issues/new), or feel free to fork this repo and submit a pull-request.

Any comments or criticism? Hit my up on twitter [@_iest](http://twitter.com/_iest).


## TODO
- Super-simple deployment to heroku or something
- Production-ify ember app
