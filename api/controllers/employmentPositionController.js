const positionService = require('../services/employmentPositionService');

// Возвращает список должностей
exports.getPositions = async (req, res, next) => {
    try {
        const positions = await positionService.getPositions();
        res.json(positions);
    } catch (err) {
        next(err);
    }
};

// Возвращает одну должность по ID
exports.getPositionById = async (req, res, next) => {
    try {
        const pos = await positionService.getPositionById(req.params.id);
        if (!pos) return res.status(404).json({ error: 'Должность не найдена' });
        res.json(pos);
    } catch (err) {
        next(err);
    }
};

// Создаёт новую должность
exports.createPosition = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Название должности обязательно' });
        const newPos = await positionService.createPosition(name);
        res.status(201).json(newPos);
    } catch (err) {
        next(err);
    }
};

// Обновляет существующую должность
exports.updatePosition = async (req, res, next) => {
    try {
        const { name } = req.body;
        const updated = await positionService.updatePosition(req.params.id, name);
        if (!updated) return res.status(404).json({ error: 'Должность не найдена или уже удалена' });
        res.json({ message: 'Должность обновлена' });
    } catch (err) {
        next(err);
    }
};

// Мягко удаляет должность
exports.deletePosition = async (req, res, next) => {
    try {
        const deleted = await positionService.deletePosition(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Должность не найдена или уже удалена' });
        res.json({ message: 'Должность удалена' });
    } catch (err) {
        next(err);
    }
};
