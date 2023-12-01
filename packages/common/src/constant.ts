/**
 * 接口错误状态
 */
export enum SpanStatus {
  Ok = 'ok',
  DeadlineExceeded = 'deadline_exceeded',
  Unauthenticated = 'unauthenticated',
  PermissionDenied = 'permission_denied',
  NotFound = 'not_found',
  ResourceExhausted = 'resource_exhausted',
  InvalidArgument = 'invalid_argument',
  Unimplemented = 'unimplemented',
  Unavailable = 'unavailable',
  InternalError = 'internal_error',
  UnknownError = 'unknown_error',
  Cancelled = 'cancelled',
  AlreadyExists = 'already_exists',
  FailedPrecondition = 'failed_precondition',
  Aborted = 'aborted',
  OutOfRange = 'out_of_range',
  DataLoss = 'data_loss',
}

/**
 * 用户行为类型
 */
export enum BREADCRUMBTYPES {
  CLICK = 'Click',
  RESOURCE = 'Resource_Error',
  CODEERROR = 'Code_Error',
  UNHANDLEDREJECTION = 'Unhandledrejection',
  XHR = 'Xhr',
  FETCH = 'Fetch',
  ROUTE = 'Route',
  CUSTOM = 'Custom',
}

/**
 * 状态
 */
export enum STATUS_CODE {
  ERROR = 'error',
  OK = 'ok',
}

/**
 * 监听的事件类型
 */
export enum EVENTTYPES {
  XHR = 'xhr',
  FETCH = 'fetch',
  CLICK = 'click',
  HISTORY = 'history',
  ERROR = 'error',
  HASHCHANGE = 'hashchange',
  UNHANDLEDREJECTION = 'unhandledrejection',
  RESOURCE = 'resource',
  DOM = 'dom',
  CUSTOM = 'custom',
}

export enum HTTPTYPE {
  XHR = 'xhr',
  FETCH = 'fetch',
}

export enum HTTP_CODE {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  INTERNAL_EXCEPTION = 500,
}

export enum EMethods {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE',
  PATCH = 'PATCH',
}
