// Helper function to validate inputs for POST and PATCH routes based on JSON Schema inputs
const { validate } = require('jsonschema');

function validateInputs(body, schema) {
  const validateResult = validate(body, schema);
  if (!validateResult.valid) {
    let error = {};
    error.message = validateResult.errors.map(error => error.stack);
    error.status = 400;
    throw error;
  }
}

module.exports = validateInputs;
