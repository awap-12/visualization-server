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

3. register your moudle into ```config/server.js```

```diff
const config = {
    "serve": {
        prefix: "default",
        [maxForks: "2",]
        [port: 8686]
    },
    "user": {
        prefix: "/api/user",
        [maxForks: "1",]
        [port: 8687]
    },
+   "YOUR_PROJECT_NAME": {
+        prefix: "default",
+        maxForks: "1",
+    }
}
```

## run `generate`

Run generate under default artifact `artifacts/default` to generate cluster style script.

## merge

1. create a pull request

	[PULL REQUEST](https://github.com/awap-12/server/compare)

2. commit your project

## Available Scripts

### `npm install`

Install all dependencies once.

### `npm test`

Test all the unit test under this project.
