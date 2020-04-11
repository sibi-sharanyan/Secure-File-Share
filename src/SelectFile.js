import React, { Component } from "react";
import Dropzone from "react-dropzone";
import ReactLoading from 'react-loading';

export default class SelectFile extends Component {
  constructor() {
    super();
    this.state = {
      files: [],
      tunnelID: ''
    };

    window.ipcRenderer.send("genTunnel");
    window.ipcRenderer.on("tunnelGenerated" , (event , tunnelID) => {
      this.setState({tunnelID})
    })
    window.ipcRenderer.on("connected" , (event ) => {
      this.props.changeRoute();
    })
    window.ipcRenderer.on("not-connected" , (event ) => {

      alert("The reciever has not yet connected. Please ask the reciever to connect with your code: " + this.state.tunnelID);

    })

  }

  onDrop = files => {
    this.setState({ files });
    console.log(files[0].path, files[0].size);

  };

  sendFile = () => {
    let filePath = this.state.files[0].path;
    let size = this.state.files[0].size;
    window.ipcRenderer.send("file-select", { filePath, size }); 
  }

  humanFileSize = (bytes, si) => {
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
      return bytes + " B";
    }
    var units = si
      ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
      : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    var u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + " " + units[u];
  };

  render() {

    if(this.state.tunnelID === '') {
      return (
          <div className="container">
              <div className = "display-4 mb-5">Generating Tunnel...</div>
                <ReactLoading className = "mt-4" type="spin" color="#32CD32" height={200} width={200} />

          </div>
      );
    }
    else if (this.state.files.length === 0) {
      return (
        <div className="container">
                        <p className="lead">Please share this code with the receiver</p>
                        <div className = "display-4" >{this.state.tunnelID}</div  >
                  {/* <button className="ui primary button mt-4 savebtn" onClick = {() => this.props.goBack()}>Go back</button> */}

          <Dropzone onDrop={this.onDrop}>
            {({ getRootProps, getInputProps }) => (
              <section className="container">
                <div  {...getRootProps({ className: "dropzone" })}>
                  <input {...getInputProps()} />
                  <i class="fas fa-upload fa-10x mb-4"></i>
                </div>
              </section>
            )}
          </Dropzone>
        </div>
      );
    } else {
      return (
        <div className="container">
          <i
            class="fas fa-file-alt fa-10x"
            onClick={() => this.setState({ files: [] })}
          ></i>

          <div className="filedesc-cont">
            <h4 className="">{this.state.files[0].name}</h4>
            <h4 className="mt-2">
              {this.humanFileSize(this.state.files[0].size, true)}
            </h4>
          </div>

          <button className="ui primary button mt-4 savebtn" onClick = {() => this.sendFile()}>Send</button>

          <div className = "display-4 mt-5" >{this.state.tunnelID}</div  >

        </div>
      );
    }
  }
}
