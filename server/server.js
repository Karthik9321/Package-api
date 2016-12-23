require('./config/config');
var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID}=require('mongodb');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const hbs = require('hbs');

var app = express();

app.set('view engine', 'hbs');

var {mongoose}=require('./db/mongoose');
var{Parcel} = require('./models/parcel');
var{User} = require('./models/user');
var {authenticate}=require('./middleware/authenticate');


const port = process.env.PORT; 


app.use(bodyParser.json());

app.post('/parcels', authenticate, (req,res)=>{
     var parcel = new Parcel({
        item: req.body.item,
        approxWeight:req.body.approxWeight,
        time:req.body.time,
        date:req.body.date,
        _creator: req.user._id
    });

    
parcel.save().then((parcel)=>{
//    res.send(parcel);
    res.render('parcelconf.hbs',{
       noi: req.body.item,
       dop: req.body.date,
       top: req.body.time,
       wop: req.body.approxWeight
    });
},(e)=>{
    res.status(400).send(e);
    });
});


app.get('/parcels', authenticate, (req,res)=>{
    Parcel.find({
        _creator:req.user._id
    }).then((parcels)=>{
        res.send({parcels});
    }).catch((e)=>{
    res.status(400).send(e);
});
});

app.get('/parcels/:id', authenticate, (req,res)=>{
    var id = req.params.id;
    
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    
    Parcel.findOne({
        _id:id,
        _creator:req.user._id
        }).then((parcel)=>{
        if(!parcel){
            return res.status(404).send();
        }

        res.send({parcel});
    }).catch((e)=>{
        res.status(400).send();
    });
    
});

app.delete('/parcels/:id',authenticate, (req,res)=>{
    var id= req.params.id;
    
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    
    Parcel.findOneAndRemove({
        _id:id,
        _creator: req.user._id
    }).then((del)=>{
        if(!del){
            return res.status(404).send();
        }
        res.send({del});
    }).catch((e)=>{
        res.status(404).send();
    });
});


app.patch('/parcels/:id', authenticate, (req,res)=>{
    var id= req.params.id;
    var body = _.pick(req.body, ['item','approxWeight', 'time','date']);
    
    
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    
    
    Parcel.findOneAndUpdate({
        _id: id,
        _creator:req.user._id
    },
    {$set:body}, 
    {new:true})
        .then((parcel)=>{
        if(!parcel){
            return res.status(404).send();
        }
        res.send({parcel});
    }).catch((e)=>{
        res.status(400).send();
    });
});


//POST/users


app.post('/users', (req,res)=>{
   
    if(!req.body.homeAddress && !req.body.officeAddress){
        return res.status(400).send('Please enter either Home or Office Address for pickup');
    }
    
    var body = _.pick(req.body,['firstName', 'lastName', 'homeAddress', 'officeAddress', 'email','password','phone']);
    
    var user =new User(body);
    
    user.save().then((user)=>{
        return user.generateAuthToken();
    }).then((token)=>{
        res.header('x-auth', token).send(user);
    }).catch((e)=>{
        res.status(400).send(e);
    });
});




app.get('/users/me', authenticate, (req,res)=>{
    res.send(req.user);
});


//POST /users/ login {email,pass}

app.post('/users/login', (req,res)=>{
    var body = _.pick(req.body,['email','password']);
    User.findByCredentials(body.email, body.password).then((user)=>{
        return user.generateAuthToken().then((token)=>{
        res.header('x-auth', token).send(user);
       })
    }).catch((e)=>{
        res.status(400).send(e);
    });
});


//delete

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, ()=>{
    console.log('Started on port: ' ,port);
});

module.exports = {app};