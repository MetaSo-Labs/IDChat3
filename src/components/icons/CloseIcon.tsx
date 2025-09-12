import Svg, { Path } from "react-native-svg";

const CloseIcon = (props) => (
  <Svg fill="none" viewBox="0 0 10 10" {...props}>
    <Path
      fill="currentColor"
      d="M5 6.15L8.85 10 10 8.85 6.15 5 10 1.15 8.85 0 5 3.85 1.15 0 0 1.15 3.85 5 0 8.85 1.15 10 5 6.15Z"
    />
  </Svg>
);

export default CloseIcon;
