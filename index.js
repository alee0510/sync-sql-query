class SingleConnection {
	constructor(db) {
		this._db = db;
	}

	// create custom promisfy from query function
	dbQuery = (query, escape = []) => {
		return new Promise((resolve, reject) => {
			this._db.query(query, escape, (err, result) => {
				// check err
				err ? reject({ code: 500, msg: err.sqlMessage }) : resolve(result);
			});
		});
	};

	// create custom function from error handling
	dbQueryWithErrorHandle = async (res, callback) => {
		try {
			await callback();
		} catch (err) {
			res.status(err.code).send(err.msg);
		}
	};

	// error handling for begin transaction
	dbQueryTransactionWithErrorHandle = (res, callback) => {
		this._db.beginTransaction(async (err) => {
			try {
				// check error
				if (err) throw { code: 500, msg: err };

				// our query function
				await callback();

				// commit if theres no error
				await this.dbQuery.commit();
			} catch (err) {
				await this._db.rollback();
				res.status(err.code).send(err.msg);
			}
		});
	};
}

class PoolConnection {
	constructor(db) {
		this._db = db;
	}

	dbPoolQuery = (connection, query, escape = []) => {
		return new Promise((resolve, reject) => {
			connection.query(query, escape, (err, result) => {
				// check err
				err ? reject({ code: 500, msg: err.sqlMessage }) : resolve(result);
			});
		});
	};

	dbPoolQueryWithErrorHandle = (res, callback) => {
		this._db.getConnection(async (err, connection) => {
			try {
				if (err) throw { code: 500, msg: err };
				await callback(connection);
			} catch (err) {
				res.status(err.code).send(err.msg);
			} finally {
				await connection.release();
			}
		});
	};

	dbPoolQueryTransactionWithErrorHandle = (res, callback) => {
		this._db.getConnection((err, connection) => {
			if (err) {
				connection.rollback();
				connection.release();
				return;
			}
			connection.beginTransaction(async (err) => {
				try {
					if (err) throw { code: 50, msg: err };
					await callback(connection);
					await connection.commit();
				} catch (err) {
					await connection.rollback();
					res.status(err.code || 500).send(err.msg);
				} finally {
					await connection.release();
				}
			});
		});
	};
}

module.exports = {
	single: (db) => new SingleConnection(db),
	pool: (db) => new PoolConnection(db),
};
