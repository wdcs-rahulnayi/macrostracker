const { json } = require('express');
const { NotFoundError } = require('../errors');
const Macro = require('../models/Macro');
const { StatusCodes } = require('http-status-codes');

const getAllMacros = async (req, res) => {
  const macros = await Macro.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json(macros);
};

const getAllMacrosPaginated = async (req, res) => {
  const { sort } = req.query;

  let result = Macro.find({ user: req.user.userId });

  if (sort) {
    let sortColumn = sort.split('|')[0];
    let sortDirection = sort.split('|')[1] === 'DESC' ? '-' : '';
    result = result.sort(`${sortDirection}${sortColumn}`);
  } else {
    result = result.sort('-createdAt');
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const macros = await result;

  const totalMacros = await Macro.countDocuments({ user: req.user.userId });
  const numOfPages = Math.ceil(totalMacros / limit);
  res.status(StatusCodes.OK).json({ macros, totalMacros, numOfPages });
};

const getMacrosById = async (req, res) => {
  const macros = await Macro.findOne({ _id: req.params.id, user: req.user.userId });
  if (!macros)
    throw new NotFoundError('Macros with provided id not found');
  res.status(StatusCodes.OK).json(macros);
};

const createMacros = async (req, res) => {
  try {
    const { date, meals } = req.body;

    if(!date){
      return res.status(StatusCodes.BAD_REQUEST).json({error:'Please enter the date'})
    }
    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid request body" });
    }

    
    const mealTypes = new Set();
    for (const meal of meals) {
      if (!meal.name || !meal.protein || !meal.carbs || !meal.fats || !meal.fibres || !meal.calories) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid meal data" });
      }


      if (mealTypes.has(meal.name)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: `Only one entry allowed for ${meal.name}` });
      }

      mealTypes.add(meal.name);
    }

    // Create macro entry
    const macro = await Macro.create({
      date,
      user: req.user.userId,
      meals,
    });

    res.status(StatusCodes.CREATED).json(macro);
  } catch (error) {
    console.error("Error creating macros:", error);

    if (error.code === 11000 || error.code === 11001) {
      // MongoDB duplicate key error (11000 for versions before 3.2, 11001 for versions after)
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Data for the given date already exists" });
    } else {
      // Other internal server errors
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
  }
};

  
  
  
const updateMacros = async (req, res) => {
    const updateFields = req.body;
  
    try {
      const existingMacro = await Macro.findOne({ _id: req.params.id, user: req.user.userId });
  
      if (!existingMacro) {
        throw new NotFoundError('Macros with provided id not found');
      }
  
      // Update a specific meal within the meals array
      const mealToUpdate = updateFields.meals.find(updatedMeal => {
        return existingMacro.meals.some(existingMeal => existingMeal.name === updatedMeal.name);
      });
  
      if (mealToUpdate) {
        existingMacro.meals = existingMacro.meals.map(existingMeal => {
          if (existingMeal.name === mealToUpdate.name) {
            existingMeal.protein = mealToUpdate.protein || existingMeal.protein;
            existingMeal.carbs = mealToUpdate.carbs || existingMeal.carbs;
            existingMeal.fats = mealToUpdate.fats || existingMeal.fats;
            existingMeal.fibres = mealToUpdate.fibres || existingMeal.fibres;
            existingMeal.calories = mealToUpdate.calories || existingMeal.calories;
          }
          return existingMeal;
        });
  
        // Save the updated Macro document
        const savedMacro = await existingMacro.save();
        res.status(StatusCodes.OK).json({ macro: savedMacro });
      } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'Meal not found in the update request' });
      }
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  };
  


const deleteMacros = async (req, res) => {
  const macros = await Macro.findOne({ _id: req.params.id, user: req.user.userId });
  if (!macros)
    throw new NotFoundError('Macros with provided id not found');
  await Macro.deleteOne({ _id: req.params.id, user: req.user.userId });
  res.status(StatusCodes.OK).json('Successfully deleted.');
};

module.exports = {
  getAllMacros,
  getAllMacrosPaginated,
  getMacrosById,
  createMacros,
  updateMacros,
  deleteMacros
};
