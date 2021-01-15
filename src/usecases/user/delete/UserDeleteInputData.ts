import User from "../../../entities/User";

type UserDeleteInputData = Pick<User, "uuid">;

export default UserDeleteInputData;
