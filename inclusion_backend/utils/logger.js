const info = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(new Date().toISOString(), ...params)
  }
}

const error = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(new Date().toISOString(), 'ERROR:', ...params)
  }
}

const debug = (...params) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(new Date().toISOString(), 'DEBUG:', ...params)
  }
}

module.exports = {
  info,
  error,
  debug
}
