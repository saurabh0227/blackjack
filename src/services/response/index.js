export const success = (res, status, entity) => {
    console.log(`${res.statusCode} ${res.req.method} ${res.req.originalUrl}`)
    if (entity) {
        res.status(status || 200).json(entity);
    }
    return null
}