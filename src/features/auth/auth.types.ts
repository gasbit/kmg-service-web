export type AuthSession = {
  token: string;
};

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  role: {
    id: string;
    code: string;
    name: string;
  };
};

export type LoginResult =
  | {
      ok: true;
      user: AuthUser;
    }
  | {
      ok: false;
      message: string;
      code?: string;
      requestId?: string;
    };

export type LoginResponseData = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: AuthUser;
};

export type CurrentUserResponseData = {
  user: AuthUser;
};
