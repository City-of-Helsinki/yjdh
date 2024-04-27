type User = {
  id?: string;
  first_name?: string;
  last_name?: string;
  given_name: string;
  family_name: string;
  name: string;
  organization_name?: string;
  is_staff?: boolean;
  csrf_token?: string;
};
export default User;
