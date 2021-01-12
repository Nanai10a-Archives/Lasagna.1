import UserCreateOutputData from "../../usecases/user/create/UserCreateOutputData";

type IUserCreatePresenter = (output_data: UserCreateOutputData) => void;

export default IUserCreatePresenter;
