import { createClient } from "@supabase/supabase-js";
import { Transaction } from "../models/transaction";
import config from "../config.json";

const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_PUBLISHABLE_KEY);

export async function getTransaction(trans_id:number) {
    if (typeof trans_id === "number") {
        const data = await supabase.from("transaction").select().eq('transaction_id', trans_id).single();
        const newTransaction : Transaction = new Transaction(data.data?.transaction_id, data.data?.transaction_source, data.data?.timestamp);
        data.data = newTransaction;
        return data;
    } else {
        const data = await supabase.from("transaction").select();
        const transactionArray : Array<Transaction> | void = [];
        data.data?.forEach((trans) => {
            let newTransaction = new Transaction(trans.transaction_id, trans.transaction_source, trans.timestamp);
            transactionArray.push(newTransaction);
        });
        data.data = transactionArray;
        return data;
    }
}