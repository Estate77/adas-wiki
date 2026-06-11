/**
 * IMA 知识库 OpenAPI · 异常体系
 */

export class IMAError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IMAError';
  }
}

/** 鉴权失败（缺/无效的 clientid/apikey） */
export class IMAAuthError extends IMAError {
  constructor(message: string) {
    super(message);
    this.name = 'IMAAuthError';
  }
}

/** 远端 API 错误（非 2xx 或业务失败） */
export class IMAAPIError extends IMAError {
  public readonly status: number;
  public readonly payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(`HTTP ${status}: ${message}`);
    this.name = 'IMAAPIError';
    this.status = status;
    this.payload = payload;
  }
}

/** 本地参数/配置错误 */
export class IMAConfigError extends IMAError {
  constructor(message: string) {
    super(message);
    this.name = 'IMAConfigError';
  }
}
