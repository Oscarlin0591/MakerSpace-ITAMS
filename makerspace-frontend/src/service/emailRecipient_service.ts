import { type NotificationRecipient } from "../types/index";

const sample: NotificationRecipient[] =  [
    {
        email: "email1"
    },
    {
        email: "email2"
    }
]

export function getItems(): NotificationRecipient[] {
    return sample;
}

export function getItem(email: string): NotificationRecipient | undefined{
    return sample.find((p) => p.email === email);
}