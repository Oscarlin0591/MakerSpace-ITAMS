import { User } from "../models/user";
import { createClient, type PostgrestSingleResponse } from "@supabase/supabase-js";
import config from "../config.json";

const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_PUBLISHABLE_KEY);

export async function getUser(id:number | void) {
    if (typeof id === "number") {
        const data = await supabase.from("user").select().eq('user_id', id).single();
        const newItem : User = new User(data.data?.user_id, data.data?.hash, data.data?.is_admin);
        data.data = newItem;
        return data;
    } else {
        const data = await supabase.from("user").select();
        const itemArray : Array<User> | void = [];
        data.data?.forEach((item) => {
            let newItem = new User(item.user_id, item.hash, item.is_admin)
            itemArray.push(newItem);
        });
        data.data = itemArray;
        return data;
    }
}