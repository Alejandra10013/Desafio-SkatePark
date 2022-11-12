const express = require("express")
const app = express()
const bodyParser = require("body-parser")
require("dotenv").config()
const { create } = require("express-handlebars")
const expressFileupload = require("express-fileupload")
const jwt = require("jsonwebtoken")
const secretKey = "secret01"

const { consultarUsuarios, nuevoUsuario, setUsuarioStatus, getUsuario, setDatosUsuario, eliminarCuenta } = require("./consultas")

app.listen(process.env.PORT, () => { console.log("Server is running on: http://localhost:3000") })

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(__dirname + "/public"))
app.use(express.static("archivos"))

app.use(expressFileupload({
    limits: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit: "El peso del archivo supera el limite permitido."
}))

const hbs = create({
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layout"
})

app.engine("handlebars", hbs.engine)
app.set("view engine", "handlebars")
app.set("views", "./views")


app.get("/", (req, res) => {
    res.render("home")
})

app.get("/registro", (req, res) => {
    res.render("registro")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/admin", async (req, res) => {
    try {
        const usuarios = await consultarUsuarios()
        res.render("admin", { usuarios })
    } catch (err) {
        res.status(500).send({
            error: `Algo salio mal... ${err}`,
            code: 500
        })
    }
})

app.get("/usuarios", async (req, res) => {
    const resp = await consultarUsuarios()
    res.send(resp)
})

app.post("/usuario", async (req, res) => {
    const { email, nombre, password, anios, especialidad, nombre_foto } = req.body
    try {
        const resp = await nuevoUsuario(email, nombre, password, anios, especialidad, nombre_foto)
        res.status(201).send(resp)
    } catch (err) {
        res.status(500).send({
            error: `Algo salio mal... ${err}`,
            code: 500
        })
    }
})

app.post("/registrar", async (req, res) => {
    const { email, nombre, password, password2, anios, especialidad } = req.body
    const { foto } = req.files;
    const { name } = foto

    if (password !== password2) {
        res.send('<script>alert("Las contraseñas no coinciden"); window.location.href = "/registro";</script>')
    } else {
        try {
            const resp = await nuevoUsuario(email, nombre, password, anios, especialidad, name)
                .then(() => {
                    foto.mv(`${__dirname}/public/uploads/${name}`, (err) => {
                        res.send('<script>alert("Se ha registrado con exito."); window.location.href = "/login";</script>')
                    })
                })
        } catch (err) {
            res.status(500).send({
                error: `Algo salio mal... ${err}`,
                code: 500
            })
        }
    }
})

app.put("/usuarios", async (req, res) => {
    const { id, estado } = req.body
    try {
        const usuario = await setUsuarioStatus(id, estado)
        res.status(200).send(usuario)
    } catch (err) {
        res.status(500).send({
            error: `Algo salio mal... ${err}`,
            code: 500
        })
    }
})

app.post("/verifica", async (req, res) => {
    const { email, password } = req.body
    const user = await getUsuario(email, password)

    if (email === "" || password === "") {
        res.status(401).send({
            error: "Debe completar todos los campos",
            code: 401
        })
    } else {
        if (user.length != 0) {
            if (user[0].estado === true) {
                const token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + 180,
                    data: user
                }, secretKey)
                res.send(token)
            } else {
                res.status(401).send({
                    error: "No ha sido posible registrar el usuario. Verifique el estado de la cuenta.",
                    code: 401
                })
            }
        } else {
            res.status(404).send({
                error: "El usuario no esta registrado o los datos no coinciden.",
                code: 404
            })
        }
    }
})

// const verificarToken = (req, res, next) => {
//     let { token } = req.query
//     jwt.verify(toke, secretKey, (error, data) => {
//         if (error) {
//             res.status(401).send("Usuario no autorizado. Ruta denegada.")
//         } else {
//             next()
//         }
//     })
// }

app.get("/datos", (req, res) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err, decoded) => {
        const { data } = decoded
        /* const { nombre,email } = data */
        const email = data[0].email;
        const nombre = data[0].nombre;
        const password = data[0].password;
        const anios = data[0].anios;
        const especialidad = data[0].especialidad;
        err
            ? res.status(401).send({
                error: '401 Unauthorized',
                message: 'Usted no está autorizado para estar aquí',
                token_error: err.message,
            })
            : res.render("datos", { email, nombre, password, anios, especialidad })
    })
})

app.get("/datosUsuario", async (req, res) => {
    const resp = await consultarUsuarios()
    res.send(resp)
})

app.put("/datosPerfil", async (req, res) => {
    const { email, nombre, password, anios, especialidad } = req.body
    try {
        const usuario = await setDatosUsuario(email, nombre, password, anios, especialidad)
        res.status(200).send(usuario)
    } catch (err) {
        res.status(500).send({
            error: `Algo salio mal... ${err}`,
            code: 500
        })
    }
})

app.delete("/eliminarCuenta/:email", async (req, res) => {
    try {
        const { email } = req.params
        const resp = await eliminarCuenta(email)
        res.sendStatus(200).send(respuesta)
    } catch (err) {
        res.status(500).send({
            error: `Algo salio mal... ${err}`,
            code: 500
        })
    }
})