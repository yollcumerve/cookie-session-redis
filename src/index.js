const app = require('express')()
require('dotenv').config({debug: true})
const PORT = process.env.PORT || 8080
const { json, urlencoded } = require('express')
const helmet = require('helmet')
const Redis = require('ioredis')
const connectRedis = require('connect-redis')
const session = require('express-session')
const globalErrorHandler = require('./utils/appError')
const AppError = require('./utils/appError')

app.use(helmet())

app.use(json())
app.use(urlencoded({limit: "100kb", extended: true}))

const RedisStore = connectRedis(session)
const redis = new Redis()

app.use(session({
    name: process.env.SESSION_NAME,
    store: new RedisStore({
        client: redis,
        disableTouch: true //touch denilen express-session paketinin iletişim kurmak için gönderdiği sinyal, gereksiz sinyaller göndermesin diye

    }),
    cookie:{
        maxAge: 1000*60*60*24,
        httpOnly: true,
        secure: !process.env.NODE_ENV === "production"
    },
    secret: process.env.SECRET,
    resave: false, // kullanıcı session üzerinde bir değişiklik yapmasa bile session kaydedilmesini istemediğimiz için
    saveUninitialized: false // yeni yaratılmış ve üzerinde değişiklik yapılmamış durumu, session üzerinde değişiklik yapılmadıysa da kaydetme dmektir
}))    


app.use(require('./routes/userRouter'))

app.all('*', (req,res, next) => {
    next (new AppError(`Can not find ${req.originalUrl} on this server `, 404))
})

app.use(globalErrorHandler)

app.listen(PORT, () => {
    console.log('---------');
    console.log("BACKEND RUNNING PORT:", PORT);
    console.log('---------');
})