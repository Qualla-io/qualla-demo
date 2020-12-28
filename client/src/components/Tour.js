import React, {
  useReducer,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import JoyRide, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import RepeatIcon from "@material-ui/icons/Repeat";

const TOUR_STEPS = [
  {
    target: ".tour-first",
    content: "This is the first step in the tour",
  },
  {
    target: ".MuiFab-primary",
    content: "This is the second step in the tour",
  },
];

const INITIAL_STATE = {
  run: false,
  continuous: true,
  loading: false,
  stepIndex: 0,
  steps: TOUR_STEPS,
  key: new Date(),
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "START":
      return { ...state, run: true };
    case "RESET":
      return { ...state, stepIndex: 0 };
    case "STOP":
      return { ...state, run: false };
    case "NEXT_OR_PREV":
      return { ...state, ...action.payload };
    case "RESTART":
      return {
        ...state,
        stepIndex: 0,
        run: true,
        loading: false,
        key: new Date(),
      };
    default:
      return state;
  }
};

const Tour = forwardRef((props, ref) => {
  const [tourState, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    // if (localStorage.getItem("tour")) {
    dispatch({ type: "START" });
    // }
  }, []);

  const callback = (data) => {
    const { action, index, type, status } = data;
    if (
      action === ACTIONS.CLOSE ||
      (status === STATUS.SKIPPED && tourState.run) ||
      status === STATUS.FINISHED
    ) {
      dispatch({ type: "STOP" });
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      dispatch({
        type: "NEXT_OR_PREV",
        payload: { stepIndex: index + (action === ACTIONS.PREV ? -1 : 1) },
      });
    }
  };

  useImperativeHandle(ref, () => ({
    startTour() {
      dispatch({ type: "RESTART" });
      console.log("restarting");
    },
  }));

  return (
    <>
      <JoyRide
        {...tourState}
        callback={callback}
        showSkipButton={true}
        styles={{
          tooltipContainer: {
            textAlign: "left",
          },

          buttonBack: {
            marginRight: 10,
          },
        }}
        locale={{
          last: "End tour",
        }}
      />
    </>
  );
});

export default Tour;
