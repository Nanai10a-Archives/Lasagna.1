import Result from "../utils/Result";
import LasagnaError from "../utils/LasagnaError";

type IUsecase<I, O, ET extends string, EO> = (input_data: I) => Result<O, LasagnaError<ET, EO>>;

export default IUsecase;
