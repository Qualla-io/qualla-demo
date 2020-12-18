import { makeStyles } from "@material-ui/core/styles";

export const cardStyles = makeStyles((theme) => ({
  card: {
    display: "flex",
    flexDirection: "column",
    background: "#FFFFFF",
    border: "3px solid #000000",
    boxSizing: "border-box",
    boxShadow: "10px 10px 4px rgba(0, 0, 0, 0.25)",
    borderRadius: "30px",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4),
    marginRight: theme.spacing(4),
    marginBottom: theme.spacing(2),
    width: 250,
    minHeight: 385,
  },
  avatar: {
    height: 125,
    width: 125,
    backgroundColor: theme.palette.secondary.main,
  },
  icons: {
    fontSize: "4em",
  },
  content: {
    marginTop: theme.spacing(2),
  },
  btn: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
