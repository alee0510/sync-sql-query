class SingleConnection {
    constructor(db) {
        this._db = db
    }

    // create custom promisfy from query function
    dbQuery = (query, escape = []) => {
        return new Promise((resolve, reject) => {
            this._db.query(query, escape, (err, result) => {
                // check err
                err ? reject({code : 500, msg : err.sqlMessage}) : resolve(result)
            })
        })
    }

    // error handling for begin transaction 
    dbQueryTransactionWithErrorHandle = async (res, callback) => {
        await this._db.beginTransaction( err => {
            try {
                // check error
                if (err) throw ({ code : 500, msg : err })

                // our query function
                await callback()
                
                // commit if theres no error
                await this.dbQuery.commit()
            } catch (err) {
                await this._db.rollback()
                res.status(err.code).send(err.msg)
            }
        })
    }
}

class PoolConnection {
    dbPoolQuery = (connection, query, escape = []) => {
        return new Promise((resolve, reject) => {
            connection.query(query, escape, (err, result) => {
                // check err
                err ? reject({code : 500, msg : err.sqlMessage}) : resolve(result)
            })
        })
    }

    dbPoolQueryTransaction = (dbConnection, res, callback) => {
        dbConnection.getConnection((err, connection) => {
            if (err) {
                connection.rollback()
                connection.release()
                return
            }
            connection.beginTransaction( async err => {
                try {
                    await callback(connection)
                    await connection.commit()
                } catch (err) {
                    await connection.rollback()
                    res.status(err.code||500).send(err.msg)
                } finally {
                    await connection.release()
                }
            })
        })
    }
}

module.exports = { 
    connection : db => new SingleConnection(db), 
    poolConnection : _ => new PoolConnection()
}