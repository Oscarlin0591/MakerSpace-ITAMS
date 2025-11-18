import {type ItemTransaction } from "../types/index";

const sample: ItemTransaction[] =  [
    {
        transactionId: 1,
        itemId: 1,
        quantityChanged: 3,
    },
    {
        transactionId: 2,
        itemId: 5,
        quantityChanged: -3,
    }
]

export function getItems(): ItemTransaction[] {
    return sample;
}

export function getItem(id: number): ItemTransaction | undefined{
    return sample.find((p) => p.transactionId === id);
}