import { createClient } from "@supabase/supabase-js";
import { EmailRecipient } from "../models/email_recipient";
import config from "../config.json";

const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_PUBLISHABLE_KEY);

export async function postEmail(email: EmailRecipient) {
    const { data, error } = await supabase
      .from('email_recipient')
      .insert({
          email: email.email,
          alert_notifications: email.alerts,
          daily_notifications: email.daily,
          weekly_notifications: email.weekly
      })
      .select()
      .single();

    return { success: !error, data, error };
}


export async function putEmail(email: EmailRecipient) {
    const { error } = await supabase
      .from('email_recipient')
      .update({ email: email.email, alert_notifications: email.alerts, daily_notifications: email.daily, weekly_notifications: email.weekly })
      .eq('email', email.email)
      .select()
      .single();

    return { success: !error, error };
}

export async function deleteEmail(email: EmailRecipient) {
    const { error } = await supabase
        .from('email_recipient')
        .delete()
        .eq('email', email);

    return { success: !error, error };
}

export async function getEmail(email: string | void) {
    if (typeof email === "string") {
        const data = await supabase.from("email_recipient").select().eq('email', email).single();
        const newEmail : EmailRecipient = new EmailRecipient(data.data?.email, data.data?.alert_notifications, data.data?.daily_notifications, data.data?.weekly_notifications);
        data.data = newEmail;
        return data;
    } else {
        const data = await supabase.from("email_recipient").select();
        const emailArray : Array<EmailRecipient> | void = [];
        data.data?.forEach((email) => {
            let newEmail = new EmailRecipient(email.email, email.alert_notifications, email.daily_notifications, email.weekly_notifications);
            emailArray.push(newEmail);
        });
        data.data = emailArray;
        return data;
    }
}