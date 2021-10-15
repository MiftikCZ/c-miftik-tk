const express = require("express")
const app = express()
const db = require("quick.db")
const path = require("path")
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 12 // 12r/60s
});

app.use("/api/v1/new", apiLimiter);


app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))

app.get("/", (req, res) => {
    res.redirect("/new")
})

app.get("/new", (req, res) => {
    res.sendFile(path.resolve(__dirname, "web", "new.html"))
})

app.get("/src/v1/script", (req, res) => {
    res.sendFile(path.resolve(__dirname, "web", "scripts", "index.js"))
})
app.get("/src/v1/style", (req, res) => {
    res.sendFile(path.resolve(__dirname, "web", "scripts", "style.css"))
})

app.get("/:code", (req, res) => {
    let json = db.get(`api.codes.${req.params.code}`)
    if(!json) {
        return res.status(404).send(`This code (${req.params.code}) doesn't exist.`)
    }
    res.send(`
    <head>
        <title>${json.title}</title>
        <meta name="description" content="${json.description}">
        </head>
        <body>
        <script>
            window.location.replace("${json.redirectUrl}")
        </script>
    </body>`)
})

app.get("/api/v1/code/:code", (req, res) => {
    let d = db.get(`api.codes.${req.params.code}`)
    if(!d) {
        return res.status(404).send({
            result: `This code (${req.params.code}) doesn't exist.`
        })
    }
    res.json(d)
})


app.post("/api/v1/new", (req, res) => {
    const type = req.body.type
    if(!type) {
        return res.status(400).json({
            result: "Required 'type' argument in body missing."
        })
    }
    if(type === "redirect") {
        const redirectUrl = req.body.redirectUrl
        if(!redirectUrl) {
            res.status(400).json({
                result: "Required 'redirectUrl' argument in body missing."
            })
        }
        let code = randstr(6)
        let json = {
            redirectUrl,
            title: req.body.title || "Miftik's url shortener",
            description: req.body.description || "Free url shortener by MiftikCZ",
        }
        db.set(`api.codes.${code}`, json)
        return res.json({
            code,
            sucess: true,
        })
    }
    res.status(400).send({
        result: "This type doesn't exist."
    })
})

app.listen(3000, () => {
    console.log("Online")
})



function randstr(len) {
    let alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
    let text = ''
    for (let i = 0; i < len; i++) {
        text += alpha[Math.floor(Math.random() * alpha.length)];
    }
    return text;
}