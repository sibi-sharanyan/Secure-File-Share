import React, { Component } from 'react'


export default class RecieveFile extends Component {




    state = {
        otp: ''
    }

    sendTunnelId = () => {
        window.ipcRenderer.send("connectTunnel" , this.state.otp);
        window.ipcRenderer.on("beginTransfer" , (event) => {
            this.props.recieveFileLoading();
        } )
    }

    render() {
        return (
            <div className = "container">
                <p className="lead mb-3"> Ask for the <strong> key from the sender  </strong>  and enter it below to begin the process. </p>

          <img
          alt="none"
            style={{ width: "30vw" }}
            src={require("./undraw_authentication_fsn5.svg")}
          />

                <div className="ui input my-5">

                <input type="text" onChange = {(e) => this.setState({otp : e.target.value})}/>

                </div>
<button className = "ui primary button large" onClick = {() => this.sendTunnelId()}> Connect  </button>
            </div>
        )
    }
}
