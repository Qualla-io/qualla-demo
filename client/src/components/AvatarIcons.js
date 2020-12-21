import React from "react";

import MusicNoteIcon from "@material-ui/icons/MusicNote";
import BrushIcon from "@material-ui/icons/Brush";
import VideogameAssetIcon from "@material-ui/icons/VideogameAsset";
import NewReleasesIcon from "@material-ui/icons/NewReleases";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import BuildIcon from "@material-ui/icons/Build";
import ColorLensIcon from "@material-ui/icons/ColorLens";

export default function AvatarIcons(props) {
  const icons = [
    <MusicNoteIcon className={props.customProps} />,
    <BrushIcon className={props.customProps} />,
    <VideogameAssetIcon className={props.customProps} />,
    <NewReleasesIcon className={props.customProps} />,
    <AttachMoneyIcon className={props.customProps} />,
    <BuildIcon className={props.customProps} />,
    <ColorLensIcon className={props.customProps} />,
  ];
  return <>{icons[props.i]}</>;
}

export const iconsLength = 6; // icons.length-1
