export default function errorHandler(err, req, res, _next) {
  if (err) {
    const statusCode = err.statusCode || 500
    const exposeError = statusCode !== 500

    res
      .status(statusCode)
      .send({
        code: statusCode,
        message: exposeError ? err.message : 'Une erreur inattendue est survenue.'
      })

    if (statusCode === 500) {
      console.error(err)
    }
  }
}
