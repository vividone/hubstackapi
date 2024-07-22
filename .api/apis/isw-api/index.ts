import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'isw-api/unknown (api/6.1.2)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Here, the actual transaction is performed.
   *
   * @summary Send Bill Payment Advice
   * @throws FetchError<400, types.SendTransactionResponse400> 400
   */
  sendTransaction(metadata?: types.SendTransactionMetadataParam): Promise<FetchResponse<200, types.SendTransactionResponse200>> {
    return this.core.fetch('/Transactions', 'post', metadata);
  }

  /**
   * This fetches the list of billers available under a particular category, the parameter
   * ```id``` refers to the category id being queried.
   *
   * @summary Get Billers by Category
   * @throws FetchError<400, types.GetBillersByCategory2Response400> 400
   */
  getBillersByCategory2(metadata: types.GetBillersByCategory2MetadataParam): Promise<FetchResponse<200, types.GetBillersByCategory2Response200>> {
    return this.core.fetch('/services?categoryId={id}', 'get', metadata);
  }

  /**
   * This fetches the list of available billers
   *
   * @summary Get Billers
   * @throws FetchError<400, types.GetBillersResponse400> 400
   */
  getBillers(metadata?: types.GetBillersMetadataParam): Promise<FetchResponse<200, types.GetBillersResponse200>> {
    return this.core.fetch('/services', 'get', metadata);
  }

  /**
   * This fetches the items available under a biller.
   *
   * @summary Get Biller Payment Item
   * @throws FetchError<400, types.GetBillerPaymentItemResponse400> 400
   */
  getBillerPaymentItem(metadata: types.GetBillerPaymentItemMetadataParam): Promise<FetchResponse<200, types.GetBillerPaymentItemResponse200>> {
    return this.core.fetch('/services/options?serviceid={billerid}', 'get', metadata);
  }

  /**
   * Customer Validation
   *
   * @throws FetchError<400, types.CustomerValidation1Response400> 400
   */
  customerValidation1(body?: types.CustomerValidation1BodyParam, metadata?: types.CustomerValidation1MetadataParam): Promise<FetchResponse<200, types.CustomerValidation1Response200>> {
    return this.core.fetch('/Transactions/validatecustomers', 'post', body, metadata);
  }

  /**
   * Query Transaction
   *
   * @throws FetchError<400, types.QueryTransaction1Response400> 400
   */
  queryTransaction1(metadata?: types.QueryTransaction1MetadataParam): Promise<FetchResponse<200, types.QueryTransaction1Response200>> {
    return this.core.fetch('/Transactions?requestRef=requestReferencevalue', 'get', metadata);
  }

  /**
   * This method retrieves all the biller category types
   *
   * @summary Get Billers Categories
   * @throws FetchError<400, types.GetBillersCategoriesResponse400> 400
   */
  getBillersCategories(metadata?: types.GetBillersCategoriesMetadataParam): Promise<FetchResponse<200, types.GetBillersCategoriesResponse200>> {
    return this.core.fetch('/services/categories', 'get', metadata);
  }

  /**
   * Create Voucher (E pins)
   *
   * @throws FetchError<400, types.CreateVoucherEPinResponse400> 400
   */
  createVoucherEPin(body: types.CreateVoucherEPinBodyParam, metadata: types.CreateVoucherEPinMetadataParam): Promise<FetchResponse<200, types.CreateVoucherEPinResponse200>> {
    return this.core.fetch('/vouchers/generateVoucher', 'post', body, metadata);
  }

  /**
   * Redeem Voucher (E pins)
   *
   * @throws FetchError<400, types.RedeemVoucherEPinResponse400> 400
   */
  redeemVoucherEPin(): Promise<FetchResponse<200, types.RedeemVoucherEPinResponse200>> {
    return this.core.fetch('/vouchers/redeemVoucher', 'post');
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { CreateVoucherEPinBodyParam, CreateVoucherEPinMetadataParam, CreateVoucherEPinResponse200, CreateVoucherEPinResponse400, CustomerValidation1BodyParam, CustomerValidation1MetadataParam, CustomerValidation1Response200, CustomerValidation1Response400, GetBillerPaymentItemMetadataParam, GetBillerPaymentItemResponse200, GetBillerPaymentItemResponse400, GetBillersByCategory2MetadataParam, GetBillersByCategory2Response200, GetBillersByCategory2Response400, GetBillersCategoriesMetadataParam, GetBillersCategoriesResponse200, GetBillersCategoriesResponse400, GetBillersMetadataParam, GetBillersResponse200, GetBillersResponse400, QueryTransaction1MetadataParam, QueryTransaction1Response200, QueryTransaction1Response400, RedeemVoucherEPinResponse200, RedeemVoucherEPinResponse400, SendTransactionMetadataParam, SendTransactionResponse200, SendTransactionResponse400 } from './types';
