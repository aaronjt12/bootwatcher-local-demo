import React from "react";

const Banner = () => {
  return (
    <div style={styles.banner}>
      <h1 style={styles.text}>Bootwatcher</h1>
    </div>
  );
};

const styles = {
  banner: {
    backgroundColor: "orange",
    padding: "10px 0",
    textAlign: "center",
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 1000,
  },
  text: {
    color: "white",
    margin: 0,
    fontSize: "24px",
  },
};

export default Banner;
