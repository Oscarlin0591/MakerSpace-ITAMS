import { type User } from "../types/index";

const sample: User[] =  [
    {
        username: "string1",
        hash: "hash1",
        is_admin: false
    },
    {
        username: "string2",
        hash: "hash2",
        is_admin: true
    }
]

export function getItems(): User[] {
    return sample;
}

export function getItem(username: string): User | undefined{
    return sample.find((p) => p.username === username);
}