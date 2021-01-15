import Result from "../utils/Result";

type IUsecase<I, O, E> = (input_data: I) => Result<O, E>;

export default IUsecase;
