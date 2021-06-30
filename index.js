const express = require('express')
const app = express()
const port = 5000
const {User} = require("./models/User")
const cookieParser = require('cookie-parser')
const config = require('./config/key')

//application/x-www-form-urlencoded  이렇게 생긴 데이타를 분석해서 가져올 수 있게 해주는 것
app.use(express.urlencoded({extended: true}))

//application/json 이렇게 생긴 데이타를 분석해서 가져올 수 있게 해주는 것
app.use(express.json())
app.use(cookieParser())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MonggoDb Connected...')).catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World!~안녕하세요~'))


app.post('/register', (req, res) => {
    //회원가입 할 때 필요한 정보들을 client에서 가져오면
    //그것들을 데이터 베이스에 넣어준다.
    const user = new User(req.body)
    user.save((err, userInfo) => {
        if(err) return rew.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    }) //monggodb에서 오는 메서드

})

app.post('/login', (req, res) => {
    //요청된 이메일이 데이터베이스에 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
    //요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인한다.

    user.comparePassword(req.body.password, (err, isMatch) => {
        if(!isMatch)
        return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})

        user.generateToken((err, user) => {
            if(err) return res.status(400).send(err);
            //토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
            res.cookie('x-auth', user.token)
            .status(200)
            .json({ loginSuccess: true, userId : user._id})


        })
    })

    })


})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))