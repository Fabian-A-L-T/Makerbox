class NotFoundError extends Error {
    constructor(message: string = "Recurso no encontrado") {
        super(message);
        this.name = "NotFoundError";
    }
}
class ValidationError extends Error {
    constructor(message: string = "A validation error has ocurred") {
        super(message);
        this.name = "ValidationError";
    }
}
export { ValidationError, NotFoundError };