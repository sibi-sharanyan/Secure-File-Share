const electron = require("electron");
const fs = require("fs");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const isDev = require("electron-is-dev");
const ipc = electron.ipcMain;
const readChunk = require("read-chunk");
const async = require("async");
let mainWindow;

const io = require("socket.io");
const server = io.listen(8000);
const md5File = require("md5-file");
const ngrok = require('ngrok');
const {shell} = require('electron')
const { getArrayOfRanges } = require("./utils");

//Global variable to determine encryption decision
let isEncrypt = false;


const crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

function encrypt(buffer , password ){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
  return crypted;
}
 
function decrypt(buffer , password){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
  return dec;
}






function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + "/preload.js"
    }
  });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  mainWindow.on("closed", () => (mainWindow = null));
  mainWindow.removeMenu();
  // mainWindow.webContents.openDevTools();
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipc.on("encryption-on" , (event) => {
  isEncrypt = true;
  console.log("Encryption turned on");
})

let serverId = null;

ipc.on("genTunnel" , (event) => {



  ngrok.connect(8000).then( ( url   ) => {
    serverId = url.split("//")[1].split('.')[0];
    event.sender.send("tunnelGenerated", serverId);
  }).catch((err) => {
    console.log(err);
  })


})

let globalItem = null;
let globalData = null;
let globalHash = null;
let globalEvent = null;
//Reciever end

ipc.on("openFile" , (event , fileName) => {
  console.log(fileName);
  console.log(__dirname);
  shell.showItemInFolder(path.join(__dirname, '..', '..' ,'..' , 'myfiles', fileName));

})

//Receiver Side
ipc.on("connectTunnel" , (event , tunnelID) => {

  if (!fs.existsSync('./myfiles')) {
    fs.mkdirSync('./myfiles');
  }

console.log("Reciever");
  const
    io = require("socket.io-client"),
    ioClient = io.connect(`https://${tunnelID}.ngrok.io`);

    event.sender.send("beginTransfer");
    

let totalLength = 0;
ioClient.on("file-send", (fileName , chunk , item , isEncrypted  , cb  ) => {
  if(isEncrypted) {
    chunk = decrypt(chunk , tunnelID);
  }
   totalLength += chunk.length;
    fs.appendFile(`./myfiles/${fileName}`, chunk , (err) => {
        if (err){
            console.log(err);
        }else {
          //Sending update to reciever side renderer process
          event.sender.send("progress-update", item.completePerc , fileName);
            // console.log(fileName , chunk , item ,cb );
            ioClient.emit("file-rec" , item , cb);
        }

      });
 
});

ioClient.on("transfer-completed" , (fileName , hash) => {
    md5File(`./myfiles/${fileName}`, (err, computedHash) => {
        if (err) throw err
       
        console.log(`The MD5 is: ${computedHash}`);

        if(computedHash === hash) {
            console.log("File Recieved Successfully");
        }else {
          throw new Error("The file was not received properly");
        }

      })
})

})

checkIfConnected =  (event , data) => {
  console.log("No client");
  console.log(event , data);
  event.sender.send("not-connected");

}

ipc.on("file-select" , checkIfConnected)


server.on("connection", socket => {


  console.info(`Client connected [id=${socket.id}]`);
  ipc.removeListener('file-select' , checkIfConnected);


  //Ack sent by the reciever to the sender
  socket.on("file-rec", (item, cb) => {
    // console.log(item.completePerc)
    globalItem = item;
  
    cb();
  });

  ipc.on("file-select", (event, data) => { 
     globalData = data;
     globalEvent = event;
  event.sender.send("connected");
      

    let fileName = data.filePath.split("\\")[
      data.filePath.split("\\").length - 1
    ];

    console.log(fileName);

    let chunkArray = getArrayOfRanges(0, data.size, 1000000);

    async.parallel(
      [
        cb1 => {
          async.eachOfSeries(
            chunkArray,
            (item, index, cb) => {
              readChunk(data.filePath, item.start, item.length)
                .then(chunk => {
  
                  if(isEncrypt) {
                    chunk = encrypt(chunk , serverId);
                  } 

                 console.log(cb);
                  socket.emit("file-send", fileName, chunk, item, isEncrypt  , cb );
                  //Sending update to Sender side renderer process
                  event.sender.send("progress-update", item.completePerc , data.filePath , fileName);
                })
                .catch(err => {
                  console.log(err);
                  cb(err);
                });
            },
            err => {
              if (err) {
                console.log(err);
                cb1(err);
              } else {
                console.log("done");
                cb1(null, "done");
              }
            }
          );
        },

        cb2 => {
          md5File(data.filePath, (err, hash) => {
            if (err) {
              console.log(err);
              cb2(err);
            } else {
              console.log(`The MD5 sum is: ${hash}`);
              globalHash = hash;
              cb2(null, hash);
            }
          });
        }
      ],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          socket.emit("transfer-completed", fileName, results[1]);

          console.log(results);
        }
      }
    );
  });


  if(globalData) {


    // event.sender.send("connected");

    let chunkArray = getArrayOfRanges(0, globalData.size, 1000000);
   
      let tempArray = [];
      chunkArray.forEach((item , ind) => {
        if(item.start === globalItem.start) {
          console.log(ind);
         chunkArray =  chunkArray.slice(ind+1);
         console.log(chunkArray[0]);
        }
      })
    
      let fileName = globalData.filePath.split("\\")[
        globalData.filePath.split("\\").length - 1
      ];


    async.parallel(
      [
        cb1 => {
          async.eachOfSeries(
            chunkArray,
            (item, index, cb) => {
              readChunk(globalData.filePath, item.start, item.length)
                .then(data => {
                  // console.log(data.length);

                  if(isEncrypt) {
                    data = encrypt(data , serverId);
                  } 

                  socket.emit("file-send", fileName, data, item, isEncrypt , cb);

                  globalEvent.sender.send("progress-update", item.completePerc , globalData.filePath , fileName);
                })
                .catch(err => {
                  console.log(err);
                  cb(err);
                });
            },
            err => {
              if (err) {
                console.log(err);
                cb1(err);
              } else {
                console.log("done");
                cb1(null, "done");
              }
            }
          );
        },

        cb2 => {
          if(globalHash) {
            cb2(null , globalHash);
          }else {
            md5File(globalData.filePath, (err, hash) => {
              if (err) {
                console.log(err);
                cb2(err);
              } else {
                console.log(`The MD5 sum is: ${hash}`);
              globalHash = hash;
                cb2(null, hash);
              }
            });
          }

        }
      ],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          socket.emit("transfer-completed", fileName, results[1]);

          console.log(results);
        }
      }
    );
  }










  

  socket.on("disconnect", () => {
    // throw new Error('Connection lost. Please restart the application');
    socket.removeAllListeners("file-rec");

    console.info(`Client gone [id=${socket.id}]`);
    console.log(globalItem);
  });
});
