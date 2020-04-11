import React, { Component } from 'react'

export default class SenRec extends Component {
    render() {
        return (
            <div className="container">

<img    className="mb-4"
          alt="none"
            style={{ width: "35vw" }}
            src={require("./undraw_code_typing_7jnv.svg")}
          />

                <button className = "ui mt-5 orange button p-4 my-4 huge" onClick = {() => this.props.sendFile()}><i class="far fa-paper-plane mr-4"></i>  Send a File</button>
                <button className = "ui  yellow button p-4 huge"  onClick = {() => this.props.recFile()}><i class="fas fa-angle-double-down mr-4"></i> Recieve a File</button>


            </div>
        )
    }
}
