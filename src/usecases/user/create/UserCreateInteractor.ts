import IUserCreateUsecase from "./IUserCreateUsecase";
import UserCreateInputData from "./UserCreateInputData";
import UserCreateOutputData from "./UserCreateOutputData";

const UserCreateInteractor: IUserCreateUsecase = (
  input_data: UserCreateInputData,
): UserCreateOutputData => {
  return {
    id: "",
    name: "",
    uuid: "",
  };
};

export default UserCreateInteractor;
