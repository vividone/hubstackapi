import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';

export type CreateVoucherEPinBodyParam = FromSchema<typeof schemas.CreateVoucherEPin.body>;
export type CreateVoucherEPinMetadataParam = FromSchema<typeof schemas.CreateVoucherEPin.metadata>;
export type CreateVoucherEPinResponse200 = FromSchema<typeof schemas.CreateVoucherEPin.response['200']>;
export type CreateVoucherEPinResponse400 = FromSchema<typeof schemas.CreateVoucherEPin.response['400']>;
export type CustomerValidation1BodyParam = FromSchema<typeof schemas.CustomerValidation1.body>;
export type CustomerValidation1MetadataParam = FromSchema<typeof schemas.CustomerValidation1.metadata>;
export type CustomerValidation1Response200 = FromSchema<typeof schemas.CustomerValidation1.response['200']>;
export type CustomerValidation1Response400 = FromSchema<typeof schemas.CustomerValidation1.response['400']>;
export type GetBillerPaymentItemMetadataParam = FromSchema<typeof schemas.GetBillerPaymentItem.metadata>;
export type GetBillerPaymentItemResponse200 = FromSchema<typeof schemas.GetBillerPaymentItem.response['200']>;
export type GetBillerPaymentItemResponse400 = FromSchema<typeof schemas.GetBillerPaymentItem.response['400']>;
export type GetBillersByCategory2MetadataParam = FromSchema<typeof schemas.GetBillersByCategory2.metadata>;
export type GetBillersByCategory2Response200 = FromSchema<typeof schemas.GetBillersByCategory2.response['200']>;
export type GetBillersByCategory2Response400 = FromSchema<typeof schemas.GetBillersByCategory2.response['400']>;
export type GetBillersCategoriesMetadataParam = FromSchema<typeof schemas.GetBillersCategories.metadata>;
export type GetBillersCategoriesResponse200 = FromSchema<typeof schemas.GetBillersCategories.response['200']>;
export type GetBillersCategoriesResponse400 = FromSchema<typeof schemas.GetBillersCategories.response['400']>;
export type GetBillersMetadataParam = FromSchema<typeof schemas.GetBillers.metadata>;
export type GetBillersResponse200 = FromSchema<typeof schemas.GetBillers.response['200']>;
export type GetBillersResponse400 = FromSchema<typeof schemas.GetBillers.response['400']>;
export type QueryTransaction1MetadataParam = FromSchema<typeof schemas.QueryTransaction1.metadata>;
export type QueryTransaction1Response200 = FromSchema<typeof schemas.QueryTransaction1.response['200']>;
export type QueryTransaction1Response400 = FromSchema<typeof schemas.QueryTransaction1.response['400']>;
export type RedeemVoucherEPinResponse200 = FromSchema<typeof schemas.RedeemVoucherEPin.response['200']>;
export type RedeemVoucherEPinResponse400 = FromSchema<typeof schemas.RedeemVoucherEPin.response['400']>;
export type SendTransactionMetadataParam = FromSchema<typeof schemas.SendTransaction.metadata>;
export type SendTransactionResponse200 = FromSchema<typeof schemas.SendTransaction.response['200']>;
export type SendTransactionResponse400 = FromSchema<typeof schemas.SendTransaction.response['400']>;
