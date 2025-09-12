import Svg, { Path, Circle } from "react-native-svg";

const CloseIcon = (props) => (
  <Svg
    {...props}
    fill="none"
    width="16.602"
    height="16.601"
    viewBox="0 0 16.602 16.601"
  >
    <Path
      d="m15.54 16.601-3.535-3.536 1.061-1.06 3.536 3.535-1.061 1.061Z"
      fill-rule="evenodd"
      fill="currentColor"
    />
    <Circle
      cx="7.5"
      cy="7.5"
      stroke="currentColor"
      stroke-width="1.5"
      r="6.75"
    />
  </Svg>
);

export default CloseIcon;
