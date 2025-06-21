// controllers/auth/registrationController.js

const registrationService = require('../../services/auth/registrationService');

/**
 *  Handles incoming registration requests.
 *  - Normalizes login to lowercase.
 *  - Checks required fields.
 *  - Delegates to service for validation + insertion.
 */
exports.registerRequest = async (req, res, next) => {
  try {
    // Normalize login
    if (req.body.login) {
      req.body.login = req.body.login.toLowerCase();
    }

    const { login, password, surname, name, patronym, tab_num, phone } = req.body;

    // Check required fields
    if (!login || !password || !surname || !name || !tab_num) {
      return res.status(400).json({
        error: 'Required fields: login, password, surname, name, tab_num'
      });
    }

    // Delegate to service
    const request = await registrationService.createRequest({
      login,
      password,
      surname,
      name,
      patronym,
      tab_num,
      phone
    });

    return res.status(201).json(request);

  } catch (err) {
    // Known validation errors
    if (err.isValidation) {
      return res.status(400).json({ error: err.message });
    }
    // Unexpected
    next(err);
  }
};
