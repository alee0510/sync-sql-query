class Connection {
    constructor(database) {
        this.database = database
    }
    // create promisfy our query
    databaseQuery = (query, escape = []) => {
        return new Promise ((resolve, reject) => {
            this.database.query(query, escape, (err, result) => {
                if (err) {
                    reject(err.sqlMessage)
                } else {
                    resolve(result)
                }
            })
        })
    }
    // create error handle for databaseQuery()
    databaseQueryWithErrorHandle = async (res, callback) => {
        try {
            await callback()
        } catch (err) {
            res.status(500).send(err)
        }
    }
    // create promisfy using begin transaction
    databaseQueryTransaction = async (res, callback) => {
        try {
            await database.beginTransaction( async (err) => {
                if (err) throw err
                // error handling for our custom function
                try {
                    await callback()
                } catch (err) {
                    console.log(err)
                    await database.rollback() 
                    res.status(500).send(err) 
                }
                await database.commit()
            })
        } catch (err) {
            await database.rollback() 
        }
    }
}

module.exports = {
    con : database => new Connection (database)
}