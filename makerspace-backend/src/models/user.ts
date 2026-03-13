export class User {
  username: string;
  hash: string;
  is_admin: boolean;

  constructor (username: string, hash: string, is_admin: boolean) {
    this.username = username;
    this.hash = hash;
    this.is_admin = is_admin;
  }
};