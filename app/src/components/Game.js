import React from 'react';
var Xmove = require('react-icons/lib/md/close');
var Omove = require('react-icons/lib/md/panorama-fish-eye');
var BackArrow = require('react-icons/lib/md/arrow-back');
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {RaisedButton} from 'material-ui';
import {IconButton} from 'material-ui';
import {Paper} from 'material-ui';
import {Dialog} from 'material-ui';
import {Subheader} from 'material-ui';
import {CustomDialog} from './CustomDialog';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';

export class Game extends React.Component {
constructor(props) {
	super(props);
	this.state = {
		grid: [" ", " ", " ", " ", " ", " ", " ", " ", " "],
		moveEvent: "move",
		winner: false,
		winnerText: ""
		};
	this.move = this.move.bind(this);
	this.restart = this.restart.bind(this);
}

componentDidMount() {
	$.get("/getActiveGame", function(data){
		this.setState({
			grid: data.Grid,
		}); 
    }.bind(this));
}

restart(){
	$.get("/ttt/restart", function(data) {
		this.setState({
			grid: data.Grid,
		}); 
	}.bind(this));
}

move(index){
	this.setState({
        moveEvent: ""
    }); 
		$.post({
			url: "/ttt/play",
			type: "POST",
			data: JSON.stringify({
				move: index
			}),
			dataType: "text",
			contentType: "application/json; charset=utf-8",
			success: function(data) {
				var response = JSON.parse(data);
				//                setTimeout(function() {
				//            }, 1000);
				console.log(response);
				this.setState({
					grid: response.grid,
				}); 
				if (response.winner === "X") {
					setTimeout(function() {
						this.setState({
							winner: true,
							winnerText: "You Won!"
						}); 
					}.bind(this), 700);
				} else if (response.winner === "O") {
					setTimeout(function() {
						this.setState({
							winner: true,
							winnerText: "You Lost!"
						}); 
					}.bind(this), 700);
				} else if (response.winner === " ") {
					setTimeout(function() {
						this.setState({
							winner: true,
							winnerText: "Draw!"
						});  
					}.bind(this), 700);
				} else {
					this.setState({
						moveEvent: "move"
					}); 
				}
			}.bind(this)
		});	
}
render() {
	return (
		<div><div style={{marginBottom:"60px"}}><MuiThemeProvider>
		<AppBar style={{backgroundColor: "#E57373"}}
		iconElementLeft={<span></span>}
		title={<span style={{fontSize: "20px"}}>TIC TAC TOE</span>}
		iconElementRight={<FlatButton onClick={function(){
			window.location.href= "/logout"
		}} style={{verticalAlign: "middle"}} label="Sign Out" />}/>
		</MuiThemeProvider></div>
            <div className="game-style" >
            <MuiThemeProvider><Paper zDepth={1} circle={false} style={{height:"500px", width:"600px", backgroundColor:"#73FCD6"}}>
            <div className="grid-container">
              <div className="grid-item" onClick={(this.state.moveEvent == "move")?()=>this.move(0):()=>""}>
                <Xmove height={100} width={100} color="#EF5350" style={{position:'absolute', display:(this.state.grid[0]=="X")?"unset":"none"}}/>
                <Omove height={90} width={90} color="#EF5350" style={{position:'absolute', padding:'4px 0 0 4px', display:(this.state.grid[0]=="O")?"unset":"none"}}/>
              </div>
              <div className="grid-item" onClick={(this.state.moveEvent == "move")?()=>this.move(1):()=>""}>
			  <Xmove height={100} width={100} color="#EF5350" style={{position:'absolute', display:(this.state.grid[1]=="X")?"unset":"none"}}/>
			  <Omove height={90} width={90} color="#EF5350" style={{position:'absolute', padding:'4px 0 0 4px', display:(this.state.grid[1]=="O")?"unset":"none"}}/>
              </div>
              <div className="grid-item" onClick={(this.state.moveEvent == "move")?()=>this.move(2):()=>""}>
			  <Xmove height={100} width={100} color="#EF5350" style={{position:'absolute', display:(this.state.grid[2]=="X")?"unset":"none"}}/>
			  <Omove height={90} width={90} color="#EF5350" style={{position:'absolute', padding:'4px 0 0 4px', display:(this.state.grid[2]=="O")?"unset":"none"}}/>
              </div>
              <div className="grid-item" onClick={(this.state.moveEvent == "move")?()=>this.move(3):()=>""}>
			  <Xmove height={100} width={100} color="#EF5350" style={{position:'absolute', display:(this.state.grid[3]=="X")?"unset":"none"}}/>
			  <Omove height={90} width={90} color="#EF5350" style={{position:'absolute', padding:'4px 0 0 4px', display:(this.state.grid[3]=="O")?"unset":"none"}}/>
              </div>
              <div className="grid-item" onClick={(this.state.moveEvent == "move")?()=>this.move(4):()=>""}>
			  <Xmove height={100} width={100} color="#EF5350" style={{position:'absolute', display:(this.state.grid[4]=="X")?"unset":"none"}}/>
			  <Omove height={90} width={90} color="#EF5350" style={{position:'absolute', padding:'4px 0 0 4px', display:(this.state.grid[4]=="O")?"unset":"none"}}/>
              </div>
              <div className="grid-item" onClick={(this.state.moveEvent == "move")?()=>this.move(5):()=>""}>
			  <Xmove height={100} width={100} color="#EF5350" style={{position:'absolute', display:(this.state.grid[5]=="X")?"unset":"none"}}/>
			  <Omove height={90} width={90} color="#EF5350" style={{position:'absolute', padding:'4px 0 0 4px', display:(this.state.grid[5]=="O")?"unset":"none"}}/>
              </div>
              <div className="grid-item" onClick={(this.state.moveEvent == "move")?()=>this.move(6):()=>""}>
			  <Xmove height={100} width={100} color="#EF5350" style={{position:'absolute', display:(this.state.grid[6]=="X")?"unset":"none"}}/>
			  <Omove height={90} width={90} color="#EF5350" style={{position:'absolute', padding:'4px 0 0 4px', display:(this.state.grid[6]=="O")?"unset":"none"}}/>
              </div>
              <div className="grid-item" onClick={(this.state.moveEvent == "move")?()=>this.move(7):()=>""}>
			  <Xmove height={100} width={100} color="#EF5350" style={{position:'absolute', display:(this.state.grid[7]=="X")?"unset":"none"}}/>
			  <Omove height={90} width={90} color="#EF5350" style={{position:'absolute', padding:'4px 0 0 4px', display:(this.state.grid[7]=="O")?"unset":"none"}}/>
              </div>
              <div className="grid-item" onClick={(this.state.moveEvent == "move")?()=>this.move(8):()=>""}>
			  <Xmove height={100} width={100} color="#EF5350" style={{position:'absolute', display:(this.state.grid[8]=="X")?"unset":"none"}}/>
			  <Omove height={90} width={90} color="#EF5350" style={{position:'absolute', padding:'4px 0 0 4px', display:(this.state.grid[8]=="O")?"unset":"none"}}/>
              </div>
            </div>
            <div className="restart-button"><MuiThemeProvider>
            <RaisedButton onClick={this.restart} label="RESTART GAME" backgroundColor="#fff" labelStyle={{color:"#73FCD6"}}/>
            </MuiThemeProvider></div>
        <CustomDialog show={this.state.winner} text={this.state.winnerText} restart={()=>this.setState({grid: [" ", " ", " ", " ", " ", " ", " ", " ", " "], moveEvent: "move", winner:false, winnerState: ""})} />
            </Paper></MuiThemeProvider>
			</div>
			</div>
        )//return
	}
} 
const Icon = (props) => (
<BackArrow size={30} color="#73FCD6"/>
)
