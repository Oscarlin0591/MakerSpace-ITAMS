import {User} from "../models/user";
import {createClient} from "@supabase/supabase-js";
import config from "../config.json";
import bcrypt from 'bcrypt';

const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_PUBLISHABLE_KEY);

export async function getUser(username: string | void) {
    if (typeof username === "string") {
        const data = await supabase.from("user_table").select().eq('username', username).single();
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

export async function authenticateUser(username: string, password: string): Promise<boolean> {
    const user = await getUser(username);
    if (user.data.hash) {
        return bcrypt.compare(password, user.data.hash);
    }
    return false;
}