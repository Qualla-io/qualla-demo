import { gql, useMutation, useReactiveVar } from "@apollo/client";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { accountVar } from "../cache";

const PROVIDE_FEEDBACK = gql`
  mutation submitFeedback($userID: String!, $feedback: String!) {
    provideFeedback(userID: $userID, feedback: $feedback)
  }
`;

export default function FeedbackDialog({ _open, _setOpen }) {
  const [feedback, setFeedback] = useState("");
  const [submitFeedback] = useMutation(PROVIDE_FEEDBACK);
  const { enqueueSnackbar } = useSnackbar();
  const account = useReactiveVar(accountVar);

  const handleChange = (event) => {
    setFeedback(event.target.value);
  };

  const submit = () => {
    submitFeedback({ variables: { userID: account, feedback: feedback } })
      .then((res) => {
        enqueueSnackbar(
          `Thanks for your feedback!  Join our discord to talk more!`,
          {
            variant: "success",
          }
        );
        _setOpen(false);
      })
      .catch((err) => {
        enqueueSnackbar(`${err}`, {
          variant: "error",
        });
      });
  };

  return (
    <Dialog
      open={_open}
      onClose={() => {
        _setOpen(false);
      }}
    >
      <DialogTitle>Thanks for your Feedback!</DialogTitle>
      <DialogContent></DialogContent>
      <TextField
        style={{
          flexGrow: 1,
          marginLeft: 20,
          marginRight: 20,
          marginBottom: 20,
        }}
        id="outlined-multiline-static"
        multiline
        rows={8}
        variant="outlined"
        name="description"
        onChange={handleChange}
        value={feedback}
      />
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            _setOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button variant="contained" color="secondary" onClick={submit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
