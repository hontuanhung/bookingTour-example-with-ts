class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  path: any;
  value: any;
  errmsg: any;
  errors!: { [s: string]: unknown } | ArrayLike<unknown>;

  constructor(message: string, statusCode: number) {
    super(message); //super() gọi đến parent constructor
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export = AppError;
