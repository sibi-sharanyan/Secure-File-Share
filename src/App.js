import "./App.css";
import React, { Component } from "react";
import SelectFile from "./SelectFile";
import Loading from "./Loading";
import LoadingRec from "./LoadingRec";
import SenRec from "./SenRec";
import RecieveFile from "./RecieveFile";
export default class App extends Component {
  state = {
    currentRoute: "select"
  };

  changeRoute = () => {
    this.setState({ currentRoute: "senloading" });
  };

  sendFile = (isChecked) => {
    if(isChecked) {
      window.ipcRenderer.send("encryption-on" );

    }
    this.setState({ currentRoute: "sendfile" });
  };

  recFile = () => {
    this.setState({ currentRoute: "recfile" });
  };

  goBack = () => {
    this.setState({currentRoute: "select"})
  }


  recieveFileLoading = () => {
    this.setState({currentRoute: "recloading"})
  }

  render() {
    if (this.state.currentRoute === "select") {
      return (
        <div>
          <SenRec sendFile={this.sendFile}  recFile={this.recFile} />
        </div>
      );
    } else if (this.state.currentRoute === "senloading") {
      return (
        <div>
          <Loading />
        </div>
      );
    } else if(this.state.currentRoute === "recloading") {
      return (
        <div>
          <LoadingRec />
        </div>
      );
    }
    else if (this.state.currentRoute === "sendfile") {
      return (
        <div>
          <SelectFile goBack = {this.goBack}  changeRoute={this.changeRoute} />
        </div>
      );
    } else if (this.state.currentRoute === "recfile") {
      return (
        <RecieveFile goBack = {this.goBack} recieveFileLoading={this.recieveFileLoading} />

      );
    }
  }
}
