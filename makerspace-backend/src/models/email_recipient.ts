export class EmailRecipient {
  email: string;
  alerts: boolean;
  daily: boolean;
  weekly: boolean;

  constructor(email: string, alerts: boolean, daily: boolean, weekly: boolean) {
    this.email = email;
    this.alerts = alerts;
    this.daily = daily;
    this.weekly = weekly;
  }
};