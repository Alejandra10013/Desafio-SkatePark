const { Pool } = require("pg")

const pool = new Pool({
    user: "postgres",
    port: 5432,
    host: "localhost",
    password: "12345",
    database: "skatepark"
})

async function consultarUsuarios() {
    try {
        const result = await pool.query("select * from skaters")
        return result.rows
    } catch (err) {
        console.log(e);
    }
}

async function nuevoUsuario(email, nombre, password, anios, especialidad, foto) {
    try {
        const result = await pool.query(`
            insert into skaters (email, nombre, password, anios_experiencia, especialidad, foto, estado)
            values ('${email}', '${nombre}', '${password}', '${anios}', '${especialidad}', '${foto}', false)
            returning *
        `)
    } catch (err) {
        console.log(err);
    }
}

async function getUsuario(email, password) {
    try {
        const result = await pool.query(`
            select * from skaters where email = '${email}' and password = '${password}'
        `)
        return result.rows
    } catch (err) {
        console.log(err);
    }
}

async function setUsuarioStatus(id, estado) {
    const result = await pool.query(`
        update skaters set estado = ${estado} where id = ${id} returning *
    `)
    const usuario = result.rows[0]
    return usuario;
}

async function setDatosUsuario(email, nombre, password, anios, especialidad) {
    const result = await pool.query(`
        update skaters set nombre = '${nombre}', password = '${password}', anios_experiencia = '${anios}', especialidad = '${especialidad}'
        where email = '${email}' returning *
    `)
    const usuario = result.rows[0]
    return usuario
}

async function eliminarCuenta(email) {
    const result = await pool.query(`
    delete from skaters where email = '${email}'
    `)
    return result.rowCount
}

module.exports = { consultarUsuarios, nuevoUsuario, getUsuario, setDatosUsuario, setUsuarioStatus, eliminarCuenta}