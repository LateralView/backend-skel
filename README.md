# Backend skel

Base skeleton for Backend Apps using Node, Express and MongoDB. Developed by the [LateralView](https://lateralview.co) team.

The app allows user sign-up, account activation, login, logout and profile edition. The activation process uses mail confirmation with the Sendgrid library. If you don't set the Sendgrid API key, you'll see the activation link in the console.

```sh
...
GET /favicon.ico 304 2.113 ms - -
ACTIVATION LINK: http://localhost:8085/activate/E1JpEbZw
POST /api/users/ 200 388.902 ms - 27
...
```

### Installation

```sh
$ git clone git@github.com:LateralView/backend-skel.git
$ cd backend-skel
$ npm install
```

### Configuration

Before running the app, set the database host, base URL, Sendgrid API key and S3 keys in a `.env` file, so they are accesible by environment variables.
You can use as an example the `.env.test` file, used for tests

If S3 keys and/or bucket name are not set no errors will be thrown, but the files will not upload at all (for example in profile picture upload).
Also, don't forget to run the mongoDB server.

### Run the App

```sh
$ node server.js
```

### Apidoc

The apidoc is created with grunt post-install script. It can be accessed through **http://localhost:8085/apidoc**

### Tests

Tests are written with [Mocha](http://mochajs.org/), [Chai](http://chaijs.com/), [Supertest](https://github.com/visionmedia/supertest/) and [Nock](https://github.com/pgte/nock).

```sh
$ npm test
```

We also use [Factory Girl](https://github.com/aexmachina/factory-girl) and [Faker.js](https://github.com/marak/Faker.js/) to create model instances. If you need to define new factories add them inside the register function present on **/test/factories.js** file.

```javascript
...
var register = function() {
    // User factory
    factory.define('user', User, {
        email: function() {
            return faker.internet.email();
        },
        password: faker.internet.password(),
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName()
    });
}
...
```

# Directory Structure

```
backend-skel
│   .gitignore
│   package.json
│   README.md
│   server.js
|   .env
|   .env.test
│
└───app
    │   ...
    │
└───node-modules
    │   ...
    │
└───test
    │   ...
└───apidoc
    │   ...
```

* **App Folder** -> Backend logic.
* **Test Folder** -> Unit Tests.
* **Apidoc Folder** -> Auto-generated API documentation.
* **.env** -> Backend configuration depending on the environment (ouside the repo, you must create the file).
* **.env.test** -> Environment variables for tests.
* **server.js** -> Express server.

### App

```
app
└───handlers
    │   usersHandler.js
    │   ...
    │
└───helpers
    │   mailer.js
    │   ...
    │
└───middleware
    │   auth.js
    │   ...
    │
└───models
    │   user.js
    │   ...
└───routes
    │   routes.js
```

* **Handlers Folder** -> Request handlers executed in each route in **routes.js**. New handlers must be registered in **server.js** file:

```javascript
...
// Request Handlers
var handlers = {
    users: require('./app/handlers/usersHandler'),
    // Add new one here
};
...
```

* **Helpers Folder** -> Shared functions within the backend
* **Middleware Folder** -> Express middleware. Add new middleware to the Express App in **server.js** or **routes.js**. The **auth.js** file cotains a middleware to authenticate routes with the authentication token. If authentication succeeds, it saves the current user in the request object
* **Models Folder** -> Mongoose models
* **Routes Folder** -> Express routes


Happy coding!

