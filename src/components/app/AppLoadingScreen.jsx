import { Skeleton } from "../ui";
import BrandMark from "../brand/BrandMark";

export default function AppLoadingScreen({ message = "Loading AnyPetOS..." }) {
  return (
    <div className="ui-loading-screen" role="status" aria-live="polite">
      <div className="ui-loading-screen__panel">
        <div className="ui-loading-screen__mark" aria-hidden="true">
          <BrandMark size={42} />
        </div>
        <Skeleton width="72%" height="1.1rem" />
        <Skeleton width="48%" height="0.8rem" />
        <p className="ui-loading-screen__message">{message}</p>
      </div>
    </div>
  );
}
