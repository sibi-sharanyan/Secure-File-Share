import React, { Component } from 'react'
import Switch from "react-switch";

export default class SenRec extends Component {

    state = {
        checked: true
    }


    handleChange = (checked) => {
        this.setState({ checked });
      }
     

    render() {
        return (
            <div className="container">

<img    className="mb-4"
          alt="none"
            style={{ width: "35vw" }}
            src={require("./undraw_code_typing_7jnv.svg")}
          />
            
            <div className="d-flex mt-5">
            <Switch className = ""  onChange={this.handleChange} checked={this.state.checked} />
        <p className="lead ml-4 text-uppercase">    {this.state.checked ? "Encryption On"  : "Encryption Off"} <i className={this.state.checked ? "ml-3 fas fa-lock"  : "ml-3 fas fa-lock-open"} ></i> </p>
            </div>


                <button className = "ui mt-5 orange button p-4 my-4 huge" onClick = {() => this.props.sendFile(this.state.checked)}><i class="far fa-paper-plane mr-4"></i>  Send a File</button>

                <button className = "ui  yellow button p-4 huge"  onClick = {() => this.props.recFile()}><i class="fas fa-angle-double-down mr-4"></i> Recieve a File</button>






            </div>
        )
    }
}
