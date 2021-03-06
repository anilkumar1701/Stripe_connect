const Joi                                           = require('joi');

exports.adminRegistration              = adminRegistration;

function adminRegistration(req, res, next) {
    var schema = Joi.object().keys({
        name          : Joi.string().required(),
        email         : Joi.string().required(),
        password      : Joi.string().required(),
    });
    var validFields = validateFields(req.body, res, schema);
    if (validFields) {
      next();
    }
  } 
  
function validateFields(apiReference, req, res, schema) {
    logging.log(apiReference, { REQUEST_BODY: req});
    var validation = Joi.validate(req, schema);
    if(validation.error) {
      var errorReason =
            validation.error.details !== undefined
              ? validation.error.details[0].message
              : 'Parameter missing or parameter type is wrong';

      logging.log(apiReference, validation.error.details);
      responses.sendResponse(res,errorReason, constants.responseFlags.PARAMETER_MISSING);
      return false;
    }
    return true;
  }