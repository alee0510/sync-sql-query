# Custom Promisfy mysql.query() Function 😎
![Twitter Follow](https://img.shields.io/twitter/follow/a_lee0510?style=social)![GitHub followers](https://img.shields.io/github/followers/alee0510?style=social)

## Purpose
- create promisfy for mysql.query()
- use async and await to create sync like syntax
- use function to handle error without repeatly type try...catch...
- applied for begin transaction in nodejs
- begin transaction for single and pool connection

## Required
- this function is depend on [mysql](https://www.npmjs.com/package/mysql) library
- ES5 syntax

## Port in your project 🥤
```
    $ npm install https://github.com/alee0510/sync-sql-query
```

## Setup Your Project ⚙
- install [mysql](https://www.npmjs.com/package/mysql) package
```
    $ npm install mysql
```

- port my repo in your project
- setup your mysql connection
```javascript
    // import mysql module
    const mysql = require('mysql')

    // create single connection
    const connection = mysql.createConnection({
        host : [database-host],
        port : [database-port],
        user : [insert-mysql-username],
        password : [mysql-password],
        database : [databse-name]
    })

    // or use pool connection
    const pool = mysql.createPool({
        connectionLimit : 10, // set your connection limit
        port : [database-port],
        user : [insert-mysql-username],
        password : [mysql-password],
        database : [databse-name]
    })
```
- setup my custom function along with your sql connection
``` javascript
    // import module
    const dbConnection = required('sync-sql-query')

    // for single connection
    const db = dbConnection.single([your-database-connection])

    // for pool connection
    const db = dbConnection.pool([your-database-connection])
```

## How To Use ?
```javascript
    // do query in single or pool connection
    app.use('/your-endpoint', (req, res) => {
        //... do something

        // used error handle
        db.dbQueryWithErrorHandle(res, async () => {
            // define and your query
            const query = 'SELECT * FROM users WHERE id ?'
            const result = await db.dbQuery(query, id)

            //...do something with your result
            // or do more query inside this function
        })

    })

    // use begin transaction for single connection
    app.use('/your-endpoint', (req, res) => {
        //... do something

        db.dbQueryTransactionWithErrorHandle(res, async () => {
            // define and your query
            const query = 'INSERT INTO users SET ?'
            const result = await db.dbQuery(query, id)

            const query2 = 'INSERY INTO profile SET ?'
            const result2  =await db.dbQuery(query2, data)

            //...do something with your result 
            // or do more query inside this function
            // if err occur, query will be rollback automatically
        })
    }

    // use begin transaction for pool connection
    app.use('/your-endpoint', (req, res) => {
        //... do something

        db.dbPoolQueryTransactionWithErrorHandle(res, async connection => {
            // define and your query
            const query = 'INSERT INTO users SET ?'
            const result = await db.dbPoolQuery(connection, query, id)

            const query2 = 'INSERY INTO profile SET ?'
            const result2  =await db.dbPoolQuery(connection, query2, data)

            //...do something with your result 
            // or do more query inside this function
            // if err occur, query will be rollback automatically
        })
    }
```

created by alee0510