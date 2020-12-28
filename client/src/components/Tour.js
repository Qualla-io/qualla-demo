import React, {
  useReducer,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import JoyRide, { ACTIONS, EVENTS, STATUS } from "react-joyride";

const TOUR_STEPS = [
  {
    placement: "center",
    title: "Welcome!",
    content: "Welcome to the Qualla Demo! Lets take a tour together!",
    target: "body",
  },
  {
    target: ".MuiFab-primary",
    content:
      "This is where the action happens. If you get lost, you can restart the tour from here.",
  },
  {
    target: ".MuiFab-primary",
    content: `You can also mint yourself funds here. Go ahead to open the menu and click "Mint"`,
  },
  {
    target: ".makeStyles-balanceDiv-9",
    content:
      "These are your funds for the demo. You need some to buy a subscription. It may take a minute or two for your funds to show after minting them.",
  },
  {
    target: ".makeStyles-username-15",
    content:
      "This is your profile info. For now you can only change your usename",
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
