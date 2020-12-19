import { makeStyles } from "@material-ui/core/styles";

export const cardStyles = makeStyles((theme) => ({
  newCard: {
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
    width: 500,
    minHeight: 510,
  },
  avatarSelection: {
    display: "flex",
    justify: "center",
    alignItems: "center",
  },
  avatar: {
    height: 125,
    width: 125,
    backgroundColor: theme.palette.secondary.main,
  },
  avatarTitle: {
    display: "flex",
    justifyContent: "left",
    width: 300,
    marginBottom: theme.spacing(1),
  },
  icons: {
    fontSize: "4em",
  },
  newIcon: {
    fontSize: "8em",
    color: theme.palette.secondary.main,
  },
  arrowIcon: {
    fontSize: "8em",
    color: theme.palette.secondary.main,
    cursor: "pointer",
  },
  content: {
    marginTop: theme.spacing(2),
  },
  titleInput: {
    marginTop: theme.spacing(2),
    width: 300,
  },
  description: {
    marginTop: theme.spacing(2),
    width: 300,
  },
  dollarSection: {
    display: "flex",
    justify: "center",
    alignItems: "center",
    paddingTop: theme.spacing(2),
    width: 300,
  },
  dollarInput: {
    width: 100,
  },
  periodInput: {
    width: 150,
  },
  slash: {
    margin: "auto",
  },
}));
