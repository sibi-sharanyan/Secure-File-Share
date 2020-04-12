import React, { Component } from "react";
import { Progress } from "semantic-ui-react";
import { differenceInMilliseconds } from "date-fns";
import moment from "moment";
import quotes from "./quotes";
export default class Loading extends Component {
  getRandomQuote = () => {
    return quotes.quotes[Math.floor(Math.random() * (quotes.quotes.length - 2)) + 1];
  };

  constructor() {
    super();
    setInterval(() => {
        this.setState({quote: this.getRandomQuote()});
    }  , 10000)
    this.state = {
      percent: 0,
      timeRemaining: "Calculating",
      lastRecordedTime: new Date(),
      quote: this.getRandomQuote(),
      filePath: '',
      fileName: ''
    };
    window.ipcRenderer.on("progress-update", (event, percent , filePath , fileName) => {
      this.setState({filePath , fileName});
      console.log(this.state.filePath , filePath , fileName) ;
      if (this.state.percent !== percent && percent !== 1) {
        let timeRemaininginMs = differenceInMilliseconds(
          new Date(),
          this.state.lastRecordedTime
        );
        let timeRemaining = timeRemaininginMs * (100 - percent);
        let unixFormat = +new Date() + timeRemaining;

        let timeRemainingStr = moment(unixFormat).fromNow(true);

        this.setState({
          percent,
          timeRemaining: timeRemainingStr,
          lastRecordedTime: new Date()
        });
      } else {
        this.setState({ percent });
      }
    });
  }




  render() {
    if (this.state.percent >= 100) {
      return (
        <div className="container-contact ">
          <img
          alt="none"
            style={{ width: "30vw" }}
            src={require("./undraw_completed_ngx6.svg")}
          />

<div className="d-flex justify-content-around w-50 mt-5"> 
             <i className="fab fa-linkedin fa-3x" style = {{cursor: "pointer"}} onClick = {() => window.shell.openExternal("https://www.linkedin.com/in/sibi-sharanyan")} ></i> 

           <i className="fab fa-github fa-3x" style = {{cursor: "pointer"}}  onClick = {() => window.shell.openExternal("https://github.com/sibi-sharanyan/") }  ></i> 

          <i className="fas fa-envelope fa-3x" style = {{cursor: "pointer"}} onClick = {() => window.shell.openExternal("mailto:webmaster@example.com")}    ></i> 

        </div>


        </div>

      );
    } else {
      return (
        <div className="container">
          <Progress className="w-100" percent={this.state.percent} indicating />
          <p className="lead">
            {" "}
            <strong> {this.state.percent}% </strong>{" "}
          </p>
         
            <p className="lead">
              {" "}
              <strong>  {this.state.timeRemaining !== "Calculating" ?  this.state.timeRemaining + " remaining"  :  "Connecting..." } </strong> {" "}
            </p>
        
      <p className="lead">{this.state.fileName}</p>
          <img
          alt="none"
            className="mt-5"
            style={{ width: "25vw" }}
            src={require("./undraw_transfer_files_6tns.svg")}
          />

          <div style = {{height: '10vh'}} class="blockquote mt-5 w-50">
                <div>
                {this.state.quote.quote}
                </div>
                <div className="mt-2"> 
              <strong> {this.state.quote.author} </strong>   

                </div>
          </div>
        </div>
      );
    }
  }
}
