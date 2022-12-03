const express = require('express')
const dotenv = require('dotenv')
const app = express()
const cors = require('cors')
const connectDB = require('./config/db')
// to work with environment variables
dotenv.config({path: 'config/config.env'})

// middleware to pass json 
app.use(express.json())

// enable cors
app.use(cors())

connectDB()


// routes middleware
app.use('/auth', require('./routes/auth'))
app.use('/api', require('./routes/api'))




const PORT = process.env.PORT || 7000

app.listen(PORT, () => console.log(`server is running on port ${PORT}`))