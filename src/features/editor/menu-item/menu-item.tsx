
import useLayoutStore from "../store/use-layout-store";
import { Videos } from "./videos";

const ActiveMenuItem = () => {
  const { activeMenuItem } = useLayoutStore();

  if (activeMenuItem === "videos") {
    return <Videos />;
  }

  return null;
};

export const MenuItem = () => {
  return (
    <div className="w-[300px] flex-1">
      <ActiveMenuItem />
    </div>
  );
};
