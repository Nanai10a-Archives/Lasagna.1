import { Ok, Err } from "../../../utils/Result";
import IUserCreateUsecase from "./IUserCreateUsecase";

const UserCreateInteractor: IUserCreateUsecase = (input_data) => {
  return new Ok({ id: "", name: "", uuid: "" });
};

export default UserCreateInteractor;
