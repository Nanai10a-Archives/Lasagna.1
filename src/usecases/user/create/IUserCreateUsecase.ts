import UserCreateInputData from "./UserCreateInputData";
import UserCreateOutputData from "./UserCreateOutputData";

type IUserCreateUsecase = (input_data: UserCreateInputData) => UserCreateOutputData;

export default IUserCreateUsecase;
