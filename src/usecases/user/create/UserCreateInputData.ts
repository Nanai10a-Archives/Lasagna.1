import User from "../../../entities/User";

type UserCreateInputData = Omit<User, "uuid">;

export default UserCreateInputData;
