const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.connect('mongodb+srv://admin:1234@nyquil-qqig0.mongodb.net/free-ticket?retryWrites=true&w=majority', {useNewUrlParser: true});

const port = process.env.PORT || 5000

const fcc = {
    green:"\x1b[32m%s\x1b[0m",
    yellow:"\x1b[33m%s\x1b[0m",
    red:"\\x1b[31m%s\x1b[0m"
}

app.use(express.json())
app.use(cors())

var ticketsSchema //SCHEMA
var tickets //MODEL

// -------------------------------------------Init--------------------------------------------------------
Tickets_Setup()
// -------------------------------------------------------------------------------------------------------

app.post('/', (req, res) => {
    res.send({
        ok: "true"
    })
})

app.get('/ticket-isAvailable', (req, res) => {
    res.header("Access-Control-Allow-Origin","*")

    let data = req.body
    let checked = isAvailable(data.timeStart,data.timeEnd)

    res.send({
        ok: "true",
        data:{
            isAvailable:checked
        }
    })
})

app.get('/ticket-get-one', async (req, res) => {
    res.header("Access-Control-Allow-Origin","*")
    let data = req.body

    let ticket = await Ticket_getOne(data.id)
    res.send({
        ok: "true",
        ticket:ticket
    })
})

app.get('/ticket-get-all', async (req, res) => {
    res.header("Access-Control-Allow-Origin","*")
    let data = req.body

    let ticket = await Ticket_getAll()
    res.send({
        ok: "true",
        ticket:ticket
    })
})

app.get('/ticket-insert',async (req, res) => {
    res.header("Access-Control-Allow-Origin","*")

    await Ticket_Insert(
        req.param("id"),
        req.param("name"),
        req.param("amount"),
        req.param("startTime"),
        req.param("endTime")
    )

    res.send({
        ok: "true"
    })
})

app.get('/ticket-update',async (req, res) => {
    res.header("Access-Control-Allow-Origin","*")

    let new_ticket = {}
    
    let old_ticket = await Ticket_getOne(req.param("id"))
    
    if (req.param("name") != "") new_ticket.name = req.param("name")
    else new_ticket.name = old_ticket[0].name

    if (req.param("amount") != "") new_ticket.amount = req.param("amount")
    else new_ticket.amount = old_ticket[0].amount

    if (req.param("startTime") != "") new_ticket.startTime = req.param("startTime")
    else new_ticket.startTime = old_ticket[0].startTime

    if (req.param("endTime") != "") new_ticket.endTime = req.param("endTime")
    else new_ticket.endTime = old_ticket[0].endTime
    
    await Ticket_Update(
        req.param("id"),
        new_ticket.name,
        new_ticket.amount,
        new_ticket.startTime,
        new_ticket.endTime
    )

    res.send({
        ok: "true"
    })
})

app.get('/ticket-delete',async (req, res) => {
    res.header("Access-Control-Allow-Origin","*")

    await Ticket_Delete(req.param("id"))

    res.send({
        ok: "true"
    })
})

// -------------------------------------------------------------------------------------------------------
function isAvailable(needStart,needEnd){
    let curDate = new Date()
    let curHour = curDate.getHours()
    let curMinute = curDate.getMinutes()
    let curTime = curHour+(curMinute/100)
    
    if(curTime >= needStart){
        if(curTime <= needEnd) return true
        else return false
    }else return false
}

async function Ticket_getOne(_id){
    let ticket = await tickets.find({id:_id }).exec()
    return ticket
}

async function Ticket_getAll(){
    let ticket = await tickets.find().exec()
    return ticket
}

async function Ticket_Delete(_id){
    await tickets.findOneAndDelete({id:_id }).exec()
}

function Tickets_Setup(){
    ticketsSchema = new Schema({
        id:String,
        name:String,
        amount:Number,
        startTime:Number,
        endTime:Number
    })
    
    tickets = mongoose.model('tickets',ticketsSchema)

    // mongoInsert("IT3K","IT3K - Concert",10,13.30,15.30);
}

async function Ticket_Insert(_id,_name,_amount,_start,_end){
    const ticketInsert = new tickets({ 
        id:_id,
        name:_name,
        amount:_amount,
        startTime:_start,
        endTime:_end
    });
    await ticketInsert.save().then(() => console.log(fcc.yellow ,'Tickets has been insert!'));
}

async function Ticket_Update(_id,_name,_amount,_start,_end){
    let update_query = tickets.findOneAndUpdate({id:_id},{
        name:_name,
        amount:_amount,
        startTime:_start,
        endTime:_end
    })
    await update_query.exec().then(()=>console.log(fcc.yellow ,'Tickets has been update!'))
}
// -------------------------------------------------------------------------------------------------------
app.listen(port, () => {
    console.log(fcc.green ,`Free Ticket\'server is running on localhost:${port}`)
})
// -------------------------------------------------------------------------------------------------------