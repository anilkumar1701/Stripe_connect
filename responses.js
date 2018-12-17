let logging = require('./logging');


exports.sendCustomResponse = function (res, message, code, data, apiReference, metaInfo = null) {
    let response = {
        "message": message,
        "status": code,
        "data": data || {},
    };
    if (metaInfo)
        response.metaInfo = metaInfo;

    if (apiReference) {
        logging.log(apiReference, { EVENT: "FINAL RESPONSE", RESPONSE: response });
    }
    res.send(JSON.stringify(response));
    //res.send(response)
};

function alreadyExists(res, data, message) {
    var response = {
      message:"Already exists",
      status : 201,
      data   : data || {}
    };
    res.send(JSON.stringify(response));
  }

exports.executeSqlQueryPromisify = function (apiReference, sqlQuery, sqlParams) {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, sqlParams, function (sqlError, sqlResult) {
            logging.log(apiReference, {
                EVENT: "Executing Query",
                QUERY: this.sql.replace(/\n/g, ' '),
                sqlParams: sqlParams,
                ERROR: sqlError,
                RESULT: sqlResult
            });
            if (sqlError) {
                console.log(sqlError)
                return reject(new Error(JSON.stringify(responses.getErrorResponse())));
            }
            return resolve(sqlResult);
        })
    })
};




exports.responseMessageCode = {
    PARAMETER_MISSING: 'PARAMETER_MISSING',
    NO_RECORDS_FOUND: 'NO RECORDS FOUND IN DB',
    DATA_RETRIEVED: 'DATA RETRIEVED SUCCESSFULLY',
    DATA_INSERTED: 'DATA INSERTED SUCCESSFULLY',
    ACTION_COMPLETE: 'ACTION COMPLETE',
    ERROR: 'ERROR',
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    NO_CARD: 'NO_CARD'

}

module.exports ={
    alreadyExists : alreadyExists
}


