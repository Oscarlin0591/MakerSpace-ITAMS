import { createClient } from "@supabase/supabase-js";
import { EmailRecipient } from "../models/email_recipient";
import config from "../config.json";

const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_PUBLISHABLE_KEY);

export async function getEmail(email: string | void) {
    if (typeof email === "string") {
        const data = await supabase.from("email_recipient").select().eq('email', email).single();
        const newEmail : EmailRecipient = new EmailRecipient(data.data?.email);
        data.data = newEmail;
        return data;
    } else {
        const data = await supabase.from("email_recipient").select();
        const emailArray : Array<EmailRecipient> | void = [];
        data.data?.forEach((email) => {
            let newEmail = new EmailRecipient(email.email);
            emailArray.push(newEmail);
        });
        data.data = emailArray;
        return data;
    }
}