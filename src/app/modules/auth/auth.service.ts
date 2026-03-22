interface IAuthPayload {
  email: string;
  password: string;
}

const loginUser = async (payload: IAuthPayload) => {
  console.log("called");
  console.log("Login payload", payload);
};

export const AuthService = {
  loginUser,
};
