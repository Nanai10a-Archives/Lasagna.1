import User from "../../entities/User";

interface IUserRepository {
  save(user: User): void;
}

export default IUserRepository;
