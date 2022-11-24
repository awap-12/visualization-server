# workflow

## create your server

* not overwrite other's databse.
* not overwrite other's port

## register server into master

1. create a folder ```artifacts/YOUR_PROJECT_NAME``` under artifacts, and copy your own project into it,

2. rename your package name to your porject folder name

	path: artifacts/YOUR_PROJECT_NAME
```diff
{
-    "name": "not same as project name",
+    "name": "YOUR_PROJECT_NAME"
    "version": "1.0.0",
    "dependencies": {
        "express": "latest"
    },
    "scripts": {
        "start": "cross-env NODE_ENV=development DEBUG=*,-sequelize:*,-koa:* node index.js"
    }
}
```

3. add structure into your project

```javascript
module.exports = port => {
    if (cluster.isSpawn) {
        YOUR_CODE(port);
    }
}
```

4. register your package to master package.json

```diff
{
    "name": "server",
    "version": "1.0.0",
    "dependencies": {
        "debug": "latest",
        "http-proxy": "latest",
        "json-socket": "latest",
        "minimist": "latest",
        "a": "file:artifacts/a",
        "b": "file:artifacts/b",
+       "YOUR_PROJECT_NAME": "file:artifacts/YOUR_PROJECT_NAME " 
        "c": "file:artifacts/c",
        "serve": "file:artifacts/serve",
        "user": "file:artifacts/user"
    },
    "devDependencies": {
        "cross-env": "latest"
    },
    "scripts": {
        "start": "cross-env DEBUG=* node bin/www"
    }
}
```

5. register your moudle into ```config/server.js```

```diff
const config = {
    "serve": {
        prefix: "default",
        maxForks: "2",
        port: 8686
    },
    "user": {
        prefix: "/api/user",
        maxForks: "1",
        port: 8687
    },
+   "YOUR_PROJECT_NAME": {
+        prefix: "default",
+        maxForks: "1",
+        port: "not conflict to others"
+    },
    get workers() {
        return workersCache;
    },
    get rules() {
        return rulesCache;
    }
}
```

## merage

1. create a pull request

	[PULL REQUEST](https://github.com/awap-12/server/compare)

2. commit your project

## Available Scripts

### `npm install`

Install all dependencies once.

### `npm start`

Runs the app in the development mode.
Open http://localhost:3000 to view it in your browser.

