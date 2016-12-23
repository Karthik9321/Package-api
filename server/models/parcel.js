const mongoose = require('mongoose');
var Parcel = mongoose.model('Parcel',{
    item: {
        type:String,
        required: true,
        minlength: 1,
        trim: true
    },
    
    approxWeight:{
        type:Number,
        required:true
    },
    date:{
      type:String,
      required:true
    },
    
    time:{
        type:String,
        required:true
    },
    
    _creator:{
    type: mongoose.Schema.Types.ObjectId
}
});

module.exports={
    Parcel
};