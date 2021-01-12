import UserCreateInputData from "../usecases/user/create/UserCreateInputData";
import IUserCreateUsecase from "../usecases/user/create/IUserCreateUsecase";

class UserController {
  private readonly userCreateUseCase: IUserCreateUsecase;

  constructor(userCreateUseCase: IUserCreateUsecase) {
    this.userCreateUseCase = userCreateUseCase;
  }

  create = (input_data: UserCreateInputData): void => {
    this.userCreateUseCase(input_data);
  };
}

export default UserController;
