# Project Hub
A simple web app to manage a project timeline.

## What is this?

This is a heavy fork of [Brad Frost](http://bradfrostweb.com)'s [Project Hub HTML template](https://github.com/bradfrost/project-hub).

I really wanted to use project hubs for client work, but wanted something that non-techie users could manage, and would be faster than having to write html to update it.

**This is still a work-in-progress**. If you have any problems or requests, file an issue or hit me up on twitter [@_iest](http://twitter.com/_iest).

### Features

- Create, edit and delete timeline events
- Server-side persistance
- Simple permissions for read-only and admin users. Only admin users can create/edit/delete events.

It's made up of a simple node server that handles authentication and persistance, and a client-side ember app for viewing and CRUD operations.

## Requires

- [Node](http://nodejs.org)
- Bower (`npm install -g bower` once you've installed node)

## Installation

1. `git clone` or copy the repo onto a server you want to use.
2. `cd` into the repo's directory.
3. `npm install` to install server dependancies.
4. `bower install` to install the client dependancies.
5. Setup your passwords inside the `passwd` file.
6. Run the server: `node server.js &`
7. Hit port `3000` on the server to view the app. (I'd probaby set up nginx to forward requests on...)


Read more about [project hubs on 24 Ways.](http://24ways.org/2013/project-hubs/)


### To do
- [ ] Ability to turn off authentication
- [ ] Super simple deployment to heroku or similar
- [ ] Prouction-ify client app (current size is ~1.4MB, should be more like 300KB)