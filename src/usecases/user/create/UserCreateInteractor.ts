import UserCreateInputData from "./UserCreateInputData";
import UserCreateOutputData from "./UserCreateOutputData";
import IUsecase from "../../IUsecase";

const UserCreateInteractor: IUsecase<UserCreateInputData, UserCreateOutputData> = (
  input_data: UserCreateInputData,
): UserCreateOutputData => {
  return {
    id: "",
    name: "",
    uuid: "",
  };
};

export default UserCreateInteractor;
