const { NotFoundError } = require('../errors');
const Macro = require('../models/Macro');
const {StatusCodes} = require('http-status-codes');

const getAllMacros = async (req,res)=>{
    const macros = await Macro.find({user:req.user.userId});
    res.status(StatusCodes.OK).json(macros);
};

const getAllMacrosPaginated = async (req,res)=>{

  const {sort} = req.query;
  
  let result = Macro.find({user:req.user.userId});

  
  if(sort){
        
        let sortColumn = sort.split('|')[0];
        let sortDircetion = sort.split('|')[1]==='DESC'?'-':'';
        result = result.sort(`${sortDircetion}${sortColumn}`);        

  }
  else{
    result = result.sort('-createdAt');
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page-1)*limit;


  result = result.skip(skip).limit(limit);

  const macros = await result;

  const totalMacros = await Macro.countDocuments({user:req.user.userId});
  const numOfPages = Math.ceil(totalMacros/limit);
  res.status(StatusCodes.OK).json({ macros, totalMacros, numOfPages })
};

const getMacrosById = async (req,res)=>{
    const macros = await Macro.findOne({_id:req.params.id, user:req.user.userId});
    if(!macros)
        throw new NotFoundError('Macros with provided id not found');
    res.status(StatusCodes.OK).json(macros);
};

const createMacros = async (req,res)=>{
    const {protien,carbs,fats,fibres,water,calories} = req.body;
    const macro = await Macro.create({
        protien,carbs,fats,fibres,water,calories, user:req.user.userId
    });
    res.status(StatusCodes.CREATED).json(macro);
};

const updateMacros = async (req,res)=>{
    const macro = await Macro.findOneAndUpdate({_id:req.params.id, user:req.user.userId},req.body,{new:true, runValidators:true});
    if(!macro)
        throw new NotFoundError('Macros with provided id not found');
    res.status(StatusCodes.OK).json({macro});
};

const deleteMacros = async (req,res)=>{
    const macros = await Macro.findOne({_id:req.params.id, user:req.user.userId});
    if(!macros)
        throw new NotFoundError('Macros with provided id not found');
    await Macro.deleteOne({_id:req.params.id, user:req.user.userId});
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