import React from "react";
import { FontAwesomeIcon as FAI } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";
export const Player = (props) => {
  return (
    <div
      style={{
        width: 300,
        textAlign: "center",
        borderRadius: 10,
        padding: 30,
      }}
    >
      <div
        style={{
          height: 300,
          width: 300,
          overflow: "hidden",
        }}
      >
        <img src={props.coverArtURL} alt={`Cover art for ${props.album}`} />
      </div>
      <div style={{ paddingBottom: 10 }}>
        <h3>{props.title}</h3>
        {props.artists.map((item) => item.name).join(", ")} <br />
        {props.album}
      </div>
      <div>
        {secondsToTimeFormat(props.position)}
        <input
          style={{ width: "70%" }}
          type="range"
          name="position"
          id="position"
          value={props.position}
          min={0}
          max={props.duration}
          readOnly
        />
        {secondsToTimeFormat(props.duration)}
      </div>
      <div>
        <FAI icon={faVolumeMute} />
        <input
          type="range"
          name="volume"
          id="volume"
          value={props.volume}
          onChange={props.changeVolume}
          min={0}
          max={1}
          step={0.01}
        />
        <FAI icon={faVolumeUp} />
      </div>
      {!props.dontShow && (
        <div style={{ cursor: "pointer" }} onClick={() => props.togglePlay()}>
          {props.playing ? <FAI icon={faPause} /> : <FAI icon={faPlay} />}
        </div>
      )}
    </div>
  );
};
function secondsToTimeFormat(duration) {
  // Hours, minutes and seconds
  var hrs = ~~(duration / 3600);
  var mins = ~~((duration % 3600) / 60);
  var secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}