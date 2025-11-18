import {type Item } from "../types/index";

const sample: Item[] =  [
    {
        itemID: 1,
        categoryID: 1,
        itemName: "Item 1",
        quantity: 5,
        lowThreshold: 3
    },
    {
        itemID: 2,
        categoryID: 1,
        itemName: "Item 1",
        quantity: 6,
        lowThreshold: 5,
        color: "yellow"
    }
]

export function getItems(): Item[] {
    return sample;
}

export function getItem(id: number): Item | undefined{
    return sample.find((p) => p.itemID === id);
}