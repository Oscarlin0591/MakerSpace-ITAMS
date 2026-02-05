import {User} from "../models/user";
import {createClient} from "@supabase/supabase-js";
import config from "../config.json";

const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_PUBLISHABLE_KEY);

export async function getUser(id:number | void) {
    if (typeof id === "number") {
        const data = await supabase.from("user_table").select().eq('user_id', id).single();
        data.data = new User(data.data?.username, data.data?.hash, data.data?.is_admin);
        return data;
    } else {
        const data = await supabase.from("user_table").select();
        const itemArray : Array<User> | void = [];
        data.data?.forEach((item) => {
            let newItem = new User(item.username, item.hash, item.is_admin)
            itemArray.push(newItem);
        });
        data.data = itemArray;
        return data;
    }
}