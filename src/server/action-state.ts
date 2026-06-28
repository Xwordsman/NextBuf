export type ActionState = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

export const emptyActionState: ActionState = {};

export function toFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }));
}

export function formValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export function checkboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}
