import IUsecase from "../../IUsecase";
import UserCreateInputData from "./UserCreateInputData";
import UserCreateOutputData from "./UserCreateOutputData";
import { UserCreateErrorProps, UserCreateErrorReason } from "./UserCreateError";

type IUserCreateUsecase = IUsecase<
  UserCreateInputData,
  UserCreateOutputData,
  UserCreateErrorReason,
  UserCreateErrorProps
>;

export default IUserCreateUsecase;
