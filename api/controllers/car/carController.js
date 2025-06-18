// controllers/carController.js
const carService = require('../../services/car/carService');


async function parseQuery(req) {
  const page = parseInt(req.query.page, 10)  || 1;
  const limit= parseInt(req.query.limit,10)  || 10;
  const search     = req.query.search     || '';
  const searchField= req.query.searchField|| '';
  return { page, limit, search, searchField };
}

exports.list = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      searchField = '',
      dateFrom,
      dateTo
    } = req.query;

    const opts = {
      page:       parseInt(page,  10),
      limit:      parseInt(limit, 10),
      search,
      searchField,
      dateFrom,   // строки вида "2025-06-01"
      dateTo      // строки вида "2025-06-10"
    };

    const result = await carService.listCars(opts);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/cars/:id
exports.getById = async (req, res, next) => {
  try {
    const car = await carService.getCarById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(car);
  } catch (err) {
    next(err);
  }
};

// POST /api/cars
exports.create = async (req, res, next) => {
  try {
    const { car_category_id, model, number } = req.body;
    if (!car_category_id || !model || !number) {
      return res.status(400).json({
        error: 'Fields car_category_id, model and number are required'
      });
    }
    const result = await carService.createCar({ car_category_id, model, number });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// PUT /api/cars/:id
exports.update = async (req, res, next) => {
  try {
    const { car_category_id, model, number, data_status } = req.body;
    const updated = await carService.updateCar(
      req.params.id,
      { car_category_id, model, number, data_status }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json({ message: 'Car updated' });
  } catch (err) {
    next(err);
  }
};

// GET /api/cars/available
exports.listAvailable = async (req, res, next) => {
  try {
    const { date_start, date_expired } = req.query;
    const cars = await carService.listAvailable(date_start, date_expired);
    res.json(cars);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cars/:id
exports.remove = async (req, res, next) => {
  try {
    const deleted = await carService.deleteCar(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json({ message: 'Car deleted' });
  } catch (err) {
    next(err);
  }
};
