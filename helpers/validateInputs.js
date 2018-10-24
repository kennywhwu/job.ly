function validateInputs(validateResult, next) {
  if (!validateResult.valid) {
    let error = {};
    error.message = validateResult.errors.map(error => error.stack);
    error.status = 400;
    return next(error);
  }
}

module.exports = validateInputs;
