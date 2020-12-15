import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import "./css/main.css"; 
import firebase from 'firebase';
import timer from "./timer-vector.png"; 

const firebaseConfig = {
  apiKey: "AIzaSyAXzxJLvYUnGg_WxzNiH8wTCbf9CPitsDw",
  authDomain: "fastrewardtestapp.firebaseapp.com",
  databaseURL: "https://fastrewardtestapp-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fastrewardtestapp",
  storageBucket: "fastrewardtestapp.appspot.com",
  messagingSenderId: "511700646",
  appId: "1:511700646:web:51ec9329d017317677ce67",
  measurementId: "G-R587HC24M5"
};
// Initialize Firebase
let app = firebase.initializeApp(firebaseConfig);
let database = app.database(); 

function LoginRegisterMenu (){  
  let [renderValue,setRenderValue] = useState(<LogInMenu />);
  useEffect(()=>{
    app.auth().onAuthStateChanged(function(user){
      if(user){
        if(database.ref("/"+app.auth().currentUser.uid+"/")===null){
        database.ref("/"+app.auth().currentUser.uid+"/").set({
          desktopTime : 0,
          mobileTime : 0
        }) }
        setRenderValue(<Timers />)
      } else {
        setRenderValue(<LogInMenu />)
      }
    })
  })
  return(<div>{renderValue}</div>)
}

class LogInMenu extends React.Component{
  constructor(props){
    super(props);
    this.state ={
      email : '',
      password: ''
    }
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.logInUser = this.logInUser.bind(this);
  }
  handleEmailChange(event){
    this.setState({email:event.target.value})  
  }
  handlePasswordChange(event){
    this.setState({password:event.target.value})
  }
  renderRegisterMenu(){
    ReactDOM.render(
      <RegisterMenu/>,
      document.getElementById('root')
    )
  }
  logInUser(){
    app.auth().signInWithEmailAndPassword(this.state.email,this.state.password).catch(function(error){
      if(error!==null){
        console.log(error.message);
      }       
    })
    .then(function(){
      ReactDOM.render(<LoginRegisterMenu />,document.getElementById('root'))
    })
  }
  render(){
  return(<div className="userMenu">
    <h4>Login</h4>
    <input type="text" placeholder="Email" value={this.state.email} onChange={this.handleEmailChange} />
    <input type="password" placeholder="Password" value={this.state.password} onChange={this.handlePasswordChange} />
    <br/><button onClick={this.logInUser}>Login</button>
    <p>Don`t have any account yet. <strong onClick={this.renderRegisterMenu}>Register</strong></p>
  </div>)}
}



class RegisterMenu extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      email: '',
      password: ''
    }
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.createNewUser = this.createNewUser.bind(this);
  }
  handleEmailChange(event){
    this.setState({email:event.target.value});   
  }
  handlePasswordChange(event){
    this.setState({password:event.target.value})
  }
  renderLogInMenu(){
    ReactDOM.render(
      <LogInMenu />,
      document.getElementById('root')
    )
  }
  createNewUser(){
    app.auth().createUserWithEmailAndPassword(this.state.email,this.state.password).catch(function(error){
        console.log(error.message)       
    });
    app.auth().signInWithEmailAndPassword(this.state.email,this.state.password);     
    ReactDOM.render(<LoginRegisterMenu />,document.getElementById('root'))
    
  }
  render() {
    return(
    <div  class="userMenu">
      <h4>Register</h4>
      <input type="text" placeholder="First Name" />
      <input type="text" placeholder="Last Name" />
      <input type="text" placeholder="Email" value={this.state.email} onChange={this.handleEmailChange}/>
      <input type="password" placeholder="Password" value={this.state.password} onChange={this.handlePasswordChange}/> 
      <button onClick={this.createNewUser}>Sign Up</button>
      <p>Already registerd? <strong onClick={this.renderLogInMenu}>Log In</strong></p>
    </div>)
  }
}


class Timers extends React.Component {
  constructor(props){
    super(props); 
    this.state = {
      desktopLocal: 0, 
      mobileLocal : 0,
      windowWidth : window.innerWidth
    }
  }
  
  componentDidMount(){  
    let data = database.ref("/"+app.auth().currentUser.uid+"/");
    data.once('value',function(response){
      if(response.val().desktopTime!==0||response.val().mobileTime!==0){
      this.setState({desktopLocal: this.state.desktopLocal+response.val().desktopTime,
      mobileLocal: this.state.mobileLocal+response.val().mobileTime})}
    }.bind(this))


    if(this.state.windowWidth<=600){
      clearInterval();
      setInterval(()=>{            
        this.setState({mobileLocal: this.state.mobileLocal+1});
        database.ref("/"+app.auth().currentUser.uid+"/").update({
          mobileTime: this.state.mobileLocal
        })
      },1000)
    } else {
      clearInterval();
      setInterval(()=>{
        this.setState({desktopLocal: this.state.desktopLocal+1});
        database.ref("/"+app.auth().currentUser.uid+"/").update({
          desktopTime: this.state.desktopLocal
        })
      },1000)
    }
  }

  generateNormalTimerView(time){
    let minutes = Math.floor(time/60); 
    let seconds = time-(minutes*60)
    let hours = Math.floor(time/3600)
    return(<h2>{hours+":"+minutes+":"+seconds}</h2>)
  }

  render(){
    return(<div class="timers">
      <div class="timers--box">
      <h2>Desktop</h2>
      <img src={timer} />
      {this.generateNormalTimerView(this.state.desktopLocal)}
      </div>
      <div class="timers--box">
      <h2>Mobile</h2>
      <img src={timer} />
      {this.generateNormalTimerView(this.state.mobileLocal)}
      </div>
    </div>)
  }
}


ReactDOM.render(
  <React.StrictMode>
  <LoginRegisterMenu />
  </React.StrictMode>,
  document.getElementById('root')
);




