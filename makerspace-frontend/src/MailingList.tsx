import "./MailingList.css";
import quinnipacLogo from './assets/Logo.svg'
import email_symbol from './assets/mail.svg'
import edit_symbol from './assets/edit.svg'
import delete_symbol from './assets/delete.svg'
import {useState} from "react";
import AddEmailModal from "./components/AddEmailModal.tsx";

function MailingList() {
    const [emails, setEmails] = useState(["example@email.com", "johndoe@gmail.com"]);
    const [show, setShow] = useState(false);

    const addEmail = (email: string) => {
        const newEmails = emails;
        newEmails.push(email);
        setEmails(newEmails)
    }
    // const editEmail = (oldEmail: string, newEmail: string) => {
    //     const newEmails = emails.filter(email => email !== oldEmail);
    //     newEmails.push(newEmail);
    //     setEmails(newEmails)
    // }

    return (
        <div className="mailing-list">
            <div className="top">
                <img className="logo" src={quinnipacLogo}/>
                <p className="login-text">Mailing List</p>
            </div>
            <div className="bottom">
                <h2 className="header">Email</h2>
                <button className="add-email" onClick={() => setShow(true)}>+Add Email</button>
                <div className="emails">
                    {emails.map((email: string) => {return (
                        <div className="email-box">
                            <img className="email" src={email_symbol}/>
                            <div className="address-box">
                                <h2>{email}</h2>
                                <p>Example Name</p>
                            </div>
                            {/*<img className="edit" src={edit_symbol}/>*/}
                            <img className="delete" src={delete_symbol} onClick={() => setEmails(emails.filter(item => item != email))}/>
                        </div>
                        )
                    })}
                </div>
            </div>
            <AddEmailModal show={show} onCancel={() => setShow(false)} onSave={function(newEmail: string): void {
                setShow(false);
                addEmail(newEmail);
            } }/>
        </div>
    );
}

export default MailingList;
