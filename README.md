# Project Hub
A simple web app to manage a project timeline.

View a [demo](http://test.iestynwilliams.net:3001/#/timeline) (login with the password: 'read' or 'write').

This is a heavy fork of [Brad Frost](http://bradfrostweb.com)'s [Project Hub HTML template](https://github.com/bradfrost/project-hub).

I really wanted to use project hubs for client work, but wanted something that non-techie users could manage, and would be faster than having to write html to update it.

**This is still a work-in-progress**. If you have any problems or requests, [file an issue](https://github.com/iest/Project-Hub/issues/new) or hit me up on twitter [@_iest](http://twitter.com/_iest).

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
- [ ] Persistance of login (cookie-based probably)
- [ ] Ability to turn off authentication
- [ ] Super simple deployment to heroku or similar
- [ ] Prouction-ify client app (current size is ~1.4MB, should be more like 300KB)


### Ramblings
- If set to `private`, both users have to login.
Current functionality.

- If set to `login`, everyone can access the timeline but admins have to login
Could render the timeline as-is using just the server (no client app). Could have an `/edit` route that would then render the ember app.

- If set to public everyone can access & edit
