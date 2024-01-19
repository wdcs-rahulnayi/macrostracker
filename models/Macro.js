const mongoose = require('mongoose');

const MacroSchema = mongoose.Schema({
    protien:{
        type:Number,
        required:true
    },
    carbs:{
        type:Number,
        required:true
    },
    fats:{
        type:Number,
        required:true
    },
    fibres:{
        type:Number,
        required:true
    },
    water:{
        type:Number,
        required:true
    },
    calories:{
        type:Number,
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required: true
    }
},
{timestamps:true}
);

module.exports = mongoose.model('Macro', MacroSchema);