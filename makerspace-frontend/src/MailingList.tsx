import "./MailingList.css";
import quinnipacLogo from './assets/Logo.svg'
import email_symbol from './assets/mail.svg'
import delete_symbol from './assets/delete.svg'
import {type ReactNode, useState} from "react";
import AddEmailModal from "./components/AddEmailModal.tsx";

function MailingList() {
    const [emails, setEmails] = useState(["example@email.com", "johndoe@gmail.com"]);
    const [show, setShow] = useState(false);

    function addEmail (email: string): void {
        const newEmails: string[] = emails;
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
            <nav className="dashboard-links d-flex">
          <a href="/home" className="mi-nav-link">
            Home
          </a>
          <a href="/mailing-list" className="mi-nav-link mi-nav-link-active">
            Notifications
          </a>
          <a href="/manage-inventory" className="mi-nav-link">
            Manage Inventory
          </a>
          <a href="/" className="mi-nav-link">
            Logout
          </a>
        </nav>
            <div className="bottom">
                
                <h2 className="header">Email</h2>
                <button className="add-email" onClick={(): void => setShow(true)}>+Add Email</button>
                <div className="emails">
                    {emails.map((email: string): ReactNode => {return (
                        <div className="email-box">
                            <img className="email" src={email_symbol}/>
                            <div className="address-box">
                                <h2>{email}</h2>
                            </div>
                            {/*<img className="edit" src={edit_symbol}/>*/}
                            <img className="delete" src={delete_symbol} onClick={() => setEmails(emails.filter(item => item != email))}/>
                        </div>
                        )
                    })}
                </div>
            </div>
            <AddEmailModal show={show} onCancel={(): void => setShow(false)} onSave={function(newEmail: string): void {
                setShow(false);
                addEmail(newEmail);
            } }/>
        </div>
    );
}

export default MailingList;
