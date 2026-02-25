export class ErrorWithStatus extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}
