/** 联系表单字段约束：客户端校验与 /api/contact 服务端校验共用 */

export const CONTACT_RECIPIENT = "shuangzhang@fintopia.tech";

export const CONTACT_LIMITS = {
  name: 80,
  email: 254,
  message: 2000,
} as const;

export type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

export type ContactFormField = keyof ContactFormValues;

export type ContactFormErrorCode = "required" | "email";

export type ContactFormErrors = Partial<
  Record<ContactFormField, ContactFormErrorCode>
>;

/** 宽松的邮箱格式：有且仅有一个 @，两侧非空且域名含点 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return value.length <= CONTACT_LIMITS.email && EMAIL_PATTERN.test(value);
}

export function normalizeContactValues(
  input: Partial<Record<ContactFormField, unknown>>,
): ContactFormValues {
  const pick = (field: ContactFormField) => {
    const raw = input[field];
    return typeof raw === "string"
      ? raw.trim().slice(0, CONTACT_LIMITS[field])
      : "";
  };
  return { name: pick("name"), email: pick("email"), message: pick("message") };
}

export function validateContactValues(
  values: ContactFormValues,
): ContactFormErrors {
  const errors: ContactFormErrors = {};
  if (!values.name) errors.name = "required";
  if (!values.email) {
    errors.email = "required";
  } else if (!isValidEmail(values.email)) {
    errors.email = "email";
  }
  if (!values.message) errors.message = "required";
  return errors;
}
